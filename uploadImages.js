const express = require("express");
const route = express.Router();
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
require("dotenv").config();

// Configure PostgreSQL pool
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  ssl: false,
});

route.post("/", async (req, res) => {
  try {
    const client = await pool.connect();

    // Get sourceguid and hoguid from the request body
    const sourceguid = req.body.CompanyGuid;
    const hoguid = req.body.HOGuid;
    const { images } = req.body;

    // Validate that images is provided and is an array
    if (!Array.isArray(images) || images.length === 0) {
      client.release();
      return res
        .status(400)
        .json({ status: "error", message: "Invalid or empty images array" });
    }

    // Fetch hoid from qbe_companymaster using sourceguid
    const companyResult = await client.query(
      "SELECT hoid FROM qbe_companymaster WHERE sourceguid = $1",
      [sourceguid]
    );

    if (companyResult.rows.length === 0) {
      client.release();
      return res.status(404).json({
        status: "error",
        message: "Company not found with the provided sourceguid",
      });
    }

    const hoid = companyResult.rows[0].hoid;

    // ...

    // ...

    // Process each image in the array
    const uploadedImages = [];
    for (const imageObj of images) {
      // Destructure imageObj to get type, guid, base64Image
      const { type, guid, base64Image } = imageObj;

      let subFolder = "";
      let imageColumn = ""; // Added a variable to store the image column name

      // Check type and set subFolder and imageColumn accordingly
      if (type === "Class1") {
        subFolder = "Class1";
        imageColumn = "class1image";
        updColumn = "class1guid";
      } else if (type === "Class2") {
        subFolder = "Class2";
        imageColumn = "class2image";
        updColumn = "class2guid";
      } else if (type === "SKU" && /^\d{13}$/.test(guid)) {
        subFolder = "global";
        imageColumn = "image";
        updColumn = "mrpmasterguid";
      } else {
        subfolder = "local";
        imageColumn = "image";
        updColumn = "mrpmasterguid";
      }

      // Validate GUID format
      const folder =
        subFolder === "global"
          ? "global"
          : path.join("local", hoid.toString(), subFolder);

      // Decode the base64 image to a Buffer
      const imageBuffer = Buffer.from(base64Image, "base64");

      // Generate a filename based on guid and fileType
      const filename = `${guid}.png`; // Always use "png" as per your code

      // Specify the directory path where you want to save the image
      const directoryPath = path.join(__dirname, "images", folder);

      // Create the directory if it doesn't exist
      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
      }

      // Specify the path where you want to save the image
      const imagePath = path.join(directoryPath, filename);

      const savePath = path.join(folder, filename);
      //console.log(savePath);

      // Create a writable stream and pipe the image buffer to the stream
      const writeStream = fs.createWriteStream(imagePath);
      writeStream.write(imageBuffer);
      writeStream.end();

      // Add the uploaded image information to the array
      uploadedImages.push({ type, imagePath });

      // Updating Item master with URI
      const updateItemMasterQuery = `
    UPDATE qbe_itemmaster 
    SET ${imageColumn} = $1 
    WHERE ${updColumn} = $2 AND hoid = $3
  `;

      await client.query(updateItemMasterQuery, [savePath, guid, hoid]);
    }

    // ...

    client.release();
    // Respond with a success message and the array of uploaded images
    res
      .status(200)
      .json({ status: 200, message: "Successful Upload", uploadedImages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, message: "Failed to upload images" });
  }
});

module.exports = route;
