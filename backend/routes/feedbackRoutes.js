const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  submitFeedback,
  getAllFeedback,
  getMyFeedback,
  updateFeedbackStatus,
  deleteFeedback,
} = require("../controllers/feedbackController");

const router = express.Router();

router.post("/", protect, submitFeedback);
router.get("/my-feedback", protect, getMyFeedback);
router.get("/", protect, authorizeRoles("admin"), getAllFeedback);
router.put("/:id/status", protect, authorizeRoles("admin"), updateFeedbackStatus);
router.delete("/:id", protect, authorizeRoles("admin"), deleteFeedback);

module.exports = router;
