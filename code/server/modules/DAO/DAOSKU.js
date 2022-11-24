const SKU = require("../Warehouse/SKU");

exports.DBinsertSKU = function (
  description,
  weight,
  volume,
  notes,
  price,
  availableQuantity
) {
  return new Promise((resolve, reject) => {
    const SQL =
      "INSERT INTO SKU(description,weight,volume,notes, price, available_quantity) VALUES(?,?,?,?,?,?)";
    this.db.run(
      SQL,
      [description, weight, volume, notes, price, availableQuantity],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
};

exports.DBdeleteSKU = function (id) {
  return new Promise((resolve, reject) => {
    const SQL = "DELETE FROM SKU WHERE id=?";
    this.db.run(SQL, [id], function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
};

exports.DBallSKUs = function () {
  return new Promise((resolve, reject) => {
    const SQL = "SELECT * FROM SKU";

    this.db.all(SQL, [], (err, rows) => {
      if (err) reject(err);
      else {
        const sku = rows.map(
          (row) =>
            new SKU(
              row.id,
              row.description,
              row.weight,
              row.volume,
              row.notes,
              row.positionID,
              row.price,
              row.available_quantity
            )
        );
        resolve(sku);
      }
    });
  });
};

exports.DBmodifySKU = function (
  id,
  newDescription,
  newWeight,
  newVolume,
  newNotes,
  newPrice,
  newAvailableQuantity
) {
  return new Promise((resolve, reject) => {
    const SQL =
      "UPDATE SKU SET description=?,weight=?,volume=?,notes=?,price=?,available_quantity=? WHERE id=?";
    this.db.run(
      SQL,
      [
        newDescription,
        newWeight,
        newVolume,
        newNotes,
        newPrice,
        newAvailableQuantity,
        id,
      ],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
};

exports.DBmodifySKUPosition = function (id, newPosition) {
  return new Promise((resolve, reject) => {
    const SQL = "UPDATE SKU SET positionID=? WHERE id=?";
    this.db.run(SQL, [newPosition, id], function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
};

exports.DBdecreaseSKUAvailableQuantity = function (id, quantityToSub) {
  return new Promise((resolve, reject) => {
    const SQL =
      "UPDATE SKU SET available_quantity=available_quantity-? WHERE id=?";
    this.db.run(SQL, [quantityToSub, id], function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
};

exports.DBincreaseSKUAvailableQuantity = function (id, quantityToAdd) {
  return new Promise((resolve, reject) => {
    const SQL =
      "UPDATE SKU SET available_quantity=available_quantity+? WHERE id=?";
    this.db.run(SQL, [quantityToAdd, id], function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
};

exports.DBdeleteAllSKU = function () {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM SKU";
    this.db.run(sql, [], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(true);
    });
  });
};
