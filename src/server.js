const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Carrega as variáveis de ambiente
dotenv.config();

// Importa as rotas
const userRoutes = require('./routes/user.routes');
const categoryRoutes = require('./routes/category.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/v1/user', userRoutes);
app.use('/v1/category', categoryRoutes);

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
