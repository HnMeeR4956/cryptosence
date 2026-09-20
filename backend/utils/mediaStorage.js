const mongoose = require("mongoose");
const { randomUUID } = require("node:crypto");
const { Readable } = require("node:stream");
const { pipeline } = require("node:stream/promises");

const extensions = {
  "image/jpeg": ".jpg", "image/jpg": ".jpg", "image/png": ".png",
  "image/webp": ".webp", "video/mp4": ".mp4", "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
};
const validName = /^gridfs-[a-f0-9-]{36}\.(jpg|png|webp|mp4|pdf|doc|docx)$/;

function parseRange(header, size) {
  if (!header) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!match || (!match[1] && !match[2]) || size === 0) return false;
  let start, end;
  if (!match[1]) {
    const suffix = Number(match[2]);
    if (!Number.isSafeInteger(suffix) || suffix <= 0) return false;
    start = Math.max(0, size - suffix); end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Number(match[2]) : size - 1;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= size || end < start) return false;
    end = Math.min(end, size - 1);
  }
  return { start, end };
}

function createMediaStorage(getBucket) {
  async function save(file) {
    if (!extensions[file.mimetype]) throw new Error("Unsupported media type");
    const bucket = getBucket();
    const filename = "gridfs-" + randomUUID() + extensions[file.mimetype];
    const upload = bucket.openUploadStream(filename, {
      metadata: { contentType: file.mimetype, originalName: file.originalname },
    });
    try {
      await pipeline(Readable.from([file.buffer]), upload);
      return "/uploads/" + filename;
    } catch (error) {
      await bucket.delete(upload.id).catch(() => {});
      throw error;
    }
  }

  async function remove(fileUrl) {
    const filename = fileUrl.replace(/^\/uploads\//, "");
    if (!validName.test(filename)) return;
    const bucket = getBucket();
    const file = await bucket.find({ filename }).next();
    if (file) await bucket.delete(file._id);
  }

  async function serve(req, res, next) {
    const filename = req.params.filename;
    if (!filename.startsWith("gridfs-")) return next();
    if (!validName.test(filename)) return res.status(404).json({ message: "File not found" });
    try {
      const bucket = getBucket();
      const file = await bucket.find({ filename }).next();
      if (!file) return res.status(404).json({ message: "File not found. Please upload it again." });
      const range = parseRange(req.headers.range, file.length);
      res.set("Accept-Ranges", "bytes");
      res.set("Cache-Control", "private, max-age=0, must-revalidate");
      res.set("X-Content-Type-Options", "nosniff");
      if (range === false) {
        res.set("Content-Range", "bytes */" + file.length);
        return res.status(416).end();
      }
      const contentType = file.metadata?.contentType || "application/octet-stream";
      res.set("Content-Type", contentType);
      if (!/^(image\/|video\/)/.test(contentType)) {
        res.set("Content-Disposition", 'attachment; filename="' + filename + '"');
      }
      res.set("Content-Length", String(range ? range.end - range.start + 1 : file.length));
      if (range) {
        res.status(206);
        res.set("Content-Range", "bytes " + range.start + "-" + range.end + "/" + file.length);
      }
      if (req.method === "HEAD" || file.length === 0) return res.end();
      const stream = bucket.openDownloadStream(file._id, range ? { start: range.start, end: range.end + 1 } : {});
      await pipeline(stream, res);
    } catch {
      if (!res.headersSent && !res.destroyed) {
        res.removeHeader("Content-Length");
        res.removeHeader("Content-Range");
        return res.status(503).json({ message: "File storage is temporarily unavailable. Please try again." });
      }
      if (!res.destroyed) res.destroy();
    }
  }
  return { save, remove, serve };
}

const storage = createMediaStorage(() => {
  if (mongoose.connection.readyState !== 1) throw new Error("Database is not ready");
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: "marketingUploads" });
});
module.exports = { ...storage, createMediaStorage, parseRange };
