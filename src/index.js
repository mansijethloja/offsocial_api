require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const pageSpeedRoutes = require("./routes/pagespeed.route");
const contentRoutes = require("./routes/content.route");
const leadRoutes = require("./routes/lead.route");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.use("/api/pagespeed", pageSpeedRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/leads", leadRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
