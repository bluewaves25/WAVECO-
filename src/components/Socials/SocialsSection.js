import React, { useState } from 'react';
import { FaVideo, FaUsers, FaBroadcastTower, FaComments, FaSearch, FaArrowLeft, FaArrowRight, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import ChatPanel from '../ChatPanel'; // Adjusted path
import FeedPanel from '../FeedPanel'; // Adjusted path
import { db, collection, addDoc, query, orderBy, onSnapshot } from '../../firebase'; // Adjusted path
import '../../styles/Socials.css'; // Adjusted path

const SocialsSection = ({ user, userData, users, setActiveSection, handleUserClick, hasPosts, posts, theme }) => {
  const [activeTab, setActiveTab] = useState('Chats');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFeedOpen, setIsFeedOpen] = useState(false);
  const [chatFriend, setChatFriend] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [newPost, setNewPost] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleNewMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await addDoc(collection(db, 'messages'), {
        user: userData.fullName,
        to: chatFriend,
        text: newMessage,
        timestamp: new Date().toISOString()
      });
      setMessages([...messages, {
        id: Date.now(),
        user: userData.fullName,
        to: chatFriend,
        text: newMessage,
        timestamp: new Date().toISOString()
      }]);
      setNewMessage('');
    } catch (error) {
      console.error('Send message error:', error.message);
    }
  };

  const handleNewPost = async () => {
    if (!newPost.trim()) return;
    try {
      await addDoc(collection(db, 'posts'), {
        user: userData.fullName,
        userId: user.uid,
        text: newPost,
        timestamp: new Date().toISOString()
      });
      setNewPost('');
    } catch (error) {
      console.error('Send post error:', error.message);
    }
  };

  const searchUsers = () => {
    if (searchQuery.trim()) {
      return users.filter(u => u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) && u.id !== user.uid);
    }
    return users.filter(u => u.id !== user.uid);
  };

  return (
    <div className="dashboard-grid">
      <div className="socials-content">
        {activeTab === 'Explore' && (
          <div className={`tab-content explore-feed ${hasPosts ? '' : 'no-posts'}`}>
  <button className="futuristic-btn back-btn" onClick={() => setActiveSection('')}>Back</button>
  <button className="futuristic-btn" onClick={() => setIsFeedOpen(true)}>View Feed</button>
  {hasPosts && (
    <>
      <button className="scroll-btn left" onClick={() => document.querySelector('.explore-feed').scrollBy(-100, 0)}><FaArrowLeft /></button>
      <button className="scroll-btn right" onClick={() => document.querySelector('.explore-feed').scrollBy(100, 0)}><FaArrowRight /></button>
    </>
  )}
</div>
        )}
        {activeTab === 'People' && (
          <div className="tab-content">
  <button className="futuristic-btn back-btn" onClick={() => setActiveSection('')}>Back</button>
  <div className="people-list">
    <div className="chat-search">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search people..."
        className="futuristic-input chat-search-input"
      />
      <button className="futuristic-btn chat-action-btn" onClick={searchUsers}><FaSearch /></button>
    </div>
    {searchUsers().map(u => (
      <div key={u.id} className="people-user" onClick={() => handleUserClick(u)}>
        <img src={u.profilePic || 'https://via.placeholder.com/40'} alt="User" className="post-avatar" />
        <span className="post-username">{u.fullName}</span>
      </div>
    ))}
  </div>
  {users.length > 0 && (
    <>
      <button className="scroll-btn up" onClick={() => document.querySelector('.people-list').scrollBy(0, -100)}><FaArrowUp /></button>
      <button className="scroll-btn down" onClick={() => document.querySelector('.people-list').scrollBy(0, 100)}><FaArrowDown /></button>
    </>
  )}
</div>
        )}
        {activeTab === 'Broadcast' && (
          <div className="tab-content">
            <button className="futuristic-btn back-btn" onClick={() => setActiveSection('')}>
              Back
            </button>
            <div className="broadcast-compose">
              <img
                src={userData?.profilePic || 'https://via.placeholder.com/40'}
                alt="Profile"
                className="broadcast-avatar"
              />
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's happening?"
                className="futuristic-input broadcast-input-field"
              />
              <button onClick={handleNewPost} className="futuristic-btn broadcast-btn">
                Broadcast
              </button>
            </div>
          </div>
        )}
        {activeTab === 'Chats' && (
          <div className="tab-content chat-section">
            <h3>Chats</h3>
            {users.map(u => (
              <div
                key={u.id}
                className="chat-user"
                onClick={() => {
                  setChatFriend(u.fullName);
                  setIsChatOpen(true);
                }}
              >
                <img
                  src={u.profilePic || 'https://via.placeholder.com/40'}
                  alt="User"
                  className="post-avatar"
                />
                <span className="post-username">{u.fullName}</span>
              </div>
            ))}
          </div>
        )}
        <ChatPanel
          theme={theme}
          isChatOpen={isChatOpen}
          setIsChatOpen={setIsChatOpen}
          chatFriend={chatFriend}
          messages={messages}
          displayName={userData?.fullName}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleNewMessage={handleNewMessage}
        />
        <FeedPanel
          theme={theme}
          isFeedOpen={isFeedOpen}
          setIsFeedOpen={setIsFeedOpen}
          newPost={newPost}
          setNewPost={setNewPost}
          handleNewPost={handleNewPost}
          posts={posts}
        />
      </div>
      <div className="dashboard-tabs">
        <div className="icon-wrapper" title="Explore">
          <FaVideo
            className={`tab-icon ${activeTab === 'Explore' ? 'active' : ''}`}
            onClick={() => setActiveTab('Explore')}
          />
        </div>
        <div className="icon-wrapper" title="People">
          <FaUsers
            className={`tab-icon ${activeTab === 'People' ? 'active' : ''}`}
            onClick={() => setActiveTab('People')}
          />
        </div>
        <div className="icon-wrapper" title="Broadcast">
          <FaBroadcastTower
            className={`tab-icon ${activeTab === 'Broadcast' ? 'active' : ''}`}
            onClick={() => setActiveTab('Broadcast')}
          />
        </div>
        <div className="icon-wrapper" title="Chats">
          <FaComments
            className={`tab-icon ${activeTab === 'Chats' ? 'active' : ''}`} // Fixed quotes
            onClick={() => setActiveTab('Chats')}
          />
        </div>
      </div>
    </div>
  );
};

export default SocialsSection;