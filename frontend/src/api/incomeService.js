import axios from './axios';

const BASE = '/incomes';

export const getIncomes = (params) => {
  return axios.get(BASE, { params });
};

export const getIncomeById = (id) => {
  return axios.get(`${BASE}/${id}`);
};

export const createIncome = (data) => {
  return axios.post(BASE, data);
};

export const updateIncome = (id, data) => {
  return axios.put(`${BASE}/${id}`, data);
};

export const deleteIncome = (id) => {
  return axios.delete(`${BASE}/${id}`);
};
