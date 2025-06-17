const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const {
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  generateToken
} = require('../controllers/user.controller');

// Rota pública
router.post('/token', generateToken);

// Rotas protegidas
router.get('/:id', authMiddleware, getUserById);
router.post('/', createUser);
router.put('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, deleteUser);

module.exports = router; 