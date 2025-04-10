import React from 'react';

const LoginPage = ({ navigate, setEmail, setPassword, handleLogin, email, password }) => (
  <div className="app dark">
    <header className="header dark">
      <h1 className="waveco-title" onClick={() => {
        console.log('Header clicked, navigating to /signup');
        navigate('/signup');
      }}><span className="wav">wav</span><span className="eco dark">Eco</span></h1>
    </header>
    <main className="dashboard">
      <div className="signup">
        <h2>Sign In to WAVECoin</h2>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="signup-input dark" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="signup-input dark" />
        <button className="action-btn" onClick={handleLogin}>Sign In</button>
        <p>New user? <span className="link" onClick={() => {
          console.log('Signup link clicked, navigating to /signup');
          navigate('/signup');
        }}>Sign Up</span></p>
      </div>
    </main>
  </div>
);

export default LoginPage;