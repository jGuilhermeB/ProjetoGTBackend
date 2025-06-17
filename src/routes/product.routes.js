const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Middleware para validar ID
const validateId = (req, res, next) => {
  const id = Number(req.params.id);
  if (isNaN(id) || id < 1) {
    return res.status(400).json({
      status: 400,
      error: 'ID inválido',
      timestamp: new Date().toISOString()
    });
  }
  next();
};

// Rotas públicas
router.get('/', productController.listProducts);
router.get('/:id', validateId, productController.getProductById);

// Rotas protegidas
router.use(authMiddleware);
router.post('/', productController.createProduct);
router.put('/:id', validateId, productController.updateProduct);
router.delete('/:id', validateId, productController.deleteProduct);

module.exports = router; 