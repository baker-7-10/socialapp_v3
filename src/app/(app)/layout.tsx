'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { BookOpen, Home, User, Search, LogOut, Bell } from 'lucide-react';
import clsx from 'clsx';

const NAV_ITEMS = [
  { href: '/feed', label: 'Feed', icon: Home },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoaded, loadFromStorage, clearAuth } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/auth');
    }
  }, [isLoaded, user, router]);

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: '#0d0d0d' }}
          >
            <BookOpen size={20} color="#c8a96e" />
          </div>
          <div
            className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: '#c8a96e', borderTopColor: 'transparent' }}
          />
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    clearAuth();
    router.push('/auth');
  };

  const avatarLetter = (user.displayName || user.username)[0].toUpperCase();

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside
        className="hidden md:flex flex-col w-64 lg:w-72 h-screen sticky top-0 p-6 border-r"
        style={{ borderColor: 'var(--border)', background: '#ffffff' }}
      >
        {/* Logo */}
        <Link href="/feed" className="flex items-center gap-2.5 mb-10">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: '#0d0d0d' }}
          >
            <BookOpen size={18} color="#c8a96e" />
          </div>
          <span
            className="text-xl"
            style={{ fontFamily: 'var(--font-display)', color: '#0d0d0d' }}
          >
            Chronicle
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  active
                    ? 'text-ink-900'
                    : 'text-ink-400 hover:text-ink-700 hover:bg-cream-100'
                )}
                style={
                  active
                    ? { background: '#f5edd8', color: '#0d0d0d' }
                    : {}
                }
              >
                <Icon size={18} style={{ color: active ? '#c8a96e' : 'inherit' }} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
              style={{ background: '#0d0d0d', color: '#c8a96e' }}
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                avatarLetter
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: '#0d0d0d' }}>
                {user.displayName || user.username}
              </p>
              <p className="text-xs truncate" style={{ color: '#a8a89e' }}>
                @{user.username}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-colors"
            style={{ color: '#7a7a72' }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).closest('button')!.style.background = '#fff0ee';
              (e.target as HTMLElement).closest('button')!.style.color = '#d94f3d';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).closest('button')!.style.background = 'transparent';
              (e.target as HTMLElement).closest('button')!.style.color = '#7a7a72';
            }}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        {/* Mobile top bar */}
        <div
          className="md:hidden flex items-center justify-between px-4 py-3 border-b sticky top-0 z-20"
          style={{ background: '#ffffff', borderColor: 'var(--border)' }}
        >
          <Link href="/feed" className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: '#0d0d0d' }}
            >
              <BookOpen size={14} color="#c8a96e" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px' }}>Chronicle</span>
          </Link>
          <div className="flex items-center gap-1">
            {NAV_ITEMS.map(({ href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="p-2 rounded-lg"
                style={{
                  color: pathname.startsWith(href) ? '#c8a96e' : '#a8a89e',
                  background: pathname.startsWith(href) ? '#f5edd8' : 'transparent',
                }}
              >
                <Icon size={18} />
              </Link>
            ))}
            <button onClick={handleLogout} className="p-2 rounded-lg" style={{ color: '#a8a89e' }}>
              <LogOut size={18} />
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
