const { PrismaClient } = require('@prisma/client');
const orderService = require('../../services/order.service');

describe('Order Service', () => {
  let prisma;

  beforeEach(() => {
    prisma = new PrismaClient();
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    const mockOrderData = {
      items: [
        {
          productId: 1,
          quantity: 2,
          price: 25.90,
          options: { size: 'large' }
        }
      ]
    };

    const mockProduct = {
      id: 1,
      name: 'Test Product',
      stock: 10
    };

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
          options: JSON.stringify({ size: 'large' })
        }
      ]
    };

    it('should create an order successfully', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.order.create.mockResolvedValue(mockOrder);

      const result = await orderService.createOrder(1, mockOrderData);

      expect(result).toEqual({
        ...mockOrder,
        items: [
          {
            ...mockOrder.items[0],
            options: { size: 'large' }
          }
        ]
      });
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { stock: { decrement: 2 } }
      });
    });

    it('should throw error when product not found', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(orderService.createOrder(1, mockOrderData))
        .rejects
        .toThrow('Produto 1 não encontrado');
    });

    it('should throw error when stock is insufficient', async () => {
      prisma.product.findUnique.mockResolvedValue({
        ...mockProduct,
        stock: 1
      });

      await expect(orderService.createOrder(1, mockOrderData))
        .rejects
        .toThrow('Estoque insuficiente para o produto Test Product');
    });
  });

  describe('getOrderById', () => {
    const mockOrder = {
      id: 1,
      items: [
        {
          id: 1,
          options: JSON.stringify({ size: 'large' })
        }
      ]
    };

    it('should return order by id', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);

      const result = await orderService.getOrderById(1);

      expect(result).toEqual({
        ...mockOrder,
        items: [
          {
            ...mockOrder.items[0],
            options: { size: 'large' }
          }
        ]
      });
    });

    it('should throw error when order not found', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(orderService.getOrderById(1))
        .rejects
        .toThrow('Pedido não encontrado');
    });
  });

  describe('listOrders', () => {
    const mockOrders = [
      {
        id: 1,
        items: [
          {
            id: 1,
            options: JSON.stringify({ size: 'large' })
          }
        ]
      }
    ];

    it('should list orders with default pagination', async () => {
      prisma.order.findMany.mockResolvedValue(mockOrders);
      prisma.order.count.mockResolvedValue(1);

      const result = await orderService.listOrders({});

      expect(result).toEqual({
        data: [
          {
            ...mockOrders[0],
            items: [
              {
                ...mockOrders[0].items[0],
                options: { size: 'large' }
              }
            ]
          }
        ],
        total: 1,
        limit: 10,
        page: 1,
        total_pages: 1
      });
    });

    it('should list orders with custom filters', async () => {
      prisma.order.findMany.mockResolvedValue(mockOrders);
      prisma.order.count.mockResolvedValue(1);

      const result = await orderService.listOrders({
        status: 'pending',
        userId: 1,
        limit: 5,
        page: 2
      });

      expect(prisma.order.findMany).toHaveBeenCalledWith({
        where: {
          status: 'pending',
          userId: 1
        },
        include: expect.any(Object),
        skip: 5,
        take: 5,
        orderBy: { createdAt: 'desc' }
      });
    });
  });

  describe('updateOrderStatus', () => {
    const mockOrder = {
      id: 1,
      status: 'pending',
      items: [
        {
          productId: 1,
          quantity: 2
        }
      ]
    };

    it('should update order status', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.order.update.mockResolvedValue({
        ...mockOrder,
        status: 'confirmed'
      });

      const result = await orderService.updateOrderStatus(1, 'confirmed');

      expect(result.status).toBe('confirmed');
    });

    it('should throw error when status is invalid', async () => {
      await expect(orderService.updateOrderStatus(1, 'invalid'))
        .rejects
        .toThrow('Status inválido');
    });

    it('should return stock when order is cancelled', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.order.update.mockResolvedValue({
        ...mockOrder,
        status: 'cancelled'
      });

      await orderService.updateOrderStatus(1, 'cancelled');

      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { stock: { increment: 2 } }
      });
    });
  });

  describe('deleteOrder', () => {
    const mockOrder = {
      id: 1,
      status: 'pending',
      items: [
        {
          productId: 1,
          quantity: 2
        }
      ]
    };

    it('should delete pending order', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);

      await orderService.deleteOrder(1);

      expect(prisma.orderItem.deleteMany).toHaveBeenCalledWith({
        where: { orderId: 1 }
      });
      expect(prisma.order.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { stock: { increment: 2 } }
      });
    });

    it('should throw error when order is not pending', async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: 'confirmed'
      });

      await expect(orderService.deleteOrder(1))
        .rejects
        .toThrow('Apenas pedidos pendentes podem ser deletados');
    });
  });
}); 