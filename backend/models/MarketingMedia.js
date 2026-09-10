const mongoose = require("mongoose");

const marketingMediaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    strategy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MarketingStrategy",
      default: null,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    mediaType: {
      type: String,
      enum: ["Image", "Video", "Document", "Link"],
      default: "Image",
    },
    fileName: {
      type: String,
      default: "",
    },
    fileUrl: {
      type: String,
      default: "",
    },
    externalLink: {
      type: String,
      default: "",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ["Draft", "Published", "Archived"],
      default: "Draft",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MarketingMedia", marketingMediaSchema);