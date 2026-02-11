import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, ArrowLeft, Eye, EyeOff, Lock, Mail } from 'lucide-react'; // Changed Shield to User
import { useAppContext } from '../context/AppContext';
import authService from '../services/authService';

// ... (Interface declarations remain the same) ...

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useAppContext();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = (await authService.login(email, password)) as LoginResponse;

      if (!data.user || !data.token) {
        setError('Invalid server response.');
        return;
      }

      console.log("User data received on login:", data.user);

      if (data.user.role !== 'admin') {
        setError('Access denied. Not an authorized administrator.');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user._id);
      dispatch({ type: 'SET_CURRENT_USER', payload: data.user });

      if (data.user.category === 'SuperAdmin') {
        navigate('/superadmin-dashboard');
      } else {
        navigate('/admin-dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background (Remains Dark Purple for security/aesthetics) */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-indigo-900 to-slate-900" />
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 via-pink-600/20 to-indigo-600/20" />
      
      {/* Animated Shapes (Remain the same) */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Back Button (Against dark background, use light color) */}
          <Link
            to="/"
            className="inline-flex items-center text-purple-300 hover:text-purple-200 mb-8 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          {/* Login Card - Solid White Background */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
            {/* Icon - CHANGED: Used <User /> instead of <Shield /> */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl blur-xl opacity-50 animate-pulse" />
                <div className="relative bg-gradient-to-br from-purple-500 to-indigo-600 w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="w-10 h-10 text-white" /> {/* Changed Shield to User */}
                </div>
              </div>
            </div>

            {/* Title - Dark Text for contrast on white background */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Admin Portal</h2>
              <p className="text-gray-600">Access your administrative dashboard</p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Input - Dark Text, Solid Light Background */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    // Changed background to solid light gray and text to dark
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-100 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                    placeholder="admin@iiitkottayam.ac.in"
                    required
                  />
                </div>
              </div>

              {/* Password Input - Dark Text, Solid Light Background */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    // Changed background to solid light gray and text to dark
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-100 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-500 hover:text-purple-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message - Adjusted for light card background */}
              {error && (
                <div className="bg-red-100 border border-red-400 rounded-xl p-3">
                  <p className="text-red-700 text-sm text-center">{error}</p>
                </div>
              )}

              {/* Submit Button (Remains purple gradient) */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Access Dashboard'
                )}
              </button>
            </form>

            {/* Footer Text - Dark text for white background */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Secure admin access only
              </p>
            </div>
          </div>

          {/* Security Badge (Against dark page background, remains light text) */}
          <div className="mt-6 text-center">
            <p className="text-xs text-purple-300 flex items-center justify-center gap-2">
              <Lock className="w-3 h-3" />
              Your connection is encrypted and secure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;