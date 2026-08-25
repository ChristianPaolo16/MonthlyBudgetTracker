import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import FinancialCard from '../components/FinancialCard';
import { getDashboardSummary, getExpenseSummary, getIncomeSummary, getMonthlyExpenses } from '../api/dashboardService';

const COLORS = ['#c9a962', '#1a2332', '#2c3e50', '#34495e', '#27ae60', '#e74c3c', '#3498db', '#9b59b6', '#e67e22', '#1abc9c'];

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value || 0);
};

export default function DashboardPage() {
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, totalInvestments: 0, netSavings: 0 });
  const [expenseByCategory, setExpenseByCategory] = useState([]);
  const [incomeByCategory, setIncomeByCategory] = useState([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        const [summaryRes, expenseSumRes, incomeSumRes, monthlyRes] = await Promise.allSettled([
          getDashboardSummary(month, year),
          getExpenseSummary(year, month),
          getIncomeSummary(year, month),
          getMonthlyExpenses(),
        ]);

        if (summaryRes.status === 'fulfilled') {
          const s = summaryRes.value.data;
          setSummary({
            totalIncome: s.totalIncome || s.total_income || 0,
            totalExpenses: s.totalExpenses || s.total_expenses || 0,
            totalInvestments: s.totalInvestments || s.total_investments || 0,
            netSavings: s.netSavings || s.net_savings || 0,
          });
        }

        if (expenseSumRes.status === 'fulfilled') {
          const data = expenseSumRes.value.data;
          if (Array.isArray(data)) {
            setExpenseByCategory(data.map((d) => ({
              name: d.categoryName || d.name || d.category || 'Unknown',
              value: d.amount || d.total || 0,
            })));
          }
        }

        if (incomeSumRes.status === 'fulfilled') {
          const data = incomeSumRes.value.data;
          if (Array.isArray(data)) {
            setIncomeByCategory(data.map((d) => ({
              name: d.categoryName || d.name || d.category || 'Unknown',
              value: d.amount || d.total || 0,
            })));
          }
        }

        if (monthlyRes.status === 'fulfilled') {
          const data = monthlyRes.value.data;
          if (Array.isArray(data)) {
            setMonthlyExpenses(data.map((d) => ({
              month: d.month || d.label || '',
              amount: d.amount || d.total || 0,
            })));
          }
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="page-loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard__cards">
        <FinancialCard
          icon="₱"
          value={formatCurrency(summary.totalIncome)}
          label="Total Income"
          color="success"
        />
        <FinancialCard
          icon="₱"
          value={formatCurrency(summary.totalExpenses)}
          label="Total Expenses"
          color="danger"
        />
        <FinancialCard
          icon="₱"
          value={formatCurrency(summary.netSavings)}
          label="Net Savings"
          color="primary"
        />
        <FinancialCard
          icon="₱"
          value={formatCurrency(summary.totalInvestments)}
          label="Total Investments"
          color="gold"
        />
      </div>

      <div className="dashboard__charts">
        <div className="chart-card">
          <h3 className="chart-card__title">Expenses by Category</h3>
          {expenseByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={55}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: '#999' }}
                >
                  {expenseByCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-card__empty">No expense data available</div>
          )}
        </div>

        <div className="chart-card">
          <h3 className="chart-card__title">Income by Category</h3>
          {incomeByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={incomeByCategory}
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={55}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: '#999' }}
                >
                  {incomeByCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-card__empty">No income data available</div>
          )}
        </div>
      </div>

      <div className="dashboard__charts">
        <div className="chart-card chart-card--full">
          <h3 className="chart-card__title">Monthly Expense Trend</h3>
          {monthlyExpenses.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={monthlyExpenses} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" />
                <XAxis dataKey="month" tick={{ fontSize: 13, fill: '#2c3e50' }} />
                <YAxis tick={{ fontSize: 13, fill: '#2c3e50' }} tickFormatter={(v) => `₱${v}`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="amount" fill="#c9a962" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-card__empty">No monthly data available</div>
          )}
        </div>
      </div>
    </div>
  );
}
