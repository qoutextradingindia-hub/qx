const express = require('express');
const router = express.Router();
const Symbol = require('../models/symbol');
const mongoose = require('mongoose');

// Simplified Admin Auth Middleware (for testing)
const adminAuth = async (req, res, next) => {
  try {
    // For now, allow all requests to test symbol creation
    // In production, add proper JWT verification
    console.log('🔐 Admin auth middleware - allowing request for testing');
    
    // Set a dummy user for now
    req.user = {
      _id: new mongoose.Types.ObjectId(),
      email: 'admin@startraders.com',
      isAdmin: true
    };
    
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({ success: false, message: 'Unauthorized admin access' });
  }
};

// GET /admin/symbol/list - List all symbols
router.get('/list', adminAuth, async (req, res) => {
  try {
    const { category, status, page = 1, limit = 20 } = req.query;
    
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    
    const symbols = await Symbol.find(filter)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Symbol.countDocuments(filter);
    
    res.json({
      success: true,
      symbols,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin symbol list error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch symbols' });
  }
});

// POST /admin/symbol/add - Add new symbol
router.post('/add', adminAuth, async (req, res) => {
  try {
    const {
      name,
      symbol,
      category,
      payoutPercent,
      icon,
      binanceSymbol,
      twelveDataSymbol,
      minTradeAmount,
      maxTradeAmount,
      expiryOptions,
      isPopular
    } = req.body;

    // Validation
    if (!name || !symbol || !category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, symbol, and category are required' 
      });
    }

    // Check if symbol already exists
    const existingSymbol = await Symbol.findOne({ symbol: symbol.toUpperCase() });
    if (existingSymbol) {
      return res.status(400).json({ 
        success: false, 
        message: 'Symbol already exists' 
      });
    }

    const newSymbol = new Symbol({
      name: name.trim(),
      symbol: symbol.toUpperCase().trim(),
      category,
      payoutPercent: payoutPercent || 80,
      icon: icon || '',
      binanceSymbol: binanceSymbol || '',
      twelveDataSymbol: twelveDataSymbol || '',
      minTradeAmount: minTradeAmount || 1,
      maxTradeAmount: maxTradeAmount || 1000,
      expiryOptions: expiryOptions || [30, 60, 120, 300],
      isPopular: isPopular || false,
      createdBy: req.user._id,
      status: 'ACTIVE' // Set to active by default for testing
    });

    await newSymbol.save();
    
    console.log('✅ Symbol created successfully:', newSymbol.symbol);

    res.status(201).json({
      success: true,
      message: 'Symbol added successfully',
      symbol: newSymbol
    });
  } catch (error) {
    console.error('Admin add symbol error:', error);
    res.status(500).json({ success: false, message: 'Failed to add symbol' });
  }
});

// PUT /admin/symbol/:id - Update symbol
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Remove fields that shouldn't be updated via this endpoint
    delete updateData._id;
    delete updateData.createdBy;
    delete updateData.createdAt;
    
    // Add updatedBy
    updateData.updatedBy = req.user?._id || new mongoose.Types.ObjectId();

    const updatedSymbol = await Symbol.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy updatedBy', 'name email');

    if (!updatedSymbol) {
      return res.status(404).json({ success: false, message: 'Symbol not found' });
    }

    res.json({
      success: true,
      message: 'Symbol updated successfully',
      symbol: updatedSymbol
    });
  } catch (error) {
    console.error('Admin update symbol error:', error);
    res.status(500).json({ success: false, message: 'Failed to update symbol' });
  }
});

// PATCH /admin/symbol/status/:id - Update symbol status only
router.patch('/status/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['ACTIVE', 'INACTIVE', 'MAINTENANCE'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid status required (ACTIVE, INACTIVE, MAINTENANCE)' 
      });
    }

    const updatedSymbol = await Symbol.findByIdAndUpdate(
      id,
      { 
        status,
        updatedBy: req.user?._id || new mongoose.Types.ObjectId()
      },
      { new: true }
    );

    if (!updatedSymbol) {
      return res.status(404).json({ success: false, message: 'Symbol not found' });
    }

    res.json({
      success: true,
      message: `Symbol status updated to ${status}`,
      symbol: updatedSymbol
    });
  } catch (error) {
    console.error('Admin update symbol status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update symbol status' });
  }
});

// DELETE /admin/symbol/:id - Delete symbol (soft delete by setting status to INACTIVE)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSymbol = await Symbol.findByIdAndUpdate(
      id,
      { 
        status: 'INACTIVE',
        updatedBy: req.user?._id || new mongoose.Types.ObjectId()
      },
      { new: true }
    );

    if (!deletedSymbol) {
      return res.status(404).json({ success: false, message: 'Symbol not found' });
    }

    res.json({
      success: true,
      message: 'Symbol deactivated successfully',
      symbol: deletedSymbol
    });
  } catch (error) {
    console.error('Admin delete symbol error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete symbol' });
  }
});

// GET /admin/symbol/categories - Get available categories
router.get('/categories', adminAuth, async (req, res) => {
  try {
    const categories = ['CRYPTO', 'FOREX', 'STOCKS', 'COMMODITIES'];
    const categoryCounts = await Symbol.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const categoryData = categories.map(cat => ({
      name: cat,
      count: categoryCounts.find(c => c._id === cat)?.count || 0
    }));

    res.json({
      success: true,
      categories: categoryData
    });
  } catch (error) {
    console.error('Admin categories error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

module.exports = router;