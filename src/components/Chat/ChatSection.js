import React, { useState, useEffect } from 'react';
import { CgProfile } from 'react-icons/cg';
import Feed from './Feed';
import { auth, db, collection, query, onSnapshot, getDocs, doc, getDoc } from '../../firebase';
import '../../styles/chat/ChatSection.css';

const ChatSection = ({ theme, user }) => {
  const [activeTab, setActiveTab] = useState('Private');
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPost, setNewPost] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({ Private: 0, Public: 0, Communities: 0, All: 0 });
  const [privateChats, setPrivateChats] = useState([]);
  const [publicChats, setPublicChats] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [suggestedCommunities, setSuggestedCommunities] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchPrivateChats = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        const following = userDoc.data()?.following || [];
        const followers = userDoc.data()?.followers || [];
        const mutuals = following.filter((uid) => followers.includes(uid));

        const chats = [];
        for (const uid of mutuals) {
          const chatRef = doc(db, 'chats', `${user.uid}_${uid}`);
          const chatDoc = await getDoc(chatRef);
          const userData = await getDoc(doc(db, 'users', uid));
          const userInfo = userData.data() || {};
          const displayName = userInfo.displayName || userInfo.email || uid;
          if (chatDoc.exists()) {
            chats.push({
              id: uid,
              user: displayName,
              hobbies: userInfo.hobbies || null,
              lastMessage: chatDoc.data().lastMessage || '',
              timestamp: chatDoc.data().timestamp?.toDate() || new Date(),
              unread: chatDoc.data().unread?.[user.uid] || 0,
              status: userInfo.status || 'offline',
            });
          }
        }
        console.log('Private Chats:', chats);
        setPrivateChats(chats);
        setUnreadCounts((prev) => ({ ...prev, Private: chats.reduce((sum, c) => sum + c.unread, 0) }));
      } catch (error) {
        console.error('Error fetching private chats:', error);
      }
    };

    const fetchPublicChats = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        const following = userDoc.data()?.following || [];
        const allUsers = await getDocs(collection(db, 'users'));
        const chats = [];
        allUsers.forEach((doc) => {
          if (doc.id !== user.uid && !following.includes(doc.id)) {
            const userInfo = doc.data() || {};
            const displayName = userInfo.displayName || userInfo.email || doc.id;
            chats.push({
              id: doc.id,
              user: displayName,
              hobbies: userInfo.hobbies || null,
              lastMessage: '',
              timestamp: new Date(),
              unread: 0,
              status: userInfo.status || 'offline',
            });
          }
        });
        console.log('Public Chats:', chats);
        setPublicChats(chats);
        setUnreadCounts((prev) => ({ ...prev, Public: chats.reduce((sum, c) => sum + c.unread, 0) }));
      } catch (error) {
        console.error('Error fetching public chats:', error);
      }
    };

    const communitiesQuery = query(collection(db, 'communities'));
    const unsubscribeCommunities = onSnapshot(communitiesQuery, (snapshot) => {
      const joined = [];
      const suggested = [];
      snapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        const name = data.name || 'Community';
        if (data.members?.includes(user.uid)) {
          joined.push({
            id: doc.id,
            name,
            lastMessage: data.lastMessage || '',
            timestamp: data.timestamp?.toDate() || new Date(),
            unread: data.unread?.[user.uid] || 0,
          });
        } else {
          suggested.push({
            id: doc.id,
            name,
            description: data.description || '',
          });
        }
      });
      console.log('Communities:', joined, 'Suggested:', suggested);
      setCommunities(joined);
      setSuggestedCommunities(suggested);
      setUnreadCounts((prev) => ({ ...prev, Communities: joined.reduce((sum, c) => sum + c.unread, 0) }));
    }, (error) => {
      console.error('Error fetching communities:', error);
    });

    fetchPrivateChats();
    fetchPublicChats();
    return () => unsubscribeCommunities();
  }, [user]);

  const allChats = [...privateChats, ...publicChats, ...communities];

  useEffect(() => {
    setUnreadCounts((prev) => ({ ...prev, All: allChats.reduce((sum, c) => sum + c.unread, 0) }));
  }, [privateChats, publicChats, communities]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setSelectedUser(null);
  };

  const handleUserClick = (chat) => {
    setSelectedUser(chat);
  };

  const handleProfileClick = (chat) => {
    setSelectedUser({ ...chat, showHobbies: true });
  };

  const handleMarkAllRead = (tab) => {
    setUnreadCounts((prev) => ({ ...prev, [tab]: 0 }));
  };

  const handleSearchCommunity = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredCommunities = communities.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSuggested = suggestedCommunities.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`chat-section ${theme}`}>
      {!selectedUser ? (
        <>
          <div className="chat-tabs">
            {['Private', 'Public', 'Communities', 'All'].map((tab) => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => handleTabSwitch(tab)}
              >
                {tab} {unreadCounts[tab] > 0 && <span className="unread-badge">{unreadCounts[tab]}</span>}
              </button>
            ))}
            <button className="mark-read-btn" onClick={() => handleMarkAllRead(activeTab)}>
              Mark All Read
            </button>
          </div>
          <div className="chat-list">
            {activeTab === 'Private' &&
              privateChats.map((chat) => (
                <div key={chat.id} className="chat-user" onClick={() => handleUserClick(chat)}>
                  <CgProfile className="profile-icon" onClick={(e) => { e.stopPropagation(); handleProfileClick(chat); }} />
                  <div className="chat-user-info">
                    <span className="chat-username">{chat.user}</span>
                    <p>{chat.lastMessage}</p>
                    {chat.unread > 0 && <span className="unread-badge">{chat.unread}</span>}
                  </div>
                </div>
              ))}
            {activeTab === 'Public' &&
              publicChats.map((chat) => (
                <div key={chat.id} className="chat-user" onClick={() => handleUserClick(chat)}>
                  <CgProfile className="profile-icon" onClick={(e) => { e.stopPropagation(); handleProfileClick(chat); }} />
                  <div className="chat-user-info">
                    <span className="chat-username">{chat.user}</span>
                    <p>{chat.lastMessage}</p>
                    {chat.unread > 0 && <span className="unread-badge">{chat.unread}</span>}
                  </div>
                </div>
              ))}
            {activeTab === 'Communities' && (
              <>
                <input
                  type="text"
                  className="community-search"
                  placeholder="Search communities..."
                  value={searchQuery}
                  onChange={handleSearchCommunity}
                />
                {filteredCommunities.map((group) => (
                  <div key={group.id} className="chat-user" onClick={() => handleUserClick(group)}>
                    <CgProfile className="profile-icon" onClick={(e) => { e.stopPropagation(); handleProfileClick(group); }} />
                    <div className="chat-user-info">
                      <span className="chat-username">{group.name}</span>
                      <p>{group.lastMessage}</p>
                      {group.unread > 0 && <span className="unread-badge">{group.unread}</span>}
                    </div>
                  </div>
                ))}
                <h4>Suggested Communities</h4>
                {filteredSuggested.map((group) => (
                  <div key={group.id} className="chat-user">
                    <CgProfile className="profile-icon" onClick={(e) => { e.stopPropagation(); handleProfileClick(group); }} />
                    <div className="chat-user-info">
                      <span className="chat-username">{group.name}</span>
                      <p>{group.description}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
            {activeTab === 'All' &&
              allChats.map((chat) => (
                <div key={chat.id} className="chat-user" onClick={() => handleUserClick(chat)}>
                  <CgProfile className="profile-icon" onClick={(e) => { e.stopPropagation(); handleProfileClick(chat); }} />
                  <div className="chat-user-info">
                    <span className="chat-username">{chat.user || chat.name}</span>
                    <p>{chat.lastMessage}</p>
                    {chat.unread > 0 && <span className="unread-badge">{chat.unread}</span>}
                  </div>
                </div>
              ))}
          </div>
        </>
      ) : (
        <div className="chat-room">
          <button className="back-button" onClick={() => setSelectedUser(null)}>
            Back
          </button>
          {selectedUser.showHobbies ? (
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
            <Feed
              user={user}
              newPost={newPost}
              setNewPost={setNewPost}
              handleNewPost={() => console.log('New message:', newPost)}
              theme={theme}
              selectedUser={selectedUser}
              handleProfileClick={handleProfileClick}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ChatSection;