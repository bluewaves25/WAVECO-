import React, { useState, useEffect, useRef } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { FaSatelliteDish, FaSun, FaMoon, FaPaperPlane, FaHome, FaChartLine, FaBriefcase, FaUsers, FaCog } from 'react-icons/fa';
import { IoIosArrowBack } from 'react-icons/io';
import { useNavigate, Routes, Route } from 'react-router-dom';
import Login from './Login';
import './App.css';

function App() {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isFeedOpen, setIsFeedOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [walletBalance, setWalletBalance] = useState(500);
  const [expandedTab, setExpandedTab] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [influence, setInfluence] = useState(0);
  const [activeTab, setActiveTab] = useState(null);
  const [socialSubTab, setSocialSubTab] = useState('chats');
  const [chatSection, setChatSection] = useState('friends');
  const [voiceMessage, setVoiceMessage] = useState(null);
  const [storyContent, setStoryContent] = useState('');
  const [realName, setRealName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [username, setUsername] = useState('');
  const [country, setCountry] = useState('');

  const profilePanelRef = useRef(null);
  const chatPanelRef = useRef(null);

  const { unityProvider } = useUnityContext({
    loaderUrl: '/unity/Build/WAVECO-WebGL.loader.js',
    dataUrl: '/unity/Build/WAVECO-WebGL.data',
    frameworkUrl: '/unity/Build/WAVECO-WebGL.framework.js',
    codeUrl: '/unity/Build/WAVECO-WebGL.wasm',
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUser(user);
        setDisplayName(user.displayName || `@${user.email.split('@')[0]}`);
        const userDoc = doc(db, 'users', user.uid);
        onSnapshot(userDoc, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setWalletBalance(data.walletBalance || 500);
            setInfluence(data.influence || 0);
            setProfilePic(data.profilePic || null);
            setTheme(data.theme || 'dark');
            setDisplayName(data.username || `@${user.email.split('@')[0]}`);
          }
        }, (error) => console.error('Firestore error:', error));
      } else {
        setUser(null);
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      const ws = new WebSocket('wss://waveco-bluewaves.glitch.me/chat');
      ws.onopen = () => console.log('WebSocket connected');
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        setMessages(prev => [msg, ...prev]);
      };
      ws.onerror = (error) => console.error('WebSocket error:', error);
      ws.onclose = () => console.log('WebSocket disconnected');
      return () => ws.close();
    }
  }, [user]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profilePanelRef.current && !profilePanelRef.current.contains(event.target)) {
        setIsPanelOpen(false);
      }
      if (chatPanelRef.current && !chatPanelRef.current.contains(event.target)) {
        setIsChatOpen(false);
      }
    };
    if (isPanelOpen || isChatOpen) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isPanelOpen, isChatOpen]);

  const handleSignup = async () => {
    if (!email || !password || !realName || !dob || !gender || !username || !country) {
      alert('Please fill out all fields');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setUser(user);
      setDisplayName(username);
      await setDoc(doc(db, 'users', user.uid), {
        realName,
        dob,
        gender,
        username,
        country,
        email: user.email,
        walletBalance: 500,
        influence: 0,
        theme: 'dark',
        displayName: username,
        createdAt: new Date().toISOString()
      });
      console.log('Signup success:', user.email);
    } catch (error) {
      console.error('Signup error:', error.code, error.message);
      alert(`Signup failed: ${error.message}`);
    }
  };

  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setUser(user);
      setDisplayName(user.displayName || `@${user.email.split('@')[0]}`);
      const userDoc = doc(db, 'users', user.uid);
      const docSnap = await onSnapshot(userDoc, (snap) => snap.exists());
      if (!docSnap) {
        await setDoc(userDoc, {
          realName: user.displayName || 'Unknown',
          dob: '',
          gender: '',
          username: `@${user.email.split('@')[0]}`,
          country: '',
          email: user.email,
          walletBalance: 500,
          influence: 0,
          theme: 'dark',
          displayName: user.displayName || `@${user.email.split('@')[0]}`,
          createdAt: new Date().toISOString()
        });
      }
      console.log('Google signup success:', user.email);
    } catch (error) {
      console.error('Google signup error:', error.code, error.message);
      alert(`Google signup failed: ${error.message}`);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    navigate('/login');
  };

  const handleNewPost = () => {
    if (newPost.trim() && user) {
      setPosts([{ id: Date.now(), user: displayName, text: newPost, time: 'Now' }, ...posts]);
      setWalletBalance(prev => prev + 5);
      setInfluence(prev => prev + 1);
      setNewPost('');
    }
  };

  const handleNewMessage = () => {
    if (newMessage.trim() && user) {
      const msg = { id: Date.now(), user: displayName, text: newMessage, time: 'Now', encrypted: true };
      const ws = new WebSocket('wss://waveco-bluewaves.glitch.me/chat');
      ws.onopen = () => {
        ws.send(JSON.stringify(msg));
        setMessages(prev => [msg, ...prev]);
        setWalletBalance(prev => prev + 3);
        setNewMessage('');
        ws.close();
      };
    }
  };

  const handleVoiceMessage = () => {
    setVoiceMessage('Recording...');
    setTimeout(() => {
      setVoiceMessage('Voice message sent');
      setWalletBalance(prev => prev + 5);
    }, 2000);
  };

  const handleCall = (type) => {
    alert(`${type} call started`);
    setWalletBalance(prev => prev + 10);
    setInfluence(prev => prev + 2);
  };

  const handleFileShare = () => {
    alert('File shared');
    setWalletBalance(prev => prev + 5);
  };

  const handleLocationShare = () => {
    alert('Location shared');
    setWalletBalance(prev => prev + 3);
  };

  const handleNewStory = () => {
    if (storyContent.trim()) {
      alert(`Story posted: ${storyContent}`);
      setWalletBalance(prev => prev + 10);
      setStoryContent('');
    }
  };

  const handlePicUpload = (e) => {
    const file = e.target.files[0];
    if (file && user) {
      const url = URL.createObjectURL(file);
      setProfilePic(url);
      setDoc(doc(db, 'users', user.uid), { profilePic: url }, { merge: true });
    }
  };

  const handleEditProfile = () => {
    const newName = prompt('New name:', displayName);
    if (newName && user) {
      setDisplayName(newName);
      setDoc(doc(db, 'users', user.uid), { displayName: newName, username: newName }, { merge: true });
    }
  };

  const handleSendWC = () => {
    const amount = parseInt(prompt('Send WC:', '0'), 10);
    if (amount && amount <= walletBalance && user) {
      setWalletBalance(prev => prev - amount);
      setDoc(doc(db, 'users', user.uid), { walletBalance: walletBalance - amount }, { merge: true });
    }
  };

  const handleTask = () => {
    if (user) {
      setWalletBalance(prev => prev + 10);
      setInfluence(prev => prev + 1);
      setDoc(doc(db, 'users', user.uid), { walletBalance: walletBalance + 10, influence: influence + 1 }, { merge: true });
    }
  };

  const handleKnowledgeGame = () => {
    if (user) {
      setWalletBalance(prev => prev + 20);
      setInfluence(prev => prev + 2);
      setDoc(doc(db, 'users', user.uid), { walletBalance: walletBalance + 20, influence: influence + 2 }, { merge: true });
    }
  };

  const showBackButton = activeTab || mode;

  const signupPage = (
    <div className={`app ${theme}`}>
      <header className={`header ${theme}`}>
        <h1 className="waveco-title"><span className="wav">wav</span><span className={`eco ${theme}`}>Eco</span></h1>
      </header>
      <main className="dashboard">
        <div className="signup">
          <h2>Create Your WAVECoin Account</h2>
          <input
            type="text"
            value={realName}
            onChange={(e) => setRealName(e.target.value)}
            placeholder="Full Name"
            className={`signup-input ${theme}`}
          />
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className={`signup-input ${theme}`}
          />
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className={`signup-input ${theme}`}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className={`signup-input ${theme}`}
          />
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Country"
            className={`signup-input ${theme}`}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className={`signup-input ${theme}`}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={`signup-input ${theme}`}
          />
          <button className="action-btn" onClick={handleSignup}>Sign Up with Email</button>
          <button className="action-btn" onClick={handleGoogleSignup}>Sign Up with Google</button>
          <p>Already have an account? <button className="action-btn" onClick={() => navigate('/login')}>Log In</button></p>
          <p>Sign up to get 500 WAVECoin (WC) in your wallet!</p>
        </div>
      </main>
    </div>
  );

  const dashboardPage = (
    <div className={`app ${theme}`}>
      <header className={`header ${theme}`}>
        <h1 className="waveco-title"><span className="wav">wav</span><span className={`eco ${theme}`}>Eco</span></h1>
        {user && (
          <>
            <button className={`feed-btn ${theme}`} onClick={() => setIsFeedOpen(!isFeedOpen)}><FaSatelliteDish /></button>
            <img
              src={profilePic || '[A]'}
              alt="Profile"
              className="header-profile-pic"
              onClick={() => {
                console.log('Panel toggled:', !isPanelOpen); // Debug toggle
                setIsPanelOpen(!isPanelOpen);
              }}
            />
          </>
        )}
      </header>
      <main className="dashboard">
        {showBackButton && (
          <IoIosArrowBack className={`back-arrow ${theme}`} onClick={() => {
            setActiveTab(null);
            setMode(null);
          }} />
        )}
        {!activeTab ? (
          <div className="economic-tabs">
            <span className={`tab-section ${theme}`} onClick={() => setActiveTab('home')}>
              <FaHome className="tab-icon" /> Home
            </span>
            <span className={`tab-section ${theme}`} onClick={() => setActiveTab('markets')}>
              <FaChartLine className="tab-icon" /> Markets
            </span>
            <span className={`tab-section ${theme}`} onClick={() => { setActiveTab('work'); setMode('work'); }}>
              <FaBriefcase className="tab-icon" /> Work
            </span>
            <span className={`tab-section ${theme}`} onClick={() => { setActiveTab('social'); setMode('social'); }}>
              <FaUsers className="tab-icon" /> Social
            </span>
          </div>
        ) : null}
        {activeTab === 'home' && !mode && (
          <div className={`welcome ${theme}`}>
            <h2>Welcome, {displayName}!</h2>
            <div className="stats-card">
              <p>Wallet: {walletBalance.toFixed(2)} WC</p>
              <p>Influence: {influence}</p>
            </div>
          </div>
        )}
        {activeTab === 'markets' && !mode && (
          <div className={`markets ${theme}`}>
            <h2>Markets</h2>
            <div className="stats-card">
              <p>Wallet: {walletBalance.toFixed(2)} WC</p>
              <p>Influence: {influence}</p>
              <button className="action-btn">Buy WC</button>
              <button className="action-btn">Sell WC</button>
            </div>
          </div>
        )}
        {activeTab === 'work' && mode === 'work' && (
          <div className={`work-mode ${theme}`}>
            <h2>Work</h2>
            <button className="action-btn" onClick={() => setMode('stream')}>Stream</button>
            <button className="action-btn" onClick={handleTask}>Task (+10)</button>
            <button className="action-btn" onClick={handleKnowledgeGame}>Solve (+20)</button>
            <button className={`action-btn back-btn ${theme}`} onClick={() => setMode(null)}><IoIosArrowBack /></button>
          </div>
        )}
        {activeTab === 'social' && mode === 'social' && (
          <div className={`social-mode ${theme}`}>
            <h2>Social</h2>
            <div className="social-sub-tabs">
              <span className={`social-section ${socialSubTab === 'chats' ? 'active' : ''} ${theme}`} onClick={() => setSocialSubTab('chats')}>
                Chats
              </span>
              <span className={`social-section ${socialSubTab === 'calls' ? 'active' : ''} ${theme}`} onClick={() => setSocialSubTab('calls')}>
                Calls
              </span>
              <span className={`social-section ${socialSubTab === 'stories' ? 'active' : ''} ${theme}`} onClick={() => setSocialSubTab('stories')}>
                Stories
              </span>
            </div>
            {socialSubTab === 'chats' ? (
              <div className="chats-section">
                <div className="chat-sub-sections">
                  <span className={`chat-section ${chatSection === 'friends' ? 'active' : ''} ${theme}`} onClick={() => setChatSection('friends')}>
                    Friends
                  </span>
                  <span className={`chat-section ${chatSection === 'communities' ? 'active' : ''} ${theme}`} onClick={() => setChatSection('communities')}>
                    Communities
                  </span>
                  <span className={`chat-section ${chatSection === 'global' ? 'active' : ''} ${theme}`} onClick={() => setChatSection('global')}>
                    Global
                  </span>
                </div>
                {chatSection === 'friends' && (
                  <div>
                    <button className="action-btn" onClick={() => setIsChatOpen(true)}>Friend Chat</button>
                  </div>
                )}
                {chatSection === 'communities' && (
                  <div>
                    <button className="action-btn" onClick={() => setIsFeedOpen(true)}>Community Feed</button>
                  </div>
                )}
                {chatSection === 'global' && (
                  <div>
                    <button className="action-btn" onClick={handleFileShare}>Share File (+5)</button>
                    <button className="action-btn" onClick={handleLocationShare}>Share Location (+3)</button>
                    <button className="action-btn" onClick={handleVoiceMessage}>
                      Voice Msg {voiceMessage || '(+5)'}
                    </button>
                  </div>
                )}
              </div>
            ) : socialSubTab === 'calls' ? (
              <div className="calls-section">
                <button className="action-btn" onClick={() => handleCall('Voice')}>Voice Call (+10)</button>
                <button className="action-btn" onClick={() => handleCall('Video')}>Video Call (+10)</button>
                <button className="action-btn" onClick={() => handleCall('Group Video')}>Group Video (+10)</button>
              </div>
            ) : socialSubTab === 'stories' ? (
              <div className="stories-section">
                <input
                  value={storyContent}
                  onChange={(e) => setStoryContent(e.target.value)}
                  placeholder="New Story... (+10)"
                  className={`post-input ${theme}`}
                />
                <button className="action-btn" onClick={handleNewStory}>Post Story</button>
              </div>
            ) : null}
          </div>
        )}
        {mode === 'stream' && (
          <div className={`unity-container ${theme}`}>
            <h2>Stream</h2>
            <Unity unityProvider={unityProvider} style={{ width: '100%', height: '100%' }} />
            <button className={`action-btn back-btn ${theme}`} onClick={() => setMode(null)}><IoIosArrowBack /></button>
          </div>
        )}
        {activeTab && (
          <div className="home-icon" onClick={() => {
            setActiveTab(null);
            setMode(null);
            setIsPanelOpen(false);
            setIsFeedOpen(false);
            setIsChatOpen(false);
          }}>
            <span className={`home-icon-inner ${theme}`}><FaHome /></span>
          </div>
        )}
        {user && (
          <>
            <div ref={profilePanelRef} className={`slide-panel ${isPanelOpen ? 'open' : ''} ${theme}`}>
              <div className="panel-header">
                <button className={`action-btn back-btn ${theme}`} onClick={() => setIsPanelOpen(false)}><IoIosArrowBack /></button>
                <FaCog className={`gear-icon ${theme}`} onClick={() => console.log('Settings TBD')} />
                <span
                  className={`theme-icon ${theme}`}
                  onClick={() => {
                    const newTheme = theme === 'dark' ? 'light' : 'dark';
                    setTheme(newTheme);
                    setDoc(doc(db, 'users', user.uid), { theme: newTheme }, { merge: true });
                  }}
                >
                  {theme === 'dark' ? <FaSun /> : <FaMoon />}
                </span>
              </div>
              <div className={`panel-content ${theme}`}>
                <img src={profilePic || '[A]'} alt="Profile" className="profile-pic" />
                <input type="file" accept="image/*" onChange={handlePicUpload} className={`pic-upload ${theme}`} />
                <h2>{displayName}</h2>
                <p>WC: {walletBalance.toFixed(2)} | Inf: {influence}</p>
                <div className="info-grid">
                  <div className={`info-item ${theme}`} onClick={() => setExpandedTab(expandedTab === 'wallet' ? null : 'wallet')}>
                    <span className="icon">W</span>
                    {expandedTab === 'wallet' && (
                      <div className={`info-details ${theme}`}>
                        <p>{walletBalance.toFixed(2)} WC</p>
                        <button className="action-btn" onClick={handleSendWC}>Send</button>
                      </div>
                    )}
                  </div>
                  <div className={`info-item ${theme}`} onClick={() => setExpandedTab(expandedTab === 'assets' ? null : 'assets')}>
                    <span className="icon">A</span>
                    {expandedTab === 'assets' && <div className={`info-details ${theme}`}><p>1 Land</p></div>}
                  </div>
                </div>
                <button className="action-btn" onClick={handleEditProfile}>Edit</button>
                <button className="action-btn" onClick={handleLogout}>Logout</button>
              </div>
            </div>
            <div className={`feed-panel ${isFeedOpen ? 'open' : ''} ${theme}`}>
              <div className="feed-header">
                <button className={`action-btn back-btn ${theme}`} onClick={() => setIsFeedOpen(false)}><IoIosArrowBack /></button>
              </div>
              <div className={`feed-content ${theme}`}>
                <input
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Post... (+5)"
                  className={`post-input ${theme}`}
                />
                <button className="action-btn" onClick={handleNewPost}><FaPaperPlane /></button>
                {posts.map(post => (
                  <div className={`post ${theme}`} key={post.id}>
                    <strong>{post.user}</strong> {post.text} <span>{post.time}</span>
                  </div>
                ))}
              </div>
            </div>
            <div ref={chatPanelRef} className={`chat-panel ${isChatOpen ? 'open' : ''} ${theme}`}>
              <div className="chat-header">
                <button className={`action-btn back-btn ${theme}`} onClick={() => setIsChatOpen(false)}><IoIosArrowBack /></button>
              </div>
              <div className={`chat-content ${theme}`}>
                {messages.map(msg => (
                  <div key={msg.id} className={`message ${msg.user === displayName ? 'sent' : 'received'} ${theme}`}>
                    <strong>{msg.user}</strong> {msg.text} {msg.encrypted && '(E)'} <span>{msg.time}</span>
                  </div>
                ))}
              </div>
              <div className="chat-input">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Message... (+3)"
                  className={`chat-text-input ${theme}`}
                  onKeyPress={(e) => e.key === 'Enter' && handleNewMessage()}
                />
                <button className="action-btn" onClick={handleNewMessage}><FaPaperPlane /></button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={user ? dashboardPage : signupPage} />
    </Routes>
  );
}

export default App;