const express = require("express");
const {
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
} = require("../controllers/requestController");

const router = express.Router();

router.post("/", sendRequest);
router.get("/sent", getSentRequests);
router.get("/received", getReceivedRequests);
router.get("/dashboard", getDashboardRequests);
router.get("/pending-reviews", getPendingReviews);

router.patch("/:id/respond", respondToRequest);
router.get("/:id/overlap", getOverlapForRequest);
router.patch("/:id/schedule", scheduleRequest);
router.patch("/:id/complete", markCompleted);
router.post("/:id/rate", rateUser);
router.post("/:id/continue", continueExchange);
router.patch("/:id/review/dismiss", dismissPendingReview);

module.exports = router;
