import React, { useState } from 'react';
import { ArrowRight, Check, Copy, ExternalLink } from 'lucide-react';
import {
  DEFAULT_FAQS,
  DEFAULT_FEATURES,
  DEFAULT_HOW_IT_WORKS,
  HERO_VISUAL_ASSET,
} from '../../config/siteConfig';
import { PageRoute, ServicePlan, SiteSettings } from '../../types';
import { PlansSection } from '../sections/PlansSection';
import { ContactSupportSection } from '../sections/ContactSupportSection';

interface HomePageProps {
  settings: SiteSettings;
  plans: ServicePlan[];
  onNavigate: (page: PageRoute) => void;
  onSelectPlan: (planId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  settings,
  plans,
  onNavigate,
  onSelectPlan,
}) => {
  const [heroImgError, setHeroImgError] = useState(false);
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
    <div>
      {/* 1. HERO SECTION */}
      <section className="bg-white border-b border-slate-200 pt-10 pb-16 sm:pt-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Proposition & Primary/Secondary CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-900">{settings.brandName}</span>
                <span aria-hidden="true">·</span>
                <span>Trading Services &amp; Client Portal</span>
                <span aria-hidden="true">·</span>
                <span>Verified Support Desk</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-[1.15] max-w-2xl">
                {settings.heroHeadline}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                {settings.heroSubheadline}
              </p>

              {/* Primary & Secondary CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('plans')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span>Explore Service Plans</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>

                <a
                  href={settings.telegramSupportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
                >
                  <span>Contact Us on Telegram</span>
                  <ExternalLink className="w-4 h-4 shrink-0" />
                </a>

                <a
                  href={settings.whatsappChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap"
                >
                  <span>Join Our WhatsApp Channel</span>
                  <ExternalLink className="w-4 h-4 shrink-0" />
                </a>
              </div>

              {/* Official Quick Reference Bar */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="text-slate-500">Official Telegram</div>
                  <a
                    href={settings.telegramSupportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 inline-flex items-center gap-1 font-mono font-semibold text-slate-900 hover:underline"
                  >
                    <span>{settings.telegramHandle}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div>
                  <div className="text-slate-500">Official WhatsApp</div>
                  <a
                    href={settings.whatsappChannelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 inline-flex items-center gap-1 font-semibold text-slate-900 hover:underline"
                  >
                    <span>Broadcast Channel</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div>
                  <div className="text-slate-500">Easypaisa Account</div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="font-mono tabular-nums font-bold text-slate-900">
                      {settings.easypaisaNumber}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyEasypaisa}
                      className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium underline cursor-pointer"
                    >
                      {copiedEasypaisa ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Asset with Zero-Broken-Image Fallback */}
            <div className="lg:col-span-5">
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video lg:aspect-[4/3]">
                {!heroImgError ? (
                  <img
                    src={HERO_VISUAL_ASSET}
                    alt="REX TRADERS structured trading workspace and client portal environment"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col justify-between p-6 bg-slate-900 text-white">
                    <div className="text-xs font-mono text-slate-400">{settings.brandName}</div>
                    <div>
                      <div className="text-lg font-semibold">
                        Structured Trading Services &amp; Client Portal
                      </div>
                      <p className="mt-1 text-xs text-slate-400">
                        Direct onboarding, organized plans, and manual payment verification.
                      </p>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent flex flex-col justify-end p-5 sm:p-6">
                  <div className="text-xs text-slate-300 font-mono">
                    {settings.brandName} · Client Operations
                  </div>
                  <p className="mt-1 text-sm font-medium text-white leading-snug">
                    Clear plan structure, direct support via Telegram, and manual administrator
                    verification for all Easypaisa payments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURES / SERVICES SECTION (Asymmetric Bento Grid) */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold text-slate-500 mb-2">
              Core Capabilities · Service Architecture
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              What {settings.brandName} Provides
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Every service tier is built around straightforward communication, organized session
              updates, and a transparent client portal workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DEFAULT_FEATURES.map((feature, index) => {
              // Give prominent span to marquee capabilities on large screens
              const isWide = index === 0 || index === 5;
              return (
                <div
                  key={feature.id}
                  className={`bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-7 flex flex-col justify-between ${
                    isWide ? 'lg:col-span-2' : 'lg:col-span-1'
                  }`}
                >
                  <div>
                    <div className="text-xs text-slate-500 mb-2">
                      <span className="font-mono font-semibold text-slate-900">
                        {feature.number}.
                      </span>
                      <span aria-hidden="true"> · </span>
                      <span>{feature.outcome}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {feature.number}. {feature.title}
                    </h3>
                    <p className="mt-2.5 text-sm text-slate-600 leading-relaxed max-w-2xl">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. PLANS / PACKAGES SECTION */}
      <PlansSection
        plans={plans}
        settings={settings}
        onSelectPlan={onSelectPlan}
        onNavigate={onNavigate}
      />

      {/* 4. HOW IT WORKS SECTION */}
      <section className="py-16 sm:py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold text-slate-500 mb-2">
                Step-by-Step Onboarding Process
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                How {settings.brandName} Works
              </h2>
              <p className="mt-3 text-base text-slate-600 leading-relaxed">
                Our onboarding process follows four clear steps from selecting a package to manual
                administrator approval of your payment reference.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('how-it-works')}
              className="self-start md:self-auto px-4 py-2.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              View Full Process Guide
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DEFAULT_HOW_IT_WORKS.map((step) => (
              <div
                key={step.stepNumber}
                className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="font-mono tabular-nums text-xs font-semibold text-slate-500 mb-2">
                    Step {step.stepNumber}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {step.stepNumber}. {step.title}
                  </h3>
                  <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FAQ PREVIEW SECTION */}
      <section className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold text-slate-500 mb-2">
                Common Questions · Clear Answers
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('faq')}
              className="self-start md:self-auto px-4 py-2.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              View All FAQs
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DEFAULT_FAQS.slice(0, 4).map((faq) => (
              <div key={faq.id} className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="text-xs text-slate-500 mb-1.5">{faq.category}</div>
                <h3 className="text-base font-bold text-slate-900">{faq.question}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PROMINENT CONTACT / SUPPORT SECTION */}
      <ContactSupportSection settings={settings} showInquiryForm={true} />
    </div>
  );
};
