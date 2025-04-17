const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const assetController = require('../controllers/assetController');
const assetCategoryController = require('../controllers/assetCategoryController');


// Employee routes
router.get('/employees', employeeController.getAllEmployees);
router.post('/employees', employeeController.createEmployee);
router.put('/employees/:id', employeeController.updateEmployee);

// Asset routes
router.get('/assets', assetController.getAllAssets);
router.post('/assets/issue', assetController.issueAsset);
router.post('/assets/return', assetController.returnAsset);
router.post('/assets/scrap', assetController.scrapAsset);
router.get('/assets/:assetId/history', assetController.getAssetHistory);

// Asset Category routes
router.get('/asset-categories', assetCategoryController.getAllCategories);
router.post('/asset-categories', assetCategoryController.createCategory);
router.get('/asset-categories/:id', assetCategoryController.getCategoryById);
router.put('/asset-categories/:id', assetCategoryController.updateCategory);
router.delete('/asset-categories/:id', assetCategoryController.deleteCategory);

module.exports = router;