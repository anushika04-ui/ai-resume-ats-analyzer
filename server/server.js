const express = require("express");
const cors = require("cors");
require("dotenv").config();

const analyzeRoutes = require("./analyze");
const uploadRoutes = require("./upload");

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/", (req, res) => {
  res.send("API running");
});

// Routes
app.use("/api", analyzeRoutes);
app.use("/api", uploadRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port", PORT));
