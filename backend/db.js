const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'cam.db');

const db = new sqlite3.Database(dbPath);

const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    const trimmedSql = sql.trim().toUpperCase();

    // SQLite uses ? for params, same as MySQL usually.

    if (trimmedSql.startsWith('SELECT') || trimmedSql.startsWith('PRAGMA')) {
      db.all(sql, params, (err, rows) => {
        if (err) {
          console.error("SQL Error:", err.message, "Query:", sql);
          reject(err);
        }
        else resolve([rows, []]);
      });
    } else {
      db.run(sql, params, function(err) {
        if (err) {
          console.error("SQL Error:", err.message, "Query:", sql);
          reject(err);
        }
        else {
            // MySQL returns { insertId, affectedRows, ... }
            // SQLite 'this' context in callback has lastID and changes
            const result = {
                insertId: this.lastID,
                affectedRows: this.changes,
                // Add dummy properties to satisfy some mysql checks if any
                warningStatus: 0,
            };
            resolve([result, []]);
        }
      });
    }
  });
};

module.exports = { query };
