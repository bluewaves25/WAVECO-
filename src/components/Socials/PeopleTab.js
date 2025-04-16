import React, { useState, useEffect, useRef } from 'react';
import { FaAngleLeft, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { RiEmojiStickerLine } from 'react-icons/ri';
import { AiOutlineAudio } from 'react-icons/ai';
import '../../styles/Socials.css';

const PeopleTab = ({ users, user, searchQuery, setSearchQuery, handleUserClick }) => {
  const [isListening, setIsListening] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [scrollDirection, setScrollDirection] = useState('down');
  const scrollRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 50;
      const atTop = scrollTop <= 50;
      setShowScrollButton(!atBottom || !atTop);
      setScrollDirection(atBottom ? 'up' : 'down');
    };
    scrollRef.current?.addEventListener('scroll', handleScroll);
    return () => scrollRef.current?.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAudioInput = () => {
    setIsListening(!isListening);
    if (!isListening) {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = 'en-US';
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery((prev) => prev + transcript);
      };
      recognition.start();
      recognition.onend = () => setIsListening(false);
    }
  };

  const handleGrok = () => {
    console.log('Grok assistance:', searchQuery); // Replace with Grok API
  };

  const scrollToEdge = () => {
    if (scrollDirection === 'down') {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    } else {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="socials-tab-content people-tab">
      <div className="tab-header">
        <button className="back-button">
          <FaAngleLeft />
        </button>
        <h3>People</h3>
      </div>
      <div className="search-bar">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search people..."
          className="futuristic-input"
        />
        <div className="input-actions">
          <RiEmojiStickerLine className="emoji-icon" />
          <AiOutlineAudio
            className={`audio-icon ${isListening ? 'active' : ''}`}
            onClick={handleAudioInput}
          />
          <button onClick={handleGrok} className="grok-btn">Grok</button>
        </div>
      </div>
      <div className="user-list" ref={scrollRef}>
        {users
          .filter((u) => u.id !== user.uid && u.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((u) => (
            <div key={u.id} className="user-item" onClick={() => handleUserClick(u)}>
              <img
                src={u.profilePic || 'https://via.placeholder.com/40'}
                alt={`${u.fullName}'s avatar`}
                className="user-avatar"
              />
              <span>{u.fullName}</span>
            </div>
          ))}
        {showScrollButton && (
          <button
            className={`scroll-button ${scrollDirection}`}
            onClick={scrollToEdge}
          >
            {scrollDirection === 'up' ? <FaArrowUp /> : <FaArrowDown />}
          </button>
        )}
      </div>
    </div>
  );
};

export default PeopleTab;