const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected", "Scheduled", "Completed"],
      default: "Pending",
    },
    scheduledSlot: {
      day: String,
      startTime: String,
      endTime: String,
    },
    sessionTopic: { type: String, default: "" },
    meetingLink: { type: String, default: "" },
    isRatedBySender: { type: Boolean, default: false },
    isRatedByReceiver: { type: Boolean, default: false },
    isReviewDismissedBySender: { type: Boolean, default: false },
    isReviewDismissedByReceiver: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Request", requestSchema);
