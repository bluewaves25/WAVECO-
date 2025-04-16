import React, { useState, useEffect } from 'react';
import { db } from '/src/firebase.js';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';
import '../../styles/ExploreTab/Live.css';
import { FaHeart, FaComment, FaShare, FaGift, FaStar, FaThumbsUp, FaSmile } from 'react-icons/fa';

function Live({ theme, user }) {
  const [videos, setVideos] = useState([]);
  const [pinnedComment, setPinnedComment] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, 'videos'), (snapshot) => {
      const fetchedVideos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        peakViewers: doc.data().viewers || 0,
        engagementRate: doc.data().reactions ? Object.values(doc.data().reactions).reduce((a, b) => a + b, 0) : 0
      }));
      setVideos(fetchedVideos.filter(v => v.isLive));
      setLoading(false);
      localStorage.setItem('cachedLiveVideos', JSON.stringify(fetchedVideos));
    }, (error) => {
      console.error('Live Videos Error:', error.code, error.message);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleInteraction = async (videoId, type, value) => {
    try {
      await addDoc(collection(db, 'live_interactions'), {
        videoId, type, value, userId: user.uid, timestamp: new Date()
      });
      if (type === 'comment' && confirm('Pin this comment?')) {
        setPinnedComment(prev => ({ ...prev, [videoId]: value }));
      }
    } catch (error) {
      console.error('Live Interaction Error:', error);
    }
  };

  return (
    <div className="live-tab">
      {loading ? (
        <p>Loading live videos...</p>
      ) : videos.length ? videos.map(video => (
        <div key={video.id} className="live-video">
          <video src={video.url || ''} autoPlay muted loop className="live-video-player" aria-label={video.title || 'Live video'} />
          <div className="live-tools">
            <button onClick={() => handleInteraction(video.id, 'comment', prompt('Enter comment'))} aria-label="Comment">
              <FaComment /> Comment
            </button>
            <button onClick={() => handleInteraction(video.id, 'reaction', 'heart')} aria-label="Heart reaction">
              <FaHeart /> {video.reactions?.heart || 0}
            </button>
            <button onClick={() => handleInteraction(video.id, 'reaction', 'star')} aria-label="Star reaction">
              <FaStar /> {video.reactions?.star || 0}
            </button>
            <button onClick={() => handleInteraction(video.id, 'reaction', 'clap')} aria-label="Clap reaction">
              <FaThumbsUp /> {video.reactions?.clap || 0}
            </button>
            <button onClick={() => handleInteraction(video.id, 'reaction', 'laugh')} aria-label="Laugh reaction">
              <FaSmile /> {video.reactions?.laugh || 0}
            </button>
            <button onClick={() => handleInteraction(video.id, 'gift', 'random')} aria-label="Send gift">
              <FaGift /> Gift
            </button>
            <button onClick={() => handleInteraction(video.id, 'share', 'external')} aria-label="Share">
              <FaShare /> Share
            </button>
          </div>
          <div className="live-overlay">
            <span>{video.viewers || 0} watching (Peak: {video.peakViewers})</span>
            <span>Engagement: {video.engagementRate}</span>
            <span>{video.title || 'Untitled'}</span>
          </div>
          {pinnedComment[video.id] && (
            <div className="pinned-comment">
              <span>Pinned: {pinnedComment[video.id]}</span>
            </div>
          )}
        </div>
      )) : <p>No live videos available.</p>}
    </div>
  );
}

export default Live;