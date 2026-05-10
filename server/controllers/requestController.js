const Request = require("../models/Request");
const User = require("../models/User");
const Rating = require("../models/Rating");
const { getOverlappingSlots } = require("../utils/slotUtils");

const canAccessRequest = (request, userId) =>
  request.sender.toString() === userId.toString() ||
  request.receiver.toString() === userId.toString();

const sendRequest = async (req, res) => {
  try {
    const { receiver, sessionTopic = "" } = req.body;
    if (!receiver) return res.status(400).json({ message: "Receiver is required" });
    if (receiver === req.user._id.toString()) return res.status(400).json({ message: "Cannot send request to self" });

    const receiverUser = await User.findById(receiver);
    if (!receiverUser || receiverUser.isBanned) return res.status(404).json({ message: "Receiver not available" });

    const request = await Request.create({
      sender: req.user._id,
      receiver,
      sessionTopic,
    });

    return res.status(201).json(request);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getSentRequests = async (req, res) => {
  const requests = await Request.find({ sender: req.user._id }).populate("receiver", "name email");
  res.json(requests);
};

const getReceivedRequests = async (req, res) => {
  const requests = await Request.find({ receiver: req.user._id }).populate("sender", "name email");
  res.json(requests);
};

const respondToRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["Accepted", "Rejected"].includes(status)) return res.status(400).json({ message: "Invalid status" });

    const request = await Request.findById(id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only receiver can respond" });
    }
    if (request.status !== "Pending") return res.status(400).json({ message: "Request already processed" });

    request.status = status;
    await request.save();
    return res.json(request);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getOverlapForRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (!canAccessRequest(request, req.user._id)) return res.status(403).json({ message: "Not allowed" });
    if (!["Accepted", "Scheduled"].includes(request.status)) {
      return res.status(400).json({ message: "Request is not in schedulable state" });
    }

    const [sender, receiver] = await Promise.all([
      User.findById(request.sender),
      User.findById(request.receiver),
    ]);

    const overlaps = getOverlappingSlots(sender.availability, receiver.availability);
    return res.json({
      overlaps,
      message: overlaps.length ? "Common slots found" : "No common slots found",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const scheduleRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (!canAccessRequest(request, req.user._id)) return res.status(403).json({ message: "Not allowed" });
    if (request.status !== "Accepted") {
      return res.status(400).json({ message: "Request already scheduled or not accepted" });
    }

    const { selectedSlot, sessionTopic, meetingLink } = req.body;
    if (!selectedSlot || !sessionTopic || !meetingLink) {
      return res.status(400).json({ message: "Slot, topic and meeting link are required" });
    }

    request.scheduledSlot = selectedSlot;
    request.sessionTopic = sessionTopic;
    request.meetingLink = meetingLink;
    request.status = "Scheduled";
    await request.save();

    return res.json(request);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const markCompleted = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (!canAccessRequest(request, req.user._id)) return res.status(403).json({ message: "Not allowed" });
    if (request.status !== "Scheduled") return res.status(400).json({ message: "Only scheduled sessions can be completed" });

    request.status = "Completed";
    await request.save();
    return res.json(request);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const rateUser = async (req, res) => {
  try {
    const { stars } = req.body;
    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ message: "Stars should be between 1 and 5" });
    }

    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (!canAccessRequest(request, req.user._id)) return res.status(403).json({ message: "Not allowed" });
    if (request.status !== "Completed") return res.status(400).json({ message: "Session not completed yet" });

    const isSender = request.sender.toString() === req.user._id.toString();
    if (isSender && request.isRatedBySender) return res.status(400).json({ message: "Already rated" });
    if (!isSender && request.isRatedByReceiver) return res.status(400).json({ message: "Already rated" });

    const ratedUser = isSender ? request.receiver : request.sender;
    await Rating.create({
      request: request._id,
      ratedUser,
      ratedBy: req.user._id,
      stars,
    });

    if (isSender) request.isRatedBySender = true;
    else request.isRatedByReceiver = true;

    await request.save();
    return res.json({ message: "Rating submitted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const continueExchange = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (!canAccessRequest(request, req.user._id)) return res.status(403).json({ message: "Not allowed" });

    const receiver = request.sender.toString() === req.user._id.toString()
      ? request.receiver
      : request.sender;

    const newRequest = await Request.create({
      sender: req.user._id,
      receiver,
      status: "Pending",
    });

    return res.status(201).json(newRequest);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getPendingReviews = async (req, res) => {
  const requests = await Request.find({
    status: "Completed",
    $or: [
      { sender: req.user._id, isReviewDismissedBySender: { $ne: true } },
      { receiver: req.user._id, isReviewDismissedByReceiver: { $ne: true } },
    ],
  }).populate("sender receiver", "name email");

  const ratings = await Rating.find({
    request: { $in: requests.map((request) => request._id) },
    ratedBy: req.user._id,
  });
  const ratingByRequest = new Map(ratings.map((rating) => [rating.request.toString(), rating.stars]));

  res.json(requests.map((request) => ({
    ...request.toObject(),
    myRating: ratingByRequest.get(request._id.toString()) || null,
  })));
};

const dismissPendingReview = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (!canAccessRequest(request, req.user._id)) return res.status(403).json({ message: "Not allowed" });
    if (request.status !== "Completed") return res.status(400).json({ message: "Only completed sessions can be dismissed" });

    const isSender = request.sender.toString() === req.user._id.toString();
    if (isSender) request.isReviewDismissedBySender = true;
    else request.isReviewDismissedByReceiver = true;

    await request.save();
    return res.json({ message: "Review dismissed" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getDashboardRequests = async (req, res) => {
  const [incoming, sent, active, scheduled] = await Promise.all([
    Request.find({ receiver: req.user._id, status: "Pending" }).populate("sender", "name email"),
    Request.find({ sender: req.user._id, status: { $in: ["Pending", "Accepted", "Rejected"] } }).populate("receiver", "name email"),
    Request.find({
      status: { $in: ["Accepted", "Completed"] },
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    }).populate("sender receiver", "name email"),
    Request.find({
      status: "Scheduled",
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    }).populate("sender receiver", "name email"),
  ]);

  res.json({ incoming, sent, active, scheduled });
};

module.exports = {
  sendRequest,
  getSentRequests,
  getReceivedRequests,
  respondToRequest,
  getOverlapForRequest,
  scheduleRequest,
  markCompleted,
  rateUser,
  continueExchange,
  getPendingReviews,
  getDashboardRequests,
  dismissPendingReview,
};
