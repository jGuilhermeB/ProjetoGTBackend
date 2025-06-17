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

const response = {
  success: (data, status = 200) => ({
    status: 'success',
    data,
    timestamp: new Date().toISOString()
  }),

  error: (message, status = 400) => ({
    status: 'error',
    message,
    timestamp: new Date().toISOString()
  }),

  notFound: (message = 'Recurso não encontrado') => ({
    status: 'error',
    message,
    timestamp: new Date().toISOString()
  }),

  unauthorized: (message = 'Não autorizado') => ({
    status: 'error',
    message,
    timestamp: new Date().toISOString()
  }),

  forbidden: (message = 'Acesso negado') => ({
    status: 'error',
    message,
    timestamp: new Date().toISOString()
  }),

  serverError: (message = 'Erro interno do servidor') => ({
    status: 'error',
    message,
    timestamp: new Date().toISOString()
  })
};

module.exports = response; 