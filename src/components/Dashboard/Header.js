import React, { useEffect, useRef } from 'react';
import { IoIosNotificationsOutline } from 'react-icons/io';
import { FaWallet } from 'react-icons/fa';
import { CgProfile } from 'react-icons/cg';
import GlobalSearch from '../GlobalSearch';
import '../../styles/Dashboard.css';

const Header = ({
  profilePic,
  setIsProfileOpen,
  notifications,
  isNotificationOpen,
  setIsNotificationOpen,
  setShowWalletPopup,
  notificationRef,
  isHeaderVisible,
}) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsNotificationOpen]);

  return (
    <header className={`dashboard-header ${isHeaderVisible ? '' : 'hidden'}`}>
      <div className="header-left">
        <img
          src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNMTAgMjBhMTAgMTAgMCAwIDEgMjAgMCAxMCAxMCAwIDEtMjAgMCIgZmlsbD0iI2ZmZiIvPgogIDxwYXRoIGQ9Ik0xNSAyMGE1IDUgMCAxIDAgMTAgMCIgZmlsbD0iIzAwZDRmZiIvPgo8L3N2Zz4="
          alt="WavEco Logo"
          className="header-logo"
        />
        <h1 className="header-title">
          <span className="wav">wav</span>
          <span className="eco">Eco</span>
        </h1>
      </div>
      <div className="header-right">
        <GlobalSearch />
        <div className="notification-wrapper" ref={notificationRef}>
          <button
            className="notification-btn"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          >
            <IoIosNotificationsOutline />
          </button>
          {isNotificationOpen && (
            <div className="notification-dropdown" ref={dropdownRef}>
              <h4>Notifications</h4>
              <div className="notification-list">
                {notifications.length > 0 ? (
                  <ul>
                    {notifications.map((n, i) => (
                      <li key={i}>{n.message}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No notifications</p>
                )}
              </div>
            </div>
          )}
        </div>
        <button className="wallet-btn" onClick={() => setShowWalletPopup(true)}>
          <FaWallet />
        </button>
        <button className="profile-btn" onClick={() => setIsProfileOpen(true)}>
          <CgProfile className="profile-icon" />
        </button>
      </div>
    </header>
  );
};

export default Header;