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

const validation = {
  id: (id) => {
    const numId = Number(id);
    if (isNaN(numId) || numId <= 0) {
      throw new Error('ID inválido');
    }
    return numId;
  },

  pagination: (query) => {
    const errors = [];
    const { limit, page } = query;

    if (limit && (isNaN(limit) || limit < 1)) {
      errors.push('Limit deve ser um número positivo');
    }

    if (page && (isNaN(page) || page < 1)) {
      errors.push('Page deve ser um número positivo');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    return {
      limit: limit ? Number(limit) : 10,
      page: page ? Number(page) : 1
    };
  },

  priceRange: (range) => {
    if (!range) return null;
    
    const [min, max] = range.split('-').map(Number);
    if (isNaN(min) || isNaN(max) || min < 0 || max < min) {
      throw new Error('Price range inválido. Use o formato: min-max');
    }
    
    return { min, max };
  },

  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Email inválido');
    }
    return email;
  },

  password: (password) => {
    if (!password || password.length < 6) {
      throw new Error('Senha deve ter no mínimo 6 caracteres');
    }
    return password;
  },

  slug: (slug) => {
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slug || !slugRegex.test(slug) || slug.length > 100) {
      throw new Error('Slug inválido. Use apenas letras minúsculas, números e hífens');
    }
    return slug;
  }
};

module.exports = validation; 