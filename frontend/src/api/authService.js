import axios from './axios';

export const login = (credentials) => {
  return axios.post('/auth/login', credentials);
};

export const register = (userData) => {
  return axios.post('/auth/register', userData);
};

export const getCurrentUser = () => {
  return axios.get('/auth/me');
};
