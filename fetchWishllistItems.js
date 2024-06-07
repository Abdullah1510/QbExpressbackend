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

route.post("/", async (req, res) => {
    try {
      const { hoid, sourceid, pid, addressid } = req.body;
      const client = await pool.connect();
  
      const itemQuery = 'SELECT stocknumber FROM qbe_itemwishlist WHERE hoid = $1 AND sourceid = $2 AND pid = $3 AND addressid = $4';
      const queryResult = await client.query(itemQuery, [hoid, sourceid, pid, addressid]);
  
      if (queryResult.rows.length === 0) {
        return res.status(404).json({ error: 'No items found in the list' });
      }

      const itemsFound = [];
  
      for (const row of queryResult.rows) {
        const stocknumber = row.stocknumber;
        const itemMasterQuery = 'SELECT * FROM qbe_itemmaster WHERE ActiveFlag = $1 AND hoid = $2 AND sourceid = $3 AND stocknumber = $4';
        const itemQueryValues = ['1', hoid, sourceid, stocknumber];
        const itemMasterResult = await client.query(itemMasterQuery, itemQueryValues);
  
        if (itemMasterResult.rows.length > 0) {
            itemMasterResult.rows.forEach((item) => {
              if (item.image) {
                item.imageUrl = item.image;
              } else {
                item.imageUrl = "";
              }
              itemsFound.push(item);
            });
        }
      }
  
      if (itemsFound.length > 0) {
        res.status(200).json({
          message: "Items found",
          data: itemsFound,
        });
      } else {
        res.status(404).json({
          message: "Items not found",
        });
      }
  
      client.release();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
    
  });

  module.exports = route;

