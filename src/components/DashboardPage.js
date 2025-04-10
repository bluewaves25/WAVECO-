import React from 'react';
import { FaSatelliteDish, FaSun, FaMoon, FaPaperPlane, FaChartLine, FaBriefcase, FaUsers, FaCog, FaBell, FaVideo, FaGlobe, FaUserFriends, FaLock, FaPlusSquare, FaSearch, FaBookOpen, FaComment } from 'react-icons/fa';
import { IoIosArrowBack } from 'react-icons/io';
import UnityComponent from './UnityComponent';
import ProfilePanel from './ProfilePanel';
import FeedPanel from './FeedPanel';
import ChatPanel from './ChatPanel';

const DashboardPage = ({
  theme, user, navigate, setActiveTab, setMode, activeTab, mode, profilePic, setIsPanelOpen, isPanelOpen, setIsFeedOpen, isFeedOpen, setIsChatOpen, isChatOpen,
  searchQuery, setSearchQuery, handleSearch, walletBalance, influence, handleTask, handleKnowledgeGame, socialSubTab, setSocialSubTab, searchResults,
  newPost, setNewPost, handleNewPost, posts, storyContent, setStoryContent, handleNewStory, messages, setChatFriend, notifications, displayName, newMessage,
  setNewMessage, handleNewMessage, chatFriend, setTheme, handlePicUpload, handleEditProfile, handleLogout, handleSendWC, expandedTab, setExpandedTab
}) => {
  const showBackButton = activeTab || mode;

  return (
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
              <img src={profilePic || '[A]'} alt="Profile" className="header-profile-pic" onClick={(e) => { e.stopPropagation(); setIsPanelOpen(true); }} />
            )}
          </div>
        )}
      </header>
      <main className="dashboard">
        {showBackButton && (
          <IoIosArrowBack className={`back-arrow ${theme}`} onClick={() => { setActiveTab(null); setMode(null); }} />
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
        {mode === 'stream' && <UnityComponent theme={theme} setMode={setMode} />}
        {user && (
          <>
            <ProfilePanel
              theme={theme}
              user={user}
              profilePic={profilePic}
              displayName={displayName}
              walletBalance={walletBalance}
              influence={influence}
              isPanelOpen={isPanelOpen}
              setIsPanelOpen={setIsPanelOpen}
              handlePicUpload={handlePicUpload}
              handleEditProfile={handleEditProfile}
              handleLogout={handleLogout}
              handleSendWC={handleSendWC}
              expandedTab={expandedTab}
              setExpandedTab={setExpandedTab}
              setTheme={setTheme}
            />
            <FeedPanel
              theme={theme}
              isFeedOpen={isFeedOpen}
              setIsFeedOpen={setIsFeedOpen}
              newPost={newPost}
              setNewPost={setNewPost}
              handleNewPost={handleNewPost}
              posts={posts}
            />
            <ChatPanel
              theme={theme}
              isChatOpen={isChatOpen}
              setIsChatOpen={setIsChatOpen}
              chatFriend={chatFriend}
              messages={messages}
              displayName={displayName}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              handleNewMessage={handleNewMessage}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;