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
    minTradeAmount: 1,
    maxTradeAmount: 1000,
    expiryOptions: [30, 60, 120, 300],
    isPopular: false
  });

  const API_BASE = 'https://qxtrand.onrender.com/api';

  useEffect(() => {
    fetchSymbols();
    fetchCategories();
  }, []);

  const fetchSymbols = async () => {
    try {
      const response = await axios.get(`${API_BASE}/admin/symbol/list`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
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
      
      const response = await axios({
        method,
        url,
        data: formData,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        alert(editingSymbol ? 'Symbol updated successfully!' : 'Symbol added successfully!');
        fetchSymbols();
        resetForm();
      }
    } catch (error) {
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
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Trading Symbols Management</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium"
          >
            Add New Symbol
          </button>
        </div>

        {/* Categories Overview */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {categories.map((cat) => (
            <div key={cat.name} className="bg-gray-800 p-4 rounded-lg text-center">
              <h3 className="text-lg font-semibold">{cat.name}</h3>
              <p className="text-2xl text-blue-400">{cat.count}</p>
            </div>
          ))}
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-gray-800 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-bold mb-4">
              {editingSymbol ? 'Edit Symbol' : 'Add New Symbol'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                  placeholder="e.g., Bitcoin"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Symbol</label>
                <input
                  type="text"
                  required
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                  placeholder="e.g., BTCUSDT"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
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

              <div className="col-span-2 flex gap-2">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-medium"
                >
                  {editingSymbol ? 'Update Symbol' : 'Add Symbol'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Symbols Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="p-3 text-left">Symbol</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Payout %</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Popular</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {symbols.map((symbol) => (
                <tr key={symbol._id} className="border-t border-gray-700">
                  <td className="p-3 font-mono font-bold">{symbol.symbol}</td>
                  <td className="p-3">{symbol.name}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-blue-600 rounded text-xs">
                      {symbol.category}
                    </span>
                  </td>
                  <td className="p-3">{symbol.payoutPercent}%</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      symbol.status === 'ACTIVE' ? 'bg-green-600' :
                      symbol.status === 'INACTIVE' ? 'bg-red-600' : 'bg-yellow-600'
                    }`}>
                      {symbol.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {symbol.isPopular ? '⭐' : ''}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(symbol)}
                        className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
                      >
                        Edit
                      </button>
                      {symbol.status !== 'ACTIVE' && (
                        <button
                          onClick={() => updateStatus(symbol._id, 'ACTIVE')}
                          className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs"
                        >
                          Activate
                        </button>
                      )}
                      {symbol.status === 'ACTIVE' && (
                        <button
                          onClick={() => updateStatus(symbol._id, 'INACTIVE')}
                          className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
                        >
                          Deactivate
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
          <div className="text-center py-8 text-gray-400">
            No symbols found. Add your first trading symbol!
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSymbols;