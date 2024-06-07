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

// Function to obtain hoid from qbe_companymaster table
const getHoid = async (sourceGuid, client) => {
  const hoidQuery = `
    SELECT hoid, id
    FROM qbe_companymaster
    WHERE sourceguid = $1
  `;

  const hoidResult = await client.query(hoidQuery, [sourceGuid]);
  console.log()
  return {
    hoid: hoidResult.rows[0].hoid,
    srcid: hoidResult.rows[0].id,
  };
};

// Express Router
route.post("/", async (req, res) => {
  const client = await pool.connect();
  //const transaction = await client.query("BEGIN");

  try {
    const sourceGuid = req.body.CompanyGuid;
    const fullExport = req.body.FullExport;
    const StockData  = req.body.StockData;

    // Step 1: Obtain hoid from qbe_companymaster table
    const results = await getHoid(sourceGuid, client);

    const hoid = results.hoid, srcid = results.srcid;

    // Step 2: Handle fullExport
    if (fullExport === 1) {
      // Update existing rows with active_flag = 1
      const updateActiveFlagQuery = `
        UPDATE qbe_stockbalance
        SET active_flag = 0
        WHERE srcid = $1;
      `;
      await client.query(updateActiveFlagQuery, [srcid]);
    }

    // Step 3: Create a temporary table
    const createTempTableQuery = `
      CREATE TEMPORARY TABLE temp_stockbalance (
        id serial primary key,
        hoid integer,
        srcid integer,
        closingbalqty numeric,
        sourceguid text,
        mrpmasterguid text
      );
    `;
    await client.query(createTempTableQuery);

    // Step 4: Insert stock data into the temporary table
    const insertTempTableQuery = `
      INSERT INTO temp_stockbalance (
        hoid, srcid, closingbalqty, sourceguid, mrpmasterguid
      ) VALUES ($1, $2, $3, $4, $5);
    `;

    for (const stockItem of StockData) {
      const stockInsertValues = [
        hoid,
        srcid,
        stockItem.ClosingBalQty,
        sourceGuid,
        stockItem.MrpMasterGuid,
      ];

      await client.query(insertTempTableQuery, stockInsertValues);
    }

    // Step 5: Perform bulk insert from temporary table to qbe_stockbalance
    const bulkInsertQuery = `
      INSERT INTO qbe_stockbalance (
        hoid, srcid, closingbalqty, sourceguid, mrpmasterguid
      )
      SELECT hoid, srcid, closingbalqty, sourceguid, mrpmasterguid
      FROM temp_stockbalance
      ON CONFLICT (srcid, mrpmasterguid) DO UPDATE
      SET
        closingbalqty = EXCLUDED.closingbalqty
    `;
    await client.query(bulkInsertQuery);

    // Step 6: Delete the temporary table
    const dropTempTableQuery = `DROP TABLE temp_stockbalance;`;
    await client.query(dropTempTableQuery);

    await client.query("COMMIT");
    res.status(200).json({
      status: 200,
      message: "Stock Balance inserted successfully",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ status: 500, message: err.message });
  } finally {
    // Release the database connection
    client.release();
  }
});

module.exports = route;
