import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import '../styles/SignIn.css';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/welcome');
    } catch (err) {
      console.error('SignIn Error:', err.code, err.message);
      setError(
        err.code === 'auth/user-not-found' ? 'User not found' :
        err.code === 'auth/wrong-password' ? 'Incorrect password' :
        err.code === 'auth/invalid-email' ? 'Invalid email format' :
        `Sign-in failed: ${err.message}`
      );
    }
  };

  return (
    <div className="signin-container">
      <img
        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNMTAgMjBhMTAgMTAgMCAwIDEgMjAgMCAxMCAxMCAwIDEtMjAgMCIgZmlsbD0iI2ZmZiIvPgogIDxwYXRoIGQ9Ik0xNSAyMGE1IDUgMCAxIDAgMTAgMCIgZmlsbD0iIzAwZDRmZiIvPgo8L3N2Zz4="
        alt="Logo"
        className="signin-logo"
      />
      <h1 className="signin-title">
        <span className="wav">Wav</span><span className="Eco">Eco</span>
      </h1>
      <form className="signin-form" onSubmit={handleSignIn}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="futuristic-input"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="futuristic-input"
          required
        />
        {error && <p className="signin-error">{error}</p>}
        <button type="submit" className="futuristic-btn">Log In</button>
      </form>
      <div className="signin-footer">
        <p>
          Don't have an account? <a href="/signup">Sign Up</a>
        </p>
        <p>
          <a href="/forgot-password">Forgot Password?</a>
        </p>
      </div>
    </div>
  );
};

export default SignIn;