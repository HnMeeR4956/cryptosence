// Deployment smoke check: write only our temporary object, reconnect, read, remove it.
require("dotenv").config();
const mongoose = require("mongoose");
const assert = require("node:assert/strict");
const storage = require("../utils/mediaStorage");
async function run() {
  let fileUrl;
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const bytes = Buffer.from("CryptoSense GridFS deployment check");
    fileUrl = await storage.save({ buffer: bytes, mimetype: "application/pdf", originalname: "deployment-check.pdf" });
    await mongoose.disconnect();
    await mongoose.connect(process.env.MONGO_URI);
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: "marketingUploads" });
    const file = await bucket.find({ filename: fileUrl.slice("/uploads/".length) }).next();
    assert.ok(file);
    const chunks = [];
    for await (const chunk of bucket.openDownloadStream(file._id)) chunks.push(chunk);
    assert.deepEqual(Buffer.concat(chunks), bytes);
    await storage.remove(fileUrl);
    fileUrl = null;
    console.log("GridFS smoke check passed: upload, reconnect, read and delete.");
  } finally {
    if (fileUrl && mongoose.connection.readyState === 1) await storage.remove(fileUrl).catch(() => {});
    await mongoose.disconnect();
  }
}
run().catch(() => {
  console.error("GridFS smoke check failed. Check MongoDB connectivity, storage allowance and write permissions.");
  process.exitCode = 1;
});
