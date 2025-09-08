import mongoose from 'mongoose';
import mysql from 'mysql2/promise';
import { URL } from 'url';
import dotenv from 'dotenv';
dotenv.config();

let db = null;
let dbType = null;

export async function connectToDatabase() {
    const { DB_URI } = process.env;

    const uri = new URL(DB_URI);
    let protocol = uri.protocol.replace(':', '');

    // Normalize known protocol variants
    if (protocol === 'mongodb+srv') protocol = 'mongodb';
    if (protocol === 'mysql2') protocol = 'mysql';

    dbType = protocol;
    console.log('dbType:', dbType)

    if (dbType === 'mongodb') {
        await mongoose.connect(DB_URI);
        db = mongoose;
        console.log('✅ Connected to MongoDB');
    } else if (dbType === 'mysql') {
        db = await mysql.createPool({
            host: uri.hostname,
            user: uri.username,
            password: uri.password,
            database: uri.pathname.replace('/', ''),
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        console.log('✅ Connected to MySQL');

        await createMySQLTables(db);
    } else {
        throw new Error(`❌ Unsupported DB_TYPE derived from URI: ${dbType}`);
    }

    return db;
}

async function createMySQLTables(db) {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS encrypted_data (
         id INT AUTO_INCREMENT PRIMARY KEY,
          encrytedData TEXT,
          nonce TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
      `);

    console.log('✅ MySQL tables ensured');
}

export function getDB() {
    return db;
}

export function getDBType() {
    return dbType;
}
