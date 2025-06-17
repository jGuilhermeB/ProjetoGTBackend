require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const routes = require('./routes');

const app = express();
const PORTA = process.env.PORTA || 3000;

// Configuração do Swagger
const opcoesSwagger = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de E-commerce',
      version: '1.0.0',
      description: 'API para sistema de e-commerce',
      contact: {
        name: 'Suporte',
        email: 'suporte@exemplo.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORTA}`,
        description: 'Servidor de Desenvolvimento'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerDocs = swaggerJsDoc(opcoesSwagger);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api', routes);

// Middleware de tratamento de erros
app.use((erro, req, res, next) => {
  console.error(erro);
  res.status(500).json({
    sucesso: false,
    erro: 'Erro interno do servidor'
  });
});

// Inicialização do servidor
app.listen(PORTA, () => {
  console.log(`Servidor rodando na porta ${PORTA}`);
  console.log(`Documentação disponível em: http://localhost:${PORTA}/api-docs`);
});
