import React from 'react';

const ReferralList = ({ data, type = 'referral' }) => (
  <div className="referral-list-card w-full overflow-x-auto bg-white rounded-xl shadow-md border border-purple-200 p-2 mb-4" style={{maxWidth:'100vw'}}>
    <table className={type === 'referral' ? "min-w-[600px] w-full text-sm text-left text-gray-700 referral-table" : "min-w-[900px] w-full text-sm text-left text-gray-700 referral-table"}>
      <thead className="bg-purple-600 text-white text-sm font-semibold">
        <tr>
          {type === 'referral' ? <>
            <th className="px-2 py-1">Name</th>
            <th className="px-2 py-1">Email</th>
            <th className="px-2 py-1">Level</th>
            <th className="px-2 py-1">Deposit</th>
            <th className="px-2 py-1">Commission</th>
            <th className="px-2 py-1">Status</th>
            <th className="px-2 py-1">Joined</th>
          </> : <>
            <th className="px-2 py-1">Date</th>
            <th className="px-2 py-1">Level</th>
            <th className="px-2 py-1">Amount</th>
            <th className="px-2 py-1">Source User</th>
            <th className="px-2 py-1">Description</th>
          </>}
        </tr>
      </thead>
      <tbody>
        {data.map((r, idx) => type === 'referral' ? (
          <tr key={r._id || idx} className="even:bg-purple-50 odd:bg-white hover:bg-purple-100">
            <td className="px-2 py-1">{r?.name || '-'}</td>
            <td className="px-2 py-1">{r?.email || '-'}</td>
            <td className="px-2 py-1">Level {r?.level ?? '-'}</td>
            <td className="px-2 py-1">${r?.depositedAmount ?? 0}</td>
            <td className="px-2 py-1">${r?.commission?.toFixed(2) ?? '0.00'}</td>
            <td className="px-2 py-1">{r?.active ? 'Active' : 'Inactive'}</td>
            <td className="px-2 py-1">{r?.joined ? new Date(r.joined).toLocaleDateString() : '-'}</td>
          </tr>
        ) : (
          <tr key={r._id || idx} className="even:bg-purple-50 odd:bg-white hover:bg-purple-100">
            <td className="px-2 py-1">{r?.date ? new Date(r.date).toLocaleString() : '-'}</td>
            <td className="px-2 py-1">Level {r?.level ?? '-'}</td>
            <td className="px-2 py-1">${r?.amount?.toFixed(2) ?? '0.00'}</td>
            <td className="px-2 py-1">{r?.sourceUser ? `${r.sourceUser.name} (${r.sourceUser.email})` : '-'}</td>
            <td className="px-2 py-1">{r?.description || '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default ReferralList;