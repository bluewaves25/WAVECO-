import React from 'react';
import '../../styles/chat/Presence.css';

function Presence() {
  return (
    <div className="presence">
      <div className="presence-dot"></div>
      <span>Online</span>
    </div>
  );
}

export default Presence;