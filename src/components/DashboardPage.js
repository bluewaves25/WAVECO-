import React from 'react';

const DashboardPage = ({ user, navigate }) => (
  <div className="app dark">
    <header className="header dark">
      <h1 className="waveco-title" onClick={() => navigate('/')}>
        <span className="wav">wav</span><span className="eco dark">Eco</span>
      </h1>
    </header>
    <main className="dashboard">
      {user ? <h2>Welcome, {user.email}</h2> : <p>Please sign in</p>}
      <button onClick={() => navigate('/login')}>Go to Login</button>
    </main>
  </div>
);

export default DashboardPage;