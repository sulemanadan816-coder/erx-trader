import React from 'react';
import { ExternalLink } from 'lucide-react';
import { DEFAULT_FEATURES } from '../../config/siteConfig';
import { PageRoute, SiteSettings } from '../../types';
import { ContactSupportSection } from '../sections/ContactSupportSection';

interface AboutPageProps {
  settings: SiteSettings;
  onNavigate: (page: PageRoute) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ settings, onNavigate }) => {
  return (
    <div>
      <section className="py-14 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="text-xs text-slate-500 mb-2">
              <span>About Us</span>
              <span aria-hidden="true"> · </span>
              <span>Operational Standards</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              About {settings.brandName}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              {settings.brandName} is built to deliver organized trading services, structured market
              briefings, and direct client communication through verified channels without
              unnecessary complexity or exaggerated financial claims.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <div className="text-xs font-mono text-slate-500 mb-2">01 · Clarity</div>
              <h2 className="text-lg font-bold text-slate-900">Straightforward Service Scope</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Each service package outlines its duration, included communication access, and
                onboarding workflow clearly so clients understand what is provided before
                subscribing.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <div className="text-xs font-mono text-slate-500 mb-2">02 · Transparency</div>
              <h2 className="text-lg font-bold text-slate-900">No Unrealistic Promises</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Financial markets involve inherent risk. {settings.brandName} never fabricates
                guaranteed profit percentages, artificial win rates, or unverifiable statistics.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <div className="text-xs font-mono text-slate-500 mb-2">03 · Verification</div>
              <h2 className="text-lg font-bold text-slate-900">Manual Payment Review</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Every Easypaisa payment submitted through our Client Portal is logged as Pending and
                personally verified by an administrator before account activation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities List */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <h2 className="text-2xl font-bold text-slate-900">Core Service Principles</h2>
            <p className="mt-2 text-sm text-slate-600">
              How {settings.brandName} structures client onboarding, communication, and account
              management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DEFAULT_FEATURES.map((feat) => (
              <div key={feat.id} className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="text-xs text-slate-500 mb-1.5">
                  <span className="font-mono font-semibold text-slate-900">{feat.number}</span>
                  <span aria-hidden="true"> · </span>
                  <span>{feat.outcome}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{feat.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{feat.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('plans')}
              className="px-5 py-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              View Service Plans
            </button>
            <a
              href={settings.telegramSupportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <span>Message Telegram Support</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      <ContactSupportSection settings={settings} showInquiryForm={false} />
    </div>
  );
};
