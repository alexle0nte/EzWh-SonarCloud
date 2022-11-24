const chai = require("chai");
const SKUItem = require("../modules/Warehouse/SKUItem");
const Item = require("../modules/Item");
const Position = require("../modules/Warehouse/Position");
const EzWh = require("../modules/EzWh");
const chaiHttp = require("chai-http");
const dao = require("../modules/DAO/DAO");
chai.use(chaiHttp);
chai.should();

const ezwh = new EzWh();

const app = require("../server");
const skuitem = require("../api/skuitem");
const { expect } = require("chai");
let agent = chai.request.agent(app);

let skuid1, skuid2, skuid3, skuid4;
let restockOrder;

describe("test Restock Order apis", () => {
  beforeEach(async () => {
    await dao.DBdeleteAllSKU();
    await dao.DBdeleteAllRestockOrders();
    await dao.DBdeleteAllItems();
    skuid1 = await ezwh.warehouse.insertNewSKU(
      "grr",
      10,
      5,
      "primo SKU",
      10.99,
      0
    );
    skuid2 = await ezwh.warehouse.insertNewSKU(
      "grr",
      10,
      5,
      "primo SKU",
      10.99,
      0
    );
    skuid3 = await ezwh.warehouse.insertNewSKU(
      "grr",
      10,
      5,
      "primo SKU",
      10.99,
      0
    );
    skuid4 = await ezwh.warehouse.insertNewSKU(
      "grr",
      10,
      5,
      "primo SKU",
      10.99,
      0
    );

    restockOrder = {
      issueDate: "2022/02/11 11:04",
      products: [
        {
          SKUId: skuid1,
          itemId: 10,
          description: "a product",
          price: 10.99,
          qty: 30,
        },
        {
          SKUId: skuid2,
          itemId: 18,
          description: "another product",
          price: 11.99,
          qty: 20,
        },
      ],
      supplierId: 1,
    };
  });

  const transportNote = {
    transportNote: { deliveryDate: "2021/12/29" },
  };

  const skuitems = {
    skuItems: [
      { SKUId: skuid1, itemId: 10, rfid: "12345678901234567890123456789016" },
      { SKUId: skuid2, itemId: 18, rfid: "12345678901234567890123456789017" },
    ],
  };

  insertRestockOrder();
  getRestockOrders();
  getRestockOrderByID();
  getReturnItems();
  modifyRestockOrderState();
  addSKUItemToRestock(skuitems);
  addTransportNote(transportNote);
  deleteRestockOrder();
});

function insertRestockOrder() {
  describe("test insert restock orders: ", () => {
    it("insert valid restock Order", async () => {
      await ezwh.insertNewItem({
        id: 10,
        description: "a new item",
        price: 10.99,
        SKUId: skuid1,
        supplierId: 1,
      });
      await ezwh.insertNewItem({
        id: 18,
        description: "a new item",
        price: 10.99,
        SKUId: skuid2,
        supplierId: 1,
      });
      await agent
        .post("/api/restockOrder")
        .set("Cookie", "user=manager;")
        .send(restockOrder)
        .then((res) => res.should.have.status(201));
    });

    it("add restock Order invalid body", async () => {
      invalidrestock = {
        issueDate: "2022/02/11 11:04",
        products: [
          {
            SKUId: skuid1,
            itemId: 10,
            description: "a product",
            price: 10.99,
            qty: 30,
          },
          {
            SKUId: skuid2,
            itemId: 18,
            description: "another product",
            price: 11.99,
            qty: 20,
          },
        ],
        supplierId: "uno",
      };
      await agent
        .post("/api/restockOrder")
        .set("Cookie", "user = manager;")
        .send(invalidrestock)
        .then((res) => res.should.have.status(422));
    });
  });
}

function getRestockOrders() {
  describe("test get all restock orders", () => {
    beforeEach(async () => {
      try {
        item_Quantity1 = [
          {
            SKUId: skuid1,
            itemId: 10,
            description: "a product",
            price: 10.99,
            qty: 30,
          },
          {
            SKUId: skuid2,
            itemId: 18,
            description: "another product",
            price: 11.99,
            qty: 20,
          },
        ];
        item_Quantity2 = [
          {
            SKUId: skuid3,
            itemId: 5,
            description: "another product",
            price: 12.21,
            qty: 10,
          },
        ];
        item_Quantity3 = [
          {
            SKUId: skuid4,
            itemId: 9,
            description: "best product",
            price: 9.99,
            qty: 17,
          },
        ];
        restock1 = {
          issueDate: "2022/02/11 11:04",
          products: item_Quantity1,
          supplierId: 1,
        };
        restock2 = {
          issueDate: "2022/02/11 11:04",
          products: item_Quantity2,
          supplierId: 2,
        };
        restock3 = {
          issueDate: "2022/02/11 11:04",
          products: item_Quantity3,
          supplierId: 3,
        };
        await ezwh.insertNewItem({
          id: 10,
          description: "a new item",
          price: 10.99,
          SKUId: skuid1,
          supplierId: 1,
        });
        await ezwh.insertNewItem({
          id: 18,
          description: "a new item",
          price: 10.99,
          SKUId: skuid2,
          supplierId: 1,
        });
        await ezwh.insertNewItem({
          id: 5,
          description: "a new item",
          price: 10.99,
          SKUId: skuid3,
          supplierId: 2,
        });
        await ezwh.insertNewItem({
          id: 9,
          description: "a new item",
          price: 10.99,
          SKUId: skuid4,
          supplierId: 3,
        });

        await ezwh.createRestockOrder("2022/02/11 11:04", item_Quantity1, 1);
        await ezwh.createRestockOrder("2021/12/22 20:10", item_Quantity2, 2);
        await ezwh.createRestockOrder("1967/08/19 12:32", item_Quantity3, 3);
      } catch (e) {
        console.log(e);
      }
    });

    it("get all restock orders", async () => {
      await agent
        .get("/api/restockOrders")
        .set("Cookie", "user=manager;")
        .send()
        .then((res) => {
          res.should.have.status(200);
          res.body[0].issueDate.should.equal(restock1.issueDate);
          res.body[0].state.should.equal("ISSUED");
          res.body[0].products.should.be.a("array");
          res.body[0].products[0].should.have.property("SKUId");
          res.body[0].products[0].should.have.property("description");
          res.body[0].products[0].should.have.property("itemId");
          res.body[0].products[0].should.have.property("price");
          res.body[0].products[0].should.have.property("qty");
          res.body[0].supplierId.should.equal(restock1.supplierId);
        });
    });

    it("get all issued restock orders", async () => {
      await agent
        .get("/api/restockOrdersIssued")
        .set("Cookie", "user=manager;")
        .send()
        .then((res) => {
          res.should.have.status(200);
          res.body.length.should.equal(3);
        });
    });

    it("get all restock orders with empty db", async () => {
      await dao.DBdeleteAllRestockOrders();

      await agent
        .get("/api/restockOrders")
        .set("Cookie", "user=manager;")
        .send()
        .then((res) => {
          res.should.have.status(200);
          res.body.should.to.deep.equal([]);
        });
    });

    it("get all issued restock orders with empty db", async () => {
      await dao.DBdeleteAllRestockOrders();

      await agent
        .get("/api/restockOrdersIssued")
        .set("Cookie", "user=manager;")
        .send()
        .then((res) => {
          res.should.have.status(200);
          res.body.should.to.deep.equal([]);
        });
    });
  });
}

function getRestockOrderByID() {
  describe("test get restock order by ID", () => {
    let restockOrderId;
    beforeEach(async () => {
      item_Quantity = [
        {
          SKUId: skuid1,
          itemId: 10,
          description: "a product",
          price: 10.99,
          qty: 30,
        },
        {
          SKUId: skuid2,
          itemId: 18,
          description: "another product",
          price: 11.99,
          qty: 20,
        },
      ];
      restock = {
        issueDate: "2022/02/11 11:04",
        products: item_Quantity1,
        supplierId: 1,
      };
      await ezwh.insertNewItem({
        id: 10,
        description: "a new item",
        price: 10.99,
        SKUId: skuid1,
        supplierId: 1,
      });
      await ezwh.insertNewItem({
        id: 18,
        description: "a new item",
        price: 10.99,
        SKUId: skuid2,
        supplierId: 1,
      });
      restockOrderId = await ezwh.createRestockOrder(
        "2022/02/11 11:04",
        item_Quantity,
        1
      );
    });

    it("get restock order by ID", async () => {
      await agent
        .get(`/api/restockOrders/${restockOrderId}`)
        .set("Cookie", "user=manager;")
        .send()
        .then((res) => {
          res.should.have.status(200);
          res.body.issueDate.should.equal(restock.issueDate);
          res.body.supplierId.should.equal(restock.supplierId);
          res.body.state.should.equal("ISSUED");
          res.body.products.should.be.a("array");
          res.body.products[0].should.have.property("SKUId");
          res.body.products[0].should.have.property("itemId");
          res.body.products[0].should.have.property("description");
          res.body.products[0].should.have.property("price");
          res.body.products[0].should.have.property("qty");
        });
    });

    it("get non existing restock order", async () => {
      it("get restock order by ID", async () => {
        await agent
          .get(`/api/restockOrders/${restockOrderId}`)
          .set("Cookie", "user=manager;")
          .send()
          .then((res) => {
            res.should.have.status(200);
            res.body.issueDate.should.equal(restock.issueDate);
            res.body.supplierId.should.equal(restock.supplierId);
            res.body.state.should.equal("ISSUED");
            res.body.products.should.be.a("array");
            res.body.products[0].should.have.property("SKUId");
            res.body.products[0].should.have.property("description");
            res.body.products[0].should.have.property("price");
            res.body.products[0].should.have.property("qty");
          });
      });
    });
    it("get non existing restock order", async () => {
      await agent
        .get(`/api/restockOrders/${restockOrderId + 10}`)
        .set("Cookie", "user=manager;")
        .send()
        .then((res) => res.should.have.status(404));
    });

    it("get restock order with invalid ID (wrong data type)", async () => {
      await agent
        .get(`/api/restockOrders/${"wrong data type"}`)
        .set("Cookie", "user=manager;")
        .send()
        .then((res) => res.should.have.status(422));
    });
  });
}

function getReturnItems() {
  describe("test get return items from restock order", () => {
    let restockOrderId;
    let issueDate = "2025/01/01 10:00";
    let supplierId = 1;
    let item_Quantity;
    beforeEach(async () => {
      console.log("before each");

      await ezwh.insertNewItem({
        id: 10,
        description: "a new item",
        price: 10.99,
        SKUId: skuid1,
        supplierId: 1,
      });
      await ezwh.insertNewItem({
        id: 18,
        description: "a new item",
        price: 10.99,
        SKUId: skuid2,
        supplierId: 1,
      });

      item_Quantity = [
        {
          SKUId: skuid1,
          itemId: 10,
          description: "a product",
          price: 10.99,
          qty: 30,
        },
        {
          SKUId: skuid2,
          itemId: 18,
          description: "another product",
          price: 11.99,
          qty: 20,
        },
      ];
      restockOrderId = await ezwh.createRestockOrder(
        issueDate,
        item_Quantity,
        supplierId
      );
    });

    it("get return items from restock order by ID", async () => {
      await dao.DBdeleteAllPositions();
      await dao.DBdeleteAllTestResults();
      await dao.DBdeleteAllSKUItems();
      await ezwh.warehouse.addPosition(
        800234543422,
        8000,
        3500,
        3500,
        1000,
        1000
      );
      await ezwh.warehouse.addPosition(
        800234543423,
        8000,
        3500,
        3500,
        1000,
        1000
      );

      await ezwh.warehouse.modifySKUPosition(skuid1, "800234543422");
      await ezwh.warehouse.modifySKUPosition(skuid2, "800234543423");
      await dao.DBinsertSKUItem(
        new SKUItem("12345678901234567890123456789015", 0, skuid1, "2021/11/29")
      );
      await dao.DBinsertSKUItem(
        new SKUItem("12345678901234567890123456789016", 0, skuid2, "2021/11/29")
      );
      await dao.DBinsertTestResult(
        "12345678901234567890123456789016",
        false,
        "2021/11/28",
        2
      );
      await dao.DBinsertTestResult(
        "12345678901234567890123456789015",
        true,
        "2021/11/28",
        2
      );
      await ezwh.modifyRestockOrderState(restockOrderId, "DELIVERED");
      let skuitems = [
        { SKUId: skuid1, itemId: 10, rfid: "12345678901234567890123456789015" },
        { SKUId: skuid2, itemId: 18, rfid: "12345678901234567890123456789016" },
      ];
      await ezwh.addSKUItemToRestockOrder(restockOrderId, skuitems);
      await ezwh.modifyRestockOrderState(restockOrderId, "TESTED");
      await ezwh.modifyRestockOrderState(restockOrderId, "COMPLETED");

      await agent
        .get(`/api/restockOrders/${restockOrderId}/returnItems`)
        .set("Cookie", "user=manager;")
        .send()
        .then((res) => {
          res.should.have.status(200);
          res.body.should.to.deep.equal([
            {
              SKUId: skuid2,
              itemId: 18,
              rfid: "12345678901234567890123456789016",
            },
          ]);
        });
    });

    it("get return items from restock order by ID not COMPLETEDRETURN", async () => {
      await ezwh.modifyRestockOrderState(restockOrderId, "TESTED");
      await agent
        .get(`/api/restockOrders/${restockOrderId}/returnItems`)
        .set("Cookie", "user=manager;")
        .send()
        .then((res) => res.should.have.status(422));
    });

    it("get return items from non existing restock order", async () => {
      await agent
        .get(`/api/restockOrders/${restockOrderId + 10}/returnItems`)
        .set("Cookie", "user=manager;")
        .send()
        .then((res) => res.should.have.status(404));
    });

    it("get return items from restock order with invalid ID (wrong data type)", async () => {
      await agent
        .get(`/api/restockOrders/${"wrong data type"}/returnItems`)
        .set("Cookie", "user=manager;")
        .send()
        .then((res) => res.should.have.status(422));
    });
  });
}

function modifyRestockOrderState() {
  describe("test modify restock order state", () => {
    let restockOrderId;
    beforeEach(async () => {
      item_Quantity = [
        {
          SKUId: skuid1,
          itemId: 10,
          description: "a product",
          price: 10.99,
          qty: 30,
        },
        {
          SKUId: skuid2,
          itemId: 18,
          description: "another product",
          price: 11.99,
          qty: 20,
        },
      ];
      restock = {
        issueDate: "2022/02/11 11:04",
        products: item_Quantity,
        supplierId: 1,
      };
      await ezwh.insertNewItem({
        id: 10,
        description: "a new item",
        price: 10.99,
        SKUId: skuid1,
        supplierId: 1,
      });
      await ezwh.insertNewItem({
        id: 18,
        description: "a new item",
        price: 10.99,
        SKUId: skuid2,
        supplierId: 1,
      });
      restockOrderId = await ezwh.createRestockOrder(
        "2022/02/11 11:04",
        item_Quantity,
        1
      );
    });

    it("modify restock order state with state != COMPLETED or COMPLETEDRETURN", async () => {
      const body = {
        newState: "DELIVERED",
      };
      await agent
        .put(`/api/restockOrder/${restockOrderId}`)
        .set("Cookie", "user=manager;")
        .send(body)
        .then((res) => res.should.have.status(200));
    });

    it("modify restock order state with state === COMPLETED", async () => {
      await dao.DBdeleteAllPositions();
      await dao.DBdeleteAllTestResults();
      await dao.DBdeleteAllSKUItems();
      await ezwh.warehouse.addPosition(
        800234543422,
        8000,
        3500,
        3500,
        1000,
        1000
      );
      await ezwh.warehouse.addPosition(
        800234543423,
        8000,
        3500,
        3500,
        1000,
        1000
      );
      await ezwh.warehouse.modifySKUPosition(skuid1, "800234543422");
      await ezwh.warehouse.modifySKUPosition(skuid2, "800234543423");
      await dao.DBinsertSKUItem(
        new SKUItem("12345678901234567890123456789015", 0, skuid1, "2021/11/29")
      );
      await dao.DBinsertSKUItem(
        new SKUItem("12345678901234567890123456789016", 0, skuid2, "2021/11/29")
      );
      await dao.DBinsertTestResult(
        "12345678901234567890123456789016",
        true,
        "2021/11/28",
        2
      );
      await dao.DBinsertTestResult(
        "12345678901234567890123456789015",
        true,
        "2021/11/28",
        2
      );
      await ezwh.modifyRestockOrderState(restockOrderId, "DELIVERED");
      let skuitems = [
        { SKUId: skuid1, itemId: 10, rfid: "12345678901234567890123456789015" },
        { SKUId: skuid2, itemId: 18, rfid: "12345678901234567890123456789016" },
      ];
      await ezwh.addSKUItemToRestockOrder(restockOrderId, skuitems);
      await ezwh.modifyRestockOrderState(restockOrderId, "TESTED");

      const body = {
        newState: "COMPLETED",
      };

      await agent
        .put(`/api/restockOrder/${restockOrderId}`)
        .set("Cookie", "user=manager;")
        .send(body)
        .then((res) => res.should.have.status(200));

      await agent
        .get(`/api/restockOrders/${restockOrderId}`)
        .set("Cookie", "user=manager;")
        .send()
        .then((res) => {
          res.should.have.status(200);
          res.body.state.should.equal("COMPLETED");
        });
    });

    it("modify restock order state with state === COMPLETEDRETURN", async () => {
      await dao.DBdeleteAllPositions();

      await dao.DBdeleteAllTestResults();
      await dao.DBdeleteAllSKUItems();
      await ezwh.warehouse.addPosition(
        800234543422,
        8000,
        3500,
        3500,
        1000,
        1000
      );
      await ezwh.warehouse.addPosition(
        800234543423,
        8000,
        3500,
        3500,
        1000,
        1000
      );

      await ezwh.warehouse.modifySKUPosition(skuid1, "800234543422");
      await ezwh.warehouse.modifySKUPosition(skuid2, "800234543423");
      await dao.DBinsertSKUItem(
        new SKUItem("12345678901234567890123456789015", 0, skuid1, "2021/11/29")
      );
      await dao.DBinsertSKUItem(
        new SKUItem("12345678901234567890123456789016", 0, skuid2, "2021/11/29")
      );
      await dao.DBinsertTestResult(
        "12345678901234567890123456789016",
        false,
        "2021/11/28",
        2
      );
      await dao.DBinsertTestResult(
        "12345678901234567890123456789015",
        true,
        "2021/11/28",
        2
      );
      await ezwh.modifyRestockOrderState(restockOrderId, "DELIVERED");
      let skuitems = [
        { SKUId: skuid1, itemId: 10, rfid: "12345678901234567890123456789015" },
        { SKUId: skuid2, itemId: 18, rfid: "12345678901234567890123456789016" },
      ];
      await ezwh.addSKUItemToRestockOrder(restockOrderId, skuitems);
      await ezwh.modifyRestockOrderState(restockOrderId, "TESTED");

      const body = {
        newState: "COMPLETEDRETURN",
      };

      await agent
        .put(`/api/restockOrder/${restockOrderId}`)
        .set("Cookie", "user=manager;")
        .send(body)
        .then((res) => res.should.have.status(200));

      await agent
        .get(`/api/restockOrders/${restockOrderId}`)
        .set("Cookie", "user=manager;")
        .send()
        .then((res) => {
          res.should.have.status(200);
          res.body.state.should.equal("COMPLETEDRETURN");
        });
    });

    it("modify state of non existing restock order", async () => {
      const body = {
        newState: "TESTED",
      };
      await agent
        .put(`/api/restockOrder/${restockOrderId + 10}`)
        .set("Cookie", "user=manager;")
        .send(body)
        .then((res) => res.should.have.status(404));
    });

    it("modify state of restock order with invalid ID (wrong data type)", async () => {
      const body = {
        newState: "TESTED",
      };
      await agent
        .put(`/api/restockOrder/${"invalidid"}`)
        .set("Cookie", "user=manager;")
        .send(body)
        .then((res) => res.should.have.status(422));
    });

    it("modify restock order (wrong body)", async () => {
      let invalidBody = {
        products: [{ SkuID: "this should be a number", RFID: "121" }],
      };
      await agent
        .put(`/api/restockOrder/${restockOrderId}`)
        .set("Cookie", "user=manager;")
        .send(invalidBody)
        .then((res) => res.should.have.status(422));
    });

    /*it("modify restock order state without authorization", async () => {
  
              const body = {
                  "newState": "TESTED"
              }
              await agent
                  .put(`/api/restockOrder/${restockOrderId}`)
                  .set("Cookie", "user=invalid;")
                  .send(body)
                  .then(res => res.should.have.status(401));
          });
  
          it("modify to restock order state not logged", async () => {
              const body = {
                  "newState": "TESTED"
              }
              await agent
                  .put(`/api/restockOrder/${restockOrderId}`)
                  .send(body)
                  .then(res => res.should.have.status(401));
          });*/
  });
}

function addSKUItemToRestock(skuitems) {
  describe("test insert skuitems to restock order", () => {
    let restockOrderId;
    let issueDate = "2020/01/01 10:00";
    let supplierId = 1;
    let item_Quantity;
    beforeEach(async () => {
      await ezwh.insertNewItem({
        id: 10,
        description: "a new item",
        price: 10.99,
        SKUId: skuid1,
        supplierId: 1,
      });
      await ezwh.insertNewItem({
        id: 18,
        description: "a new item",
        price: 10.99,
        SKUId: skuid2,
        supplierId: 1,
      });
      item_Quantity = [
        {
          SKUId: skuid1,
          itemId: 10,
          description: "a product",
          price: 10.99,
          qty: 30,
        },
        {
          SKUId: skuid2,
          itemId: 18,
          description: "another product",
          price: 11.99,
          qty: 20,
        },
      ];
      restockOrderId = await ezwh.createRestockOrder(
        issueDate,
        item_Quantity,
        supplierId
      );
      await ezwh.modifyRestockOrderState(restockOrderId, "DELIVERED");
    });

    it("add skuitems to existing restock order", async () => {
      await agent
        .put(`/api/restockOrder/${restockOrderId}/skuItems`)
        .set("Cookie", "user=manager;")
        .send(skuitems)
        .then((res) => res.should.have.status(200));
    });

    it("add skuitems to non existing restock order", async () => {
      await agent
        .put(`/api/restockOrder/${restockOrderId + 10}/skuItems`)
        .set("Cookie", "user=manager;")
        .send(skuitems)
        .then((res) => res.should.have.status(404));
    });

    it("add skuitems to restock order with invalid ID", async () => {
      await agent
        .put(`/api/restockOrder/${"wrong data type"}/skuItems`)
        .set("Cookie", "user=manager;")
        .send(skuitems)
        .then((res) => res.should.have.status(422));
    });

    /*it("add skuitems to restock order by ID without authorization", async () => {
  
              await agent
                  .put(`/api/restockOrder/${restockOrderId}/skuItems`)
                  .set("Cookie", "user=invalid;")
                  .send(skuitems)
                  .then(res => res.should.have.status(401));
          });
  
          it("add skuitems to restock order not logged", async () => {
              await agent
                  .put(`/api/restockOrder/${restockOrderId}/skuItems`)
                  .send(skuitems)
                  .then(res => res.should.have.status(401));
          });*/

    it("add skuitem to restock order with state != DELIVERED", async () => {
      await dao.DBmodifyRestockOrderState(restockOrderId, "DELIVERY");
      await agent
        .put(`/api/restockOrder/${restockOrderId}/skuItems`)
        .set("Cookie", "user=manager;")
        .send(skuitems)
        .then((res) => res.should.have.status(422));
    });
  });
}

function addTransportNote(transportNote) {
  describe("test insert transportNote to restock order", () => {
    let restockOrderId;
    let issueDate = "2020/01/01 10:00";
    let supplierId = 1;
    let item_Quantity;
    beforeEach(async () => {
      await ezwh.insertNewItem({
        id: 10,
        description: "a new item",
        price: 10.99,
        SKUId: skuid1,
        supplierId: 1,
      });
      await ezwh.insertNewItem({
        id: 18,
        description: "a new item",
        price: 10.99,
        SKUId: skuid2,
        supplierId: 1,
      });
      item_Quantity = [
        {
          SKUId: skuid1,
          itemId: 10,
          description: "a product",
          price: 10.99,
          qty: 30,
        },
        {
          SKUId: skuid2,
          itemId: 18,
          description: "another product",
          price: 11.99,
          qty: 20,
        },
      ];
      restockOrderId = await ezwh.createRestockOrder(
        issueDate,
        item_Quantity,
        supplierId
      );
      await ezwh.modifyRestockOrderState(restockOrderId, "DELIVERY");
    });

    it("add transport note to existing restock order", async () => {
      await agent
        .put(`/api/restockOrder/${restockOrderId}/transportNote`)
        .set("Cookie", "user=manager;")
        .send(transportNote)
        .then((res) => res.should.have.status(200));
    });

    it("add transport note to non existing restock order", async () => {
      await agent
        .put(`/api/restockOrder/${restockOrderId + 10}/transportNote`)
        .set("Cookie", "user=manager;")
        .send(transportNote)
        .then((res) => res.should.have.status(404));
    });

    it("add transport note to restock order with invalid ID", async () => {
      await agent
        .put(`/api/restockOrder/${"wrong data type"}/transportNote`)
        .set("Cookie", "user=manager;")
        .send(transportNote)
        .then((res) => res.should.have.status(422));
    });

    /*it("add transport note to restock order by ID without authorization", async () => {
  
              await agent
                  .put(`/api/restockOrder/${restockOrderId}/transportNote`)
                  .set("Cookie", "user=invalid;")
                  .send(transportNote)
                  .then(res => res.should.have.status(401));
          });
  
          it("add transport note to restock order not logged", async () => {
              await agent
                  .put(`/api/restockOrder/${restockOrderId}/transportNote`)
                  .send(transportNote)
                  .then(res => res.should.have.status(401));
          });*/

    it("add transport note to restock order with state != DELIVERY", async () => {
      await dao.DBmodifyRestockOrderState(restockOrderId, "DELIVERED");
      await agent
        .put(`/api/restockOrder/${restockOrderId}/transportNote`)
        .set("Cookie", "user=manager;")
        .send(transportNote)
        .then((res) => res.should.have.status(422));
    });
  });
}

function deleteRestockOrder() {
  describe("test delete restock order", () => {
    let restockOrderId;
    beforeEach(async () => {
      await ezwh.insertNewItem({
        id: 10,
        description: "a new item",
        price: 10.99,
        SKUId: skuid1,
        supplierId: 1,
      });
      await ezwh.insertNewItem({
        id: 18,
        description: "a new item",
        price: 10.99,
        SKUId: skuid2,
        supplierId: 1,
      });
      item_Quantity = [
        {
          SKUId: skuid1,
          itemId: 10,
          description: "a product",
          price: 10.99,
          qty: 30,
        },
        {
          SKUId: skuid2,
          itemId: 18,
          description: "another product",
          price: 11.99,
          qty: 20,
        },
      ];

      restockOrderId = await ezwh.createRestockOrder(
        "2022/02/11 11:04",
        item_Quantity,
        1
      );
    });

    it("delete existing restock order", async () => {
      await agent
        .delete(`/api/restockOrder/${restockOrderId}`)
        .set("Cookie", "user=manager;")
        .send()
        .then((res) => res.should.have.status(204));
    });

    /*it("delete restock order with wrong authorization", async () => {
  
              await agent
                  .delete(`/api/restockOrder/${restockOrderId}`)
                  .set("Cookie", "user = invaliduser;")
                  .then(res => res.should.have.status(401));
          });
  
          it("delete restock order not logged", async () => {
              await agent
                  .delete(`/api/restockOrder/${restockOrderId}`)
                  .then(res => res.should.have.status(401));
          });*/

    it("delete wrong type id", async () => {
      await agent
        .delete(`/api/restockOrder/string`)
        .set("Cookie", "user = manager;")
        .then((res) => res.should.have.status(422));
    });
  });
}
