import React from 'react';
import { auth } from '../../firebase';

const ProfileModal = ({ showProfileModal, setShowProfileModal, selectedUser }) => {
  return (
    showProfileModal && (
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
          onClick={() => auth.signOut().then(() => (window.location.href = '/'))}
        >
          Sign Out
        </button>
      </div>
    )
  );
};

export default ProfileModal;