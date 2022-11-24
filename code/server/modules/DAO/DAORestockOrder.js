"use strict";

const RestockOrder = require("../RestockOrders");

exports.DBinsertRestockOrder = function (issueDate, state, supplierId, item_Quantity) {
  return new Promise((resolve, reject) => {
    const SQL =
      "INSERT INTO RestockOrder(issueDate, state, supplierId, item_Quantity) VALUES(?,?,?,?)";
    this.db.run(
      SQL,
      [
        issueDate,
        state,
        supplierId,
        JSON.stringify(Array.from(item_Quantity.entries())),
      ],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

exports.DBallRestockOrders = function () {
  return new Promise((resolve, reject) => {
    const SQL = "SELECT * FROM RestockOrder";
    this.db.all(SQL, [], (err, rows) => {
      if (err) reject(err);
      else {
        const restockOrders = rows.map(
          (row) =>
            new RestockOrder(
              row.id,
              row.issueDate,
              row.state,
              row.supplierId,
              row.item_RFID,
              row.transportNote,
              new Map(JSON.parse(row.item_Quantity)),
            )
        );
        resolve(restockOrders);
      }
    });
  });
}

exports.DBallRestockOrdersByState = function (state) {
  return new Promise((resolve, reject) => {
    const SQL = "SELECT * FROM RestockOrder WHERE state=?";
    this.db.all(SQL, [state], (err, rows) => {
      if (err) reject(err);
      else {
        const restockOrders = rows.map(
          (row) =>
            new RestockOrder(
              row.id,
              row.issueDate,
              row.state,
              row.supplierId,
              row.item_RFID,
              row.transportNote,
              new Map(JSON.parse(row.item_Quantity)),
            )
        );
        resolve(restockOrders);
      }
    });
  });
}

exports.DBgetRestockOrderByID = function (id) {
  return new Promise((resolve, reject) => {
    const SQL = "SELECT * FROM RestockOrder WHERE id=?";
    this.db.all(SQL, [id], (err, row) => {
      if (err) reject(err);
      else {
        row.length > 0
          ? resolve(
            new RestockOrder(
              row[0].id,
              row[0].issueDate,
              row[0].state,
              row[0].supplierId,
              row[0].item_RFID,
              row[0].transportNote,
              new Map(JSON.parse(row[0].item_Quantity)),
            )
          )
          : resolve(null);
      }
    });
  });
}

exports.DBmodifyRestockOrderState = function (id, state) {
  return new Promise((resolve, reject) => {
    const SQL = "UPDATE RestockOrder SET state=? WHERE id=?";
    this.db.run(SQL, [state, id], function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
}

exports.DBaddSKUItemToRestockOrder = function (id, item) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM RestockOrder WHERE id=?";
    this.db.all(sql, [id], (err, rows) => {
      if (err) reject(err);
      else {
        if (rows.length > 0) {
          if (rows[0].state === "DELIVERED") {
            let str1 = rows[0].item_RFID;
            if (str1 !== new Map()) {
              let map = new Map(JSON.parse(str1));
              let arr = Array.from(map.values());
              Array.prototype.push.apply(arr, item);
              arr.sort((a, b) => {
                return a.SKUId - b.SKUId;
              });
              let merged = new Map(Object.entries(arr));
              str1 = JSON.stringify(Array.from(merged.entries()));
            } else {
              let ma = new Map(Object.entries(item));
              str1 = JSON.stringify(Array.from(ma.entries()));
            }
            const SQL = "UPDATE RestockOrder SET item_RFID=? WHERE id=?";
            this.db.run(SQL, [str1, id], function (err) {
              if (err) reject(err);
              else resolve(this.lastID);
            });
          } else{
            //console.log("restock order state is not DELIVERED")
            resolve(null);
          }
        }
      }
    });
  });
}

exports.DBaddtransportNote = function (id, transportNote) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM RestockOrder WHERE id=?";
    this.db.all(sql, [id], (err, rows) => {
      if (err) reject(err);
      else {
        if (rows.length > 0) {
          if (rows[0].state === "DELIVERY" && rows[0].issueDate.split(' ')[0].localeCompare(transportNote) === -1) {
            const SQL = "UPDATE RestockOrder SET transportNote=? WHERE id=?";
            this.db.run(SQL, [transportNote, id], function (err) {
              if (err) reject(err);
              else resolve(this.lastID);
            });
          } else
            resolve(null);
        }else 
        resolve(-1);
      }
    });
  });
}

exports.DBdeleteRestockOrder = function (id) {
  return new Promise((resolve, reject) => {
    const SQL = "DELETE FROM RestockOrder WHERE id=?";
    this.db.run(SQL, [id], (err) => {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
}

exports.DBdeleteAllRestockOrders = function () {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM RestockOrder";
    this.db.run(sql, [], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(true);
    });
  });
}