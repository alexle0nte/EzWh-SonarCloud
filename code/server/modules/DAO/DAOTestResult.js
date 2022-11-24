const TestResult = require("../TestResult");

exports.DBinsertTestResult = function (RFID, result, date, IDTestDescriptor) {
	return new Promise((resolve, reject) => {
		const SQL =
			"INSERT INTO TestResult(RFID,result,date,IDTestDescriptor) VALUES(?,?,?,?)";
		this.db.run(
			SQL,
			[
				RFID,
				result === true ? "true" : "false",
				date,
				IDTestDescriptor
			],
			function (err) {
				if (err) reject(err);
				else resolve(this.lastID);
			}
		);
	});
}

exports.DBallTestResults = function () {
	return new Promise((resolve, reject) => {
		const SQL = "SELECT * FROM TestResult";
		this.db.all(SQL, [], (err, rows) => {
			if (err) reject(err);
			else {
				rows ? resolve(rows.map(
					(row) =>
						new TestResult(
							row.id,
							row.RFID,
							row.result === "true" ? true : false,
							row.date,
							row.IDTestDescriptor
						)
				))
				: resolve([]);
			}
		});
	});
}

exports.DBmodifyTestResult = function (TestRID, RFID, newResult, newDate, newTestDescriptor) {
	return new Promise((resolve, reject) => {
		const SQL =
			"UPDATE TestResult SET result=?,date=?,IDTestDescriptor=? WHERE id=? AND RFID=?";
		this.db.run(
			SQL,
			[
				newResult === true ? "true" : "false",
				newDate,
				newTestDescriptor,
				TestRID,
				RFID,
			],
			function (err) {
				if (err) reject(err);
				else resolve(this.lastID);
			}
		);
	});
}

exports.DBdeleteTestResult = function (TestRID, RFID) {
	return new Promise((resolve, reject) => {
		const SQL = "DELETE FROM TestResult WHERE id=? AND RFID=?";
		this.db.run(SQL, [TestRID, RFID], (err) => {
			if (err) reject(err);
			else resolve(this.lastID);
		});
	});
}

exports.DBdeleteAllTestResults = function () {
	return new Promise((resolve, reject) => {
		const sql = "DELETE FROM TestResult";
		this.db.run(sql, [], function (err) {
			if (err) reject(err);
			else resolve(true);
		});
	});
};
