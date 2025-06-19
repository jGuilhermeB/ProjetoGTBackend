const prisma = require('../config/prisma');
const { Prisma } = require('@prisma/client');

const validations = {
  name: (name) => {
    if (!name || typeof name !== 'string' || name.length < 3) {
      throw new Error('Nome deve ter pelo menos 3 caracteres');
    }
    return name.trim();
  },
  slug: (slug) => {
    if (!slug || typeof slug !== 'string' || !/^[a-z0-9-]+$/.test(slug)) {
      throw new Error('Slug inválido. Use apenas letras minúsculas, números e hífens');
    }
    return slug.trim();
  },
  price: (price) => {
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      throw new Error('Preço deve ser um número positivo');
    }
    return numPrice;
  },
  priceWithDiscount: (price, priceWithDiscount) => {
    if (!priceWithDiscount) return null;
    const numPriceWithDiscount = Number(priceWithDiscount);
    if (isNaN(numPriceWithDiscount) || numPriceWithDiscount < 0 || numPriceWithDiscount > price) {
      throw new Error('Preço com desconto deve ser um número positivo menor que o preço original');
    }
    return numPriceWithDiscount;
  },
  stock: (stock) => {
    const numStock = Number(stock);
    if (isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
      throw new Error('Estoque deve ser um número inteiro positivo');
    }
    return numStock;
  },
  category_ids: async (category_ids) => {
    if (!Array.isArray(category_ids) || category_ids.length === 0) {
      throw new Error('É necessário informar pelo menos uma categoria');
    }
    const categories = await prisma.category.findMany({
      where: { id: { in: category_ids } }
    });
    if (categories.length !== category_ids.length) {
      throw new Error('Uma ou mais categorias não existem');
    }
    return category_ids;
  },
  images: (images) => {
    if (!images) return [];
    if (!Array.isArray(images)) {
      throw new Error('Imagens deve ser um array');
    }
    return images.map(image => ({
      path: image.path,
      enabled: image.enabled ?? true
    }));
  },
  options: (options) => {
    if (!options) return [];
    if (!Array.isArray(options)) {
      throw new Error('Opções deve ser um array');
    }
    return options.map(option => ({
      title: option.title,
      shape: option.shape,
      radius: option.radius,
      type: option.type,
      values: option.values
    }));
  }
};

const formatOption = (option) => ({
  id: option.id,
  title: option.title,
  shape: option.shape,
  radius: option.radius,
  type: option.type,
  values: option.values,
  enabled: option.enabled
});

const formatImage = (image) => ({
  id: image.id,
  path: image.path,
  enabled: image.enabled
});

const createProductData = async (data) => {
  const name = validations.name(data.name);
  const slug = validations.slug(data.slug);
  const price = validations.price(data.price);
  const priceWithDiscount = validations.priceWithDiscount(price, data.priceWithDiscount);
  const stock = validations.stock(data.stock);
  const category_ids = await validations.category_ids(data.category_ids);
  const images = validations.images(data.images);
  const options = validations.options(data.options);

  return {
    name,
    slug,
    description: data.description?.trim(),
    price,
    priceWithDiscount,
    stock,
    enabled: data.enabled ?? true,
    useInMenu: data.useInMenu ?? true,
    categories: {
      create: category_ids.map(id => ({ category: { connect: { id } } }))
    },
    images: {
      create: images
    },
    options: {
      create: options
    }
  };
};

const buildWhereClause = (filters) => {
  const where = {};

  if (filters.match) {
    where.OR = [
      { name: { contains: filters.match, mode: 'insensitive' } },
      { description: { contains: filters.match, mode: 'insensitive' } }
    ];
  }

  if (filters.category_ids?.length > 0) {
    where.categories = {
      some: {
        category_id: { in: filters.category_ids }
      }
    };
  }

  if (filters.price_range) {
    where.price = {
      gte: filters.price_range.min,
      lte: filters.price_range.max
    };
  }

  if (filters.stock_range) {
    where.stock = {
      gte: filters.stock_range.min,
      lte: filters.stock_range.max
    };
  }

  if (filters.enabled !== undefined) {
    where.enabled = filters.enabled;
  }

  if (filters.useInMenu !== undefined) {
    where.useInMenu = filters.useInMenu;
  }

  return where;
};

const createProduct = async (data) => {
  const productData = await createProductData(data);
  return prisma.product.create({
    data: productData,
    include: {
      categories: {
        include: {
          category: true
        }
      },
      images: true,
      options: true
    }
  });
};

const getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
    include: {
      categories: {
        include: {
          category: true
        }
      },
      images: true,
      options: true
    }
  });

  if (!product) {
    throw new Error('Produto não encontrado');
  }

  return {
    ...product,
    categories: product.categories.map(c => c.category),
    images: product.images.map(formatImage),
    options: product.options.map(formatOption)
  };
};

const listProducts = async (filters = {}) => {
  const { limit = 10, page = 1, sort_by = 'created_at', sort_order = 'desc' } = filters;
  const skip = (page - 1) * limit;
  const where = buildWhereClause(filters);

  const validSortFields = [
    'id', 'enabled', 'name', 'slug', 'useInMenu', 'stock', 'description',
    'price', 'priceWithDiscount', 'createdAt', 'updatedAt'
  ];
  let sortField = sort_by;
  if (!validSortFields.includes(sort_by)) {
    sortField = 'createdAt';
  }
  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortField]: sort_order },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        images: true,
        options: true
      }
    })
  ]);

  return {
    data: products.map(product => ({
      ...product,
      categories: product.categories.map(c => c.category),
      images: product.images.map(formatImage),
      options: product.options.map(formatOption)
    })),
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit
    }
  };
};

const updateProduct = async (id, data) => {
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
    include: {
      categories: true,
      images: true,
      options: true
    }
  });

  if (!product) {
    throw new Error('Produto não encontrado');
  }

  const updateData = {};
  if (data.name) updateData.name = validations.name(data.name);
  if (data.slug) updateData.slug = validations.slug(data.slug);
  if (data.description !== undefined) updateData.description = data.description?.trim();
  if (data.price !== undefined) updateData.price = validations.price(data.price);
  if (data.priceWithDiscount !== undefined) {
    updateData.priceWithDiscount = validations.priceWithDiscount(updateData.price || product.price, data.priceWithDiscount);
  }
  if (data.stock !== undefined) updateData.stock = validations.stock(data.stock);
  if (data.enabled !== undefined) updateData.enabled = data.enabled;
  if (data.useInMenu !== undefined) updateData.useInMenu = data.useInMenu;

  if (data.category_ids) {
    const category_ids = await validations.category_ids(data.category_ids);
    updateData.categories = {
      deleteMany: {},
      create: category_ids.map(id => ({ category: { connect: { id } } }))
    };
  }

  if (data.images) {
    const images = validations.images(data.images);
    const imagesToDelete = product.images.filter(img => !images.find(i => i.path === img.path));
    const imagesToCreate = images.filter(img => !product.images.find(i => i.path === img.path));

    if (imagesToDelete.length > 0) {
      updateData.images = {
        deleteMany: {
          id: { in: imagesToDelete.map(img => img.id) }
        }
      };
    }

    if (imagesToCreate.length > 0) {
      updateData.images = {
        ...updateData.images,
        create: imagesToCreate
      };
    }
  }

  if (data.options) {
    const options = validations.options(data.options);
    const optionsToDelete = product.options.filter(opt => !options.find(o => o.title === opt.title));
    const optionsToCreate = options.filter(opt => !product.options.find(o => o.title === opt.title));

    if (optionsToDelete.length > 0) {
      updateData.options = {
        deleteMany: {
          id: { in: optionsToDelete.map(opt => opt.id) }
        }
      };
    }

    if (optionsToCreate.length > 0) {
      updateData.options = {
        ...updateData.options,
        create: optionsToCreate
      };
    }
  }

  return prisma.product.update({
    where: { id: Number(id) },
    data: updateData,
    include: {
      categories: {
        include: {
          category: true
        }
      },
      images: true,
      options: true
    }
  });
};

const deleteProduct = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id: Number(id) }
  });

  if (!product) {
    throw new Error('Produto não encontrado');
  }

  await prisma.product.delete({
    where: { id: Number(id) }
  });

  return product;
};

module.exports = {
  createProduct,
  getProductById,
  listProducts,
  updateProduct,
  deleteProduct
};