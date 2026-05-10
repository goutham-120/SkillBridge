const User = require("../models/User");
const Request = require("../models/Request");
const Rating = require("../models/Rating");

const normalize = (value) => value.trim().toLowerCase();

const splitSkills = (skills = []) => {
  const seen = new Set();

  return skills
    .flatMap((skill) => String(skill).split(","))
    .map((skill) => skill.trim())
    .filter((skill) => {
      const key = normalize(skill);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const getProfile = async (req, res) => {
  return res.json(req.user);
};

const updateProfile = async (req, res) => {
  try {
    const { name, skillsOffered, skillsWanted, availability } = req.body;
    const user = await User.findById(req.user._id);

    if (name !== undefined) user.name = name;
    if (Array.isArray(skillsOffered)) user.skillsOffered = splitSkills(skillsOffered);
    if (Array.isArray(skillsWanted)) user.skillsWanted = splitSkills(skillsWanted);
    if (Array.isArray(availability)) user.availability = availability;

    await user.save();
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addSkill = (type) => async (req, res) => {
  try {
    const { skill } = req.body;
    if (!skill || !skill.trim()) return res.status(400).json({ message: "Skill is required" });

    const user = await User.findById(req.user._id);
    const nextSkills = splitSkills([skill]);
    const current = user[type].map(normalize);
    nextSkills.forEach((nextSkill) => {
      if (!current.includes(normalize(nextSkill))) user[type].push(nextSkill);
    });

    await user.save();
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const removeSkill = (type) => async (req, res) => {
  try {
    const { skill } = req.body;
    if (!skill || !skill.trim()) return res.status(400).json({ message: "Skill is required" });

    const user = await User.findById(req.user._id);
    user[type] = user[type].filter((item) => normalize(item) !== normalize(skill));

    await user.save();
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;
    if (!Array.isArray(availability)) return res.status(400).json({ message: "Availability must be array" });

    const user = await User.findById(req.user._id);
    user.availability = availability;
    await user.save();
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getMatches = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const currentOffered = splitSkills(currentUser.skillsOffered);
    const currentWanted = splitSkills(currentUser.skillsWanted);
    const currentWantedKeys = currentWanted.map(normalize);

    const users = await User.find({
      _id: { $ne: req.user._id },
      isBanned: false,
      role: "user",
    }).select("-password");
    const userIds = users.map((user) => user._id);
    const ratings = await Rating.aggregate([
      { $match: { ratedUser: { $in: userIds } } },
      {
        $group: {
          _id: "$ratedUser",
          averageRating: { $avg: "$stars" },
          ratingCount: { $sum: 1 },
        },
      },
    ]);
    const ratingByUser = new Map(ratings.map((rating) => [rating._id.toString(), rating]));

    const matches = users
      .map((user) => {
        const offered = splitSkills(user.skillsOffered);
        const wanted = splitSkills(user.skillsWanted);
        const wantedKeys = wanted.map(normalize);
        const theyCanTeach = offered.filter((skill) => currentWantedKeys.includes(normalize(skill)));
        const youCanTeach = currentOffered.filter((skill) => wantedKeys.includes(normalize(skill)));
        const matchedSkills = splitSkills([...theyCanTeach, ...youCanTeach]);
        const rating = ratingByUser.get(user._id.toString());
        return {
          ...user.toObject(),
          skillsOffered: offered,
          matchedSkills,
          averageRating: rating ? Number(rating.averageRating.toFixed(1)) : null,
          ratingCount: rating?.ratingCount || 0,
          score: matchedSkills.length,
        };
      })
      .filter((u) => u.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ score, ...rest }) => rest);

    return res.json(matches);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getSessionCountWithUser = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const count = await Request.countDocuments({
      status: "Completed",
      $or: [
        { sender: req.user._id, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user._id },
      ],
    });

    return res.json({ count });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateAvailability,
  addOfferedSkill: addSkill("skillsOffered"),
  removeOfferedSkill: removeSkill("skillsOffered"),
  addWantedSkill: addSkill("skillsWanted"),
  removeWantedSkill: removeSkill("skillsWanted"),
  getMatches,
  getSessionCountWithUser,
};
