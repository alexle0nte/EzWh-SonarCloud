const EzWh = require("../modules/EzWh");
const dao = require("../modules/DAO/DAO");

const ezwh = new EzWh();

describe("integration tests of TestDescriptor class", () => {
	beforeEach(async () => {
		await dao.DBdeleteAllSKU();
		await dao.DBdeleteAllTestDescriptors();
	});

	testInsertTestDescriptor("name", "procedure description");
	testGetAllTestDescriptors();
	testGetTestDescriptorByID();
	testModifyTestDescriptor("new name", "new procedure description");
	testDeleteTestDescriptor();
})

function testInsertTestDescriptor(name, procedureDescription) {
	describe("test insert test desciptor", () => {
		var skuId;
		beforeEach(async () => {
			skuId = await dao.DBinsertSKU("description 1", 1, 2, "note 1", 1, 1);
		});
		
		test("insert valid test descriptor", async () => {
			await ezwh.createTestDescriptor(name, procedureDescription, skuId);
			var testDescriptors = await ezwh.getTestDescriptors();
			var testDescriptor = testDescriptors[0];
			expect(testDescriptors.length).toStrictEqual(1);
			expect(testDescriptor.name).toStrictEqual(name);
			expect(testDescriptor.procedureDescription).toStrictEqual(procedureDescription);
			expect(testDescriptor.SKUID).toStrictEqual(skuId);
		});

		test("insert test descriptor with null data and existing SKU", async () => {
			return expect(ezwh.createTestDescriptor(null, null, skuId)).rejects.toThrow();
		});

		test("insert test descriptor with valid data and non existing SKU", async () => {
			return expect(ezwh.createTestDescriptor(name, procedureDescription, skuId + 1)).rejects.toBe("404");
		});
	});
}

function testGetAllTestDescriptors() {
	test("get all test descriptors empty table", async () => {
		var finalSize = await ezwh.getTestDescriptors()
			.then(testDescriptors => testDescriptors.length);
		expect(finalSize).toStrictEqual(0);
	});

	test("get all test descriptors filled table", async () => {
		var skuId = await dao.DBinsertSKU("description 1", 1, 2, "note 1", 1, 1);
		await ezwh.createTestDescriptor("test descriptor 1", "procedure description 1", skuId);
		await ezwh.createTestDescriptor("test descriptor 2", "procedure description 2", skuId);
		await ezwh.createTestDescriptor("test descriptor 3", "procedure description 3", skuId);

		var finalSize = await ezwh.getTestDescriptors()
			.then(testDescriptors => testDescriptors.length);
		expect(finalSize).toStrictEqual(3);
	});
}

function testGetTestDescriptorByID() {
	describe("test get test descriptor by id", () => {
		var name = "name";
		var procedureDescription = "procedure description";
		var skuId;
		var testDescriptorId;

		beforeEach(async () => {
			skuId = await dao.DBinsertSKU("description 1", 1, 2, "note 1", 1, 1);
			testDescriptorId = await dao.DBinsertTestDescriptor(name, procedureDescription, skuId);
		});
		
		test("search test descriptor with valid id", async () => {
			var testDescriptor = await ezwh.getTestDescriptorByID(testDescriptorId);
			expect(testDescriptor.name).toStrictEqual(name);
			expect(testDescriptor.procedureDescription).toStrictEqual(procedureDescription);
			expect(testDescriptor.SKUID).toStrictEqual(skuId);
		});

		test("search non existing test descriptor", async () => {
			var testDescriptor = await ezwh.getTestDescriptorByID(testDescriptorId + 1);
			expect(testDescriptor).toStrictEqual(undefined);
		});
	});
}

function testModifyTestDescriptor(newName, newProcedureDescription) {
	describe("test modify test descriptor", () => {
		var name = "name";
		var procedureDescription = "procedure description";
		var skuId;
		var testDescriptorId;

		beforeEach(async () => {
			skuId = await dao.DBinsertSKU("description 1", 1, 2, "note 1", 1, 1);
			testDescriptorId = await dao.DBinsertTestDescriptor(name, procedureDescription, skuId+1);
		});

		test("modify test descriptor with valid test descriptor id and valid SKU id ", async () => {
			await ezwh.modifyTestDescriptor(testDescriptorId, newName, newProcedureDescription, skuId)
			var modifiedTestDescriptor = await ezwh.getTestDescriptorByID(testDescriptorId);
			expect(modifiedTestDescriptor.name).toStrictEqual(newName);
			expect(modifiedTestDescriptor.procedureDescription).toStrictEqual(newProcedureDescription);
			expect(modifiedTestDescriptor.SKUID).toStrictEqual(skuId);
		});
		
		test("modify test descriptor with invalid test descriptor id and valid SKU id ", async () => {
			return expect(ezwh.modifyTestDescriptor(testDescriptorId + 1, newName, newProcedureDescription, skuId)).rejects.toBe("404");
		});

		test("modify test descriptor with valid test descriptor id and invalid SKU id", async () => {
			return expect(ezwh.modifyTestDescriptor(testDescriptorId, newName, newProcedureDescription, skuId + 2)).rejects.toBe("404");
		});

		test("modify test descriptor with invalid data", async () => {
			return expect(ezwh.modifyTestDescriptor(testDescriptorId, null, null, skuId)).rejects.toThrow();
		});
	});
}

function testDeleteTestDescriptor() {
	describe("test delete test descriptor", () => {
		var testDescriptorId;
		beforeEach(async () => {
			testDescriptorId = await dao.DBinsertTestDescriptor("name", "procedureDescription", 1);
		});

		test("delete existing test descriptor", async () => {
			await ezwh.deleteTestDescriptor(testDescriptorId);
			var finalSize = await ezwh.getTestDescriptors()
				.then(testDescriptors => testDescriptors.filter(testDescriptor => testDescriptor.id === testDescriptorId).length)
			expect(finalSize).toStrictEqual(0);
		});

		test("delete non existing test descriptor", async () => {
			var initialSize = await ezwh.getTestDescriptors()
				.then(testDescriptors => testDescriptors.filter(testDescriptor => testDescriptor.id === testDescriptorId).length);
			await ezwh.deleteTestDescriptor(testDescriptorId + 1);
			var finalSize = await ezwh.getTestDescriptors()
				.then(testDescriptors => testDescriptors.filter(testDescriptor => testDescriptor.id === testDescriptorId).length)
			expect(finalSize).toStrictEqual(initialSize);
		});
	});
}


