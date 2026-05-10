const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
  {
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isBanned: { type: Boolean, default: false },
    skillsOffered: { type: [String], default: [] },
    skillsWanted: { type: [String], default: [] },
    availability: { type: [availabilitySchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
