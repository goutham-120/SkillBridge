const express = require("express");
const { getAllUsers, toggleBanUser, createAdmin } = require("../controllers/adminController");
const { getAllReports } = require("../controllers/reportController");

const router = express.Router();

router.get("/users", getAllUsers);
router.post("/admins", createAdmin);
router.patch("/users/:id/ban-toggle", toggleBanUser);
router.get("/reports", getAllReports);

module.exports = router;
