const prisma = require('../config/prisma');
const { Prisma } = require('@prisma/client');

// Validações em objetos separados
const validations = {
  name: (name) => name && name.length >= 3 && name.length <= 100,
  slug: (slug) => slug && /^[a-z0-9-]+$/.test(slug) && slug.length <= 100,
  price: (price) => price && price > 0,
  priceWithDiscount: (price, discount) => !discount || (discount > 0 && discount < price),
  stock: (stock) => stock >= 0,
  description: (desc) => !desc || desc.length <= 1000,
  categories: (ids) => Array.isArray(ids) && ids.length > 0,
  images: (images) => {
    if (!images) return true;
    if (!Array.isArray(images)) return false;
    return images.every(img => {
      if (!img.path) return false;
      try {
        new URL(img.path);
        return true;
      } catch {
        return false;
      }
    });
  },
  options: (options) => {
    if (!options) return true;
    if (!Array.isArray(options)) return false;
    return options.every(opt => {
      if (!opt.title || opt.title.length > 50) return false;
      if (!Array.isArray(opt.values)) return false;
      return opt.values.every(value => typeof value === 'string' && value.length <= 50);
    });
  }
};

// Função para validar produto
const validateProduct = (data) => {
  const errors = [];

  if (!validations.name(data.name)) {
    errors.push('Nome deve ter entre 3 e 100 caracteres');
  }
  
  if (!validations.slug(data.slug)) {
    errors.push('Slug inválido. Use apenas letras minúsculas, números e hífens (máx 100 caracteres)');
  }
  
  if (!validations.price(data.price)) {
    errors.push('Preço deve ser maior que zero');
  }

  if (!validations.priceWithDiscount(data.price, data.priceWithDiscount)) {
    errors.push('Preço com desconto deve ser maior que zero e menor que o preço original');
  }

  if (!validations.stock(data.stock)) {
    errors.push('Estoque não pode ser negativo');
  }

  if (!validations.description(data.description)) {
    errors.push('Descrição deve ter no máximo 1000 caracteres');
  }
  
  if (!validations.categories(data.category_ids)) {
    errors.push('Selecione pelo menos uma categoria');
  }

  if (!validations.images(data.images)) {
    errors.push('Imagens inválidas. Cada imagem deve ter uma URL válida');
  }

  if (!validations.options(data.options)) {
    errors.push('Opções inválidas. Cada opção deve ter um título (máx 50 caracteres) e valores válidos (máx 50 caracteres)');
  }
  
  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }
};

// Cache para slugs
const slugCache = new Map();

// Funções auxiliares
const formatOption = (option) => ({
  title: option.title,
  shape: option.shape ?? 'square',
  radius: option.radius ?? 0,
  type: option.type ?? 'text',
  values: JSON.stringify(option.values)
});

const formatImage = (image) => ({
  path: image.path,
  enabled: image.enabled ?? true
});

const createProductData = (data) => ({
  ...data,
  name: data.name,
  slug: data.slug,
  enabled: data.enabled ?? false,
  useInMenu: data.useInMenu ?? false,
  stock: data.stock ?? 0,
  priceWithDiscount: data.priceWithDiscount || data.price,
  images: {
    create: data.images?.map(formatImage) ?? []
  },
  options: {
    create: data.options?.map(formatOption) ?? []
  },
  categories: {
    create: data.category_ids.map(categoryId => ({
      category: { connect: { id: Number(categoryId) } }
    }))
  }
});

const buildWhereClause = (params) => {
  const where = {};

  if (params.match) {
    where.OR = [
      { name: { contains: params.match, mode: 'insensitive' } },
      { description: { contains: params.match, mode: 'insensitive' } }
    ];
  }

  if (params.category_ids) {
    where.categories = {
      some: {
        categoryId: {
          in: params.category_ids.split(',').map(Number)
        }
      }
    };
  }

  if (params.price_range) {
    const [min, max] = params.price_range.split('-').map(Number);
    where.price = { gte: min, lte: max };
  }

  if (params.stock_range) {
    const [min, max] = params.stock_range.split('-').map(Number);
    where.stock = { gte: min, lte: max };
  }

  if (params.enabled !== undefined) {
    where.enabled = params.enabled === 'true';
  }

  if (params.useInMenu !== undefined) {
    where.useInMenu = params.useInMenu === 'true';
  }

  return where;
};

async function createProduct(data) {
  try {
    validateProduct(data);
    
    if (slugCache.has(data.slug)) {
      throw new Error('Produto já existe');
    }

    const productExists = await prisma.product.findUnique({
      where: { slug: data.slug }
    });

    if (productExists) {
      slugCache.set(data.slug, true);
      throw new Error('Produto já existe');
    }

    const categories = await prisma.category.findMany({
      where: { id: { in: data.category_ids.map(Number) } }
    });

    if (categories.length !== data.category_ids.length) {
      throw new Error('Uma ou mais categorias não existem');
    }

    const product = await prisma.$transaction(async (prisma) => {
      const newProduct = await prisma.product.create({
        data: createProductData(data),
        include: {
          images: true,
          options: true,
          categories: {
            include: { category: true }
          }
        }
      });

      slugCache.set(data.slug, true);
      return newProduct;
    });

    return product;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new Error('Erro ao criar produto: ' + error.message);
    }
    throw error;
  }
}

async function getProductById(id) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: {
        images: true,
        options: true,
        categories: {
          include: { category: true }
        }
      }
    });

    if (!product) {
      throw new Error('Produto não encontrado');
    }

    product.options = product.options.map(option => ({
      ...option,
      values: JSON.parse(option.values)
    }));

    return product;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new Error('Erro ao buscar produto: ' + error.message);
    }
    throw error;
  }
}

async function listProducts(params) {
  try {
    const {
      limit = 12,
      page = 1,
      fields = [],
      sort_by = 'created_at',
      sort_order = 'desc'
    } = params;

    const skip = (page - 1) * limit;
    const where = buildWhereClause(params);
    
    const select = fields.length > 0
      ? fields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
      : undefined;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: select ? {
          ...select,
          images: true,
          options: true,
          categories: {
            include: { category: true }
          }
        } : undefined,
        skip: limit === -1 ? undefined : skip,
        take: limit === -1 ? undefined : limit,
        orderBy: { [sort_by]: sort_order }
      }),
      prisma.product.count({ where })
    ]);

    products.forEach(product => {
      if (product.options) {
        product.options = product.options.map(option => ({
          ...option,
          values: JSON.parse(option.values)
        }));
      }
    });

    return {
      data: products,
      total,
      limit,
      page,
      total_pages: Math.ceil(total / limit)
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new Error('Erro ao listar produtos: ' + error.message);
    }
    throw error;
  }
}

async function updateProduct(id, data) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: {
        images: true,
        options: true,
        categories: true
      }
    });

    if (!product) {
      throw new Error('Produto não encontrado');
    }

    if (data.slug && data.slug !== product.slug) {
      if (slugCache.has(data.slug)) {
        throw new Error('Slug já está em uso');
      }

      const slugExists = await prisma.product.findUnique({
        where: { slug: data.slug }
      });

      if (slugExists) {
        slugCache.set(data.slug, true);
        throw new Error('Slug já está em uso');
      }
    }

    if (data.category_ids) {
      const categories = await prisma.category.findMany({
        where: { id: { in: data.category_ids.map(Number) } }
      });

      if (categories.length !== data.category_ids.length) {
        throw new Error('Uma ou mais categorias não existem');
      }
    }

    const updatedProduct = await prisma.$transaction(async (prisma) => {
      const product = await prisma.product.update({
        where: { id: Number(id) },
        data: {
          ...data,
          enabled: data.enabled !== undefined ? data.enabled : product.enabled,
          useInMenu: data.useInMenu !== undefined ? data.useInMenu : product.useInMenu,
          stock: data.stock !== undefined ? data.stock : product.stock,
          priceWithDiscount: data.priceWithDiscount || data.price,
          images: data.images ? {
            deleteMany: {},
            create: data.images
              .filter(img => !img.deleted)
              .map(formatImage)
          } : undefined,
          options: data.options ? {
            deleteMany: {},
            create: data.options
              .filter(opt => !opt.deleted)
              .map(formatOption)
          } : undefined,
          categories: data.category_ids ? {
            deleteMany: {},
            create: data.category_ids.map(categoryId => ({
              category: { connect: { id: Number(categoryId) } }
            }))
          } : undefined
        },
        include: {
          images: true,
          options: true,
          categories: {
            include: { category: true }
          }
        }
      });

      if (data.slug) {
        slugCache.set(data.slug, true);
      }

      return product;
    });

    updatedProduct.options = updatedProduct.options.map(option => ({
      ...option,
      values: JSON.parse(option.values)
    }));

    return updatedProduct;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new Error('Erro ao atualizar produto: ' + error.message);
    }
    throw error;
  }
}

async function deleteProduct(id) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(id) }
    });

    if (!product) {
      throw new Error('Produto não encontrado');
    }

    await prisma.$transaction(async (prisma) => {
      await prisma.productImage.deleteMany({
        where: { productId: Number(id) }
      });

      await prisma.productOption.deleteMany({
        where: { productId: Number(id) }
      });

      await prisma.productCategory.deleteMany({
        where: { productId: Number(id) }
      });

      await prisma.product.delete({
        where: { id: Number(id) }
      });

      slugCache.delete(product.slug);
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new Error('Erro ao deletar produto: ' + error.message);
    }
    throw error;
  }
}

module.exports = {
  createProduct,
  getProductById,
  listProducts,
  updateProduct,
  deleteProduct
}; 