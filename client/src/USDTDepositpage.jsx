import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './components/SideDrawer.css'; // For mobile responsive styles

export default function USDTDepositPage() {
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [depositAddress, setDepositAddress] = useState('');
  const [depositQr, setDepositQr] = useState('');
  const [copyMsg, setCopyMsg] = useState('');

  useEffect(() => {
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData?.email) {
      setUserEmail(userData.email);
    }
    // Fetch deposit address and QR from backend
    axios.get('https://qxtrand.onrender.com/api/user/deposit-settings')
      .then(res => {
        if (res.data.success) {
          setDepositAddress(res.data.depositAddress || '');
          setDepositQr(res.data.depositQrCode || '');
        }
      });
  }, []);

  const handleSubmit = async () => {
    if (amount && transactionId && userEmail) {
      try {
        const res = await axios.post('https://qxtrand.onrender.com/api/user/deposit', {
          amount,
          transactionId,
          email: userEmail,
        });
        if (res.data.success) {
          setSubmitted(true);
          setAmount('');
          setTransactionId('');
        }
      } catch (err) {
        alert("Failed to submit deposit");
        console.error(err);
      }
    } else {
      alert("Please fill in all required fields");
    }
  };

  const handleCopy = () => {
    if (depositAddress) {
      navigator.clipboard.writeText(depositAddress);
      setCopyMsg('Copied!');
      setTimeout(() => setCopyMsg(''), 1200);
    }
  };

  return (
    <div style={{minHeight:'100vh',background:'#f7f8fa',display:'flex',alignItems:'center',justifyContent:'center',padding:'16px'}}>
      <div style={{background:'#fff',borderRadius:'18px',boxShadow:'0 4px 32px rgba(140,82,255,0.10)',padding:'32px 24px',maxWidth:'400px',width:'100%',display:'flex',flexDirection:'column',alignItems:'center'}}>
        <h2 style={{color:'#8c52ff',fontWeight:700,fontSize:'2rem',marginBottom:'18px',letterSpacing:'1px',textAlign:'center'}}>Deposit USDT (BEP20)</h2>
        <div style={{background:'#f7f8fa',padding:'18px',borderRadius:'12px',marginBottom:'18px',boxShadow:'0 2px 8px #e0e0e0',display:'flex',flexDirection:'column',alignItems:'center'}}>
          {depositQr ? (
            <img src={depositQr} alt="QR Code" style={{width:'180px',height:'180px',borderRadius:'12px',border:'3px solid #8c52ff',marginBottom:'8px'}} />
          ) : (
            <div style={{width:'180px',height:'180px',background:'#eee',color:'#aaa',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center'}}>No QR</div>
          )}
        </div>
        <div style={{width:'100%',marginBottom:'16px'}}>
          <span style={{color:'#8c52ff',fontWeight:600,fontSize:'1rem'}}>Wallet address:</span>
          <div style={{display:'flex',alignItems:'center',marginTop:'6px'}}>
            <span style={{color:'#222',fontSize:'0.95rem',fontFamily:'monospace',background:'#f7f8fa',padding:'6px 10px',borderRadius:'8px',flex:1,wordBreak:'break-all'}}>{depositAddress || 'Not set'}</span>
            <button onClick={handleCopy} style={{marginLeft:'8px',padding:'6px 14px',background:'#8c52ff',color:'#fff',border:'none',borderRadius:'8px',fontWeight:'600',fontSize:'0.95rem',cursor:'pointer'}}>Copy</button>
          </div>
          {copyMsg && <span style={{marginLeft:'8px',color:'#4caf50',fontSize:'0.95rem'}}>{copyMsg}</span>}
        </div>
        <input type="number" placeholder="Deposit Amount" value={amount} onChange={e => setAmount(e.target.value)}
          style={{width:'100%',padding:'12px',borderRadius:'8px',border:'1.5px solid #8c52ff',marginBottom:'12px',fontSize:'1rem',background:'#f7f8fa',color:'#222'}} />
        <input type="text" placeholder="Transaction ID" value={transactionId} onChange={e => setTransactionId(e.target.value)}
          style={{width:'100%',padding:'12px',borderRadius:'8px',border:'1.5px solid #8c52ff',marginBottom:'18px',fontSize:'1rem',background:'#f7f8fa',color:'#222'}} />
        <button onClick={handleSubmit} style={{width:'100%',background:'#8c52ff',color:'#fff',fontWeight:'600',fontSize:'1.1rem',border:'none',borderRadius:'8px',padding:'12px 0',marginBottom:'8px',cursor:'pointer'}}>Submit</button>
        {submitted && <p style={{color:'#4caf50',marginTop:'8px',fontWeight:'600'}}>Deposit submitted successfully!</p>}
      </div>
    </div>
  );
}
