const express = require("express");
const route = express.Router();
const { Pool } = require("pg");
const crypto = require("crypto");
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

// Function to encrypt the password
const encryptPassword = (password) => {
  const passphrase = "QUICKBILL";
  const md5Hash = crypto.createHash("md5").update(passphrase, "utf8").digest();
  const key = Buffer.alloc(24);
  md5Hash.copy(key, 0, 0, 16);
  md5Hash.copy(key, 16, 0, 8);

  const cipher = crypto.createCipheriv("des-ede3", key, "");
  cipher.setAutoPadding(true);

  const encrypted = Buffer.concat([cipher.update(password, "utf8"), cipher.final()]);
  const encryptedString = "#qbd3#" + encrypted.toString("base64");

  return encryptedString;
};

// Express Router
route.post("/", async (req, res) => {
  try {
    const client = await pool.connect();

    const hoid = req.body.hoid;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const sourceGuid = req.body.sourceGuid;
    const mobno = req.body.mobno;
    const emailid = req.body.emailid;
    const addressLine1 = req.body.addressLine1;
    const addressLine2 = req.body.addressLine2;
    const addressLine3 = req.body.addressLine3;
    const area = req.body.area;
    const city = req.body.city;
    const state = req.body.state;
    const country = req.body.country;
    const lat = req.body.lat;
    const lng = req.body.lng;
    const password = req.body.password;
    const alias = req.body.alias;
    const pincode = req.body.pincode;
    const isActive = true;

    // Encrypt the password
    //const encryptedPassword = encryptPassword(password);

    //console.log(firstName, lastName, addressLine1)

    const encryptedPassword = "";

    // Check if mobno already exists for the same hoid
    const checkMobnoQuery = `
      SELECT COUNT(*) AS count
      FROM qbe_party
      WHERE hoid = $1 AND mobno = $2;
    `;

    const checkMobnoValues = [hoid, mobno];
    const mobnoCheckResult = await client.query(checkMobnoQuery, checkMobnoValues);
    const mobnoCount = mobnoCheckResult.rows[0].count;

    if (mobnoCount > 0) {
      // Mobno already exists, return an error
      res.status(400).json({
        message: "Error: Mobile number already exists.",
      });
      return;
    }

    // Insert party details into qbe_party table
    const partyInsertQuery = `
      INSERT INTO qbe_party (HOID, FirstName, LastName, SourceGUID, mobno, emailid, password)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING pid;
    `;

    const partyInsertValues = [
      hoid,
      firstName,
      lastName,
      sourceGuid,
      mobno,
      emailid,
      encryptedPassword,
    ];

    const partyResult = await client.query(partyInsertQuery, partyInsertValues);
    const pid = partyResult.rows[0].pid;

    // Insert address details into qbe_PartyAddress table
    const addressInsertQuery = `
      INSERT INTO qbe_PartyAddress (
        HOID, SourceGUID, mobno, AddressLine1, AddressLine2, AddressLine3, Area, City, State, Country, lat, lng, alias, linkid, pincode, isactive
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
      ) RETURNING linkid;
    `;

    const addressInsertValues = [
      hoid,
      sourceGuid,
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
      isActive,
    ];

    const addressResult = await client.query(addressInsertQuery, addressInsertValues);
    //const addressID = addressResult.rows[0].addressid;

    res.status(200).json({
      message: "Party details and address inserted successfully",
      pid: pid,
    });

    client.release(); // Release the database connection
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = route;
