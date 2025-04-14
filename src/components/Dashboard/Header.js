import React, { useRef, useState } from 'react';
import { FaSearch, FaBell, FaWallet, FaComments, FaDollarSign, FaBriefcase, FaShoppingCart, FaGamepad, FaGlobe } from 'react-icons/fa';
import '../../styles/Header.css';

const Header = ({
  navigate,
  profilePic,
  setProfilePic,
  notifications,
  setIsProfileOpen,
  setShowWalletPopup,
  setIsNotificationOpen,
  handleProfilePicUpload,
  handleSectionClick,
  activeSection,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationOpen, setLocalIsNotificationOpen] = useState(false); // Added
  const notificationRef = useRef(null);
  const fileInputRef = useRef(null);

  const toggleNotifications = () => {
    setLocalIsNotificationOpen((prev) => !prev);
    setIsNotificationOpen((prev) => !prev); // Sync with parent
  };

  return (
    <header className="header-container">
      <div className="header-top">
        <div className="header-brand" onClick={() => navigate('/')}>
          <img
            src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNMTAgMjBhMTAgMTAgMCAwIDEgMjAgMCAxMCAxMCAwIDEtMjAgMCIgZmlsbD0iI2ZmZiIvPgogIDxwYXRoIGQ9Ik0xNSAyMGE1IDUgMCAxIDAgMTAgMCIgZmlsbD0iIzAwZDRmZiIvPgo8L3N2Zz4="
            alt="Logo"
            className="logo"
          />
          <h1 className="title">
            <span className="wav">Wav</span><span className="Eco">Eco</span>
          </h1>
        </div>
        <div className="header-actions">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="search-input"
            />
          </div>
          <div className="notification-wrapper" ref={notificationRef}>
            <div
              className="notification-icon-wrapper"
              onClick={toggleNotifications}
            >
              <FaBell className="notification-icon" />
              {notifications.length > 0 && (
                <span className="notification-badge">{notifications.length}</span>
              )}
            </div>
            {isNotificationOpen && (
              <div className="notification-dropdown">
                {notifications.length > 0 ? (
                  notifications.map((n, i) => <p key={i}>{n.message}</p>)
                ) : (
                  <p>No notifications</p>
                )}
              </div>
            )}
          </div>
          <img
            src={profilePic}
            alt="Profile"
            className="profile-pic"
            onClick={() => {
              setIsProfileOpen(true);
              setShowWalletPopup(false);
              setLocalIsNotificationOpen(false);
              setIsNotificationOpen(false);
            }}
          />
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleProfilePicUpload}
          />
          <button
            className="wallet-icon"
            onClick={() => {
              setShowWalletPopup((prev) => !prev);
              setIsProfileOpen(false);
              setLocalIsNotificationOpen(false);
              setIsNotificationOpen(false);
            }}
          >
            <FaWallet />
          </button>
        </div>
      </div>
      <div className="nav-bar">
        {['Socials', 'Earn', 'Work', 'Market', 'Arcade', 'Nexus'].map((section) => (
          <div
            key={section}
            className={`nav-item ${activeSection === section ? 'active' : ''}`}
            onClick={() => handleSectionClick(section)}
            data-tooltip={section}
          >
            {section === 'Socials' && <FaComments className="nav-icon" />}
            {section === 'Earn' && <FaDollarSign className="nav-icon" />}
            {section === 'Work' && <FaBriefcase className="nav-icon" />}
            {section === 'Market' && <FaShoppingCart className="nav-icon" />}
            {section === 'Arcade' && <FaGamepad className="nav-icon" />}
            {section === 'Nexus' && <FaGlobe className="nav-icon" />}
          </div>
        ))}
      </div>
    </header>
  );
};

export default Header;