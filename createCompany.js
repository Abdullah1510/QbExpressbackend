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

// Express Router// ... (other imports and configurations)

route.post("/", async (req, res) => {
  try {
    const client = await pool.connect();

    const sourceguid = req.body.CompanyGuid;
    const hoguid = req.body.HOGuid;
    const compname = req.body.CompanyName;
    const syncID = req.body.syncID;
    const HOsyncID = req.body.HOSyncID;
    const productkey = req.body.ProductKey;
    const mobileappsubkey = req.body.MobileAppSubKey;
    const enddate = req.body.SubscriptionEndDate;
    const al1 = req.body.AddressLine1;
    const al2 = req.body.AddressLine2;
    const al3 = req.body.AddressLine3;
    const city = req.body.City;
    const state = req.body.State;
    const country = req.body.Country;
    const pincode = req.body.PinCode;
    const gstin = req.body.GSTIN;
    const mobileappname = req.body.MobileAppName;
    const mobileapplogo = req.body.MobileAppLogo;

    const servicearea = req.body.Service_Area;
    //console.log(servicearea);

    let hoid,
      activeflag = 1;

    // If sourceguid matches hoguid, generate a new hoid
    if (sourceguid === hoguid) {
      await client.query(
        `INSERT INTO qbe_companymaster (sourceguid, compname, isho, syncid, hosyncid, productkey, 
                      mobileappsubkey, enddate, activeflag, hoguid, addressline1, addressline2, 
                      addressline3, city, state, country, pincode, gstin, mobileappname, mobileapplogo, service_area) 
        
                      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21) 
                      ON CONFLICT (sourceguid) DO UPDATE SET 
                        compname = $2,
                        isho = true,
                        syncid = $4,
                        hosyncid = $5,
                        productkey = $6,
                        mobileappsubkey = $7,
                        enddate = $8,
                        activeflag = $9,
                        hoguid = $10,
                        addressline1 = $11,
                        addressline2 = $12,
                        addressline3 = $13,
                        city = $14,
                        state = $15,
                        country = $16,
                        pincode = $17,
                        gstin = $18,
                        mobileappname = $19,
                        mobileapplogo = $20,
                        service_area = $21
                    `,
        [
          sourceguid,
          compname,
          true,
          syncID,
          HOsyncID,
          productkey,
          mobileappsubkey,
          enddate,
          activeflag,
          hoguid,
          al1,
          al2,
          al3,
          city,
          state,
          country,
          pincode,
          gstin,
          mobileappname,
          mobileapplogo,
          JSON.stringify(servicearea),
        ]
      );

      const result = await client.query(
        "SELECT id FROM qbe_companymaster WHERE sourceguid = $1",
        [sourceguid]
      );
      
      if (result.rows.length > 0) {
        hoid = result.rows[0].id; 
      }

      const hoUpdateResult = await client.query(
        `UPDATE qbe_companymaster SET hoid = $1 where sourceguid = $2`,
        [hoid, sourceguid]
      );
      
    } else {
      // If sourceguid does not match hoguid, fetch corresponding hoid for the hoguid        

      const result = await client.query(
        "SELECT hoid FROM qbe_companymaster WHERE hoguid = $1",
        [hoguid]
      );

      if (result.rows.length > 0) {
      hoid = result.rows[0].hoid;      
      }
      else
      {
        return res.status(200).json({
          status: 201,
          message: "HO details not found !!",
          hoid: null, // or any default value you want to send
        });
      }
      
      // If sourceguid does not match hoguid, insert or update based on conflict
      await client.query(
        `INSERT INTO qbe_companymaster (sourceguid, compname, isho, syncid, hosyncid, productkey, 
                      mobileappsubkey, enddate, activeflag, hoguid, addressline1, addressline2, 
                      addressline3, city, state, country, pincode, gstin, mobileappname, mobileapplogo, service_area) 
        
                      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21) 
                      ON CONFLICT (sourceguid) DO UPDATE SET 
                        compname = $2,
                        isho = false,
                        syncid = $4,
                        hosyncid = $5,
                        productkey = $6,
                        mobileappsubkey = $7,
                        enddate = $8,
                        activeflag = $9,
                        hoguid = $10,
                        addressline1 = $11,
                        addressline2 = $12,
                        addressline3 = $13,
                        city = $14,
                        state = $15,
                        country = $16,
                        pincode = $17,
                        gstin = $18,
                        mobileappname = $19,
                        mobileapplogo = $20,
                        service_area = $21
                    `,
        [
          sourceguid,
          compname,
          false,
          syncID,
          HOsyncID,
          productkey,
          mobileappsubkey,
          enddate,
          activeflag,
          hoguid,
          al1,
          al2,
          al3,
          city,
          state,
          country,
          pincode,
          gstin,
          mobileappname,
          mobileapplogo,         
          JSON.stringify(servicearea),
        ]
      );
      const hoUpdateResult = await client.query(
        `UPDATE qbe_companymaster SET hoid = $1 where sourceguid = $2`,
        [hoid, sourceguid]
      );
    }

    const control_no = 1;

    await client.query(
      `INSERT INTO qbe_vch_control (sourceguid, hoid, control_no, active_flag)
      VALUES ($1, $2, $3, $4)`,
      [sourceguid, hoid, control_no, activeflag]
    );

    res.status(200).json({
      status: 200,
      message: "Company inserted or updated successfully",
      hoid,
    });

    client.release(); // Release the database connection
  } catch (err) {
    console.log(err);
    console.error(err);
    res.status(500).json({ status: 500, message: err.message });
  }
});

module.exports = route;
