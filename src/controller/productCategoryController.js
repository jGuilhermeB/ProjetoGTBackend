import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Criar relação Produto-Categoria
export const createProductCategory = async (req, res) => {
  const { productId, categoryId } = req.body;

  try {
    const relation = await prisma.productCategory.create({
      data: {
        productId,
        categoryId,
      },
    });
    res.status(201).json(relation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Listar todas as relações Produto-Categoria
export const getAllProductCategories = async (req, res) => {
  try {
    const relations = await prisma.productCategory.findMany({
      include: {
        product: true,
        category: true,
      },
    });
    res.status(200).json(relations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Deletar uma relação Produto-Categoria
export const deleteProductCategory = async (req, res) => {
  const { productId, categoryId } = req.body;

  try {
    await prisma.productCategory.delete({
      where: {
        productId_categoryId: {
          productId,
          categoryId,
        },
      },
    });
    res.status(200).json({ message: 'Relação deletada com sucesso.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

  // Listar todas as categorias de um produto específico
export const getCategoriesByProduct = async (req, res) => {
  const { productId } = req.params;

  try {
    const categories = await prisma.productCategory.findMany({
      where: { productId: parseInt(productId) },
      include: { category: true },
    });

    res.status(200).json(categories.map((rel) => rel.category));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Listar todos os produtos de uma categoria específica
export const getProductsByCategory = async (req, res) => {
  const { categoryId } = req.params;

  try {
    const products = await prisma.productCategory.findMany({
      where: { categoryId: parseInt(categoryId) },
      include: { product: true },
    });

    res.status(200).json(products.map((rel) => rel.product));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export default {
  createProductCategory,
  getAllProductCategories,
  deleteProductCategory,
  getCategoriesByProduct,
  getProductsByCategory,
}
