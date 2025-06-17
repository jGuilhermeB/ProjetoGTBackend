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

async function listCategories(limit = 12, page = 1, useInMenu = null) {
  const skip = (page - 1) * limit;
  
  const where = {};
  if (useInMenu !== null) {
    where.useInMenu = useInMenu;
  }

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      skip: limit === -1 ? undefined : skip,
      take: limit === -1 ? undefined : limit,
      orderBy: { name: 'asc' }
    }),
    prisma.category.count({ where })
  ]);

  return {
    data: categories,
    total,
    limit,
    page,
    total_pages: Math.ceil(total / limit)
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

  const updatedCategory = await prisma.category.update({
    where: { id: Number(id) },
    data: {
      name: data.name,
      slug: data.slug,
      useInMenu: data.useInMenu
    }
  });

  return updatedCategory;
}

async function deleteCategory(id) {
  const category = await prisma.category.findUnique({
    where: { id: Number(id) }
  });

  if (!category) {
    throw new Error('Categoria não encontrada');
  }

  // Verificar se existem produtos associados
  const productsCount = await prisma.productCategory.count({
    where: { categoryId: Number(id) }
  });

  if (productsCount > 0) {
    throw new Error('Não é possível deletar uma categoria que possui produtos');
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