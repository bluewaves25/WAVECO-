import React, { useState } from 'react';
import { FaSmile, FaFileUpload } from 'react-icons/fa';
import { db, collection, addDoc } from '../../firebase';
import '../../styles/chat/TextChat.css';

function TextChat({ messages, user, userData, messagesEndRef, isTyping, setIsTyping, setMessages, selectedChat }) {
  const [chatInput, setChatInput] = useState('');

  const sendMessage = async () => {
    if (!chatInput.trim() || !selectedChat || !user) return;
    try {
      const collectionPath = selectedChat.type === 'group'
        ? collection(db, 'groups', selectedChat.id, 'messages')
        : collection(db, 'chats', `${user.uid}_${selectedChat.id}`, 'messages');
      await addDoc(collectionPath, {
        text: chatInput,
        user: user.uid,
        userName: userData?.fullName || user.email,
        timestamp: new Date().toISOString()
      });
      setChatInput('');
      setIsTyping(false);
    } catch (error) {
      console.error('Send message error:', error.message);
    }
  };

  const handleTyping = (e) => {
    setChatInput(e.target.value);
    setIsTyping(!!e.target.value);
  };

  return (
    <div className="text-chat">
      <div className="text-chat-content">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.user === user?.uid ? 'sent' : 'received'}`}>
            <span>{msg.userName}</span>
            {msg.text}
          </div>
        ))}
        {isTyping && <div className="typing">Typing...</div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="text-chat-bottom">
        <button className="text-chat-action"><FaSmile /></button>
        <input
          type="text"
          value={chatInput}
          onChange={handleTyping}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          className="text-chat-input"
        />
        <button className="text-chat-send" onClick={sendMessage}>
          Send
        </button>
        <button className="text-chat-action"><FaFileUpload /></button>
      </div>
    </div>
  );
}

export default TextChat;