import React, { useState, useEffect, useRef, memo } from 'react';
import { collection, getDocs, onSnapshot, query, orderBy, getDoc, doc, updateDoc, addDoc, increment } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import ProfilePanel from '../Profile/ProfilePanel';
import Header from './Header';
import Nav from './Nav';
import Footer from './Footer';
import WalletPopup from './WalletPopup';
import ProfileModal from './ProfileModal';
import MainContent from './MainContent';
import '../../styles/App.css';
import '../../styles/Dashboard.css';
import '../../styles/Socials.css';
import '../../styles/Chat.css';
import '../../styles/Market.css';
import '../../styles/Profile.css';

const Dashboard = ({ user, theme, setTheme, initialSection = 'Socials' }) => {
  const [activeSection, setActiveSection] = useState(initialSection);
  const [activeTab, setActiveTab] = useState('Chats');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [posts, setPosts] = useState([]);
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
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isChatsScrolled, setIsChatsScrolled] = useState(false);
  const fileInputRef = useRef(null);
  const notificationRef = useRef(null);
  const mainRef = useRef(null);

  useEffect(() => {
    if (!user || !user.uid) {
      window.location.href = '/';
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
  }, [user]);

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
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!mainRef.current) return;
      const scrollTop = mainRef.current.scrollTop;
      setIsHeaderVisible(scrollTop <= 0);
      if (activeSection === 'Socials' && activeTab === 'Chats') {
        setIsChatsScrolled(scrollTop > 50);
      }
    };

    const handleMouseMove = (e) => {
      if (e.clientY <= 50) {
        setIsHeaderVisible(true);
      }
    };

    const mainElement = mainRef.current;
    if (mainElement) {
      mainElement.addEventListener('scroll', handleScroll);
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (mainElement) {
        mainElement.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [activeSection, activeTab]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

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

  return (
    <div className={`app ${theme}`}>
      <div className="dashboard-container">
        <Header
          theme={theme}
          toggleTheme={toggleTheme}
          profilePic={profilePic}
          setIsProfileOpen={setIsProfileOpen}
          notifications={notifications}
          isNotificationOpen={isNotificationOpen}
          setIsNotificationOpen={setIsNotificationOpen}
          setShowWalletPopup={setShowWalletPopup}
          notificationRef={notificationRef}
          isHeaderVisible={isHeaderVisible}
        />
        <Nav activeSection={activeSection} handleSectionClick={handleSectionClick} isChatsScrolled={isChatsScrolled} />
        <MainContent
          activeSection={activeSection}
          user={user}
          userData={userData}
          users={users}
          setActiveSection={setActiveSection}
          handleUserClick={handleUserClick}
          posts={posts}
          theme={theme}
          mainRef={mainRef}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isChatsScrolled={isChatsScrolled}
          setIsChatsScrolled={setIsChatsScrolled}
        />
        <Footer
          activeSection={activeSection}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <ProfilePanel
          user={user}
          userData={userData}
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
        <ProfileModal
          showProfileModal={showProfileModal}
          setShowProfileModal={setShowProfileModal}
          selectedUser={selectedUser}
        />
        <WalletPopup
          showWalletPopup={showWalletPopup}
          setShowWalletPopup={setShowWalletPopup}
          walletBalance={walletBalance}
          walletAddress={walletAddress}
          isWalletLoading={isWalletLoading}
          handleWalletAction={handleWalletAction}
          recipient={recipient}
          setRecipient={setRecipient}
          amount={amount}
          setAmount={setAmount}
          transactionHistory={transactionHistory}
          user={user}
        />
      </div>
    </div>
  );
};

export default memo(Dashboard);