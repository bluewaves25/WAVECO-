import React, { useState, useRef, useEffect } from 'react';
import { CgProfile } from 'react-icons/cg';
import { db, collection, query, orderBy, onSnapshot, addDoc } from '../../firebase';
import '../../styles/chat/Feed.css';

const Feed = ({ user, newPost, setNewPost, theme, selectedUser, handleProfileClick }) => {
  const [posts, setPosts] = useState([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const feedRef = useRef(null);

  useEffect(() => {
    if (!user || !selectedUser?.id) return;

    const messagesRef = collection(db, `chats/${user.uid}_${selectedUser.id}/messages`);
    const q = query(messagesRef, orderBy('timestamp'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPosts(messages);
      console.log('Posts:', posts); 
      
      if (feedRef.current) {
        feedRef.current.scrollTop = feedRef.current.scrollHeight;
      }
    }, (error) => {
      console.error('Error fetching messages:', error);
    });

    return () => unsubscribe();
  }, [user, selectedUser]);

  useEffect(() => {
    const handleScroll = () => {
      if (feedRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = feedRef.current;
        setShowScrollButton(scrollHeight - clientHeight > 100 && scrollTop + clientHeight < scrollHeight - 10);
      }
    };
    feedRef.current?.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => feedRef.current?.removeEventListener('scroll', handleScroll);
  }, [posts]);

  const scrollToBottom = () => {
    if (feedRef.current) {
      feedRef.current.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  const handleSendMessage = async () => {
    if (!newPost.trim() || !selectedUser?.id) return;
    try {
      const messageRef = await addDoc(collection(db, `chats/${user.uid}_${selectedUser.id}/messages`), {
        user: user.displayName || user.email,
        text: newPost,
        timestamp: new Date(),
        status: 'sent',
        senderId: user.uid,
      });
      setNewPost('');
      setTimeout(() => {
        setPosts((prev) =>
          prev.map((post) =>
            post.id === messageRef.id ? { ...post, status: 'delivered' } : post
          )
        );
      }, 1000);
      setTimeout(() => {
        setPosts((prev) =>
          prev.map((post) =>
            post.id === messageRef.id ? { ...post, status: 'viewed' } : post
          )
        );
      }, 2000);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className={`feed ${theme}`}>
      {selectedUser?.showHobbies ? (
        <div className="hobbies-panel">
          <h3>{selectedUser.user || selectedUser.name}</h3>
          <p>
            Hobbies:{' '}
            {Array.isArray(selectedUser.hobbies)
              ? selectedUser.hobbies.join(', ')
              : typeof selectedUser.hobbies === 'string'
              ? selectedUser.hobbies
              : 'None'}
          </p>
        </div>
      ) : (
        <>
          <div className="chat-header">
            <button className="back-button" onClick={() => handleProfileClick(null)}>
              Back
            </button>
            <CgProfile
              className="profile-icon"
              onClick={() => handleProfileClick(selectedUser)}
            />
            <div className="status-indicator">
              <span className={selectedUser?.status === 'online' ? 'online' : 'offline'}>
                {selectedUser?.status === 'online' ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          <div className="feed-messages" ref={feedRef}>
            {posts.map((post, index) => (
              <div
                key={post.id || index}
                className={`feed-post ${post.senderId === user.uid ? 'sent' : 'received'}`}
                style={{ animation: `fadeIn 0.3s ease-in ${index * 0.1}s both` }}
              >
                <div className="feed-post-info">
                  <span className="post-username">{post.user}</span>
                  <p>{post.text}</p>
                  <div className="message-meta">
                    <small>{new Date(post.timestamp?.toDate?.() || post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                    {post.senderId === user.uid && (
                      <span className={`status-check ${post.status}`}>
                        {post.status === 'sent' ? '✓' : post.status === 'delivered' ? '✓✓' : '✓✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="feed-compose">
            <textarea
              className="feed-input"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
            />
            <button className="feed-post-btn" onClick={handleSendMessage}>
              Send
            </button>
          </div>
          {showScrollButton && (
            <button className="scroll-button down" onClick={scrollToBottom}>
              ↓
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default Feed;