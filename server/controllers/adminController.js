const User = require("../models/User");

const getAllUsers = async (_req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
};

const toggleBanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") return res.status(400).json({ message: "Cannot ban admin user" });

    user.isBanned = !user.isBanned;
    await user.save();
    res.json({ id: user._id, isBanned: user.isBanned });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllUsers, toggleBanUser };
