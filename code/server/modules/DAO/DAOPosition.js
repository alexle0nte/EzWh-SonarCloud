const Position = require("../Warehouse/Position");

exports.DBAllPositions = function () {
  return new Promise((resolve, reject) => {
    const SQL = "SELECT * FROM Position";

    this.db.all(SQL, [], (err, rows) => {
      if (err) reject(err);
      else {
        const position = rows.map(
          (row) =>
            new Position(
              row.id,
              row.aisle,
              row.row,
              row.column,
              row.maxWeight,
              row.maxVolume,
              row.SKUID,
              row.occupiedVolume,
              row.occupiedWeight
            )
        );
        resolve(position);
      }
    });
  });
};

exports.DBinsertPosition = function (position) {
  return new Promise((resolve, reject) => {
    const SQL =
      "INSERT INTO Position(id,aisle,row,column,maxWeight,maxVolume,SKUID,occupiedWeight,occupiedVolume) VALUES(?,?,?,?,?,?,?,?,?)";
    this.db.run(
      SQL,
      [
        position.positionID,
        position.aisleID,
        position.row,
        position.col,
        position.maxWeight,
        position.maxVolume,
        position.SKUID,
        position.occupiedWeight,
        position.occupiedVolume,
      ],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
};

exports.DBmodifyPosition = function (positionID, newPosition) {
  return new Promise((resolve, reject) => {
    const SQL =
      "UPDATE Position SET id=?,aisle=?,row=?,column=?,maxWeight=?,maxVolume=?,SKUID=?,occupiedWeight=?,occupiedVolume=? WHERE id=?";
    this.db.run(
      SQL,
      [
        newPosition.positionID,
        newPosition.aisleID,
        newPosition.row,
        newPosition.col,
        newPosition.maxWeight,
        newPosition.maxVolume,
        newPosition.SKUID,
        newPosition.occupiedWeight,
        newPosition.occupiedVolume,
        positionID,
      ],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
};

exports.DBdeletePosition = function (id) {
  return new Promise((resolve, reject) => {
    const SQL = "DELETE FROM Position WHERE id=?";
    this.db.run(SQL, [id], function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
};

exports.DBdeleteAllPositions = function () {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM Position";
    this.db.run(sql, [], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(true);
    });
  });
};
