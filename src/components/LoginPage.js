import React from 'react';

const LoginPage = ({ theme, navigate, setEmail, setPassword, handleLogin, handleGoogleSignup, handleForgotPassword, email, password }) => (
  <div className={`app ${theme}`}>
    <header className={`header ${theme}`}>
      <h1 className="waveco-title" onClick={() => navigate('/signup')}><span className="wav">wav</span><span className={`eco ${theme}`}>Eco</span></h1>
    </header>
    <main className="dashboard">
      <div className="signup">
        <h2 className="futuristic-title">Sign In to WAVECoin Network</h2>
        <div className="signup-form">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={`futuristic-input ${theme}`} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className={`futuristic-input ${theme}`} />
          <button className="futuristic-btn" onClick={handleLogin}>Sign In</button>
          <button className="futuristic-btn" onClick={handleGoogleSignup}>Sync with Google</button>
        </div>
        <p className="futuristic-text"><span onClick={handleForgotPassword} className="link">Reset Access Code</span></p>
        <p className="futuristic-text">New entity? <span onClick={() => navigate('/signup')} className="link">Initialize Now</span></p>
      </div>
    </main>
  </div>
);

export default LoginPage;