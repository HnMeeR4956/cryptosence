const test = require("node:test");
const assert = require("node:assert/strict");
const { Writable, Readable } = require("node:stream");
const { once } = require("node:events");
const express = require("express");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const { createMediaStorage, parseRange } = require("../utils/mediaStorage");

function mockBucket() {
  const files = new Map();
  return {
    files,
    openUploadStream(filename, options) {
      const pieces = [];
      const stream = new Writable({
        write(chunk, encoding, cb) { pieces.push(Buffer.from(chunk)); cb(); },
        final(cb) {
          const data = Buffer.concat(pieces);
          files.set(filename, { _id: filename, filename, length: data.length, metadata: options.metadata, data });
          cb();
        },
      });
      stream.id = filename;
      return stream;
    },
    find({ filename }) { return { next: async () => files.get(filename) }; },
    async delete(id) { files.delete(id); },
    openDownloadStream(id, options) {
      const file = files.get(id);
      return Readable.from([file.data.subarray(options.start || 0, options.end ?? file.length)]);
    },
  };
}

test("range parsing supports video seeking, suffixes, and invalid ranges", () => {
  assert.deepEqual(parseRange("bytes=2-5", 10), { start: 2, end: 5 });
  assert.deepEqual(parseRange("bytes=7-", 10), { start: 7, end: 9 });
  assert.deepEqual(parseRange("bytes=-3", 10), { start: 7, end: 9 });
  assert.deepEqual(parseRange("bytes=0-999", 10), { start: 0, end: 9 });
  for (const range of ["bytes=10-", "bytes=5-2", "bytes=-0", "bytes=0-1,3-4", "bad"]) {
    assert.equal(parseRange(range, 10), false);
  }
  assert.equal(parseRange("bytes=0-", 0), false);
});

test("saved bytes survive a new storage instance; GET, HEAD, range, delete and missing-file responses", async () => {
  const bucket = mockBucket();
  const first = createMediaStorage(() => bucket);
  const url = await first.save({ buffer: Buffer.from("0123456789"), mimetype: "video/mp4", originalname: "clip.mp4" });
  assert.match(url, /^\/uploads\/gridfs-.*\.mp4$/);
  const storage = createMediaStorage(() => bucket);
  const app = express();
  app.get("/uploads/:filename", storage.serve);
  app.use((req, res) => res.status(404).json({ message: "Legacy file missing" }));
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = "http://127.0.0.1:" + server.address().port;
  try {
    let response = await fetch(base + url);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "video/mp4");
    assert.equal(await response.text(), "0123456789");
    response = await fetch(base + url, { method: "HEAD" });
    assert.equal(response.headers.get("content-length"), "10");
    assert.equal(await response.text(), "");
    response = await fetch(base + url, { headers: { Range: "bytes=2-5" } });
    assert.equal(response.status, 206);
    assert.equal(response.headers.get("content-range"), "bytes 2-5/10");
    assert.equal(await response.text(), "2345");
    response = await fetch(base + url, { headers: { Range: "bytes=-3" } });
    assert.equal(await response.text(), "789");
    response = await fetch(base + url, { headers: { Range: "bytes=30-" } });
    assert.equal(response.status, 416);
    assert.equal(response.headers.get("content-range"), "bytes */10");
    await storage.remove(url);
    assert.equal(bucket.files.size, 0);
    assert.equal((await fetch(base + url)).status, 404);
    assert.equal((await fetch(base + "/uploads/old.mp4")).status, 404);
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});

function loadController(storage, model) {
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../controllers/marketingMediaController.js"), "utf8"), {
    module, exports: module.exports,
    require(name) {
      if (name === "../utils/mediaStorage") return storage;
      if (name === "../models/MarketingMedia") return model;
      return require(name);
    },
  });
  return module.exports;
}
const response = () => ({ status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } });

test("invalid request does not upload and failed database save cleans up GridFS", async () => {
  const calls = [];
  const storage = { save: async () => { calls.push("save"); return "/uploads/gridfs-test.mp4"; }, remove: async url => calls.push(url) };
  const c = loadController(storage, { create: async () => { throw Error("database failure"); } });
  await c.createMediaItem({ body: { title: "" }, file: {}, user: { _id: "user" } }, response());
  assert.deepEqual(calls, []);
  const res = response();
  await c.createMediaItem({ body: { title: "Clip" }, file: {}, user: { _id: "user" } }, res);
  assert.deepEqual(calls, ["save", "/uploads/gridfs-test.mp4"]);
  assert.equal(res.code, 500);
  assert.equal(res.body.message.includes("database failure"), false);
});

test("media deletion removes the stored object before deleting its record", async () => {
  const calls = [];
  const item = { fileUrl: "/uploads/gridfs-test.mp4", deleteOne: async () => calls.push("record") };
  const c = loadController({ remove: async () => calls.push("file") }, { findById: async () => item });
  await c.deleteMediaItem({ params: { id: "media" } }, response());
  assert.deepEqual(calls, ["file", "record"]);
});
