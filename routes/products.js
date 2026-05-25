// API routes for product operations (SQLite)
const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const { auth, adminOnly } = require('../middleware/auth');

// POST /api/products - Add new product (Admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const productData = req.body;

    // Validation
    if (!productData.sku || !productData.productName ||
      !productData.boxPrice || !productData.ctnPrice || !productData.bagPrice
      || !productData.middleUnit) {
      return res.status(400).json({
        success: false,
        message: 'All field are required'
      });
    }

    const result = await Invoice.addProduct(productData);
    res.json(result);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding product',
      error: error.message
    });
  }
});

// GET /api/products - Get all products (Authenticated)
router.get('/', auth, async (req, res) => {
  try {
    const products = await Invoice.getAllProducts();
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});
// GET /api/products/:sku - Get product by SKU (Authenticated)
router.get('/sku/:sku', auth, async (req, res) => {
  try {
    const product = await Invoice.getProductBySku(req.params.sku);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
});

// PUT /api/products/:id - Update product (Admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const productData = req.body;

    // Validation
    if (!productData.productName ||
      !productData.boxPrice || !productData.ctnPrice || !productData.bagPrice) {
      return res.status(400).json({
        success: false,
        message: 'All field are required'
      });
    }

    const result = await Invoice.updateProduct(req.params.id, productData);
    res.json(result);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
});

// DELETE /api/products/:id - Delete product (Admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const result = await Invoice.deleteProduct(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
});

module.exports = router;
