import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { PageRoute, SiteSettings, UserAccount } from '../../types';
import { BrandLogo } from '../brand/BrandLogo';

interface HeaderProps {
  currentPage: PageRoute;
  onNavigate: (page: PageRoute) => void;
  settings: SiteSettings;
  user: UserAccount | null;
  onLogout: () => void;
}

const NAV_ITEMS: { label: string; route: PageRoute }[] = [
  { label: 'Home', route: 'home' },
  { label: 'About', route: 'about' },
  { label: 'Plans', route: 'plans' },
  { label: 'How It Works', route: 'how-it-works' },
  { label: 'FAQ', route: 'faq' },
  { label: 'Contact', route: 'contact' },
];

const AUTHORIZED_ADMIN_EMAILS = ['sulemanadan816@gmail.com', 'abubakararain104@gmail.com'];
function isExclusiveOwnerAdmin(user: UserAccount | null): boolean {
  return Boolean(
    user &&
      user.role === 'admin' &&
      AUTHORIZED_ADMIN_EMAILS.includes(user.identifier.toLowerCase())
  );
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  settings,
  user,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (route: PageRoute) => {
    onNavigate(route);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Zone 1: Single Brand Lockup */}
        <a
          href="/?page=home"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('home');
          }}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 rounded-md shrink-0"
          aria-label={`${settings.brandName} Home`}
        >
          <BrandLogo logoUrl={settings.logoUrl} brandName={settings.brandName} variant="dark" />
        </a>

        {/* Zone 2: 6 Clean Text Navigation Links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = currentPage === item.route;
            return (
              <a
                key={item.route}
                href={`/?page=${item.route}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.route);
                }}
                className={`py-1 whitespace-nowrap shrink-0 border-b-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 rounded-xs ${
                  isActive
                    ? 'border-slate-900 text-slate-900 font-semibold'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 Primary Actions */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {user ? (
            <>
              <button
                type="button"
                onClick={() =>
                  handleNavClick(isExclusiveOwnerAdmin(user) ? 'admin' : 'dashboard')
                }
                className="px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                {isExclusiveOwnerAdmin(user) ? 'Admin Panel' : 'Client Dashboard'}
              </button>
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleNavClick('login')}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                Client Portal
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('plans')}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                Explore Plans
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex lg:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className="lg:hidden bg-white border-b border-slate-200 shadow-lg px-4 pt-3 pb-6 space-y-4"
        >
          <nav aria-label="Mobile Navigation" className="flex flex-col space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = currentPage === item.route;
              return (
                <a
                  key={item.route}
                  href={`/?page=${item.route}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.route);
                  }}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2.5">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    handleNavClick(isExclusiveOwnerAdmin(user) ? 'admin' : 'dashboard')
                  }
                  className="w-full py-2.5 px-4 text-sm font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg text-center"
                >
                  {isExclusiveOwnerAdmin(user) ? 'Open Admin Panel' : 'Open Client Dashboard'}
                </button>
                {isExclusiveOwnerAdmin(user) && (
                  <button
                    type="button"
                    onClick={() => handleNavClick('dashboard')}
                    className="w-full py-2.5 px-4 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg text-center"
                  >
                    Switch to Client View
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg text-center"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleNavClick('login')}
                  className="w-full py-2.5 px-4 text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg text-center"
                >
                  Client Portal Sign In
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick('plans')}
                  className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg text-center"
                >
                  Explore Service Plans
                </button>
              </>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={settings.telegramSupportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg text-center whitespace-nowrap truncate"
              >
                Telegram Support
              </a>
              <a
                href={settings.whatsappChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg text-center whitespace-nowrap truncate"
              >
                WhatsApp Channel
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
