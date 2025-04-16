import React from 'react';
import { FaComments, FaDollarSign, FaBriefcase, FaShoppingCart, FaGamepad, FaGlobe } from 'react-icons/fa';
import '../../styles/Dashboard.css';

const Nav = ({ activeSection, handleSectionClick, isChatsScrolled }) => {
  return (
    <nav className={`dashboard-nav ${isChatsScrolled ? 'blurred' : ''}`}>
      <div
        className={`nav-item ${activeSection === 'Socials' ? 'active' : ''}`}
        onClick={() => handleSectionClick('Socials')}
      >
        <FaComments className="nav-icon" />
        <span>Socials</span>
      </div>
      <div
        className={`nav-item ${activeSection === 'Earn' ? 'active' : ''}`}
        onClick={() => handleSectionClick('Earn')}
      >
        <FaDollarSign className="nav-icon" />
        <span>Earn</span>
      </div>
      <div
        className={`nav-item ${activeSection === 'Work' ? 'active' : ''}`}
        onClick={() => handleSectionClick('Work')}
      >
        <FaBriefcase className="nav-icon" />
        <span>Work</span>
      </div>
      <div
        className={`nav-item ${activeSection === 'Market' ? 'active' : ''}`}
        onClick={() => handleSectionClick('Market')}
      >
        <FaShoppingCart className="nav-icon" />
        <span>Market</span>
      </div>
      <div
        className={`nav-item ${activeSection === 'Arcade' ? 'active' : ''}`}
        onClick={() => handleSectionClick('Arcade')}
      >
        <FaGamepad className="nav-icon" />
        <span>Arcade</span>
      </div>
      <div
        className={`nav-item ${activeSection === 'Nexus' ? 'active' : ''}`}
        onClick={() => handleSectionClick('Nexus')}
      >
        <FaGlobe className="nav-icon" />
        <span>Nexus</span>
      </div>
    </nav>
  );
};

export default Nav;