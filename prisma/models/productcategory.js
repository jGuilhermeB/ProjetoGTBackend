model ProductCategory {
  productId Int
  categoryId Int

  product   Product  @relation(fields: [productId], references: [id])
  category  Category @relation(fields: [categoryId], references: [id])

  @@id([productId, categoryId])
}


//npx prisma migrate dev --name add_product_category 

// para adicionae a tabela de relacionamento entre produtos e categorias