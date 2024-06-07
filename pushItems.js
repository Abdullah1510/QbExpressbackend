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
    SELECT hoid
    FROM qbe_companymaster
    WHERE sourceguid = $1
  `;

  const hoidResult = await client.query(hoidQuery, [sourceGuid]);
  return hoidResult.rows[0].hoid;
};

// Express Router
route.post("/", async (req, res) => {
  try {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const { ItemData } = req.body;
      const sourceGuid = req.body.CompanyGuid;
      const activeFlag = 1;
      const flag = 0;

      // Obtain HOId using the getHoid function
      const hoid = await getHoid(sourceGuid, client);

      // Create a temporary table
      const createTempTableQuery = `
        CREATE TEMPORARY TABLE temp_qbe_itemmaster (
          id serial primary key,
          hoid integer,
          sourceid text NOT NULL,
          stocknumber text NOT NULL,
          itemdescription text,
          class1guid text,
          class2guid text,
          class3guid text,
          class4guid text,
          class5guid text,
          uom text,
          alias1 text,
          alias2 text,
          alias3 text,
          alias4 text,
          alias5 text ,
          activeflag smallint,
          flag smallint,
          mrpmasterguid text UNIQUE NOT NULL,
          pricemasterguid text NOT NULL,
          mrp numeric,
          item_rate numeric,
          itemguid text 
        );
      `;
      await client.query(createTempTableQuery);

      // Insert into temporary table
      const insertTempTableQuery = `
        INSERT INTO temp_qbe_itemmaster (
          hoid, sourceid, stocknumber, itemdescription, class1guid,
          class2guid, class3guid, class4guid, class5guid, uom,
          alias1, alias2, alias3, alias4, alias5,
          activeflag, flag, mrpmasterguid, pricemasterguid, mrp,
          item_rate, itemguid
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
          $21, $22
        )
      `;

      for (const item of ItemData) {
        const itemInsertValues = [
          hoid,
          sourceGuid,
          item.StockNumber,
          item.ItemDescription,
          item.Class1Name,
          item.Class2Name,
          item.Class3Name,
          item.Class4Name,
          item.Class5Name,
          item.UOM,
          item.Alias1,
          item.Alias2,
          item.Alias3,
          item.Alias4,
          item.Alias5,
          activeFlag,
          flag,
          item.MrpMasterGuid,
          item.PriceMasterGuid,
          item.MRP,
          item.SellingRate,
          item.itemguid,
        ];

        await client.query(insertTempTableQuery, itemInsertValues);
      }

      // Perform bulk insert from temporary table to qbe_itemmaster with conflict resolution
      const bulkInsertQuery = `
        INSERT INTO qbe_itemmaster (
          hoid, sourceid, stocknumber, itemdescription, class1guid,
          class2guid, class3guid, class4guid, class5guid, uom,
          alias1, alias2, alias3, alias4, alias5,
          activeflag, flag, mrpmasterguid, pricemasterguid, mrp,
          item_rate, itemguid
        )
        SELECT 
          hoid, sourceid, stocknumber, itemdescription, class1guid,
          class2guid, class3guid, class4guid, class5guid, uom,
          alias1, alias2, alias3, alias4, alias5,
          activeflag, flag, mrpmasterguid, pricemasterguid, mrp,
          item_rate, itemguid
        FROM temp_qbe_itemmaster
        ON CONFLICT (mrpmasterguid) DO UPDATE
        SET 
          stocknumber = EXCLUDED.stocknumber,
          itemdescription = EXCLUDED.itemdescription,
          class1guid = EXCLUDED.class1guid,
          class2guid = EXCLUDED.class2guid,
          class3guid = EXCLUDED.class3guid,
          class4guid = EXCLUDED.class4guid,
          class5guid = EXCLUDED.class5guid,
          uom = EXCLUDED.uom,
          alias1 = EXCLUDED.alias1,
          alias2 = EXCLUDED.alias2,
          alias3 = EXCLUDED.alias3,
          alias4 = EXCLUDED.alias4,
          alias5 = EXCLUDED.alias5,
          activeflag = EXCLUDED.activeflag,
          flag = EXCLUDED.flag,
          pricemasterguid = EXCLUDED.pricemasterguid,
          mrp = EXCLUDED.mrp,
          item_rate = EXCLUDED.item_rate,
          itemguid = EXCLUDED.itemguid;
      `;
      await client.query(bulkInsertQuery);

      // Drop the temporary table
      const dropTempTableQuery = `DROP TABLE temp_qbe_itemmaster;`;
      await client.query(dropTempTableQuery);

      await client.query("COMMIT");
      res.status(200).json({
        message: "Items inserted and / or updated successfully",
      });
    } catch (error) {
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
