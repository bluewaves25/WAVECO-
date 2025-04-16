import React, { useState, useEffect } from 'react';
import { db } from '/src/firebase.js';
import { collection, onSnapshot } from 'firebase/firestore';
import '../../styles/ExploreTab/Scout.css';
import { FaEllipsisV } from 'react-icons/fa';

function Scout({ theme, user }) {
  const [videos, setVideos] = useState([]);
  const [preferences, setPreferences] = useState({ genres: [], duration: 'all', watchHistory: [] });
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db) {
      setError('Database not initialized');
      setLoading(false);
      return;
    }
    setLoading(true);
    let unsubscribe;
    try {
      unsubscribe = onSnapshot(collection(db, 'videos'), (snapshot) => {
        const fetchedVideos = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            url: data.url || '',
            title: data.title || 'Untitled',
            creator: data.creator || 'Unknown',
            views: data.views || 0,
            genres: Array.isArray(data.genres) ? data.genres : [],
            tags: Array.isArray(data.tags) ? data.tags : []
          };
        });
        setVideos(fetchedVideos);
        setLoading(false);
        localStorage.setItem('cachedVideos', JSON.stringify(fetchedVideos));
      }, (err) => {
        console.error('Scout Videos Error:', err.code, err.message);
        setError('Failed to load videos');
        setLoading(false);
      });
    } catch (err) {
      console.error('Snapshot Setup Error:', err);
      setError('Setup failed');
      setLoading(false);
    }
    return () => unsubscribe && unsubscribe();
  }, []);

  const aiSuggestions = videos.filter(v => {
    const matchesGenres = preferences.genres.length ? preferences.genres.some(g => v.genres.includes(g)) : true;
    const matchesHistory = preferences.watchHistory.length ? v.tags.some(t => preferences.watchHistory.includes(t)) : true;
    return matchesGenres && matchesHistory;
  }).sort(() => Math.random() - 0.5);

  const trendingVideos = videos.filter(v => v.views > 1000).slice(0, 3);

  const handlePreferenceUpdate = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const generatePlaylist = () => {
    alert('Generating "For You" playlist...');
    const newTags = aiSuggestions.slice(0, 2).map(v => v.tags[0]).filter(Boolean);
    setTimeout(() => handlePreferenceUpdate('watchHistory', [...new Set([...preferences.watchHistory, ...newTags])]), 86400000);
  };

  if (error) {
    return <div className="scout-tab"><p>Error: {error}</p></div>;
  }

  return (
    <div className="scout-tab">
      <div className="scout-settings">
        <button onClick={() => setShowSettings(!showSettings)} aria-label="Settings">
          <FaEllipsisV />
        </button>
        {showSettings && (
          <div className="settings-panel">
            <h4>Video Preferences</h4>
            <div>
              <label>Genres</label>
              <select multiple onChange={e => handlePreferenceUpdate('genres', Array.from(e.target.selectedOptions, o => o.value))}>
                <option value="music">Music</option>
                <option value="gaming">Gaming</option>
                <option value="education">Education</option>
                <option value="lifestyle">Lifestyle</option>
              </select>
            </div>
            <div>
              <label>Duration</label>
              <select onChange={e => handlePreferenceUpdate('duration', e.target.value)}>
                <option value="all">All</option>
                <option value="short">Short (less than 1 min)</option>
                <option value="medium">Medium (1-5 min)</option>
                <option value="long">Long (over 5 min)</option>
              </select>
            </div>
            <div>
              <label>Accessibility</label>
              <input type="checkbox" onChange={e => handlePreferenceUpdate('highContrast', e.target.checked)} /> High Contrast
            </div>
            <div>
              <label>AI Playlist</label>
              <button onClick={generatePlaylist}>Create "For You" Playlist</button>
            </div>
          </div>
        )}
      </div>
      {loading ? (
        <p>Loading videos...</p>
      ) : (
        <>
          <div className="scout-trending">
            <h4>Trending</h4>
            {trendingVideos.length ? trendingVideos.map(video => (
              <div key={video.id} className="scout-video">
                <video src={video.url} controls className="scout-video-player" aria-label={video.title} />
                <div className="video-info">
                  <h4>{video.title}</h4>
                  <p>{video.creator}</p>
                </div>
              </div>
            )) : <p>No trending videos.</p>}
          </div>
          <div className="scout-feed">
            <h4>Your AI Feed</h4>
            {aiSuggestions.length ? aiSuggestions.map(video => (
              <div key={video.id} className="scout-video">
                <video src={video.url} controls className="scout-video-player" aria-label={video.title} />
                <div className="video-info">
                  <h4>{video.title}</h4>
                  <p>{video.creator}</p>
                </div>
              </div>
            )) : <p>No suggestions available.</p>}
          </div>
        </>
      )}
    </div>
  );
}

export default Scout;