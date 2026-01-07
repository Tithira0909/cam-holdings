const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'cam.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database ' + dbPath + ': ' + err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Helper to wrap sqlite3 in promises to match mysql2 promise interface vaguely
const promiseDb = {
  query: (sql, params) => {
    return new Promise((resolve, reject) => {
      // Handle multiple statements if detected (for schema setup)
      if (sql.trim().includes(';') && sql.split(';').filter(s => s.trim()).length > 1) {
          db.exec(sql, function(err) {
              if (err) reject(err);
              else resolve([this]); // this contains changes, lastID
          });
      } else {
          // If it's a SELECT, use all(), otherwise run()
          if (sql.trim().toUpperCase().startsWith('SELECT')) {
            db.all(sql, params, (err, rows) => {
              if (err) reject(err);
              else resolve([rows]); // mysql2 returns [rows, fields]
            });
          } else {
            db.run(sql, params, function(err) {
              if (err) reject(err);
              else resolve([{ insertId: this.lastID, affectedRows: this.changes }]);
            });
          }
      }
    });
  },
  execute: (sql, params) => {
     return new Promise((resolve, reject) => {
          if (sql.trim().toUpperCase().startsWith('SELECT')) {
            db.all(sql, params, (err, rows) => {
              if (err) reject(err);
              else resolve([rows]);
            });
          } else {
            db.run(sql, params, function(err) {
              if (err) reject(err);
              else resolve([{ insertId: this.lastID, affectedRows: this.changes }]);
            });
          }
    });
  }
};

module.exports = promiseDb;
