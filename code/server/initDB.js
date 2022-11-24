/***
 *  run this file to clean all the db and store only the default users
 */
const sqlite = require("sqlite3");
const fs = require("fs");

async function main() {
  const SQL = fs.readFileSync("./dbschema.sql", "ascii");
  console.log(SQL);

  db = new sqlite.Database("DB.sqlite", (err) => {
    if (err) throw err;
  });

  await db.exec(SQL, function (err) {
    if (err) console.log(err);
    else
      console.log(
        "Database correctly cleaned\nOnly default user are now available"
      );
  });
}

main();
