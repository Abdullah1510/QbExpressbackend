const express = require("express");
const route = express.Router();
const { Pool } = require("pg");
const crypto = require("crypto");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  ssl: false,
});

// Express Router for user authentication
route.post("/", async (req, res) => {
  try {
    const client = await pool.connect();

    const mobno = req.body.mobno;
    const hoid = req.body.hoid;

    // Query to retrieve party details based on mobno and hoid
    const retrievePartyQuery = `
      SELECT pid, partyguid, firstname, lastname
      FROM qbe_party
      WHERE mobno = $1 AND hoid = $2;
    `;

    const retrievePartyValues = [mobno, hoid];

    const retrievePartyResult = await client.query(
      retrievePartyQuery,
      retrievePartyValues
    );

    if (retrievePartyResult.rows.length === 1) {
      const partyDetails = retrievePartyResult.rows[0];

      // Retrieve all addresses associated with the party from qbe_partyaddress table
      const retrieveAllAddressesQuery = `
        SELECT addressid, alias, addressline1, addressline2, addressline3, area, city, state, country, pincode, sourceguid
        FROM qbe_partyaddress
        WHERE linkid = $1 AND isactive = true;
      `;

      const retrieveAllAddressesValues = [partyDetails.pid];

      const retrieveAllAddressesResult = await client.query(
        retrieveAllAddressesQuery,
        retrieveAllAddressesValues
      );

      if (retrieveAllAddressesResult.rows.length > 0) {
        const addressDetails = retrieveAllAddressesResult.rows;

        res.status(200).json({
          message: "User details retrieved successfully",
          partyDetails: {
            pid: partyDetails.pid,
            partyguid: partyDetails.partyguid,
            firstname: partyDetails.firstname,
            lastname: partyDetails.lastname,
            mobno: mobno,
            addressDetails: addressDetails,
          },
        });
      } else {
        res.status(404).json({
          message: "User address details not found",
        });
      }
    } else {
      res.status(404).json({
        message: "User details not found",
      });
    }

    client.release();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = route;
