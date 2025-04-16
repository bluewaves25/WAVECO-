import React, { useState, useEffect } from 'react';
import { db } from '/src/firebase.js';
import { collection, onSnapshot } from 'firebase/firestore';
import '../../styles/ExploreTab/Find.css';
import { FaSearch, FaMicrophone } from 'react-icons/fa';

function Find({ theme }) {
  const [videos, setVideos] = useState([]);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, 'videos'), (snapshot) => {
      const fetchedVideos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        tags: doc.data().tags || [],
      }));
      setVideos(fetchedVideos);
      setLoading(false);
      localStorage.setItem('cachedFindVideos', JSON.stringify(fetchedVideos));
    }, (error) => {
      console.error('Find Videos Error:', error.code, error.message);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const tags = videos.flatMap(v => v.tags);
    setSuggestions([...new Set(tags)].slice(0, 5));
  }, [videos]);

  const aiSuggestedVideos = videos.filter(v =>
    search ? v.title?.toLowerCase().includes(search.toLowerCase()) || v.tags.includes(search) : true
  ).sort(() => Math.random() - 0.5);

  const handleVoiceSearch = () => {
    alert('Voice search activated (requires browser speech API support)');
  };

  return (
    <div className="find-tab">
      <div className="find-search">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search videos or hashtags..."
          aria-label="Search videos"
        />
        <button onClick={handleVoiceSearch} aria-label="Voice search">
          <FaMicrophone />
        </button>
        <button aria-label="Search">
          <FaSearch />
        </button>
      </div>
      <div className="find-suggestions-tags">
        {suggestions.map(tag => (
          <button key={tag} onClick={() => setSearch(tag)}>{tag}</button>
        ))}
      </div>
      <div className="find-suggestions">
        <h4>AI Suggested Videos</h4>
        {loading ? (
          <p>Loading videos...</p>
        ) : (
          <div className="suggestions-grid">
            {aiSuggestedVideos.length ? aiSuggestedVideos.map(video => (
              <div key={video.id} className="suggestion-video">
                <video src={video.url || ''} controls className="suggestion-video-player" aria-label={video.title || 'Video'} />
                <p>{video.title || 'Untitled'}</p>
                <p className="related-info">By {video.creator || 'Unknown'}</p>
              </div>
            )) : <p>No videos found.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default Find;