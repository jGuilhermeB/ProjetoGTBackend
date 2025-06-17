const { verificarToken } = require('../config/jwt');
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

/**
 * Middleware de autenticação
 * Verifica se o token JWT é válido
 */
const middlewareAutenticacao = (req, res, next) => {
  try {
    // Obtém o token do cabeçalho
    const cabecalhoAutenticacao = req.headers.authorization;

    if (!cabecalhoAutenticacao) {
      return res.status(401).json(response.naoAutorizado('Token não fornecido'));
    }

    // Verifica se o token está no formato correto
    const partes = cabecalhoAutenticacao.split(' ');

    if (partes.length !== 2) {
      return res.status(401).json(response.naoAutorizado('Token mal formatado'));
    }

    const [esquema, token] = partes;

    if (!/^Bearer$/i.test(esquema)) {
      return res.status(401).json(response.naoAutorizado('Token mal formatado'));
    }

    // Verifica o token
    const dadosDecodificados = verificarToken(token);

    // Adiciona o ID do usuário na requisição
    req.idUsuario = dadosDecodificados.id;

    return next();
  } catch (erro) {
    return res.status(401).json(response.naoAutorizado(erro.message));
  }
};

module.exports = middlewareAutenticacao; 