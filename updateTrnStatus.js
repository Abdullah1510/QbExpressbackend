const express = require("express");
const route = express.Router();
const { Pool } = require("pg");
require("dotenv").config();
const os = require("os");
const fs = require("fs");
const path = require("path");

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
    const { SourceGUID, updateTrns } = req.body;

    const client = await pool.connect();
    const directoryPath = path.join(__dirname, "invoices", "global");
     // Create the directory if it doesn't exist
     if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
      }
      
    try {
      for (const update of updateTrns) {
        console.log(update);
        if (update.newStatus === "I") {
          const { vchNo, invrefid, invoiceno, invoice_date,invoice_PDFData,newStatus } = update;
          const updateQuery = `UPDATE qbe_trn_hdr 
                               SET invoice_date = $1, invrefid = $2, invoiceno = $3,order_status=$6 
                               WHERE vch_no = $4 AND sourceguid = $5`;
          const values = [invoice_date, invrefid, invoiceno, vchNo, SourceGUID, newStatus];
          console.log("Values",values);

          await client.query(updateQuery, values);
          // Write the PDF file
          const pdffilename = `${invrefid}.pdf`; // Assuming invrefid is the unique identifier for the invoice
          const pdfpath = path.join(directoryPath, pdffilename);
          if(fs.existsSync(pdfpath))
          {
            fs.unlink(pdfpath);
          }
          const writeStream = fs.createWriteStream(pdfpath);
          writeStream.write(Buffer.from(invoice_PDFData, "base64"));
          writeStream.end();         
          
        }
        else{
           const { vchNo, invrefid, invoiceno, invoice_date, newStatus } = update; 
            const updateQuery = `UPDATE qbe_trn_hdr 
                        SET order_status = $1 
                        WHERE vch_no = $2 AND sourceguid = $3`;
            const values = [newStatus, vchNo, SourceGUID]; 
            console.log("Values",values);
            console.log(newStatus);
           await client.query(updateQuery, values);
          }
          
        
      }

      res.status(200).json({
        status: 200,
        message: "Order statuses updated successfully",
      });
    } finally {
      await client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 500, message: err.message });
  }
});

module.exports = route;
