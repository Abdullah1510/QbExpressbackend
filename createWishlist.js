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
    const { hoid, sourceid, stocknumber, pid, addressid, status } = req.body;
    
    if (!hoid || !sourceid || !stocknumber || !pid || !addressid) {
      return res.status(400).json({ message: "All fields are required" });
    }
      const client = await pool.connect();
      if (status === 'i'){
        const iteinsertquery = `
        INSERT INTO qbe_itemwishlist (hoid, sourceid, stocknumber, pid, addressid)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (hoid, sourceid, stocknumber) 
        DO UPDATE 
        SET hoid = EXCLUDED.hoid, 
            sourceid = EXCLUDED.sourceid, 
            stocknumber = EXCLUDED.stocknumber,
            pid = EXCLUDED.pid,
            addressid = EXCLUDED.addressid
      `;   
              const iteminsertvalues = [hoid, sourceid, stocknumber, pid, addressid]; 
              const result = await client.query(iteinsertquery, iteminsertvalues);         
        
          res.status(200).json({
            message: "Item saved to shopping list",
          });    
          client.release();
      }
      else if (status === 'd') {
        const deleteListQuery = `
          DELETE FROM qbe_itemwishlist WHERE hoid = $1 AND sourceid = $2 AND pid = $3 AND stocknumber = $4 and addressid = $5
        `;
  
        const deleteListValues = [hoid, sourceid, pid, stocknumber, addressid];
        await client.query(deleteListQuery, deleteListValues);
  
        res.status(200).json({
          message: "Item removed from shopping list",
        });
      } else {
        res.status(400).json({
          message: "Invalid status value. Use 'i' for insert or 'd' for delete",
        });
      }     
  }
  catch(err){
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = route;
