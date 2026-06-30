import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const linkBase =
  'px-3 py-2 rounded-lg text-sm font-medium transition';
const linkInactive = 'text-slate-600 hover:text-ink hover:bg-slate-100';
const linkActive = 'bg-brand-50 text-brand-700';

const NavItem = ({ to, children }) => (
  <NavLink
    to={to}
    end={to === '/'}
    className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}
  >
    {children}
  </NavLink>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const onLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="h-9 w-9 rounded-xl bg-brand-gradient flex items-center justify-center text-white font-display font-bold shadow-soft">
              C
            </span>
            <span className="font-display text-xl font-semibold text-ink tracking-tight">
              CoinScope
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <NavItem to="/">Markets</NavItem>
            <NavItem to="/watchlist">Watchlist</NavItem>
            <NavItem to="/portfolio">Portfolio</NavItem>
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <span className="text-sm text-slate-600">
                  Hi, <span className="font-medium text-ink">{user.name}</span>
                </span>
                <button
                  onClick={onLogout}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-sm font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 shadow-soft"
                >
                  Create account
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100"
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 flex flex-col gap-1">
            <NavItem to="/">Markets</NavItem>
            <NavItem to="/watchlist">Watchlist</NavItem>
            <NavItem to="/portfolio">Portfolio</NavItem>
            <div className="mt-2 pt-2 border-t border-slate-100">
              {user ? (
                <button
                  onClick={onLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Sign out ({user.name})
                </button>
              ) : (
                <div className="flex gap-2 px-1">
                  <Link to="/login" className="flex-1 text-center px-3 py-2 rounded-lg bg-slate-100 text-sm font-medium">
                    Sign in
                  </Link>
                  <Link to="/register" className="flex-1 text-center px-3 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium">
                    Create account
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
