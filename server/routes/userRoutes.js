const express = require("express");
const {
  getProfile,
  updateProfile,
  updateAvailability,
  addOfferedSkill,
  removeOfferedSkill,
  addWantedSkill,
  removeWantedSkill,
  getMatches,
  getSessionCountWithUser,
} = require("../controllers/userController");

const router = express.Router();

router.get("/me", getProfile);
router.put("/me/profile", updateProfile);
router.put("/me/availability", updateAvailability);

router.post("/me/skills/offered", addOfferedSkill);
router.delete("/me/skills/offered", removeOfferedSkill);
router.post("/me/skills/wanted", addWantedSkill);
router.delete("/me/skills/wanted", removeWantedSkill);

router.get("/matches", getMatches);
router.get("/session-count/:otherUserId", getSessionCountWithUser);

module.exports = router;
