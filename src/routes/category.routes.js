const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const {
  listCategoriesController,
  getCategoryByIdController,
  createCategoryController,
  updateCategoryController,
  deleteCategoryController
} = require('../controllers/category.controller');

// Rotas públicas
router.get('/search', listCategoriesController);
router.get('/:id', getCategoryByIdController);

// Rotas protegidas
router.post('/', authMiddleware, createCategoryController);
router.put('/:id', authMiddleware, updateCategoryController);
router.delete('/:id', authMiddleware, deleteCategoryController);

module.exports = router; 