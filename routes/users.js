const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth');

// All routes here require admin access
router.use(auth, adminOnly);

// GET /api/users - Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.getAll();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
});

// POST /api/users - Create user
router.post('/', async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.json({ success: true, data: newUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating user' });
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', async (req, res) => {
  try {
    const updatedUser = await User.update(req.params.id, req.body);
    res.json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating user' });
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', async (req, res) => {
  try {
    await User.delete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting user' });
  }
});

module.exports = router;
