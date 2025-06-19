const categoryService = require('../services/category.service');
const response = require('../utils/response');
const validation = require('../utils/validation');

// Listar categorias
const list = async (req, res) => {
  try {
    const { limit, page, useInMenu } = req.query;
    const pagination = validation.pagination({ limit, page });
    
    const categories = await categoryService.listCategories(
      pagination.limit,
      pagination.page,
      useInMenu === 'true'
    );
    
    return res.json(response.sucesso(categories));
  } catch (error) {
    return res.status(400).json(response.error(error.message));
  }
};

// Obter categoria por ID
const getById = async (req, res) => {
  try {
    const id = validation.id(req.params.id);
    const category = await categoryService.getCategoryById(id);
    return res.json(response.sucesso(category));
  } catch (error) {
    if (error.message.includes('não encontrada')) {
      return res.status(404).json(response.notFound(error.message));
    }
    return res.status(400).json(response.error(error.message));
  }
};

// Criar categoria
const create = async (req, res) => {
  try {
    const { name, slug, useInMenu } = req.body;

    // Validações
    if (!name || !slug) {
      throw new Error('Nome e slug são obrigatórios');
    }

    validation.slug(slug);

    const category = await categoryService.createCategory(name, slug, useInMenu);
    return res.status(201).json(response.sucesso(category));
  } catch (error) {
    if (error.message.includes('já existe')) {
      return res.status(409).json(response.erro(error.message));
    }
    return res.status(400).json(response.erro(error.message));
  }
};

// Atualizar categoria
const update = async (req, res) => {
  try {
    const id = validation.id(req.params.id);
    const { name, slug, useInMenu } = req.body;

    // Validações
    if (slug) validation.slug(slug);

    const category = await categoryService.updateCategory(id, { name, slug, useInMenu });
    return res.json(response.sucesso(category));
  } catch (error) {
    if (error.message.includes('não encontrada')) {
      return res.status(404).json(response.notFound(error.message));
    }
    if (error.message.includes('já existe')) {
      return res.status(409).json(response.erro(error.message));
    }
    return res.status(400).json(response.erro(error.message));
  }
};

// Deletar categoria
const remove = async (req, res) => {
  try {
    const id = validation.id(req.params.id);
    await categoryService.deleteCategory(id);
    return res.json(response.sucesso({ message: 'Categoria removida com sucesso' }));
  } catch (error) {
    if (error.message.includes('não encontrada')) {
      return res.status(404).json(response.notFound(error.message));
    }
    return res.status(400).json(response.error(error.message));
  }
};

module.exports = {
  create,
  list,
  getById,
  update,
  delete: remove
};