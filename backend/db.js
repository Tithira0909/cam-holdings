const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'cam.db');

const db = new sqlite3.Database(dbPath);

// Promisify query
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    // Basic heuristic: if it starts with SELECT, use all, else run.
    const trimmed = sql.trim().toUpperCase();
    if (trimmed.startsWith('SELECT') || trimmed.startsWith('PRAGMA')) {
      db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve([rows, []]); // Match [rows, fields]
      });
    } else {
      db.run(sql, params, function(err) {
        if (err) return reject(err);
        resolve([{
          insertId: this.lastID,
          affectedRows: this.changes,
          changedRows: this.changes
        }, []]);
      });
    }
  });
}

module.exports = { query };
