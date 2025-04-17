module.exports = (sequelize, DataTypes) => {
    const Asset = sequelize.define('Asset', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      serialNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      make: {
        type: DataTypes.STRING,
        allowNull: false
      },
      model: {
        type: DataTypes.STRING,
        allowNull: false
      },
      purchaseDate: {
        type: DataTypes.DATE,
        allowNull: false
      },
      purchaseCost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('in_stock', 'issued', 'returned', 'scrapped'),
        defaultValue: 'in_stock'
      },
      branch: {
        type: DataTypes.STRING,
        allowNull: false
      }
    });
  
    Asset.associate = models => {
      Asset.belongsTo(models.AssetCategory, {
        foreignKey: 'categoryId',
        as: 'category'
      });
      
      Asset.hasMany(models.AssetTransaction, {
        foreignKey: 'assetId',
        as: 'transactions'
      });
    };
  
    return Asset;
  };