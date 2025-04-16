import React, { useEffect } from 'react';
import SocialsSection from '../Socials/SocialsSection';
import { FaAngleLeft } from 'react-icons/fa';
import '../../styles/Dashboard.css';

const MainContent = ({
  activeSection,
  user,
  userData,
  users,
  setActiveSection,
  handleUserClick,
  posts,
  theme,
  mainRef,
  activeTab,
  setActiveTab,
  isChatsScrolled,
  setIsChatsScrolled,
}) => {
  useEffect(() => {
    const handleScroll = () => {
      if (activeSection === 'Socials' && activeTab === 'Chats') {
        const scrollTop = mainRef.current.scrollTop;
        setIsChatsScrolled(scrollTop > 50);
      } else {
        setIsChatsScrolled(false);
      }
    };
    const mainElement = mainRef.current;
    mainElement.addEventListener('scroll', handleScroll);
    return () => mainElement.removeEventListener('scroll', handleScroll);
  }, [activeSection, activeTab, mainRef, setIsChatsScrolled]);

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
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isChatsScrolled={isChatsScrolled}
            />
          </div>
        );
      case 'Earn':
        return (
          <div className="section-container">
            <button
              className="back-button"
              onClick={() => setActiveSection('Socials')}
            >
              <FaAngleLeft /> Back
            </button>
            <div className="content-area">
              <h3>Earn ZEST</h3>
              <p>Complete quests to earn rewards.</p>
            </div>
          </div>
        );
      case 'Work':
        return (
          <div className="section-container">
            <button
              className="back-button"
              onClick={() => setActiveSection('Socials')}
            >
              <FaAngleLeft /> Back
            </button>
            <div className="content-area">
              <h3>Work Projects</h3>
              <p>Manage your tasks and collaborations.</p>
            </div>
          </div>
        );
      case 'Market':
        return (
          <div className="section-container">
            <button
              className="back-button"
              onClick={() => setActiveSection('Socials')}
            >
              <FaAngleLeft /> Back
            </button>
            <div className="content-area">
              <h3>Market & Gallery</h3>
              <p>Browse items and artist showcases.</p>
            </div>
          </div>
        );
      case 'Arcade':
        return (
          <div className="section-container">
            <button
              className="back-button"
              onClick={() => setActiveSection('Socials')}
            >
              <FaAngleLeft /> Back
            </button>
            <div className="content-area">
              <h3>Arcade & Vault</h3>
              <p>Play games and view NFTs.</p>
            </div>
          </div>
        );
      case 'Nexus':
        return (
          <div className="section-container">
            <button
              className="back-button"
              onClick={() => setActiveSection('Socials')}
            >
              <FaAngleLeft /> Back
            </button>
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

  return <main className="dashboard-main" ref={mainRef}>{renderSection()}</main>;
};

export default MainContent;