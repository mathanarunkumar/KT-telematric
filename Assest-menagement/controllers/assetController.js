const { Asset, AssetCategory, AssetTransaction, Employee } = require('../models/asset');
const { Op } = require('sequelize');

exports.getAllAssets = async (req, res) => {
  try {
    const { categoryId, status, search, branch } = req.query;
    const where = {};
    
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    if (branch) where.branch = branch;
    
    if (search) {
      where[Op.or] = [
        { make: { [Op.iLike]: `%${search}%` } },
        { model: { [Op.iLike]: `%${search}%` } },
        { serialNumber: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    const assets = await Asset.findAll({
      where,
      include: [{ model: AssetCategory, as: 'category' }]
    });
    
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.issueAsset = async (req, res) => {
  try {
    const { assetId, employeeId, notes } = req.body;
    
    const asset = await Asset.findByPk(assetId);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    if (asset.status !== 'in_stock') {
      return res.status(400).json({ error: 'Asset is not available for issue' });
    }
    
    const employee = await Employee.findByPk(employeeId);
    if (!employee || !employee.isActive) {
      return res.status(400).json({ error: 'Employee not found or inactive' });
    }
    
    await sequelize.transaction(async (t) => {
      await Asset.update(
        { status: 'issued' },
        { where: { id: assetId }, transaction: t }
      );
      
      await AssetTransaction.create({
        assetId,
        employeeId,
        transactionType: 'issue',
        notes
      }, { transaction: t });
    });
    
    res.json({ message: 'Asset issued successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.returnAsset = async (req, res) => {
  try {
    const { assetId, returnReason, notes } = req.body;
    
    const asset = await Asset.findByPk(assetId, {
      include: [{
        model: AssetTransaction,
        as: 'transactions',
        where: { transactionType: 'issue' },
        order: [['transactionDate', 'DESC']],
        limit: 1
      }]
    });
    
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    if (asset.status !== 'issued') {
      return res.status(400).json({ error: 'Asset is not issued' });
    }
    
    const lastTransaction = asset.transactions[0];
    if (!lastTransaction) {
      return res.status(400).json({ error: 'No issue transaction found for this asset' });
    }
    
    await sequelize.transaction(async (t) => {
      await Asset.update(
        { status: 'returned' },
        { where: { id: assetId }, transaction: t }
      );
      
      await AssetTransaction.create({
        assetId,
        employeeId: lastTransaction.employeeId,
        transactionType: 'return',
        returnReason,
        notes
      }, { transaction: t });
    });
    
    res.json({ message: 'Asset returned successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.scrapAsset = async (req, res) => {
  try {
    const { assetId, notes } = req.body;
    
    const asset = await Asset.findByPk(assetId);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    await sequelize.transaction(async (t) => {
      await Asset.update(
        { status: 'scrapped' },
        { where: { id: assetId }, transaction: t }
      );
      
      await AssetTransaction.create({
        assetId,
        transactionType: 'scrap',
        notes
      }, { transaction: t });
    });
    
    res.json({ message: 'Asset marked as scrapped successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAssetHistory = async (req, res) => {
  try {
    const { assetId } = req.params;
    
    const history = await AssetTransaction.findAll({
      where: { assetId },
      include: [
        { model: Employee, as: 'employee' },
        { model: Asset, as: 'asset' }
      ],
      order: [['transactionDate', 'DESC']]
    });
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// In assetController.js
exports.getStockView = async (req, res) => {
  try {
    const stock = await Asset.findAll({
      where: { status: 'in_stock' },
      include: [{ model: AssetCategory, as: 'category' }]
    });
    
    // Group by branch
    const branchSummary = {};
    let totalValue = 0;
    
    stock.forEach(asset => {
      if (!branchSummary[asset.branch]) {
        branchSummary[asset.branch] = {
          count: 0,
          value: 0
        };
      }
      
      branchSummary[asset.branch].count++;
      branchSummary[asset.branch].value += asset.purchaseCost;
      totalValue += asset.purchaseCost;
    });
    
    res.render('stock', { 
      stock, 
      branchSummary, 
      totalValue 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};