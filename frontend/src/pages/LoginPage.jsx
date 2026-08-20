import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const result = await login(formData);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    setSubmitting(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <div className="auth-card__logo">MB</div>
          <h1 className="auth-card__title">Monthly Budget Tracker</h1>
          <p className="auth-card__subtitle">Sign in to your account</p>
        </div>
        <form className="auth-card__form" onSubmit={handleSubmit}>
          {error && <div className="auth-card__error">{error}</div>}
          <div className="form-field">
            <label className="form-field__label" htmlFor="username">Username</label>
            <input
              className="form-field__input"
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
              autoComplete="username"
            />
          </div>
          <div className="form-field">
            <label className="form-field__label" htmlFor="password">Password</label>
            <input
              className="form-field__input"
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>
          <button
            className="btn btn--primary btn--full"
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <div className="auth-card__footer">
          <p>
            Don&apos;t have an account?{' '}
            <Link to="/register" className="auth-card__link">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
