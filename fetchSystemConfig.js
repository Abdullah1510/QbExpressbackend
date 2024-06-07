const express = require("express");
const route = express.Router();
const { Pool } = require("pg");
require("dotenv").config();
const os = require("os");

const hostname = os.hostname();

//#region Config for PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT, // Make sure to set the appropriate port
  ssl: false,
});
//#endregion

// Express Router
route.post("/", async (req, res) => {
  try {
    const client = await pool.connect();

    const hoid = req.body.hoid;

    const result = await client.query(
      `SELECT id, sourceguid, compname, config FROM "qbe_companymaster" WHERE ActiveFlag='1' AND hoid = ${hoid} GROUP BY id, compname`
    );

    if (result.rows.length > 0) {
      res.status(200).json({
        status: 200,
        message: "Configuration found",
        data: result.rows,
      });
    } else {
      res.status(404).json({
        status: 404,
        message: "Store configuration not found",
      });
    }

    client.release(); // Release the database connection
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = route;
