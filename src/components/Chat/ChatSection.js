import React, { useState, useEffect, useRef } from 'react';
import {
  FaAngleLeft, FaSearch, FaFileAlt, FaUserFriends, FaFileUpload, FaSmile, FaHandsHelping,
  FaEllipsisV, FaBan, FaFlag, FaTrash, FaVideo, FaMicrophone, FaMicrophoneSlash,
  FaShareSquare, FaUsers, FaCircle
} from 'react-icons/fa';
import { IoIosCall } from 'react-icons/io';
import { db } from '../../firebase';
import {
  collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, getDocs, getDoc
} from 'firebase/firestore';
import '../../styles/Chat.css';

const CustomAvatar = ({ status }) => (
  <div className={`avatar-status ${status}`}>
    <FaCircle />
  </div>
);

const ChatSection = ({ user, userData, users }) => {
  const [chatMessages, setChatMessages] = useState([]);
  const [chatRoomMessages, setChatRoomMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatRoomInput, setChatRoomInput] = useState('');
  const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isChatRoomOpen, setIsChatRoomOpen] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callType, setCallType] = useState(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('public');
  const [groups, setGroups] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const chatMenuRef = useRef(null);
  const videoRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchGroups = async () => {
      const groupsSnapshot = await getDocs(collection(db, 'groups'));
      const groupList = groupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGroups(groupList);
      if (selectedChat?.type === 'group') {
        const groupDoc = await getDoc(doc(db, 'groups', selectedChat.id));
        setIsAdmin(groupDoc.exists() && groupDoc.data().admin === user.uid);
      }
    };
    fetchGroups();
  }, [selectedChat, user]);

  useEffect(() => {
    if (!selectedChat || !user || !user.uid) return;
    let q;
    if (selectedChat.type === 'group') {
      q = query(collection(db, 'groups', selectedChat.id, 'messages'), orderBy('timestamp'));
    } else {
      q = query(collection(db, 'chats', `${user.uid}_${selectedChat.id}`, 'messages'), orderBy('timestamp'));
    }
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChatMessages(snapshot.docs.map(doc => doc.data()));
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
    return () => unsubscribe();
  }, [selectedChat, user]);

  useEffect(() => {
    if (!isChatRoomOpen || activeTab !== 'public') return;
    const q = query(collection(db, 'chatRooms', 'global', 'messages'), orderBy('timestamp'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChatRoomMessages(snapshot.docs.map(doc => doc.data()));
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
    return () => unsubscribe();
  }, [isChatRoomOpen, activeTab]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatMenuRef.current && !chatMenuRef.current.contains(event.target)) setIsChatMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const sendChatRoomMessage = async () => {
    if (!chatRoomInput.trim() || !user) return;
    try {
      await addDoc(collection(db, 'chatRooms', 'global', 'messages'), {
        text: chatRoomInput,
        userId: user.uid,
        userName: userData?.fullName || user.email,
        timestamp: new Date().toISOString()
      });
      setChatRoomInput('');
    } catch (error) {
      console.error('Send chat room message error:', error.message);
    }
  };

  const handleTyping = (e) => {
    setChatInput(e.target.value);
    setIsTyping(!!e.target.value);
  };

  const startCall = async (type) => {
    setCallType(type);
    setIsCallActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video',
        audio: true
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
      console.log(`Starting ${type} call`);
    } catch (error) {
      console.error('Start call error:', error.message);
      setIsCallActive(false);
    }
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      setIsScreenSharing(true);
      if (videoRef.current) videoRef.current.srcObject = stream;
      console.log('Screen sharing started');
    } catch (error) {
      console.error('Screen share error:', error.message);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    console.log(`Microphone ${isMuted ? 'unmuted' : 'muted'}`);
  };

  const handleAdminAction = async (action, targetId) => {
    if (!isAdmin) return;
    try {
      switch (action) {
        case 'kick':
          await updateDoc(doc(db, 'groups', selectedChat.id), {
            members: selectedChat.members.filter(id => id !== targetId)
          });
          break;
        case 'ban':
          await updateDoc(doc(db, 'groups', selectedChat.id), {
            banned: [...(selectedChat.banned || []), targetId]
          });
          break;
        default:
          break;
      }
      console.log(`${action} user ${targetId}`);
    } catch (error) {
      console.error('Admin action error:', error.message);
    }
  };

  const handleAction = (action, targetId) => {
    setIsChatMenuOpen(false);
    if (action === 'kick' || action === 'ban') {
      handleAdminAction(action, targetId);
    } else {
      setConfirmation(action);
    }
  };

  const confirmAction = (confirmed) => {
    if (confirmed && selectedChat) {
      switch (confirmation) {
        case 'block': setSelectedChat(null); break;
        case 'report': break;
        case 'clear': setChatMessages([]); break;
        case 'delete': setChatMessages([]); setSelectedChat(null); break;
        default: break;
      }
    }
    setConfirmation(null);
  };

  const openChat = (chatUser, type = 'user') => {
    setSelectedChat({ ...chatUser, type });
    setIsChatRoomOpen(false);
    setCallType(null);
    setIsCallActive(false);
  };

  const filteredUsers = () => {
    if (activeTab === 'private') {
      return users.filter(u => u.id !== user.uid && userData?.following?.includes(u.id));
    }
    return users.filter(u => u.id !== user.uid);
  };

  const filteredGroups = () => {
    if (activeTab === 'communities') {
      return groups;
    }
    return groups.filter(g => g.members.includes(user.uid));
  };

  return (
    <div className="chat-section futuristic">
      <div className="chat-header">
        <span>Chats</span>
        <div className="chat-search">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="chat-search-input"
          />
          <FaSearch className="chat-action-btn" />
        </div>
      </div>
      <div className="chat-tabs">
        {['public', 'private', 'communities', 'all'].map(tab => (
          <button
            key={tab}
            className={`chat-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      {!selectedChat && !isChatRoomOpen && (
        <div className="chat-list">
          {(activeTab === 'public' || activeTab === 'all') && (
            <>
              <div className="community-icon-tab">
                <FaUserFriends className="tab-icon" />
                <span>Public Chat Room</span>
              </div>
              <div className="chat-user futuristic" onClick={() => setIsChatRoomOpen(true)}>
                <FaFileAlt className="post-avatar" />
                <span className="post-username">Global Chat</span>
                <CustomAvatar status="online" />
              </div>
            </>
          )}
          {(activeTab === 'public' || activeTab === 'private' || activeTab === 'all') && filteredUsers()
            .filter(u => u.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(u => (
              <div key={u.id} className="chat-user futuristic" onClick={() => openChat(u)}>
                <img
                  src={u.profilePic || 'https://via.placeholder.com/30'}
                  alt={`${u.fullName}'s avatar`}
                  className="post-avatar"
                />
                <span className="post-username">{u.fullName}</span>
                <CustomAvatar status={u.status || 'offline'} />
              </div>
            ))}
          {(activeTab === 'communities' || activeTab === 'all') && filteredGroups()
            .filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(g => (
              <div key={g.id} className="chat-user futuristic" onClick={() => openChat({ ...g, type: 'group' })}>
                <FaUsers className="post-avatar" />
                <span className="post-username">{g.name}</span>
                <CustomAvatar status="online" />
              </div>
            ))}
        </div>
      )}
      {selectedChat && !isChatRoomOpen && (
        <div className="chat-room full-screen futuristic">
          <div className="chat-header">
            <button className="chat-control-btn" onClick={() => setSelectedChat(null)}>
              <FaAngleLeft />
            </button>
            <span className="chat-title">{selectedChat.fullName || selectedChat.name}</span>
            <CustomAvatar status={selectedChat.status || 'online'} />
            <div className="chat-controls">
              <button className="chat-control-btn" onClick={() => startCall('audio')}>
                <IoIosCall />
              </button>
              <button className="chat-control-btn" onClick={() => startCall('video')}>
                <FaVideo />
              </button>
              <button className="chat-control-btn" onClick={startScreenShare}>
                <FaShareSquare />
              </button>
              <div ref={chatMenuRef}>
                <button
                  className="chat-control-btn"
                  onClick={() => setIsChatMenuOpen(!isChatMenuOpen)}
                >
                  <FaEllipsisV />
                </button>
                {isChatMenuOpen && (
                  <div className="chat-menu">
                    <button className="chat-menu-item" onClick={() => handleAction('block')}>
                      <FaBan /> Block
                    </button>
                    <button className="chat-menu-item" onClick={() => handleAction('report')}>
                      <FaFlag /> Report
                    </button>
                    <button className="chat-menu-item" onClick={() => handleAction('clear')}>
                      <FaTrash /> Clear
                    </button>
                    <button className="chat-menu-item" onClick={() => handleAction('delete')}>
                      <FaTrash /> Delete
                    </button>
                    {isAdmin && selectedChat.type === 'group' && (
                      <>
                        <button
                          className="chat-menu-item"
                          onClick={() => handleAction('kick', selectedChat.id)}
                        >
                          <FaBan /> Kick
                        </button>
                        <button
                          className="chat-menu-item"
                          onClick={() => handleAction('ban', selectedChat.id)}
                        >
                          <FaBan /> Ban
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          {isCallActive && (
            <div className="call-tab">
              <video ref={videoRef} autoPlay playsInline className="call-video" />
              <div className="call-controls">
                <button onClick={toggleMute} className="call-control-btn">
                  {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
                </button>
                {isScreenSharing && (
                  <button onClick={() => setIsScreenSharing(false)} className="call-control-btn">
                    <FaShareSquare /> Stop Share
                  </button>
                )}
                <button onClick={() => setIsCallActive(false)} className="call-control-btn">
                  End Call
                </button>
              </div>
            </div>
          )}
          <div className="chat-messages">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.user === user?.uid ? 'user' : ''}`}>
                <strong>{msg.userName}: </strong>{msg.text}
              </div>
            ))}
            {isTyping && <div className="typing">Typing...</div>}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input-area">
            <div className="chat-input-container">
              <button className="chat-action-btn"><FaSmile /></button>
              <input
                type="text"
                value={chatInput}
                onChange={handleTyping}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="chat-input"
              />
              <button className="chat-action-btn" onClick={sendMessage}>
                Send
              </button>
              <button className="chat-action-btn"><FaHandsHelping /></button>
              <button className="chat-action-btn"><FaFileUpload /></button>
            </div>
          </div>
          {confirmation && (
            <div className="confirmation-modal futuristic">
              <p>Confirm {confirmation}?</p>
              <button onClick={() => confirmAction(true)}>Yes</button>
              <button onClick={() => confirmAction(false)}>No</button>
            </div>
          )}
        </div>
      )}
      {isChatRoomOpen && (
        <div className="chat-room full-screen futuristic">
          <div className="chat-header">
            <button className="chat-control-btn" onClick={() => setIsChatRoomOpen(false)}>
              <FaAngleLeft />
            </button>
            <span className="chat-title">Global Chat Room</span>
            <CustomAvatar status="online" />
          </div>
          <div className="chat-room-messages">
            {chatRoomMessages.map((msg, i) => (
              <div key={i} className="chat-room-message">
                <strong>{msg.userName}: </strong>{msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input-area">
            <input
              type="text"
              value={chatRoomInput}
              onChange={(e) => setChatRoomInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendChatRoomMessage()}
              placeholder="Type a message..."
              className="chat-room-input"
            />
            <button className="chat-room-send" onClick={sendChatRoomMessage}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSection;