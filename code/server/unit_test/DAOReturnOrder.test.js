const DAO = require("../modules/DAO/DAO");

describe("test DAOReturnOrder", () => {
	describe("test return orders", () => {
		beforeEach(async () => {
			await DAO.DBdeleteAllReturnOrders();
		})

		testNewReturnOrder("2021/12/22 20:10", [{ "SKUId": 12, "description": "a product", "price": 10.99, "RFID": "12345678901234567890123456789016" }, { "SKUId": 180, "description": "another product", "price": 11.99, "RFID": "12345678901234567890123456789038" }], 1);
		testGetAllReturnOrders();
		testGetReturnOrderById();
		testDeleteReturnOrder();
		testDeleteAllReturnOrders();
	});
});

function testNewReturnOrder(returnDate, products, restockOrderId) {
	test("insert valid return order", async () => {
		await DAO.DBinsertReturnOrder(returnDate, products, restockOrderId);
		let returnOrders = await DAO.DBallReturnOrders();
		let returnOrder = returnOrders[0];
		expect(returnOrders.length).toStrictEqual(1);
		expect(returnOrder.returnDate).toStrictEqual(returnDate);
		expect(returnOrder.items).toStrictEqual(products);
		expect(returnOrder.restockId).toStrictEqual(restockOrderId);
	});

	test("insert invalid return order", async () => {
		return expect(DAO.DBinsertReturnOrder(null, null, null)).rejects.toThrow();
	});
}

function testGetAllReturnOrders() {
	test("get all return orders with empty table", async () => {
		let finalSize = await DAO.DBallReturnOrders().then(returnOrders => returnOrders.length);
		expect(finalSize).toStrictEqual(0);
	});

	test("get all return orders", async () => {
		item_Quantity1 = [{ "SKUId": 12, "description": "a product", "price": 10.99, "RFID": "12345678901234567890123456789016" }, { "SKUId": 180, "description": "another product", "price": 11.99, "RFID": "12345678901234567890123456789038" }];
		item_Quantity2 = [{ "SKUId": 11, "description": "a product", "price": 0.99, "RFID": "12345678201234567890123456789016" }, { "SKUId": 120, "description": "another product2", "price": 11.90, "RFID": "12345678901234567890123456789128" }]
		item_Quantity3 = [{ "SKUId": 10, "description": "a product", "price": 12.99, "RFID": "12345678931234567890123456789016" }, { "SKUId": 100, "description": "another product3", "price": 12.99, "RFID": "12345678901234567811123456789038" }];
		await DAO.DBinsertReturnOrder("2022/02/11 11:04", item_Quantity1, 1);
		await DAO.DBinsertReturnOrder("2021/12/22 20:10", item_Quantity2, 2);
		await DAO.DBinsertReturnOrder("1967/08/19 12:32", item_Quantity3, 3);

		let returnOrders = await DAO.DBallReturnOrders();
		expect(returnOrders[0].returnDate).toStrictEqual("2022/02/11 11:04");
		expect(returnOrders[0].items).toStrictEqual(item_Quantity1);
		expect(returnOrders[0].restockId).toStrictEqual(1);
		let finalSize = returnOrders.length;
		expect(finalSize).toStrictEqual(3);
	});
}

function testGetReturnOrderById() {
	describe("test get return order by restock order id", () => {
		let returnOrderId;
		let returnDate = "2025/01/01 10:00";
		let restockOrderId = 5;
		item_Quantity = [{ "SKUId": 12, "description": "a product", "price": 10.99, "RFID": "12345678901234567890123456789016" }, { "SKUId": 180, "description": "another product", "price": 11.99, "RFID": "12345678901234567890123456789038" }];
		beforeEach(async () => {
			returnOrderId = await DAO.DBinsertReturnOrder(returnDate, item_Quantity, restockOrderId);
		});

		test("search return order with valid id", async () => {
			const searchedreturnOrder = await DAO.DBgetReturnOrderByID(returnOrderId);
			expect(searchedreturnOrder.returnDate).toStrictEqual(returnDate);
			expect(searchedreturnOrder.items).toStrictEqual(item_Quantity);
			expect(searchedreturnOrder.restockId).toStrictEqual(restockOrderId);
		});

		test("search non existing return order", async () => {
			const searchedreturnOrder = await DAO.DBgetReturnOrderByID(returnOrderId + 1);
			expect(searchedreturnOrder).toStrictEqual(null);
		});
	});
}

function testDeleteReturnOrder() {
	describe("test delete return order", () => {

		let returnOrderId;
		let returnDate = "2025/01/01 10:00";
		let restockOrderId = 5;
		item_Quantity = [{ "SKUId": 12, "description": "a product", "price": 10.99, "RFID": "12345678901234567890123456789016" }, { "SKUId": 180, "description": "another product", "price": 11.99, "RFID": "12345678901234567890123456789038" }];

		beforeEach(async () => {
			returnOrderId = await DAO.DBinsertReturnOrder(returnDate, item_Quantity, restockOrderId);
		});

		test("delete existing return order", async () => {
			await DAO.DBdeleteReturnOrder(returnOrderId);
			let finalSize = await DAO.DBallReturnOrders()
				.then(returnOrders => returnOrders.filter(returnOrder => returnOrder.id === returnOrderId).length)
			expect(finalSize).toStrictEqual(0);
		});

		test("delete non existing return order", async () => {
			let initialSize = await DAO.DBallReturnOrders()
				.then(returnOrders => returnOrders.filter(returnOrder => returnOrder.id === returnOrderId).length)
			await DAO.DBdeleteReturnOrder(returnOrderId + 1);
			let finalSize = await DAO.DBallReturnOrders()
				.then(returnOrders => returnOrders.filter(returnOrder => returnOrder.id === returnOrderId).length)
			expect(finalSize).toStrictEqual(initialSize);
		});

		test("delete null id return order", async () => {
			const prova = await DAO.DBdeleteReturnOrder("SELECT");
			expect(prova).toStrictEqual(undefined);
		});
	});
}
function testDeleteAllReturnOrders() {
	test("delete all restock orders", async () => {
		item_Quantity1 = [{ "SKUId": 12, "description": "a product", "price": 10.99, "RFID": "12345678901234567890123456789016" }, { "SKUId": 180, "description": "another product", "price": 11.99, "RFID": "12345678901234567890123456789038" }];
		item_Quantity2 = [{ "SKUId": 11, "description": "a product", "price": 0.99, "RFID": "12345678201234567890123456789016" }, { "SKUId": 120, "description": "another product2", "price": 11.90, "RFID": "12345678901234567890123456789128" }]
		item_Quantity3 = [{ "SKUId": 10, "description": "a product", "price": 12.99, "RFID": "12345678931234567890123456789016" }, { "SKUId": 100, "description": "another product3", "price": 12.99, "RFID": "12345678901234567811123456789038" }];
		await DAO.DBinsertReturnOrder("2022/02/11 11:04", item_Quantity1, 1);
		await DAO.DBinsertReturnOrder("2021/12/22 20:10", item_Quantity2, 2);
		await DAO.DBinsertReturnOrder("1967/08/19 12:32", item_Quantity3, 3);
		await DAO.DBdeleteAllReturnOrders();
		let finalSize = await DAO.DBallReturnOrders().then(returnOrders => returnOrders.length);
		expect(finalSize).toStrictEqual(0);
	});
}
