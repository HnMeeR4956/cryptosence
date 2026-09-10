const MarketingGrowth = require("../models/MarketingGrowth");

const createGrowthEntry = async (req, res) => {
  try {
    const {
      title,
      strategy,
      channel,
      date,
      impressions,
      clicks,
      signups,
      conversions,
      revenuePKR,
      status,
      notes,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const entry = await MarketingGrowth.create({
      title,
      strategy: strategy || null,
      channel,
      date: date || Date.now(),
      impressions: Number(impressions || 0),
      clicks: Number(clicks || 0),
      signups: Number(signups || 0),
      conversions: Number(conversions || 0),
      revenuePKR: Number(revenuePKR || 0),
      status,
      notes,
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Growth entry created successfully",
      entry,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getGrowthEntries = async (req, res) => {
  try {
    const entries = await MarketingGrowth.find()
      .populate("createdBy", "username email role")
      .populate("strategy", "title status")
      .sort({ createdAt: -1 });

    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getGrowthEntryById = async (req, res) => {
  try {
    const entry = await MarketingGrowth.findById(req.params.id)
      .populate("createdBy", "username email role")
      .populate("strategy", "title status");

    if (!entry) {
      return res.status(404).json({ message: "Growth entry not found" });
    }

    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateGrowthEntry = async (req, res) => {
  try {
    const entry = await MarketingGrowth.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: "Growth entry not found" });
    }

    entry.title = req.body.title ?? entry.title;
    entry.strategy = req.body.strategy ?? entry.strategy;
    entry.channel = req.body.channel ?? entry.channel;
    entry.date = req.body.date ?? entry.date;
    entry.impressions = req.body.impressions ?? entry.impressions;
    entry.clicks = req.body.clicks ?? entry.clicks;
    entry.signups = req.body.signups ?? entry.signups;
    entry.conversions = req.body.conversions ?? entry.conversions;
    entry.revenuePKR = req.body.revenuePKR ?? entry.revenuePKR;
    entry.status = req.body.status ?? entry.status;
    entry.notes = req.body.notes ?? entry.notes;

    await entry.save();

    res.json({
      message: "Growth entry updated successfully",
      entry,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteGrowthEntry = async (req, res) => {
  try {
    const entry = await MarketingGrowth.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: "Growth entry not found" });
    }

    await entry.deleteOne();

    res.json({ message: "Growth entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getGrowthSummary = async (req, res) => {
  try {
    const entries = await MarketingGrowth.find();

    const summary = entries.reduce(
      (acc, item) => {
        acc.totalCampaigns += 1;
        acc.impressions += Number(item.impressions || 0);
        acc.clicks += Number(item.clicks || 0);
        acc.signups += Number(item.signups || 0);
        acc.conversions += Number(item.conversions || 0);
        acc.revenuePKR += Number(item.revenuePKR || 0);

        if (item.status === "Planned") acc.planned += 1;
        if (item.status === "Running") acc.running += 1;
        if (item.status === "Paused") acc.paused += 1;
        if (item.status === "Completed") acc.completed += 1;

        return acc;
      },
      {
        totalCampaigns: 0,
        impressions: 0,
        clicks: 0,
        signups: 0,
        conversions: 0,
        revenuePKR: 0,
        planned: 0,
        running: 0,
        paused: 0,
        completed: 0,
      }
    );

    summary.clickThroughRate =
      summary.impressions > 0
        ? ((summary.clicks / summary.impressions) * 100).toFixed(1)
        : "0.0";

    summary.conversionRate =
      summary.clicks > 0
        ? ((summary.conversions / summary.clicks) * 100).toFixed(1)
        : "0.0";

    summary.signupRate =
      summary.clicks > 0
        ? ((summary.signups / summary.clicks) * 100).toFixed(1)
        : "0.0";

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createGrowthEntry,
  getGrowthEntries,
  getGrowthEntryById,
  updateGrowthEntry,
  deleteGrowthEntry,
  getGrowthSummary,
};