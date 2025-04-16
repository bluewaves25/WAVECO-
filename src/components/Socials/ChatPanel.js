import React from 'react';

const ChatPanel = ({
  theme,
  isChatOpen,
  setIsChatOpen,
  chatFriend,
  messages,
  displayName,
  newMessage,
  setNewMessage,
  handleNewMessage,
}) => {
  if (!isChatOpen) return null;

  return (
    <div className={`chat-panel ${theme}`}>
      <div className="tab-header">
        <h3>{chatFriend || 'Chat'}</h3>
        <button className="futuristic-btn back-btn" onClick={() => setIsChatOpen(false)}>
          Close
        </button>
      </div>
      <div className="chat-list">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-user ${msg.user === displayName ? 'sent' : 'received'}`}
          >
            <p>{msg.text}</p>
            <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
          </div>
        ))}
      </div>
      <div className="chat-search">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="futuristic-input"
        />
        <button className="futuristic-btn" onClick={handleNewMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;