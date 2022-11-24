const EzWh = require("../modules/EzWh");
const SKUItem = require("../modules/Warehouse/SKUItem");
const SKU = require("../modules/Warehouse/SKU");
const InternalOrder = require("../modules/InternalOrders");
const dao = require("../modules/DAO/DAO");

const ezwh = new EzWh();

describe("integration tests of InternalOrder class", () => {
	beforeEach(async () => {
		await dao.DBdeleteAllSKU();
		await dao.DBdeleteAllSKUItems();
		await dao.DBdeleteAllInternalOrderProducts();
		await dao.DBdeleteAllInternalOrders();
	});

	testCreateInternalOrder("2022/01/01 10:00", 1);
	testGetAllInternalOrders();
	testGetInternalOrdersByState();
	testGetInternalOrderByID();
	testModifyInternalOrderState("ACCEPTED");
	testDeleteInternalOrder();
	testRetrieveInternalOrderProduct();
	testRemoveInternalOrderProduct();
	testInternalOrderToJson();

})

function testCreateInternalOrder(issueDate, customerID) {
	describe("test create internal order", () => {
		var skuId
		beforeEach(async () => {
			skuId = await dao.DBinsertSKU("a product", 3, 2, "note 12", 10.99, 3);
			await dao.DBinsertSKUItem(new SKUItem("12112112112112112112112112112199", 1, skuId, "2020/01/01 10:00"));
			await dao.DBinsertSKUItem(new SKUItem("12212212212212212212212212212299", 1, skuId, "2020/03/01 12:00"));
			await dao.DBinsertSKUItem(new SKUItem("12312312312312312312312312312399", 1, skuId, "2020/02/01 11:00"));
		});

		test("insert valid internal order", async () => {
			var products = [{ "SKUId": skuId, "description": "a product", "price": 10.99, "qty": 2 }];
			await ezwh.createInternalOrder(issueDate, products, customerID);
			var internalOrders = await ezwh.getInternalOrders();
			var internalOrder = internalOrders[0];
			expect(internalOrders.length).toStrictEqual(1);
			expect(internalOrder.issueDate).toStrictEqual(issueDate);
			expect(internalOrder.state).toStrictEqual("ISSUED");
			expect(internalOrder.customerID).toStrictEqual(customerID);
			expect(Array.from(internalOrder.SKUQuantity.keys())[0].id).toStrictEqual(skuId);
			expect(Array.from(internalOrder.SKUQuantity.values())[0]).toStrictEqual(2);
			expect(Array.from(internalOrder.SKURFIDs.keys())[0].id).toStrictEqual(skuId);
			expect(Array.from(internalOrder.SKURFIDs.values())[0]).toStrictEqual(["12112112112112112112112112112199", "12312312312312312312312312312399"]);
		});

		test("insert internal order with non existing sku", async () => {
			var products = [{ "SKUId": skuId + 1, "description": "a product", "price": 10.99, "qty": 4 }];
			return expect(ezwh.createInternalOrder(issueDate, products, customerID)).rejects.toBe("422");
		})

		test("insert internal order valid products and null data", async () => {
			var products = [{ "SKUId": skuId, "description": "a product", "price": 10.99, "qty": 2 }];
			return expect(ezwh.createInternalOrder(null, products, null)).rejects.toThrow();
		});
	});
}

function testGetAllInternalOrders() {
	test("get all internal orders with empty table", async () => {
		var finalSize = await ezwh.getInternalOrders().then(internalOrders => internalOrders.length);
		expect(finalSize).toStrictEqual(0);
	});

	test("get all internal orders filled table", async () => {
		var skuId = await dao.DBinsertSKU("a product", 3, 2, "note 12", 10.99, 3);
		await dao.DBinsertSKUItem(new SKUItem("12112112112112112112112112112199", 1, skuId, "2020/01/01 10:00"));
		await dao.DBinsertSKUItem(new SKUItem("12212212212212212212212212212299", 1, skuId, "2020/03/01 12:00"));
		await dao.DBinsertSKUItem(new SKUItem("12312312312312312312312312312399", 1, skuId, "2020/02/01 11:00"));
		var products1 = [{ "SKUId": skuId, "description": "a product", "price": 10.99, "qty": 2 }];
		var products2 = [{ "SKUId": skuId, "description": "a product", "price": 10.99, "qty": 1 }];
		await ezwh.createInternalOrder("2022/01/01 10:00", products1, 1);
		await ezwh.createInternalOrder("2022/02/02 11:00", products2, 2);
		var finalSize = await ezwh.getInternalOrders().then(internalOrders => internalOrders.length);
		expect(finalSize).toStrictEqual(2);
	});
}

function testGetInternalOrdersByState() {
	test("get all internal orders by state empty table", async () => {
		var finalSize = await ezwh.getInternalOrdersByState("ISSUED")
			.then(internalOrders => internalOrders.length);
		expect(finalSize).toStrictEqual(0);
	});

	test("get all internal orders by state filled table", async () => {
		var skuId = await dao.DBinsertSKU("a product", 3, 2, "note 12", 10.99, 3);
		await dao.DBinsertSKUItem(new SKUItem("12112112112112112112112112112199", 1, skuId, "2020/01/01 10:00"));
		await dao.DBinsertSKUItem(new SKUItem("12212212212212212212212212212299", 1, skuId, "2020/03/01 12:00"));
		await dao.DBinsertSKUItem(new SKUItem("12312312312312312312312312312399", 1, skuId, "2020/02/01 11:00"));
		var products1 = [{ "SKUId": skuId, "description": "a product", "price": 10.99, "qty": 2 }];
		var products2 = [{ "SKUId": skuId, "description": "a product", "price": 10.99, "qty": 1 }];
		await ezwh.createInternalOrder("2022/01/01 10:00", products1, 1);
		await ezwh.createInternalOrder("2022/02/02 11:00", products2, 2);
		var finalSize = await ezwh.getInternalOrdersByState("ISSUED")
			.then(internalOrders => internalOrders.length);
		expect(finalSize).toStrictEqual(2);
	});
}

function testGetInternalOrderByID() {
	describe("test get internal order by id", () => {
		var internalOrderId;
		var issueDate = "2022/01/01";
		var customerID = 1;
		var skuId;
		beforeEach(async () => {
			skuId = await dao.DBinsertSKU("a product", 3, 2, "note 12", 10.99, 3);
			await dao.DBinsertSKUItem(new SKUItem("12112112112112112112112112112199", 1, skuId, "2020/01/01 10:00"));
			await dao.DBinsertSKUItem(new SKUItem("12212212212212212212212212212299", 1, skuId, "2020/03/01 12:00"));
			await dao.DBinsertSKUItem(new SKUItem("12312312312312312312312312312399", 1, skuId, "2020/02/01 11:00"));
			internalOrderId = await ezwh.createInternalOrder(
				issueDate,
				[{ "SKUId": skuId, "description": "a product", "price": 10.99, "qty": 2 }],
				customerID
			);
		});

		test("search internal order with valid id", async () => {
			var internalOrder = await ezwh.getInternalOrderByID(internalOrderId);
			expect(internalOrder.issueDate).toStrictEqual(issueDate);
			expect(internalOrder.state).toStrictEqual("ISSUED");
			expect(internalOrder.customerID).toStrictEqual(customerID);
			expect(Array.from(internalOrder.SKUQuantity.keys())[0].id).toStrictEqual(skuId);
			expect(Array.from(internalOrder.SKUQuantity.values())[0]).toStrictEqual(2);
			expect(Array.from(internalOrder.SKURFIDs.keys())[0].id).toStrictEqual(skuId);
			expect(Array.from(internalOrder.SKURFIDs.values())[0]).toStrictEqual(["12112112112112112112112112112199", "12312312312312312312312312312399"]);
		})

		test("search non existing internalOrder", async () => {
			return expect(ezwh.getInternalOrderByID(internalOrderId + 1)).rejects.toBe("404");
		})
	});
}

function testModifyInternalOrderState(newState) {
	describe("modify internal order state", () => {
		var internalOrderId;
		beforeEach(async () => {
			var skuId = await dao.DBinsertSKU("a product", 3, 2, "note 12", 10.99, 3);
			await dao.DBinsertSKUItem(new SKUItem("12112112112112112112112112112199", 1, skuId, "2020/01/01 10:00"));
			await dao.DBinsertSKUItem(new SKUItem("12212212212212212212212212212299", 1, skuId, "2020/03/01 12:00"));
			await dao.DBinsertSKUItem(new SKUItem("12312312312312312312312312312399", 1, skuId, "2020/02/01 11:00"));
			internalOrderId = await ezwh.createInternalOrder(
				"2022/01/01",
				[{ "SKUId": skuId, "description": "a product", "price": 10.99, "qty": 2 }],
				1
			);
		});

		test("modify internal order state with valid id and state != COMPLETED", async () => {
			await ezwh.modifyInternalOrderState(internalOrderId, newState);
			var modifiedinternalOrder = await ezwh.getInternalOrderByID(internalOrderId);
			skuItem1 = await ezwh.warehouse.getSKUItembyRFID("12112112112112112112112112112199");
			skuItem2 = await ezwh.warehouse.getSKUItembyRFID("12312312312312312312312312312399");
			expect(modifiedinternalOrder.state).toStrictEqual(newState);
			expect(skuItem1.available).toStrictEqual(1);
			expect(skuItem2.available).toStrictEqual(1);
		});

		test("modify internal order state with valid id and state === COMPLETED", async () => {
			await ezwh.modifyInternalOrderState(internalOrderId, "COMPLETED", ["12112112112112112112112112112199", "12312312312312312312312312312399"]);
			var modifiedinternalOrder = await ezwh.getInternalOrderByID(internalOrderId);
			skuItem1 = await ezwh.warehouse.getSKUItembyRFID("12112112112112112112112112112199");
			skuItem2 = await ezwh.warehouse.getSKUItembyRFID("12312312312312312312312312312399");
			expect(modifiedinternalOrder.state).toStrictEqual("COMPLETED");
			expect(skuItem1.available).toStrictEqual(0);
			expect(skuItem2.available).toStrictEqual(0);
		});

		test("modify internal order state with invalid state", async () => {
			await ezwh.modifyInternalOrderState(internalOrderId, null);
			var modifiedinternalOrder = await ezwh.getInternalOrderByID(internalOrderId);
			expect(modifiedinternalOrder.state).toStrictEqual("ISSUED");
		});
	});
}

function testDeleteInternalOrder() {
	describe("test delete internal order by id", () => {
		var internalOrderId;
		beforeEach(async () => {
			var skuId = await dao.DBinsertSKU("a product", 3, 2, "note 12", 10.99, 3);
			await dao.DBinsertSKUItem(new SKUItem("12112112112112112112112112112199", 1, skuId, "2020/01/01 10:00"));
			await dao.DBinsertSKUItem(new SKUItem("12212212212212212212212212212299", 1, skuId, "2020/03/01 12:00"));
			await dao.DBinsertSKUItem(new SKUItem("12312312312312312312312312312399", 1, skuId, "2020/02/01 11:00"));
			internalOrderId = await ezwh.createInternalOrder(
				"2022/01/01",
				[{ "SKUId": skuId, "description": "a product", "price": 10.99, "qty": 2 }],
				1
			);
		});

		test("delete existing internal order", async () => {
			await ezwh.deleteInternalOrder(internalOrderId);
			var finalSize = await ezwh.getInternalOrders()
				.then(internalOrders => internalOrders.length);
			expect(finalSize).toStrictEqual(0);
		})

		test("delete non existing internal order", async () => {
			var initialSize = await ezwh.getInternalOrders()
				.then(internalOrders => internalOrders.filter(internalOrder => internalOrder.id === internalOrderId).length);
			await ezwh.deleteInternalOrder(internalOrderId + 1)
			var finalSize = await ezwh.getInternalOrders()
				.then(internalOrders => internalOrders.filter(internalOrder => internalOrder.id === internalOrderId).length)
			expect(finalSize).toStrictEqual(initialSize);
		});
	});
}

function testRetrieveInternalOrderProduct() {
	test("retrieve internal order product", async () => {
		var skuId = await dao.DBinsertSKU("a product", 3, 2, "note 12", 10.99, 3);
		await dao.DBinsertSKUItem(new SKUItem("12112112112112112112112112112199", 1, skuId, "2020/01/01 10:00"));
		await dao.DBinsertSKUItem(new SKUItem("12212212212212212212212212212299", 1, skuId, "2020/03/01 12:00"));
		await dao.DBinsertSKUItem(new SKUItem("12312312312312312312312312312399", 1, skuId, "2020/02/01 11:00"));
		var rfids = await ezwh.warehouse.retrieveInternalOrderProduct(skuId, 2);
		var sku = await ezwh.warehouse.getSKUbyID(skuId);

		expect(sku.availableQuantity).toStrictEqual(1);
		expect(rfids[0]).toStrictEqual("12112112112112112112112112112199");
		expect(rfids[1]).toStrictEqual("12312312312312312312312312312399");
	});
}

function testRemoveInternalOrderProduct() {
	test("remove internal order product", async () => {
		var skuId = await dao.DBinsertSKU("a product", 3, 2, "note 12", 10.99, 3);
		await ezwh.warehouse.removeInternalOrderProduct(skuId, 2);
		var sku = await ezwh.warehouse.getSKUbyID(skuId);

		expect(sku.availableQuantity).toStrictEqual(5);
	});
}

function testInternalOrderToJson() {
	var sku = new SKU(1, "a product", 1, 2, "a note", 4, 10.99, 100)
	var SKUQuantity = new Map();
	SKUQuantity.set(sku, 2);
	var SKURFIDs = new Map();
	SKURFIDs.set(sku, ["12112112112112112112112112112199", "12212212212212212212212212212299"]);
	var internalOrder = new InternalOrder(
		1,
		"2022/01/01 09:33",
		"ISSUED",
		SKUQuantity,
		SKURFIDs,
		1
	);

	test("test internal order to JSON with state !== COMPLETED", () => {
		expect(internalOrder.toJson()).toStrictEqual(
			{
				"id": 1,
				"issueDate": "2022/01/01 09:33",
				"state": "ISSUED",
				"products": [{ "SKUId": 1, "description": "a product", "price": 10.99, "qty": 2 }],
				"customerId": 1
			}
		);
	})

	test("test internal order to JSON with state !== COMPLETED", () => {
		internalOrder.state = "COMPLETED";
		expect(internalOrder.toJson()).toStrictEqual(
			{
				"id": 1,
				"issueDate": "2022/01/01 09:33",
				"state": "COMPLETED",
				"products": [{ "SKUId": 1, "description": "a product", "price": 10.99, "RFID": "12112112112112112112112112112199" },
				{ "SKUId": 1, "description": "a product", "price": 10.99, "RFID": "12212212212212212212212212212299" }],
				"customerId": 1
			}
		);
	})
}