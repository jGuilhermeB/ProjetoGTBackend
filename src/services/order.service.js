const prisma = require('../config/prisma');
const { Prisma } = require('@prisma/client');

const validations = {
  items: (items) => {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('É necessário informar pelo menos um item');
    }
    return items.map(item => ({
      product_id: Number(item.product_id),
      quantity: Number(item.quantity),
      options: item.options || []
    }));
  },
  status: (status) => {
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error('Status inválido');
    }
    return status;
  }
};

const createOrder = async (userId, items) => {
  const validatedItems = validations.items(items);

  const products = await prisma.product.findMany({
    where: {
      id: { in: validatedItems.map(item => item.product_id) }
    },
    include: {
      options: true
    }
  });

  if (products.length !== validatedItems.length) {
    throw new Error('Um ou mais produtos não existem');
  }

  const orderItems = validatedItems.map(item => {
    const product = products.find(p => p.id === item.product_id);
    if (product.stock < item.quantity) {
      throw new Error(`Estoque insuficiente para o produto ${product.name}`);
    }

    const options = item.options.map(option => {
      const productOption = product.options.find(opt => opt.title === option.title);
      if (!productOption) {
        throw new Error(`Opção ${option.title} não existe para o produto ${product.name}`);
      }
      if (!productOption.values.includes(option.value)) {
        throw new Error(`Valor ${option.value} não é válido para a opção ${option.title} do produto ${product.name}`);
      }
      return option;
    });

    return {
      product_id: product.id,
      quantity: item.quantity,
      price: product.price,
      options: options
    };
  });

  return prisma.$transaction(async (prisma) => {
    const order = await prisma.order.create({
      data: {
        user_id: userId,
        status: 'pending',
        items: {
          create: orderItems.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            options: item.options
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

    await Promise.all(orderItems.map(item => 
      prisma.product.update({
        where: { id: item.product_id },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      })
    ));

    return order;
  });
};

const getOrderById = async (id) => {
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

  return order;
};

const listOrders = async (filters = {}) => {
  const { limit = 10, page = 1, status, sort_by = 'created_at', sort_order = 'desc' } = filters;
  const skip = (page - 1) * limit;

  const where = {};
  if (status) {
    where.status = validations.status(status);
  }

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sort_by]: sort_order },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })
  ]);

  return {
    data: orders,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit
    }
  };
};

const updateOrderStatus = async (id, status) => {
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

  const validatedStatus = validations.status(status);

  if (order.status === 'cancelled' && validatedStatus !== 'cancelled') {
    throw new Error('Não é possível alterar o status de um pedido cancelado');
  }

  if (order.status === 'completed' && validatedStatus !== 'completed') {
    throw new Error('Não é possível alterar o status de um pedido finalizado');
  }

  if (validatedStatus === 'cancelled' && order.status !== 'cancelled') {
    await prisma.$transaction(async (prisma) => {
      await Promise.all(order.items.map(item =>
        prisma.product.update({
          where: { id: item.product_id },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        })
      ));

      await prisma.order.update({
        where: { id: Number(id) },
        data: { status: validatedStatus }
      });
    });
  } else {
    await prisma.order.update({
      where: { id: Number(id) },
      data: { status: validatedStatus }
    });
  }

  return getOrderById(id);
};

const deleteOrder = async (id) => {
  const order = await prisma.order.findUnique({
    where: { id: Number(id) }
  });

  if (!order) {
    throw new Error('Pedido não encontrado');
  }

  if (order.status !== 'pending') {
    throw new Error('Apenas pedidos pendentes podem ser removidos');
  }

  await prisma.$transaction(async (prisma) => {
    await Promise.all(order.items.map(item =>
      prisma.product.update({
        where: { id: item.product_id },
        data: {
          stock: {
            increment: item.quantity
          }
        }
      })
    ));

    await prisma.order.delete({
      where: { id: Number(id) }
    });
  });

  return order;
};

module.exports = {
  createOrder,
  getOrderById,
  listOrders,
  updateOrderStatus,
  deleteOrder
}; 