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
    const {
      hoid,
      partyGuid,
      partyAddressGuid,
      vchDate,
      //invoiceDate, --From QB
      totQty,
      totValue,
      totDisc,
      totItemLevelDisc,
      netBillValue,
      expDelDate,
      orderCreationDateTime,
      //invRefID, --From QB
      //activeFlag, --From QB
      sourceGuid,
      vchType,
      //vchTypeGuid,
      //vchNo,
      orderStatus,
      remarks,
      addlRemarks,
      //invoiceNo,
      items,
      srcid,
    } = req.body;

    // Begin a transaction
    await client.query("BEGIN");

    // This part is a placeholder to generate the voucher Number. Soem changes are imminent.

    //const vcno = Math.floor(Math.random() * 1000);

    //const vchNo = `${sourceGuid}-D/${vcno}`;

    // Until here

    try {
      // Single query to retrieve and update the voucher control number
      const controlUpdateQuery = `
        UPDATE qbe_vch_control
        SET control_no = control_no + 1
        WHERE SourceGUID = $1 --AND hoid = $2
        RETURNING control_no;
        `;

      const controlResult = await client.query(controlUpdateQuery, [
        sourceGuid,
        //hoid,
      ]);

      let controlNo; // Default starting control number

      if (controlResult.rows.length > 0) {
        // If a record exists for the sourceGuid and hoid, use the returned control number
        controlNo = controlResult.rows[0].control_no;
      }

      // Generate the voucher number using the current control number
      const vchNo = `M/${controlNo}`;

      // Insert into qbe_trn_hdr table
      const hdrInsertQuery = `
        INSERT INTO qbe_trn_hdr (
          PartyGUID, PartyAddressGUID, HOID, Vch_Date, Tot_Qty, Tot_Value,
          Tot_Disc, Tot_ItemLevel_Disc, Net_Bill_Value, Exp_Del_Date, Order_Creation_DateTime,
          SourceGUID, VchType, Vch_No, Order_Status, Remarks, Addl_Remarks, srcid
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
        ) RETURNING Hdr_ID;
      `;

      const hdrInsertValues = [
        partyGuid,
        partyAddressGuid,
        hoid,
        vchDate,
        totQty,
        totValue,
        totDisc,
        totItemLevelDisc,
        netBillValue,
        expDelDate,
        orderCreationDateTime,
        sourceGuid,
        vchType,
        vchNo,
        orderStatus,
        remarks,
        addlRemarks,
        srcid,
      ];

      const hdrResult = await client.query(hdrInsertQuery, hdrInsertValues);
      const hdrID = hdrResult.rows[0].hdr_id;

      // Insert into qbe_trn_dtls table for each item in the transaction
      const dtlsInsertQuery = `
        INSERT INTO qbe_trn_dtls (
          Order_Hdr_guid, HOID, Sl_no, ItemGUID, Trans_Qty, Item_Rate, Item_Value,
          Disc_Perc, Disc_Amt, Disc_flag, Item_Net_Value, SourceGUID,
          BatchNo, MRPMasterGUID, PriceMasterGUID, UoM, Disc_GUID, VchType, srcid
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
        );
      `;

      for (const item of items) {
        const dtlsInsertValues = [
          hdrID,
          hoid,
          item.slNo,
          item.itemGuid,
          item.transQty,
          item.itemRate,
          item.itemValue,
          item.discPerc,
          item.discAmt,
          item.discFlag,
          item.itemNetValue,
          item.sourceGuid,
          item.batchNo,
          item.mrpMasterGuid,
          item.priceMasterGuid,
          item.uom,
          item.discGuid,
          vchType,
          srcid,
        ];

        await client.query(dtlsInsertQuery, dtlsInsertValues);
      }

      // Commit the transaction
      await client.query("COMMIT");

      res.status(200).json({
        message: "Transaction details inserted successfully",
        hdrID: hdrID,
      });
    } catch (error) {
      // Rollback the transaction in case of an error
      await client.query("ROLLBACK");
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
