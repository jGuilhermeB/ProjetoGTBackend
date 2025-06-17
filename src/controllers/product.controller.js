const productService = require('../services/product.service');

// Funções auxiliares para formatação de resposta
const response = {
  success: (data, status = 200) => ({
    status,
    data,
    timestamp: new Date().toISOString()
  }),
  error: (error, status = 400) => ({
    status,
    error: error.message,
    timestamp: new Date().toISOString()
  })
};

// Funções auxiliares para validação
const validate = {
  id: (id) => {
    const numId = Number(id);
    if (isNaN(numId) || numId < 1) {
      throw new Error('ID inválido');
    }
    return numId;
  },
  query: (query) => {
    const errors = [];

    if (query.limit && (isNaN(query.limit) || query.limit < 1)) {
      errors.push('Limit deve ser um número positivo');
    }

    if (query.page && (isNaN(query.page) || query.page < 1)) {
      errors.push('Page deve ser um número positivo');
    }

    if (query.price_range) {
      const [min, max] = query.price_range.split('-').map(Number);
      if (isNaN(min) || isNaN(max) || min < 0 || max < min) {
        errors.push('Price range inválido. Use o formato: min-max');
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }
};

// Handlers
const handlers = {
  create: async (req, res) => {
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json(response.success(product, 201));
    } catch (error) {
      res.status(400).json(response.error(error));
    }
  },

  getById: async (req, res) => {
    try {
      const id = validate.id(req.params.id);
      const product = await productService.getProductById(id);
      res.json(response.success(product));
    } catch (error) {
      res.status(404).json(response.error(error, 404));
    }
  },

  list: async (req, res) => {
    try {
      validate.query(req.query);
      const products = await productService.listProducts(req.query);
      res.json(response.success(products));
    } catch (error) {
      res.status(400).json(response.error(error));
    }
  },

  update: async (req, res) => {
    try {
      const id = validate.id(req.params.id);
      const product = await productService.updateProduct(id, req.body);
      res.json(response.success(product));
    } catch (error) {
      const status = error.message.includes('não encontrado') ? 404 : 400;
      res.status(status).json(response.error(error, status));
    }
  },

  delete: async (req, res) => {
    try {
      const id = validate.id(req.params.id);
      await productService.deleteProduct(id);
      res.status(204).send();
    } catch (error) {
      const status = error.message.includes('não encontrado') ? 404 : 400;
      res.status(status).json(response.error(error, status));
    }
  }
};

module.exports = {
  createProduct: handlers.create,
  getProductById: handlers.getById,
  listProducts: handlers.list,
  updateProduct: handlers.update,
  deleteProduct: handlers.delete
}; 