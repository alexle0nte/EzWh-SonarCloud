const chai = require("chai");
const SKUItem = require("../modules/Warehouse/SKUItem");
const Position = require("../modules/Warehouse/Position");
const chaiHttp = require("chai-http");
const dao = require("../modules/DAO/DAO");
chai.use(chaiHttp);
chai.should();

const app = require("../server");
let agent = chai.request.agent(app);

describe("test InternalOrder apis", () => {
	beforeEach(async () => {
		await dao.DBdeleteAllSKU();
		await dao.DBdeleteAllSKUItems();
		await dao.DBdeleteAllPositions();
		await dao.DBdeleteAllInternalOrderProducts();
		await dao.DBdeleteAllInternalOrders();
	});

	getInternalOrders();
	getInternalOrderByID();
	insertInternalOrder();
	modifyInternalOrderState();
	deleteInternalOrder();
})

function getInternalOrders() {
	describe("test get all internal orders", () => {
		let internalOrder;
		let internalOrders;
		let skuId1;
		let skuId2;
		beforeEach(async () => {
			skuId1 = await dao.DBinsertSKU("a product", 3, 2, "note 12", 10.99, 1000);
			skuId2 = await dao.DBinsertSKU("another product", 4, 5, "note 180", 11.99, 1000);
			await dao.DBinsertSKUItem(new SKUItem("121", 1, skuId1, "11/05/2022 16:10"));
			await dao.DBinsertSKUItem(new SKUItem("122", 1, skuId1, "11/05/2022 16:20"));
			await dao.DBinsertSKUItem(new SKUItem("123", 1, skuId1, "11/05/2022 16:30"));
			await dao.DBinsertSKUItem(new SKUItem("181", 1, skuId2, "12/05/2022 17:00"));
			await dao.DBinsertSKUItem(new SKUItem("182", 1, skuId2, "12/05/2022 17:10"));
			await dao.DBinsertSKUItem(new SKUItem("183", 1, skuId2, "12/05/2022 17:30"));
			await dao.DBinsertSKUItem(new SKUItem("184", 1, skuId2, "12/05/2022 17:20"));
			await dao.DBinsertPosition(new Position(800234543422, 8002, 3454, 3422, 1000, 1000, skuId1, 100, 100));
			await dao.DBmodifySKUPosition(skuId1, 800234543422);
			await dao.DBinsertPosition(new Position(800234543423, 8002, 3454, 3423, 1000, 1000, skuId2, 100, 100));
			await dao.DBmodifySKUPosition(skuId2, 800234543423);
			internalOrder = {
				"issueDate": "2021/11/29 09:33",
				"products": [
					{ "SKUId": skuId1, "description": "a product", "price": 10.99, "qty": 1 },
					{ "SKUId": skuId2, "description": "another product", "price": 11.99, "qty": 1 }
				],
				"customerId": 1
			}
			internalOrders = [internalOrder, internalOrder, internalOrder];
		});

		it("get all internal orders", async () => {
			for (const io of internalOrders) {
				await agent
					.post("/api/internalOrders")
					.set("Cookie", "user=manager;")
					.send(io)
					.then((res) => res.should.have.status(201));
			}

			await agent
				.get("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send()
				.then(res => {
					res.should.have.status(200);
					res.body[0].issueDate.should.equal(internalOrder.issueDate);
					res.body[0].state.should.equal("ISSUED");
					res.body[0].products.should.be.a('array');
					res.body[0].products[0].should.have.property('SKUId');
					res.body[0].products[0].should.have.property('description');
					res.body[0].products[0].should.have.property('price');
					res.body[0].products[0].should.have.property('qty');
					res.body[0].customerId.should.equal(internalOrder.customerId);
				});
		});

		it("get all internal orders with empty db", async () => {
			await agent
				.get("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send()
				.then(res => {
					res.should.have.status(200);
				})
		})

		/* it("get all internal orders without authorization", async () => {
			for (const io of internalOrders) {
				await agent
					.post("/api/internalOrders")
					.set("Cookie", "user=manager;")
					.send(io)
					.then((res) => res.should.have.status(201));
			}

			await agent
				.get("/api/internalOrders")
				.set("Cookie", "user=invalid;")
				.send()
				.then(res => res.should.have.status(401));
		}); */

		it("get all issued internal orders", async () => {
			for (io of internalOrders) {
				await agent
					.post("/api/internalOrders")
					.set("Cookie", "user=manager;")
					.send(io)
					.then((res) => res.should.have.status(201));
			}

			await agent
				.get("/api/internalOrdersIssued")
				.set("Cookie", "user=manager;")
				.send()
				.then(res => {
					res.should.have.status(200);
					res.body[0].issueDate.should.equal(internalOrder.issueDate);
					res.body[0].state.should.equal("ISSUED");
					res.body[0].products.should.be.a('array');
					res.body[0].products[0].should.have.property('SKUId');
					res.body[0].products[0].should.have.property('description');
					res.body[0].products[0].should.have.property('price');
					res.body[0].products[0].should.have.property('qty');
					res.body[0].customerId.should.equal(internalOrder.customerId);
				});
		});

		it("get all issued internal orders with empty db", async () => {
			await agent
				.get("/api/internalOrdersIssued")
				.set("Cookie", "user=manager;")
				.send()
				.then(res => {
					res.should.have.status(200);
				})
		})

		/* it("get all issued internal orders without authorization", async () => {
			for (const io of internalOrders) {
				await agent
					.post("/api/internalOrders")
					.set("Cookie", "user=manager;")
					.send(io)
					.then((res) => res.should.have.status(201));
			}

			await agent
				.get("/api/internalOrdersIssued")
				.set("Cookie", "user=invalid;")
				.send()
				.then(res => res.should.have.status(401));
		}); */

		it("get all accepted internal orders", async () => {
			for (const io of internalOrders) {
				await agent
					.post("/api/internalOrders")
					.set("Cookie", "user=manager;")
					.send(io)
					.then((res) => res.should.have.status(201));
			}

			await dao.DBallInternalOrders()
				.then(internalOrders =>
					Promise.all(internalOrders.map(internalOrder => dao.DBmodifyInternalOrderState(internalOrder.id, "ACCEPTED"))));

			await agent
				.get("/api/internalOrdersAccepted")
				.set("Cookie", "user=manager;")
				.send()
				.then(res => {
					res.should.have.status(200);
					res.body[0].issueDate.should.equal(internalOrder.issueDate);
					res.body[0].state.should.equal("ACCEPTED");
					res.body[0].products.should.be.a('array');
					res.body[0].products[0].should.have.property('SKUId');
					res.body[0].products[0].should.have.property('description');
					res.body[0].products[0].should.have.property('price');
					res.body[0].products[0].should.have.property('qty');
					res.body[0].customerId.should.equal(internalOrder.customerId);
				});
		});

		it("get all accepted internal orders with empty db", async () => {
			await agent
				.get("/api/internalOrdersAccepted")
				.set("Cookie", "user=manager;")
				.send()
				.then(res => {
					res.should.have.status(200);
				})
		})


		/* it("get all accepted internal orders without authorization", async () => {
			for (const io of internalOrders) {
				await agent
					.post("/api/internalOrders")
					.set("Cookie", "user=manager;")
					.send(io)
					.then((res) => res.should.have.status(201));
			}

			await dao.DBallInternalOrders()
				.then(internalOrders =>
					Promise.all(internalOrders.map(internalOrder => dao.DBmodifyInternalOrderState(internalOrder.id, "ACCEPTED"))));

			await agent
				.get("/api/internalOrdersAccepted")
				.set("Cookie", "user=invalid;")
				.send()
				.then(res => res.should.have.status(401));
		}); */
	});
}

function getInternalOrderByID() {
	describe("test get internal order by ID", () => {
		let internalOrder;
		beforeEach(async () => {
			let skuId1 = await dao.DBinsertSKU("a product", 3, 2, "note 12", 10.99, 1000);
			let skuId2 = await dao.DBinsertSKU("another product", 4, 5, "note 180", 11.99, 1000);
			await dao.DBinsertSKUItem(new SKUItem("121", 1, skuId1, "11/05/2022 16:10"));
			await dao.DBinsertSKUItem(new SKUItem("122", 1, skuId1, "11/05/2022 16:20"));
			await dao.DBinsertSKUItem(new SKUItem("123", 1, skuId1, "11/05/2022 16:30"));
			await dao.DBinsertSKUItem(new SKUItem("181", 1, skuId2, "12/05/2022 17:00"));
			await dao.DBinsertSKUItem(new SKUItem("182", 1, skuId2, "12/05/2022 17:10"));
			await dao.DBinsertSKUItem(new SKUItem("183", 1, skuId2, "12/05/2022 17:30"));
			await dao.DBinsertSKUItem(new SKUItem("184", 1, skuId2, "12/05/2022 17:20"));
			await dao.DBinsertPosition(new Position(800234543422, 8002, 3454, 3422, 1000, 1000, skuId1, 100, 100));
			await dao.DBmodifySKUPosition(skuId1, 800234543422);
			await dao.DBinsertPosition(new Position(800234543423, 8002, 3454, 3423, 1000, 1000, skuId2, 100, 100));
			await dao.DBmodifySKUPosition(skuId2, 800234543423);
			internalOrder = {
				"issueDate": "2021/11/29 09:33",
				"products": [
					{ "SKUId": skuId1, "description": "a product", "price": 10.99, "qty": 3 },
					{ "SKUId": skuId2, "description": "another product", "price": 11.99, "qty": 3 }
				],
				"customerId": 1
			}
		});

		it("get an internal order by ID", async () => {
			await agent
				.post("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send(internalOrder)
				.then(res => res.should.have.status(201));

			const internalOrderId = await agent
				.get("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send()
				.then(res => res.body[0].id);

			await agent
				.get(`/api/internalOrders/${internalOrderId}`)
				.set("Cookie", "user=manager;")
				.send()
				.then(res => {
					res.should.have.status(200);
					res.body.issueDate.should.equal(internalOrder.issueDate);
					res.body.customerId.should.equal(internalOrder.customerId);
					res.body.state.should.equal("ISSUED");
					res.body.products.should.be.a('array');
					res.body.products[0].should.have.property('SKUId');
					res.body.products[0].should.have.property('description');
					res.body.products[0].should.have.property('price');
					res.body.products[0].should.have.property('qty');
					res.body.customerId.should.equal(internalOrder.customerId);
				});
		});

		it("get non existing internal order", async () => {
			const internalOrderId = 1;
			await agent
				.get(`/api/internalOrders/${internalOrderId}`)
				.set("Cookie", "user=manager;")
				.send()
				.then(res => res.should.have.status(404));
		});

		it("get internal order with invalid ID (wrong data type)", async () => {
			await agent
				.post("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send(internalOrder)
				.then(res => res.should.have.status(201));

			const internalOrderId = "wrong data type";
			await agent
				.get(`/api/internalOrders/${internalOrderId}`)
				.set("Cookie", "user=manager;")
				.send()
				.then(res => res.should.have.status(422));
		});

		/* it("get an internal order by ID without authorization", async () => {
			await agent
				.post("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send(internalOrder)
				.then(res => res.should.have.status(201));

			const internalOrderId = await agent
				.get("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send()
				.then(res => res.body[0].id);

			await agent
				.get(`/api/internalOrders/${internalOrderId}`)
				.set("Cookie", "user=invalid;")
				.send()
				.then(res => res.should.have.status(401));
		}); */
	});
}

function insertInternalOrder() {
	describe("test insert internal order", () => {
		let internalOrder;
		let skuId1;
		let skuId2;
		beforeEach(async () => {
			skuId1 = await dao.DBinsertSKU("a product", 3, 2, "note 12", 10.99, 1000);
			skuId2 = await dao.DBinsertSKU("another product", 4, 5, "note 180", 11.99, 1000);
			await dao.DBinsertSKUItem(new SKUItem("121", 1, skuId1, "11/05/2022 16:10"));
			await dao.DBinsertSKUItem(new SKUItem("122", 1, skuId1, "11/05/2022 16:20"));
			await dao.DBinsertSKUItem(new SKUItem("123", 1, skuId1, "11/05/2022 16:30"));
			await dao.DBinsertSKUItem(new SKUItem("181", 1, skuId2, "12/05/2022 17:00"));
			await dao.DBinsertSKUItem(new SKUItem("182", 1, skuId2, "12/05/2022 17:10"));
			await dao.DBinsertSKUItem(new SKUItem("183", 1, skuId2, "12/05/2022 17:30"));
			await dao.DBinsertSKUItem(new SKUItem("184", 1, skuId2, "12/05/2022 17:20"));
			await dao.DBinsertPosition(new Position(800234543422, 8002, 3454, 3422, 1000, 1000, skuId1, 100, 100));
			await dao.DBmodifySKUPosition(skuId1, 800234543422);
			await dao.DBinsertPosition(new Position(800234543423, 8002, 3454, 3423, 1000, 1000, skuId2, 100, 100));
			await dao.DBmodifySKUPosition(skuId2, 800234543423);
			internalOrder = {
				"issueDate": "2021/11/29 09:33",
				"products": [
					{ "SKUId": skuId1, "description": "a product", "price": 10.99, "qty": 3 },
					{ "SKUId": skuId2, "description": "another product", "price": 11.99, "qty": 3 }
				],
				"customerId": 1
			}
		});

		it("insert valid internal order", async () => {
			await agent
				.post("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send(internalOrder)
				.then(res => res.should.have.status(201));
		});

		it("insert invalid internal order (wrong body)", async () => {
			let invalidInternalOrder = Object.assign(Object.create(internalOrder), {
				"issueDate": 1
			});
			await agent
				.post("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send(invalidInternalOrder)
				.then(res => res.should.have.status(422));

			invalidInternalOrder = Object.assign(Object.create(internalOrder), {
				"products": [{ "SKUId": "this should be a number", "description": "another product", "price": 11.99, "qty": 3 }]
			});
			await agent
				.post("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send(invalidInternalOrder)
				.then(res => res.should.have.status(422));

			invalidInternalOrder = Object.assign(Object.create(internalOrder), {
				"products": [{ "SKUId": 1, "description": 1, "price": 11.99, "qty": 3 }]
			});
			await agent
				.post("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send(invalidInternalOrder)
				.then(res => res.should.have.status(422));

			invalidInternalOrder = Object.assign(Object.create(internalOrder), {
				"products": [{ "SKUId": 1, "description": "another product", "price": "this should be a number", "qty": 3 }]
			});
			await agent
				.post("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send(invalidInternalOrder)
				.then(res => res.should.have.status(422));

			invalidInternalOrder = Object.assign(Object.create(internalOrder), {
				"products": [{ "SKUId": 1, "description": "another product", "price": 11.99, "qty": "this should be a number" }]
			});
			await agent
				.post("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send(invalidInternalOrder)
				.then(res => res.should.have.status(422));

			invalidInternalOrder = Object.assign(Object.create(internalOrder), {
				"customerId": "this should be a number",
			});
			await agent
				.post("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send(invalidInternalOrder)
				.then(res => res.should.have.status(422));
		});

		it("insert invalid internal order (negative number)", async () => {
			let invalidInternalOrder = Object.assign(Object.create(internalOrder), {
				"products": [{ "SKUId": -1, "description": "another product", "price": 11.99, "qty": 3 }]
			});
			await agent
				.post("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send(invalidInternalOrder)
				.then(res => res.should.have.status(422));

			invalidInternalOrder = Object.assign(Object.create(internalOrder), {
				"products": [{ "SKUId": 1, "description": "another product", "price": -11.99, "qty": 3 }]
			});
			await agent
				.post("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send(invalidInternalOrder)
				.then(res => res.should.have.status(422));

			invalidInternalOrder = Object.assign(Object.create(internalOrder), {
				"products": [{ "SKUId": 1, "description": "another product", "price": 11.99, "qty": -3 }]
			});
			await agent
				.post("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send(invalidInternalOrder)
				.then(res => res.should.have.status(422));

			invalidInternalOrder = Object.assign(Object.create(internalOrder), {
				"customerId": -1,
			});
			await agent
				.post("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send(invalidInternalOrder)
				.then(res => res.should.have.status(422));
		})

		it("insert invalid internal order with missing fields", async () => {
			let invalidInternalOrder = { ...internalOrder };

			delete invalidInternalOrder.issueDate;
			await agent
				.post("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send(invalidInternalOrder)
				.then(res => res.should.have.status(422));

			delete invalidInternalOrder.products;
			await agent
				.post("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send(invalidInternalOrder)
				.then(res => res.should.have.status(422));

			delete invalidInternalOrder.customerId;
			await agent
				.post("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send(invalidInternalOrder)
				.then(res => res.should.have.status(422));
		});

		it("insert invalid internal order (non existing SKU)", async () => {
			let invalidInternalOrder = Object.assign(Object.create(internalOrder), {
				"products": [{ "SKUId": skuId1 + skuId2, "description": "another product", "price": 11.99, "qty": 3 }]
			});
			await agent
				.post("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send(invalidInternalOrder)
				.then(res => res.should.have.status(422));
		});

		/* it("insert internal order without authorization", async () => {
			await agent
				.post("/api/internalOrders")
				.set("Cookie", "user=invalid;")
				.send(internalOrder)
				.then(res => res.should.have.status(401));
		}); */
	});
}

function modifyInternalOrderState() {
	describe("test modify internal order", () => {
		let internalOrder;
		let skuId1;
		let skuId2;
		beforeEach(async () => {
			skuId1 = await dao.DBinsertSKU("a product", 3, 2, "note 12", 10.99, 1000);
			skuId2 = await dao.DBinsertSKU("another product", 4, 5, "note 180", 11.99, 1000);
			await dao.DBinsertSKUItem(new SKUItem("121", 1, skuId1, "11/05/2022 16:10"));
			await dao.DBinsertSKUItem(new SKUItem("122", 1, skuId1, "11/05/2022 16:20"));
			await dao.DBinsertSKUItem(new SKUItem("123", 1, skuId1, "11/05/2022 16:30"));
			await dao.DBinsertSKUItem(new SKUItem("181", 1, skuId2, "12/05/2022 17:00"));
			await dao.DBinsertSKUItem(new SKUItem("182", 1, skuId2, "12/05/2022 17:10"));
			await dao.DBinsertSKUItem(new SKUItem("183", 1, skuId2, "12/05/2022 17:30"));
			await dao.DBinsertSKUItem(new SKUItem("184", 1, skuId2, "12/05/2022 17:20"));
			await dao.DBinsertPosition(new Position(800234543422, 8002, 3454, 3422, 1000, 1000, skuId1, 100, 100));
			await dao.DBmodifySKUPosition(skuId1, 800234543422);
			await dao.DBinsertPosition(new Position(800234543423, 8002, 3454, 3423, 1000, 1000, skuId2, 100, 100));
			await dao.DBmodifySKUPosition(skuId2, 800234543423);
			internalOrder = {
				"issueDate": "2021/11/29 09:33",
				"products": [
					{ "SKUId": skuId1, "description": "a product", "price": 10.99, "qty": 3 },
					{ "SKUId": skuId2, "description": "another product", "price": 11.99, "qty": 3 }
				],
				"customerId": 1
			}
		});

		it("modify internal order state with state != COMPLETED", async () => {
			await agent
				.post("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send(internalOrder)
				.then(res => res.should.have.status(201));

			const internalOrderId = await agent
				.get("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send()
				.then(res => {
					return res.body[0].id;
				});

			const body = {
				"newState": "ACCEPTED"
			}
			await agent
				.put(`/api/internalOrders/${internalOrderId}`)
				.set("Cookie", "user=manager;")
				.send(body)
				.then(res => res.should.have.status(200));

			await agent
				.get(`/api/internalOrders/${internalOrderId}`)
				.set("Cookie", "user=manager;")
				.send()
				.then(res => {
					res.should.have.status(200);
					res.body.issueDate.should.equal(internalOrder.issueDate);
					res.body.customerId.should.equal(internalOrder.customerId);
					res.body.state.should.equal("ACCEPTED");
					res.body.products.should.be.a('array');
					res.body.products[0].should.have.property('SKUId');
					res.body.products[0].should.have.property('description');
					res.body.products[0].should.have.property('price');
					res.body.products[0].should.have.property('qty');
					res.body.customerId.should.equal(internalOrder.customerId);
				});
		});

		it("modify internal order state with state === COMPLETED", async () => {
			await agent
				.post("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send(internalOrder)
				.then(res => res.should.have.status(201));

			const internalOrderId = await agent
				.get("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send()
				.then(res => {
					return res.body[0].id;
				});

			const body = {
				"newState": "COMPLETED",
				"products": [
					{ "SkuID": skuId1, "RFID": "121" },
					{ "SkuID": skuId1, "RFID": "122" },
					{ "SkuID": skuId1, "RFID": "123" },
					{ "SkuID": skuId2, "RFID": "181" },
					{ "SkuID": skuId2, "RFID": "182" },
					{ "SkuID": skuId2, "RFID": "184" },
				]
			}
			await agent
				.put(`/api/internalOrders/${internalOrderId}`)
				.set("Cookie", "user=manager;")
				.send(body)
				.then(res => res.should.have.status(200));

			await agent
				.get(`/api/internalOrders/${internalOrderId}`)
				.set("Cookie", "user=manager;")
				.send()
				.then(res => {
					res.should.have.status(200);
					res.body.issueDate.should.equal(internalOrder.issueDate);
					res.body.customerId.should.equal(internalOrder.customerId);
					res.body.state.should.equal("COMPLETED");
					res.body.products.should.be.a('array');
					res.body.products[0].should.have.property('SKUId');
					res.body.products[0].should.have.property('description');
					res.body.products[0].should.have.property('price');
					res.body.products[0].should.have.property('RFID');
					res.body.customerId.should.equal(internalOrder.customerId);
				});
		});

		it("modify non existing internal order", async () => {
			const internalOrderId = 1;
			const body = {
				"newState": "ACCEPTED"
			}
			await agent
				.put(`/api/internalOrders/${internalOrderId}`)
				.set("Cookie", "user=manager;")
				.send(body)
				.then(res => res.should.have.status(404));
		});

		it("modify internal order with invalid ID (wrong data type)", async () => {
			await agent
				.post("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send(internalOrder)
				.then(res => res.should.have.status(201));

			const body = {
				"newState": "ACCEPTED"
			}
			const internalOrderId = "wrong data type";
			await agent
				.put(`/api/internalOrders/${internalOrderId}`)
				.set("Cookie", "user=manager;")
				.send(body)
				.then(res => res.should.have.status(422));
		})

		it("modify internal order (wrong body)", async () => {
			await agent
				.post("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send(internalOrder)
				.then(res => res.should.have.status(201));

			const internalOrderId = await agent
				.get("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send()
				.then(res => {
					return res.body[0].id;
				});

			let invalidBody = {
				"newState": 1,
				"products": [
					{ "SkuID": "this should be a number", "RFID": "121" },
				]
			};
			await agent
				.put(`/api/internalOrders/${internalOrderId}`)
				.set("Cookie", "user=manager;")
				.send(invalidBody)
				.then(res => res.should.have.status(422));

			invalidBody = {
				"newState": "COMPLETED",
				"products": [
					{ "SkuID": "this should be a number", "RFID": "121" },
				]
			};
			await agent
				.put(`/api/internalOrders/${internalOrderId}`)
				.set("Cookie", "user=manager;")
				.send(invalidBody)
				.then(res => res.should.have.status(422));

			invalidBody = {
				"newState": "COMPLETED",
				"products": [
					{ "SkuID": skuId1, "RFID": 121 },
				]
			};
			await agent
				.put(`/api/internalOrders/${internalOrderId}`)
				.set("Cookie", "user=manager;")
				.send(invalidBody)
				.then(res => res.should.have.status(422));
		});

		it("modify internal order (negative number of SkuID)", async () => {
			await agent
				.post("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send(internalOrder)
				.then(res => res.should.have.status(201));

			const internalOrderId = await agent
				.get("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send()
				.then(res => {
					return res.body[0].id;
				});

			let invalidBody = {
				"newState": "COMPLETED",
				"products": [
					{ "SkuID": -skuId1, "RFID": "121" },
				]
			};
			await agent
				.put(`/api/internalOrders/${internalOrderId}`)
				.set("Cookie", "user=manager;")
				.send(invalidBody)
				.then(res => res.should.have.status(422));
		});

		it("modify internal order with missing fields", async () => {
			await agent
				.post("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send(internalOrder)
				.then(res => res.should.have.status(201));

			const internalOrderId = await agent
				.get("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send()
				.then(res => {
					return res.body[0].id;
				});

			let body = {
				"newState": "COMPLETED",
				"products": [
					{ "SkuID": -skuId1, "RFID": "121" },
				]
			};
			delete body.newState;
			await agent
				.put(`/api/internalOrders/${internalOrderId}`)
				.set("Cookie", "user=manager;")
				.send(body)
				.then(res => res.should.have.status(422));
		});

		/* it("modify internal order state without authorization", async () => {
			await agent
				.post("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send(internalOrder)
				.then(res => res.should.have.status(201));

			const internalOrderId = await agent
				.get("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send()
				.then(res => {
					res.should.have.status(200);
					return res.body[0].id;
				});

			const body = {
				"newState": "ACCEPTED"
			}
			await agent
				.put(`/api/internalOrders/${internalOrderId}`)
				.set("Cookie", "user=invalid;")
				.send(body)
				.then(res => res.should.have.status(401));
		}); */
	});
}

function deleteInternalOrder() {
	describe("test delete internal order", () => {
		let internalOrder;
		beforeEach(async () => {
			let skuId1 = await dao.DBinsertSKU("a product", 3, 2, "note 12", 10.99, 1000);
			let skuId2 = await dao.DBinsertSKU("another product", 4, 5, "note 180", 11.99, 1000);
			await dao.DBinsertSKUItem(new SKUItem("121", 1, skuId1, "11/05/2022 16:10"));
			await dao.DBinsertSKUItem(new SKUItem("122", 1, skuId1, "11/05/2022 16:20"));
			await dao.DBinsertSKUItem(new SKUItem("123", 1, skuId1, "11/05/2022 16:30"));
			await dao.DBinsertSKUItem(new SKUItem("181", 1, skuId2, "12/05/2022 17:00"));
			await dao.DBinsertSKUItem(new SKUItem("182", 1, skuId2, "12/05/2022 17:10"));
			await dao.DBinsertSKUItem(new SKUItem("183", 1, skuId2, "12/05/2022 17:30"));
			await dao.DBinsertSKUItem(new SKUItem("184", 1, skuId2, "12/05/2022 17:20"));
			await dao.DBinsertPosition(new Position(800234543422, 8002, 3454, 3422, 1000, 1000, skuId1, 100, 100));
			await dao.DBmodifySKUPosition(skuId1, 800234543422);
			await dao.DBinsertPosition(new Position(800234543423, 8002, 3454, 3423, 1000, 1000, skuId2, 100, 100));
			await dao.DBmodifySKUPosition(skuId2, 800234543423);
			internalOrder = {
				"issueDate": "2021/11/29 09:33",
				"products": [
					{ "SKUId": skuId1, "description": "a product", "price": 10.99, "qty": 3 },
					{ "SKUId": skuId2, "description": "another product", "price": 11.99, "qty": 3 }
				],
				"customerId": 1
			}
		});

		it("delete internal order", async () => {
			await agent
				.post("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send(internalOrder)
				.then(res => res.should.have.status(201));

			const internalOrderId =
				await agent
					.get("/api/internalOrders")
					.set("Cookie", "user=manager;")
					.send()
					.then((res) => {
						return res.body[0].id;
					});

			await agent
				.delete(`/api/internalOrders/${internalOrderId}`)
				.set("Cookie", "user=manager;")
				.send()
				.then(res => res.should.have.status(204));
		});

		it("delete internal order with invalid ID (wrong data type)", async () => {
			await agent
				.post("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send(internalOrder)
				.then(res => res.should.have.status(201));

			const internalOrderId = "wrong data type";
			await agent
				.delete(`/api/internalOrders/${internalOrderId}`)
				.set("Cookie", "user=manager;")
				.send()
				.then(res => res.should.have.status(422));

			await agent
				.get("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send()
				.then(res => res.should.have.status(200));
		})

		it("delete non existing internal order", async () => {
			await agent
				.post("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send(internalOrder)
				.then(res => res.should.have.status(201));

			const internalOrderId =
				await agent
					.get("/api/internalOrders")
					.set("Cookie", "user=manager;")
					.send()
					.then((res) => {
						return res.body[0].id;
					});

			await agent
				.delete(`/api/internalOrders/${internalOrderId + 1}`)
				.set("Cookie", "user=manager;")
				.send()
				.then(res => res.should.have.status(204));

			await agent
				.get("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send()
				.then(res => res.should.have.status(200));
		});

		/* it("delete internal order without authorization", async () => {
			await agent
				.post("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send(internalOrder)
				.then(res => res.should.have.status(201));

			const internalOrderId =
				await agent
					.get("/api/internalOrders")
					.set("Cookie", "user=manager;")
					.send()
					.then((res) => {
						return res.body[0].id;
					});

			await agent
				.delete(`/api/internalOrders/${internalOrderId}`)
				.set("Cookie", "user=invalid;")
				.send()
				.then(res => res.should.have.status(401));

			await agent
				.get("/api/internalOrders")
				.set("Cookie", "user=manager;")
				.send()
				.then(res => res.should.have.status(200));
		}); */
	});
}


