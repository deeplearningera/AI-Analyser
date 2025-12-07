const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const routes = require("./routes");

const app = express();
app.use(bodyParser.json({ limit: "5mb" }));
app.use("/", routes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`🤖 AI Analyzer running on port ${PORT}`)
);
