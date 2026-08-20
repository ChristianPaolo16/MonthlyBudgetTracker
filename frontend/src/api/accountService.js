import axios from './axios';

const BASE = '/accounts';

export const getAccounts = () => {
  return axios.get(BASE);
};

export const getAccountById = (id) => {
  return axios.get(`${BASE}/${id}`);
};

export const createAccount = (data) => {
  return axios.post(BASE, data);
};

export const updateAccount = (id, data) => {
  return axios.put(`${BASE}/${id}`, data);
};

export const deleteAccount = (id) => {
  return axios.delete(`${BASE}/${id}`);
};
