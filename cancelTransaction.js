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

    const { vchNo, sourceGuid, partyGuid, remarks } = req.body;

    try {
      // Check if the order status is "Pending" before updating to "Cancelled"
      const checkStatusQuery = {
        text: "SELECT order_status FROM qbe_trn_hdr WHERE vch_no = $1 AND sourceguid = $2 AND partyguid = $3",
        values: [vchNo, sourceGuid, partyGuid],
      };

      const checkStatusResult = await client.query(checkStatusQuery);

      if (checkStatusResult.rows.length === 0) {
        res.status(404).json({
          message: "Order not found. Unable to update status.",
        });
        return;
      }

      const currentStatus = checkStatusResult.rows[0].order_status;

      //   if (currentStatus == "Confirmed") {
      //     res.status(206).json({
      //         message: "Order has already been cancelled!",
      //     });
      //     return;
      //   }

      if (currentStatus !== "P" || currentStatus == "C") {
        //console.log("Order Cancellation Failure");
        res.status(208).json({
          message:
            "Order has already been confirmed. Please call the store for further details.",
        });
        //console.log("Order Cancellation Failure Message sent");
        return;
      } else {
        const updateQuery = {
          text: "UPDATE qbe_trn_hdr SET order_status = $1, addl_remarks = $5 WHERE vch_no = $2 AND sourceguid = $3 AND partyguid = $4",
          values: ["Cancelled", vchNo, sourceGuid, partyGuid, remarks],
        };

        const updateResult = await client.query(updateQuery);

        if (updateResult.rowCount > 0) {
          console.log("Order cancelled successfully");
          res.status(200).json({
            message: "Order has been cancelled!",
          });
        } else {
          res.status(404).json({
            message: "Order not found. Unable to update status.",
          });
        }
      }
    } finally {
      // Release the database connection
      await client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = route;
