const mysql = require('mysql2/promise');
const { Pool } = require('pg');
require('dotenv').config();

// Check if using Postgres (Vercel) or MySQL (local)
const isPostgres = !!(process.env.POSTGRES_URL || process.env.DATABASE_URL);

let db;

if (isPostgres) {
    // Postgres connection for Vercel
    const pool = new Pool({
        connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
    });

    // Handle connection errors
    pool.on('error', (err) => {
        console.error('❌ Unexpected Postgres error:', err.message);
    });

    // Wrap Postgres to work like MySQL query format
    db = {
        query: async (sql, params = []) => {
            try {
                // Convert MySQL ? placeholders to Postgres $1, $2, etc.
                let paramIndex = 1;
                const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
                
                const result = await pool.query(pgSql, params);
                
                // For INSERT/UPDATE/DELETE, return result with MySQL-like format
                return [result.rows, { 
                    insertId: result.rows[0]?.id,
                    affectedRows: result.rowCount 
                }];
            } catch (error) {
                console.error('Query error:', error.message);
                throw error;
            }
        },
        isPostgres: true
    };

    console.log('✅ Postgres database configured');


} else {
    // MySQL connection for local development
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'portfolio_db',
        port: process.env.DB_PORT || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    db = pool;
    db.isPostgres = false;

    // Test connection
    pool.getConnection()
        .then(connection => {
            console.log('✅ MySQL database connected successfully');
            connection.release();
        })
        .catch(err => {
            console.error('❌ MySQL connection failed:', err.message);
        });
}

module.exports = db;
