const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { registerUser, loginUser } = require('../services/user.service');

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
    return res.status(500).json({ error: 'Internal server error' });
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
    return res.status(400).json({ error: error.message });
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

    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
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
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Gerar token JWT
const generateToken = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: error.message });
  }
};

module.exports = {
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  generateToken
}; 