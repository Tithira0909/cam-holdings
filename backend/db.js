const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbPath = path.resolve(__dirname, 'cam.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database ' + dbPath + ': ' + err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Helper to wrap sqlite3 in promises (similar to mysql2/promise)
db.query = function (sql, params) {
  return new Promise((resolve, reject) => {
    // Determine if it's a SELECT (all) or INSERT/UPDATE/DELETE (run)
    const method = sql.trim().toUpperCase().startsWith('SELECT') ? 'all' : 'run';

    this[method](sql, params, function (err, rows) {
      if (err) {
        reject(err);
      } else {
        // Normalize result format to match what the app expects (rows or result object)
        if (method === 'run') {
           resolve([{ insertId: this.lastID, affectedRows: this.changes }]);
        } else {
           resolve([rows]);
        }
      }
    });
  });
};

module.exports = db;
