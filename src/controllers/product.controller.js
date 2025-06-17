
const productService = require('../services/product.service');
const response = require('../utils/response');
const validation = require('../utils/validation');

const create = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    return response.success(res, product, 201);
  } catch (error) {
    if (error.code === 'P2002') {
      return response.error(res, 'Slug já existe', 409);
    }
    return response.error(res, error.message, 400);
  }
};

const list = async (req, res) => {
  try {
    const { limit, page, match, category_ids, price_range, stock_range, enabled, useInMenu, sort_by, sort_order } = req.query;
    const products = await productService.listProducts({
      limit: validation.parseLimit(limit),
      page: validation.parsePage(page),
      match,
      category_ids: validation.parseArray(category_ids),
      price_range: validation.parseRange(price_range),
      stock_range: validation.parseRange(stock_range),
      enabled: validation.parseBoolean(enabled),
      useInMenu: validation.parseBoolean(useInMenu),
      sort_by,
      sort_order
    });
    return response.success(res, products);
  } catch (error) {
    return response.error(res, error.message, 400);
  }
};

const getById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return response.error(res, 'Produto não encontrado', 404);
    }
    return response.success(res, product);
  } catch (error) {
    return response.error(res, error.message, 400);
  }
};

const update = async (req, res) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    if (!product) {
      return response.error(res, 'Produto não encontrado', 404);
    }
    return response.success(res, product);
  } catch (error) {
    if (error.code === 'P2002') {
      return response.error(res, 'Slug já existe', 409);
    }
    return response.error(res, error.message, 400);
  }
};

const remove = async (req, res) => {
  try {
    const product = await productService.deleteProduct(req.params.id);
    if (!product) {
      return response.error(res, 'Produto não encontrado', 404);
    }
    return response.success(res, { message: 'Produto removido com sucesso' });
  } catch (error) {
    return response.error(res, error.message, 400);
  }
};

module.exports = {
  create,
  list,
  getById,
  update,
  delete: remove
}; 