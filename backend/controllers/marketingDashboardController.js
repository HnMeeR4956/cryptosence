const MarketingStrategy = require("../models/MarketingStrategy");
const MarketingGrowth = require("../models/MarketingGrowth");
const MarketingMedia = require("../models/MarketingMedia");

const getMarketingDashboard = async (req, res) => {
  try {
    const [
      totalStrategies,
      plannedStrategies,
      activeStrategies,
      completedStrategies,
      totalGrowthEntries,
      totalMediaItems,
      mediaPublished,
      totalSignups,
      totalConversions,
      totalRevenue,
      recentStrategies,
      recentGrowth,
      recentMedia,
    ] = await Promise.all([
      MarketingStrategy.countDocuments({}),
      MarketingStrategy.countDocuments({ status: "Planned" }),
      MarketingStrategy.countDocuments({ status: "Active" }),
      MarketingStrategy.countDocuments({ status: "Completed" }),
      MarketingGrowth.countDocuments({}),
      MarketingMedia.countDocuments({}),
      MarketingMedia.countDocuments({ status: "Published" }),
      MarketingGrowth.aggregate([
        { $group: { _id: null, sum: { $sum: "$signups" } } },
      ]),
      MarketingGrowth.aggregate([
        { $group: { _id: null, sum: { $sum: "$conversions" } } },
      ]),
      MarketingGrowth.aggregate([
        { $group: { _id: null, sum: { $sum: "$revenuePKR" } } },
      ]),
      MarketingStrategy.find()
        .sort({ createdAt: -1 })
        .limit(5),
      MarketingGrowth.find()
        .sort({ createdAt: -1 })
        .limit(5),
      MarketingMedia.find()
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    res.json({
      stats: {
        totalStrategies,
        plannedStrategies,
        activeStrategies,
        completedStrategies,
        totalGrowthEntries,
        totalMediaItems,
        mediaPublished,
        totalSignups: totalSignups[0]?.sum || 0,
        totalConversions: totalConversions[0]?.sum || 0,
        totalRevenue: totalRevenue[0]?.sum || 0,
      },
      recentStrategies,
      recentGrowth,
      recentMedia,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMarketingDashboard,
};