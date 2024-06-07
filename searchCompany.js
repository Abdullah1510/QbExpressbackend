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


route.post("/", async (req, res) => {
    try {
      const client = await pool.connect();
  
      const companyguid = req.body.CompanyGuid;
  
      const result = await client.query(
        "SELECT mobileappsubkey, enddate, mobileappname, service_area FROM qbe_companymaster WHERE sourceguid = $1",
        [companyguid]
      );
  
      if (result.rows.length === 0) {
        // If no company found with the given companyguid
        res.status(206).json({ status: 206, message: "Company not found" });
      } else {
        const companyDetails = {
          mobileappsubkey: result.rows[0].mobileappsubkey,
          enddate: result.rows[0].enddate,
          mobileappname: result.rows[0].mobileappname,
          service_area: result.rows[0].service_area,
        };
  
        res.status(200).json({ status: 200, message: "Company details retrieved successfully", companyDetails });
      }
  
      client.release(); // Release the database connection
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: 500, message: err.message });
    }
  });
  
  module.exports = route;
