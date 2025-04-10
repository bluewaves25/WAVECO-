import React, { useState } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './App.css';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const theme = 'dark'; // Match signup's default theme

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error.code, error.message);
      alert(`Login failed: ${error.message}`);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (error) {
      console.error('Google login error:', error.code, error.message);
      alert(`Google login failed: ${error.message}`);
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      alert('Please enter your email to reset password');
      return;
    }
    sendPasswordResetEmail(auth, email)
      .then(() => alert('Password reset email sent! Check your inbox.'))
      .catch((error) => alert(`Error: ${error.message}`));
  };

  return (
    <div className={`app ${theme}`}>
      <header className={`header ${theme}`}>
        <h1 className="waveco-title"><span className="wav">wav</span><span className={`eco ${theme}`}>Eco</span></h1>
      </header>
      <main className="dashboard">
        <div className="signup"> {/* Reuse signup class for consistency */}
          <h2>Log In to WAVECoin</h2>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className={`signup-input ${theme}`}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={`signup-input ${theme}`}
          />
          <button className="action-btn" onClick={handleLogin}>Log In</button>
          <button className="action-btn" onClick={handleGoogleLogin}>Log In with Google</button>
          <p>
            <span className="forgot-password" onClick={handleForgotPassword}>Forgot Password?</span>
          </p>
          <p>Need an account? <button className="action-btn" onClick={() => navigate('/')}>Sign Up</button></p>
        </div>
      </main>
    </div>
  );
}

export default Login;