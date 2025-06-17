import express from 'express';
import {
  createProductCategory,
  getAllProductCategories,
  deleteProductCategory,
  getCategoriesByProduct,
  getProductsByCategory,
} from '../controllers/productCategoryController.js';

const router = express.Router();

// Criar uma nova relação Produto-Categoria
router.post('/', createProductCategory);

// Listar todas as relações Produto-Categoria
router.get('/', getAllProductCategories);

// Deletar uma relação específica
router.delete('/', deleteProductCategory);

// Listar categorias por produto e produtos por categoria
router.get('/product/:productId', getCategoriesByProduct);

// Listar produtos por categoria
router.get('/category/:categoryId', getProductsByCategory);

export default router;
