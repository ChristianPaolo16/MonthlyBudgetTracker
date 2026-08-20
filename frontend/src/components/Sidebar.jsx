import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '\u2302' },
  { path: '/expenses', label: 'Expenses', icon: '\u2796' },
  { path: '/income', label: 'Income', icon: '\u2795' },
  { path: '/accounts', label: 'Accounts', icon: '\u2630' },
  { path: '/expense-categories', label: 'Expense Categories', icon: '\u2691' },
  { path: '/income-categories', label: 'Income Categories', icon: '\u2605' },
  { path: '/investments', label: 'Investments', icon: '\u2197' },
  { path: '/budget-goals', label: 'Budget Goals', icon: '\u25C9' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <div className="sidebar__logo-icon">MB</div>
          {!collapsed && (
            <div className="sidebar__logo-text">
              <span className="sidebar__logo-title">BudgetTracker</span>
              <span className="sidebar__logo-subtitle">Finance Management</span>
            </div>
          )}
        </div>
        <button className="sidebar__toggle" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? '\u25B6' : '\u25C0'}
        </button>
      </div>

      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
            title={item.label}
          >
            <span className="sidebar__icon">{item.icon}</span>
            {!collapsed && <span className="sidebar__label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        {!collapsed && (
          <div className="sidebar__user">
            <div className="sidebar__avatar">
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">
                {user?.firstName
                  ? `${user.firstName} ${user.lastName || ''}`
                  : user?.username || 'User'}
              </span>
              <span className="sidebar__user-role">Account Holder</span>
            </div>
          </div>
        )}
        <button className="sidebar__logout" onClick={handleLogout} title="Logout">
          <span className="sidebar__icon">&#x2190;</span>
          {!collapsed && <span className="sidebar__label">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
