const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        status: 'error',
        message: 'Token não fornecido',
        timestamp: new Date().toISOString()
      });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      return res.status(401).json({
        status: 'error',
        message: 'Token mal formatado',
        timestamp: new Date().toISOString()
      });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({
        status: 'error',
        message: 'Token mal formatado',
        timestamp: new Date().toISOString()
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          status: 'error',
          message: 'Token inválido',
          timestamp: new Date().toISOString()
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      });

      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Usuário não encontrado',
          timestamp: new Date().toISOString()
        });
      }

      req.user = {
        id: user.id,
        email: user.email
      };

      return next();
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao autenticar',
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = authMiddleware; 