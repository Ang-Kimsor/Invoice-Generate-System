const { db } = require('./config/db');
const bcrypt = require('bcryptjs');

async function createAdmin() {
    try {
        // Create default admin if no users exist
        const userCount = await db.query('SELECT COUNT(*) FROM users');
        if (parseInt(userCount.rows[0].count) === 0) {
            const hashedPassword = await bcrypt.hash('password', 10);
            await db.query(
                'INSERT INTO users (username, password, full_name, role) VALUES ($1, $2, $3, $4)',
                ['admin', hashedPassword, 'Administrator', 'ADMIN']
            );
            console.log('Admin user created.');
        } else {
            console.log('Admin user already exists or users table is not empty.');
        }
    } catch (err) {
        console.error('Error creating admin user:', err);
    } finally {
        process.exit(0);
    }
}

createAdmin();