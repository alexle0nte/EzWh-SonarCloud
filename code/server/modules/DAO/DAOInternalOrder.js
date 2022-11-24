const InternalOrder = require("../InternalOrders");
const SKU = require("../Warehouse/SKU");

/********************************************************************
 *              INTERNAL ORDER PRODUCT
 *******************************************************************/

exports.DBinsertInternalOrder = function (issueDate, state, customerID) {
	return new Promise((resolve, reject) => {
		const SQL =
			"INSERT INTO InternalOrder(issueDate, state, customerID) VALUES(?,?,?)";
		this.db.run(
			SQL,
			[
				issueDate,
				state,
				customerID,
			],
			function (err) {
				if (err) reject(err);
				else resolve(this.lastID);
			}
		);
	});
}

exports.DBallInternalOrders = function () {
	return new Promise((resolve, reject) => {
		const SQL = "SELECT * FROM InternalOrder";
		this.db.all(SQL, [], (err, rows) => {
			if (err) reject(err);
			else {
				rows ? resolve(rows.map(
					(row) =>
						new InternalOrder(
							row.id,
							row.issueDate,
							row.state,
							null,
							null,
							row.customerID
						)
				))
				: resolve([]);
			}
		});
	});
}

exports.DBgetInternalOrderbyID = function (id) {
	return new Promise((resolve, reject) => {
		const sql = "SELECT * FROM InternalOrder WHERE id=?";
		this.db.get(sql, [id], (err, row) => {
			if (err) reject(err);
			else {
				row ? resolve(new InternalOrder(
					row.id,
					row.issueDate,
					row.state,
					null,
					null,
					row.customerID
				)) : resolve(null)
			}
		});
	});
}

exports.DBmodifyInternalOrderState = function (id, newState) {
	return new Promise((resolve, reject) => {
		const SQL = "UPDATE InternalOrder SET state=? WHERE id=?";
		this.db.run(SQL, [newState, id], function (err) {
			if (err) reject(err);
			else resolve(this.lastID);
		});
	});
}

exports.DBdeleteInternalOrder = function (id) {
	return new Promise((resolve, reject) => {
		const SQL = "DELETE FROM InternalOrder WHERE id=?";
		this.db.run(SQL, [id], (err) => {
			if (err) reject(err);
			else resolve(this.lastID);
		});
	});
}

exports.DBdeleteAllInternalOrders = function () {
	return new Promise((resolve, reject) => {
		const sql = "DELETE FROM InternalOrder";
		this.db.run(sql, [], function (err) {
			if (err) {
				reject(err);
				return;
			}
			resolve(true);
		});
	});
};

/********************************************************************
 *              INTERNAL ORDER PRODUCT
 *******************************************************************/

exports.DBinsertInternalOrderProduct = function (id, sku, quantity, rfids) {
	return new Promise((resolve, reject) => {
		const SQL =
			"INSERT INTO InternalOrderProduct(internalOrderID, SKUID, quantity, RFIDs, description, price) VALUES(?,?,?,?,?,?)";
		this.db.run(
			SQL,
			[id, sku.id, quantity, rfids.toString(), sku.description, sku.price],
			function (err) {
				if (err) reject(err);
				else resolve(id);
			}
		);
	});
}

exports.DBgetInternalOrderProductsByID = function (id) {
	return new Promise((resolve, reject) => {
		const SQL = "SELECT * FROM InternalOrderProduct WHERE internalOrderID=?";
		this.db.all(SQL, [id], (err, rows) => {
			if (err) reject(err);
			else {
				let SKUQuantity = new Map();
				let SKURFIDs = new Map();
				if (rows.length !== 0) {
					rows.forEach(row => {
						let sku = new SKU(
							row.SKUID, 
							row.description, 
							null, 
							null, 
							null, 
							null, 
							row.price, 
							null
						);
						SKUQuantity.set(sku, row.quantity);
						SKURFIDs.set(sku, row.RFIDs.split(","));
					})
					resolve({"SKUQuantity": SKUQuantity, "SKURFIDs": SKURFIDs});	
				}
				else resolve({"SKUQuantity": new Map(), "SKURFIDs": new Map()});
			}
		});
	});
}

exports.DBdeleteInternalOrderProducts = function (internalOrderID) {
	return new Promise((resolve, reject) => {
		const SQL = "DELETE FROM InternalOrderProduct WHERE internalOrderID=?";
		this.db.run(SQL, [internalOrderID], (err) => {
			if (err) reject(err);
			else resolve(this.lastID);
		});
	});
}

exports.DBdeleteAllInternalOrderProducts = function () {
	return new Promise((resolve, reject) => {
		const sql = "DELETE FROM InternalOrderProduct";
		this.db.run(sql, [], function (err) {
			if (err) {
				reject(err);
				return;
			}
			resolve(true);
		});
	});
}


