import React, { useState, useEffect, useRef, memo } from 'react';
import {
  FaComments, FaDollarSign, FaBriefcase, FaShoppingCart, FaGamepad, FaGlobe,
} from 'react-icons/fa';
import { auth, db, storage } from '../../firebase';
import {
  collection, getDocs, onSnapshot, query, orderBy, getDoc, doc, updateDoc, addDoc, increment,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ProfilePanel from '../Profile/ProfilePanel';
import SocialsSection from '../Socials/SocialsSection';
import Header from './Header';
import '../../styles/App.css';
import '../../styles/Dashboard.css';
import '../../styles/Socials.css';
import '../../styles/Chat.css';
import '../../styles/Market.css';
import '../../styles/Profile.css';

const Dashboard = ({ user, navigate, theme, setTheme, initialSection = 'Socials' }) => {
  const [activeSection, setActiveSection] = useState(initialSection);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [profilePic, setProfilePic] = useState('https://via.placeholder.com/80');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showWalletPopup, setShowWalletPopup] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletAddress, setWalletAddress] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const fileInputRef = useRef(null);
  const notificationRef = useRef(null); // Added

  useEffect(() => {
    if (!user || !user.uid) {
      navigate('/');
      return;
    }
    const fetchData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setProfilePic(data.profilePic || 'https://via.placeholder.com/80');
        }

        const walletDoc = await getDoc(doc(db, 'wallets', user.uid));
        if (walletDoc.exists()) {
          const walletData = walletDoc.data();
          setWalletBalance(walletData.balance || 0);
          setWalletAddress(walletData.address || user.uid);
        }

        const transactionsSnapshot = await getDocs(
          query(collection(db, 'transactions'), orderBy('timestamp', 'desc'))
        );
        setTransactionHistory(
          transactionsSnapshot.docs
            .filter((doc) => doc.data().from === user.uid || doc.data().to === user.uid)
            .map((doc) => ({ id: doc.id, ...doc.data() }))
        );

        const usersSnapshot = await getDocs(collection(db, 'users'));
        setUsers(usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

        const groupsSnapshot = await getDocs(collection(db, 'groups'));
        setGroups(groupsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

        const postsSnapshot = await getDocs(collection(db, 'posts'));
        setPosts(postsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Fetch error:', error.message);
      }
    };
    fetchData();
  }, [user, navigate]);

  useEffect(() => {
    if (!user || !user.uid) return;
    const q = query(collection(db, 'users', user.uid, 'notifications'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setNotifications(snapshot.docs.map((doc) => doc.data()));
      },
      (error) => console.error('Notifications snapshot error:', error.message)
    );
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleSectionClick = (section) => {
    setActiveSection(section);
    setIsProfileOpen(false);
    setShowWalletPopup(false);
    setIsNotificationOpen(false);
  };

  const handleUserClick = (u) => {
    setSelectedUser({
      username: u.fullName,
      avatar: u.profilePic || 'https://via.placeholder.com/60',
      about: u.hobbies || 'No bio',
      id: u.id,
      followers: u.followers || [],
      following: u.following || [],
    });
    setShowProfileModal(true);
    setIsNotificationOpen(false);
  };

  const validateUUID = (id) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  const handleWalletAction = async (action) => {
    setIsWalletLoading(true);
    try {
      switch (action) {
        case 'send':
          if (!recipient || !amount || amount <= 0 || amount > walletBalance) {
            alert('Invalid recipient or amount');
            return;
          }
          if (!validateUUID(recipient)) {
            alert('Invalid recipient address format');
            return;
          }
          const recipientDoc = await getDoc(doc(db, 'wallets', recipient));
          if (!recipientDoc.exists()) {
            alert('Recipient wallet does not exist');
            return;
          }
          const transaction = {
            from: user.uid,
            to: recipient,
            amount: parseFloat(amount),
            timestamp: new Date().toISOString(),
          };
          await Promise.all([
            updateDoc(doc(db, 'wallets', user.uid), { balance: walletBalance - parseFloat(amount) }),
            updateDoc(doc(db, 'wallets', recipient), { balance: increment(parseFloat(amount)) }),
            addDoc(collection(db, 'transactions'), transaction),
          ]);
          setWalletBalance((prev) => prev - parseFloat(amount));
          setTransactionHistory((prev) => [transaction, ...prev]);
          setRecipient('');
          setAmount('');
          alert('Sent successfully');
          break;
        case 'deposit':
          alert('Deposit initiated (redirect to payment gateway)');
          break;
        case 'receive':
          alert(`Your wallet address: ${walletAddress}`);
          break;
        case 'withdraw':
          alert('Withdraw initiated (redirect to withdrawal form)');
          break;
        case 'earn':
          setActiveSection('Earn');
          setShowWalletPopup(false);
          setIsNotificationOpen(false);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`${action} error:`, error.message);
      alert(`${action} failed`);
    } finally {
      setIsWalletLoading(false);
    }
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    try {
      const storageRef = ref(storage, `profilePics/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'users', user.uid), { profilePic: url });
      setProfilePic(url);
      setUserData((prev) => ({ ...prev, profilePic: url }));
    } catch (error) {
      console.error('Profile pic upload error:', error.message);
      alert('Failed to upload profile picture');
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'Socials':
        return (
          <div className="section-container">
            <SocialsSection
              user={user}
              userData={userData}
              users={users}
              setActiveSection={setActiveSection}
              handleUserClick={handleUserClick}
              hasPosts={posts.length > 0}
              posts={posts}
              theme={theme}
            />
          </div>
        );
      case 'Earn':
        return (
          <div className="section-container">
            <div className="content-area">
              <h3>Earn ZEST</h3>
              <p>Complete quests to earn rewards.</p>
            </div>
          </div>
        );
      case 'Work':
        return (
          <div className="section-container">
            <div className="content-area">
              <h3>Work Projects</h3>
              <p>Manage your tasks and collaborations.</p>
            </div>
          </div>
        );
      case 'Market':
        return (
          <div className="section-container">
            <div className="content-area">
              <h3>Market & Gallery</h3>
              <p>Browse items and artist showcases.</p>
            </div>
          </div>
        );
      case 'Arcade':
        return (
          <div className="section-container">
            <div className="content-area">
              <h3>Arcade & Vault</h3>
              <p>Play games and view NFTs.</p>
            </div>
          </div>
        );
      case 'Nexus':
        return (
          <div className="section-container">
            <div className="content-area">
              <h3>Nexus Hub</h3>
              <p>Access voice commands and network.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className={`app ${theme}`}>
      <div className="dashboard-container">
        <Header
          navigate={navigate}
          profilePic={profilePic}
          setProfilePic={setProfilePic}
          notifications={notifications}
          setIsProfileOpen={setIsProfileOpen}
          setShowWalletPopup={setShowWalletPopup}
          setIsNotificationOpen={setIsNotificationOpen}
          handleProfilePicUpload={handleProfilePicUpload}
          handleSectionClick={handleSectionClick}
          activeSection={activeSection}
        />
        <main className="dashboard-main">{renderSection()}</main>
      </div>
      <ProfilePanel
        user={user}
        userData={userData}
        navigate={navigate}
        theme={theme}
        setTheme={setTheme}
        profilePic={profilePic}
        setProfilePic={setProfilePic}
        isProfileOpen={isProfileOpen}
        setIsProfileOpen={setIsProfileOpen}
        walletBalance={walletBalance}
        walletAddress={walletAddress}
        transactionHistory={transactionHistory}
        setWalletBalance={setWalletBalance}
        setTransactionHistory={setTransactionHistory}
      />
      {showProfileModal && (
        <div className="profile-modal">
          <button className="profile-modal-close" onClick={() => setShowProfileModal(false)}>
            ✖
          </button>
          <div className="profile-modal-header">
            <img src={selectedUser.avatar} alt="avatar" className="profile-modal-avatar" />
            <span className="profile-modal-username">{selectedUser.username}</span>
          </div>
          <p className="profile-modal-about">{selectedUser.about}</p>
          <button
            className="sign-out-btn"
            onClick={() => auth.signOut().then(() => navigate('/'))}
          >
            Sign Out
          </button>
        </div>
      )}
      {showWalletPopup && walletAddress && (
        <div className="wallet-popup">
          <button className="wallet-close" onClick={() => setShowWalletPopup(false)}>
            ✖
          </button>
          <h3>Zest Wallet</h3>
          <p>Balance: {walletBalance} ZEST</p>
          <p>Address: {walletAddress.slice(0, 8)}...</p>
          <div className="wallet-actions">
            <button onClick={() => handleWalletAction('send')} disabled={isWalletLoading}>
              {isWalletLoading ? 'Processing...' : 'Send'}
            </button>
            <button onClick={() => handleWalletAction('deposit')} disabled={isWalletLoading}>
              {isWalletLoading ? 'Processing...' : 'Deposit'}
            </button>
            <button onClick={() => handleWalletAction('receive')} disabled={isWalletLoading}>
              {isWalletLoading ? 'Processing...' : 'Receive'}
            </button>
            <button onClick={() => handleWalletAction('withdraw')} disabled={isWalletLoading}>
              {isWalletLoading ? 'Processing...' : 'Withdraw'}
            </button>
            <button onClick={() => handleWalletAction('earn')} disabled={isWalletLoading}>
              {isWalletLoading ? 'Processing...' : 'Earn'}
            </button>
          </div>
          <div className="wallet-form">
            <input
              type="text"
              placeholder="Recipient Address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              disabled={isWalletLoading}
            />
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              disabled={isWalletLoading}
            />
          </div>
          <div className="wallet-history">
            <h4>Transaction History</h4>
            {transactionHistory.length > 0 ? (
              <ul>
                {transactionHistory.slice(0, 5).map((tx) => (
                  <li key={tx.id}>
                    {tx.from === user.uid ? 'Sent' : 'Received'} {tx.amount} ZEST
                    {tx.from === user.uid ? ' to ' : ' from '}
                    {tx.from === user.uid ? tx.to.slice(0, 8) : tx.from.slice(0, 8)}...
                    <br />
                    <small>{new Date(tx.timestamp).toLocaleString()}</small>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No transactions yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(Dashboard);