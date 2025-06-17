const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { generateToken } = require('../config/jwt');

/**
 * Registra um novo usuário
 * @param {String} firstname - Nome do usuário
 * @param {String} surname - Sobrenome do usuário
 * @param {String} email - Email do usuário
 * @param {String} password - Senha do usuário
 * @returns {Object} Usuário criado
 */
const registerUser = async (firstname, surname, email, password) => {
  // Verifica se o email já está em uso
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new Error('Email já cadastrado');
  }

  // Criptografa a senha
  const hashedPassword = await bcrypt.hash(password, 10);

  // Cria o usuário
  const user = await prisma.user.create({
    data: {
      firstname,
      surname,
      email,
      password: hashedPassword
    },
    select: {
      id: true,
      firstname: true,
      surname: true,
      email: true,
      createdAt: true
    }
  });

  return user;
};

/**
 * Autentica um usuário
 * @param {String} email - Email do usuário
 * @param {String} password - Senha do usuário
 * @returns {Object} Token e dados do usuário
 */
const loginUser = async (email, password) => {
  // Busca o usuário pelo email
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error('Email ou senha inválidos');
  }

  // Verifica a senha
  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    throw new Error('Email ou senha inválidos');
  }

  // Gera o token
  const token = generateToken({
    id: user.id,
    email: user.email
  });

  // Retorna os dados do usuário e o token
  return {
    user: {
      id: user.id,
      firstname: user.firstname,
      surname: user.surname,
      email: user.email
    },
    token
  };
};

/**
 * Busca um usuário pelo ID
 * @param {Number} id - ID do usuário
 * @returns {Object} Dados do usuário
 */
const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstname: true,
      surname: true,
      email: true,
      createdAt: true
    }
  });

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  return user;
};

/**
 * Atualiza os dados de um usuário
 * @param {Number} id - ID do usuário
 * @param {Object} data - Dados a serem atualizados
 * @returns {Object} Usuário atualizado
 */
const updateUser = async (id, data) => {
  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  // Se o email for alterado, verifica se já existe
  if (data.email && data.email !== user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('Email já cadastrado');
    }
  }

  // Se a senha for alterada, criptografa
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      firstname: true,
      surname: true,
      email: true,
      createdAt: true
    }
  });

  return updatedUser;
};

/**
 * Remove um usuário
 * @param {Number} id - ID do usuário
 */
const deleteUser = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  await prisma.user.delete({
    where: { id }
  });
};

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  updateUser,
  deleteUser
}; 