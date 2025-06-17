const prisma = require('../config/prisma');

async function createCategory(name, slug, useInMenu = false) {
  const categoryExists = await prisma.category.findUnique({
    where: { slug }
  });

  if (categoryExists) {
    throw new Error('Categoria já existe');
  }

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      useInMenu
    }
  });

  return category;
}

async function getCategoryById(id) {
  const category = await prisma.category.findUnique({
    where: { id: Number(id) }
  });

  if (!category) {
    throw new Error('Categoria não encontrada');
  }

  return category;
}

async function listCategories(limit = 12, page = 1, fields = [], useInMenu = null) {
  const skip = (page - 1) * limit;
  
  const where = {};
  if (useInMenu !== null) {
    where.useInMenu = useInMenu;
  }

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      select: fields.length > 0 ? fields.reduce((acc, field) => ({ ...acc, [field]: true }), {}) : undefined,
      skip: limit === -1 ? undefined : skip,
      take: limit === -1 ? undefined : limit
    }),
    prisma.category.count({ where })
  ]);

  return {
    data: categories,
    total,
    limit,
    page
  };
}

async function updateCategory(id, data) {
  const category = await prisma.category.findUnique({
    where: { id: Number(id) }
  });

  if (!category) {
    throw new Error('Categoria não encontrada');
  }

  if (data.slug && data.slug !== category.slug) {
    const slugExists = await prisma.category.findUnique({
      where: { slug: data.slug }
    });

    if (slugExists) {
      throw new Error('Slug já está em uso');
    }
  }

  return prisma.category.update({
    where: { id: Number(id) },
    data
  });
}

async function deleteCategory(id) {
  const category = await prisma.category.findUnique({
    where: { id: Number(id) }
  });

  if (!category) {
    throw new Error('Categoria não encontrada');
  }

  await prisma.category.delete({
    where: { id: Number(id) }
  });
}

module.exports = {
  createCategory,
  getCategoryById,
  listCategories,
  updateCategory,
  deleteCategory
}; 