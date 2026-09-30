import React, { useState } from 'react';
import { ArrowRight, Check, ChevronRight, Copy } from 'lucide-react';
import { REFERRAL_LEVELS } from '../../config/siteConfig';
import { PageRoute, ServicePlan, SiteSettings } from '../../types';

interface PlansSectionProps {
  plans: ServicePlan[];
  settings: SiteSettings;
  onSelectPlan: (planId: string) => void;
  onNavigate: (page: PageRoute) => void;
}

export const PlansSection: React.FC<PlansSectionProps> = ({
  plans,
  settings,
  onSelectPlan,
  onNavigate,
}) => {
  const [copiedEasypaisa, setCopiedEasypaisa] = useState(false);

  const handleCopyEasypaisa = async () => {
    try {
      await navigator.clipboard.writeText(settings.easypaisaNumber);
      setCopiedEasypaisa(true);
      setTimeout(() => setCopiedEasypaisa(false), 2500);
    } catch {
      const el = document.createElement('textarea');
      el.value = settings.easypaisaNumber;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopiedEasypaisa(true);
      setTimeout(() => setCopiedEasypaisa(false), 2500);
    }
  };

  return (
    <section className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <span className="font-semibold text-slate-900">{settings.brandName}</span>
              <span aria-hidden="true">·</span>
              <span>Smart Investment · Better Tomorrow</span>
              <span aria-hidden="true">·</span>
              <span>30-Day Packages (30 دن)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Official {settings.brandName} Investment Plans
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Choose from our 12 official 30-day investment tiers below. Select any plan to submit
              your Easypaisa transfer reference in the Client Portal for administrator verification.
            </p>
          </div>
          <div className="shrink-0">
            <a
              href={settings.telegramSupportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap"
            >
              <span>Contact Telegram Support</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* 12 Plans in a 4-Column Responsive Grid matching the REX TRADERS Plan Chart */}
        {plans.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
            <h3 className="text-base font-semibold text-slate-900">
              No Active Plans Found
            </h3>
            <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
              Please contact our official Telegram support desk ({settings.telegramHandle}) for
              assistance.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {plans.map((plan, index) => {
              // Extract numeric investment figure for prominent display
              const numericAmount = plan.price.replace(/[^0-9,]/g, '') || plan.price;
              const dailyProfitDisplay =
                plan.dailyProfit ||
                plan.features.find((f) => f.toLowerCase().includes('daily'))?.split(':')[1]?.trim() ||
                '—';
              const totalProfitDisplay =
                plan.totalProfit ||
                plan.features.find((f) => f.toLowerCase().includes('total'))?.split(':')[1]?.trim() ||
                '—';

              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-xl overflow-hidden flex flex-col justify-between border transition-colors ${
                    plan.isPopular
                      ? 'border-slate-900 ring-1 ring-slate-900'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Top Header Band: Investment Amount (انویسٹمنٹ) */}
                  <div>
                    <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[11px] text-slate-300 font-medium">
                          Plan {String(index + 1).padStart(2, '0')} · انویسٹمنٹ
                        </div>
                        <div className="font-mono tabular-nums text-xl font-bold tracking-tight text-white mt-0.5">
                          Rs. {numericAmount}
                        </div>
                      </div>
                      <span className="text-xs font-medium text-emerald-300 whitespace-nowrap">
                        انویسٹمنٹ
                      </span>
                    </div>

                    {/* Structured Profit & Duration Breakdown */}
                    <div className="p-5 space-y-3.5">
                      {/* Row 1: Daily Profit (روزانہ منافع) */}
                      <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <div>
                          <div className="text-xs font-semibold text-slate-800">Daily Profit</div>
                          <div className="text-[11px] text-slate-500">روزانہ منافع</div>
                        </div>
                        <div className="font-mono tabular-nums text-sm font-bold text-emerald-700">
                          Rs. {dailyProfitDisplay.replace(/PKR|Rs\.?/gi, '').trim()}
                        </div>
                      </div>

                      {/* Row 2: Total Profit (منافع مکمل) */}
                      <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <div>
                          <div className="text-xs font-semibold text-slate-800">Total Profit</div>
                          <div className="text-[11px] text-slate-500">منافع مکمل</div>
                        </div>
                        <div className="font-mono tabular-nums text-sm font-bold text-slate-900">
                          Rs. {totalProfitDisplay.replace(/PKR|Rs\.?/gi, '').trim()}
                        </div>
                      </div>

                      {/* Row 3: Plan Duration (پلان مدت) */}
                      <div className="flex items-center justify-between py-1.5">
                        <div>
                          <div className="text-xs font-semibold text-slate-800">Plan Duration</div>
                          <div className="text-[11px] text-slate-500">پلان مدت</div>
                        </div>
                        <div className="font-mono tabular-nums text-xs font-semibold text-slate-700">
                          30 Days (30 دن)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Invest Now CTA Button */}
                  <div className="px-5 pb-5 pt-1">
                    <button
                      type="button"
                      onClick={() => onSelectPlan(plan.id)}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <span>{plan.ctaText || 'Invest Now'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Referral Commission (ریفرل کمیشن) & Payment Channels Bar */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 3-Level Referral Commission Box */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <div className="text-xs text-slate-500">
                  <span>Partner Network Program</span>
                  <span aria-hidden="true"> · </span>
                  <span>ریفرل کمیشن</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  3-Level Referral Commission (ریفرل کمیشن)
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {REFERRAL_LEVELS.map((item) => (
                <div
                  key={item.level}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">{item.level}</span>
                    <span className="font-mono tabular-nums text-xl font-bold text-emerald-700">
                      {item.commission}
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Supported Payment Channels Box (Easypaisa & JazzCash) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="text-xs text-slate-500">
                <span>Supported Payment Gateways</span>
                <span aria-hidden="true"> · </span>
                <span>Easypaisa &amp; JazzCash</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                Official Deposit Account
              </h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Send your selected plan amount via <strong>Easypaisa</strong> (or inquire on
                Telegram for JazzCash details) and submit your Transaction ID in the Client Portal.
              </p>

              <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Official Easypaisa Number
                  </div>
                  <div className="font-mono tabular-nums text-base font-bold text-slate-900 tracking-wider">
                    {settings.easypaisaNumber}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyEasypaisa}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white border border-slate-300 hover:bg-slate-100 rounded-md cursor-pointer whitespace-nowrap"
                >
                  {copiedEasypaisa ? (
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
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="text-xs font-semibold text-slate-900 hover:underline cursor-pointer"
              >
                Submit Payment TID in Portal &rarr;
              </button>
              <button
                type="button"
                onClick={() => onNavigate('contact')}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Need Help?
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
