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
route.get("/", async (req, res) => {
  try {
    const client = await pool.connect();

    // Log client properties for debugging
    // console.log("Client Properties:");
    // console.log("Is connected:", client._connected); // Check if the client is connected
    // console.log("Connection parameters:", client.connectionParameters);

    // // Check if the database connection is successful
    // if (client._connected) {
    //   console.log("Database connection is successful.");
    // } else {
    //   console.log("Database connection failed.");
    // }

    const result = await client.query(
      `SELECT * FROM "qbe_companymaster" WHERE ActiveFlag='1'`
    );

    if (result.rows.length > 0) {
      res.status(200).json({
        message: "Company found",
        data: result.rows,
      });
    } else {
      res.status(404).json({
        message: "Company not found",
      });
    }

    client.release(); // Release the database connection
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = route;
