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

route.post("/", async (req, res) => {
    try {
        
      const { custdata } = req.body;
      const client = await pool.connect();
       
      for (const data of custdata) {
        const { sourceGuid, firstName, lastName, mobno, emailid, addressLine1, addressLine2, addressLine3, area, city, state, country, lat, lng, alias, pincode } = data;
        let hoid;
        // Query to fetch hoid from qbe_companymaster based on sourceguid (using parameterized query)
        const resHoidQuery = 'SELECT id FROM qbe_companymaster WHERE sourceguid = $1';
        
        const result = await client.query(resHoidQuery, [sourceGuid]);
       
        
        if (result.rows.length > 0) {
          hoid = result.rows[0].id;          
          
        }
          const checkMobnoQuery = `SELECT COUNT(*) AS count FROM qbe_party 
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
          console.log("party insert");
          const partyInsertQuery = `
            INSERT INTO qbe_party (HOID, FirstName, LastName, SourceGUID, mobno, emailid, password)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING pid;
          `;
          const partyInsertValues = [hoid, firstName, lastName, sourceGuid, mobno, emailid, '']; // encryptedPassword is empty for now
          const partyResult = await client.query(partyInsertQuery, partyInsertValues);
          const pid = partyResult.rows[0].pid;
  
          // Insert address details into qbe_PartyAddress table
          
          const addressInsertQuery = `
            INSERT INTO qbe_PartyAddress (
              HOID, SourceGUID, mobno, AddressLine1, AddressLine2, AddressLine3, Area, City, State, Country, lat, lng, alias, linkid, pincode, isactive
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            RETURNING linkid;
          `;
          const addressInsertValues = [hoid, sourceGuid, mobno, addressLine1, addressLine2, addressLine3, area, city, state, country, lat, lng, alias, pid, pincode, true];
          await client.query(addressInsertQuery, addressInsertValues);
        
      }
  
      res.status(200).json({
        message: "Party details and address inserted successfully",
      });
  
      client.release(); // Release the database connection
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  });
  module.exports = route;  