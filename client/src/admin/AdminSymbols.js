import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminSymbols = () => {
  const [symbols, setSymbols] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSymbol, setEditingSymbol] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    category: 'CRYPTO',
    payoutPercent: 80,
    icon: '',
    binanceSymbol: '',
    twelveDataSymbol: '',
    apiEndpoint: '',
    apiKey: '',
    priceSource: 'FALLBACK', // BINANCE, TWELVEDATA, CUSTOM_API, FALLBACK
    minTradeAmount: 1,
    maxTradeAmount: 1000,
    expiryOptions: [30, 60, 120, 300],
    isPopular: false,
    customPriceFormula: '', // For custom price calculations
    updateInterval: 2000 // Price update interval in milliseconds
  });

  const API_BASE = 'https://qxtrand.onrender.com/api';

  useEffect(() => {
    fetchSymbols();
    fetchCategories();
  }, []);

  const fetchSymbols = async () => {
    try {
      const token = localStorage.getItem('token') || 'admin-test-token';
      
      const response = await axios.get(`${API_BASE}/admin/symbol/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setSymbols(response.data.symbols);
      }
    } catch (error) {
      console.error('Error fetching symbols:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE}/admin/symbol/categories`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingSymbol 
        ? `${API_BASE}/admin/symbol/${editingSymbol._id}`
        : `${API_BASE}/admin/symbol/add`;
      
      const method = editingSymbol ? 'PUT' : 'POST';
      
      // For testing - use dummy token if none exists
      const token = localStorage.getItem('token') || 'admin-test-token';
      
      console.log('🚀 Submitting symbol:', formData);
      console.log('📡 API URL:', url);
      
      const response = await axios({
        method,
        url,
        data: formData,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        alert(editingSymbol ? 'Symbol updated successfully!' : 'Symbol added successfully!');
        fetchSymbols();
        resetForm();
      }
    } catch (error) {
      console.error('❌ Symbol submission error:', error);
      console.error('Response:', error.response?.data);
      alert('Error: ' + (error.response?.data?.message || 'Failed to save symbol'));
    }
  };

  const updateStatus = async (symbolId, newStatus) => {
    try {
      const response = await axios.patch(
        `${API_BASE}/admin/symbol/status/${symbolId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      if (response.data.success) {
        alert(`Symbol status updated to ${newStatus}`);
        fetchSymbols();
      }
    } catch (error) {
      alert('Error updating status: ' + (error.response?.data?.message || 'Failed'));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      symbol: '',
      category: 'CRYPTO',
      payoutPercent: 80,
      icon: '',
      binanceSymbol: '',
      twelveDataSymbol: '',
      minTradeAmount: 1,
      maxTradeAmount: 1000,
      expiryOptions: [30, 60, 120, 300],
      isPopular: false
    });
    setEditingSymbol(null);
    setShowAddForm(false);
  };

  const startEdit = (symbol) => {
    setFormData({
      name: symbol.name,
      symbol: symbol.symbol,
      category: symbol.category,
      payoutPercent: symbol.payoutPercent,
      icon: symbol.icon || '',
      binanceSymbol: symbol.binanceSymbol || '',
      twelveDataSymbol: symbol.twelveDataSymbol || '',
      minTradeAmount: symbol.minTradeAmount,
      maxTradeAmount: symbol.maxTradeAmount,
      expiryOptions: symbol.expiryOptions,
      isPopular: symbol.isPopular
    });
    setEditingSymbol(symbol);
    setShowAddForm(true);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="p-6 min-h-screen text-white" style={{ 
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      minHeight: '100vh'
    }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">Trading Symbols Management</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6 py-3 rounded-lg font-medium text-white shadow-lg transition-all"
          >
            ➕ Add New Symbol
          </button>
        </div>

        {/* Categories Overview */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {categories.map((cat) => (
            <div key={cat.name} className="bg-white bg-opacity-10 backdrop-blur-sm p-6 rounded-xl text-center border border-white border-opacity-20 shadow-lg">
              <h3 className="text-lg font-semibold text-white">{cat.name}</h3>
              <p className="text-3xl text-blue-300 font-bold">{cat.count}</p>
            </div>
          ))}
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white bg-opacity-10 backdrop-blur-sm p-8 rounded-xl mb-6 border border-white border-opacity-20 shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-white">
              {editingSymbol ? '✏️ Edit Symbol' : '➕ Add New Symbol'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-white">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 bg-white bg-opacity-20 rounded-lg border border-white border-opacity-30 text-white placeholder-gray-300 focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="e.g., Bitcoin"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2 text-white">Symbol</label>
                <input
                  type="text"
                  required
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                  className="w-full p-3 bg-white bg-opacity-20 rounded-lg border border-white border-opacity-30 text-white placeholder-gray-300 focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono"
                  placeholder="e.g., BTCUSDT"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-white">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-3 bg-white bg-opacity-20 rounded-lg border border-white border-opacity-30 text-white focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="CRYPTO">Crypto</option>
                  <option value="FOREX">Forex</option>
                  <option value="STOCKS">Stocks</option>
                  <option value="COMMODITIES">Commodities</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Payout %</label>
                <input
                  type="number"
                  min="50"
                  max="95"
                  value={formData.payoutPercent}
                  onChange={(e) => setFormData({ ...formData, payoutPercent: parseInt(e.target.value) })}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Min Trade Amount</label>
                <input
                  type="number"
                  min="1"
                  value={formData.minTradeAmount}
                  onChange={(e) => setFormData({ ...formData, minTradeAmount: parseInt(e.target.value) })}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Max Trade Amount</label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxTradeAmount}
                  onChange={(e) => setFormData({ ...formData, maxTradeAmount: parseInt(e.target.value) })}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="mr-2"
                  />
                  Popular Symbol
                </label>
              </div>

              <div className="col-span-2 flex gap-4 pt-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-6 py-3 rounded-lg font-bold text-white shadow-lg transition-all"
                >
                  {editingSymbol ? '💾 Update Symbol' : '➕ Add Symbol'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 px-6 py-3 rounded-lg font-bold text-white shadow-lg transition-all"
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Symbols Table */}
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl overflow-hidden border border-white border-opacity-20 shadow-lg">
          <table className="w-full">
            <thead className="bg-white bg-opacity-20">
              <tr>
                <th className="p-4 text-left text-white font-bold">Symbol</th>
                <th className="p-4 text-left text-white font-bold">Name</th>
                <th className="p-4 text-left text-white font-bold">Category</th>
                <th className="p-4 text-left text-white font-bold">Payout %</th>
                <th className="p-4 text-left text-white font-bold">Status</th>
                <th className="p-4 text-left text-white font-bold">Popular</th>
                <th className="p-4 text-left text-white font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {symbols.map((symbol) => (
                <tr key={symbol._id} className="border-t border-white border-opacity-20 hover:bg-white hover:bg-opacity-5 transition-all">
                  <td className="p-4 font-mono font-bold text-blue-300">{symbol.symbol}</td>
                  <td className="p-4 text-white font-medium">{symbol.name}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-blue-600 bg-opacity-80 rounded-full text-xs font-bold text-white">
                      {symbol.category}
                    </span>
                  </td>
                  <td className="p-4 text-green-300 font-bold">{symbol.payoutPercent}%</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      symbol.status === 'ACTIVE' ? 'bg-green-600 text-white' :
                      symbol.status === 'INACTIVE' ? 'bg-red-600 text-white' : 'bg-yellow-600 text-black'
                    }`}>
                      {symbol.status}
                    </span>
                  </td>
                  <td className="p-4 text-2xl">
                    {symbol.isPopular ? '⭐' : ''}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(symbol)}
                        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg text-xs font-bold text-white transition-all"
                      >
                        ✏️ Edit
                      </button>
                      {symbol.status !== 'ACTIVE' && (
                        <button
                          onClick={() => updateStatus(symbol._id, 'ACTIVE')}
                          className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded-lg text-xs font-bold text-white transition-all"
                        >
                          ✅ Activate
                        </button>
                      )}
                      {symbol.status === 'ACTIVE' && (
                        <button
                          onClick={() => updateStatus(symbol._id, 'INACTIVE')}
                          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg text-xs font-bold text-white transition-all"
                        >
                          ❌ Deactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {symbols.length === 0 && (
          <div className="text-center py-12 text-white">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">No symbols found</h3>
            <p className="text-gray-300">Add your first trading symbol to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSymbols;