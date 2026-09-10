const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const User = require("../models/User");
const Feedback = require("../models/Feedback");
const bcrypt = require("bcryptjs");


const router = express.Router();

router.get("/dashboard", protect, authorizeRoles("admin"), (req, res) => {
  res.json({
    message: "Welcome Admin",
    role: req.user.role,
    user: req.user,
  });
});

// only normal users
router.get("/users", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// only marketing users
router.get("/marketing-users", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const users = await User.find({ role: "marketing" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// admin creates marketing user
router.post("/marketing-users", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const marketingUser = await User.create({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "marketing",
    });

    res.status(201).json({
      message: "Marketing user created successfully",
      user: marketingUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/users/:id/role", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const { role } = req.body;

    if (!["user", "admin", "marketing"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = role;
    await user.save();

    res.json({ message: "User role updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/users/:id/block", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBlocked = true;
    await user.save();

    res.json({ message: "User blocked successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/users/:id/unblock", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBlocked = false;
    await user.save();

    res.json({ message: "User unblocked successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/users/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/feedback", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate("user", "username email role")
      .sort({ createdAt: -1 });

    res.json({ feedback });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/feedback/:id/status", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const { status } = req.body;

    if (!["new", "reviewed", "resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ message: "Feedback not found" });

    feedback.status = status;
    await feedback.save();

    res.json({ message: "Feedback status updated successfully", feedback });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/feedback/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ message: "Feedback not found" });

    await feedback.deleteOne();
    res.json({ message: "Feedback deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// activity monitor
router.get("/activity", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const normalUsers = await User.countDocuments({ role: "user" });
    const marketingUsers = await User.countDocuments({ role: "marketing" });
    const adminUsers = await User.countDocuments({ role: "admin" });
    const blockedUsers = await User.countDocuments({ isBlocked: true });

    const activeSubscriptions = await User.countDocuments({
      role: "user",
      subscriptionStatus: "active",
    });
    const inactiveSubscriptions = await User.countDocuments({
      role: "user",
      $or: [{ subscriptionStatus: "inactive" }, { subscriptionStatus: { $exists: false } }],
    });
    const cancelledSubscriptions = await User.countDocuments({
      role: "user",
      subscriptionStatus: "cancelled",
    });
    const expiredSubscriptions = await User.countDocuments({
      role: "user",
      subscriptionStatus: "expired",
    });

    const totalUsers = normalUsers + marketingUsers;

    const totalFeedback = await Feedback.countDocuments();
    const newFeedback = await Feedback.countDocuments({ status: "new" });
    const reviewedFeedback = await Feedback.countDocuments({ status: "reviewed" });
    const resolvedFeedback = await Feedback.countDocuments({ status: "resolved" });

    const latestUsers = await User.find({ role: { $in: ["user", "marketing"] } })
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(5);

    const latestFeedback = await Feedback.find()
      .populate("user", "username email role")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentLogins = await User.find({
      lastLogin: { $ne: null },
      role: { $in: ["user", "marketing", "admin"] },
    })
      .select("username email role lastLogin")
      .sort({ lastLogin: -1 })
      .limit(5);

    res.json({
      stats: {
        totalUsers,
        normalUsers,
        marketingUsers,
        adminUsers,
        blockedUsers,
        totalFeedback,
        newFeedback,
        reviewedFeedback,
        resolvedFeedback,
        activeSubscriptions,
        inactiveSubscriptions,
        cancelledSubscriptions,
        expiredSubscriptions,
      },
      latestUsers,
      latestFeedback,
      recentLogins,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;