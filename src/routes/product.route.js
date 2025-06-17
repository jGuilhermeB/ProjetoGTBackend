const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validation = require('../utils/validation');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Gerenciamento de produtos
 */

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Cria um novo produto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *               - price
 *               - category_ids
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               priceWithDiscount:
 *                 type: number
 *               stock:
 *                 type: integer
 *               enabled:
 *                 type: boolean
 *               useInMenu:
 *                 type: boolean
 *               category_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     path:
 *                       type: string
 *                     enabled:
 *                       type: boolean
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     shape:
 *                       type: string
 *                     radius:
 *                       type: number
 *                     type:
 *                       type: string
 *                     values:
 *                       type: array
 *                       items:
 *                         type: string
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       409:
 *         description: Slug já existe
 */
router.post('/', authMiddleware, productController.create);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Lista todos os produtos
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Número de itens por página
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número da página
 *       - in: query
 *         name: match
 *         schema:
 *           type: string
 *         description: Termo de busca
 *       - in: query
 *         name: category_ids
 *         schema:
 *           type: string
 *         description: IDs das categorias separados por vírgula
 *       - in: query
 *         name: price_range
 *         schema:
 *           type: string
 *         description: Faixa de preço (min-max)
 *       - in: query
 *         name: stock_range
 *         schema:
 *           type: string
 *         description: Faixa de estoque (min-max)
 *       - in: query
 *         name: enabled
 *         schema:
 *           type: boolean
 *         description: Filtrar por produtos ativos
 *       - in: query
 *         name: useInMenu
 *         schema:
 *           type: boolean
 *         description: Filtrar por produtos no menu
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *         description: Campo para ordenação
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Ordem da ordenação
 *     responses:
 *       200:
 *         description: Lista de produtos
 */
router.get('/', productController.list);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Obtém um produto pelo ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produto encontrado
 *       404:
 *         description: Produto não encontrado
 */
router.get('/:id', validation.id, productController.getById);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Atualiza um produto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               priceWithDiscount:
 *                 type: number
 *               stock:
 *                 type: integer
 *               enabled:
 *                 type: boolean
 *               useInMenu:
 *                 type: boolean
 *               category_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     path:
 *                       type: string
 *                     enabled:
 *                       type: boolean
 *                     deleted:
 *                       type: boolean
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     shape:
 *                       type: string
 *                     radius:
 *                       type: number
 *                     type:
 *                       type: string
 *                     values:
 *                       type: array
 *                       items:
 *                         type: string
 *                     deleted:
 *                       type: boolean
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Produto não encontrado
 *       409:
 *         description: Slug já existe
 */
router.put('/:id', authMiddleware, validation.id, productController.update);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Remove um produto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produto removido com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Produto não encontrado
 */
router.delete('/:id', authMiddleware, validation.id, productController.delete);

module.exports = router; 