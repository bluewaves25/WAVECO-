import React from 'react';

const FeedPanel = ({ theme, isFeedOpen, setIsFeedOpen, newPost, setNewPost, handleNewPost, posts }) => {
  if (!isFeedOpen) return null;

  return (
    <div className={`feed-panel ${theme}`}>
      <div className="tab-header">
        <h3>Feed</h3>
        <button className="futuristic-btn back-btn" onClick={() => setIsFeedOpen(false)}>
          Close
        </button>
      </div>
      <div className="broadcast-compose">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="What's happening?"
          className="futuristic-input broadcast-input-field"
        />
        <button className="futuristic-btn broadcast-btn" onClick={handleNewPost}>
          Post
        </button>
      </div>
      <div className="people-list">
        {posts.map((post) => (
          <div key={post.id} className="people-user">
            <img
              src={post.profilePic || 'https://via.placeholder.com/40'}
              alt="User"
              className="post-avatar"
            />
            <div>
              <span className="post-username">{post.user}</span>
              <p>{post.text}</p>
              <small>{new Date(post.timestamp).toLocaleString()}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedPanel;