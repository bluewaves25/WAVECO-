import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Welcome.css';

const WelcomePage = ({ theme }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 3000); // 3 seconds
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className={`app ${theme}`}>
      <div className="welcome-container">
        <img
          src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNMTAgMjBhMTAgMTAgMCAwIDEgMjAgMCAxMCAxMCAwIDEtMjAgMCIgZmlsbD0iI2ZmZiIvPgogIDxwYXRoIGQ9Ik0xNSAyMGE1IDUgMCAxIDAgMTAgMCIgZmlsbD0iIzAwZDRmZiIvPgo8L3N2Zz4="
          alt="WAVECO Logo"
          className="welcome-logo"
        />
        <h1 className="welcome-title">
          <span className="wav">WAV</span><span className="eco">ECO</span>
        </h1>
        <p className="welcome-message">Welcome to WAVECO. We are pleased to have you join our platform. Explore the features and opportunities ahead.</p>
        <button className="welcome-btn" onClick={() => navigate('/dashboard')}>
          Get Started
        </button>
      </div>
    </div>
  );
};

export default WelcomePage;