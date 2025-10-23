import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function OfflineGateway() {
  const [depositAddress, setDepositAddress] = useState('');
  const [depositQrCode, setDepositQrCode] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newQr, setNewQr] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('https://startradersindia.in/api/admin/trading-income-settings');
      if (res.data.success && res.data.settings) {
        setDepositAddress(res.data.settings.depositAddress || '');
        setDepositQrCode(res.data.settings.depositQrCode || '');
        setNewAddress(res.data.settings.depositAddress || '');
        setNewQr(res.data.settings.depositQrCode || '');
      }
    } catch (err) {}
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const res = await axios.post('https://startradersindia.in/api/admin/deposit-settings', {
        depositAddress: newAddress,
        depositQrCode: newQr
      });
      if (res.data.success) {
        setMsg('Settings updated!');
        setDepositAddress(newAddress);
        setDepositQrCode(newQr);
      } else {
        setMsg('Failed to update settings');
      }
    } catch (err) {
      setMsg('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleQrUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setMsg('');
    const formData = new FormData();
    formData.append('qr', file);
    formData.append('type', 'deposit');
    try {
      const res = await axios.post('https://startradersindia.in/api/admin/upload-qr', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success && res.data.url) {
        setNewQr(res.data.url);
        setMsg('QR uploaded!');
      } else {
        setMsg('Failed to upload QR');
      }
    } catch (err) {
      setMsg('Failed to upload QR');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', background: 'transparent', borderRadius: 12, padding: 24, color: '#fff', boxShadow: 'none' }}>
      <h2 style={{ marginBottom: 24, textAlign: 'center' }}>🏧 Offline Gateway Settings</h2>
      <form onSubmit={handleSave} style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600, display: 'block', textAlign: 'center' }}>Deposit Address</label>
          <input type="text" value={newAddress} onChange={e => setNewAddress(e.target.value)} style={{ width: '100%', marginTop: 8, marginBottom: 8, padding: 8, borderRadius: 6, border: '1px solid #333', background: '#222', color: '#fff', textAlign: 'center' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600, display: 'block', textAlign: 'center' }}>Deposit QR Code (Upload Image Only)</label>
          <input type="file" accept="image/*" onChange={handleQrUpload} style={{ marginTop: 8, color: '#fff', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />
          {uploading && <span style={{ color: 'yellow', marginLeft: 8 }}>Uploading...</span>}
        </div>
        <button type="submit" disabled={saving} style={{ background: '#FFD700', color: '#222', fontWeight: 700, border: 'none', borderRadius: 6, padding: '10px 32px', cursor: 'pointer', marginBottom: 12 }}>
          {saving ? 'Saving...' : 'Save'}
        </button>
        {msg && <div style={{ color: msg.includes('updated') || msg.includes('QR uploaded') ? 'lightgreen' : 'red', marginTop: 8 }}>{msg}</div>}
      </form>
      <hr style={{ margin: '24px 0', borderColor: '#333' }} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: 8, fontWeight: 600 }}>Current Deposit Address:</div>
        <div style={{ background: '#222', padding: 10, borderRadius: 6, wordBreak: 'break-all', marginBottom: 16, display: 'inline-block', minWidth: 200 }}>{depositAddress || <span style={{ color: '#888' }}>Not set</span>}</div>
        <div style={{ marginBottom: 8, fontWeight: 600 }}>Current QR Code:</div>
        {depositQrCode ? (
          <img src={depositQrCode} alt="Deposit QR" style={{ width: 120, height: 120, background: '#fff', borderRadius: 8, marginBottom: 8, display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />
        ) : (
          <div style={{ color: '#888', marginBottom: 8 }}>Not set</div>
        )}
      </div>
    </div>
  );
}