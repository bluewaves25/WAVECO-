import React from 'react';

const ChatsTab = ({ users, setChatFriend, setIsChatOpen }) => {
  return (
    <div className="tab-content chat-section">
      <h3>Chats</h3>
      {users.map((u) => (
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
  );
};

export default ChatsTab;