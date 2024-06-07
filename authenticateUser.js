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

// Express Router for user authentication
route.post("/", async (req, res) => {
  try {
    const client = await pool.connect();

    const mobno = req.body.mobno;
    const password = req.body.password;
    const hoid = req.body.hoid;

    // Encrypt the provided password for comparison
    const encryptedPassword = encryptPassword(password);

    // Query to check if the user exists and credentials match
    const authenticateQuery = `
      SELECT pid
      FROM qbe_party
      WHERE mobno = $1 AND password = $2 AND hoid = $3;
    `;

    const authenticateValues = [mobno, encryptedPassword, hoid];

    const authenticateResult = await client.query(authenticateQuery, authenticateValues);

    if (authenticateResult.rows.length === 1) {
      // Authentication successful
      res.status(200).json({
        message: "Authentication successful",
        pid: authenticateResult.rows[0].pid,
      });
    } else {
      // Authentication failed
      res.status(401).json({
        message: "Authentication failed. Invalid mobile number or password.",
      });
    }

    client.release();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = route;
