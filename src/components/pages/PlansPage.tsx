import React, { useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { PageRoute, ServicePlan, SiteSettings } from '../../types';
import { PlansSection } from '../sections/PlansSection';

interface PlansPageProps {
  settings: SiteSettings;
  plans: ServicePlan[];
  onSelectPlan: (planId: string) => void;
  onNavigate: (page: PageRoute) => void;
}

export const PlansPage: React.FC<PlansPageProps> = ({
  settings,
  plans,
  onSelectPlan,
  onNavigate,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyEasypaisa = async () => {
    try {
      await navigator.clipboard.writeText(settings.easypaisaNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const el = document.createElement('textarea');
      el.value = settings.easypaisaNumber;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div>
      <section className="py-12 sm:py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="text-xs text-slate-500 mb-2">
              <span>Plans &amp; Packages</span>
              <span aria-hidden="true"> · </span>
              <span>{settings.brandName}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Structured Service Plans
            </h1>
            <p className="mt-4 text-base text-slate-600 leading-relaxed">
              Review our available service packages below. When you select a plan, you can submit
              your Easypaisa payment Transaction ID in the Client Portal for manual administrator
              verification, or coordinate directly with our Telegram support desk.
            </p>
          </div>
        </div>
      </section>

      <PlansSection
        plans={plans}
        settings={settings}
        onSelectPlan={onSelectPlan}
        onNavigate={onNavigate}
      />

      {/* Payment & Verification Information Banner */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-3">
                <div className="text-xs text-slate-500">
                  <span>Payment Instructions</span>
                  <span aria-hidden="true"> · </span>
                  <span>Manual Verification Policy</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Official Easypaisa Payment Procedure
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  1. Confirm your desired plan fee with support or select your package above.
                  <br />
                  2. Transfer the amount to the official {settings.brandName} Easypaisa number:{' '}
                  <span className="font-mono tabular-nums font-bold text-slate-900">
                    {settings.easypaisaNumber}
                  </span>
                  .<br />
                  3. Sign in to the Client Portal and submit your Transaction ID (TID) and sender
                  number. Every submission is recorded as <strong>Pending</strong> until manually
                  verified by an administrator.
                </p>
              </div>

              <div className="lg:col-span-5 flex flex-col gap-3">
                <div className="p-4 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500">Official Easypaisa Number</div>
                    <div className="font-mono tabular-nums text-lg font-bold text-slate-900">
                      {settings.easypaisaNumber}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyEasypaisa}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => onNavigate('dashboard')}
                    className="py-3 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg text-center cursor-pointer whitespace-nowrap"
                  >
                    Submit Payment in Portal
                  </button>
                  <a
                    href={settings.telegramSupportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 py-3 px-4 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg whitespace-nowrap"
                  >
                    <span>Telegram Support</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
