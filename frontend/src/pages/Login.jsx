/**
 * Login Page
 * Dedicated login page with form
 */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    username: '',
    password: ''
  });
  const [touched, setTouched] = useState({
    username: false,
    password: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: ''
      });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({
      ...touched,
      [name]: true
    });
    
    // Validate on blur
    if (!value.trim()) {
      setFieldErrors({
        ...fieldErrors,
        [name]: `${name === 'username' ? 'Username/Email' : 'Password'} is required`
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.username || !formData.password) {
      setError('All fields are required');
      return;
    }

    setLoading(true);

    try {
      // Determine if input is email or username
      const isEmail = formData.username.includes('@');
      const loginData = {
        password: formData.password,
        ...(isEmail ? { email: formData.username } : { username: formData.username })
      };

      const result = await login(loginData);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8 sm:p-10">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Welcome Back
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-base">Sign in to continue</p>
          </div>
        
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded-xl mb-6 font-medium flex items-center gap-2 animate-slideDown">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="animate-slideUp" style={{ animationDelay: '200ms' }}>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={loading}
                  className={`w-full pl-12 pr-4 py-3.5 border ${
                    touched.username && fieldErrors.username
                      ? 'border-red-500 dark:border-red-400'
                      : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400'
                  } bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 ${
                    touched.username && fieldErrors.username
                      ? 'focus:ring-red-500/20 dark:focus:ring-red-400/20'
                      : 'focus:ring-blue-500/20 dark:focus:ring-blue-400/20'
                  } disabled:opacity-50 transition-colors duration-200`}
                  placeholder="johndoe or john@example.com"
                />
                {touched.username && fieldErrors.username && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-red-500 dark:text-red-400 animate-fadeIn" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              {touched.username && fieldErrors.username && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-slideDown">
                  {fieldErrors.username}
                </p>
              )}
            </div>

            <div className="animate-slideUp" style={{ animationDelay: '300ms' }}>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={loading}
                  className={`w-full pl-12 pr-4 py-3.5 border ${
                    touched.password && fieldErrors.password
                      ? 'border-red-500 dark:border-red-400'
                      : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400'
                  } bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 ${
                    touched.password && fieldErrors.password
                      ? 'focus:ring-red-500/20 dark:focus:ring-red-400/20'
                      : 'focus:ring-blue-500/20 dark:focus:ring-blue-400/20'
                  } disabled:opacity-50 transition-colors duration-200`}
                  placeholder="••••••••"
                />
                {touched.password && fieldErrors.password && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-red-500 dark:text-red-400 animate-fadeIn" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              {touched.password && fieldErrors.password && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-slideDown">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-4 rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
