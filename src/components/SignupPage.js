import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

const SignupPage = ({ theme, navigate, setRealName, setUsername, setGender, setDob, setCountry, setEmail, setPassword, handleSignup, handleGoogleSignup, realName, username, gender, dob, country, email, password }) => (
  <div className={`app ${theme}`}>
    <header className={`header ${theme}`}>
      <h1 className="waveco-title" onClick={() => navigate('/login')}><span className="wav">wav</span><span className={`eco ${theme}`}>Eco</span></h1>
    </header>
    <main className="dashboard">
      <div className="signup">
        <h2 className="futuristic-title">Initialize Your WAVECoin Identity</h2>
        <div className="signup-form">
          <input type="text" value={realName} onChange={(e) => setRealName(e.target.value)} placeholder="Full Name" className={`futuristic-input ${theme}`} />
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className={`futuristic-input ${theme}`} />
          <select value={gender} onChange={(e) => setGender(e.target.value)} className={`futuristic-input ${theme}`}>
            <option value="">Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={`futuristic-input ${theme}`} />
          <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" className={`futuristic-input ${theme}`} />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={`futuristic-input ${theme}`} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className={`futuristic-input ${theme}`} />
          <button className="futuristic-btn" onClick={handleSignup}>Activate Profile</button>
          <button className="futuristic-btn" onClick={handleGoogleSignup}>Sync with Google</button>
        </div>
        <p className="futuristic-text">Already synced? <span onClick={() => { console.log('Navigating to /login'); navigate('/login'); }} className="link">Sign In</span></p>
        <p className="futuristic-text">Gain 500 WAVECoin (WC) upon activation!</p>
      </div>
    </main>
  </div>
);

export default SignupPage;