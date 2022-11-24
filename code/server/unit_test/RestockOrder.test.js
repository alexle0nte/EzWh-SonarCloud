const EzWh = require("../modules/EzWh");
const dao = require("../modules/DAO/DAO");
const SKUItem = require("../modules/Warehouse/SKUItem");
const SKU = require("../modules/Warehouse/SKU")
const Item = require("../modules/Item");



let skuid1, skuid2, skuid3;

const ezwh = new EzWh();

	describe("integration tests of RestockOrder class", () => {
		beforeEach(async () => {
			await dao.DBdeleteAllSKUItems();
			await dao.DBdeleteAllSKU();
			await dao.DBdeleteAllItems();
			await dao.DBdeleteAllTestResults();
			await dao.DBdeleteAllPositions();
			await dao.DBdeleteAllRestockOrders();
			skuid1 = await dao.DBinsertSKU("grr", 10, 5, "primo SKU", 10.99, 0);
			skuid2 = await dao.DBinsertSKU("grr", 10, 5, "primo SKU", 10.99, 0);
			skuid3 = await dao.DBinsertSKU("grr", 10, 5, "primo SKU", 10.99, 0);
			await dao.DBinsertItem(new Item({id: 1, description: "a product", price: 10.99, SKUId: skuid1, supplierId: 1}));
			await dao.DBinsertItem(new Item({id: 2, description: "another product", price: 11.99, SKUId: skuid2, supplierId: 1}));
			await dao.DBinsertItem(new Item({id: 3, description: "one more description", price: 12.99, SKUId: skuid3, supplierId: 1}));
		})

		testNewRestockOrder();
		testGetAllRestockOrders();
		testGetAllRestockOrdersByState("ISSUED");
		testGetReturnItems();
		testGetRestockOrderById();
		testModifyRestockOrderState("TESTED");
		testAddSKUItemToRestockOrder();
		testAddTransportNote({ "deliveryDate": "2021/12/29" });
		testDeleteRestockOrder();
	});

function testNewRestockOrder() {
	test("insert valid restock order", async () => {
		const issueDate = "2021/12/22 20:10";
		item_Quantity =  [{ "SKUId": skuid1, "itemId": 1, "description": "a product", "price": 10.99, "qty": 30 }, { "SKUId": skuid2, "itemId": 2,"description": "another product", "price": 11.99, "qty": 20 }];
		supplierId =  1;
		let restockorderid = await ezwh.createRestockOrder(issueDate, item_Quantity, supplierId);
		let restockOrders = await ezwh.getRestockOrders();
		let restockOrder = restockOrders[0];
		let tmp = restockOrder.item_Quantity;
		restockOrder.item_Quantity = Array.from(restockOrder.item_Quantity.entries()).map(p => { return { SKUId: p[0].SKUId, itemId: p[0].itemId, description: p[0].description, price: p[0].price, qty: p[1] } });
		expect(restockOrders.length).toStrictEqual(1);
		expect(restockOrder.issueDate).toStrictEqual(issueDate);
		expect(restockOrder.state).toStrictEqual("ISSUED");
		expect(restockOrder.supplierId).toStrictEqual(supplierId);
		expect(restockOrder.item_Quantity).toStrictEqual(item_Quantity);
		let prova = { "id": restockorderid, "issueDate": issueDate, "state": "ISSUED", "products": item_Quantity, "supplierId": 1, "skuItems": [] }
		restockOrder.item_Quantity = tmp;
		expect(restockOrder.toJson()).toStrictEqual(prova);
	});
}

function testGetAllRestockOrders() {

	test("get all restock orders with empty table", async () => {
		let finalSize = await ezwh.getRestockOrders().then(restockOrders => restockOrders.length);
		expect(finalSize).toStrictEqual(0);
	});

	test("get all restock orders", async () => {
		item_Quantity1 = [{ "SKUId": skuid1, "itemId": 1, "description": "a product", "price": 10.99, "qty": 30 }]; 
		item_Quantity2 = [{ "SKUId": skuid2, "itemId": 2,"description": "another product", "price": 11.99, "qty": 20 }];
		item_Quantity3 = [{ "SKUId": skuid3, "itemId": 3,"description": "one more description", "price": 12.99, "qty": 10 }];
		await ezwh.createRestockOrder("2022/02/11 11:04", item_Quantity1, 1);
		await ezwh.createRestockOrder("2021/12/22 20:10", item_Quantity2, 1);
		await ezwh.createRestockOrder("2023/01/23 21:11", item_Quantity3, 1);
		let finalSize = await ezwh.getRestockOrders().then(restockOrders => restockOrders.length);
		expect(finalSize).toStrictEqual(3);
	});
}

function testGetReturnItems() {
	describe("test get return items from restock order", () => {
		let restockOrderId;
		let issueDate = "2025/01/01 10:00";
		let supplierId = 1;
		let item_Quantity ;


		test("get return items from restock order id", async () => {
			item_Quantity = [{ "SKUId": skuid1, "itemId": 1, "description": "a product", "price": 10.99, "qty": 30 },
			{ "SKUId": skuid2, "itemId": 2, "description": "another product", "price": 11.99, "qty": 20 }];
			restockOrderId = await ezwh.createRestockOrder(issueDate, item_Quantity, supplierId);
			await dao.DBdeleteAllPositions();
			await dao.DBdeleteAllTestResults();
			await dao.DBdeleteAllSKUItems();
			await ezwh.warehouse.addPosition(800234543422, 8000, 3500, 3500, 1000, 1000);
			await ezwh.warehouse.addPosition(800234543423, 8000, 3500, 3500, 1000, 1000);
			await ezwh.warehouse.modifySKUPosition(skuid1, "800234543422");
			await ezwh.warehouse.modifySKUPosition(skuid2, "800234543423");
			await dao.DBinsertSKUItem(new SKUItem("12345678901234567890123456789015", 0, skuid1, "2021/11/29"));
			await dao.DBinsertSKUItem(new SKUItem("12345678901234567890123456789016", 0, skuid2, "2021/11/29"));
			await dao.DBinsertTestResult("12345678901234567890123456789016", false, "2021/11/28", 2);
			await dao.DBinsertTestResult("12345678901234567890123456789015", true, "2021/11/28", 2);
			await ezwh.modifyRestockOrderState(restockOrderId, "DELIVERED");
			let skuitems = [{ "SKUId": skuid1, "itemId": 1, "rfid": "12345678901234567890123456789015" }, { "SKUId": skuid2, "itemId": 2, "rfid": "12345678901234567890123456789016" }];
			await ezwh.addSKUItemToRestockOrder(restockOrderId, skuitems);
			await ezwh.modifyRestockOrderState(restockOrderId, "TESTED");
			await ezwh.modifyRestockOrderState(restockOrderId, "COMPLETED");
			let returnItems = await ezwh.getReturnItemsRestock(restockOrderId, false);
			expect(returnItems).toStrictEqual([{ "SKUId": skuid2, "itemId": 2, "rfid": "12345678901234567890123456789016" }]);
		})
	}
	)
}

function testGetAllRestockOrdersByState(state) {
	test("get all restock orders by state", async () => {
		item_Quantity1 = [{ "SKUId": skuid1, "itemId": 1, "description": "a product", "price": 10.99, "qty": 30 }]; 
		item_Quantity2 = [{ "SKUId": skuid2, "itemId": 2,"description": "another product", "price": 11.99, "qty": 20 }];
		item_Quantity3 = [{ "SKUId": skuid3, "itemId": 3,"description": "one more description", "price": 12.99, "qty": 10 }];
		

		let restockid1 = await ezwh.createRestockOrder("2022/02/11 11:04", item_Quantity1, 1);
		await ezwh.createRestockOrder("2021/12/22 20:10", item_Quantity2, 1);
		await ezwh.createRestockOrder("1967/08/19 12:32", item_Quantity3, 1);
		await ezwh.modifyRestockOrderState(restockid1, "TESTED");
		let finalSize = await ezwh.getRestockOrdersByState(state).then(restockOrders => restockOrders.length);
		expect(finalSize).toStrictEqual(2);
	});
}

function testGetRestockOrderById() {
	describe("test get restock order by restock order id", () => {
		let restockOrderId;
		let issueDate = "2025/01/01 10:00";
		let supplierId = 1;
		let item_Quantity;

		test("search restock order with valid id", async () => {
			item_Quantity = [{ "SKUId": skuid1, "itemId": 1, "description": "a product", "price": 10.99, "qty": 30 },
		{ "SKUId": skuid2, "itemId": 2, "description": "another product", "price": 11.99, "qty": 20 }];
		restockOrderId = await ezwh.createRestockOrder(issueDate, item_Quantity, supplierId);
			const searchedrestockOrder = await ezwh.getRestockOrderByID(restockOrderId);
			searchedrestockOrder.item_Quantity = Array.from(searchedrestockOrder.item_Quantity.entries()).map(p => {
				return {
					SKUId: p[0].SKUId,
					itemId: p[0].itemId,
					description: p[0].description,
					price: p[0].price,
					qty: p[1]
				}
			});
			expect(searchedrestockOrder.issueDate).toStrictEqual(issueDate);
			expect(searchedrestockOrder.state).toStrictEqual("ISSUED");
			expect(searchedrestockOrder.supplierId).toStrictEqual(supplierId);
			expect(searchedrestockOrder.item_Quantity).toStrictEqual(item_Quantity)
		});

		test("search non existing restock order", async () => {
			const searchedrestockOrder = await ezwh.getRestockOrderByID(restockOrderId + 1);
			expect(searchedrestockOrder).toStrictEqual(null);
		});
	});
}



function testModifyRestockOrderState(newState) {
	describe("test modify restock order state", () => {
		let restockOrderId;
		let issueDate = "2025/01/01 10:00";
		let supplierId = 1;
		let item_Quantity;


		test("modify existing restock order", async () => {
			item_Quantity = [{ "SKUId": skuid1, "itemId": 1, "description": "a product", "price": 10.99, "qty": 30 },
				{ "SKUId": skuid2, "itemId": 2, "description": "another product", "price": 11.99, "qty": 20 }];
			restockOrderId = await ezwh.createRestockOrder(issueDate, item_Quantity, supplierId);
			await ezwh.modifyRestockOrderState(
				restockOrderId,
				newState
			);

			let modifiedrestockOrder = await ezwh.getRestockOrderByID(restockOrderId);
			expect(modifiedrestockOrder.state).toStrictEqual(newState);
		});

		test("modify non existing restockOrder", async () => {
			item_Quantity = [{ "SKUId": skuid1, "itemId": 1, "description": "a product", "price": 10.99, "qty": 30 },
				{ "SKUId": skuid2, "itemId": 2, "description": "another product", "price": 11.99, "qty": 20 }];
			restockOrderId = await ezwh.createRestockOrder(issueDate, item_Quantity, supplierId);
			await ezwh.modifyRestockOrderState(
				restockOrderId + 1,
				newState
			);

			let modifiedrestockOrder = await ezwh.getRestockOrderByID(restockOrderId + 1);
			expect(modifiedrestockOrder).toStrictEqual(null);
		});

		test("modify restock order with null data", async () => {
			item_Quantity = [{ "SKUId": skuid1, "itemId": 1, "description": "a product", "price": 10.99, "qty": 30 },
				{ "SKUId": skuid2, "itemId": 2, "description": "another product", "price": 11.99, "qty": 20 }];
			restockOrderId = await ezwh.createRestockOrder(issueDate, item_Quantity, supplierId);
			return expect(ezwh.modifyRestockOrderState(
				restockOrderId,
				null
			)).rejects.toThrow();
		});

		test("modify existing restock order to COMPLETED but not TESTED", async () => {
			item_Quantity = [{ "SKUId": skuid1, "itemId": 1, "description": "a product", "price": 10.99, "qty": 30 },
				{ "SKUId": skuid2, "itemId": 2, "description": "another product", "price": 11.99, "qty": 20 }];
			restockOrderId = await ezwh.createRestockOrder(issueDate, item_Quantity, supplierId);
			await ezwh.modifyRestockOrderState(
				restockOrderId,
				"DELIVERED"
			);

			let modifiedrestockOrder = await ezwh.modifyRestockOrderState(restockOrderId, "COMPLETED");
			expect(modifiedrestockOrder).toStrictEqual(null);
		});


	});
}

function testAddSKUItemToRestockOrder() {
	describe("test add item to restock order state", () => {
		let restockOrderId;
		let restockOrderId2;
		let issueDate = "2025/01/01 10:00";
		let supplierId = 1;
		let item_Quantity;
		let skuitems;

		test("adding skuitems to existing restock order", async () => {
			skuitems = [{ "SKUId": skuid1, "itemId": 1, "rfid": "12345678901234567890123456789015" }, { "SKUId": skuid2, "itemId": 2, "rfid": "12345678901234567890123456789016" }];
			item_Quantity = [{ "SKUId": skuid1, "itemId": 1, "description": "a product", "price": 10.99, "qty": 30 }, { "SKUId": skuid2, "itemId": 2, "description": "another product", "price": 11.99, "qty": 20 }
		];
			restockOrderId = await ezwh.createRestockOrder(issueDate, item_Quantity, supplierId);
			restockOrderId2 = await ezwh.createRestockOrder(issueDate, item_Quantity, supplierId);
			
			await ezwh.modifyRestockOrderState(restockOrderId, "DELIVERED");
			

			
			await ezwh.addSKUItemToRestockOrder(restockOrderId, skuitems);
			let skuitems2 = [{ "SKUId": skuid1, "itemId": 1, "rfid": "12345672101234567890123456789033" }, { "SKUId": skuid2, "itemId": 2, "rfid": "12345678901234567890123456789019" }];
		
			
			await ezwh.addSKUItemToRestockOrder(restockOrderId, skuitems2);
		
			
			let restockOrderwithitems = await ezwh.getRestockOrderByID(restockOrderId);
		
			
			Array.prototype.push.apply(skuitems, skuitems2);
			skuitems.sort((a, b) => {
				return a.SKUId - b.SKUId;
			});
		
			
			let merged = new Map(Object.entries(skuitems));
		
			
			restockOrderwithitems.item_RFID = Array.from(restockOrderwithitems.item_RFID.values());
		
			expect(restockOrderwithitems.item_RFID).toStrictEqual(Array.from(merged.values()));
		});

		test("add to a restock order not DELIVERED", async () => {
			item_Quantity = [{ "SKUId": skuid1, "itemId": 1, "description": "a product", "price": 10.99, "qty": 30 }, { "SKUId": skuid2, "itemId": 2, "description": "another product", "price": 11.99, "qty": 20 }
		];
			restockOrderId = await ezwh.createRestockOrder(issueDate, item_Quantity, supplierId);
			restockOrderId2 = await ezwh.createRestockOrder(issueDate, item_Quantity, supplierId);
			res = await ezwh.addSKUItemToRestockOrder(restockOrderId2, skuitems);
			expect(res).toStrictEqual(null);
		})
	});
}

function testAddTransportNote(transportNote) {
	describe("test insert transportNote to restock order", () => {
		let restockOrderId;
		let issueDate = "2020/01/01 10:00";
		let supplierId = 1;
		let item_Quantity ;

		test("add transportnote to existing restock order", async () => {
			item_Quantity = [{ "SKUId": skuid1, "itemId": 1, "description": "a product", "price": 10.99, "qty": 30 },
			{ "SKUId": skuid2, "itemId": 2, "description": "another product", "price": 11.99, "qty": 20 }];
			restockOrderId = await ezwh.createRestockOrder(issueDate, item_Quantity, supplierId);
			await ezwh.modifyRestockOrderState(restockOrderId, "DELIVERY");
			restockOrderId2 = await ezwh.createRestockOrder(issueDate, item_Quantity, supplierId);
			await ezwh.addTransportNote(
				restockOrderId,
				transportNote
			);

			let restockOrderwithtrasportNote = await ezwh.getRestockOrderByID(restockOrderId);
			expect(restockOrderwithtrasportNote.transportNote).toStrictEqual(transportNote.deliveryDate);
		});

		test("add trasport note to non existing restockOrder", async () => {
			item_Quantity = [{ "SKUId": skuid1, "itemId": 1, "description": "a product", "price": 10.99, "qty": 30 },
			{ "SKUId": skuid2, "itemId": 2, "description": "another product", "price": 11.99, "qty": 20 }];
			restockOrderId = await ezwh.createRestockOrder(issueDate, item_Quantity, supplierId);
			await ezwh.modifyRestockOrderState(restockOrderId, "DELIVERY");
			restockOrderId2 = await ezwh.createRestockOrder(issueDate, item_Quantity, supplierId);
			res = await ezwh.addTransportNote(restockOrderId + 1, transportNote);
			expect(res).toStrictEqual(null);
		});

		test("add transportNote to a restock order not DELIVERY", async () => {
			item_Quantity = [{ "SKUId": skuid1, "itemId": 1, "description": "a product", "price": 10.99, "qty": 30 },
			{ "SKUId": skuid2, "itemId": 2, "description": "another product", "price": 11.99, "qty": 20 }];
			restockOrderId = await ezwh.createRestockOrder(issueDate, item_Quantity, supplierId);
			await ezwh.modifyRestockOrderState(restockOrderId, "DELIVERY");
			restockOrderId2 = await ezwh.createRestockOrder(issueDate, item_Quantity, supplierId);
			res = await ezwh.addTransportNote(restockOrderId2, transportNote);
			expect(res).toStrictEqual(null);
		})
	});
}

function testDeleteRestockOrder() {
	describe("test delete restock order", () => {
		let restockOrderId;
		let issueDate = "2025/01/01 10:00";
		let supplierId = 1;
		let item_Quantity ;

		test("delete existing restock order", async () => {

			item_Quantity = [{ "SKUId": skuid1, "itemId": 1, "description": "a product", "price": 10.99, "qty": 30 },
		{ "SKUId": skuid2, "itemId": 2, "description": "another product", "price": 11.99, "qty": 20 }];
		restockOrderId = await ezwh.createRestockOrder(issueDate, item_Quantity, supplierId);
			await ezwh.deleteRestockOrder(restockOrderId);
			let finalSize = await ezwh.getRestockOrders()
				.then(restockOrders => restockOrders.filter(restockOrder => restockOrder.id === restockOrderId).length)
			expect(finalSize).toStrictEqual(0);
		});

		test("delete non existing restock order", async () => {
			await ezwh.deleteRestockOrder(restockOrderId);
			let initialSize = await ezwh.getRestockOrders()
				.then(restockOrders => restockOrders.filter(restockOrder => restockOrder.id === restockOrderId).length)
			await ezwh.deleteRestockOrder(restockOrderId + 1);
			let finalSize = await ezwh.getRestockOrders()
				.then(restockOrders => restockOrders.filter(restockOrder => restockOrder.id === restockOrderId).length)
			expect(finalSize).toStrictEqual(initialSize);
		});
	});
}
