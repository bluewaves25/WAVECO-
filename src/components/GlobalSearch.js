import React, { useState } from 'react';
import { RiEmojiStickerLine } from 'react-icons/ri';
import { AiOutlineAudio } from 'react-icons/ai';
import '../styles/GlobalSearch.css';

const GlobalSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);

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
    console.log('Grok search:', searchQuery); // Replace with Grok API
  };

  return (
    <div className="global-search">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search..."
        className="search-input"
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
  );
};

export default GlobalSearch;