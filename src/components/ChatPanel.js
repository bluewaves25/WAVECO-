import React from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import { IoIosArrowBack } from 'react-icons/io';

const ChatPanel = ({ theme, isChatOpen, setIsChatOpen, chatFriend, messages, displayName, newMessage, setNewMessage, handleNewMessage }) => (
  <div className={`chat-panel ${isChatOpen ? 'open' : ''} ${theme}`}>
    <div className="chat-header">
      <button className={`futuristic-btn back-btn ${theme}`} onClick={() => setIsChatOpen(false)}><IoIosArrowBack /></button>
      <span>{chatFriend}</span>
    </div>
    <div className={`chat-content ${theme}`}>
      {messages.filter(m => m.to === chatFriend || m.user === chatFriend).map(msg => (
        <div key={msg.id} className={`message ${msg.user === displayName ? 'sent' : 'received'} ${theme}`}>
          <strong>{msg.user}</strong> {msg.text} <span>{new Date(msg.timestamp).toLocaleString()}</span>
        </div>
      ))}
    </div>
    <div className="chat-input">
      <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Transmit Message... (+3)" className={`futuristic-input ${theme}`} onKeyPress={(e) => e.key === 'Enter' && handleNewMessage()} />
      <button className="futuristic-btn" onClick={handleNewMessage}><FaPaperPlane /></button>
    </div>
  </div>
);

export default ChatPanel;