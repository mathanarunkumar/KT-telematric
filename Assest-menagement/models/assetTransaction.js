module.exports = (sequelize, DataTypes) => {
    const AssetTransaction = sequelize.define('AssetTransaction', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      transactionType: {
        type: DataTypes.ENUM('issue', 'return', 'scrap'),
        allowNull: false
      },
      transactionDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      notes: {
        type: DataTypes.TEXT
      },
      returnReason: {
        type: DataTypes.ENUM('upgrade', 'repair', 'resignation', 'other'),
        allowNull: true
      }
    });
  
    AssetTransaction.associate = models => {
      AssetTransaction.belongsTo(models.Asset, {
        foreignKey: 'assetId',
        as: 'asset'
      });
      
      AssetTransaction.belongsTo(models.Employee, {
        foreignKey: 'employeeId',
        as: 'employee'
      });
    };
  
    return AssetTransaction;
  };