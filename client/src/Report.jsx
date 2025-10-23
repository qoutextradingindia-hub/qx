import React from 'react';

const Report = () => {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-yellow-400 mb-6">Reports</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Trading Report</h2>
            <p className="text-gray-300">View your trading performance and statistics.</p>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Income Report</h2>
            <p className="text-gray-300">Track your earnings and income sources.</p>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Team Report</h2>
            <p className="text-gray-300">Monitor your team's performance and growth.</p>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Transaction Report</h2>
            <p className="text-gray-300">Review all your transactions and deposits.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
