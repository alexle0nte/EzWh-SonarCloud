const SKUItem = require("../Warehouse/SKUItem");

exports.DBinsertSKUItem = function (SKUItem) {
  return new Promise((resolve, reject) => {
    const SQL =
      "INSERT INTO SKUItem(RFID,available,SKUID,dateOfStock,associatedToIO) VALUES(?,?,?,?,?)";
    this.db.run(
      SQL,
      [SKUItem.RFID, SKUItem.available, SKUItem.SKUID, SKUItem.dateOfStock, 0],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
};

exports.DBallSKUItems = function () {
  return new Promise((resolve, reject) => {
    const SQL = "SELECT * FROM SKUItem";

    this.db.all(SQL, [], (err, rows) => {
      if (err) reject(err);
      else {
        const sku = rows.map(
          (row) =>
            new SKUItem(row.RFID, row.available, row.SKUID, row.dateOfStock)
        );
        resolve(sku);
      }
    });
  });
};

exports.DBmodifySKUItem = function (oldRFID, SKUItem) {
  return new Promise((resolve, reject) => {
    const SQL =
      "UPDATE SKUItem SET RFID=?,available=?,SKUID=?,dateOfStock=? WHERE rfid=?";
    this.db.run(
      SQL,
      [
        SKUItem.RFID,
        SKUItem.available,
        SKUItem.SKUID,
        SKUItem.dateOfStock,
        oldRFID,
      ],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
};

exports.DBdeleteSKUItem = function (rfid) {
  return new Promise((resolve, reject) => {
    const SQL = "DELETE FROM SKUItem WHERE rfid=?";
    this.db.run(SQL, [rfid], function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
};

exports.DBgetSKUItemFIFO = function (SKUID, quantity) {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT * FROM SKUItem WHERE SKUID=? AND available=1 AND associatedToIO=0";
    this.db.all(sql, [SKUID], (err, rows) => {
      if (err) reject(err);
      else {
        let skuItems = rows
          .map(
            (row) =>
              new SKUItem(row.RFID, row.available, row.SKUID, row.dateOfStock)
          )
          .sort((r1, r2) => r1.dateOfStock.localeCompare(r2.dateOfStock))
          .slice(0, quantity);
        resolve(skuItems);
      }
    });
  });
};

exports.DBmodifySKUItemAssociation = function (RFID, associatedToIO) {
  return new Promise((resolve, reject) => {
    const SQL = "UPDATE SKUItem SET associatedToIO=? WHERE rfid=?";
    this.db.run(SQL, [associatedToIO, RFID], function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
};

exports.DBmodifySKUItemAvailability = function (RFID, availability) {
  return new Promise((resolve, reject) => {
    const SQL = "UPDATE SKUItem SET available=? WHERE RFID=?";
    this.db.run(SQL, [availability, RFID], function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
};

exports.DBdeleteAllSKUItems = function () {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM SKUItem";
    this.db.run(sql, [], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(true);
    });
  });
};
