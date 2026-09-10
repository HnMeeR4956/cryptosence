const fs = require("fs");
const path = require("path");
const MarketingMedia = require("../models/MarketingMedia");

const createMediaItem = async (req, res) => {
  try {
    const {
      title,
      strategy,
      description,
      mediaType,
      externalLink,
      tags,
      status,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const parsedTags =
      typeof tags === "string"
        ? tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : Array.isArray(tags)
        ? tags
        : [];

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : "";

    if (mediaType !== "Link" && !req.file && !externalLink) {
      return res.status(400).json({
        message: "Please upload a file or provide an external link",
      });
    }

    const item = await MarketingMedia.create({
      title: title.trim(),
      strategy: strategy || null,
      description: description || "",
      mediaType: mediaType || "Image",
      fileName: req.file ? req.file.originalname : "",
      fileUrl,
      externalLink: externalLink || "",
      tags: parsedTags,
      status: status || "Draft",
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Media uploaded successfully",
      item,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMediaItems = async (req, res) => {
  try {
    const items = await MarketingMedia.find()
      .populate("createdBy", "username email role")
      .populate("strategy", "title status")
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMediaItemById = async (req, res) => {
  try {
    const item = await MarketingMedia.findById(req.params.id)
      .populate("createdBy", "username email role")
      .populate("strategy", "title status");

    if (!item) {
      return res.status(404).json({ message: "Media item not found" });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMediaItem = async (req, res) => {
  try {
    const item = await MarketingMedia.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Media item not found" });
    }

    if (item.fileUrl) {
      const fullPath = path.join(__dirname, "..", item.fileUrl);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    await item.deleteOne();

    res.json({ message: "Media item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createMediaItem,
  getMediaItems,
  getMediaItemById,
  deleteMediaItem,
};