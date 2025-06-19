const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { registerUser, loginUser } = require('../services/user.service');
const userService = require('../services/user.service');
const response = require('../utils/response');
const validation = require('../utils/validation');

// Obter usuário por ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        firstname: true,
        surname: true,
        email: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ erro: error.message });
  }
};

// Criar usuário
const createUser = async (req, res) => {
  try {
    const { firstname, surname, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const user = await registerUser(firstname, surname, email, password);
    return res.status(201).json(user);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ erro: error.message });
  }
};

// Atualizar usuário
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstname, surname, email } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: Number(id) }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (email !== user.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });

      if (emailExists) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    await prisma.user.update({
      where: { id: Number(id) },
      data: {
        firstname,
        surname,
        email
      }
    });

    return res.json({ mensagem: `Usuário atualizado com sucesso! ID: ${id}` });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ erro: error.message });
  }
};

// Deletar usuário
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: Number(id) }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.user.delete({
      where: { id: Number(id) }
    });

    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(400).json({ erro: error.message });
  }
};

// Gerar token JWT
const gerarToken = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: error.message });
  }
};

const register = async (req, res) => {
  try {
    const { firstname, surname, email, password } = req.body;

    // Validações
    validation.email(email);
    validation.password(password);

    if (!firstname || !surname) {
      throw new Error('Nome e sobrenome são obrigatórios');
    }

    const user = await userService.registerUser(firstname, surname, email, password);
    return res.status(201).json(response.sucesso(user));
  } catch (error) {
    if (error.message.includes('Email já cadastrado')) {
      return res.status(409).json(response.error(error.message));
    }
    return res.status(400).json(response.error(error.message));
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validações
    validation.email(email);
    validation.password(password);

    const result = await userService.loginUser(email, password);
    return res.json(response.sucesso(result));
  } catch (error) {
    return res.status(401).json(response.unauthorized(error.message));
  }
};

const getById = async (req, res) => {
  try {
    const id = validation.id(req.params.id);
    const user = await userService.getUserById(id);
    return res.json(response.sucesso(user));
  } catch (error) {
    if (error.message.includes('não encontrado')) {
      return res.status(404).json(response.notFound(error.message));
    }
    return res.status(400).json(response.error(error.message));
  }
};

const update = async (req, res) => {
  try {
    const id = validation.id(req.params.id);
    const { firstname, surname, email, password } = req.body;

    // Validações
    if (email) validation.email(email);
    if (password) validation.password(password);

    const user = await userService.updateUser(id, { firstname, surname, email, password });
    return res.json(response.sucesso(user));
  } catch (error) {
    if (error.message.includes('não encontrado')) {
      return res.status(404).json(response.notFound(error.message));
    }
    return res.status(400).json(response.error(error.message));
  }
};

const remove = async (req, res) => {
  try {
    const id = validation.id(req.params.id);
    await userService.deleteUser(id);
    return res.json(response.sucesso({ message: 'Usuário removido com sucesso' }));
  } catch (error) {
    if (error.message.includes('não encontrado')) {
      return res.status(404).json(response.notFound(error.message));
    }
    return res.status(400).json(response.error(error.message));
  }
};

module.exports = {
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  gerarToken,
  register,
  login,
  getById,
  update,
  delete: remove
};