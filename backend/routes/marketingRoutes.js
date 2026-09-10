const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  createStrategy,
  getStrategies,
  getStrategyById,
  updateStrategy,
  deleteStrategy,
  getStrategyPerformance,
} = require("../controllers/marketingController");

const {
  createGrowthEntry,
  getGrowthEntries,
  getGrowthEntryById,
  updateGrowthEntry,
  deleteGrowthEntry,
  getGrowthSummary,
} = require("../controllers/marketingGrowthController");

const {
  createMediaItem,
  getMediaItems,
  getMediaItemById,
  deleteMediaItem,
} = require("../controllers/marketingMediaController");

const {
  getMarketingDashboard,
} = require("../controllers/marketingDashboardController");

// Dashboard
router.get(
  "/dashboard",
  protect,
  authorizeRoles("marketing"),
  getMarketingDashboard
);

// Strategy Routes
router.get(
  "/strategies",
  protect,
  authorizeRoles("marketing"),
  getStrategies
);

router.post(
  "/strategies",
  protect,
  authorizeRoles("marketing"),
  createStrategy
);

router.get(
  "/strategies/:id",
  protect,
  authorizeRoles("marketing"),
  getStrategyById
);

router.get(
  "/strategies/:id/performance",
  protect,
  authorizeRoles("marketing"),
  getStrategyPerformance
);

router.put(
  "/strategies/:id",
  protect,
  authorizeRoles("marketing"),
  updateStrategy
);

router.delete(
  "/strategies/:id",
  protect,
  authorizeRoles("marketing"),
  deleteStrategy
);

// Growth Tracking Routes
router.get(
  "/growth/summary",
  protect,
  authorizeRoles("marketing"),
  getGrowthSummary
);

router.get("/growth", protect, authorizeRoles("marketing"), getGrowthEntries);

router.post("/growth", protect, authorizeRoles("marketing"), createGrowthEntry);

router.get(
  "/growth/:id",
  protect,
  authorizeRoles("marketing"),
  getGrowthEntryById
);

router.put(
  "/growth/:id",
  protect,
  authorizeRoles("marketing"),
  updateGrowthEntry
);

router.delete(
  "/growth/:id",
  protect,
  authorizeRoles("marketing"),
  deleteGrowthEntry
);

// Media Upload Routes
router.get("/media", protect, authorizeRoles("marketing"), getMediaItems);

router.get(
  "/media/:id",
  protect,
  authorizeRoles("marketing"),
  getMediaItemById
);

router.post(
  "/media",
  protect,
  authorizeRoles("marketing"),
  upload.single("mediaFile"),
  createMediaItem
);

router.delete(
  "/media/:id",
  protect,
  authorizeRoles("marketing"),
  deleteMediaItem
);

module.exports = router;