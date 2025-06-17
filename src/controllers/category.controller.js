const {
  createCategory,
  getCategoryById,
  listCategories,
  updateCategory,
  deleteCategory
} = require('../services/category.service');

// Listar categorias
const listCategoriesController = async (req, res) => {
  try {
    const { limit = 12, page = 1, fields, use_in_menu } = req.query;
    
    const parsedFields = fields ? fields.split(',') : [];
    const parsedUseInMenu = use_in_menu === 'true' ? true : use_in_menu === 'false' ? false : null;

    const result = await listCategories(
      Number(limit),
      Number(page),
      parsedFields,
      parsedUseInMenu
    );

    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Obter categoria por ID
const getCategoryByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await getCategoryById(id);
    return res.json(category);
  } catch (error) {
    console.error(error);
    if (error.message === 'Categoria não encontrada') {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Criar categoria
const createCategoryController = async (req, res) => {
  try {
    const { name, slug, use_in_menu } = req.body;
    const category = await createCategory(name, slug, use_in_menu);
    return res.status(201).json(category);
  } catch (error) {
    console.error(error);
    if (error.message === 'Categoria já existe') {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Atualizar categoria
const updateCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, use_in_menu } = req.body;
    
    await updateCategory(id, {
      name,
      slug,
      useInMenu: use_in_menu
    });

    return res.status(204).send();
  } catch (error) {
    console.error(error);
    if (error.message === 'Categoria não encontrada') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Slug já está em uso') {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Deletar categoria
const deleteCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteCategory(id);
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    if (error.message === 'Categoria não encontrada') {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  listCategoriesController,
  getCategoryByIdController,
  createCategoryController,
  updateCategoryController,
  deleteCategoryController
}; 