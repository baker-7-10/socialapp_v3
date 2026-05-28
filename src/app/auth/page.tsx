'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { AuthResponse } from '@/types';
import { Eye, EyeOff, BookOpen } from 'lucide-react';

type Mode = 'login' | 'signup';

export default function AuthPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/signup';
      const payload =
        mode === 'login'
          ? { email: form.email, password: form.password }
          : form;

      const { data } = await api.post<AuthResponse>(endpoint, payload);
      setAuth(data.user, data.accessToken);
      toast.success(mode === 'login' ? 'Welcome back!' : 'Account created!');
      router.push('/feed');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* Left panel — decorative */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-16 relative overflow-hidden"
        style={{ background: '#0d0d0d' }}
      >
        {/* Texture overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #c8a96e 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, #c8a96e 0%, transparent 50%)`,
          }}
        />

        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(#c8a96e 1px, transparent 1px), linear-gradient(90deg, #c8a96e 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: '#c8a96e' }}
            >
              <BookOpen size={20} color="#0d0d0d" />
            </div>
            <span
              className="text-2xl font-display"
              style={{ color: '#faf8f3', fontFamily: 'var(--font-display)' }}
            >
              Chronicle
            </span>
          </div>
        </div>

        <div className="relative">
          <p
            className="text-5xl leading-tight mb-6"
            style={{
              fontFamily: 'var(--font-display)',
              color: '#faf8f3',
              fontStyle: 'italic',
            }}
          >
            "Share your thoughts,<br />connect your world."
          </p>
          <p style={{ color: '#7a7a72', fontSize: '15px' }}>
            A place for ideas, stories, and real conversations.
          </p>
        </div>

        <div className="relative flex items-center gap-6">
          {['Ideas', 'Stories', 'Community', 'Connection'].map((word) => (
            <span
              key={word}
              className="text-xs tracking-widest uppercase"
              style={{ color: '#525248' }}
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: '#0d0d0d' }}
            >
              <BookOpen size={16} color="#c8a96e" />
            </div>
            <span className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>
              Chronicle
            </span>
          </div>

          <h1
            className="text-3xl mb-1"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="mb-8 text-sm" style={{ color: '#7a7a72' }}>
            {mode === 'login'
              ? 'Sign in to continue your story'
              : 'Start writing your chronicle today'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#525248' }}>
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg text-sm transition-all"
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #e0dbd0',
                  color: '#0d0d0d',
                  outline: 'none',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#c8a96e')}
                onBlur={(e) => (e.target.style.borderColor = '#e0dbd0')}
              />
            </div>

            {mode === 'signup' && (
              <div className="animate-slide-up">
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#525248' }}>
                  Username
                </label>
                <input
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  required
                  placeholder="yourname"
                  minLength={3}
                  className="w-full px-4 py-3 rounded-lg text-sm transition-all"
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #e0dbd0',
                    color: '#0d0d0d',
                    outline: 'none',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#c8a96e')}
                  onBlur={(e) => (e.target.style.borderColor = '#e0dbd0')}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#525248' }}>
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Min 8 characters"
                  minLength={8}
                  className="w-full px-4 py-3 pr-12 rounded-lg text-sm transition-all"
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #e0dbd0',
                    color: '#0d0d0d',
                    outline: 'none',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#c8a96e')}
                  onBlur={(e) => (e.target.style.borderColor = '#e0dbd0')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: '#a8a89e' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-semibold transition-all mt-2"
              style={{
                background: loading ? '#d0c898' : '#0d0d0d',
                color: '#faf8f3',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading
                ? 'Please wait…'
                : mode === 'login'
                ? 'Sign in'
                : 'Create account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm" style={{ color: '#7a7a72' }}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-sm font-medium transition-colors"
              style={{ color: '#c8a96e' }}
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
