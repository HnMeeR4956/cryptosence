require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    // Only remove/reseed admin account
    await User.deleteMany({ role: "admin" });

    const adminPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || "Admin12345",
      10
    );

    await User.create({
      username: "Admin",
      email: (process.env.ADMIN_EMAIL || "admin@cryptosence.com").toLowerCase(),
      password: adminPassword,
      role: "admin",
    });

    console.log("Seeded admin user only");
    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

seedUsers();