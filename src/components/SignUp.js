import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import '../styles/SignUp.css';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: fullName });
      await setDoc(doc(db, 'users', user.uid), {
        fullName,
        email,
        profilePic: 'https://via.placeholder.com/80',
        createdAt: new Date().toISOString()
      });
      navigate('/welcome');
    } catch (err) {
      console.error('SignUp Error:', err.code, err.message);
      setError(
        err.code === 'auth/email-already-in-use' ? 'Email already in use' :
        err.code === 'auth/weak-password' ? 'Password too weak (min 6 chars)' :
        err.code === 'auth/invalid-email' ? 'Invalid email format' :
        `Sign-up failed: ${err.message}`
      );
    }
  };

  return (
    <div className="signup-container">
      <img
        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNMTAgMjBhMTAgMTAgMCAwIDEgMjAgMCAxMCAxMCAwIDEtMjAgMCIgZmlsbD0iI2ZmZiIvPgogIDxwYXRoIGQ9Ik0xNSAyMGE1IDUgMCAxIDAgMTAgMCIgZmlsbD0iIzAwZDRmZiIvPgo8L3N2Zz4="
        alt="Logo"
        className="signup-logo"
      />
      <h1 className="signup-title">
        <span className="wav">Wav</span><span className="Eco">Eco</span>
      </h1>
      <form className="signup-form" onSubmit={handleSignUp}>
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="futuristic-input"
          required
        />
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
        {error && <p className="signup-error">{error}</p>}
        <button type="submit" className="futuristic-btn">Sign Up</button>
      </form>
      <div className="signup-footer">
        <p>
          Already have an account? <a href="/signin">Log In</a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;