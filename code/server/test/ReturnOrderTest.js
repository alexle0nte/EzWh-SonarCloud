const chai = require("chai");
const chaiHttp = require("chai-http");
const dao = require("../modules/DAO/DAO");
chai.use(chaiHttp);
chai.should();
const EzWh = require("../modules/EzWh");

const app = require("../server");
var agent = chai.request.agent(app);

const ezwh = new EzWh();

let skuid1, skuid2, skuid3, skuid4;

describe("test Return Order apis", () => {
  beforeEach(async () => {
    await dao.DBdeleteAllItems();
    await dao.DBdeleteAllRestockOrders();
    await dao.DBdeleteAllReturnOrders();
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
  });

  insertReturnOrder();
  getReturnOrders();
  getReturnOrderByID();
  deleteReturnOrder();
});

function insertReturnOrder() {
  describe("test insert return orders: ", () => {
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
    let items = new Map();
    item_Quantity.forEach((p) =>
      items.set(
        { SKUId: p.SKUId, description: p.description, price: p.price },
        p.qty
      )
    );
    it("insert valid return Order", async () => {
      let restockId = await dao.DBinsertRestockOrder(
        "2022/02/11 11:04",
        "ISSUED",
        1,
        items
      );
      const returnOrder = {
        returnDate: "2021/11/29 09:33",
        products: [
          {
            SKUId: skuid1,
            itemId: 10,
            description: "a product",
            price: 10.99,
            RFID: "12345678901234567890123456789016",
          },
          {
            SKUId: skuid2,
            itemId: 18,
            description: "another product",
            price: 11.99,
            RFID: "12345678901234567890123456789038",
          },
        ],
        restockOrderId: restockId,
      };
      await agent
        .post("/api/returnOrder")
        .set("Cookie", "user=manager;")
        .send(returnOrder)
        .then((res) => res.should.have.status(201));
    });

    it("insert invalid restock Order id ", async () => {
      let restockId = await dao.DBinsertRestockOrder(
        "2022/02/11 11:04",
        "ISSUED",
        1,
        items
      );
      const returnOrder = {
        returnDate: "2021/11/29 09:33",
        products: [
          {
            SKUId: skuid1,
            itemId: 10,
            description: "a product",
            price: 10.99,
            RFID: "12345678901234567890123456789016",
          },
          {
            SKUId: skuid2,
            itemId: 18,
            description: "another product",
            price: 11.99,
            RFID: "12345678901234567890123456789038",
          },
        ],
        restockOrderId: restockId,
      };
      const returnWrongresid = { ...returnOrder };
      returnWrongresid.restockOrderId = returnOrder.restockOrderId + 10;
      await agent
        .post("/api/returnOrder")
        .set("Cookie", "user = manager;")
        .send(returnWrongresid)
        .then((res) => res.should.have.status(404));
    });

    it("add return Order invalid body", async () => {
      invalidreturn = {
        returnDate: "2021/11/29 09:33",
        products: [
          {
            SKUId: skuid1,
            itemId: 10,
            description: "a product",
            price: 10.99,
            RFID: "12345678901234567890123456789016",
          },
          {
            SKUId: skuid2,
            itemId: 18,
            description: "another product",
            price: 11.99,
            RFID: "12345678901234567890123456789038",
          },
        ],
        restockOrderId: "dodici",
      };
      await agent
        .post("/api/returnOrder")
        .set("Cookie", "user = manager;")
        .send(invalidreturn)
        .then((res) => res.should.have.status(422));
    });
  });
}

function getReturnOrders() {
  describe("test get return orders: ", () => {
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
    let items = new Map();
    item_Quantity.forEach((p) =>
      items.set(
        { SKUId: p.SKUId, description: p.description, price: p.price },
        p.qty
      )
    );
    beforeEach(async () => {
      let restockid = await dao.DBinsertRestockOrder(
        "2022/02/11 11:04",
        "ISSUED",
        1,
        items
      );
      await dao.DBinsertReturnOrder(
        "2021/12/22 20:10",
        [
          {
            SKUId: skuid1,
            itemId: 10,
            description: "a product",
            price: 10.99,
            RFID: "12345678901234567890123456789016",
          },
          {
            SKUId: skuid2,
            itemId: 18,
            description: "another product",
            price: 11.99,
            RFID: "12345678901234567890123456789038",
          },
        ],
        restockid
      );
    });

    it("get all return orders", async () => {
      await agent
        .get("/api/returnOrders")
        .set("Cookie", "user = manager;")
        .send()
        .then((res) => {
          res.should.have.status(200);
          res.body[0].returnDate.should.equal("2021/12/22 20:10");
        });
    });
    it("get all return orders with empty db", async () => {
      await dao.DBdeleteAllReturnOrders();

      await agent
        .get("/api/returnOrders")
        .set("Cookie", "user=manager;")
        .send()
        .then((res) => {
          res.should.have.status(200);
          res.body.should.to.deep.equal([]);
        });
    });
  });
}

function getReturnOrderByID() {
  describe("test get return order by id: ", () => {
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
    let items = new Map();
    item_Quantity.forEach((p) =>
      items.set(
        { SKUId: p.SKUId, description: p.description, price: p.price },
        p.qty
      )
    );

    it("get existing return order", async () => {
      let restockid = await dao.DBinsertRestockOrder(
        "2022/02/11 11:04",
        "ISSUED",
        1,
        items
      );
      let returnid = await dao.DBinsertReturnOrder(
        "2021/12/22 20:10",
        [
          {
            SKUId: skuid1,
            itemId: 10,
            description: "a product",
            price: 10.99,
            RFID: "12345678901234567890123456789016",
          },
          {
            SKUId: skuid2,
            itemId: 18,
            description: "another product",
            price: 11.99,
            RFID: "12345678901234567890123456789038",
          },
        ],
        restockid
      );
      await agent
        .get(`/api/returnOrders/${returnid}`)
        .set("Cookie", "user = manager;")
        .send()
        .then((res) => {
          res.should.have.status(200);
          res.body.returnDate.should.equal("2021/12/22 20:10");
          res.body.products.should.to.deep.equal([
            {
              SKUId: skuid1,
              itemId: 10,
              description: "a product",
              price: 10.99,
              RFID: "12345678901234567890123456789016",
            },
            {
              SKUId: skuid2,
              itemId: 18,
              description: "another product",
              price: 11.99,
              RFID: "12345678901234567890123456789038",
            },
          ]);
          res.body.restockOrderId.should.equal(restockid);
        });
    });

    it("get non existing return order", async () => {
      let restockid = await dao.DBinsertRestockOrder(
        "2022/02/11 11:04",
        "ISSUED",
        1,
        items
      );
      let returnid = await dao.DBinsertReturnOrder(
        "2021/12/22 20:10",
        [
          {
            SKUId: skuid1,
            itemId: 10,
            description: "a product",
            price: 10.99,
            RFID: "12345678901234567890123456789016",
          },
          {
            SKUId: skuid2,
            itemId: 18,
            description: "another product",
            price: 11.99,
            RFID: "12345678901234567890123456789038",
          },
        ],
        restockid
      );
      await agent
        .get(`/api/returnOrders/${returnid + 20}`)
        .set("Cookie", "user = manager;")
        .send()
        .then((res) => res.should.have.status(404));
    });

    it("get invalid id return order", async () => {
      await agent
        .get(`/api/returnOrders/${"ciao"}`)
        .set("Cookie", "user = manager;")
        .send()
        .then((res) => res.should.have.status(422));
    });
  });
}

function deleteReturnOrder() {
  describe("test delete return orders: ", () => {
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
    let items = new Map();
    item_Quantity.forEach((p) =>
      items.set(
        { SKUId: p.SKUId, description: p.description, price: p.price },
        p.qty
      )
    );

    it("delete existing return order", async () => {
      let restockid = await dao.DBinsertRestockOrder(
        "2022/02/11 11:04",
        "ISSUED",
        1,
        items
      );
      let returnid = await dao.DBinsertReturnOrder(
        "2021/12/22 20:10",
        [
          {
            SKUId: skuid1,
            itemId: 10,
            description: "a product",
            price: 10.99,
            RFID: "12345678901234567890123456789016",
          },
          {
            SKUId: skuid2,
            itemId: 18,
            description: "another product",
            price: 11.99,
            RFID: "12345678901234567890123456789038",
          },
        ],
        restockid
      );

      await agent
        .delete(`/api/returnOrder/${returnid}`)
        .set("Cookie", "user = manager;")
        .then((res) => res.should.have.status(204));
    });

    it("delete wrong type id", async () => {
      await agent
        .delete(`/api/returnOrder/string`)
        .set("Cookie", "user = manager;")
        .then((res) => res.should.have.status(422));
    });
  });
}
