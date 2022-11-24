const User = require("../User");
const crypto = require("crypto");

exports.DBgetUserByUsernameType = function (username, type) {
    return new Promise((resolve, reject) => {
      const SQL = "SELECT * FROM User U WHERE U.username = ? AND U.type = ?";

      this.db.get(SQL, [username, type], (err, row) => {
        if (err) reject(err);
        else {
          row
            ? resolve(
                new User({
                  id: row.id,
                  username: username,
                  name: row.name,
                  surname: row.surname,
                  type: type,
                })
              )
            : resolve(null);
        }
      });
    });
  }

exports.DBallUsers = function () {
    return new Promise((resolve, reject) => {
      const SQL = "SELECT * FROM User";

      this.db.all(SQL, [], (err, rows) => {
        if (err) reject(err);
        else {
          rows
            ? resolve(
                rows.map(
                  (row) =>
                    new User({
                      id: row.id,
                      email: row.username,
                      name: row.name,
                      surname: row.surname,
                      type: row.type,
                    })
                )
              )
            : resolve(null);
        }
      });
    });
  }

exports.DBcheckCredentials = function (username, type, password) {
    return new Promise((resolve, reject) => {
      const sql =
        "SELECT * FROM User WHERE username = ? AND type = ? AND password = ?";
      this.db.get(
        sql,
        [
          username,
          type,
          crypto.createHash("sha1").update(password).digest("hex"),
        ],
        (err, row) => {
          if (err) reject(err);
          else {
            row
              ? resolve(
                  new User({
                    id: row.id,
                    username: username,
                    name: row.name,
                  })
                )
              : resolve(null);
          }
        }
      );
    });
  }

exports.DBdeleteUser = function (username, type) {
    return new Promise((resolve, reject) => {
      const SQL = "DELETE FROM USER WHERE username=? AND type = ?";
      this.db.run(SQL, [username, type], function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }

exports.DBgetUserbyId = function (id) {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM User WHERE id =?";
      this.db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else {
          row
            ? resolve(
                new User({
                  id: id,
                  username: row.username,
                  name: row.name,
                  surname: row.surname,
                  type: row.type,
                })
              )
            : resolve(null);
        }
      });
    });
  }

exports.DBinsertUser = function (user) {
    return new Promise((resolve, reject) => {
      const SQL =
        "INSERT INTO User(name,surname,username,password,type) VALUES(?,?,?,?,?)";
      this.db.run(
        SQL,
        [
          user.name,
          user.surname,
          user.username,
          crypto.createHash("sha1").update(user.password).digest("hex"),
          user.type,
        ],

        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

exports.DBmodifyUser = function (username, oldType, newType) {
    return new Promise((resolve, reject) => {
      const SQL = "UPDATE User SET type = ? WHERE username=? and type = ?";
      this.db.run(SQL, [newType, username, oldType], function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }

  exports.DBdeleteAllUsers = function () {
    return new Promise((resolve, reject) => {
      const sql = "DELETE FROM User";
      this.db.run(sql, [], function (err) {
        if (err) reject(err);
        else resolve(true);
      });
    });
  };