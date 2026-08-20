import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    setError('');
    const { confirmPassword, ...payload } = formData;
    const result = await register(payload);
    if (result.success) {
      navigate('/login');
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
          <p className="auth-card__subtitle">Create a new account</p>
        </div>
        <form className="auth-card__form" onSubmit={handleSubmit}>
          {error && <div className="auth-card__error">{error}</div>}
          <div className="form-row">
            <div className="form-field">
              <label className="form-field__label" htmlFor="firstName">First Name</label>
              <input
                className="form-field__input"
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First name"
                required
              />
            </div>
            <div className="form-field">
              <label className="form-field__label" htmlFor="lastName">Last Name</label>
              <input
                className="form-field__input"
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last name"
                required
              />
            </div>
          </div>
          <div className="form-field">
            <label className="form-field__label" htmlFor="email">Email Address</label>
            <input
              className="form-field__input"
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-field">
            <label className="form-field__label" htmlFor="username">Username</label>
            <input
              className="form-field__input"
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              required
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
              placeholder="Create a password"
              required
              minLength={6}
            />
          </div>
          <div className="form-field">
            <label className="form-field__label" htmlFor="confirmPassword">Confirm Password</label>
            <input
              className="form-field__input"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
              minLength={6}
            />
          </div>
          <button
            className="btn btn--primary btn--full"
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div className="auth-card__footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-card__link">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
