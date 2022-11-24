const EzWh = require("../modules/EzWh");
const SKUItem = require("../modules/Warehouse/SKUItem");
const dao = require("../modules/DAO/DAO");

const ezwh = new EzWh();

describe("integration tests of TestResult class", () => {
	beforeEach(async () => {
		await dao.DBdeleteAllSKUItems();
		await dao.DBdeleteAllTestDescriptors();
		await dao.DBdeleteAllTestResults();
	});

	testInsertTestResult("12345678901234567890123456789012", "2021/11/29", true);
	testGetAllTestResultsByRFID("12345678901234567890123456789012");
	testGetTestResultByIDandRFID();
	testModifyTestResult("2022/01/01", false);
	testDeleteTestResult();
})

function testInsertTestResult(rfid, date, result) {
	describe("test insert test result", () => {
		var testDescriptorId;
		beforeEach(async () => {
			await dao.DBinsertSKUItem(new SKUItem(rfid, 1, 1, "2021/11/29"));
			testDescriptorId = await dao.DBinsertTestDescriptor("name", "procedure description", 1);
		});

		test("insert valid test result", async () => {
			await ezwh.createTestResult(rfid, testDescriptorId, date, result);
			var testResults = await ezwh.getTestResultsByRFID(rfid);
			var testResult = testResults[0];
			expect(testResults.length).toStrictEqual(1);
			expect(testResult.RFID).toStrictEqual(rfid);
			expect(testResult.date).toStrictEqual(date);
			expect(testResult.result).toStrictEqual(result);
			expect(testResult.IDTestDescriptor).toStrictEqual(testDescriptorId);
		});

		test("insert test result with null data and existing SKUItem and TestDescriptor", async () => {
			return expect(ezwh.createTestResult(rfid, testDescriptorId, null, null)).rejects.toThrow();
		});

		test("insert test descriptor with valid data and non existing SKUitem", async () => {
			return expect(ezwh.createTestDescriptor(rfid.slice(0,31) + '9', testDescriptorId, date, result)).rejects.toBe("404");
		});

		test("insert test descriptor with valid data and non existing TestDescriptor", async () => {
			return expect(ezwh.createTestDescriptor(rfid, testDescriptorId + 1, date, result)).rejects.toBe("404");
		});
	});
}

function testGetAllTestResultsByRFID(rfid) {
	describe("test get all test results", () => {
		beforeEach(async () => {
			await dao.DBinsertSKUItem(new SKUItem(rfid, 1, 1, "2021/11/29"));
		});

		test("get all test results by RFID empty table", async () => {
			var finalSize = await ezwh.getTestResultsByRFID(rfid)
				.then(testResults => testResults.length);
			expect(finalSize).toStrictEqual(0);
		});

		test("get all test results by RFID filled table", async () => {
			testDescriptorId1 = await dao.DBinsertTestDescriptor("name 1", "procedure description 1", 1);
			testDescriptorId2 = await dao.DBinsertTestDescriptor("name 2", "procedure description 2", 1);
			await ezwh.createTestResult(rfid, testDescriptorId1, "2021/11/28", true);
			await ezwh.createTestResult(rfid, testDescriptorId2, "2021/11/27", false);

			var finalSize = await ezwh.getTestResultsByRFID(rfid)
				.then(testResults => testResults.length);
			expect(finalSize).toStrictEqual(2);
		});
	});
}

function testGetTestResultByIDandRFID() {
	describe("test get test result by id and RFID", () => {
		var rfid = "12345678901234567890123456789012";
		var date = "2021/11/29";
		var result = true;
		var testDescriptorId = 1;
		var testResultId;

		beforeEach(async () => {
			await dao.DBinsertSKUItem(new SKUItem(rfid, 1, 1, "2021/11/29"));
			testResultId = await dao.DBinsertTestResult(rfid, result, date, testDescriptorId);
		});

		test("search test result with valid test result id and RFID", async () => {
			var testResult = await ezwh.getTestResultByIDandRFID(testResultId, rfid);
			expect(testResult.RFID).toStrictEqual(rfid);
			expect(testResult.date).toStrictEqual(date);
			expect(testResult.result).toStrictEqual(result);
			expect(testResult.IDTestDescriptor).toStrictEqual(testDescriptorId);
		});

		test("search test result with valid test result id and invalid RFID", async () => {
			return expect(ezwh.getTestResultByIDandRFID(testResultId, rfid.slice(0,31) + '9')).rejects.toBe("404");
		});

		test("search test result with invalid test result id and valid RFID", async () => {
			return expect(ezwh.getTestResultByIDandRFID(testResultId + 1, rfid)).rejects.toBe("404");
		});
	});
}

function testModifyTestResult(newDate, newResult) {
	describe("test modify test result by id and RFID", () => {
		var rfid = "12345678901234567890123456789012";
		var newTestDescriptorId;
		var testResultId;

		beforeEach(async () => {
			await dao.DBinsertSKUItem(new SKUItem(rfid, 1, 1, "2021/11/29"));
			testResultId = await dao.DBinsertTestResult(rfid, true, "2021/11/29", 1);
			newTestDescriptorId = await dao.DBinsertTestDescriptor("name 2", "procedure description 2", 1); 
		});

		test("modify test result with valid test result id, RFID and newTestDescriptorId", async () => {
			await ezwh.updateTestResult(testResultId, rfid, newResult, newTestDescriptorId, newDate)
			var modifiedTestResult = await ezwh.getTestResultByIDandRFID(testResultId, rfid);
			expect(modifiedTestResult.date).toStrictEqual(newDate);
			expect(modifiedTestResult.result).toStrictEqual(newResult);
			expect(modifiedTestResult.IDTestDescriptor).toStrictEqual(newTestDescriptorId);
		});

		test("modify test result with valid test result id, RFID and invalid newTestDescriptorId", async () => {
			return expect(ezwh.updateTestResult(testResultId, rfid, newResult, newTestDescriptorId + 1, newDate)).rejects.toBe("404");
		});

		test("modify test result with valid test result id, newTestDescriptorId and invalid RFID", async () => {
			return expect(ezwh.updateTestResult(testResultId, rfid.slice(0,31) + '9', newResult, newTestDescriptorId + 1, newDate)).rejects.toBe("404");
		});

		test("modify test result with valid RFID, newTestDescriptorId and invalid test result id", async () => {
			return expect(ezwh.updateTestResult(testResultId + 1, rfid, newResult, newTestDescriptorId + 1, newDate)).rejects.toBe("404");
		});

		test("modify test result with invalid data", async () => {
			return expect(ezwh.updateTestResult(testResultId, rfid, null, newTestDescriptorId, null)).rejects.toThrow();
		});
	});
}

function testDeleteTestResult() {
	describe("test delete test result", () => {
		var testResultId;
		var rfid = "12345678901234567890123456789012";
		beforeEach(async () => {
			await dao.DBinsertSKUItem(new SKUItem(rfid, 1, 1, "2021/11/29"));
			testResultId = await dao.DBinsertTestResult(rfid, true, "2022/01/01", 1);
		});

		test("delete existing test result", async () => {
			await ezwh.deleteTestResult(testResultId, rfid);
			var finalSize = await ezwh.getTestResultsByRFID(rfid)
				.then(testResults => testResults.filter(testResult => testResult.id === testResultId).length)
			expect(finalSize).toStrictEqual(0);
		});

		test("delete non existing test result", async () => {
			var initialSize = await ezwh.getTestResultsByRFID(rfid)
				.then(testResults => testResults.filter(testResult => testResult.id === testResultId).length);
			await ezwh.deleteTestResult(testResultId + 1, rfid.slice(0,31) + '9');
			var finalSize = await ezwh.getTestResultsByRFID(rfid)
				.then(testResults => testResults.filter(testResult => testResult.id === testResultId).length)
			expect(finalSize).toStrictEqual(initialSize);
		});
	});
}
