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

module.exports = {
  registerUser,
  loginUser
}; 