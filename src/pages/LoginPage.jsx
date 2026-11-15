import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle, Check, UserCheck } from 'lucide-react';
import Logo from '../components/common/Logo';
import ThemeSelector from '../components/common/ThemeSelector';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, resetPassword, continueAsGuest } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const formatAuthError = (err) => {
    const msg = err.message || '';
    if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password') || msg.includes('auth/user-not-found')) {
      return 'Invalid email or password. Please verify your credentials.';
    }
    if (msg.includes('auth/too-many-requests')) {
      return 'Too many failed login attempts. Please try again later or reset password.';
    }
    if (msg.includes('auth/network-request-failed')) {
      return 'Network error: please check your connection and try again.';
    }
    if (msg.includes('auth/invalid-email')) {
      return 'Please enter a valid email address.';
    }
    return msg || 'Login failed. Please verify credentials.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password, rememberMe);
      navigate('/workspace');
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Enter your email to receive a password reset link.');
      return;
    }
    try {
      await resetPassword(email);
      setForgotSent(true);
      setTimeout(() => setForgotSent(false), 5000);
    } catch (err) {
      setError(formatAuthError(err));
    }
  };

  const handleGuestAccess = () => {
    continueAsGuest();
    navigate('/workspace');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-softwhite dark:bg-obsidian-dark transition-colors px-4 py-6">
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <Logo size="md" to="/" />
        <ThemeSelector compact />
      </div>

      <div className="w-full max-w-md mx-auto my-8">
        <div className="rounded-2xl border border-platinum-200 dark:border-charcoal-border bg-white dark:bg-obsidian-card p-8 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-obsidian dark:text-softwhite tracking-tight">
              Welcome back
            </h1>
            <p className="text-xs text-platinum-500 dark:text-platinum-400 mt-1.5">
              Sign in with your email and password to access your coding sessions
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-center gap-2.5 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {forgotSent && (
            <div className="mb-5 p-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 flex items-center gap-2.5 text-xs text-green-600 dark:text-green-400">
              <Check className="w-4 h-4 shrink-0" />
              <span>Password reset email dispatched to {email}! Check inbox.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-obsidian dark:text-softwhite mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-platinum-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-platinum-200 dark:border-charcoal-border bg-platinum-50/50 dark:bg-charcoal/50 text-obsidian dark:text-softwhite text-xs placeholder:text-platinum-400 focus:outline-none focus:border-gold-metallic focus:ring-1 focus:ring-gold-metallic transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-obsidian dark:text-softwhite">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[11px] text-gold-metallic hover:underline focus:outline-none"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-platinum-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-platinum-200 dark:border-charcoal-border bg-platinum-50/50 dark:bg-charcoal/50 text-obsidian dark:text-softwhite text-xs placeholder:text-platinum-400 focus:outline-none focus:border-gold-metallic focus:ring-1 focus:ring-gold-metallic transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-platinum-400 hover:text-obsidian dark:hover:text-softwhite"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-platinum-300 text-gold-metallic focus:ring-gold-metallic bg-platinum-50 dark:bg-charcoal cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 text-xs text-platinum-500 dark:text-platinum-300 cursor-pointer">
                  Remember me
                </label>
              </div>

              <button
                type="button"
                onClick={handleGuestAccess}
                className="text-[11px] text-platinum-400 hover:text-gold-metallic flex items-center gap-1 font-medium"
                title="Use workspace as a guest without signing in"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Continue as Guest</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gold-metallic hover:bg-gold-glow text-obsidian font-semibold text-xs transition-all duration-200 shadow-gold-subtle hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating with Firebase...' : 'Sign In with Email'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-platinum-500 dark:text-platinum-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-gold-metallic hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-platinum-400">
        <Link to="/" className="hover:underline">← Back to Code Vibe Home</Link>
      </div>
    </div>
  );
}
