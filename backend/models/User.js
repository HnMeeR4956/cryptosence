const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
    },
    resetPasswordToken: {
      type: String,
      default: null,
},
    resetPasswordExpire: {
      type: Date,
      default: null,
},
    googleId: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["user", "admin", "marketing"],
      default: "user",
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },

    stripeCustomerId: {
      type: String,
      default: null,
    },
    subscriptionStatus: {
      type: String,
      enum: ["inactive", "active", "cancelled", "expired"],
      default: "inactive",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);