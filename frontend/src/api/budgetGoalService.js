import axios from './axios';

const BASE = '/budget-goals';

export const getBudgetGoals = (params) => {
  return axios.get(BASE, { params });
};

export const getBudgetGoalById = (id) => {
  return axios.get(`${BASE}/${id}`);
};

export const createBudgetGoal = (data) => {
  return axios.post(BASE, data);
};

export const updateBudgetGoal = (id, data) => {
  return axios.put(`${BASE}/${id}`, data);
};

export const deleteBudgetGoal = (id) => {
  return axios.delete(`${BASE}/${id}`);
};
