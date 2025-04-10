import React from 'react';

const SignupPage = ({ navigate }) => (
  <div className="app dark">
    <header className="header dark">
      <h1 className="waveco-title" onClick={() => navigate('/login')}>
        <span className="wav">wav</span><span className="eco dark">Eco</span>
      </h1>
    </header>
    <main className="dashboard">
      <div className="signup">
        <h2>Signup Page</h2>
        <p>This is signup</p>
        <button onClick={() => navigate('/login')}>Go to Login</button>
        <p>Already have an account? <span className="link" onClick={() => navigate('/login')}>Log In</span></p>
      </div>
    </main>
  </div>
);

export default SignupPage;