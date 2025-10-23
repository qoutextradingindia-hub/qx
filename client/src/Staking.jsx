import React from 'react';

const Staking = () => {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-yellow-400 mb-6">Staking</h1>
        
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Staking Balance</h2>
          <div className="text-3xl font-bold text-yellow-400">$0.00</div>
          <p className="text-gray-300 mt-2">Start staking to earn rewards</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-3">30 Days Staking</h3>
            <p className="text-yellow-400 text-2xl font-bold">5% APY</p>
            <p className="text-gray-300 mt-2">Minimum: $100</p>
            <button className="w-full bg-yellow-500 text-black py-2 rounded mt-4 font-semibold hover:bg-yellow-400">
              Stake Now
            </button>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-3">90 Days Staking</h3>
            <p className="text-yellow-400 text-2xl font-bold">12% APY</p>
            <p className="text-gray-300 mt-2">Minimum: $500</p>
            <button className="w-full bg-yellow-500 text-black py-2 rounded mt-4 font-semibold hover:bg-yellow-400">
              Stake Now
            </button>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-3">180 Days Staking</h3>
            <p className="text-yellow-400 text-2xl font-bold">20% APY</p>
            <p className="text-gray-300 mt-2">Minimum: $1000</p>
            <button className="w-full bg-yellow-500 text-black py-2 rounded mt-4 font-semibold hover:bg-yellow-400">
              Stake Now
            </button>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-3">365 Days Staking</h3>
            <p className="text-yellow-400 text-2xl font-bold">35% APY</p>
            <p className="text-gray-300 mt-2">Minimum: $2000</p>
            <button className="w-full bg-yellow-500 text-black py-2 rounded mt-4 font-semibold hover:bg-yellow-400">
              Stake Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Staking;
