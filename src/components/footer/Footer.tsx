import React, { useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { PageRoute, SiteSettings } from '../../types';
import { BrandLogo } from '../brand/BrandLogo';

interface FooterProps {
  onNavigate: (page: PageRoute) => void;
  settings: SiteSettings;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, settings }) => {
  const [copiedEasypaisa, setCopiedEasypaisa] = useState(false);

  const handleCopyEasypaisa = async () => {
    try {
      await navigator.clipboard.writeText(settings.easypaisaNumber);
      setCopiedEasypaisa(true);
      setTimeout(() => setCopiedEasypaisa(false), 2500);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = settings.easypaisaNumber;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedEasypaisa(true);
      setTimeout(() => setCopiedEasypaisa(false), 2500);
    }
  };

  const go = (page: PageRoute) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800">
          {/* Column 1: REX TRADERS Brand & Description (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <a
              href="/?page=home"
              onClick={(e) => {
                e.preventDefault();
                go('home');
              }}
              className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-md"
            >
              <BrandLogo
                logoUrl={settings.logoUrl}
                brandName={settings.brandName}
                variant="light"
                showPlaceholderHint
              />
            </a>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              REX TRADERS — Smart Investment, Better Tomorrow. Providing 12 structured 30-day
              packages, a 3-level referral program, manual Easypaisa payment verification, and
              direct support through official Telegram and WhatsApp channels.
            </p>
          </div>

          {/* Column 2: Website Navigation (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-semibold text-white tracking-wide">Navigation</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="/?page=home"
                  onClick={(e) => {
                    e.preventDefault();
                    go('home');
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/?page=about"
                  onClick={(e) => {
                    e.preventDefault();
                    go('about');
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  About REX TRADERS
                </a>
              </li>
              <li>
                <a
                  href="/?page=plans"
                  onClick={(e) => {
                    e.preventDefault();
                    go('plans');
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Plans &amp; Packages
                </a>
              </li>
              <li>
                <a
                  href="/?page=how-it-works"
                  onClick={(e) => {
                    e.preventDefault();
                    go('how-it-works');
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="/?page=faq"
                  onClick={(e) => {
                    e.preventDefault();
                    go('faq');
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="/?page=contact"
                  onClick={(e) => {
                    e.preventDefault();
                    go('contact');
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Contact &amp; Support
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Account & Legal (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-semibold text-white tracking-wide">Account &amp; Legal</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="/?page=login"
                  onClick={(e) => {
                    e.preventDefault();
                    go('login');
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Client Portal Sign In
                </a>
              </li>
              <li>
                <a
                  href="/?page=register"
                  onClick={(e) => {
                    e.preventDefault();
                    go('register');
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Create Client Account
                </a>
              </li>
              <li>
                <a
                  href="/?page=terms"
                  onClick={(e) => {
                    e.preventDefault();
                    go('terms');
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Terms &amp; Conditions
                </a>
              </li>
              <li>
                <a
                  href="/?page=privacy"
                  onClick={(e) => {
                    e.preventDefault();
                    go('privacy');
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Official Support & Easypaisa (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-xs font-semibold text-white tracking-wide">
              Official Contact &amp; Payment Channels
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3 py-2 border-b border-slate-800">
                <span className="text-slate-400">Telegram Support</span>
                <a
                  href={settings.telegramSupportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-white hover:text-sky-400 font-medium transition-colors whitespace-nowrap"
                >
                  <span>{settings.telegramHandle}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>

              <div className="flex items-center justify-between gap-3 py-2 border-b border-slate-800">
                <span className="text-slate-400">WhatsApp Channel</span>
                <a
                  href={settings.whatsappChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-white hover:text-emerald-400 font-medium transition-colors whitespace-nowrap"
                >
                  <span>Official Channel</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>

              <div className="pt-1">
                <div className="text-xs text-slate-400 mb-1.5">
                  Official Easypaisa Number (Manual Verification)
                </div>
                <div className="flex items-center justify-between gap-2 bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2">
                  <span className="font-mono tabular-nums text-sm font-semibold text-white tracking-wider">
                    {settings.easypaisaNumber}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyEasypaisa}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded bg-slate-700 hover:bg-slate-600 text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    aria-label="Copy Easypaisa Number"
                  >
                    {copiedEasypaisa ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Number</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Service Notice */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} {settings.brandName}. All rights reserved.</p>
          <p className="max-w-xl sm:text-right leading-relaxed">
            Service Notice: {settings.brandName} provides structured trading service plans and
            support. Trading involves market risk; no fixed returns or guaranteed profits are
            promised.
          </p>
        </div>
      </div>
    </footer>
  );
};
