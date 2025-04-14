import React, { useState, useEffect, useRef } from 'react';
import {
  FaAngleLeft, FaMoon, FaSun, FaWallet, FaCubes, FaCog, FaQuestionCircle, FaSignOutAlt
} from 'react-icons/fa';
import { GoHomeFill } from 'react-icons/go';
import { auth, db, increment, doc, getDoc, updateDoc, addDoc, collection } from '../../firebase'; // Adjusted path
import '../../styles/Profile.css'; // Adjusted path

// ... rest of the ProfilePanel.js code remains unchanged ...

const CustomQRCode = ({ value, size = 100 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!value) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    import('qrcode').then(qr => {
      qr.toCanvas(canvas, value, { width: size, margin: 1 }, (error) => {
        if (error) console.error('QR Code Error:', error);
      });
    });
  }, [value, size]);

  return <canvas ref={canvasRef} width={size} height={size} />;
};

const ProfilePanel = ({
  user, userData, navigate, theme, setTheme, profilePic, setProfilePic, isProfileOpen, setIsProfileOpen,
  walletBalance, walletAddress, transactionHistory, setWalletBalance, setTransactionHistory
}) => {
  const [walletExpanded, setWalletExpanded] = useState(false);
  const [assetsExpanded, setAssetsExpanded] = useState(false);
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsProfileOpen]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const fullName = e.target.fullName.value;
    const email = e.target.email.value;
    try {
      await updateDoc(doc(db, 'users', user.uid), { fullName });
      if (email !== user.email) {
        await auth.currentUser.updateEmail(email);
      }
      alert('Profile updated');
    } catch (error) {
      console.error('Update profile error:', error.message);
      alert('Failed to update profile');
    }
  };

  const validateUUID = (id) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  const handleWalletAction = async (action) => {
    setIsWalletLoading(true);
    try {
      switch (action) {
        case 'send':
          if (!recipient || !amount || amount <= 0 || amount > walletBalance) {
            alert('Invalid recipient or amount');
            return;
          }
          if (!validateUUID(recipient)) {
            alert('Invalid recipient address format');
            return;
          }
          const recipientDoc = await getDoc(doc(db, 'wallets', recipient));
          if (!recipientDoc.exists()) {
            alert('Recipient wallet does not exist');
            return;
          }
          const transaction = {
            from: user.uid,
            to: recipient,
            amount: parseFloat(amount),
            timestamp: new Date().toISOString()
          };
          await Promise.all([
            updateDoc(doc(db, 'wallets', user.uid), { balance: walletBalance - parseFloat(amount) }),
            updateDoc(doc(db, 'wallets', recipient), { balance: increment(parseFloat(amount)) }),
            addDoc(collection(db, 'transactions'), transaction)
          ]);
          setWalletBalance(prev => prev - parseFloat(amount));
          setTransactionHistory(prev => [transaction, ...prev]);
          setRecipient('');
          setAmount('');
          alert('Sent successfully');
          break;
        case 'deposit':
          alert('Deposit initiated (redirect to payment gateway)');
          break;
        case 'receive':
          alert(`Your wallet address: ${walletAddress}`);
          break;
        case 'withdraw':
          alert('Withdraw initiated (redirect to withdrawal form)');
          break;
        case 'earn':
          navigate('/dashboard?section=Earn');
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`${action} error:`, error.message);
      alert(`${action} failed`);
    } finally {
      setIsWalletLoading(false);
    }
  };

  return (
    <div className={`profile-panel ${isProfileOpen ? 'open' : ''} ${theme}`} ref={panelRef}>
      <div className="profile-header">
        <button className="back-btn" onClick={() => setIsProfileOpen(false)}><FaAngleLeft /></button>
        <div className="profile-upload">
          <img src={profilePic} alt="Profile" className="profile-pic-large" />
          <span className="username">{userData?.fullName || user.email}</span>
          <span className="location">{userData?.country || 'targ: us'}</span>
        </div>
        <button className="theme-btn" onClick={toggleTheme}>{theme === 'dark' ? <FaSun /> : <FaMoon />}</button>
      </div>
      <div className="profile-content">
        <div className="info-bar">
          <div className="info-item" onClick={() => setWalletExpanded(!walletExpanded)}>
            <FaWallet className="icon" />
            <span>Wallet</span>
            {walletExpanded && (
              <div className="detail zest-wallet">
                <h3>Zest Wallet</h3>
                <p>Balance: {walletBalance} ZEST</p>
                <p>Address: {walletAddress.slice(0, 8)}...</p>
                <div className="wallet-qr">
                  <CustomQRCode value={walletAddress} size={100} />
                  <span>Scan or show QR code</span>
                </div>
                <div className="wallet-actions">
                  <button onClick={() => handleWalletAction('send')} disabled={isWalletLoading}>
                    {isWalletLoading ? 'Processing...' : 'Send'}
                  </button>
                  <button onClick={() => handleWalletAction('deposit')} disabled={isWalletLoading}>
                    {isWalletLoading ? 'Processing...' : 'Deposit'}
                  </button>
                  <button onClick={() => handleWalletAction('receive')} disabled={isWalletLoading}>
                    {isWalletLoading ? 'Processing...' : 'Receive'}
                  </button>
                  <button onClick={() => handleWalletAction('withdraw')} disabled={isWalletLoading}>
                    {isWalletLoading ? 'Processing...' : 'Withdraw'}
                  </button>
                  <button onClick={() => handleWalletAction('earn')} disabled={isWalletLoading}>
                    {isWalletLoading ? 'Processing...' : 'Earn'}
                  </button>
                </div>
                <div className="wallet-form">
                  <input
                    type="text"
                    placeholder="Recipient Address"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    disabled={isWalletLoading}
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                    step="0.01"
                    disabled={isWalletLoading}
                  />
                </div>
                <div className="wallet-history">
                  <h4>Transaction History</h4>
                  {transactionHistory.length > 0 ? (
                    <ul>
                      {transactionHistory.slice(0, 5).map(tx => (
                        <li key={tx.id}>
                          {tx.from === user.uid ? 'Sent' : 'Received'} {tx.amount} ZEST
                          {tx.from === user.uid ? ' to ' : ' from '}
                          {tx.from === user.uid ? tx.to.slice(0, 8) : tx.from.slice(0, 8)}...
                          <br />
                          <small>{new Date(tx.timestamp).toLocaleString()}</small>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No transactions yet</p>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="info-item" onClick={() => setAssetsExpanded(!assetsExpanded)}>
            <FaCubes className="icon" />
            <span>Inventory</span>
            {assetsExpanded && (
              <div className="detail">
                <p>No assets yet</p>
              </div>
            )}
          </div>
        </div>
        <div className="world-section">
          <span className="world-label">Current World: WAVECO Metaverse</span>
          <button className="go-home-btn" onClick={() => navigate('/')}><GoHomeFill /> Go Home</button>
        </div>
        <div className="profile-settings">
          <h3><FaCog className="settings-icon" /> Settings</h3>
          <form onSubmit={handleUpdateProfile}>
            <input
              name="fullName"
              type="text"
              placeholder="Change Username"
              className="input-field"
              defaultValue={userData?.fullName}
            />
            <input
              name="email"
              type="email"
              placeholder="Change Email"
              className="input-field"
              defaultValue={user.email}
            />
            <button type="submit" className="go-home-btn">Update</button>
          </form>
        </div>
        <div className="help-section">
          <button className="help-btn" onClick={() => alert('Help/Support coming soon!')}>
            <FaQuestionCircle /> Help/Support
          </button>
          <button className="sign-out-btn" onClick={() => auth.signOut().then(() => navigate('/'))}>
            <FaSignOutAlt /> Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePanel;