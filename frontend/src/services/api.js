import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  response => response.data,
  error => {
    const message = error.response?.data?.error || error.message;
    return Promise.reject(new Error(message));
  }
);

export const createVideo = (topic, style = 'entertainment') => {
  return apiClient.post('/videos', { topic, style });
};

export const getVideos = (page = 1, limit = 10) => {
  return apiClient.get('/videos', { params: { page, limit } });
};

export const getVideo = (id) => {
  return apiClient.get(`/videos/${id}`);
};

export const getVideoStatus = (id) => {
  return apiClient.get(`/videos/${id}/status`);
};

export const downloadVideo = (id) => {
  return apiClient.get(`/videos/${id}/download`);
};

export const cancelVideo = (id) => {
  return apiClient.delete(`/videos/${id}`);
};

export const checkHealth = () => {
  return apiClient.get('/health');
};

export default apiClient;
