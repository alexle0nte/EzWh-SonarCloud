"use strict";

const ReturnOrder = require("../ReturnOrders");

exports.DBinsertReturnOrder = function (returnDate, products, restockOrderId) {
  return new Promise((resolve, reject) => {
    const SQL =
      "INSERT INTO ReturnOrder(returnDate, items, restockId) VALUES(?,?,?)";
    this.db.run(
      SQL,
      [returnDate, JSON.stringify(products), restockOrderId],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

exports.DBallReturnOrders = function () {
  return new Promise((resolve, reject) => {
    const SQL = "SELECT * FROM ReturnOrder";
    this.db.all(SQL, [], (err, rows) => {
      if (err) reject(err);
      else {
        const returnOrders = rows.map(
          (row) =>
            new ReturnOrder(
              row.id,
              row.returnDate,
              JSON.parse(row.items),
              row.restockId
            )
        );
        resolve(returnOrders);
      }
    });
  });
}

exports.DBgetReturnOrderByID = function (id) {
  return new Promise((resolve, reject) => {
    const SQL = "SELECT * FROM ReturnOrder WHERE id=?";
    this.db.all(SQL, [id], (err, row) => {
      if (err) reject(err);
      else {
        row.length > 0
          ? resolve(
            new ReturnOrder(
              row[0].id,
              row[0].returnDate,
              JSON.parse(row[0].items),
              row[0].restockId
            )
          )
          : resolve(null);
      }
    });
  });
}

exports.DBdeleteReturnOrder = function (id) {
  return new Promise((resolve, reject) => {
    const SQL = "DELETE FROM ReturnOrder WHERE id=?";
    this.db.run(SQL, [id], (err) => {
      if (err){
        reject(err);
      return;
      }
      else
        resolve(this.lastID);
    });
  });
}

exports.DBdeleteAllReturnOrders = function () {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM ReturnOrder";
    this.db.run(sql, [], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(true);
    });
  });
}