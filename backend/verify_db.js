const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
    const config = {
        host: '127.0.0.1', // Force IP
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    };
    console.log('Trying with 127.0.0.1...');

    try {
        const connection = await mysql.createConnection(config);
        console.log('Connected to DB');
        await connection.end();
    } catch (e) {
        console.error('Connection failed:', e.code, e.message);
    }
}

main();
