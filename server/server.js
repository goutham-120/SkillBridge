require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authMiddleware = require("./middleware/authMiddleware");
const roleMiddleware = require("./middleware/roleMiddleware");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const requestRoutes = require("./routes/requestRoutes");
const reportRoutes = require("./routes/reportRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Skill Exchange Platform API running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", authMiddleware, userRoutes);
app.use("/api/requests", authMiddleware, requestRoutes);
app.use("/api/reports", authMiddleware, reportRoutes);
app.use("/api/admin", authMiddleware, roleMiddleware("admin"), adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
