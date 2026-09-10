const mongoose = require("mongoose");

const marketingGrowthSchema = new mongoose.Schema(
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
    channel: {
      type: String,
      enum: ["Referral", "Social Media", "SEO", "Email", "Influencer", "Ads", "Other"],
      default: "Referral",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    impressions: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    signups: {
      type: Number,
      default: 0,
    },
    conversions: {
      type: Number,
      default: 0,
    },
    revenuePKR: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Planned", "Running", "Paused", "Completed"],
      default: "Running",
    },
    notes: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MarketingGrowth", marketingGrowthSchema);