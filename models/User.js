// User model for PostgreSQL
const { db } = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async findByUsername(username) {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query('SELECT id, username, full_name, role, created_at FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const result = await db.query(
      'INSERT INTO users (username, password, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, username, full_name, role',
      [userData.username, hashedPassword, userData.fullName, userData.role]
    );
    return result.rows[0];
  }

  static async getAll() {
    const result = await db.query('SELECT id, username, full_name, role, created_at FROM users ORDER BY id ASC');
    return result.rows;
  }

  static async update(id, userData) {
    let query = 'UPDATE users SET username = $1, full_name = $2, role = $3';
    const params = [userData.username, userData.fullName, userData.role];

    if (userData.password) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      query += ', password = $4 WHERE id = $5';
      params.push(hashedPassword, id);
    } else {
      query += ' WHERE id = $4';
      params.push(id);
    }

    const result = await db.query(query + ' RETURNING id, username, full_name, role', params);
    return result.rows[0];
  }

  static async delete(id) {
    await db.query('DELETE FROM users WHERE id = $1', [id]);
    return { success: true };
  }
}

module.exports = User;
