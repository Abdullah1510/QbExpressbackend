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

    //console.log(hoid);

    const result = await client.query(
      `SELECT * FROM "qbe_itemmaster" WHERE ActiveFlag='1' AND hoid = ${hoid}`
    );

    if (result.rows.length > 0) {
      res.status(200).json({
        message: "Items found",
        data: result.rows,
      });
    } else {
      res.status(404).json({
        message: "Items not found",
      });
    }

    client.release(); // Release the database connection
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = route;
