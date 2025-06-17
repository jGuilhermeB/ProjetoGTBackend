const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Middleware para validar ID
const validateId = (req, res, next) => {
  const id = Number(req.params.id);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'ID inválido',
      timestamp: new Date().toISOString()
    });
  }
  next();
};

// Rotas públicas
router.get('/', orderController.list);
router.get('/:id', validateId, orderController.getById);

// Rotas protegidas
router.post('/', authMiddleware, orderController.create);
router.put('/:id/status', authMiddleware, validateId, orderController.updateStatus);
router.delete('/:id', authMiddleware, validateId, orderController.delete);

module.exports = router; 