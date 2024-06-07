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

    // Get distinct values for product
    const productQuery = `SELECT DISTINCT class1guid as product, class1image as class1image FROM "qbe_itemmaster" WHERE ActiveFlag='1' AND hoid = $1 AND class1guid IS NOT NULL`;
    const productResult = await client.query(productQuery, [hoid]);

    // Get distinct values for brand
    const brandQuery = `SELECT DISTINCT class2guid as brand, class2image as class2image FROM "qbe_itemmaster" WHERE ActiveFlag='1' AND hoid = $1 AND class2guid IS NOT NULL`;
    const brandResult = await client.query(brandQuery, [hoid]);

    const data = {
      product: productResult.rows.map((row) => ({ product: row.product, class1image: row.class1image })),
      brand: brandResult.rows.map((row) => ({ brand: row.brand, class2image: row.class2image})),
    };

    res.status(200).json({
      message: "Classifications found",
      data: data,
    });

    client.release(); // Release the database connection
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = route;
