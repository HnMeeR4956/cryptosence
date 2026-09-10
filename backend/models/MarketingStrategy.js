const mongoose = require("mongoose");

const marketingStrategySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    targetAudience: {
      type: String,
      required: true,
    },
    budget: {
      type: Number,
      default: 1000,
    },
    status: {
      type: String,
      enum: ["Planned", "Active", "Completed"],
      default: "Planned",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MarketingStrategy", marketingStrategySchema);