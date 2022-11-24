"use strict";

const Warehouse = require("./Warehouse/Warehouse");
const User = require("./User");
const Item = require("./Item");
const dao = require("./DAO/DAO");
const InternalOrder = require("./InternalOrders");

class EzWh {
  constructor() {
    this.warehouse = new Warehouse();
  }

  login(username, type, password) {
    return dao.DBcheckCredentials(username, type, password);
  }

  getUserInfoByID(ID) {
    return dao.DBgetUserbyId(parseInt(ID));
  }

  getAllSupliers() {
    return dao
      .DBallUsers()
      .then((users) => users.filter((u) => u.type === "supplier"));
  }

  getAllUsers() {
    return dao
      .DBallUsers()
      .then((users) => users.filter((u) => u.type !== "manager"));
  }

  userExists(username, type) {
    return dao
      .DBgetUserByUsernameType(username, type)
      .then((data) => (data ? true : false));
  }
  deleteUser(username, type) {
    return dao.DBdeleteUser(username, type);
  }

  addUser(userObj) {
    return dao.DBinsertUser(new User(userObj));
  }

  modifyUser(username, oldType, newType) {
    return dao.DBmodifyUser(username, oldType, newType);
  }

  /********************************************************************
   *              INTERNAL ORDER
   *******************************************************************/

  createInternalOrder(issueDate, products, customerID) {
    let SKUQuantity = new Map();
    let SKURFIDs = new Map();

    return Promise.all(products.map((p) => this.warehouse.getSKUbyID(p.SKUId)))
      .then((skus) => {
        if (skus.every((s) => s !== undefined) === false) throw "422";
        return skus;
      })
      .then((skus) =>
        Promise.all(
          skus.map((s) =>
            this.warehouse
              .retrieveInternalOrderProduct(
                s.id,
                products.filter((p) => p.SKUId === s.id)[0].qty
              )
              .then((RFIDs) => {
                SKUQuantity.set(
                  s,
                  products.filter((p) => p.SKUId === s.id)[0].qty
                );
                SKURFIDs.set(s, RFIDs);
              })
          )
        )
      )
      .then(() => dao.DBinsertInternalOrder(issueDate, "ISSUED", customerID))
      .then((id) =>
        dao
          .DBgetInternalOrderbyID(id)
          .then((internalOrder) =>
            SKUQuantity.forEach((value, key) =>
              dao.DBinsertInternalOrderProduct(
                internalOrder.id,
                key,
                value,
                SKURFIDs.get(key)
              )
            )
          )
          .then(() => id)
      );
  }

  deleteInternalOrder(id) {
    return this.modifyInternalOrderState(id, "CANCELED")
      .then(() => dao.DBdeleteInternalOrder(id))
      .then(() => dao.DBdeleteInternalOrderProducts(id))
      .catch((err) => {
        if (err !== "404") throw err;
      });
  }

  getInternalOrders() {
    return dao.DBallInternalOrders().then((internalOrders) =>
      Promise.all(
        internalOrders.map(async (internalOrder) => {
          const products = await dao.DBgetInternalOrderProductsByID(
            internalOrder.id
          );
          return new InternalOrder(
            internalOrder.id,
            internalOrder.issueDate,
            internalOrder.state,
            products.SKUQuantity,
            products.SKURFIDs,
            internalOrder.customerID
          );
        })
      )
    );
  }

  getInternalOrderByID(id) {
    return this.getInternalOrders()
      .then(
        (internalOrders) =>
          internalOrders.filter(
            (internalOrder) => internalOrder.id === parseInt(id)
          )[0]
      )
      .then((internalOrder) => {
        if (internalOrder === undefined) throw "404";
        else return internalOrder;
      });
  }

  getInternalOrdersByState(state) {
    return this.getInternalOrders().then((internalOrders) =>
      internalOrders.filter((internalOrder) => internalOrder.state === state)
    );
  }

  modifyInternalOrderState(id, newState, RFIDs = undefined) {
    return this.getInternalOrderByID(id).then((internalOrder) => {
      if (internalOrder === undefined) throw "404";
      else {
        if (newState === "ACCEPTED" || newState === "ISSUED") {
          return dao.DBmodifyInternalOrderState(id, newState);
        } else if (newState === "REFUSED" || newState === "CANCELED") {
          return this.getInternalOrderByID(id)
            .then((internalOrder) =>
              Promise.all(
                Array.from(internalOrder.SKUQuantity.entries()).map((e) =>
                  this.warehouse.removeInternalOrderProduct(e[0].id, e[1])
                )
              ).then(() => internalOrder)
            )
            .then((internalOrder) => {
              let listRFIDs = Array.from(
                internalOrder.SKURFIDs.values()
              ).flat();
              return Promise.all(
                listRFIDs.map((rfid) => dao.DBmodifySKUItemAssociation(rfid, 0))
              );
            })
            .then(() => dao.DBmodifyInternalOrderState(id, newState));
        } else if (newState === "COMPLETED") {
          return dao
            .DBmodifyInternalOrderState(id, newState)
            .then(() =>
              Promise.all(
                RFIDs.map((rfid) => dao.DBmodifySKUItemAvailability(rfid, 0))
              )
            );
        }
      }
    });
  }

  /********************************************************************
   *              TEST DESCRIPTOR
   *******************************************************************/

  getTestDescriptors() {
    return dao.DBallTestDescriptors();
  }

  getTestDescriptorByID(TestDescID) {
    return this.getTestDescriptors().then(
      (testDescriptors) =>
        testDescriptors.filter((td) => td.id === parseInt(TestDescID))[0]
    );
  }

  createTestDescriptor(name, procedureDescription, SKUID) {
    return this.warehouse.getSKUbyID(SKUID).then((sku) => {
      if (sku === undefined) throw "404";
      return dao.DBinsertTestDescriptor(name, procedureDescription, sku.id);
    });
  }

  modifyTestDescriptor(TestDescID, newName, newProcedureDescription, newIdSKU) {
    return Promise.all([
      this.getTestDescriptorByID(TestDescID),
      this.warehouse.getSKUbyID(newIdSKU),
    ]).then((values) => {
      for (const v of values) if (v === undefined) throw "404";

      return dao.DBmodifyTestDescriptor(
        TestDescID,
        newName,
        newProcedureDescription,
        newIdSKU
      );
    });
  }

  deleteTestDescriptor(TestDescID) {
    return dao.DBdeleteTestDescriptor(TestDescID);
  }

  /********************************************************************
   *              TEST RESULT
   *******************************************************************/

  getTestResultsByRFID(RFID) {
    return this.warehouse.getSKUItembyRFID(RFID).then((skuItem) => {
      if (skuItem === undefined) throw "404";
      return dao
        .DBallTestResults()
        .then((testResults) =>
          testResults.filter((testResult) => testResult.RFID === RFID)
        );
    });
  }

  getTestResultByIDandRFID(TestRID, RFID) {
    return this.getTestResultsByRFID(RFID)
      .then((testResults) =>
        testResults.filter((testResult) => testResult.id === parseInt(TestRID))
      )
      .then((testResults) => {
        if (testResults.length === 0) throw "404";
        else return testResults[0];
      });
  }

  createTestResult(RFID, IDTestDescriptor, date, result) {
    return Promise.all([
      this.warehouse.getSKUItembyRFID(RFID),
      this.getTestDescriptorByID(IDTestDescriptor),
    ]).then((values) => {
      for (const v of values) if (v === undefined) throw "404";
      return dao.DBinsertTestResult(RFID, result, date, IDTestDescriptor);
    });
  }

  updateTestResult(TestRID, RFID, newResult, newTestDescriptor, newDate) {
    return Promise.all([
      this.warehouse.getSKUItembyRFID(RFID),
      this.getTestDescriptorByID(newTestDescriptor),
      this.getTestResultByIDandRFID(TestRID, RFID),
    ]).then((values) => {
      for (const v of values) if (v === undefined) throw "404";

      return dao.DBmodifyTestResult(
        TestRID,
        RFID,
        newResult,
        newDate,
        newTestDescriptor
      );
    });
  }

  deleteTestResult(TestRID, RFID) {
    return dao.DBdeleteTestResult(TestRID, RFID);
  }
  /********************************************************************
   *              ITEM
   *******************************************************************/

  getAllItems() {
    return dao.DBallItems();
  }

  getItem(id,supplierId){
      return dao.DBitemByIdSupplier(id,supplierId);
  }

  checkItemExists(id, supplierId, SKUId) {
    return this.getAllItems().then((data) =>
      data.length === 0
        ? false
        : data.some(
            (i) =>
              i.supplierId === supplierId && (i.SKUId === SKUId || i.id === id)
          )
    );
  }

  insertNewItem(objectItem) {
    return dao.DBinsertItem(new Item(objectItem));
  }

  modifyItem(id,description, price,supplierId){
      return dao.DBmodifyItemByIdSupplierId(id,supplierId,description,price)
  }

  deleteItem(id,supplierId) {
    return dao.DBdeleteItemByIdSupplierId(id,supplierId);
  }

  /********************************************************************
   *              RESTOCK ORDER
   *******************************************************************/

  getRestockOrders() {
    return dao.DBallRestockOrders();
  }

  getRestockOrdersByState(state) {
    return dao.DBallRestockOrdersByState(state);
  }

  getRestockOrderByID(id) {
    return dao.DBgetRestockOrderByID(id);
  }

  async getReturnItemsRestock(id, bool) {
    let restock = await dao.DBgetRestockOrderByID(id);
    if (restock.state !== "COMPLETEDRETURN")
      return new Promise((resolve, reject) => resolve(null));
    return this.getReturnItems(id, bool);
  }

  async getReturnItems(id, bool) {
    const ResultByRFID = new Map();
    await dao
      .DBgetRestockOrderByID(id)
      .then((restock) => Array.from(restock.item_RFID.values()))
      .then((restockOrder) =>
        restockOrder.map((restockOrder) => restockOrder.rfid)
      )
      .then(async (RFIDS) => {
        for (let rfid of RFIDS) {
          const res = await this.getTestResultsByRFID(rfid)
            .then((tests) => tests.filter((test) => test.result == bool))
            .then((tests) => (tests.length > 0 ? true : false));
          ResultByRFID.set(rfid, res);
        }
      });

    return dao
      .DBgetRestockOrderByID(id)
      .then((restock) => Array.from(restock.item_RFID.values()))
      .then((skuitems) =>
        skuitems.filter((skuitem) => {
          return ResultByRFID.get(skuitem.rfid);
        })
      );
  }

  createRestockOrder(issueDate, products, supplierId) {
    let item_Quantity = new Map();

    return this.getAllItems()
      .then((items) => items.filter((item) => item.supplierId === supplierId))
      .then((items) => {
        products.forEach((p) => {
          // console.log(p);
          // console.log(items);
          const itms = items.filter(
            (item) => item.id === p.itemId && p.SKUId === item.SKUId
          );
          // console.log(itms.length);
          if (itms.length === 0) throw "422";

          item_Quantity.set(
            {
              SKUId: p.SKUId,
              itemId: p.itemId,
              description: p.description,
              price: p.price,
            },
            p.qty
          );
        });
      })
      .then(() =>
        dao.DBinsertRestockOrder(issueDate, "ISSUED", supplierId, item_Quantity)
      );

  }

  async modifyRestockOrderState(id, state) {
    const restock = await dao.DBgetRestockOrderByID(id);
    if (
      (state === "COMPLETED" || state === "COMPLETEDRETURN") &&
      restock.state === "TESTED"
    ) {
      let skuitemok = [];
      let skuitemref = [];
      skuitemok = await this.getReturnItems(id, true);
      skuitemref = await this.getReturnItems(id, false);
      if (skuitemref.length > 0) {
        for (let skuitem of skuitemok) {
          this.warehouse
            .getSKUItembyRFID(skuitem.rfid)
            .then((tmp) =>
              this.warehouse.modifySKUItem(
                tmp.RFID,
                tmp.RFID,
                tmp.available +
                  Array.from(restock.item_Quantity.entries()).filter(
                    (arra) => arra[0].SKUId === skuitem.SKUId
                  )[0][1],
                tmp.dateOfStock
              )
            );
        }
        return dao.DBmodifyRestockOrderState(id, "COMPLETEDRETURN");
      } else {
        for (let skuitem of skuitemok) {
          this.warehouse
            .getSKUItembyRFID(skuitem.rfid)
            .then((tmp) =>
              this.warehouse.modifySKUItem(
                tmp.RFID,
                tmp.RFID,
                tmp.available +
                  Array.from(restock.item_Quantity.entries()).filter(
                    (arra) => arra[0].SKUId === skuitem.SKUId
                  )[0][1],
                tmp.dateOfStock
              )
            );
        }
        return dao.DBmodifyRestockOrderState(id, "COMPLETED");
      }
    } else if (state !== "COMPLETED" && state !== "COMPLETEDRETURN")
      return dao.DBmodifyRestockOrderState(id, state);
    else {
      //console.log("the restock order is not in TESTED state");
      return new Promise((resolve, reject) => resolve(null));
    }
  }

  async addSKUItemToRestockOrder(id, Item_RFID) {
    return dao.DBaddSKUItemToRestockOrder(id, Item_RFID);
  }

  addTransportNote(id, transportNote) {
    return dao.DBaddtransportNote(id, transportNote.deliveryDate);
  }

  deleteRestockOrder(id) {
    return dao.DBdeleteRestockOrder(id);
  }

  /********************************************************************
   *              RETURN ORDER
   *******************************************************************/

  getReturnOrders() {
    return dao.DBallReturnOrders();
  }

  getReturnOrderByID(id) {
    return dao.DBgetReturnOrderByID(id);
  }

  createReturnOrder(returnDate, products, restockOrderId) {
    return dao
      .DBgetRestockOrderByID(restockOrderId)
      .then((data) =>
        data !== null
          ? dao.DBinsertReturnOrder(returnDate, products, restockOrderId)
          : -1
      );
  }

  deleteReturnOrder(id) {
    return dao.DBdeleteReturnOrder(id);
  }
}

module.exports = EzWh;
