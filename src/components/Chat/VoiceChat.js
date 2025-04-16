import React from 'react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import '../../styles/chat/VoiceChat.css';

function VoiceChat({ isCallActive }) {
  return (
    <div className="voice-chat">
      {isCallActive && (
        <div className="voice-control">
          <button>
            <FaMicrophone />
          </button>
          <div className="speaker-dot"></div>
        </div>
      )}
    </div>
  );
}

export default VoiceChat;