const express = require("express");
const bodyParser = require("body-parser");
const getCompany = require("./getCompany");
const getItem = require("./getItem");
const getMRP = require("./getMRP");
const fetchItems = require("./fetchItems");
const createCustomer = require("./createCustomer");
const authenticateUser = require("./authenticateUser");
const createAddress = require("./createAddress");
const createTransaction = require("./createTransaction");
const updateStock = require("./updateStock");
const fetchClasses = require("./fetchClasses");
const updateTrnStatus = require("./updateTrnStatus");
const fetchUserInfo = require("./fetchUserInfo");
const deleteAddress = require("./deleteAddress");
const pushItems = require("./pushItems");
const fetchTransactions = require("./fetchTransactions");
const pullTransactions = require("./pullTransactions");
const cancelTransaction = require("./cancelTransaction");
const createCompany = require("./createCompany");
const searchCompany = require("./searchCompany");
const uploadImages = require("./uploadImages");
const createCustomers = require("./createCustomers");
const createWishlist = require("./createWishlist");
const fetchWishlistItems = require("./fetchWishllistItems");

const fetchServiceArea = require("./fetchServiceArea");
const fetchSystemConfig = require("./fetchSystemConfig");

const app = express();
const http = require("http").Server(app);
app.use(bodyParser.json({ limit: "512mb", extended: true }));

app.use("/getCompany", getCompany);
app.use("/getItems", getItem);
app.use("/getMRP", getMRP);
app.use("/createCompany", createCompany);
app.use("/searchCompany", searchCompany);

app.use("/createCustomer", createCustomer);
app.use("/authenticateUser", authenticateUser);
app.use("/createAddress", createAddress);

app.use("/updateStock", updateStock);
app.use("/fetchClasses", fetchClasses);
app.use("/updateTrnStatus", updateTrnStatus);
app.use("/fetchUserInfo", fetchUserInfo);
app.use("/deleteAddress", deleteAddress);

app.use("/createTransaction", createTransaction);
app.use("/cancelTransaction", cancelTransaction);
app.use("/fetchTransactions", fetchTransactions);
app.use("/pullTransactions", pullTransactions);

app.use("/fetchItems", fetchItems);
app.use("/pushItems", pushItems);

app.use("/uploadImages", uploadImages);
app.use("/fetchServiceArea", fetchServiceArea);
app.use("/fetchSystemConfig", fetchSystemConfig);
app.use("/createCustomers", createCustomers);
app.use("/createWishlist",createWishlist);
app.use("/fetchWishlistItems",fetchWishlistItems);

app.use("/images", express.static("images"));
app.use("/invoices", express.static("invoices"));


http.listen(5005, () => {
  console.log("Server is running...");
});
