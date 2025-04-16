import React, { useState, useEffect, useRef } from 'react';
import { FaAngleLeft, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { RiEmojiStickerLine } from 'react-icons/ri';
import { AiOutlineAudio } from 'react-icons/ai';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import '../../styles/Socials.css';

const BroadcastTab = ({ userData, newPost, setNewPost, handleNewPost }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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

  const handleEmojiSelect = (emoji) => {
    setNewPost((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const handleAudioInput = () => {
    setIsListening(!isListening);
    if (!isListening) {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = 'en-US';
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setNewPost((prev) => prev + transcript);
      };
      recognition.start();
      recognition.onend = () => setIsListening(false);
    }
  };

  const handleGrok = () => {
    console.log('Grok assistance:', newPost); // Replace with Grok API
  };

  const scrollToEdge = () => {
    if (scrollDirection === 'down') {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    } else {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="socials-tab-content broadcast-tab">
      <div className="tab-header">
        <button className="back-button">
          <FaAngleLeft />
        </button>
        <h3>Broadcast</h3>
      </div>
      <div className="post-list" ref={scrollRef}>
        <div className="post-compose">
          <textarea
            className="futuristic-input"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Broadcast a message..."
          />
          <div className="input-actions">
            <RiEmojiStickerLine
              className="emoji-icon"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            />
            <AiOutlineAudio
              className={`audio-icon ${isListening ? 'active' : ''}`}
              onClick={handleAudioInput}
            />
            <button onClick={handleGrok} className="grok-btn">Grok</button>
            <button className="post-btn" onClick={handleNewPost}>
              Post
            </button>
          </div>
        </div>
        {showScrollButton && (
          <button
            className={`scroll-button ${scrollDirection}`}
            onClick={scrollToEdge}
          >
            {scrollDirection === 'up' ? <FaArrowUp /> : <FaArrowDown />}
          </button>
        )}
      </div>
      {showEmojiPicker && (
        <div className="emoji-picker">
          <Picker data={data} onEmojiSelect={handleEmojiSelect} />
        </div>
      )}
    </div>
  );
};

export default BroadcastTab;