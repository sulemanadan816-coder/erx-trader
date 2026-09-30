import React, { useState } from 'react';
import { Check, Copy, ExternalLink, Send } from 'lucide-react';
import { SiteSettings } from '../../types';

interface ContactSupportSectionProps {
  settings: SiteSettings;
  showInquiryForm?: boolean;
}

export const ContactSupportSection: React.FC<ContactSupportSectionProps> = ({
  settings,
  showInquiryForm = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

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

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (name.trim().length < 2) {
      setFormError('Please enter your full name (at least 2 characters).');
      return;
    }
    if (contactInfo.trim().length < 4) {
      setFormError('Please provide your Telegram username, WhatsApp number, or email.');
      return;
    }
    if (subject.trim().length < 3) {
      setFormError('Please enter a brief subject for your inquiry.');
      return;
    }
    if (message.trim().length < 10) {
      setFormError('Please enter a clear message (at least 10 characters).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          contactInfo: contactInfo.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Could not submit your inquiry. Please try again.');
      } else {
        setFormSuccess(
          data.message ||
            'Your message has been submitted to REX TRADERS support. You can also reach us directly on Telegram.'
        );
        setName('');
        setContactInfo('');
        setSubject('');
        setMessage('');
      }
    } catch {
      setFormError('Network error while submitting your inquiry. Please reach us via Telegram.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-16 sm:py-20 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-semibold text-slate-500 mb-2">
            Official Communication &amp; Payment Channels
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Connect with {settings.brandName} Support
          </h2>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            Use our verified Telegram desk for direct support, join our official WhatsApp Channel for
            service announcements, or copy our official Easypaisa number for plan payments.
          </p>
        </div>

        {/* 3 Official Channel Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Telegram Support */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="text-xs text-slate-500 mb-2">
                <span>Direct Support Desk</span>
                <span aria-hidden="true"> · </span>
                <span className="font-mono">{settings.telegramHandle}</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Telegram Support</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Message our support team directly on Telegram for plan inquiries, onboarding
                assistance, and payment verification follow-ups.
              </p>
              <div className="mt-4 py-2 px-3 bg-white border border-slate-200 rounded-lg font-mono text-xs text-slate-700 break-all">
                {settings.telegramSupportUrl}
              </div>
            </div>
            <div className="mt-6">
              <a
                href={settings.telegramSupportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
              >
                <span>CONTACT TELEGRAM SUPPORT</span>
                <ExternalLink className="w-4 h-4 shrink-0" />
              </a>
            </div>
          </div>

          {/* Card 2: WhatsApp Channel */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="text-xs text-slate-500 mb-2">
                <span>Official Broadcasts</span>
                <span aria-hidden="true"> · </span>
                <span>WhatsApp Updates</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">WhatsApp Channel</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Follow the official {settings.brandName} WhatsApp Channel to receive timely updates,
                schedule notices, and important service announcements.
              </p>
              <div className="mt-4 py-2 px-3 bg-white border border-slate-200 rounded-lg font-mono text-xs text-slate-700 truncate">
                {settings.whatsappChannelUrl}
              </div>
            </div>
            <div className="mt-6">
              <a
                href={settings.whatsappChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap"
              >
                <span>JOIN WHATSAPP CHANNEL</span>
                <ExternalLink className="w-4 h-4 shrink-0" />
              </a>
            </div>
          </div>

          {/* Card 3: Easypaisa Payment Details */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="text-xs text-slate-500 mb-2">
                <span>Official Payment Account</span>
                <span aria-hidden="true"> · </span>
                <span>Manual Verification</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Easypaisa Account</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Use the official Easypaisa number below for plan payments. After transfer, submit
                your Transaction ID in the Client Portal for admin verification.
              </p>
              <div className="mt-4 py-2.5 px-3.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                <span className="text-xs text-slate-500">Easypaisa</span>
                <span className="font-mono tabular-nums text-base font-bold text-slate-900 tracking-wider">
                  {settings.easypaisaNumber}
                </span>
              </div>
            </div>
            <div className="mt-6">
              <button
                type="button"
                onClick={handleCopyEasypaisa}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>COPIED: {settings.easypaisaNumber}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 shrink-0" />
                    <span>COPY EASYPAISA NUMBER</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Optional Direct Support Inquiry Form */}
        {showInquiryForm && (
          <div className="mt-12 bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 space-y-3">
                <h3 className="text-lg font-semibold text-slate-900">
                  Send a Support or Onboarding Message
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Have a question regarding plan selection, account access, or payment submission?
                  Submit a ticket below and our administrator will review it in the support desk.
                </p>
                <div className="pt-2 space-y-2 text-xs text-slate-500">
                  <p>
                    For the fastest response, reach out directly via Telegram:{' '}
                    <a
                      href={settings.telegramSupportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-slate-900 underline"
                    >
                      {settings.telegramHandle}
                    </a>
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmitInquiry} className="lg:col-span-7 space-y-4" noValidate>
                {formError && (
                  <div
                    role="alert"
                    className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-800"
                  >
                    {formError}
                  </div>
                )}
                {formSuccess && (
                  <div
                    role="status"
                    className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800"
                  >
                    {formSuccess}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="inquiry-name"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      Full Name
                    </label>
                    <input
                      id="inquiry-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      required
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="inquiry-contact"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      Telegram Username / Phone / Email
                    </label>
                    <input
                      id="inquiry-contact"
                      type="text"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      placeholder="@username or 03XX-XXXXXXX"
                      required
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="inquiry-subject"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Subject
                  </label>
                  <input
                    id="inquiry-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Plan details, onboarding, or payment verification question"
                    required
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="inquiry-message"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Message
                  </label>
                  <textarea
                    id="inquiry-message"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your question or request clearly..."
                    required
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 py-2.5 px-5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-60 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Submitting Inquiry...' : 'Submit Support Inquiry'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
