import React from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import { IoIosArrowBack } from 'react-icons/io';
import '../styles/Socials.css';

const FeedPanel = ({ theme, isFeedOpen, setIsFeedOpen, newPost, setNewPost, handleNewPost, posts }) => (
  <div className={`feed-panel ${isFeedOpen ? 'open' : ''} ${theme}`}>
    <div className="feed-header">
      <button className={`futuristic-btn back-btn ${theme}`} onClick={() => setIsFeedOpen(false)}><IoIosArrowBack /></button>
    </div>
    <div className={`feed-content ${theme}`}>
      <input
        value={newPost}
        onChange={(e) => setNewPost(e.target.value)}
        placeholder="Transmit Thought... (+5)"
        className={`futuristic-input ${theme}`}
      />
      <button className="futuristic-btn" onClick={handleNewPost}><FaPaperPlane /></button>
      {posts.map(post => (
        <div className={`post ${theme}`} key={post.id}>
          <strong>{post.user}</strong> {post.text} <span>{new Date(post.timestamp).toLocaleString()}</span>
        </div>
      ))}
    </div>
  </div>
);

export default FeedPanel;