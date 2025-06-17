const jwt = require('jsonwebtoken');

const CHAVE_SECRETA = process.env.JWT_SECRET || 'chave-secreta-padrao';
const TEMPO_EXPIRACAO = process.env.JWT_EXPIRES_IN || '1d';

/**
 * Gera um token JWT
 * @param {Object} dados - Dados a serem incluídos no token
 * @returns {String} Token JWT
 */
const gerarToken = (dados) => {
  return jwt.sign(dados, CHAVE_SECRETA, { expiresIn: TEMPO_EXPIRACAO });
};

/**
 * Verifica um token JWT
 * @param {String} token - Token JWT a ser verificado
 * @returns {Object} Dados do token
 */
const verificarToken = (token) => {
  try {
    return jwt.verify(token, CHAVE_SECRETA);
  } catch (erro) {
    throw new Error('Token inválido ou expirado');
  }
};

module.exports = {
  gerarToken,
  verificarToken
}; 