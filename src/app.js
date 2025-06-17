import express from 'express';
import productCategoryRoutes from './routes/productCategoryRoutes.js';

const app = express();

app.use(express.json());

// Rotas de ProductCategory
app.use('/product-categories', productCategoryRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});