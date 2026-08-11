import React, { useState, useEffect } from 'react';
import './App.css';
import VideoForm from './components/VideoForm';
import VideoList from './components/VideoList';
import { getVideos } from './services/api';

function App() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('create');

  useEffect(() => {
    if (activeTab === 'list') {
      fetchVideos();
    }
  }, [activeTab]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getVideos();
      setVideos(data.videos || []);
    } catch (err) {
      setError('Failed to fetch videos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoCreated = () => {
    setActiveTab('list');
    fetchVideos();
  };

  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <h1>🎬 AI YouTube Shorts Generator</h1>
          <p className="tagline">Create viral shorts in minutes with AI</p>
        </div>
      </header>

      <nav className="tabs">
        <button 
          className={`tab ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Create New
        </button>
        <button 
          className={`tab ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          My Videos
        </button>
      </nav>

      <main className="container">
        {error && <div className="alert alert-error">{error}</div>}

        {activeTab === 'create' && (
          <VideoForm onVideoCreated={handleVideoCreated} />
        )}

        {activeTab === 'list' && (
          <VideoList videos={videos} loading={loading} onRefresh={fetchVideos} />
        )}
      </main>

      <footer className="footer">
        <p>&copy; 2026 AI YouTube Shorts Generator. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
