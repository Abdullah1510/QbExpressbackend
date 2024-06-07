const express = require("express");
const route = express.Router();
//const { Pool } = require("pg");
require("dotenv").config();
const os = require("os");

//const hostname = os.hostname();

// //#region Config for PostgreSQL
// const pool = new Pool({
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   host: process.env.DB_HOST,
//   database: process.env.DB_DATABASE,
//   port: process.env.DB_PORT, // Make sure to set the appropriate port
//   ssl: false,
// });

route.post("/", async (req, res) => {
    
})