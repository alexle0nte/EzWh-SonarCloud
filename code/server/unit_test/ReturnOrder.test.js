const EzWh = require("../modules/EzWh");
const Item = require("../modules/Item");
const dao = require("../modules/DAO/DAO");

const ezwh = new EzWh();

describe("integration tests of ReturnOrder class", () => {
  beforeEach(async () => {
    await dao.DBdeleteAllRestockOrders();
    await dao.DBdeleteAllItems();
    await dao.DBdeleteAllReturnOrders();
    await dao.DBinsertItem(new Item({ id: 1, description: "a product", price: 10.99, SKUId: 12, supplierId: 1 }));
    await dao.DBinsertItem(new Item({ id: 2, description: "another product", price: 11.99, SKUId: 180, supplierId: 1 }));
  });

  testInsertReturnOrder("2021/11/29 09:33", [
    {
      SKUId: 12,
      description: "a product",
      price: 10.99,
      RFID: "12345678901234567890123456789016",
    },
    {
      SKUId: 180,
      description: "another product",
      price: 11.99,
      RFID: "12345678901234567890123456789038",
    },
  ]);
  testGetAllReturnOrders();
  testGetReturnOrderByID();
  testDeleteReturnOrder();
});

function testInsertReturnOrder(returnDate, products) {
  test("insert valid return order", async () => {
    let issueDate = "2025/01/01 10:00";
    let item_Quantity = [
      { SKUId: 12, itemId: 1, description: "a product", price: 10.99, qty: 30 },
      { SKUId: 180, itemId: 2, description: "another product", price: 11.99, qty: 20 },
    ];
    let restockOrderId = await ezwh.createRestockOrder(
      issueDate,
      item_Quantity,
      1
    );
    let returnid = await ezwh.createReturnOrder(
      returnDate,
      products,
      restockOrderId
    );
    let returnOrders = await ezwh.getReturnOrders();
    let returnOrder = returnOrders[0];
    expect(returnOrders.length).toStrictEqual(1);
    expect(returnOrder.returnDate).toStrictEqual(returnDate);
    expect(returnOrder.items).toStrictEqual(products);
    expect(returnOrder.restockId).toStrictEqual(restockOrderId);
    let prova = {
      id: returnid,
      returnDate: returnDate,
      products: [
        {
          SKUId: 12,
          description: "a product",
          price: 10.99,
          RFID: "12345678901234567890123456789016",
        },
        {
          SKUId: 180,
          description: "another product",
          price: 11.99,
          RFID: "12345678901234567890123456789038",
        },
      ],
      restockOrderId: restockOrderId,
    };
    expect(returnOrder.toJson()).toStrictEqual(prova);
  });

  test("insert invalid return order", async () => {
    let issueDate = "2025/01/01 10:00";
    let item_Quantity = [
      { SKUId: 12, itemId: 1, description: "a product", price: 10.99, qty: 30 },
      { SKUId: 180, itemId: 2, description: "another product", price: 11.99, qty: 20 },
    ];
    let restockOrderId = await ezwh.createRestockOrder(
      issueDate,
      item_Quantity,
      1
    );
    return expect(
      ezwh.createReturnOrder(null, null, restockOrderId)
    ).rejects.toThrow();
  });

  test("insert return order with invalid restock order id ", async () => {
    let returnOrder = await ezwh.createReturnOrder(null, null, null);
    expect(returnOrder).toStrictEqual(-1);
  });
}

function testGetAllReturnOrders() {
  test("get all return orders with empty table", async () => {
    let finalSize = await ezwh
      .getReturnOrders()
      .then((ReturnOrders) => ReturnOrders.length);
    expect(finalSize).toStrictEqual(0);
  });

  test("get all return orders filled table", async () => {
    let issueDate = "2025/01/01 10:00";
    let item_Quantity = [
      { SKUId: 12, itemId: 1, description: "a product", price: 10.99, qty: 30 },
      { SKUId: 180, itemId: 2, description: "another product", price: 11.99, qty: 20 },
    ];
    let restockOrderId = await ezwh.createRestockOrder(
      issueDate,
      item_Quantity,
      1
    );
    item_Quantity1 = [
      {
        SKUId: 12,
        description: "a product",
        price: 10.99,
        RFID: "12345678901234567890123456789016",
      },
      {
        SKUId: 180,
        description: "another product",
        price: 11.99,
        RFID: "12345678901234567890123456789038",
      },
    ];
    item_Quantity2 = [
      {
        SKUId: 11,
        description: "a product",
        price: 0.99,
        RFID: "12345678201234567890123456789016",
      },
      {
        SKUId: 120,
        description: "another product2",
        price: 11.9,
        RFID: "12345678901234567890123456789128",
      },
    ];
    item_Quantity3 = [
      {
        SKUId: 10,
        description: "a product",
        price: 12.99,
        RFID: "12345678931234567890123456789016",
      },
      {
        SKUId: 100,
        description: "another product3",
        price: 12.99,
        RFID: "12345678901234567811123456789038",
      },
    ];
    await ezwh.createReturnOrder(
      "2022/02/11 11:04",
      item_Quantity1,
      restockOrderId
    );
    await ezwh.createReturnOrder(
      "2021/12/22 20:10",
      item_Quantity2,
      restockOrderId
    );
    await ezwh.createReturnOrder(
      "1967/08/19 12:32",
      item_Quantity3,
      restockOrderId
    );
    let finalSize = await ezwh
      .getReturnOrders()
      .then((ReturnOrders) => ReturnOrders.length);
    expect(finalSize).toStrictEqual(3);
  });
}

function testGetReturnOrderByID() {
  describe("test get return order by id", () => {
    let issueDate = "2025/01/01 10:00";
    let item_Quantity1 = [
      { SKUId: 12, itemId: 1, description: "a product", price: 10.99, qty: 30 },
      { SKUId: 180, itemId: 2, description: "another product", price: 11.99, qty: 20 },
    ];
    let returnOrderId;
    let restockOrderId;
    let returnDate = "2025/01/01 10:00";
    item_Quantity = [
      {
        SKUId: 12,
        description: "a product",
        price: 10.99,
        RFID: "12345678901234567890123456789016",
      },
      {
        SKUId: 180,
        description: "another product",
        price: 11.99,
        RFID: "12345678901234567890123456789038",
      },
    ];

    beforeEach(async () => {
      restockOrderId = await ezwh.createRestockOrder(
        issueDate,
        item_Quantity1,
        1
      );
      returnOrderId = await ezwh.createReturnOrder(
        returnDate,
        item_Quantity,
        restockOrderId
      );
    });

    test("search return order with valid id", async () => {
      let ReturnOrder = await ezwh.getReturnOrderByID(returnOrderId);
      expect(ReturnOrder.returnDate).toStrictEqual(returnDate);
      expect(ReturnOrder.restockId).toStrictEqual(restockOrderId);
      expect(ReturnOrder.items).toStrictEqual(item_Quantity);
    });

    test("search non existing return order", async () => {
      let ReturnOrder = await ezwh.getReturnOrderByID(returnOrderId + 1);
      expect(ReturnOrder).toStrictEqual(null);
    });
  });
}

function testDeleteReturnOrder() {
  describe("test delete return order", () => {
    let issueDate = "2025/01/01 10:00";
    let item_Quantity1 = [
      { SKUId: 12, itemId: 1, description: "a product", price: 10.99, qty: 30 },
      { SKUId: 180, itemId: 2, description: "another product", price: 11.99, qty: 20 },
    ];
    let restockOrderId;
    let returnOrderId;
    let returnDate = "2025/01/01 10:00";
    item_Quantity = [
      {
        SKUId: 12,
        description: "a product",
        price: 10.99,
        RFID: "12345678901234567890123456789016",
      },
      {
        SKUId: 180,
        description: "another product",
        price: 11.99,
        RFID: "12345678901234567890123456789038",
      },
    ];

    beforeEach(async () => {
      restockOrderId = await ezwh.createRestockOrder(
        issueDate,
        item_Quantity1,
        1
      );
      returnOrderId = await ezwh.createReturnOrder(
        returnDate,
        item_Quantity,
        restockOrderId
      );
    });

    test("delete existing return order", async () => {
      await ezwh.deleteReturnOrder(returnOrderId);
      let finalSize = await ezwh
        .getReturnOrders()
        .then(
          (ReturnOrders) =>
            ReturnOrders.filter(
              (ReturnOrder) => ReturnOrder.id === returnOrderId
            ).length
        );
      expect(finalSize).toStrictEqual(0);
    });

    test("delete non existing return order", async () => {
      let initialSize = await ezwh
        .getReturnOrders()
        .then(
          (ReturnOrders) =>
            ReturnOrders.filter(
              (ReturnOrder) => ReturnOrder.id === returnOrderId
            ).length
        );
      await ezwh.deleteReturnOrder(returnOrderId + 1);
      let finalSize = await ezwh
        .getReturnOrders()
        .then(
          (ReturnOrders) =>
            ReturnOrders.filter(
              (ReturnOrder) => ReturnOrder.id === returnOrderId
            ).length
        );
      expect(finalSize).toStrictEqual(initialSize);
    });
  });
}
