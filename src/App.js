import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { useNavigate, Routes, Route } from 'react-router-dom';
import SignupPage from './components/SignupPage';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
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

  return (
    <div className="app-wrapper">
      <Routes>
        <Route path="/signup" element={
          <SignupPage
            theme={theme}
            navigate={navigate}
            setRealName={setRealName}
            setUsername={setUsername}
            setGender={setGender}
            setDob={setDob}
            setCountry={setCountry}
            setEmail={setEmail}
            setPassword={setPassword}
            handleSignup={handleSignup}
            handleGoogleSignup={handleGoogleSignup}
            realName={realName}
            username={username}
            gender={gender}
            dob={dob}
            country={country}
            email={email}
            password={password}
          />
        } />
        <Route path="/login" element={
          <LoginPage
            theme={theme}
            navigate={navigate}
            setEmail={setEmail}
            setPassword={setPassword}
            handleLogin={handleLogin}
            handleGoogleSignup={handleGoogleSignup}
            handleForgotPassword={handleForgotPassword}
            email={email}
            password={password}
          />
        } />
        <Route path="/" element={
          <DashboardPage
            theme={theme}
            user={user}
            navigate={navigate}
            setActiveTab={setActiveTab}
            setMode={setMode}
            activeTab={activeTab}
            mode={mode}
            profilePic={profilePic}
            setIsPanelOpen={setIsPanelOpen}
            isPanelOpen={isPanelOpen}
            setIsFeedOpen={setIsFeedOpen}
            isFeedOpen={isFeedOpen}
            setIsChatOpen={setIsChatOpen}
            isChatOpen={isChatOpen}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
            walletBalance={walletBalance}
            influence={influence}
            handleTask={handleTask}
            handleKnowledgeGame={handleKnowledgeGame}
            socialSubTab={socialSubTab}
            setSocialSubTab={setSocialSubTab}
            searchResults={searchResults}
            newPost={newPost}
            setNewPost={setNewPost}
            handleNewPost={handleNewPost}
            posts={posts}
            storyContent={storyContent}
            setStoryContent={setStoryContent}
            handleNewStory={handleNewStory}
            messages={messages}
            setChatFriend={setChatFriend}
            notifications={notifications}
            displayName={displayName}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleNewMessage={handleNewMessage}
            chatFriend={chatFriend}
            setTheme={setTheme}
            handlePicUpload={handlePicUpload}
            handleEditProfile={handleEditProfile}
            handleLogout={handleLogout}
            handleSendWC={handleSendWC}
            expandedTab={expandedTab}
            setExpandedTab={setExpandedTab}
          />
        } />
      </Routes>
    </div>
  );
}

export default App;