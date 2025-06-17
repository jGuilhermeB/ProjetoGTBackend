const orderService = require('../services/order.service');

// Formatação de respostas
const response = {
  success: (data) => ({
    status: 'success',
    data,
    timestamp: new Date().toISOString()
  }),
  error: (message) => ({
    status: 'error',
    message,
    timestamp: new Date().toISOString()
  })
};

// Validações
const validate = {
  id: (id) => {
    const numId = Number(id);
    if (isNaN(numId) || numId <= 0) {
      throw new Error('ID inválido');
    }
    return numId;
  },
  queryParams: (params) => {
    const { limit, page, status } = params;
    
    if (limit && (isNaN(limit) || limit < -1)) {
      throw new Error('Limit deve ser um número positivo ou -1');
    }
    
    if (page && (isNaN(page) || page < 1)) {
      throw new Error('Page deve ser um número positivo');
    }

    if (status && !['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'].includes(status)) {
      throw new Error('Status inválido');
    }

    return params;
  }
};

// Handlers
const handlers = {
  create: async (req, res) => {
    try {
      const order = await orderService.createOrder(req.user.id, req.body);
      res.status(201).json(response.success(order));
    } catch (error) {
      res.status(400).json(response.error(error.message));
    }
  },

  getById: async (req, res) => {
    try {
      const id = validate.id(req.params.id);
      const order = await orderService.getOrderById(id);
      res.json(response.success(order));
    } catch (error) {
      res.status(error.message.includes('não encontrado') ? 404 : 400)
        .json(response.error(error.message));
    }
  },

  list: async (req, res) => {
    try {
      const params = validate.queryParams(req.query);
      const orders = await orderService.listOrders(params);
      res.json(response.success(orders));
    } catch (error) {
      res.status(400).json(response.error(error.message));
    }
  },

  updateStatus: async (req, res) => {
    try {
      const id = validate.id(req.params.id);
      const { status } = req.body;

      if (!status) {
        throw new Error('Status é obrigatório');
      }

      const order = await orderService.updateOrderStatus(id, status);
      res.json(response.success(order));
    } catch (error) {
      res.status(error.message.includes('não encontrado') ? 404 : 400)
        .json(response.error(error.message));
    }
  },

  delete: async (req, res) => {
    try {
      const id = validate.id(req.params.id);
      await orderService.deleteOrder(id);
      res.status(204).send();
    } catch (error) {
      res.status(error.message.includes('não encontrado') ? 404 : 400)
        .json(response.error(error.message));
    }
  }
};

module.exports = handlers; 