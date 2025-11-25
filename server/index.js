const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const analyzeRouter = require("./routes/analyze");

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

// API routes
app.use("/api/analyze", analyzeRouter);

// MongoDB integration removed — running without persistence
console.info("MongoDB disabled: running without persistence (no DB operations will be performed).");

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
