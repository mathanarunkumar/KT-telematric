const { AssetCategory } = require('../models/assetCategory');
const { Op } = require('sequelize');

/**
 * Get all asset categories
 */
exports.getAllCategories = async (req, res) => {
  try {
    const { search } = req.query;
    const where = {};
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    const categories = await AssetCategory.findAll({ where });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create new asset category
 */
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    const category = await AssetCategory.create({ name, description });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Update asset category
 */
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await AssetCategory.update(req.body, {
      where: { id }
    });
    
    if (updated) {
      const updatedCategory = await AssetCategory.findByPk(id);
      res.json(updatedCategory);
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Delete asset category
 */
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await AssetCategory.destroy({
      where: { id }
    });
    
    if (deleted) {
      res.json({ message: 'Category deleted successfully' });
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (error) {
    res.status(400).json({ 
      error: 'Cannot delete category with associated assets',
      details: error.message
    });
  }
};

/**
 * Get single category by ID
 */
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await AssetCategory.findByPk(id, {
      include: ['assets'] // Includes associated assets if needed
    });
    
    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};