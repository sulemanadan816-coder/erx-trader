import React, { useState } from 'react';
import { PageRoute, SiteSettings, UserAccount } from '../../types';
import { apiRequest } from '../../utils/api';

interface AuthPageProps {
  mode: 'login' | 'register';
  settings: SiteSettings;
  onNavigate: (page: PageRoute) => void;
  onAuthSuccess: (token: string, user: UserAccount) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  mode,
  settings,
  onNavigate,
  onAuthSuccess,
}) => {
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLogin = mode === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isLogin && name.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }
    if (identifier.trim().length < 4) {
      setError('Please enter a valid email address or phone number.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin
        ? { identifier: identifier.trim(), password }
        : { name: name.trim(), identifier: identifier.trim(), password };

      const res = await apiRequest<{ token: string; user: UserAccount; error?: string }>(
        endpoint,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok || !res.data?.token || !res.data?.user) {
        setError(res.error || 'Authentication failed. Please check your details.');
      } else {
        onAuthSuccess(res.data.token, res.data.user);
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithPreconfiguredAccount = async (type: 'client' | 'admin') => {
    setError(null);
    const targetIdentifier =
      type === 'admin' ? 'admin@rextraders.com' : 'client@rextraders.com';
    const targetPassword = type === 'admin' ? 'RexAdmin2026!' : 'RexClient2026!';
    setIdentifier(targetIdentifier);
    setPassword(targetPassword);

    setLoading(true);
    try {
      const res = await apiRequest<{ token: string; user: UserAccount; error?: string }>(
        '/api/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({
            identifier: targetIdentifier,
            password: targetPassword,
          }),
        }
      );

      if (!res.ok || !res.data?.token || !res.data?.user) {
        setError(res.error || 'Authentication failed. Please check your details.');
      } else {
        onAuthSuccess(res.data.token, res.data.user);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-14 sm:py-20 bg-slate-50">
      <div className="max-w-md mx-auto px-4 sm:px-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
          <div className="text-xs text-slate-500 mb-2">
            <span>{settings.brandName}</span>
            <span aria-hidden="true"> · </span>
            <span>Client &amp; Admin Portal</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isLogin ? 'Sign In to Your Account' : 'Create a Client Account'}
          </h1>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            {isLogin
              ? 'Access your dashboard to manage your service plan and track Easypaisa payment verifications.'
              : 'Register an account to select a REX TRADERS plan and submit payment references for verification.'}
          </p>

          {/* Mode Switcher */}
          <div className="mt-5 grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setError(null);
                onNavigate('login');
              }}
              className={`py-2 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                isLogin
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                onNavigate('register');
              }}
              className={`py-2 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                !isLogin
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            {error && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-800"
              >
                {error}
              </div>
            )}

            {!isLogin && (
              <div>
                <label
                  htmlFor="auth-name"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Full Name
                </label>
                <input
                  id="auth-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="auth-identifier"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Email Address or Mobile Number
              </label>
              <input
                id="auth-identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@example.com or 03XX-XXXXXXX"
                required
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label
                htmlFor="auth-password"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
            >
              {loading
                ? 'Authenticating...'
                : isLogin
                ? 'Sign In to Portal'
                : 'Create Client Account'}
            </button>
          </form>

          {isLogin && (
            <div className="mt-6 pt-5 border-t border-slate-200 space-y-3">
              <div className="text-xs font-semibold text-slate-700">
                One-Click Portal Sign In (Pre-configured Accounts)
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => loginWithPreconfiguredAccount('client')}
                  className="py-2.5 px-3 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-center cursor-pointer whitespace-nowrap"
                >
                  Sign In as Client
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => loginWithPreconfiguredAccount('admin')}
                  className="py-2.5 px-3 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-center cursor-pointer whitespace-nowrap"
                >
                  Sign In as Admin
                </button>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-600 space-y-1">
                <div>Client: client@rextraders.com / RexClient2026!</div>
                <div>Admin: admin@rextraders.com / RexAdmin2026!</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
