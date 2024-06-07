const express = require("express");
const route = express.Router();
const { Pool } = require("pg");
require("dotenv").config();
const os = require("os");
const { start } = require("repl");

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

console.log("Database connection");

// Express Router
route.post("/", async (req, res) => {
  try {
    const client = await pool.connect();
    console.log("Database connected");

    const hoid = req.body.hoid;
    const product = req.body.product;
    const brand = req.body.brand;

    let query = `SELECT * FROM "qbe_itemmaster" WHERE ActiveFlag='1' AND hoid = $1`;

    const parameters = [hoid]; // Initialize parameters array with hoid

    if (product && brand) {
      // If both product and brand are passed, match for both
      query += ` AND Class1guid ILIKE $2 AND Class2guid ILIKE $3`;
      parameters.push(`%${product}%`, `%${brand}%`); // Add product and brand parameters
    } else if (product) {
      // If only product is passed, match to Class1guid
      query += ` AND Class1guid ILIKE $2`;
      parameters.push(`%${product}%`); // Add product nod
    } else if (brand) {
      // If only brand is passed, match to Class2guid
      query += ` AND Class2guid ILIKE $2`;
      parameters.push(`%${brand}%`); // Add brand parameter
    }

    //const startTime = new Date();
    const result = await client.query(query, parameters);
    //console.log(result.rows);

     if (result.rows.length > 0) {
      result.rows.forEach((item) => {
        if (item.image) {
          item.imageUrl = item.image;
        } else {
          item.imageUrl = "";
        }
      });
      
      res.status(200).json({
        message: "Items found",
        data: result.rows,
      });
    } else {
      res.status(404).json({
        message: "Items not found",
      });
    }

    //const endTime = new Date();

    

    // const timeTaken_fetchItems = endTime - startTime;
    // console.log(endTime, startTime);
    // console.log("Time taken  FetchItems - " + timeTaken_fetchItems);

    client.release(); // Release the database connection
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = route;
