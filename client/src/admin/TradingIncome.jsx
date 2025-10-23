
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './TradingIncome.css';

const TradingIncome = () => {
  const [roi, setRoi] = useState('');
  const [duration, setDuration] = useState('');
  const [durationUnit, setDurationUnit] = useState('days');
  const [frequency, setFrequency] = useState('0 0 * * *');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCurrentSettings();
  }, []);

  const fetchCurrentSettings = async () => {
    try {
      const res = await axios.get('/api/admin/trading-income-settings');
      if (res.data.success && res.data.settings) {
        setRoi(res.data.settings.roiPercentage);
        setDuration(res.data.settings.roiDuration);
        setDurationUnit(res.data.settings.roiDurationUnit || 'days');
        setFrequency(res.data.settings.roiFrequency || '0 0 * * *');
      }
    } catch (err) {
      console.error("Failed to fetch trading income settings", err);
    }
  };

  const handleSave = async () => {
    if (!roi || !duration || isNaN(roi) || isNaN(duration) || !frequency) {
      alert("Please enter valid values");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/admin/trading-income-settings', {
        roiPercentage: Number(roi),
        roiDuration: Number(duration),
        roiDurationUnit: durationUnit,
        roiFrequency: frequency
      });
      alert('Settings updated!');
    } catch (err) {
      alert('Failed to save trading income settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="trading-income-container">
      <h2>Trading Income Settings</h2>
      <div className="form-group">
        <label>ROI Percentage (%)</label>
        <input type="number" value={roi} onChange={(e) => setRoi(e.target.value)} />
      </div>
      <div className="form-group">
        <label>ROI Duration</label>
        <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} style={{ width: '120px', marginRight: '8px' }} />
        <select value={durationUnit} onChange={e => setDurationUnit(e.target.value)}>
          <option value="minutes">Minutes</option>
          <option value="hours">Hours</option>
          <option value="days">Days</option>
        </select>
      </div>
      <div className="form-group">
        <label>Cron Frequency (e.g. 0 0 * * * for daily, 0 * * * * for hourly)</label>
        <input type="text" value={frequency} onChange={e => setFrequency(e.target.value)} />
      </div>
      <button onClick={handleSave} disabled={loading}>
        {loading ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
};

export default TradingIncome;
