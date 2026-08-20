import axios from './axios';

const BASE = '/expenses';

export const getExpenses = (params) => {
  return axios.get(BASE, { params });
};

export const getExpenseById = (id) => {
  return axios.get(`${BASE}/${id}`);
};

export const createExpense = (data) => {
  return axios.post(BASE, data);
};

export const updateExpense = (id, data) => {
  return axios.put(`${BASE}/${id}`, data);
};

export const deleteExpense = (id) => {
  return axios.delete(`${BASE}/${id}`);
};
