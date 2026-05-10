const express = require("express");
const { createReport, getAllReports } = require("../controllers/reportController");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", createReport);
router.get("/", roleMiddleware("admin"), getAllReports);

module.exports = router;
