import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import SignupPage from './components/SignupPage';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import './App.css';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log('Auth listener started');
    const unsubscribe = auth.onAuthStateChanged(user => {
      console.log('Auth state:', user ? user.email : 'No user');
      setUser(user);
      const target = user ? '/' : '/signup';
      console.log('Initial navigate to:', target);
      navigate(target, { replace: true });
    }, (error) => console.error('Auth error:', error));
    return () => {
      console.log('Auth listener stopped');
      unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    console.log('Path changed to:', location.pathname);
  }, [location]);

  const handleNavigate = (path) => {
    console.log(`Manual navigate triggered to: ${path}`);
    navigate(path);
  };

  return (
    <div className="app-wrapper">
      <div>Current Path: {location.pathname}</div> {/* Visual debug */}
      <Routes>
        <Route path="/signup" element={<SignupPage navigate={handleNavigate} />} />
        <Route path="/login" element={<LoginPage navigate={handleNavigate} />} />
        <Route path="/" element={<DashboardPage user={user} navigate={handleNavigate} />} />
        <Route path="*" element={<div>404 - Path: {location.pathname}</div>} />
      </Routes>
    </div>
  );
}

export default App;