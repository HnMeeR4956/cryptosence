const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/dashboard", protect, authorizeRoles("user"), (req, res) => {
  res.json({
    message: "Welcome User",
    role: req.user.role,
    user: req.user,
  });
});

module.exports = router;
