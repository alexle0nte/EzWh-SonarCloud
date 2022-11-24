const DAO = require("../modules/DAO/DAO");

describe("test DAOTestDescriptor", () => {
	beforeEach(async () => {
		await DAO.DBdeleteAllTestDescriptors();
	})

	testNewTestDescriptor("test 1", "procedure description", 1);
	testGetAllTestDescriptors();
	testModifyTestDescriptor("new name", "new procedure description", 2);
	testDeleteTestDescriptor();
});

function testNewTestDescriptor(
	name,
	procedureDescription,
	SKUID
) {
	test("insert valid test descriptor", async () => {
		await DAO.DBinsertTestDescriptor(
			name,
			procedureDescription,
			SKUID
		);
		var testDescriptors = await DAO.DBallTestDescriptors();
		var testDescriptor = testDescriptors[0];
		expect(testDescriptors.length).toStrictEqual(1);
		expect(testDescriptor.name).toStrictEqual(name);
		expect(testDescriptor.procedureDescription).toStrictEqual(procedureDescription);
		expect(testDescriptor.SKUID).toStrictEqual(SKUID);
	});

	test("insert invalid test descriptor", async () => {
		return expect(DAO.DBinsertTestDescriptor(null, null, null)).rejects.toThrow();
	});
}


function testGetAllTestDescriptors() {
	test("get all test descriptors empty table", async () => {
		var finalSize = await DAO.DBallTestDescriptors().then(testDescriptors => testDescriptors.length);
		expect(finalSize).toStrictEqual(0);
	});

	test("get all test descriptors filled table", async () => {
		await DAO.DBinsertTestDescriptor("name1", "procedure description 1", 1);
		await DAO.DBinsertTestDescriptor("name2", "procedure description 2", 2);
		await DAO.DBinsertTestDescriptor("name3", "procedure description 3", 3);
		await DAO.DBinsertTestDescriptor("name4", "procedure description 4", 4);

		var finalSize = await DAO.DBallTestDescriptors().then(testDescriptors => testDescriptors.length);
		expect(finalSize).toStrictEqual(4);
	});
}

function testModifyTestDescriptor(
	newName,
	newProcedureDescription,
	newIdSKU
) {
	describe("modify test descriptor", () => {
		var testDescriptorId;
		var name = "name";
		var procedureDescription = "procedure descriptrion";
		var SKUID = 1;

		beforeEach(async () => {
			testDescriptorId = await DAO.DBinsertTestDescriptor(name, procedureDescription, SKUID);
		});

		test("modify existing test descriptor", async () => {
			await DAO.DBmodifyTestDescriptor(
				testDescriptorId,
				newName,
				newProcedureDescription,
				newIdSKU
			);

			var modifiedTestDescriptor = await DAO.DBallTestDescriptors()
				.then(testDescriptors => testDescriptors.filter(testDescriptor => testDescriptor.id === testDescriptorId)[0]);
			expect(modifiedTestDescriptor.name).toStrictEqual(newName);
			expect(modifiedTestDescriptor.procedureDescription).toStrictEqual(newProcedureDescription);
			expect(modifiedTestDescriptor.SKUID).toStrictEqual(newIdSKU);
		});

		test("modify non existing test descriptor", async () => {
			await DAO.DBmodifyTestDescriptor(
				testDescriptorId + 1,
				newName,
				newProcedureDescription,
				newIdSKU
			);

			var modifiedTestDescriptor = await DAO.DBallTestDescriptors()
				.then(testDescriptors => testDescriptors.filter(testDescriptor => testDescriptor.id === testDescriptorId)[0]);
			expect(modifiedTestDescriptor.name).toStrictEqual(name);
			expect(modifiedTestDescriptor.procedureDescription).toStrictEqual(procedureDescription);
			expect(modifiedTestDescriptor.SKUID).toStrictEqual(SKUID);
		});

		test("modify test descriptor with null data", async () => {
			return expect(DAO.DBmodifyTestDescriptor(
				testDescriptorId,
				null,
				null,
				null
			)).rejects.toThrow();
		});

		test("modify non existing test descriptor with null data", async () => {
			await DAO.DBmodifyTestDescriptor(
				testDescriptorId + 1,
				null,
				null,
				null
			);

			var modifiedTestDescriptor = await DAO.DBallTestDescriptors()
				.then(testDescriptors => testDescriptors.filter(testDescriptor => testDescriptor.id === testDescriptorId)[0]);
			expect(modifiedTestDescriptor.name).toStrictEqual(name);
			expect(modifiedTestDescriptor.procedureDescription).toStrictEqual(procedureDescription);
			expect(modifiedTestDescriptor.SKUID).toStrictEqual(SKUID);
		});
	})
}

function testDeleteTestDescriptor() {
	describe("modify test descriptor", () => {
		var testDescriptorId;

		beforeEach(async () => {
			testDescriptorId = await DAO.DBinsertTestDescriptor("name", "procedureDescription", 1);
		});

		test("delete existing test descriptor", async () => {
			await DAO.DBdeleteTestDescriptor(testDescriptorId);
			var finalSize = await DAO.DBallTestDescriptors()
				.then(testDescriptors => testDescriptors.filter(testDescriptor => testDescriptor.id === testDescriptorId).length)
			expect(finalSize).toStrictEqual(0);
		});

		test("delete non existing test descriptor", async () => {
			var initialSize = await DAO.DBallTestDescriptors()
				.then(testDescriptors => testDescriptors.filter(testDescriptor => testDescriptor.id === testDescriptorId).length);
			await DAO.DBdeleteTestDescriptor(testDescriptorId + 1);
			var finalSize = await DAO.DBallTestDescriptors()
				.then(testDescriptors => testDescriptors.filter(testDescriptor => testDescriptor.id === testDescriptorId).length)
			expect(finalSize).toStrictEqual(initialSize);
		});
	});
}



