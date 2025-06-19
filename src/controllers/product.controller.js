const productService = require('../services/product.service');
const response = require('../utils/response');
const validation = require('../utils/validation');

const create = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    return res.status(201).json(response.sucesso(product));
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json(response.erro('Slug já existe'));
    }
    return res.status(400).json(response.erro(error.message));
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
    return res.json(response.sucesso(products));
  } catch (error) {
    return res.status(400).json(response.erro(error.message));
  }
};

const getById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json(response.naoEncontrado('Produto não encontrado'));
    }
    return res.json(response.sucesso(product));
  } catch (error) {
    return res.status(400).json(response.erro(error.message));
  }
};

const update = async (req, res) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    if (!product) {
      return res.status(404).json(response.naoEncontrado('Produto não encontrado'));
    }
    return res.json(response.sucesso(product));
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json(response.erro('Slug já existe'));
    }
    return res.status(400).json(response.erro(error.message));
  }
};

const remove = async (req, res) => {
  try {
    const product = await productService.deleteProduct(req.params.id);
    if (!product) {
      return res.status(404).json(response.naoEncontrado('Produto não encontrado'));
    }
    return res.json(response.sucesso({ message: 'Produto removido com sucesso' }));
  } catch (error) {
    return res.status(400).json(response.erro(error.message));
  }
};

module.exports = {
  create,
  list,
  getById,
  update,
  delete: remove
}; 