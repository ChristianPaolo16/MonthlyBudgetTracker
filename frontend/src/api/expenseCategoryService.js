import axios from './axios';

const BASE = '/expense-categories';

export const getExpenseCategories = () => {
  return axios.get(BASE);
};

export const getExpenseCategoryById = (id) => {
  return axios.get(`${BASE}/${id}`);
};

export const createExpenseCategory = (data) => {
  return axios.post(BASE, data);
};

export const updateExpenseCategory = (id, data) => {
  return axios.put(`${BASE}/${id}`, data);
};

export const deleteExpenseCategory = (id) => {
  return axios.delete(`${BASE}/${id}`);
};
