/**
 * @swagger
 * components:
 *   schemas:
 *     ApiResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [success, error]
 *         data:
 *           type: object
 *         message:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 */

/**
 * Formata uma resposta de sucesso
 * @param {*} dados - Dados a serem retornados
 * @returns {Object} Resposta formatada
 */
const sucesso = (dados) => ({
  sucesso: true,
  dados
});

/**
 * Formata uma resposta de erro
 * @param {String} mensagem - Mensagem de erro
 * @returns {Object} Resposta formatada
 */
const erro = (mensagem) => ({
  sucesso: false,
  erro: mensagem
});

/**
 * Formata uma resposta de não encontrado
 * @param {String} mensagem - Mensagem de erro
 * @returns {Object} Resposta formatada
 */
const naoEncontrado = (mensagem) => ({
  sucesso: false,
  erro: mensagem || 'Recurso não encontrado'
});

/**
 * Formata uma resposta de não autorizado
 * @param {String} mensagem - Mensagem de erro
 * @returns {Object} Resposta formatada
 */
const naoAutorizado = (mensagem) => ({
  sucesso: false,
  erro: mensagem || 'Não autorizado'
});

/**
 * Formata uma resposta de erro do servidor
 * @param {String} mensagem - Mensagem de erro
 * @returns {Object} Resposta formatada
 */
const erroServidor = (mensagem) => ({
  sucesso: false,
  erro: mensagem || 'Erro interno do servidor'
});

module.exports = {
  sucesso,
  erro,
  naoEncontrado,
  naoAutorizado,
  erroServidor
}; 