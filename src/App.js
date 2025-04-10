import React, { useState, useEffect, useRef } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { FaSatelliteDish, FaSun, FaMoon, FaPaperPlane, FaChartLine, FaBriefcase, FaUsers, FaCog, FaBell, FaVideo, FaGlobe, FaUserFriends, FaLock, FaPlusSquare, FaSearch, FaBookOpen, FaComment } from 'react-icons/fa';
import { IoIosArrowBack } from 'react-icons/io';
import { useNavigate, Routes, Route } from 'react-router-dom';
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
  const [socialSubTab, setSocialSubTab] = useState('reels');
  const [storyContent, setStoryContent] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [chatFriend, setChatFriend] = useState(null);
  const [realName, setRealName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [username, setUsername] = useState('');
  const [country, setCountry] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ videos: [], friends: [], social: [] });

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
            setRealName(data.realName || '');
            setDob(data.dob || '');
            setGender(data.gender || '');
            setCountry(data.country || '');
          }
        }, (error) => console.error('Firestore error:', error));
      } else {
        setUser(null);
        navigate('/signup');
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
        setNotifications(prev => [`New message from ${msg.user}`, ...prev]);
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
        realName, dob, gender, username, country, email: user.email, walletBalance: 500, influence: 0, theme: 'dark', displayName: username, createdAt: new Date().toISOString()
      });
      navigate('/');
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
          realName: user.displayName || 'Unknown', dob: '', gender: '', username: `@${user.email.split('@')[0]}`, country: '', email: user.email, walletBalance: 500, influence: 0, theme: 'dark', displayName: user.displayName || `@${user.email.split('@')[0]}`, createdAt: new Date().toISOString()
        });
      }
      navigate('/');
    } catch (error) {
      console.error('Google signup error:', error.code, error.message);
      alert(`Google signup failed: ${error.message}`);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error.code, error.message);
      alert(`Login failed: ${error.message}`);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert('Please enter your email');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent!');
    } catch (error) {
      console.error('Forgot password error:', error.code, error.message);
      alert(`Failed: ${error.message}`);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    navigate('/login');
  };

  const handleNewPost = () => {
    if (newPost.trim() && user) {
      setPosts([{ id: Date.now(), user: displayName, text: newPost, timestamp: new Date().toISOString(), likes: 0, comments: [] }, ...posts]);
      setWalletBalance(prev => prev + 5);
      setInfluence(prev => prev + 1);
      setNotifications(prev => ['New post added', ...prev]);
      setNewPost('');
    }
  };

  const handleNewMessage = () => {
    if (newMessage.trim() && user && chatFriend) {
      const msg = { id: Date.now(), user: displayName, text: newMessage, timestamp: new Date().toISOString(), to: chatFriend, type: socialSubTab === 'private' ? 'private' : 'public' };
      setMessages(prev => [msg, ...prev]);
      setWalletBalance(prev => prev + 3);
      setNotifications(prev => [`Message sent to ${chatFriend}`, ...prev]);
      setNewMessage('');
    }
  };

  const handleNewStory = () => {
    if (storyContent.trim()) {
      alert(`Story posted: ${storyContent}`);
      setWalletBalance(prev => prev + 10);
      setNotifications(prev => ['Story posted', ...prev]);
      setStoryContent('');
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    const aiResponse = { videos: [`Video: ${searchQuery}`], friends: [`Friend: ${searchQuery}`], social: [`Post: ${searchQuery}`] };
    setSearchResults(aiResponse);
    setNotifications(prev => [`Searched: ${searchQuery}`, ...prev]);
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
      setNotifications(prev => [`Sent ${amount} WC`, ...prev]);
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
        <h1 className="waveco-title" onClick={() => navigate('/login')}><span className="wav">wav</span><span className={`eco ${theme}`}>Eco</span></h1>
      </header>
      <main className="dashboard">
        <div className="signup">
          <h2 className="futuristic-title">Initialize Your WAVECoin Identity</h2>
          <div className="signup-form">
            <input type="text" value={realName} onChange={(e) => setRealName(e.target.value)} placeholder="Full Name" className={`futuristic-input ${theme}`} />
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className={`futuristic-input ${theme}`} />
            <select value={gender} onChange={(e) => setGender(e.target.value)} className={`futuristic-input ${theme}`}>
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={`futuristic-input ${theme}`} />
            <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" className={`futuristic-input ${theme}`} />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={`futuristic-input ${theme}`} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className={`futuristic-input ${theme}`} />
            <button className="futuristic-btn" onClick={handleSignup}>Activate Profile</button>
            <button className="futuristic-btn" onClick={handleGoogleSignup}>Sync with Google</button>
          </div>
          <p className="futuristic-text">Already synced? <span onClick={() => { console.log('Navigating to /login'); navigate('/login'); }} className="link">Sign In</span></p>
          <p className="futuristic-text">Gain 500 WAVECoin (WC) upon activation!</p>
        </div>
      </main>
    </div>
  );

  const loginPage = (
    <div className={`app ${theme}`}>
      <header className={`header ${theme}`}>
        <h1 className="waveco-title" onClick={() => navigate('/signup')}><span className="wav">wav</span><span className={`eco ${theme}`}>Eco</span></h1>
      </header>
      <main className="dashboard">
        <div className="signup">
          <h2 className="futuristic-title">Sign In to WAVECoin Network</h2>
          <div className="signup-form">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={`futuristic-input ${theme}`} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className={`futuristic-input ${theme}`} />
            <button className="futuristic-btn" onClick={handleLogin}>Sign In</button>
            <button className="futuristic-btn" onClick={handleGoogleSignup}>Sync with Google</button>
          </div>
          <p className="futuristic-text"><span onClick={handleForgotPassword} className="link">Reset Access Code</span></p>
          <p className="futuristic-text">New entity? <span onClick={() => navigate('/signup')} className="link">Initialize Now</span></p>
        </div>
      </main>
    </div>
  );

  const dashboardPage = (
    <div className={`app ${theme}`}>
      <header className={`header ${theme}`}>
        <h1 className="waveco-title" onClick={() => { setActiveTab(null); setMode(null); }}><span className="wav">wav</span><span className={`eco ${theme}`}>Eco</span></h1>
        {user && (
          <div className="header-right">
            <FaBell className={`theme-icon ${theme}`} onClick={() => alert(notifications.join('\n'))} />
            <div className="search-bar">
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Quantum Search..." className={`futuristic-input ${theme}`} />
              <FaSearch className={`theme-icon ${theme}`} onClick={handleSearch} />
            </div>
            <button className={`feed-btn ${theme}`} onClick={() => setIsFeedOpen(!isFeedOpen)}><FaSatelliteDish /></button>
            {!isPanelOpen && (
              <img
                src={profilePic || '[A]'}
                alt="Profile"
                className="header-profile-pic"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPanelOpen(true);
                }}
              />
            )}
          </div>
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
            <span className="tab-text" onClick={() => setActiveTab('markets')}>Markets</span>
            <span className="tab-divider" />
            <span className="tab-text" onClick={() => { setActiveTab('work'); setMode('work'); }}>Work</span>
            <span className="tab-divider" />
            <span className="tab-text" onClick={() => { setActiveTab('social'); setMode('social'); }}>Social</span>
          </div>
        ) : null}
        {activeTab === 'markets' && !mode && (
          <div className={`markets ${theme}`}>
            <IoIosArrowBack className={`back-arrow ${theme}`} onClick={() => setActiveTab(null)} />
            <h2>Markets</h2>
            <p>Wallet: {walletBalance.toFixed(2)} WC</p>
            <p>Influence: {influence}</p>
            <button className="futuristic-btn">Acquire WC</button>
            <button className="futuristic-btn">Liquidate WC</button>
          </div>
        )}
        {activeTab === 'work' && mode === 'work' && (
          <div className={`work-mode ${theme}`}>
            <IoIosArrowBack className={`back-arrow ${theme}`} onClick={() => setMode(null)} />
            <h2>Work</h2>
            <button className="futuristic-btn" onClick={() => setMode('stream')}>Stream</button>
            <button className="futuristic-btn" onClick={handleTask}>Task (+10)</button>
            <button className="futuristic-btn" onClick={handleKnowledgeGame}>Solve (+20)</button>
          </div>
        )}
        {activeTab === 'social' && mode === 'social' && (
          <div className={`social-mode ${theme}`}>
            <IoIosArrowBack className={`back-arrow ${theme}`} onClick={() => setMode(null)} />
            <h2>Social Nexus</h2>
            <div className="social-content">
              {searchResults.videos.length > 0 && (
                <div className={`search-results ${theme}`}>
                  <p>Videos: {searchResults.videos.join(', ')}</p>
                  <p>Friends: {searchResults.friends.join(', ')}</p>
                  <p>Social: {searchResults.social.join(', ')}</p>
                </div>
              )}
              {socialSubTab === 'reels' && (
                <div className="reels-section">
                  <div className={`reel-item ${theme}`}>Short Video 1 <FaVideo /></div>
                  <div className={`reel-item ${theme}`}>Short Video 2 <FaVideo /></div>
                  <div className={`reel-item ${theme}`}>Short Video 3 <FaVideo /></div>
                </div>
              )}
              {socialSubTab === 'post' && (
                <div>
                  <input value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder="Transmit Thought... (+5)" className={`futuristic-input ${theme}`} />
                  <button className="futuristic-btn" onClick={handleNewPost}><FaPaperPlane /></button>
                </div>
              )}
              {socialSubTab === 'public' && (
                <div className="chat-section">
                  <p>Public Nodes: Group1, Group2</p>
                  <p>Known Entities: UserA, UserB</p>
                  <div className="chat-history">
                    {messages.filter(m => m.type === 'public').map(m => (
                      <div key={m.id} className={`message ${theme}`}>
                        <strong>{m.user}</strong> {m.text} <span>{new Date(m.timestamp).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <FaComment className={`chat-icon ${theme}`} title="Socialize" onClick={() => { setChatFriend('Public'); setIsChatOpen(true); }} />
                </div>
              )}
              {socialSubTab === 'community' && (
                <div className="chat-section">
                  <p>Communities: Comm1, Comm2</p>
                  <p>Clusters: GroupA, GroupB</p>
                  <div className="chat-history">
                    {messages.filter(m => m.type === 'public').map(m => (
                      <div key={m.id} className={`message ${theme}`}>
                        <strong>{m.user}</strong> {m.text} <span>{new Date(m.timestamp).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <FaComment className={`chat-icon ${theme}`} title="Socialize" onClick={() => { setChatFriend('Community'); setIsChatOpen(true); }} />
                </div>
              )}
              {socialSubTab === 'private' && (
                <div className="chat-section">
                  <p>Connected Entities: Friend1, Friend2</p>
                  <div className="chat-history">
                    {messages.filter(m => m.type === 'private').map(m => (
                      <div key={m.id} className={`message ${theme}`}>
                        <strong>{m.user}</strong> {m.text} <span>{new Date(m.timestamp).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <FaComment className={`chat-icon ${theme}`} title="Talk to Friend" onClick={() => { setChatFriend('Friend1'); setIsChatOpen(true); }} />
                </div>
              )}
              {socialSubTab === 'story' && (
                <div>
                  <input value={storyContent} onChange={(e) => setStoryContent(e.target.value)} placeholder="Broadcast Story... (+10)" className={`futuristic-input ${theme}`} />
                  <button className="futuristic-btn" onClick={handleNewStory}>Transmit</button>
                </div>
              )}
            </div>
            <div className="social-footer">
              <div className="footer-item" onClick={() => setSocialSubTab('reels')}>
                <FaVideo className={`social-icon ${theme}`} />
                <span className={`footer-label ${theme}`}>Reels</span>
              </div>
              <div className="footer-item" onClick={() => setSocialSubTab('post')}>
                <FaPlusSquare className={`social-icon ${theme}`} />
                <span className={`footer-label ${theme}`}>Post</span>
              </div>
              <div className="footer-item" onClick={() => setSocialSubTab('public')}>
                <FaGlobe className={`social-icon ${theme}`} />
                <span className={`footer-label ${theme}`}>Public</span>
              </div>
              <div className="footer-item" onClick={() => setSocialSubTab('community')}>
                <FaUserFriends className={`social-icon ${theme}`} />
                <span className={`footer-label ${theme}`}>Community</span>
              </div>
              <div className="footer-item" onClick={() => setSocialSubTab('private')}>
                <FaLock className={`social-icon ${theme}`} />
                <span className={`footer-label ${theme}`}>Private</span>
              </div>
              <div className="footer-item" onClick={() => setSocialSubTab('story')}>
                <FaBookOpen className={`social-icon ${theme}`} />
                <span className={`footer-label ${theme}`}>Story</span>
              </div>
            </div>
          </div>
        )}
        {mode === 'stream' && (
          <div className={`unity-container ${theme}`}>
            <IoIosArrowBack className={`back-arrow ${theme}`} onClick={() => setMode(null)} />
            <h2>Stream</h2>
            <Unity unityProvider={unityProvider} style={{ width: '100%', height: '100%' }} />
          </div>
        )}
        {user && (
          <>
            <div ref={profilePanelRef} className={`slide-panel ${isPanelOpen ? 'open' : ''} ${theme}`}>
              <div className="panel-header">
                <button className={`futuristic-btn back-btn ${theme}`} onClick={() => setIsPanelOpen(false)}><IoIosArrowBack /></button>
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
                <input type="file" accept="image/*" onChange={handlePicUpload} className={`futuristic-input ${theme}`} />
                <h2>{displayName}</h2>
                <p>WC: {walletBalance.toFixed(2)} | Inf: {influence}</p>
                <div className="info-grid">
                  <div className={`info-item ${theme}`} onClick={() => setExpandedTab(expandedTab === 'wallet' ? null : 'wallet')}>
                    <span className="icon">W</span>
                    {expandedTab === 'wallet' && (
                      <div className={`info-details ${theme}`}>
                        <p>{walletBalance.toFixed(2)} WC</p>
                        <button className="futuristic-btn" onClick={handleSendWC}>Transmit</button>
                      </div>
                    )}
                  </div>
                  <div className={`info-item ${theme}`} onClick={() => setExpandedTab(expandedTab === 'assets' ? null : 'assets')}>
                    <span className="icon">A</span>
                    {expandedTab === 'assets' && <div className={`info-details ${theme}`}><p>1 Land</p></div>}
                  </div>
                </div>
                <button className="futuristic-btn" onClick={handleEditProfile}>Modify Identity</button>
                <button className="futuristic-btn" onClick={handleLogout}>Disconnect</button>
                <FaCog className={`gear-icon ${theme}`} onClick={() => console.log('Settings TBD')} />
              </div>
            </div>
            <div className={`feed-panel ${isFeedOpen ? 'open' : ''} ${theme}`}>
              <div className="feed-header">
                <button className={`futuristic-btn back-btn ${theme}`} onClick={() => setIsFeedOpen(false)}><IoIosArrowBack /></button>
              </div>
              <div className={`feed-content ${theme}`}>
                <input value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder="Transmit Thought... (+5)" className={`futuristic-input ${theme}`} />
                <button className="futuristic-btn" onClick={handleNewPost}><FaPaperPlane /></button>
                {posts.map(post => (
                  <div className={`post ${theme}`} key={post.id}>
                    <strong>{post.user}</strong> {post.text} <span>{new Date(post.timestamp).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            <div ref={chatPanelRef} className={`chat-panel ${isChatOpen ? 'open' : ''} ${theme}`}>
              <div className="chat-header">
                <button className={`futuristic-btn back-btn ${theme}`} onClick={() => setIsChatOpen(false)}><IoIosArrowBack /></button>
                <span>{chatFriend}</span>
              </div>
              <div className={`chat-content ${theme}`}>
                {messages.filter(m => m.to === chatFriend || m.user === chatFriend).map(msg => (
                  <div key={msg.id} className={`message ${msg.user === displayName ? 'sent' : 'received'} ${theme}`}>
                    <strong>{msg.user}</strong> {msg.text} <span>{new Date(msg.timestamp).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="chat-input">
                <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Transmit Message... (+3)" className={`futuristic-input ${theme}`} onKeyPress={(e) => e.key === 'Enter' && handleNewMessage()} />
                <button className="futuristic-btn" onClick={handleNewMessage}><FaPaperPlane /></button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );

  return (
    <div className="app-wrapper">
      <Routes>
        <Route path="/signup" element={signupPage} />
        <Route path="/login" element={loginPage} />
        <Route path="/" element={dashboardPage} />
      </Routes>
    </div>
  );
}

export default App;