# Backend do Sistema de E-commerce

Este é o backend de um sistema de e-commerce desenvolvido com Node.js, Express e Prisma.

## Tecnologias Utilizadas

- Node.js
- Express
- Prisma (ORM)
- PostgreSQL
- JWT (Autenticação)
- Swagger (Documentação)
- Jest (Testes)

## Requisitos

- Node.js >= 18.0.0
- PostgreSQL >= 12.0.0

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/projeto-gt-backend.git
cd projeto-gt-backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Configurações do Servidor
PORT=3000
NODE_ENV=development

# Configurações do Banco de Dados
DATABASE_URL="postgresql://user:password@localhost:5432/database?schema=public"

# Configurações de Autenticação
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d

# Configurações de Email (opcional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=your-password

# Configurações de Upload (opcional)
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880 # 5MB
```

4. Execute as migrações do banco de dados:
```bash
npm run prisma:migrate
```

5. Inicie o servidor:
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## Documentação da API

A documentação da API está disponível em `/api-docs` quando o servidor estiver rodando.

## Estrutura do Projeto

```
src/
  ├── config/         # Configurações
  ├── controllers/    # Controladores
  ├── middleware/     # Middlewares
  ├── routes/         # Rotas
  ├── services/       # Serviços
  ├── utils/          # Utilitários
  └── server.js       # Arquivo principal
```

## Testes

```bash
# Executar testes
npm test

# Executar testes em modo watch
npm run test:watch

# Gerar relatório de cobertura
npm run test:coverage
```

## Scripts Disponíveis

- `npm start`: Inicia o servidor em modo produção
- `npm run dev`: Inicia o servidor em modo desenvolvimento
- `npm test`: Executa os testes
- `npm run test:watch`: Executa os testes em modo watch
- `npm run test:coverage`: Gera relatório de cobertura de testes
- `npm run prisma:generate`: Gera o cliente Prisma
- `npm run prisma:migrate`: Executa as migrações do banco de dados
- `npm run prisma:studio`: Abre o Prisma Studio

## Endpoints Principais

### Autenticação
- `POST /api/auth/register`: Registra um novo usuário
- `POST /api/auth/login`: Autentica um usuário
- `GET /api/auth/:id`: Obtém um usuário pelo ID (requer autenticação)
- `PUT /api/auth/:id`: Atualiza um usuário (requer autenticação)
- `DELETE /api/auth/:id`: Remove um usuário (requer autenticação)

### Categorias
- `GET /api/categories`: Lista todas as categorias
- `POST /api/categories`: Cria uma nova categoria
- `GET /api/categories/:id`: Obtém uma categoria pelo ID
- `PUT /api/categories/:id`: Atualiza uma categoria
- `DELETE /api/categories/:id`: Remove uma categoria

### Produtos
- `GET /api/products`: Lista todos os produtos
- `POST /api/products`: Cria um novo produto
- `GET /api/products/:id`: Obtém um produto pelo ID
- `PUT /api/products/:id`: Atualiza um produto
- `DELETE /api/products/:id`: Remove um produto

### Pedidos
- `GET /api/orders`: Lista todos os pedidos
- `POST /api/orders`: Cria um novo pedido
- `GET /api/orders/:id`: Obtém um pedido pelo ID
- `PUT /api/orders/:id/status`: Atualiza o status de um pedido
- `DELETE /api/orders/:id`: Remove um pedido

---

## Exemplos de Payloads para Testes

### Registro de Usuário
```json
{
  "firstname": "João",
  "surname": "Silva",
  "email": "joao@email.com",
  "password": "123456",
  "confirmPassword": "123456"
}
```

### Login de Usuário
```json
{
  "email": "joao@email.com",
  "password": "123456"
}
```

### Criação de Categoria
```json
{
  "name": "Roupas",
  "slug": "roupas",
  "useInMenu": true
}
```

### Criação de Produto
```json
{
  "name": "Camiseta Polo",
  "slug": "camiseta-polo",
  "description": "Camiseta polo 100% algodão",
  "price": 99.9,
  "priceWithDiscount": 89.9,
  "stock": 50,
  "enabled": true,
  "useInMenu": true,
  "category_ids": [1],
  "images": [
    { "path": "img/camiseta.jpg", "enabled": true }
  ],
  "options": [
    {
      "title": "Tamanho",
      "shape": "square",
      "radius": 0,
      "type": "select",
      "values": ["P", "M", "G"]
    }
  ]
}
```

### Criação de Pedido
```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "options": "{\"Tamanho\":\"M\"}"
    }
  ]
}
```

### Atualização de Status do Pedido
```json
{
  "status": "shipped"
}
```

> **Nota:** Para rotas protegidas, envie o token JWT no header:
> `Authorization: Bearer <seu_token>`

---

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença ISC.