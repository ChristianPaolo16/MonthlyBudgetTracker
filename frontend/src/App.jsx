import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ExpenseCategoriesPage from './pages/ExpenseCategoriesPage';
import IncomeCategoriesPage from './pages/IncomeCategoriesPage';
import AccountsPage from './pages/AccountsPage';
import ExpensesPage from './pages/ExpensesPage';
import IncomePage from './pages/IncomePage';
import InvestmentsPage from './pages/InvestmentsPage';
import BudgetGoalsPage from './pages/BudgetGoalsPage';
import './App.css';

function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<ProtectedLayout><DashboardPage /></ProtectedLayout>} />
          <Route path="/expenses" element={<ProtectedLayout><ExpensesPage /></ProtectedLayout>} />
          <Route path="/income" element={<ProtectedLayout><IncomePage /></ProtectedLayout>} />
          <Route path="/accounts" element={<ProtectedLayout><AccountsPage /></ProtectedLayout>} />
          <Route path="/expense-categories" element={<ProtectedLayout><ExpenseCategoriesPage /></ProtectedLayout>} />
          <Route path="/income-categories" element={<ProtectedLayout><IncomeCategoriesPage /></ProtectedLayout>} />
          <Route path="/investments" element={<ProtectedLayout><InvestmentsPage /></ProtectedLayout>} />
          <Route path="/budget-goals" element={<ProtectedLayout><BudgetGoalsPage /></ProtectedLayout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
