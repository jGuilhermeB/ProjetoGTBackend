/**
 * @swagger
 * components:
 *   schemas:
 *     ValidationError:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [error]
 *         message:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 */

/**
 * Valida um ID
 * @param {*} id - ID a ser validado
 * @returns {Number} ID validado
 */
const validarId = (id) => {
  const idNumero = Number(id);
  if (isNaN(idNumero) || idNumero <= 0) {
    throw new Error('ID inválido');
  }
  return idNumero;
};

/**
 * Valida um email
 * @param {String} email - Email a ser validado
 * @returns {String} Email validado
 */
const validarEmail = (email) => {
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !regexEmail.test(email)) {
    throw new Error('Email inválido');
  }
  return email;
};

/**
 * Valida uma senha
 * @param {String} senha - Senha a ser validada
 * @returns {String} Senha validada
 */
const validarSenha = (senha) => {
  if (!senha || senha.length < 6) {
    throw new Error('A senha deve ter pelo menos 6 caracteres');
  }
  return senha;
};

/**
 * Valida um slug
 * @param {String} slug - Slug a ser validado
 * @returns {String} Slug validado
 */
const validarSlug = (slug) => {
  const regexSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slug || !regexSlug.test(slug)) {
    throw new Error('Slug inválido. Use apenas letras minúsculas, números e hífens');
  }
  return slug;
};

/**
 * Valida parâmetros de paginação
 * @param {Object} params - Parâmetros de paginação
 * @returns {Object} Parâmetros validados
 */
const validarPaginacao = ({ limite = 10, pagina = 1 }) => {
  const limiteNumero = Number(limite);
  const paginaNumero = Number(pagina);

  if (isNaN(limiteNumero) || limiteNumero <= 0) {
    throw new Error('Limite inválido');
  }

  if (isNaN(paginaNumero) || paginaNumero <= 0) {
    throw new Error('Página inválida');
  }

  return {
    limite: limiteNumero,
    pagina: paginaNumero
  };
};

/**
 * Valida um preço
 * @param {Number} preco - Preço a ser validado
 * @returns {Number} Preço validado
 */
const validarPreco = (preco) => {
  const precoNumero = Number(preco);
  if (isNaN(precoNumero) || precoNumero < 0) {
    throw new Error('Preço inválido');
  }
  return precoNumero;
};

/**
 * Valida um estoque
 * @param {Number} estoque - Estoque a ser validado
 * @returns {Number} Estoque validado
 */
const validarEstoque = (estoque) => {
  const estoqueNumero = Number(estoque);
  if (isNaN(estoqueNumero) || estoqueNumero < 0) {
    throw new Error('Estoque inválido');
  }
  return estoqueNumero;
};

module.exports = {
  id: validarId,
  email: validarEmail,
  senha: validarSenha,
  slug: validarSlug,
  paginacao: validarPaginacao,
  preco: validarPreco,
  estoque: validarEstoque
}; 