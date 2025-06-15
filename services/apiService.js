import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchTasks = async (page = 1, limit = 10) => {
  try {
    const response = await API.get(`/tasks?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch tasks');
  }
};

export const createTask = async (taskData) => {
  try {
    const response = await API.post('/tasks', taskData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create task');
  }
};