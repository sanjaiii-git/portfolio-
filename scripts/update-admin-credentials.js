const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
    console.error('❌ No DATABASE_URL or POSTGRES_URL found in .env');
    console.error('💡 Make sure you have a .env file with DATABASE_URL or POSTGRES_URL');
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function updateAdminCredentials() {
    console.log('🔄 Updating admin credentials...\n');

    try {
        // New credentials
        const username = 'sanjaiii';
        const password = 'sanjaiii_portfolio';
        const email = 'sanjai@portfolio.com';

        // Generate password hash
        console.log('🔐 Generating password hash...');
        const passwordHash = await bcrypt.hash(password, 10);

        // Check if admin exists
        const checkResult = await pool.query('SELECT * FROM admin WHERE id = 1');
        
        if (checkResult.rows.length > 0) {
            // Update existing admin
            console.log('📝 Updating existing admin...');
            await pool.query(
                'UPDATE admin SET username = $1, password_hash = $2, email = $3 WHERE id = 1',
                [username, passwordHash, email]
            );
            console.log('✅ Admin credentials updated successfully!\n');
        } else {
            // Insert new admin
            console.log('📝 Creating new admin...');
            await pool.query(
                'INSERT INTO admin (username, password_hash, email) VALUES ($1, $2, $3)',
                [username, passwordHash, email]
            );
            console.log('✅ Admin created successfully!\n');
        }

        console.log('📋 Admin Credentials:');
        console.log('   Username: sanjaiii');
        console.log('   Password: sanjaiii_portfolio');
        console.log('\n🎉 You can now login with these credentials!');

    } catch (error) {
        console.error('❌ Error updating admin credentials:', error.message);
        console.error(error);
    } finally {
        await pool.end();
    }
}

updateAdminCredentials();
