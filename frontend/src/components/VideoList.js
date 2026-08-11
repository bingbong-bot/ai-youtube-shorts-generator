import React, { useState, useEffect } from 'react';
import { downloadVideo, cancelVideo, getVideoStatus } from '../services/api';

function VideoList({ videos, loading, onRefresh }) {
  const [expanding, setExpanding] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'status-success';
      case 'pending': return 'status-pending';
      case 'processing': return 'status-processing';
      case 'failed': return 'status-error';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✓';
      case 'processing': return '⏳';
      case 'pending': return '⏱';
      case 'failed': return '✗';
      case 'cancelled': return '⊗';
      default: return '?';
    }
  };

  const handleDownload = async (id) => {
    try {
      const result = await downloadVideo(id);
      // In a real app, this would trigger a file download
      alert(`Download URL: ${result.downloadUrl}`);
    } catch (err) {
      alert('Download failed: ' + err.message);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Cancel this video generation?')) {
      try {
        setDeleting(id);
        await cancelVideo(id);
        onRefresh();
      } catch (err) {
        alert('Failed to cancel: ' + err.message);
      } finally {
        setDeleting(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="video-list">
        <div className="loading">Loading videos...</div>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="video-list">
        <div className="empty-state">
          <p>No videos yet</p>
          <small>Create your first video to get started</small>
        </div>
      </div>
    );
  }

  return (
    <div className="video-list">
      <div className="list-header">
        <h2>Your Videos</h2>
        <button className="btn btn-secondary" onClick={onRefresh}>
          🔄 Refresh
        </button>
      </div>

      <div className="videos">
        {videos.map(video => (
          <div key={video.id} className="video-card">
            <div className="video-header">
              <div>
                <h3>{video.topic}</h3>
                <span className={`status ${getStatusColor(video.status)}`}>
                  {getStatusIcon(video.status)} {video.status}
                </span>
              </div>
              <div className="video-meta">
                <small>{new Date(video.created_at).toLocaleDateString()}</small>
              </div>
            </div>

            <div className="video-content">
              {video.script && (
                <div className="script-preview">
                  <p>{video.script.substring(0, 150)}...</p>
                </div>
              )}
              {video.duration && (
                <div className="duration">
                  Duration: {video.duration}s
                </div>
              )}
            </div>

            <div className="video-actions">
              {video.status === 'completed' && (
                <button 
                  className="btn btn-small btn-success"
                  onClick={() => handleDownload(video.id)}
                >
                  Download
                </button>
              )}
              {['pending', 'processing'].includes(video.status) && (
                <button 
                  className="btn btn-small btn-danger"
                  onClick={() => handleCancel(video.id)}
                  disabled={deleting === video.id}
                >
                  {deleting === video.id ? 'Cancelling...' : 'Cancel'}
                </button>
              )}
              <button 
                className="btn btn-small btn-secondary"
                onClick={() => setExpanding(expanding === video.id ? null : video.id)}
              >
                {expanding === video.id ? 'Hide' : 'Details'}
              </button>
            </div>

            {expanding === video.id && (
              <div className="video-details">
                <p><strong>ID:</strong> {video.id}</p>
                <p><strong>Status:</strong> {video.status}</p>
                <p><strong>Created:</strong> {new Date(video.created_at).toLocaleString()}</p>
                {video.error_message && (
                  <p><strong>Error:</strong> {video.error_message}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default VideoList;
