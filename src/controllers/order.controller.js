const orderService = require('../services/order.service');
const response = require('../utils/response');
const validation = require('../utils/validation');

const create = async (req, res) => {
  try {
    const order = await orderService.createOrder(req.user.id, req.body.items);
    return response.success(res, order, 201);
  } catch (error) {
    if (error.message.includes('não encontrado')) {
      return response.error(res, error.message, 404);
    }
    return response.error(res, error.message, 400);
  }
};

const list = async (req, res) => {
  try {
    const { limit, page, status, sort_by, sort_order } = req.query;
    const orders = await orderService.listOrders({
      limit: validation.parseLimit(limit),
      page: validation.parsePage(page),
      status,
      sort_by,
      sort_order
    });
    return response.success(res, orders);
  } catch (error) {
    return response.error(res, error.message, 400);
  }
};

const getById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (!order) {
      return response.error(res, 'Pedido não encontrado', 404);
    }
    return response.success(res, order);
  } catch (error) {
    return response.error(res, error.message, 400);
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
      return response.error(res, 'Status inválido', 400);
    }

    const order = await orderService.updateOrderStatus(req.params.id, status);
    if (!order) {
      return response.error(res, 'Pedido não encontrado', 404);
    }
    return response.success(res, order);
  } catch (error) {
    return response.error(res, error.message, 400);
  }
};

const remove = async (req, res) => {
  try {
    const order = await orderService.deleteOrder(req.params.id);
    if (!order) {
      return response.error(res, 'Pedido não encontrado', 404);
    }
    return response.success(res, { message: 'Pedido removido com sucesso' });
  } catch (error) {
    return response.error(res, error.message, 400);
  }
};

module.exports = {
  create,
  list,
  getById,
  updateStatus,
  delete: remove
}; 