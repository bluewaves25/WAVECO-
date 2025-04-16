import React, { useState } from 'react';
import { collection, addDoc } from '../../firebase';
import { db } from '../../firebase';
import { Link } from 'react-router-dom';
import ChatSection from '../Chat/ChatSection';
import PeopleTab from './PeopleTab';
import BroadcastTab from './BroadcastTab';
import { FaComment, FaCompass, FaUsers, FaBroadcastTower } from 'react-icons/fa';
import '../../styles/Socials.css';

const SocialsSection = ({
  user,
  userData,
  users,
  handleUserClick,
  hasPosts,
  posts,
  theme,
  activeTab,
  setActiveTab,
  isChatsScrolled,
}) => {
  const [newPost, setNewPost] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleNewPost = async () => {
    if (!newPost.trim()) return;
    try {
      await addDoc(collection(db, 'posts'), {
        user: userData.fullName,
        userId: user.uid,
        text: newPost,
        timestamp: new Date().toISOString(),
      });
      setNewPost('');
    } catch (error) {
      console.error('Send post error:', error.message);
    }
  };

  return (
    <div className={`socials-section ${theme}`}>
      <div className="socials-content">
        {activeTab === 'Chats' && (
          <div className={`chats-content ${isChatsScrolled ? 'hidden' : ''}`}>
            <ChatSection
              user={user}
              userData={userData}
              users={users}
              newPost={newPost}
              setNewPost={setNewPost}
              handleNewPost={handleNewPost}
              posts={posts}
              theme={theme}
              isChatsScrolled={isChatsScrolled}
            />
          </div>
        )}
        {activeTab === 'People' && (
          <PeopleTab
            users={users}
            user={user}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleUserClick={handleUserClick}
          />
        )}
        {activeTab === 'Broadcast' && (
          <BroadcastTab
            userData={userData}
            newPost={newPost}
            setNewPost={setNewPost}
            handleNewPost={handleNewPost}
          />
        )}
      </div>
      <footer className="socials-footer">
        <button
          className={activeTab === 'Chats' ? 'active' : ''}
          onClick={() => setActiveTab('Chats')}
          aria-label="Chats"
        >
          <FaComment />
        </button>
        <Link to="/explore" aria-label="Explore">
          <FaCompass className={activeTab === 'Explore' ? 'active' : ''} />
        </Link>
        <button
          className={activeTab === 'People' ? 'active' : ''}
          onClick={() => setActiveTab('People')}
          aria-label="People"
        >
          <FaUsers />
        </button>
        <button
          className={activeTab === 'Broadcast' ? 'active' : ''}
          onClick={() => setActiveTab('Broadcast')}
          aria-label="Broadcast"
        >
          <FaBroadcastTower />
        </button>
      </footer>
    </div>
  );
};

export default SocialsSection;