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

    // Extract data from the request
    const { partyGuid, hoid } = req.body;

    try {
      // Retrieve orders and their details for the given partyGuid
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
                    'itemGuid', dtls.itemguid,
                    'itemDescription', ITEM_MASTER.ITEMDESCRIPTION,
                    'class1', ITEM_MASTER.CLASS1GUID,
                    'class2', ITEM_MASTER.CLASS2GUID,
                    'transQty', dtls.trans_qty,
                    'itemRate', dtls.item_rate,
                    'itemValue', dtls.item_value,
                    'discPerc', dtls.disc_perc,
                    'discAmt', dtls.disc_amt,
                    'discFlag', dtls.disc_flag,
                    'itemNetValue', dtls.item_net_value,
                    'batchNo', dtls.batchno,
                    'uom', dtls.uom,
                    'discGuid', dtls.disc_guid,
                    'imageurl', ITEM_MASTER.image
                    )) AS details
                FROM qbe_trn_hdr hdr
                LEFT JOIN qbe_trn_dtls dtls ON hdr.hdr_id = dtls.order_hdr_guid
                LEFT JOIN qbe_party party ON hdr.partyguid = party.pid
                LEFT JOIN qbe_partyaddress partyaddress ON hdr.partyaddressguid = partyaddress.addressid
                LEFT JOIN QBE_ITEMMASTER ITEM_MASTER ON DTLS.ITEMGUID = ITEM_MASTER.id
                WHERE hdr.partyguid = $1::INTEGER AND hdr.hoid = $2
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

      const ordersResult = await client.query(fetchOrdersQuery, [partyGuid, hoid]);
      const orders = ordersResult.rows;

      //console.log(orders);

      res.status(200).json({
        message: "Orders retrieved successfully",
        orders: orders,
      });
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
