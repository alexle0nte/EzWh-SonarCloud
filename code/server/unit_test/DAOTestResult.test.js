const DAO = require("../modules/DAO/DAO");

describe("test DAOTestResult", () => {
	beforeEach(async () => {
		await DAO.DBdeleteAllTestResults();
	})

	testNewTestResult("12345678901234567890123456789012", true, "2021/11/29", 14);
	testGetAllTestResults()
	testModifyTestResult(false, "2022/01/01", 15);
	testDeleteTestResult();
});

function testNewTestResult(
	RFID,
	result,
	date,
	IDTestDescriptor
) {
	test("insert valid test result", async () => {
		await DAO.DBinsertTestResult(RFID, result, date, IDTestDescriptor);
		var testResults = await DAO.DBallTestResults();
		var testResult = testResults[0];
		expect(testResults.length).toStrictEqual(1);
		expect(testResult.RFID).toStrictEqual(RFID);
		expect(testResult.result).toStrictEqual(result);
		expect(testResult.date).toStrictEqual(date);
		expect(testResult.IDTestDescriptor).toStrictEqual(IDTestDescriptor);
	});

	test("insert invalid test result", async () => {
		return expect(DAO.DBinsertTestResult(null, null, null, null)).rejects.toThrow();
	});
}

function testGetAllTestResults() {
	test("get all test results with empty table", async () => {
		var finalSize = await DAO.DBallTestResults().then(testResults => testResults.length);
		expect(finalSize).toStrictEqual(0);
	});

	test("get all test results filled table", async () => {
		await DAO.DBinsertTestResult("12341234123412341234123412341234", true, "2021/11/29", 1);
		await DAO.DBinsertTestResult("56785678567856785678567856785678", false, "2021/12/28", 2);
		await DAO.DBinsertTestResult("90989098909890989098909890989098", true, "2021/01/27", 3);
		await DAO.DBinsertTestResult("76547654765476547654765476547654", false, "2021/02/26", 4);

		var finalSize = await DAO.DBallTestResults().then(testResults => testResults.length);
		expect(finalSize).toStrictEqual(4);
	});
}

function testModifyTestResult(
	newResult,
	newDate,
	newIDTestDescriptor
) {
	describe("modify test result", () => {
		var testResultId;
		var RFID = "12345678901234567890123456789012";
		var result = true;
		var date = "2021/11/29";
		var IDTestDescriptor = 14;

		beforeEach(async () => {
			testResultId = await DAO.DBinsertTestResult(RFID, result, date, IDTestDescriptor);
		});

		test("modify existing test result", async () => {
			await DAO.DBmodifyTestResult(testResultId, RFID, newResult, newDate, newIDTestDescriptor);

			const modifiedTestResult = await DAO.DBallTestResults()
				.then(testResults => testResults.filter(testResult => (testResult.id === testResultId && testResult.RFID === RFID))[0]);

			expect(modifiedTestResult.result).toStrictEqual(newResult);
			expect(modifiedTestResult.date).toStrictEqual(newDate);
			expect(modifiedTestResult.IDTestDescriptor).toStrictEqual(newIDTestDescriptor);
		});

		test("modify non existing test result", async () => {
			await DAO.DBmodifyTestResult(testResultId + 1, RFID.slice(0, 31) + '9', newResult, newDate, newIDTestDescriptor);

			const modifiedTestResult = await DAO.DBallTestResults()
				.then(testResults => testResults.filter(testResult => (testResult.id === testResultId && testResult.RFID === RFID))[0]);

			expect(modifiedTestResult.result).toStrictEqual(result);
			expect(modifiedTestResult.date).toStrictEqual(date);
			expect(modifiedTestResult.IDTestDescriptor).toStrictEqual(IDTestDescriptor);
		});

		test("modify test result with null data", async () => {
			return expect(DAO.DBmodifyTestResult(testResultId, RFID, null, null, null))
				.rejects.toThrow();
		});

		test("modify non existing test result with null data", async () => {
			await DAO.DBmodifyTestResult(testResultId + 1, RFID.slice(0, 31) + '9', null, null, null);

			const modifiedTestResult = await DAO.DBallTestResults()
				.then(testResults => testResults.filter(testResult => (testResult.id === testResultId && testResult.RFID === RFID))[0]);

			expect(modifiedTestResult.result).toStrictEqual(result);
			expect(modifiedTestResult.date).toStrictEqual(date);
			expect(modifiedTestResult.IDTestDescriptor).toStrictEqual(IDTestDescriptor);
		});
	});
}

function testDeleteTestResult() {
	describe("delete test result", () => {
		var testResultId;
		var RFID = "12345678901234567890123456789012";
		var result = true;
		var date = "2021/11/29";
		var IDTestDescriptor = 14;

		beforeEach(async () => {
			testResultId = await DAO.DBinsertTestResult(RFID, result, date, IDTestDescriptor);
		});

		test("delete existing test result", async () => {
			await DAO.DBdeleteTestResult(testResultId, RFID);
			var finalSize = await DAO.DBallTestResults()
				.then(testResults => testResults.filter(testResult => testResult.id === testDescriptorId).length)
			expect(finalSize).toStrictEqual(0);
		});

		test("delete non existing test result", async () => {
			var initialSize = await DAO.DBallTestResults()
				.then(testDescriptors => testDescriptors.filter(testResult => testResult.id === testResultId).length);
			await DAO.DBdeleteTestResult(testResultId + 1, RFID.slice(0, 31) + '9');
			var finalSize = await DAO.DBallTestResults()
				.then(testResults => testResults.filter(testResult => testResult.id === testResultId).length)
			expect(finalSize).toStrictEqual(initialSize);
		});
	});
}

