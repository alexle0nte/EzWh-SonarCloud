const DAO = require("../modules/DAO/DAO");

describe("test DAORestockOrder", () => {
	describe("test restock orders", () => {
		beforeEach(async () => {
			await DAO.DBdeleteAllRestockOrders();
		})

		testNewRestockOrder("2021/12/22 20:10", "ISSUED", 2, [{ "SKUId": 10, "description": "another product", "price": 12.21, "qty": 10 }]);
		testGetAllRestockOrders();
		testGetAllRestockOrdersByState("ISSUED");
		testGetRestockOrderById();
		testModifyRestockOrderState("TESTED");
		testAddSKUItemToRestockOrder([{ "SKUId": 1, "rfid": "12345678901234567890123456789015" }, { "SKUId": 2, "rfid": "12345678901234567890123456789016" }]);
		testAddTransportNote({"deliveryDate": "2021/12/29"});
		testDeleteRestockOrder();
		testDeleteAllRestockOrders();
	});
});

function testNewRestockOrder(issueDate, state, supplierId, item_Quantity) {
	let items = new Map();
	item_Quantity.forEach((p) => items.set({ SKUId: p.SKUId, description: p.description, price: p.price }, p.qty));
	test("insert valid restock order", async () => {
		restockorderid = await DAO.DBinsertRestockOrder(issueDate, state, supplierId, items);
		let restockOrders = await DAO.DBallRestockOrders();
		let restockOrder = restockOrders[0];
		restockOrder.item_Quantity = Array.from(restockOrder.item_Quantity.entries()).map(p => { return { SKUId: p[0].SKUId, description: p[0].description, price: p[0].price, qty: p[1] } });
		expect(restockOrders.length).toStrictEqual(1);
		expect(restockOrder.issueDate).toStrictEqual(issueDate);
		expect(restockOrder.state).toStrictEqual(state);
		expect(restockOrder.supplierId).toStrictEqual(supplierId);
		expect(restockOrder.item_Quantity).toStrictEqual(item_Quantity);
	});

	test("insert invalid restock order", async () => {
		return expect(DAO.DBinsertRestockOrder(null, null, null)).rejects.toThrow();
	});
}

function testGetAllRestockOrders() {
	test("get all restock orders with empty table", async () => {
		let finalSize = await DAO.DBallRestockOrders().then(restockOrders => restockOrders.length);
		expect(finalSize).toStrictEqual(0);
	});

	test("get all restock orders", async () => {
		item_Quantity1 = [{ "SKUId": 12, "description": "a product", "price": 10.99, "qty": 30 }, { "SKUId": 180, "description": "another product", "price": 11.99, "qty": 20 }];
		item_Quantity2 = [{ "SKUId": 10, "description": "another product", "price": 12.21, "qty": 10 }];
		item_Quantity3 = [{ "SKUId": 18, "description": "best product", "price": 9.99, "qty": 17 }];
		let items1 = new Map();
		let items2 = new Map();
		let items3 = new Map();
		item_Quantity1.forEach((p) => items1.set({ SKUId: p.SKUId, description: p.description, price: p.price }, p.qty));
		item_Quantity2.forEach((p) => items2.set({ SKUId: p.SKUId, description: p.description, price: p.price }, p.qty));
		item_Quantity3.forEach((p) => items3.set({ SKUId: p.SKUId, description: p.description, price: p.price }, p.qty));
		await DAO.DBinsertRestockOrder("2022/02/11 11:04", "ISSUED", 1, items1);
		await DAO.DBinsertRestockOrder("2021/12/22 20:10", "ISSUED", 2, items2);
		await DAO.DBinsertRestockOrder("1967/08/19 12:32", "ISSUED", 3, items3);
		let finalSize = await DAO.DBallRestockOrders().then(restockOrders => restockOrders.length);
		expect(finalSize).toStrictEqual(3);
	});
}

function testGetAllRestockOrdersByState(state) {
	test("get all restock orders by state", async () => {
		item_Quantity1 = [{ "SKUId": 12, "description": "a product", "price": 10.99, "qty": 30 }, { "SKUId": 180, "description": "another product", "price": 11.99, "qty": 20 }];
		item_Quantity2 = [{ "SKUId": 10, "description": "another product", "price": 12.21, "qty": 10 }];
		item_Quantity3 = [{ "SKUId": 18, "description": "best product", "price": 9.99, "qty": 17 }];
		let items1 = new Map();
		let items2 = new Map();
		let items3 = new Map();
		item_Quantity1.forEach((p) => items1.set({ SKUId: p.SKUId, description: p.description, price: p.price }, p.qty));
		item_Quantity2.forEach((p) => items2.set({ SKUId: p.SKUId, description: p.description, price: p.price }, p.qty));
		item_Quantity3.forEach((p) => items3.set({ SKUId: p.SKUId, description: p.description, price: p.price }, p.qty));
		await DAO.DBinsertRestockOrder("2022/02/11 11:04", "ISSUED", 1, items1);
		await DAO.DBinsertRestockOrder("2021/12/22 20:10", "COMPLETED", 2, items2);
		await DAO.DBinsertRestockOrder("1967/08/19 12:32", "ISSUED", 3, items3);
		let finalSize = await DAO.DBallRestockOrdersByState(state).then(restockOrders => restockOrders.length);
		expect(finalSize).toStrictEqual(2);
	});
}

function testGetRestockOrderById() {
	describe("test get restock order by restock order id", () => {
		let restockOrderId;
		let issueDate = "2025/01/01 10:00";
		let state = "ISSUED";
		let supplierId = 5;
		let item_Quantity = [{ "SKUId": 12, "description": "a product", "price": 10.99, "qty": 30 },
		{ "SKUId": 180, "description": "another product", "price": 11.99, "qty": 20 }];
		let items = new Map();
		item_Quantity.forEach((p) => items.set({ SKUId: p.SKUId, description: p.description, price: p.price }, p.qty));
		beforeEach(async () => {
			restockOrderId = await DAO.DBinsertRestockOrder(issueDate, state, supplierId, items);
		});

		test("search restock order with valid id", async () => {
			const searchedrestockOrder = await DAO.DBgetRestockOrderByID(restockOrderId);
			searchedrestockOrder.item_Quantity = Array.from(searchedrestockOrder.item_Quantity.entries()).map(p => {
				return {
					SKUId: p[0].SKUId,
					description: p[0].description,
					price: p[0].price,
					qty: p[1]
				}
			});
			expect(searchedrestockOrder.issueDate).toStrictEqual(issueDate);
			expect(searchedrestockOrder.state).toStrictEqual(state);
			expect(searchedrestockOrder.supplierId).toStrictEqual(supplierId);
			expect(searchedrestockOrder.item_Quantity).toStrictEqual(item_Quantity)
		});

		test("search non existing restock order", async () => {
			const searchedrestockOrder = await DAO.DBgetRestockOrderByID(restockOrderId + 1);
			expect(searchedrestockOrder).toStrictEqual(null);
		});
	});
}

function testModifyRestockOrderState(newState) {
	describe("test modify restock order state", () => {
		let restockOrderId;
		let issueDate = "2025/01/01 10:00";
		let state = "ISSUED";
		let supplierId = 5;
		let item_Quantity = [{ "SKUId": 12, "description": "a product", "price": 10.99, "qty": 30 },
		{ "SKUId": 180, "description": "another product", "price": 11.99, "qty": 20 }];
		let items = new Map();
		item_Quantity.forEach((p) => items.set({ SKUId: p.SKUId, description: p.description, price: p.price }, p.qty));
		beforeEach(async () => {
			restockOrderId = await DAO.DBinsertRestockOrder(issueDate, state, supplierId, items);
		});

		test("modify existing restock order", async () => {
			await DAO.DBmodifyRestockOrderState(
				restockOrderId,
				newState
			);

			let modifiedrestockOrder = await DAO.DBgetRestockOrderByID(restockOrderId);
			expect(modifiedrestockOrder.state).toStrictEqual(newState);
		});

		test("modify non existing restockOrder", async () => {
			await DAO.DBmodifyRestockOrderState(
				restockOrderId + 1,
				newState
			);

			let modifiedrestockOrder = await DAO.DBgetRestockOrderByID(restockOrderId + 1);
			expect(modifiedrestockOrder).toStrictEqual(null);
		});

		test("modify restock order with null data", async () => {
			return expect(DAO.DBmodifyRestockOrderState(
				restockOrderId,
				null
			)).rejects.toThrow();
		});
	});
}

function testAddSKUItemToRestockOrder(skuitems) {
	describe("test add item to restock order state", () => {
		let restockOrderId;
		let issueDate = "2025/01/01 10:00";
		let state = "DELIVERED";
		let supplierId = 5;
		let item_Quantity = [{ "SKUId": 12, "description": "a product", "price": 10.99, "qty": 30 },
		{ "SKUId": 180, "description": "another product", "price": 11.99, "qty": 20 }];
		let items = new Map();
		item_Quantity.forEach((p) => items.set({ SKUId: p.SKUId, description: p.description, price: p.price }, p.qty));
		beforeEach(async () => {
			restockOrderId = await DAO.DBinsertRestockOrder(issueDate, state, supplierId, items);
			restockOrderId2 = await DAO.DBinsertRestockOrder(issueDate, "ISSUED", supplierId, items);
		});

		test("adding skuitems to existing empty restock order", async () => {
			await DAO.DBaddSKUItemToRestockOrder(
				restockOrderId,
				skuitems
			);
			let restockOrderwithitems = await DAO.DBgetRestockOrderByID(restockOrderId);
			restockOrderwithitems.item_RFID = Array.from(restockOrderwithitems.item_RFID.values());
			expect(restockOrderwithitems.item_RFID).toStrictEqual(skuitems);
		});

		test("adding skuitems to existing restock order", async () => {
			await DAO.DBaddSKUItemToRestockOrder(restockOrderId,skuitems);
			let skuitems2 = [{ "SKUId": 1, "rfid": "12345672101234567890123456789033" }, { "SKUId": 2, "rfid": "12345678901234567890123456789019" }];
			await DAO.DBaddSKUItemToRestockOrder(restockOrderId,skuitems2);
			let restockOrderwithitems = await DAO.DBgetRestockOrderByID(restockOrderId);
			Array.prototype.push.apply(skuitems, skuitems2);
			skuitems.sort((a, b) => {
                return a.SKUId - b.SKUId;
              });
            let merged = new Map(Object.entries(skuitems));
			restockOrderwithitems.item_RFID = Array.from(restockOrderwithitems.item_RFID.values());
			expect(restockOrderwithitems.item_RFID).toStrictEqual(Array.from(Array.from(merged.values())));
		});

		test("add to a restock order not DELIVERED", async () => {

		 res= await DAO.DBaddSKUItemToRestockOrder(restockOrderId2,skuitems);
		 expect(res).toStrictEqual(null);
		})
	});
}

function testAddTransportNote(transportNote) {
	describe("test insert transportNote to restock order", () => {
		let restockOrderId;
		let issueDate = "2020/01/01 10:00";
		let state = "DELIVERY";
		let supplierId = 5;
		let item_Quantity = [{ "SKUId": 12, "description": "a product", "price": 10.99, "qty": 30 },
		{ "SKUId": 180, "description": "another product", "price": 11.99, "qty": 20 }];
		let items = new Map();
		item_Quantity.forEach((p) => items.set({ SKUId: p.SKUId, description: p.description, price: p.price }, p.qty));
		beforeEach(async () => {
			restockOrderId = await DAO.DBinsertRestockOrder(issueDate, state, supplierId, items);
		});

		test("add transportnote to existing restock order", async () => {
			await DAO.DBaddtransportNote(
				restockOrderId,
				transportNote.deliveryDate
			);

			let restockOrderwithtrasportNote = await DAO.DBgetRestockOrderByID(restockOrderId);
			expect(restockOrderwithtrasportNote.transportNote).toStrictEqual(transportNote.deliveryDate);
		});

		test("add trasport note to non existing restockOrder", async () => {
			res = await DAO.DBaddtransportNote(restockOrderId+1,transportNote.deliveryDate);
			expect(res).toStrictEqual(-1);
		});
	});
}

function testDeleteRestockOrder() {
	describe("test delete restock order", () => {
		let restockOrderId;
		let issueDate = "2025/01/01 10:00";
		let state = "ISSUED";
		let supplierId = 5;
		let item_Quantity = [{ "SKUId": 12, "description": "a product", "price": 10.99, "qty": 30 },
		{ "SKUId": 180, "description": "another product", "price": 11.99, "qty": 20 }];
		let items = new Map();
		item_Quantity.forEach((p) => items.set({ SKUId: p.SKUId, description: p.description, price: p.price }, p.qty));

		beforeEach(async () => {
			restockOrderId = await DAO.DBinsertRestockOrder(issueDate, state, supplierId, items);
		});

		test("delete existing restock order", async () => {
			await DAO.DBdeleteRestockOrder(restockOrderId);
			let finalSize = await DAO.DBallRestockOrders()
				.then(restockOrders => restockOrders.filter(restockOrder => restockOrder.id === restockOrderId).length)
			expect(finalSize).toStrictEqual(0);
		});

		test("delete non existing restock order", async () => {
			await DAO.DBdeleteRestockOrder(restockOrderId);
			let initialSize = await DAO.DBallRestockOrders()
				.then(restockOrders => restockOrders.filter(restockOrder => restockOrder.id === restockOrderId).length)
			await DAO.DBdeleteRestockOrder(restockOrderId + 1);
			let finalSize = await DAO.DBallRestockOrders()
				.then(restockOrders => restockOrders.filter(restockOrder => restockOrder.id === restockOrderId).length)
			expect(finalSize).toStrictEqual(initialSize);
		});
	});
}

function testDeleteAllRestockOrders() {
	test("delete all restock orders", async () => {
		item_Quantity1 = [{ "SKUId": 12, "description": "a product", "price": 10.99, "qty": 30 }, { "SKUId": 180, "description": "another product", "price": 11.99, "qty": 20 }];
		item_Quantity2 = [{ "SKUId": 10, "description": "another product", "price": 12.21, "qty": 10 }];
		item_Quantity3 = [{ "SKUId": 18, "description": "best product", "price": 9.99, "qty": 17 }];
		let items1 = new Map();
		let items2 = new Map();
		let items3 = new Map();
		item_Quantity1.forEach((p) => items1.set({ SKUId: p.SKUId, description: p.description, price: p.price }, p.qty));
		item_Quantity2.forEach((p) => items2.set({ SKUId: p.SKUId, description: p.description, price: p.price }, p.qty));
		item_Quantity3.forEach((p) => items3.set({ SKUId: p.SKUId, description: p.description, price: p.price }, p.qty));
		await DAO.DBinsertRestockOrder("2022/02/11 11:04", "ISSUED", 1, items1);
		await DAO.DBinsertRestockOrder("2021/12/22 20:10", "ISSUED", 2, items2);
		await DAO.DBinsertRestockOrder("1967/08/19 12:32", "ISSUED", 3, items3);
		await DAO.DBdeleteAllRestockOrders();
		let finalSize = await DAO.DBallRestockOrders().then(restockOrders => restockOrders.length);
		expect(finalSize).toStrictEqual(0);
	});
}
