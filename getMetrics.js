const promClient = require("prom-client");
const express = require("express");
const route = express.Router();
require("dotenv").config();

const register = new promClient.Registry();

promClient.collectDefaultMetrics({ register });

route.get("/", async (req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.send(await register.metrics());
});
