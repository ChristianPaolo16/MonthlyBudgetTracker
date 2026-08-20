import axios from './axios';

const BASE = '/income-categories';

export const getIncomeCategories = () => {
  return axios.get(BASE);
};

export const getIncomeCategoryById = (id) => {
  return axios.get(`${BASE}/${id}`);
};

export const createIncomeCategory = (data) => {
  return axios.post(BASE, data);
};

export const updateIncomeCategory = (id, data) => {
  return axios.put(`${BASE}/${id}`, data);
};

export const deleteIncomeCategory = (id) => {
  return axios.delete(`${BASE}/${id}`);
};
