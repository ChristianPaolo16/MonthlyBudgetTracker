import axios from './axios';

export const getDashboardSummary = (month, year) => {
  return axios.get('/dashboard/summary', { params: { month, year } });
};

export const getExpenseSummary = (year, month) => {
  return axios.get('/dashboard/expense-summary', { params: { year, month } });
};

export const getIncomeSummary = (year, month) => {
  return axios.get('/dashboard/income-summary', { params: { year, month } });
};

export const getMonthlyExpenses = () => {
  return axios.get('/dashboard/monthly-expenses');
};

export const getMonthlyIncome = () => {
  return axios.get('/dashboard/monthly-income');
};
