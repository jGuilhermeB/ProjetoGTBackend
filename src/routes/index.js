const express = require('express');
const router = express.Router();
const userRoutes = require('./user.routes');
const categoryRoutes = require('./category.routes');
const productRoutes = require('./product.routes');
const orderRoutes = require('./order.routes');

// Middleware para log de requisições
router.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Rotas
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);

// Middleware para tratar 404
router.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Rota não encontrada',
    timestamp: new Date().toISOString()
  });
});

// Middleware para tratar erros
router.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor',
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 