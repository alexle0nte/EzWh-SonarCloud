const SKU = require("../modules/Warehouse/SKU");
const DAO = require("../modules/DAO/DAO");

describe("test DAOInternalOrder", () => {
	describe("test internal orders", () => {
		beforeEach(async () => {
			await DAO.DBdeleteAllInternalOrders();
		})

		testNewInternalOrder("2021/11/29 09:33", "ISSUED", 3);
		testGetAllInternalOrders();
		testGetInternalOrderById();
		testModifyInternalOrderState("COMPLETED");
		testDeleteInternalOrder();
	});

	describe("test internal order products", () => {
		beforeEach(async () => {
			await DAO.DBdeleteAllInternalOrderProducts();
		})

		testNewInternalOrderProduct(1, new SKU(1, "a description", null, null, null, null, 10.99, null), 3, ["12112112112112112112112112112199", "12212212212212212212212212212299", "12312312312312312312312312312399"]);
		testGetInternalOrderProductsById(2);
		testDeleteInternalOrderProducts(2);
	});
});

function testNewInternalOrder(
	issueDate,
	state,
	customerID
) {
	test("insert valid internal order", async () => {
		await DAO.DBinsertInternalOrder(issueDate, state, customerID);
		var internalOrders = await DAO.DBallInternalOrders();
		var internalOrder = internalOrders[0];
		expect(internalOrders.length).toStrictEqual(1);
		expect(internalOrder.issueDate).toStrictEqual(issueDate);
		expect(internalOrder.state).toStrictEqual(state);
		expect(internalOrder.customerID).toStrictEqual(customerID);
	});

	test("insert invalid internal order", async () => {
		return expect(DAO.DBinsertInternalOrder(null, null, null)).rejects.toThrow();
	});
}

function testGetAllInternalOrders() {
	test("get all internal orders with empty table", async () => {
		var finalSize = await DAO.DBallInternalOrders().then(internalOrders => internalOrders.length);
		expect(finalSize).toStrictEqual(0);
	});

	test("get all internal orders filled table", async () => {
		await DAO.DBinsertInternalOrder("2021/11/01 09:00", "ISSUED", 1);
		await DAO.DBinsertInternalOrder("2021/11/02 09:10", "COMPLETED", 2);
		await DAO.DBinsertInternalOrder("2021/11/03 09:20", "REFUSED", 3);
		await DAO.DBinsertInternalOrder("2021/11/04 09:30", "CANCELED", 4);

		var finalSize = await DAO.DBallInternalOrders().then(internalOrders => internalOrders.length);
		expect(finalSize).toStrictEqual(4);
	});
}

function testGetInternalOrderById() {
	describe("test get internal order by internal order id", () => {
		var internalOrderId;
		var issueDate = "2025/01/01 10:00";
		var state = "ISSUED";
		var customerID = 5;

		beforeEach(async () => {
			internalOrderId = await DAO.DBinsertInternalOrder(issueDate, state, customerID);
		});

		test("get internal order with valid id", async () => {
			const searchedInternalOrder = await DAO.DBgetInternalOrderbyID(internalOrderId);
	
			expect(searchedInternalOrder.issueDate).toStrictEqual(issueDate);
			expect(searchedInternalOrder.state).toStrictEqual(state);
			expect(searchedInternalOrder.customerID).toStrictEqual(customerID);
		});

		test("get internal order with null id", async () => {
			const searchedInternalOrder = await DAO.DBgetInternalOrderbyID(null);
			expect(searchedInternalOrder).toStrictEqual(null);
		});

		test("get internal order with negative id", async () => {
			const searchedInternalOrder = await DAO.DBgetInternalOrderbyID(-internalOrderId);
			expect(searchedInternalOrder).toStrictEqual(null);
		});
	
		test("get non existing internal order", async () => {
			const searchedInternalOrder = await DAO.DBgetInternalOrderbyID(internalOrderId + 1);
			expect(searchedInternalOrder).toStrictEqual(null);
		});


	});
}

function testModifyInternalOrderState(newState) {
	describe("test modify internal order state", () => {
		var internalOrderId;
		var issueDate = "2025/01/01 10:00";
		var state = "ISSUED";
		var customerID = 5;

		beforeEach(async () => {
			internalOrderId = await DAO.DBinsertInternalOrder(issueDate, state, customerID);
		});

		test("modify existing internal order", async () => {
			await DAO.DBmodifyInternalOrderState(
				internalOrderId,
				newState
			);
	
			const modifiedInternalOrder = await DAO.DBgetInternalOrderbyID(internalOrderId);
			expect(modifiedInternalOrder.state).toStrictEqual(newState);
		});
	
		test("modify non existing internalOrder", async () => {
			await DAO.DBmodifyInternalOrderState(
				internalOrderId + 1,
				newState
			);
	
			const modifiedInternalOrder = await DAO.DBgetInternalOrderbyID(internalOrderId);
			expect(modifiedInternalOrder.state).toStrictEqual(state);
		});
	
		test("modify internal order with null data", async () => {
			return expect(DAO.DBmodifyInternalOrderState(
				internalOrderId,
				null
			)).rejects.toThrow();
		});

		test("modify non existing internalOrder with null data", async () => {
			await DAO.DBmodifyInternalOrderState(
				internalOrderId + 1,
				null
			);
	
			const modifiedInternalOrder = await DAO.DBgetInternalOrderbyID(internalOrderId);
			expect(modifiedInternalOrder.state).toStrictEqual(state);
		});
	});
}

function testDeleteInternalOrder() {
	describe("test delete internal order", () => {
		var internalOrderId;
		var issueDate = "2025/01/01 10:00";
		var state = "ISSUED";
		var customerID = 5;

		beforeEach(async () => {
			internalOrderId = await DAO.DBinsertInternalOrder(issueDate, state, customerID);
		});

		test("delete existing internal order", async () => {
			await DAO.DBdeleteInternalOrder(internalOrderId);
			var finalSize = await DAO.DBallInternalOrders()
				.then(internalOrders => internalOrders.filter(internalOrder => internalOrder.id === internalOrderId).length)
			expect(finalSize).toStrictEqual(0);
		});
	
		test("delete non existing internal order", async () => {
			await DAO.DBdeleteInternalOrder(internalOrderId);
			var initialSize = await DAO.DBallInternalOrders()
				.then(internalOrders => internalOrders.filter(internalOrder => internalOrder.id === internalOrderId).length)
			await DAO.DBdeleteInternalOrder(internalOrderId + 1);
			var finalSize = await DAO.DBallInternalOrders()
				.then(internalOrders => internalOrders.filter(internalOrder => internalOrder.id === internalOrderId).length)
			expect(finalSize).toStrictEqual(initialSize);
		});	
	});
}

/********************************************************************
 *              INTERNAL ORDER PRODUCT
 *******************************************************************/

function testNewInternalOrderProduct(
	internalOrderId,
	sku,
	quantity,
	rfids
) {
	test("insert valid internal order product", async () => {
		var SKUQuantity = new Map(); SKUQuantity.set(sku, quantity);
		var SKURFIDs = new Map(); SKURFIDs.set(sku, rfids);
		await DAO.DBinsertInternalOrderProduct(internalOrderId, sku, quantity, rfids);
		var internalOrderProduct = await DAO.DBgetInternalOrderProductsByID(internalOrderId);
		expect(internalOrderProduct.SKUQuantity).toStrictEqual(SKUQuantity);
		expect(internalOrderProduct.SKURFIDs).toStrictEqual(SKURFIDs);
	});

	test("insert invalid internal order product", async () => {
		return expect(DAO.DBinsertInternalOrderProduct(null, null, null, null)).rejects.toThrow();
	});
}

function testGetInternalOrderProductsById(internalOrderId) {
	describe("test get internal order products by internal order id", () => {
		var sku = new SKU(2, "another description", null, null, null, null, 11.99, null);
		var quantity = 3;
		var rfids = ["18118118118118118118118118118199", "18218218218218218218218218218299", "18318318318318318318318318318399"];

		beforeEach(async () => {
			await DAO.DBinsertInternalOrderProduct(internalOrderId, sku, quantity, rfids);
		});

		test("get existing internal order products", async () => {
			var SKUQuantity = new Map(); SKUQuantity.set(sku, quantity);
			var SKURFIDs = new Map(); SKURFIDs.set(sku, rfids);

			var internalOrderProduct = await DAO.DBgetInternalOrderProductsByID(internalOrderId);
			expect(internalOrderProduct.SKUQuantity).toStrictEqual(SKUQuantity);
			expect(internalOrderProduct.SKURFIDs).toStrictEqual(SKURFIDs);
		});

		test("get non existing internal order products", async () => {
			var searchedInternalOrderProduct = await DAO.DBgetInternalOrderProductsByID(internalOrderId + 1);
			expect(searchedInternalOrderProduct.SKUQuantity).toStrictEqual(new Map());
			expect(searchedInternalOrderProduct.SKURFIDs).toStrictEqual(new Map());
		});
	});
}

function testDeleteInternalOrderProducts(internalOrderId) {
	describe("test delete internal order products by internal order id", () => {
		var sku = new SKU(2, "another description", null, null, null, null, 11.99, null);
		var quantity = 3;
		var rfids = ["18118118118118118118118118118199", "18218218218218218218218218218299", "18318318318318318318318318318399"];

		beforeEach(async () => {
			await DAO.DBinsertInternalOrderProduct(internalOrderId, sku, quantity, rfids);
		});

		test("delete existig internal order products", async () => {
			await DAO.DBdeleteInternalOrderProducts(internalOrderId);
			var internalOrderProduct = await DAO.DBgetInternalOrderProductsByID(internalOrderId);
			expect(internalOrderProduct.SKUQuantity).toStrictEqual(new Map());
			expect(internalOrderProduct.SKURFIDs).toStrictEqual(new Map());
		});

		test("delete non existing internal order products", async () => {
			var SKUQuantity = new Map(); SKUQuantity.set(sku, quantity);
			var SKURFIDs = new Map(); SKURFIDs.set(sku, rfids);

			await DAO.DBdeleteInternalOrderProducts(internalOrderId + 1);
			const searchedInternalOrderProduct = await DAO.DBgetInternalOrderProductsByID(internalOrderId);
			expect(searchedInternalOrderProduct.SKUQuantity).toStrictEqual(SKUQuantity);
			expect(searchedInternalOrderProduct.SKURFIDs).toStrictEqual(SKURFIDs);
		});
	});
}