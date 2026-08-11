import React, { useState } from 'react';
import { createVideo } from '../services/api';

function VideoForm({ onVideoCreated }) {
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('entertainment');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await createVideo(topic, style);
      
      setSuccess(true);
      setTopic('');
      setStyle('entertainment');
      
      if (onVideoCreated) {
        setTimeout(onVideoCreated, 1500);
      }
    } catch (err) {
      setError('Failed to create video: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Create New Video</h2>
      
      {success && (
        <div className="alert alert-success">
          ✓ Video creation started! Redirecting to your videos...
        </div>
      )}
      
      {error && (
        <div className="alert alert-error">
          ✗ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="video-form">
        <div className="form-group">
          <label htmlFor="topic">What's your video about?</label>
          <input
            id="topic"
            type="text"
            placeholder="e.g., How to make the perfect coffee"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={loading}
            required
            maxLength={200}
          />
          <small>{topic.length}/200 characters</small>
        </div>

        <div className="form-group">
          <label htmlFor="style">Video Style</label>
          <select
            id="style"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            disabled={loading}
          >
            <option value="entertainment">Entertainment</option>
            <option value="educational">Educational</option>
            <option value="promotional">Promotional</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'Creating...' : 'Generate Video'}
        </button>
      </form>

      <div className="info-box">
        <h3>How it works:</h3>
        <ol>
          <li>Enter your video topic</li>
          <li>Our AI generates an engaging script</li>
          <li>Video is automatically created with visuals</li>
          <li>Download and share your short!</li>
        </ol>
        <p className="efficiency">Average generation time: 2-5 minutes</p>
      </div>
    </div>
  );
}

export default VideoForm;
