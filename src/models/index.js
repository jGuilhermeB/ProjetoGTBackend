const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Modelo de Usuário
class User extends Model {}
User.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  surname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'User',
  timestamps: true
});

// Modelo de Categoria
class Category extends Model {}
Category.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  use_in_menu: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'Category',
  timestamps: true
});

// Modelo de Produto
class Product extends Model {}
Product.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  use_in_menu: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  price_with_discount: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Product',
  timestamps: true
});

// Modelo de Imagem do Produto
class ProductImage extends Model {}
ProductImage.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Product,
      key: 'id'
    }
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'ProductImage',
  timestamps: true
});

// Modelo de Opção do Produto
class ProductOption extends Model {}
ProductOption.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Product,
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  shape: {
    type: DataTypes.ENUM('square', 'circle'),
    defaultValue: 'square'
  },
  radius: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  type: {
    type: DataTypes.ENUM('text', 'color'),
    defaultValue: 'text'
  },
  values: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'ProductOption',
  timestamps: true
});

// Modelo de Relação Produto-Categoria
class ProductCategory extends Model {}
ProductCategory.init({
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Product,
      key: 'id'
    }
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Category,
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'ProductCategory',
  timestamps: false
});

// Definindo relacionamentos
Product.hasMany(ProductImage, { foreignKey: 'product_id' });
ProductImage.belongsTo(Product, { foreignKey: 'product_id' });

Product.hasMany(ProductOption, { foreignKey: 'product_id' });
ProductOption.belongsTo(Product, { foreignKey: 'product_id' });

Product.belongsToMany(Category, { through: ProductCategory, foreignKey: 'product_id' });
Category.belongsToMany(Product, { through: ProductCategory, foreignKey: 'category_id' });

module.exports = {
  User,
  Category,
  Product,
  ProductImage,
  ProductOption,
  ProductCategory
}; 