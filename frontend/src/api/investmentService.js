import axios from './axios';

const BASE = '/investments';

export const getInvestments = () => {
  return axios.get(BASE);
};

export const getInvestmentById = (id) => {
  return axios.get(`${BASE}/${id}`);
};

export const createInvestment = (data) => {
  return axios.post(BASE, data);
};

export const updateInvestment = (id, data) => {
  return axios.put(`${BASE}/${id}`, data);
};

export const deleteInvestment = (id) => {
  return axios.delete(`${BASE}/${id}`);
};
