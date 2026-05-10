const express = require("express");
const { getAllUsers, toggleBanUser } = require("../controllers/adminController");
const { getAllReports } = require("../controllers/reportController");

const router = express.Router();

router.get("/users", getAllUsers);
router.patch("/users/:id/ban-toggle", toggleBanUser);
router.get("/reports", getAllReports);

module.exports = router;
