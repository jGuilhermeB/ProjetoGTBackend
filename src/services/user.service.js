const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

async function registerUser(firstname, surname, email, password) {
  const userExists = await prisma.user.findUnique({
    where: { email }
  });

  if (userExists) {
    throw new Error('Email já cadastrado');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
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
      email: true
    }
  });

  return user;
}

async function loginUser(email, password) {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  const validPassword = await bcrypt.compare(password, user.password);
  
  if (!validPassword) {
    throw new Error('Senha inválida');
  }

  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION }
  );

  return {
    token,
    user: {
      id: user.id,
      firstname: user.firstname,
      surname: user.surname,
      email: user.email
    }
  };
}

async function getUserById(id) {
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
    throw new Error('Usuário não encontrado');
  }

  return user;
}

async function updateUser(id, data) {
  const user = await prisma.user.findUnique({
    where: { id: Number(id) }
  });

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  const updateData = { ...data };

  if (data.email && data.email !== user.email) {
    const emailExists = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (emailExists) {
      throw new Error('Email já cadastrado');
    }
  }

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  const updatedUser = await prisma.user.update({
    where: { id: Number(id) },
    data: updateData,
    select: {
      id: true,
      firstname: true,
      surname: true,
      email: true
    }
  });

  return updatedUser;
}

async function deleteUser(id) {
  const user = await prisma.user.findUnique({
    where: { id: Number(id) }
  });

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  await prisma.user.delete({
    where: { id: Number(id) }
  });
}

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  updateUser,
  deleteUser
}; 