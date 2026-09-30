import React from 'react';
import { SiteSettings } from '../../types';
import { ContactSupportSection } from '../sections/ContactSupportSection';

interface ContactPageProps {
  settings: SiteSettings;
}

export const ContactPage: React.FC<ContactPageProps> = ({ settings }) => {
  return (
    <div>
      <section className="py-12 sm:py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="text-xs text-slate-500 mb-2">
              <span>Support &amp; Official Channels</span>
              <span aria-hidden="true"> · </span>
              <span>{settings.brandName}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Contact &amp; Support
            </h1>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Reach out to {settings.brandName} through our verified Telegram support account, join
              our official WhatsApp Channel for updates, or copy our official Easypaisa number below.
            </p>
          </div>
        </div>
      </section>

      <ContactSupportSection settings={settings} showInquiryForm={true} />
    </div>
  );
};
