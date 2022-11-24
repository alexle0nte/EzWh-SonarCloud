const Item = require("../Item");

exports.DBallItems = function () {
    return new Promise((resolve, reject) => {
      const SQL = "SELECT * FROM Item";

      this.db.all(SQL, [], (err, rows) => {
        if (err) reject(err);
        else {
          rows
            ? resolve(
                rows.map(
                  (row) =>
                    new Item({
                      id: row.id,
                      description: row.description,
                      price: row.price,
                      SKUId: row.SKUId,
                      supplierId: row.supplierId,
                    })
                )
              )
            : resolve(null);
        }
      });
    });
  }


exports.DBinsertItem = function (item) {
    return new Promise((resolve, reject) => {
      const SQL =
        "INSERT INTO Item(id,description,price,SKUId,supplierId) VALUES(?,?,?,?,?)";
      this.db.run(
        SQL,
        [item.id, item.description, item.price, item.SKUId, item.supplierId],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }


exports.DBmodifyItemByIdSupplierId = function(id,supplierId,description,price){
  return new Promise((resolve, reject) => {
    const SQL = "UPDATE Item SET description = ?, price = ? WHERE id=? AND supplierId = ?";
    this.db.run(SQL, [description, price, id,supplierId], function (err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
}  


exports.DBdeleteItemByIdSupplierId = function (id,supplierId) {
    return new Promise((resolve, reject) => {
      const SQL = "DELETE FROM Item WHERE id=? AND supplierId = ?";
      this.db.run(SQL, [id,supplierId], (err) => {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }

exports.DBdeleteAllItems = function () {
    return new Promise((resolve, reject) => {
      const sql = "DELETE FROM Item";
      this.db.run(sql, [], function (err) {
        if (err) reject(err);
        else resolve(true);
      });
    });
  };

exports.DBitemByIdSupplier = function (id,supplierId) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM Item WHERE id =? AND supplierId = ?";
    this.db.get(sql, [id,supplierId], (err, row) => {
      if (err) reject(err);
      else {
        row
          ? resolve(
              new Item({
                id: row.id,
                description: row.description,
                price: row.price,
                SKUId: row.SKUId,
                supplierId: row.supplierId,
              })
            )
          : resolve(null);
      }
    });
  });
}