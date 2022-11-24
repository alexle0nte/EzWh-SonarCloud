"use strict";

const sqlite = require("sqlite3");
const crypto = require("crypto");
const fs = require("fs");

const DAOSKU = require("./DAOSKU");
const DAORestockOrder = require("./DAORestockOrder");
const DAOReturnOrder = require("./DAOReturnOrder");
const DAOSKUItem = require("./DAOSKUItem");
const DAOPosition = require("./DAOPosition");
const DAOUser = require("./DAOUser");
const DAOItem = require("./DAOItem");
const DAOInternalOrder = require("./DAOInternalOrder");
const DAOTestDescriptor = require("./DAOTestDescriptor");
const DAOTestResult = require("./DAOTestResult");

const path = "DB.sqlite";

async function createDB() {
  const SQL = fs.readFileSync("./dbschema.sql", "ascii");

  const db = new sqlite.Database(path, (err) => {
    if (err) throw err;
  });

  await db.exec(SQL, function (err) {
    if (err) console.log(err);
  });

  db.close();
}

async function main() {
  if (!fs.existsSync(path)) {
    console.log("The database does not exists");
    console.log("Initializing the database");
    console.log("Only default user are now available\n\n");
    await createDB();
  }
}

main();

class DAO {
  constructor() {
    this.db = new sqlite.Database(path, (err) => {
      if (err) throw err;
    });
    this.hash = crypto.getHashes();
  }

  /********************************************************************
   *              SKU
   *******************************************************************/

  DBinsertSKU = DAOSKU.DBinsertSKU;
  DBallSKUs = DAOSKU.DBallSKUs;
  DBmodifySKU = DAOSKU.DBmodifySKU;
  DBdeleteSKU = DAOSKU.DBdeleteSKU;
  DBmodifySKUPosition = DAOSKU.DBmodifySKUPosition;
  DBdecreaseSKUAvailableQuantity = DAOSKU.DBdecreaseSKUAvailableQuantity;
  DBincreaseSKUAvailableQuantity = DAOSKU.DBincreaseSKUAvailableQuantity;
  DBdeleteAllSKU = DAOSKU.DBdeleteAllSKU;

  /********************************************************************
   *              SKUItem
   *******************************************************************/

  DBinsertSKUItem = DAOSKUItem.DBinsertSKUItem;
  DBallSKUItems = DAOSKUItem.DBallSKUItems;
  DBmodifySKUItem = DAOSKUItem.DBmodifySKUItem;
  DBdeleteSKUItem = DAOSKUItem.DBdeleteSKUItem;
  DBgetSKUItemFIFO = DAOSKUItem.DBgetSKUItemFIFO;
  DBmodifySKUItemAssociation = DAOSKUItem.DBmodifySKUItemAssociation;
  DBmodifySKUItemAvailability = DAOSKUItem.DBmodifySKUItemAvailability;
  DBdeleteAllSKUItems = DAOSKUItem.DBdeleteAllSKUItems;

  /********************************************************************
   *              POSITIONS
   *******************************************************************/
  DBAllPositions = DAOPosition.DBAllPositions;
  DBinsertPosition = DAOPosition.DBinsertPosition;
  DBmodifyPosition = DAOPosition.DBmodifyPosition;
  DBdeletePosition = DAOPosition.DBdeletePosition;
  DBdeleteAllPositions = DAOPosition.DBdeleteAllPositions;

  /********************************************************************
   *              USER
   *******************************************************************/

  DBgetUserByUsernameType = DAOUser.DBgetUserByUsernameType;
  DBallUsers = DAOUser.DBallUsers;
  DBcheckCredentials = DAOUser.DBcheckCredentials;
  DBdeleteUser = DAOUser.DBdeleteUser;
  DBgetUserbyId = DAOUser.DBgetUserbyId;
  DBinsertUser = DAOUser.DBinsertUser;
  DBmodifyUser = DAOUser.DBmodifyUser;
  DBdeleteAllUsers = DAOUser.DBdeleteAllUsers;

  /********************************************************************
   *              INTERNAL ORDER
   *******************************************************************/

  DBinsertInternalOrder = DAOInternalOrder.DBinsertInternalOrder;
  DBallInternalOrders = DAOInternalOrder.DBallInternalOrders;
  DBgetInternalOrderbyID = DAOInternalOrder.DBgetInternalOrderbyID;
  DBmodifyInternalOrderState = DAOInternalOrder.DBmodifyInternalOrderState;
  DBdeleteInternalOrder = DAOInternalOrder.DBdeleteInternalOrder;
  DBdeleteAllInternalOrders = DAOInternalOrder.DBdeleteAllInternalOrders;
  DBinsertInternalOrderProduct = DAOInternalOrder.DBinsertInternalOrderProduct;
  DBgetInternalOrderProductsByID =
    DAOInternalOrder.DBgetInternalOrderProductsByID;
  DBdeleteInternalOrderProducts =
    DAOInternalOrder.DBdeleteInternalOrderProducts;
  DBdeleteAllInternalOrderProducts =
    DAOInternalOrder.DBdeleteAllInternalOrderProducts;

  /********************************************************************
   *              ITEMS
   *******************************************************************/

  DBallItems = DAOItem.DBallItems;
  DBitemByIdSupplier = DAOItem.DBitemByIdSupplier;
  DBinsertItem = DAOItem.DBinsertItem;
  DBmodifyItemByIdSupplierId = DAOItem.DBmodifyItemByIdSupplierId;
  DBdeleteItemByIdSupplierId = DAOItem.DBdeleteItemByIdSupplierId;
  DBdeleteAllItems = DAOItem.DBdeleteAllItems;

  /********************************************************************
   *              RESTOCK ORDER
   *******************************************************************/

  DBinsertRestockOrder = DAORestockOrder.DBinsertRestockOrder;
  DBallRestockOrders = DAORestockOrder.DBallRestockOrders;
  DBallRestockOrdersByState = DAORestockOrder.DBallRestockOrdersByState;
  DBgetRestockOrderByID = DAORestockOrder.DBgetRestockOrderByID;
  DBmodifyRestockOrderState = DAORestockOrder.DBmodifyRestockOrderState;
  DBaddSKUItemToRestockOrder = DAORestockOrder.DBaddSKUItemToRestockOrder;
  DBaddtransportNote = DAORestockOrder.DBaddtransportNote;
  DBdeleteRestockOrder = DAORestockOrder.DBdeleteRestockOrder;
  DBdeleteAllRestockOrders = DAORestockOrder.DBdeleteAllRestockOrders;

  /********************************************************************
   *              RETURN ORDER
   *******************************************************************/

  DBinsertReturnOrder = DAOReturnOrder.DBinsertReturnOrder;
  DBallReturnOrders = DAOReturnOrder.DBallReturnOrders;
  DBgetReturnOrderByID = DAOReturnOrder.DBgetReturnOrderByID;
  DBdeleteReturnOrder = DAOReturnOrder.DBdeleteReturnOrder;
  DBdeleteAllReturnOrders = DAOReturnOrder.DBdeleteAllReturnOrders;

  /********************************************************************
   *              TEST DESCRIPTOR
   *******************************************************************/

  DBinsertTestDescriptor = DAOTestDescriptor.DBinsertTestDescriptor;
  DBallTestDescriptors = DAOTestDescriptor.DBallTestDescriptors;
  DBmodifyTestDescriptor = DAOTestDescriptor.DBmodifyTestDescriptor;
  DBdeleteTestDescriptor = DAOTestDescriptor.DBdeleteTestDescriptor;
  DBdeleteAllTestDescriptors = DAOTestDescriptor.DBdeleteAllTestDescriptors;

  /********************************************************************
   *              TEST RESULT
   *******************************************************************/

  DBinsertTestResult = DAOTestResult.DBinsertTestResult;
  DBallTestResults = DAOTestResult.DBallTestResults;
  DBmodifyTestResult = DAOTestResult.DBmodifyTestResult;
  DBdeleteTestResult = DAOTestResult.DBdeleteTestResult;
  DBdeleteAllTestResults = DAOTestResult.DBdeleteAllTestResults;
}

const dao = new DAO();
module.exports = dao;
