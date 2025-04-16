import React from 'react';
import { FaVideo, FaUsers, FaBroadcastTower, FaComments } from 'react-icons/fa';
import '../../styles/Dashboard.css';

const Footer = ({ activeSection, activeTab, setActiveTab }) => {
  const tabs = [
    { name: 'Explore', icon: <FaVideo />, title: 'Explore' },
    { name: 'People', icon: <FaUsers />, title: 'People' },
    { name: 'Broadcast', icon: <FaBroadcastTower />, title: 'Broadcast' },
    { name: 'Chats', icon: <FaComments />, title: 'Chats' },
  ];

  return (
    <footer className="dashboard-footer">
      {activeSection === 'Socials' ? (
        <div className="socials-footer">
          {tabs.map((tab) => (
            <div
              key={tab.name}
              className="icon-wrapper"
              title={tab.title}
              onClick={() => setActiveTab(tab.name)}
            >
              {React.cloneElement(tab.icon, {
                className: `tab-icon ${activeTab === tab.name ? 'active' : ''}`,
              })}
            </div>
          ))}
        </div>
      ) : (
        <p>© 2025 WAVECO. All rights reserved.</p>
      )}
    </footer>
  );
};

export default Footer;