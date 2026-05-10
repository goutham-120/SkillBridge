const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    request: { type: mongoose.Schema.Types.ObjectId, ref: "Request", required: true },
    ratedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ratedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    stars: { type: Number, min: 1, max: 5, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Rating", ratingSchema);
