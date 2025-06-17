const orderController = require('../../controllers/order.controller');
const orderService = require('../../services/order.service');

jest.mock('../../services/order.service');

describe('Order Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
      body: {},
      user: { id: 1 }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('create', () => {
    const mockOrder = {
      id: 1,
      userId: 1,
      status: 'pending',
      total: 51.80,
      items: [
        {
          id: 1,
          productId: 1,
          quantity: 2,
          price: 25.90,
          options: { size: 'large' }
        }
      ]
    };

    it('should create order successfully', async () => {
      req.body = {
        items: [
          {
            productId: 1,
            quantity: 2,
            price: 25.90,
            options: { size: 'large' }
          }
        ]
      };

      orderService.createOrder.mockResolvedValue(mockOrder);

      await orderController.create(req, res);

      expect(orderService.createOrder).toHaveBeenCalledWith(1, req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockOrder,
        timestamp: expect.any(String)
      });
    });

    it('should handle error when creating order', async () => {
      req.body = { items: [] };
      const error = new Error('Invalid order data');

      orderService.createOrder.mockRejectedValue(error);

      await orderController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: error.message,
        timestamp: expect.any(String)
      });
    });
  });

  describe('getById', () => {
    const mockOrder = {
      id: 1,
      items: [
        {
          id: 1,
          options: { size: 'large' }
        }
      ]
    };

    it('should get order by id successfully', async () => {
      req.params.id = '1';
      orderService.getOrderById.mockResolvedValue(mockOrder);

      await orderController.getById(req, res);

      expect(orderService.getOrderById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockOrder,
        timestamp: expect.any(String)
      });
    });

    it('should handle error when order not found', async () => {
      req.params.id = '1';
      const error = new Error('Pedido não encontrado');

      orderService.getOrderById.mockRejectedValue(error);

      await orderController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: error.message,
        timestamp: expect.any(String)
      });
    });

    it('should handle invalid id', async () => {
      req.params.id = 'invalid';

      await orderController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'ID inválido',
        timestamp: expect.any(String)
      });
    });
  });

  describe('list', () => {
    const mockOrders = {
      data: [
        {
          id: 1,
          items: [
            {
              id: 1,
              options: { size: 'large' }
            }
          ]
        }
      ],
      total: 1,
      limit: 10,
      page: 1,
      total_pages: 1
    };

    it('should list orders with default pagination', async () => {
      orderService.listOrders.mockResolvedValue(mockOrders);

      await orderController.list(req, res);

      expect(orderService.listOrders).toHaveBeenCalledWith({});
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockOrders,
        timestamp: expect.any(String)
      });
    });

    it('should list orders with custom filters', async () => {
      req.query = {
        status: 'pending',
        userId: '1',
        limit: '5',
        page: '2'
      };

      orderService.listOrders.mockResolvedValue(mockOrders);

      await orderController.list(req, res);

      expect(orderService.listOrders).toHaveBeenCalledWith(req.query);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockOrders,
        timestamp: expect.any(String)
      });
    });

    it('should handle invalid query parameters', async () => {
      req.query = {
        limit: 'invalid',
        page: '0'
      };

      await orderController.list(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: expect.any(String),
        timestamp: expect.any(String)
      });
    });
  });

  describe('updateStatus', () => {
    const mockOrder = {
      id: 1,
      status: 'confirmed',
      items: [
        {
          id: 1,
          options: { size: 'large' }
        }
      ]
    };

    it('should update order status successfully', async () => {
      req.params.id = '1';
      req.body = { status: 'confirmed' };

      orderService.updateOrderStatus.mockResolvedValue(mockOrder);

      await orderController.updateStatus(req, res);

      expect(orderService.updateOrderStatus).toHaveBeenCalledWith(1, 'confirmed');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockOrder,
        timestamp: expect.any(String)
      });
    });

    it('should handle missing status', async () => {
      req.params.id = '1';
      req.body = {};

      await orderController.updateStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Status é obrigatório',
        timestamp: expect.any(String)
      });
    });

    it('should handle invalid id', async () => {
      req.params.id = 'invalid';
      req.body = { status: 'confirmed' };

      await orderController.updateStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'ID inválido',
        timestamp: expect.any(String)
      });
    });
  });

  describe('delete', () => {
    it('should delete order successfully', async () => {
      req.params.id = '1';
      orderService.deleteOrder.mockResolvedValue();

      await orderController.delete(req, res);

      expect(orderService.deleteOrder).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should handle error when deleting order', async () => {
      req.params.id = '1';
      const error = new Error('Pedido não encontrado');

      orderService.deleteOrder.mockRejectedValue(error);

      await orderController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: error.message,
        timestamp: expect.any(String)
      });
    });

    it('should handle invalid id', async () => {
      req.params.id = 'invalid';

      await orderController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'ID inválido',
        timestamp: expect.any(String)
      });
    });
  });
}); 