const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const response = require('../utils/response');

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json(response.unauthorized('Token não fornecido'));
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      return res.status(401).json(response.unauthorized('Token mal formatado'));
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json(response.unauthorized('Token mal formatado'));
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json(response.unauthorized('Token inválido'));
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      });

      if (!user) {
        return res.status(401).json(response.unauthorized('Usuário não encontrado'));
      }

      req.user = {
        id: user.id,
        email: user.email
      };

      return next();
    });
  } catch (error) {
    return res.status(500).json(response.serverError('Erro ao autenticar'));
  }
};

module.exports = authMiddleware; 