const TestDescriptor = require("../TestDescriptor");

exports.DBinsertTestDescriptor = function (name, procedureDescription, SKUID) {
	return new Promise((resolve, reject) => {
		const SQL =
			"INSERT INTO TestDescriptor(name,procedureDescription,SKUID) VALUES(?,?,?)";
		this.db.run(
			SQL,
			[
				name,
				procedureDescription,
				SKUID
			],
			function (err) {
				if (err) reject(err);
				else resolve(this.lastID);
			}
		);
	});
}

exports.DBallTestDescriptors = function () {
	return new Promise((resolve, reject) => {
		const SQL = "SELECT * FROM TestDescriptor";
		this.db.all(SQL, [], (err, rows) => {
			if (err) reject(err);
			else {
				rows ? resolve(rows.map(
					(row) =>
						new TestDescriptor(
							row.id,
							row.name,
							row.procedureDescription,
							row.SKUID
						)
				))
				: resolve([]);
			}
		});
	});
}

exports.DBmodifyTestDescriptor = function (TestDescID, newName, newProcedureDescription, newIdSKU) {
	return new Promise((resolve, reject) => {
		const SQL =
			"UPDATE TestDescriptor SET name=?,procedureDescription=?,SKUID=? WHERE id=?";
		this.db.run(
			SQL,
			[
				newName,
				newProcedureDescription,
				newIdSKU,
				TestDescID
			],
			function (err) {
				if (err) reject(err);
				else resolve(this.lastID);
			}
		);
	});
}

exports.DBdeleteTestDescriptor = function (id) {
	return new Promise((resolve, reject) => {
		const SQL = "DELETE FROM TestDescriptor WHERE id=?";
		this.db.run(SQL, [id], (err) => {
			if (err) reject(err);
			else resolve(this.lastID);
		});
	});
}

exports.DBdeleteAllTestDescriptors = function () {
	return new Promise((resolve, reject) => {
		const sql = "DELETE FROM TestDescriptor";
		this.db.run(sql, [], function (err) {
			if (err) {
				reject(err);
			}
			resolve(true);
		});
	});
};