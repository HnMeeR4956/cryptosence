const router = require("express").Router();
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { predict, getUsage } = require("../controllers/predictionController");
router.use(protect, authorizeRoles("user"));
router.get("/usage", getUsage);
router.post("/", predict);
module.exports = router;

