import React, { useState } from 'react';
import Live from './Live';
import Scout from './Scout';
import Find from './Find';
import '../../styles/ExploreTab/Explore.css';

function Explore({ theme, user }) {
  const [activeTab, setActiveTab] = useState('Live');

  const handleSwipe = (e) => {
    const direction = e.deltaX > 0 ? 'right' : 'left';
    if (direction === 'right' && activeTab !== 'Live') {
      setActiveTab(activeTab === 'Scout' ? 'Live' : 'Scout');
    } else if (direction === 'left' && activeTab !== 'Find') {
      setActiveTab(activeTab === 'Live' ? 'Scout' : 'Find');
    }
  };

  return (
    <div className="explore" onWheel={handleSwipe}>
      <h1 className="explore-title">Explore</h1>
      <div className="explore-tabs">
        <button
          className={activeTab === 'Live' ? 'active' : ''}
          onClick={() => setActiveTab('Live')}
          aria-label="Live tab"
        >
          Live
        </button>
        <button
          className={activeTab === 'Scout' ? 'active' : ''}
          onClick={() => setActiveTab('Scout')}
          aria-label="Scout tab"
        >
          Scout
        </button>
        <button
          className={activeTab === 'Find' ? 'active' : ''}
          onClick={() => setActiveTab('Find')}
          aria-label="Find tab"
        >
          Find
        </button>
      </div>
      <div className="explore-content">
        {activeTab === 'Live' && <Live theme={theme} user={user} />}
        {activeTab === 'Scout' && <Scout theme={theme} user={user} />}
        {activeTab === 'Find' && <Find theme={theme} />}
      </div>
    </div>
  );
}

export default Explore;