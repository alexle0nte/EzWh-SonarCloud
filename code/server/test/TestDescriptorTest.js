const chai = require("chai");
const chaiHttp = require("chai-http");
const dao = require("../modules/DAO/DAO");
chai.use(chaiHttp);
chai.should();

const app = require("../server");
let agent = chai.request.agent(app);

describe("test TestDescriptor apis", () => {
	beforeEach(async () => {
		dao.DBdeleteAllSKU();
		dao.DBdeleteAllTestDescriptors();
	})

	getAllTestDescriptors();
	getTestDescriptorByID();
	insertTestDescriptor();
	modifyTestDescriptor();
	deleteTestDescriptor();
})

function getAllTestDescriptors() {
	describe("test get all test descriptors", () => {
		let testDescriptors;
		let testDescriptor;
		beforeEach(async () => {
			let skuId = await dao.DBinsertSKU("a description", 1, 1, "a note", 10.99, 100);
			testDescriptor = {
				"name": "test descriptor 3",
				"procedureDescription": "This test is described by...",
				"idSKU": skuId
			};
			testDescriptors = [testDescriptor, testDescriptor, testDescriptor];
		});

		it("get all test descriptors", async () => {
			for (const td of testDescriptors) {
				await agent
					.post("/api/testDescriptor")
					.set("Cookie", "user=manager;")
					.send(td)
					.then((res) => res.should.have.status(201));
			}

			await agent
				.get("/api/testDescriptors")
				.set("Cookie", "user=manager;")
				.send()
				.then(res => {
					res.should.have.status(200);
					res.body[0].name.should.equal(testDescriptor.name);
					res.body[0].procedureDescription.should.equal(testDescriptor.procedureDescription);
					res.body[0].idSKU.should.equal(testDescriptor.idSKU);
				});
		});

		it("get all test descriptors with empty db", async () => {
			await agent
				.get("/api/testDescriptors")
				.set("Cookie", "user=manager;")
				.send()
				.then(res => {
					res.should.have.status(200);
				})
		})

		/* it("get all test descriptors without authorization", async () => {
			for (const td of testDescriptors) {
				await agent
					.post("/api/testDescriptor")
					.set("Cookie", "user=manager;")
					.send(td)
					.then((res) => res.should.have.status(201));
			}

			await agent
				.get("/api/testDescriptors")
				.set("Cookie", "user=invalid;")
				.send()
				.then(res => res.should.have.status(401));
		}); */
	})
}

function getTestDescriptorByID() {
	describe("test get test descriptor by ID", () => {
		let testDescriptor;
		beforeEach(async () => {
			let skuId = await dao.DBinsertSKU("a description", 1, 1, "a note", 10.99, 100);
			testDescriptor = {
				"name": "test descriptor 3",
				"procedureDescription": "This test is described by...",
				"idSKU": skuId
			};
		});

		it("get a test descriptor by ID", async () => {
			await agent
				.post("/api/testDescriptor")
				.set("Cookie", "user=manager;")
				.send(testDescriptor)
				.then(res => res.should.have.status(201));

			const testDescriptorId = await agent
				.get("/api/testDescriptors")
				.set("Cookie", "user=manager;")
				.send()
				.then(res => res.body[0].id);

			await agent
				.get(`/api/testDescriptors/${testDescriptorId}`)
				.set("Cookie", "user=manager;")
				.send()
				.then(res => {
					res.should.have.status(200);
					res.body.name.should.equal(testDescriptor.name);
					res.body.procedureDescription.should.equal(testDescriptor.procedureDescription);
					res.body.idSKU.should.equal(testDescriptor.idSKU);
				});
		});

		it("get non existing test descriptor", async () => {
			const testDescriptorId = 1;
			await agent
				.get(`/api/testDescriptors/${testDescriptorId}`)
				.set("Cookie", "user=manager;")
				.send()
				.then(res => res.should.have.status(404));
		});

		it("get test descriptor with invalid ID (wrong data type)", async () => {
			await agent
				.post("/api/testDescriptor")
				.set("Cookie", "user=manager;")
				.send(testDescriptor)
				.then(res => res.should.have.status(201));

			const testDescriptorId = "wrong data type";
			await agent
				.get(`/api/testDescriptors/${testDescriptorId}`)
				.set("Cookie", "user=manager;")
				.send()
				.then(res => res.should.have.status(422));
		});

		/* it("get a test descriptor by ID without authorization", async () => {
			await agent
				.post("/api/testDescriptor")
				.set("Cookie", "user=manager;")
				.send(testDescriptor)
				.then(res => res.should.have.status(201));

			const testDescriptorId = await agent
				.get("/api/testDescriptors")
				.set("Cookie", "user=manager;")
				.send()
				.then(res => res.body[0].id);

			await agent
				.get(`/api/testDescriptors/${testDescriptorId}`)
				.set("Cookie", "user=invalid;")
				.send()
				.then(res => res.should.have.status(401));
		}); */
	})
}

function insertTestDescriptor() {
	describe("test insert test descriptor", () => {
		let testDescriptor;
		let skuId;
		beforeEach(async () => {
			skuId = await dao.DBinsertSKU("a description", 1, 1, "a note", 10.99, 100);
			testDescriptor = {
				"name": "test descriptor 3",
				"procedureDescription": "This test is described by...",
				"idSKU": skuId
			};
		});

		it("insert valid test descriptor", async () => {
			await agent
				.post("/api/testDescriptor")
				.set("Cookie", "user=manager;")
				.send(testDescriptor)
				.then(res => res.should.have.status(201));
		});

		it("insert invalid procedure description (wrong body)", async () => {
			let invalidTestDescriptor = Object.assign(Object.create(testDescriptor), {
				"name": 1
			});
			await agent
				.post("/api/testDescriptor")
				.set("Cookie", "user=manager;")
				.send(invalidTestDescriptor)
				.then(res => res.should.have.status(422));

			invalidTestDescriptor = Object.assign(Object.create(testDescriptor), {
				"procedureDescription": 1
			});
			await agent
				.post("/api/testDescriptor")
				.set("Cookie", "user=manager;")
				.send(invalidTestDescriptor)
				.then(res => res.should.have.status(422));

			invalidTestDescriptor = Object.assign(Object.create(testDescriptor), {
				"idSKU": "this should be a number"
			});
			await agent
				.post("/api/testDescriptor")
				.set("Cookie", "user=manager;")
				.send(invalidTestDescriptor)
				.then(res => res.should.have.status(422));
		});

		it("insert invalid test desriptor negative number", async () => {
			let invalidTestDescriptor = Object.assign(Object.create(testDescriptor), {
				"idSKU": -1
			});
			await agent
				.post("/api/testDescriptor")
				.set("Cookie", "user=manager;")
				.send(invalidTestDescriptor)
				.then(res => res.should.have.status(422));
		});

		it("insert invalid test descriptor with missing fields", async () => {
			let invalidTestDescriptor = { ...testDescriptor };

			delete invalidTestDescriptor.name;
			await agent
				.post("/api/testDescriptor")
				.set("Cookie", "user=manager;")
				.send(invalidTestDescriptor)
				.then(res => res.should.have.status(422));

			delete invalidTestDescriptor.procedureDescription;
			await agent
				.post("/api/testDescriptor")
				.set("Cookie", "user=manager;")
				.send(invalidTestDescriptor)
				.then(res => res.should.have.status(422));

			delete invalidTestDescriptor.idSKU;
			await agent
				.post("/api/testDescriptor")
				.set("Cookie", "user=manager;")
				.send(invalidTestDescriptor)
				.then(res => res.should.have.status(422));
		});

		it("insert invalid test descriptor (non existing SKU)", async () => {
			let invalidTestDescriptor = Object.assign(Object.create(testDescriptor), {
				"idSKU": skuId + 1
			});
			await agent
				.post("/api/testDescriptor")
				.set("Cookie", "user=manager;")
				.send(invalidTestDescriptor)
				.then(res => res.should.have.status(404));
		});

		/* it("insert test descriptor without authorization", async () => {
			await agent
				.post("/api/testDescriptor")
				.set("Cookie", "user=invalid;")
				.send(testDescriptor)
				.then(res => res.should.have.status(401));
		}); */
	})
}

function modifyTestDescriptor() {
	describe("test insert test descriptor", () => {
		let testDescriptor;
		let skuId1;
		let skuId2;
		beforeEach(async () => {
			skuId1 = await dao.DBinsertSKU("a description 1", 1, 1, "a note 1", 10.99, 100);
			skuId2 = await dao.DBinsertSKU("a description 2", 2, 2, "a note 2", 11.99, 100);
			testDescriptor = {
				"name": "test descriptor 3",
				"procedureDescription": "This test is described by...",
				"idSKU": skuId1
			};
		});

		it("modify test descriptor", async () => {
			await agent
				.post("/api/testDescriptor")
				.set("Cookie", "user=manager;")
				.send(testDescriptor)
				.then(res => res.should.have.status(201));

			const testDescriptorId = await agent
				.get("/api/testDescriptors")
				.set("Cookie", "user=manager;")
				.send()
				.then(res => {
					return res.body[0].id;
				});

			const body = {
				"newName": "test descriptor 1",
				"newProcedureDescription": "This test is described by...",
				"newIdSKU": skuId2
			}

			await agent
				.put(`/api/testDescriptor/${testDescriptorId}`)
				.set("Cookie", "user=manager;")
				.send(body)
				.then(res => res.should.have.status(200));

			await agent
				.get(`/api/testDescriptors/${testDescriptorId}`)
				.set("Cookie", "user=manager;")
				.send()
				.then(res => {
					res.should.have.status(200);
					res.body.name.should.equal(body.newName);
					res.body.procedureDescription.should.equal(body.newProcedureDescription);
					res.body.idSKU.should.equal(body.newIdSKU);
				});
		});

		it("modify non existing test descriptor", async () => {
			const testDescriptorId = 1;
			const body = {
				"newName": "test descriptor 1",
				"newProcedureDescription": "This test is described by...",
				"newIdSKU": skuId2
			}
			await agent
				.put(`/api/testDescriptor/${testDescriptorId}`)
				.set("Cookie", "user=manager;")
				.send(body)
				.then(res => res.should.have.status(404));
		});

		it("modify test descriptor with invalid ID (wrong data type)", async () => {
			await agent
				.post("/api/testDescriptor")
				.set("Cookie", "user=manager;")
				.send(testDescriptor)
				.then(res => res.should.have.status(201));

			const body = {
				"newName": "test descriptor 1",
				"newProcedureDescription": "This test is described by...",
				"newIdSKU": skuId2
			}

			const testDescriptorId = "wrong data type";
			await agent
				.put(`/api/testDescriptor/${testDescriptorId}`)
				.set("Cookie", "user=manager;")
				.send(body)
				.then(res => res.should.have.status(422));
		});

		it("modify test descriptor (wrong body)", async () => {
			await agent
				.post("/api/testDescriptor")
				.set("Cookie", "user=manager;")
				.send(testDescriptor)
				.then(res => res.should.have.status(201));

			const testDescriptorId = await agent
				.get("/api/testDescriptors")
				.set("Cookie", "user=manager;")
				.send()
				.then(res => {
					return res.body[0].id;
				});

			let invalidBody = {
				"newName": 1,
				"newProcedureDescription": "This test is described by...",
				"newIdSKU": skuId2
			}
			await agent
				.put(`/api/testDescriptor/${testDescriptorId}`)
				.set("Cookie", "user=manager;")
				.send(invalidBody)
				.then(res => res.should.have.status(422));

			invalidBody = {
				"newName": "test descriptor 2",
				"newProcedureDescription": 1,
				"newIdSKU": skuId2
			}
			await agent
				.put(`/api/testDescriptor/${testDescriptorId}`)
				.set("Cookie", "user=manager;")
				.send(invalidBody)
				.then(res => res.should.have.status(422));

			invalidBody = {
				"newName": "test descriptor 2",
				"newProcedureDescription": "This test is described by...",
				"newIdSKU": "this should be a number"
			}
			await agent
				.put(`/api/testDescriptor/${testDescriptorId}`)
				.set("Cookie", "user=manager;")
				.send(invalidBody)
				.then(res => res.should.have.status(422));
		});

		it("modify test descriptor (negative number of newIdSKU)", async () => {
			await agent
				.post("/api/testDescriptor")
				.set("Cookie", "user=manager;")
				.send(testDescriptor)
				.then(res => res.should.have.status(201));

			const testDescriptorId = await agent
				.get("/api/testDescriptors")
				.set("Cookie", "user=manager;")
				.send()
				.then(res => {
					return res.body[0].id;
				});

			let invalidBody = {
				"newName": "test descriptor 2",
				"newProcedureDescription": "This test is described by...",
				"newIdSKU": -skuId2
			}
			await agent
				.put(`/api/testDescriptor/${testDescriptorId}`)
				.set("Cookie", "user=manager;")
				.send(invalidBody)
				.then(res => res.should.have.status(422));
		});

		it("modify test descriptor with missing fields", async () => {
			await agent
				.post("/api/testDescriptor")
				.set("Cookie", "user=manager;")
				.send(testDescriptor)
				.then(res => res.should.have.status(201));

			const testDescriptorId = await agent
				.get("/api/testDescriptors")
				.set("Cookie", "user=manager;")
				.send()
				.then(res => {
					return res.body[0].id;
				});

			let body = {
				"newName": "test descriptor 2",
				"newProcedureDescription": "This test is described by...",
				"newIdSKU": skuId2
			}
			delete body.newName;
			await agent
				.put(`/api/testDescriptor/${testDescriptorId}`)
				.set("Cookie", "user=manager;")
				.send(body)
				.then(res => res.should.have.status(422));
		});

		it("modify test descriptor with non existing newIdSKU", async () => {
			await agent
				.post("/api/testDescriptor")
				.set("Cookie", "user=manager;")
				.send(testDescriptor)
				.then(res => res.should.have.status(201));

			const testDescriptorId = await agent
				.get("/api/testDescriptors")
				.set("Cookie", "user=manager;")
				.send()
				.then(res => {
					return res.body[0].id;
				});

			let body = {
				"newName": "test descriptor 2",
				"newProcedureDescription": "This test is described by...",
				"newIdSKU": skuId1 + skuId2
			}

			await agent
				.put(`/api/testDescriptor/${testDescriptorId}`)
				.set("Cookie", "user=manager;")
				.send(body)
				.then(res => res.should.have.status(404));
		});

		/* it("modify test descriptor without authorization", async () => {
			await agent
				.post("/api/testDescriptor")
				.set("Cookie", "user=manager;")
				.send(testDescriptor)
				.then(res => res.should.have.status(201));

			const testDescriptorId = await agent
				.get("/api/testDescriptors")
				.set("Cookie", "user=manager;")
				.send()
				.then(res => {
					return res.body[0].id;
				});

			const body = {
				"newName": "test descriptor 1",
				"newProcedureDescription": "This test is described by...",
				"newIdSKU": skuId2
			}

			await agent
				.put(`/api/testDescriptor/${testDescriptorId}`)
				.set("Cookie", "user=invalid;")
				.send(body)
				.then(res => res.should.have.status(401));
		}); */
	})
}

function deleteTestDescriptor() {
	describe("test delete test descriptor", () => {
		let testDescriptor;
		beforeEach(async () => {
			let skuId = await dao.DBinsertSKU("a description 1", 1, 1, "a note 1", 10.99, 100);
			testDescriptor = {
				"name": "test descriptor 3",
				"procedureDescription": "This test is described by...",
				"idSKU": skuId
			};
		});

		it("delete test descriptor", async () => {
			await agent
				.post("/api/testDescriptor")
				.set("Cookie", "user=manager;")
				.send(testDescriptor)
				.then(res => res.should.have.status(201));

			const testDescriptorId = await agent
				.get("/api/testDescriptors")
				.set("Cookie", "user=manager;")
				.send()
				.then(res => {
					return res.body[0].id;
				});

			await agent
				.delete(`/api/testDescriptor/${testDescriptorId}`)
				.set("Cookie", "user=manager;")
				.send()
				.then(res => res.should.have.status(204));
		});

		it("delete test descriptor with invalid ID (wrong data type)", async () => {
			await agent
				.post("/api/testDescriptor")
				.set("Cookie", "user=manager;")
				.send(testDescriptor)
				.then(res => res.should.have.status(201));

			const testDescriptorId = "wrong data type";
			await agent
				.delete(`/api/testDescriptor/${testDescriptorId}`)
				.set("Cookie", "user=manager;")
				.send()
				.then(res => res.should.have.status(422));

			await agent
				.get("/api/testDescriptors")
				.set("Cookie", "user=manager;")
				.send()
				.then(res => res.should.have.status(200));
		});

		it("delete non existing test descriptor", async () => {
			await agent
				.post("/api/testDescriptor")
				.set("Cookie", "user=manager;")
				.send(testDescriptor)
				.then(res => res.should.have.status(201));

			const testDescriptorId = await agent
				.get("/api/testDescriptors")
				.set("Cookie", "user=manager;")
				.send()
				.then(res => {
					return res.body[0].id;
				});

			await agent
				.delete(`/api/testDescriptor/${testDescriptorId + 1}`)
				.set("Cookie", "user=manager;")
				.send()
				.then(res => res.should.have.status(204));

			await agent
				.get("/api/testDescriptors")
				.set("Cookie", "user=manager;")
				.send()
				.then(res => res.should.have.status(200));
		});

		/* it("delete test descriptor without authorization", async () => {
			await agent
				.post("/api/testDescriptor")
				.set("Cookie", "user=manager;")
				.send(testDescriptor)
				.then(res => res.should.have.status(201));

			const testDescriptorId = await agent
				.get("/api/testDescriptors")
				.set("Cookie", "user=manager;")
				.send()
				.then(res => {
					return res.body[0].id;
				});

			await agent
				.delete(`/api/testDescriptor/${testDescriptorId}`)
				.set("Cookie", "user=invalid;")
				.send()
				.then(res => res.should.have.status(401));

			await agent
				.get("/api/testDescriptors")
				.set("Cookie", "user=manager;")
				.send()
				.then(res => res.should.have.status(200));
		}); */
	})
}