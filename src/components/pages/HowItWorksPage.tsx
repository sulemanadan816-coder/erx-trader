import React from 'react';
import { ExternalLink } from 'lucide-react';
import { DEFAULT_HOW_IT_WORKS } from '../../config/siteConfig';
import { PageRoute, SiteSettings } from '../../types';
import { ContactSupportSection } from '../sections/ContactSupportSection';

interface HowItWorksPageProps {
  settings: SiteSettings;
  onNavigate: (page: PageRoute) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ settings, onNavigate }) => {
  const handleStepAction = (index: number) => {
    if (index === 0) onNavigate('plans');
    else if (index === 1) window.open(settings.telegramSupportUrl, '_blank', 'noopener,noreferrer');
    else onNavigate('dashboard');
  };

  return (
    <div>
      <section className="py-14 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="text-xs text-slate-500 mb-2">
              <span>Process Guide</span>
              <span aria-hidden="true"> · </span>
              <span>Client Onboarding</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              How {settings.brandName} Works
            </h1>
            <p className="mt-4 text-base text-slate-600 leading-relaxed">
              We keep our onboarding and account verification workflow clear and simple. Follow the
              four steps below to select a package, verify your payment, and access your service.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {DEFAULT_HOW_IT_WORKS.map((step, idx) => (
              <div
                key={step.stepNumber}
                className="bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs text-slate-500 mb-2">
                    <span className="font-mono font-semibold text-slate-900">
                      Step {step.stepNumber}
                    </span>
                    <span aria-hidden="true"> · </span>
                    <span>Required Stage</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {step.stepNumber}. {step.title}
                  </h2>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">{step.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => handleStepAction(idx)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:underline cursor-pointer"
                  >
                    <span>{step.actionLabel}</span>
                    {idx === 1 && <ExternalLink className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactSupportSection settings={settings} showInquiryForm={false} />
    </div>
  );
};
