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
    const mobno = req.body.mobno;
    const sourceguid = req.body.sourceguid;

    // Address details
    const alias = req.body.alias;
    const addressLine1 = req.body.addressLine1;
    const addressLine2 = req.body.addressLine2;
    const addressLine3 = req.body.addressLine3;
    const area = req.body.area;
    const city = req.body.city;
    const state = req.body.state;
    const country = req.body.country;
    const lat = req.body.lat;
    const lng = req.body.lng;
    const pincode = req.body.pincode;

    // Retrieve pid from qbe_party
    const retrievePidQuery = `
      SELECT pid
      FROM qbe_party
      WHERE hoid = $1 AND mobno = $2;
    `;

    const retrievePidValues = [hoid, mobno];
    const retrievePidResult = await client.query(retrievePidQuery, retrievePidValues);

    if (retrievePidResult.rows.length !== 1) {
      // No matching record found
      res.status(404).json({
        message: "Party details not found",
      });
      return;
    }

    const pid = retrievePidResult.rows[0].pid;

    // Check the number of addresses for the party
    const countAddressesQuery = `
      SELECT COUNT(*) AS address_count
      FROM qbe_PartyAddress
      WHERE linkid = $1 AND isactive = true;
    `;

    const countAddressesValues = [pid];
    const countAddressesResult = await client.query(countAddressesQuery, countAddressesValues);
    const addressCount = countAddressesResult.rows[0].address_count;

    if (addressCount >= 3) {
      // If the party has three or more addresses, throw a 406 status and do not accept the new address
      res.status(406).json({
        message: "More than 3 addresses saved. Delete an existing address to continue!",
      });
      return;
    }

    const isActive = true;

    // Continue with the insertion logic for parties with less than three addresses
    const addressInsertQuery = `
      INSERT INTO qbe_PartyAddress (
        HOID, SourceGUID, mobno, AddressLine1, AddressLine2, AddressLine3, Area, City, State, Country, lat, lng, alias, linkid, pincode, isactive
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
      ) RETURNING AddressID;
    `;

    const addressInsertValues = [
      hoid,
      sourceguid,
      mobno,
      addressLine1,
      addressLine2,
      addressLine3,
      area,
      city,
      state,
      country,
      lat,
      lng,
      alias,
      pid,
      pincode,
      isActive
    ];

    const addressResult = await client.query(addressInsertQuery, addressInsertValues);
    const addressID = addressResult.rows[0].addressid;

    res.status(200).json({
      message: "Address inserted successfully",
      addressID: addressID,
    });

    client.release(); // Release the database connection
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = route;
