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
route.delete("/", async (req, res) => {
  try {
    const client = await pool.connect();

    const addressid = req.body.addressid;

    // Delete the address linked to the addressid
    const deleteAddressQuery = `
      UPDATE qbe_PartyAddress
      SET isactive = false 
      WHERE addressid = $1;
    `;

    const deleteAddressValues = [addressid];
    const result = await client.query(deleteAddressQuery, deleteAddressValues);

    console.log(result);

    if (result.rowCount === 1) {
      res.status(200).json({
        message: "Address deleted successfully",
      });
    } else {
      throw Error("Deletion Error");
    }

    client.release(); // Release the database connection
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = route;
