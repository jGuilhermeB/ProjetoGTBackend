const prisma = require('../config/prisma');
const { Prisma } = require('@prisma/client');

// Validações
const validations = {
  items: (items) => {
    if (!Array.isArray(items) || items.length === 0) return false;
    return items.every(item => (
      item.productId &&
      item.quantity > 0 &&
      item.options !== undefined
    ));
  },
  status: (status) => ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'].includes(status)
};

// Função para validar pedido
const validateOrder = (data) => {
  const errors = [];

  if (!validations.items(data.items)) {
    errors.push('Itens do pedido inválidos. Cada item deve ter productId, quantity e options');
  }

  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }
};

// Função para calcular o total do pedido
const calculateOrderTotal = (items) => {
  return items.reduce((total, item) => {
    const price = item.price || 0;
    return total + (price * item.quantity);
  }, 0);
};

// Função para verificar estoque
const checkStock = async (items) => {
  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: Number(item.productId) }
    });

    if (!product) {
      throw new Error(`Produto ${item.productId} não encontrado`);
    }

    if (product.stock < item.quantity) {
      throw new Error(`Estoque insuficiente para o produto ${product.name}`);
    }
  }
};

// Função para atualizar estoque
const updateStock = async (items, operation = 'decrease') => {
  for (const item of items) {
    await prisma.product.update({
      where: { id: Number(item.productId) },
      data: {
        stock: {
          [operation === 'decrease' ? 'decrement' : 'increment']: item.quantity
        }
      }
    });
  }
};

async function createOrder(userId, data) {
  try {
    validateOrder(data);

    // Verificar estoque
    await checkStock(data.items);

    // Calcular total
    const total = calculateOrderTotal(data.items);

    // Criar pedido com transação
    const order = await prisma.$transaction(async (prisma) => {
      // Criar pedido
      const newOrder = await prisma.order.create({
        data: {
          userId: Number(userId),
          status: 'pending',
          total,
          items: {
            create: data.items.map(item => ({
              productId: Number(item.productId),
              quantity: item.quantity,
              price: item.price,
              options: item.options ? JSON.stringify(item.options) : null
            }))
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      // Atualizar estoque
      await updateStock(data.items, 'decrease');

      return newOrder;
    });

    // Formatar resposta
    order.items = order.items.map(item => ({
      ...item,
      options: item.options ? JSON.parse(item.options) : null
    }));

    return order;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new Error('Erro ao criar pedido: ' + error.message);
    }
    throw error;
  }
}

async function getOrderById(id) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    // Formatar resposta
    order.items = order.items.map(item => ({
      ...item,
      options: item.options ? JSON.parse(item.options) : null
    }));

    return order;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new Error('Erro ao buscar pedido: ' + error.message);
    }
    throw error;
  }
}

async function listOrders(params) {
  try {
    const {
      limit = 10,
      page = 1,
      status,
      userId
    } = params;

    const skip = (page - 1) * limit;
    const where = {};

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = Number(userId);
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: true
            }
          }
        },
        skip: limit === -1 ? undefined : skip,
        take: limit === -1 ? undefined : limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    // Formatar resposta
    orders.forEach(order => {
      order.items = order.items.map(item => ({
        ...item,
        options: item.options ? JSON.parse(item.options) : null
      }));
    });

    return {
      data: orders,
      total,
      limit,
      page,
      total_pages: Math.ceil(total / limit)
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new Error('Erro ao listar pedidos: ' + error.message);
    }
    throw error;
  }
}

async function updateOrderStatus(id, status) {
  try {
    if (!validations.status(status)) {
      throw new Error('Status inválido');
    }

    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        items: true
      }
    });

    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    // Se o pedido for cancelado, devolver o estoque
    if (status === 'cancelled' && order.status !== 'cancelled') {
      await updateStock(order.items, 'increase');
    }

    const updatedOrder = await prisma.order.update({
      where: { id: Number(id) },
      data: { status },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Formatar resposta
    updatedOrder.items = updatedOrder.items.map(item => ({
      ...item,
      options: item.options ? JSON.parse(item.options) : null
    }));

    return updatedOrder;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new Error('Erro ao atualizar status do pedido: ' + error.message);
    }
    throw error;
  }
}

async function deleteOrder(id) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        items: true
      }
    });

    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    // Só permite deletar pedidos pendentes
    if (order.status !== 'pending') {
      throw new Error('Apenas pedidos pendentes podem ser deletados');
    }

    await prisma.$transaction(async (prisma) => {
      // Deletar itens do pedido
      await prisma.orderItem.deleteMany({
        where: { orderId: Number(id) }
      });

      // Deletar pedido
      await prisma.order.delete({
        where: { id: Number(id) }
      });

      // Devolver estoque
      await updateStock(order.items, 'increase');
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new Error('Erro ao deletar pedido: ' + error.message);
    }
    throw error;
  }
}

module.exports = {
  createOrder,
  getOrderById,
  listOrders,
  updateOrderStatus,
  deleteOrder
}; 