const express = require("express");
const route = express.Router();
const { Pool } = require("pg");
require("dotenv").config();
const os = require("os");

const hostname = os.hostname();
process.env.TZ='UTC';

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

// Function to recursively convert null values to empty strings
// Function to recursively convert null values, numeric values to 0, and strings to empty
function replaceNull(obj) {
  for (let key in obj) {
    if (obj[key] === null) {
      // Treat batchNo as a special case and replace with an empty string
      if (key === 'batchNo') {
        obj[key] = '';
      } else {
        // For other keys, check if the value should be replaced with an empty string or 0
        obj[key] = typeof obj[key] === 'string' ? '' : 0;
      }
    } else if (typeof obj[key] === 'object') {
      replaceNull(obj[key]);
    }
  }
}


// Express Router
route.post("/", async (req, res) => {
  try {
    const client = await pool.connect();

    // Extract data from the request
    const { SourceGUID, fetchAll, fromDate, toDate } = req.body;

    try {
      // Build the WHERE clause based on conditions
      let whereClause = "";
      let params = [];

      if (fetchAll) {
        if (fromDate && toDate) {
          // Fetch all transactions within the date range regardless of order_status
          whereClause = "WHERE hdr.SourceGUID = $1 AND vch_date >= $2 AND vch_date <= $3";
          params.push(SourceGUID, fromDate, toDate);
        } else {
          // Fetch all transactions regardless of order_status and date range
          whereClause = "WHERE hdr.SourceGUID = $1";
          params.push(SourceGUID);
        }
      } else {
        // Fetch transactions with order_status as Pending
        whereClause = "WHERE hdr.SourceGUID = $1 AND hdr.order_status = 'P'";
        params.push(SourceGUID);
      }

      // Retrieve orders and their details based on the conditions
      const fetchOrdersQuery = `
        SELECT 
          hdr.*, 
          party.firstname,
          party.lastname,
          party.mobno,
          partyaddress.addressline1,
          partyaddress.addressline2,
          partyaddress.addressline3,
          partyaddress.area,
          partyaddress.city,
          partyaddress.state,
          partyaddress.country,
          partyaddress.pincode,
          ARRAY_AGG(jsonb_build_object(
            'slNo', dtls.sl_no,
            'itemGuid', dtls.mrpmasterguid,
            'transQty', dtls.trans_qty,
            'itemRate', dtls.item_rate,
            'itemValue', dtls.item_value,
            'discPerc', dtls.disc_perc,
            'discAmt', dtls.disc_amt,
            'discFlag', dtls.disc_flag,
            'itemNetValue', dtls.item_net_value,
            'mrpMasterGuid', dtls.mrpmasterguid,
            'priceMasterGuid', dtls.pricemasterguid,
            'batchNo', dtls.batchno,
            'uom', dtls.uom,
            'discGuid', dtls.disc_guid
          )) AS details
        FROM qbe_trn_hdr hdr
        LEFT JOIN qbe_trn_dtls dtls ON hdr.hdr_id = dtls.order_hdr_guid
        LEFT JOIN qbe_party party ON hdr.partyguid = party.pid
        LEFT JOIN qbe_partyaddress partyaddress ON hdr.partyaddressguid = partyaddress.addressid
        ${whereClause}
        GROUP BY 
          hdr.hdr_id, 
          party.firstname,
          party.lastname,
          party.mobno,
          partyaddress.addressline1,
          partyaddress.addressline2,
          partyaddress.addressline3,
          partyaddress.area,
          partyaddress.city,
          partyaddress.state,
          partyaddress.country,
          partyaddress.pincode;
      `;

      const ordersResult = await client.query(fetchOrdersQuery, params);
      const orders = ordersResult.rows;

      // Replace null values with empty strings in the response JSON
    // orders.forEach(order => replaceNull(order));
    

      res.status(200).json({
        message: "Orders retrieved successfully!!!!",
        orders: orders,
      });
      console.log(res.orders);
    } catch (error) {
      throw error;
    } finally {
      // Release the database connection
      await client.release();
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = route;
