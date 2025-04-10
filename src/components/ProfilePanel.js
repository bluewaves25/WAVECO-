import React from 'react';
import { FaSun, FaMoon, FaCog } from 'react-icons/fa';
import { IoIosArrowBack } from 'react-icons/io';

const ProfilePanel = ({
  theme, user, profilePic, displayName, walletBalance, influence, isPanelOpen, setIsPanelOpen, handlePicUpload, handleEditProfile, handleLogout,
  handleSendWC, expandedTab, setExpandedTab, setTheme
}) => (
  <div className={`slide-panel ${isPanelOpen ? 'open' : ''} ${theme}`}>
    <div className="panel-header">
      <button className={`futuristic-btn back-btn ${theme}`} onClick={() => setIsPanelOpen(false)}><IoIosArrowBack /></button>
      <span
        className={`theme-icon ${theme} ${theme === 'light' ? 'active' : ''} ${theme === 'dark' ? 'active' : ''}`}
        onClick={() => {
          const newTheme = theme === 'dark' ? 'light' : 'dark';
          setTheme(newTheme);
          user && setDoc(doc(db, 'users', user.uid), { theme: newTheme }, { merge: true });
        }}
      >
        {theme === 'dark' ? <FaSun /> : <FaMoon />}
      </span>
    </div>
    <div className={`panel-content ${theme}`}>
      <img src={profilePic || '[A]'} alt="Profile" className="profile-pic" />
      <input type="file" accept="image/*" onChange={handlePicUpload} className={`futuristic-input ${theme}`} />
      <h2>{displayName}</h2>
      <p>WC: {walletBalance.toFixed(2)} | Inf: {influence}</p>
      <div className="info-grid">
        <div className={`info-item ${theme}`} onClick={() => setExpandedTab(expandedTab === 'wallet' ? null : 'wallet')}>
          <span className="icon">W</span>
          {expandedTab === 'wallet' && (
            <div className={`info-details ${theme}`}>
              <p>{walletBalance.toFixed(2)} WC</p>
              <button className="futuristic-btn" onClick={handleSendWC}>Transmit</button>
            </div>
          )}
        </div>
        <div className={`info-item ${theme}`} onClick={() => setExpandedTab(expandedTab === 'assets' ? null : 'assets')}>
          <span className="icon">A</span>
          {expandedTab === 'assets' && <div className={`info-details ${theme}`}><p>1 Land</p></div>}
        </div>
      </div>
      <button className="futuristic-btn" onClick={handleEditProfile}>Modify Identity</button>
      <button className="futuristic-btn" onClick={handleLogout}>Disconnect</button>
      <FaCog className={`gear-icon ${theme}`} onClick={() => console.log('Settings TBD')} />
    </div>
  </div>
);

export default ProfilePanel;