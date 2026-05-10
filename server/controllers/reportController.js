const Report = require("../models/Report");

const createReport = async (req, res) => {
  try {
    const { reportedUser, reason } = req.body;
    if (!reportedUser || !reason) return res.status(400).json({ message: "reportedUser and reason are required" });
    if (reportedUser === req.user._id.toString()) return res.status(400).json({ message: "Cannot report yourself" });

    const report = await Report.create({
      reportedUser,
      reportedBy: req.user._id,
      reason,
    });
    return res.status(201).json(report);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAllReports = async (_req, res) => {
  const reports = await Report.find()
    .populate("reportedUser", "name email isBanned")
    .populate("reportedBy", "name email")
    .sort({ createdAt: -1 });

  res.json(reports);
};

module.exports = { createReport, getAllReports };
