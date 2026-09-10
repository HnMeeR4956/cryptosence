const MarketingStrategy = require("../models/MarketingStrategy");
const MarketingGrowth = require("../models/MarketingGrowth");
const MarketingMedia = require("../models/MarketingMedia");


// Create Strategy
const createStrategy = async (req, res) => {
  try {
    const {
      title,
      description,
      targetAudience,
      budget,
      status,
    } = req.body;

    const strategy = await MarketingStrategy.create({
      title,
      description,
      targetAudience,
      budget,
      status,
      createdBy: req.user._id,
    });

    res.status(201).json(strategy);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// Get All Strategies
const getStrategies = async (req, res) => {
  try {
    const strategies = await MarketingStrategy.find()
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 });

    res.json(strategies);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// Get Single Strategy
const getStrategyById = async (req, res) => {
  try {
    const strategy = await MarketingStrategy.findById(
      req.params.id
    );

    if (!strategy) {
      return res.status(404).json({
        message: "Strategy not found",
      });
    }

    res.json(strategy);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// Update Strategy
const updateStrategy = async (req, res) => {
  try {
    const strategy = await MarketingStrategy.findById(
      req.params.id
    );

    if (!strategy) {
      return res.status(404).json({
        message: "Strategy not found",
      });
    }

    strategy.title =
      req.body.title || strategy.title;

    strategy.description =
      req.body.description || strategy.description;

    strategy.targetAudience =
      req.body.targetAudience ||
      strategy.targetAudience;

    strategy.budget =
      req.body.budget || strategy.budget;

    strategy.status =
      req.body.status || strategy.status;

    await strategy.save();

    res.json(strategy);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// Delete Strategy
const deleteStrategy = async (req, res) => {
  try {
    const strategy = await MarketingStrategy.findById(
      req.params.id
    );

    if (!strategy) {
      return res.status(404).json({
        message: "Strategy not found",
      });
    }

    await strategy.deleteOne();

    res.json({
      message: "Strategy deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Strategy Performance (aggregated from linked Growth entries + Media count)
const getStrategyPerformance = async (req, res) => {
  try {
    const strategy = await MarketingStrategy.findById(req.params.id);

    if (!strategy) {
      return res.status(404).json({
        message: "Strategy not found",
      });
    }

    const linkedGrowth = await MarketingGrowth.find({
      strategy: strategy._id,
    });

    const linkedMediaCount = await MarketingMedia.countDocuments({
      strategy: strategy._id,
    });

    const totals = linkedGrowth.reduce(
      (acc, item) => {
        acc.impressions += Number(item.impressions || 0);
        acc.clicks += Number(item.clicks || 0);
        acc.signups += Number(item.signups || 0);
        acc.conversions += Number(item.conversions || 0);
        acc.revenuePKR += Number(item.revenuePKR || 0);
        return acc;
      },
      { impressions: 0, clicks: 0, signups: 0, conversions: 0, revenuePKR: 0 }
    );

    const conversionRate =
      totals.clicks > 0
        ? Number(((totals.conversions / totals.clicks) * 100).toFixed(1))
        : 0;

    res.json({
      strategy,
      linkedGrowthCount: linkedGrowth.length,
      linkedMediaCount,
      totals,
      conversionRate,
      linkedGrowthEntries: linkedGrowth,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createStrategy,
  getStrategies,
  getStrategyById,
  updateStrategy,
  deleteStrategy,
  getStrategyPerformance,
};