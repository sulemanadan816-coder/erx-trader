import {
  FAQItem,
  FeatureItem,
  HowItWorksStep,
  ReferralLevel,
  ServicePlan,
  SiteSettings,
} from '../types';
import heroWorkspaceImg from '../assets/images/hero_rex_traders_workspace_1790791807080.jpg';

/**
 * CENTRAL CONFIGURATION FILE — REX TRADERS
 * Official contact details, official logo path, 12 investment plans, and referral structure.
 */
export const SITE_CONFIG: SiteSettings = {
  brandName: 'REX TRADERS',
  logoUrl: '/rex-traders-logo.svg',
  logoAlt: 'REX TRADERS Official Logo',
  whatsappChannelUrl: 'https://whatsapp.com/channel/0029Vb5ZICEFSAt01mUETp3z',
  telegramSupportUrl: 'https://t.me/rextrades0',
  telegramHandle: '@rextrades0',
  easypaisaNumber: '03260767504',
  easypaisaAccountLabel: 'Official REX TRADERS Easypaisa Account',
  heroHeadline: 'Smart Investment · Better Tomorrow',
  heroSubheadline:
    'REX TRADERS offers 12 structured 30-day investment packages from PKR 1,200 to PKR 300,000, a 3-level referral commission structure, direct support via Telegram and WhatsApp, and manual Easypaisa payment verification.',
  announcementText:
    'Official communication is conducted exclusively through our verified Telegram support (@rextrades0) and WhatsApp Channel.',
};

export const HERO_VISUAL_ASSET = heroWorkspaceImg;

export const REFERRAL_LEVELS: ReferralLevel[] = [
  {
    level: '1 Level',
    commission: '12%',
    description: 'Direct referral commission on Level 1 partner plan activations',
  },
  {
    level: '2 Level',
    commission: '03%',
    description: 'Secondary network commission on Level 2 plan activations',
  },
  {
    level: '3 Level',
    commission: '02%',
    description: 'Third-tier network commission on Level 3 plan activations',
  },
];

export const DEFAULT_PLANS: ServicePlan[] = [
  {
    id: 'plan-1200',
    name: 'Plan 01 — 1,200 Investment',
    targetAudience: 'انویسٹمنٹ 1200 · Starter 30-Day Package',
    price: '1,200 PKR',
    dailyProfit: '600 PKR',
    totalProfit: '18,000 PKR',
    currency: 'PKR',
    duration: '30 Days (30 دن)',
    description:
      'Entry-level 30-day package with Rs. 600 daily profit and Rs. 18,000 total 30-day return.',
    features: [
      'Investment (انویسٹمنٹ): Rs. 1,200',
      'Daily Profit (روزانہ منافع): Rs. 600',
      'Total Profit (منافع مکمل): Rs. 18,000',
      'Plan Duration (پلان مدت): 30 Days (30 دن)',
    ],
    ctaText: 'Invest Now',
    isPopular: false,
    active: true,
  },
  {
    id: 'plan-3300',
    name: 'Plan 02 — 3,300 Investment',
    targetAudience: 'انویسٹمنٹ 3300 · Basic 30-Day Package',
    price: '3,300 PKR',
    dailyProfit: '1,650 PKR',
    totalProfit: '49,500 PKR',
    currency: 'PKR',
    duration: '30 Days (30 دن)',
    description:
      'Basic 30-day package with Rs. 1,650 daily profit and Rs. 49,500 total 30-day return.',
    features: [
      'Investment (انویسٹمنٹ): Rs. 3,300',
      'Daily Profit (روزانہ منافع): Rs. 1,650',
      'Total Profit (منافع مکمل): Rs. 49,500',
      'Plan Duration (پلان مدت): 30 Days (30 دن)',
    ],
    ctaText: 'Invest Now',
    isPopular: false,
    active: true,
  },
  {
    id: 'plan-8000',
    name: 'Plan 03 — 8,000 Investment',
    targetAudience: 'انویسٹمنٹ 8000 · Standard 30-Day Package',
    price: '8,000 PKR',
    dailyProfit: '4,000 PKR',
    totalProfit: '120,000 PKR',
    currency: 'PKR',
    duration: '30 Days (30 دن)',
    description:
      'Standard 30-day package with Rs. 4,000 daily profit and Rs. 120,000 total 30-day return.',
    features: [
      'Investment (انویسٹمنٹ): Rs. 8,000',
      'Daily Profit (روزانہ منافع): Rs. 4,000',
      'Total Profit (منافع مکمل): Rs. 120,000',
      'Plan Duration (پلان مدت): 30 Days (30 دن)',
    ],
    ctaText: 'Invest Now',
    isPopular: true,
    active: true,
  },
  {
    id: 'plan-15000',
    name: 'Plan 04 — 15,000 Investment',
    targetAudience: 'انویسٹمنٹ 15000 · Silver 30-Day Package',
    price: '15,000 PKR',
    dailyProfit: '7,500 PKR',
    totalProfit: '225,000 PKR',
    currency: 'PKR',
    duration: '30 Days (30 دن)',
    description:
      'Silver 30-day package with Rs. 7,500 daily profit and Rs. 225,000 total 30-day return.',
    features: [
      'Investment (انویسٹمنٹ): Rs. 15,000',
      'Daily Profit (روزانہ منافع): Rs. 7,500',
      'Total Profit (منافع مکمل): Rs. 225,000',
      'Plan Duration (پلان مدت): 30 Days (30 دن)',
    ],
    ctaText: 'Invest Now',
    isPopular: false,
    active: true,
  },
  {
    id: 'plan-28000',
    name: 'Plan 05 — 28,000 Investment',
    targetAudience: 'انویسٹمنٹ 28000 · Growth 30-Day Package',
    price: '28,000 PKR',
    dailyProfit: '14,000 PKR',
    totalProfit: '420,000 PKR',
    currency: 'PKR',
    duration: '30 Days (30 دن)',
    description:
      'Growth 30-day package with Rs. 14,000 daily profit and Rs. 420,000 total 30-day return.',
    features: [
      'Investment (انویسٹمنٹ): Rs. 28,000',
      'Daily Profit (روزانہ منافع): Rs. 14,000',
      'Total Profit (منافع مکمل): Rs. 420,000',
      'Plan Duration (پلان مدت): 30 Days (30 دن)',
    ],
    ctaText: 'Invest Now',
    isPopular: false,
    active: true,
  },
  {
    id: 'plan-45000',
    name: 'Plan 06 — 45,000 Investment',
    targetAudience: 'انویسٹمنٹ 45000 · Gold 30-Day Package',
    price: '45,000 PKR',
    dailyProfit: '22,500 PKR',
    totalProfit: '675,000 PKR',
    currency: 'PKR',
    duration: '30 Days (30 دن)',
    description:
      'Gold 30-day package with Rs. 22,500 daily profit and Rs. 675,000 total 30-day return.',
    features: [
      'Investment (انویسٹمنٹ): Rs. 45,000',
      'Daily Profit (روزانہ منافع): Rs. 22,500',
      'Total Profit (منافع مکمل): Rs. 675,000',
      'Plan Duration (پلان مدت): 30 Days (30 دن)',
    ],
    ctaText: 'Invest Now',
    isPopular: true,
    active: true,
  },
  {
    id: 'plan-62000',
    name: 'Plan 07 — 62,000 Investment',
    targetAudience: 'انویسٹمنٹ 62000 · Premier 30-Day Package',
    price: '62,000 PKR',
    dailyProfit: '31,000 PKR',
    totalProfit: '930,000 PKR',
    currency: 'PKR',
    duration: '30 Days (30 دن)',
    description:
      'Premier 30-day package with Rs. 31,000 daily profit and Rs. 930,000 total 30-day return.',
    features: [
      'Investment (انویسٹمنٹ): Rs. 62,000',
      'Daily Profit (روزانہ منافع): Rs. 31,000',
      'Total Profit (منافع مکمل): Rs. 930,000',
      'Plan Duration (پلان مدت): 30 Days (30 دن)',
    ],
    ctaText: 'Invest Now',
    isPopular: false,
    active: true,
  },
  {
    id: 'plan-85000',
    name: 'Plan 08 — 85,000 Investment',
    targetAudience: 'انویسٹمنٹ 85000 · Platinum 30-Day Package',
    price: '85,000 PKR',
    dailyProfit: '42,500 PKR',
    totalProfit: '1,275,000 PKR',
    currency: 'PKR',
    duration: '30 Days (30 دن)',
    description:
      'Platinum 30-day package with Rs. 42,500 daily profit and Rs. 1,275,000 total 30-day return.',
    features: [
      'Investment (انویسٹمنٹ): Rs. 85,000',
      'Daily Profit (روزانہ منافع): Rs. 42,500',
      'Total Profit (منافع مکمل): Rs. 1,275,000',
      'Plan Duration (پلان مدت): 30 Days (30 دن)',
    ],
    ctaText: 'Invest Now',
    isPopular: false,
    active: true,
  },
  {
    id: 'plan-115000',
    name: 'Plan 09 — 115,000 Investment',
    targetAudience: 'انویسٹمنٹ 115000 · Executive 30-Day Package',
    price: '115,000 PKR',
    dailyProfit: '57,500 PKR',
    totalProfit: '1,275,000 PKR',
    currency: 'PKR',
    duration: '30 Days (30 دن)',
    description:
      'Executive 30-day package with Rs. 57,500 daily profit and Rs. 1,275,000 total 30-day return.',
    features: [
      'Investment (انویسٹمنٹ): Rs. 115,000',
      'Daily Profit (روزانہ منافع): Rs. 57,500',
      'Total Profit (منافع مکمل): Rs. 1,275,000',
      'Plan Duration (پلان مدت): 30 Days (30 دن)',
    ],
    ctaText: 'Invest Now',
    isPopular: false,
    active: true,
  },
  {
    id: 'plan-180000',
    name: 'Plan 10 — 180,000 Investment',
    targetAudience: 'انویسٹمنٹ 180000 · Diamond 30-Day Package',
    price: '180,000 PKR',
    dailyProfit: '90,000 PKR',
    totalProfit: '2,700,000 PKR',
    currency: 'PKR',
    duration: '30 Days (30 دن)',
    description:
      'Diamond 30-day package with Rs. 90,000 daily profit and Rs. 2,700,000 total 30-day return.',
    features: [
      'Investment (انویسٹمنٹ): Rs. 180,000',
      'Daily Profit (روزانہ منافع): Rs. 90,000',
      'Total Profit (منافع مکمل): Rs. 2,700,000',
      'Plan Duration (پلان مدت): 30 Days (30 دن)',
    ],
    ctaText: 'Invest Now',
    isPopular: false,
    active: true,
  },
  {
    id: 'plan-250000',
    name: 'Plan 11 — 250,000 Investment',
    targetAudience: 'انویسٹمنٹ 250000 · Elite 30-Day Package',
    price: '250,000 PKR',
    dailyProfit: '125,000 PKR',
    totalProfit: '3,750,000 PKR',
    currency: 'PKR',
    duration: '30 Days (30 دن)',
    description:
      'Elite 30-day package with Rs. 125,000 daily profit and Rs. 3,750,000 total 30-day return.',
    features: [
      'Investment (انویسٹمنٹ): Rs. 250,000',
      'Daily Profit (روزانہ منافع): Rs. 125,000',
      'Total Profit (منافع مکمل): Rs. 3,750,000',
      'Plan Duration (پلان مدت): 30 Days (30 دن)',
    ],
    ctaText: 'Invest Now',
    isPopular: false,
    active: true,
  },
  {
    id: 'plan-300000',
    name: 'Plan 12 — 300,000 Investment',
    targetAudience: 'انویسٹمنٹ 300000 · Crown 30-Day Package',
    price: '300,000 PKR',
    dailyProfit: '150,000 PKR',
    totalProfit: '4,500,000 PKR',
    currency: 'PKR',
    duration: '30 Days (30 دن)',
    description:
      'Top-tier 30-day package with Rs. 150,000 daily profit and Rs. 4,500,000 total 30-day return.',
    features: [
      'Investment (انویسٹمنٹ): Rs. 300,000',
      'Daily Profit (روزانہ منافع): Rs. 150,000',
      'Total Profit (منافع مکمل): Rs. 4,500,000',
      'Plan Duration (پلان مدت): 30 Days (30 دن)',
    ],
    ctaText: 'Invest Now',
    isPopular: true,
    active: true,
  },
];

export const DEFAULT_FEATURES: FeatureItem[] = [
  {
    id: 'feat-1',
    number: '01',
    title: '12 Structured 30-Day Packages',
    description:
      'Choose from 12 clearly defined 30-day plans starting from Rs. 1,200 up to Rs. 300,000 with transparent daily and total profit schedules.',
    outcome: 'PKR 1,200 to PKR 300,000 tiers',
  },
  {
    id: 'feat-2',
    number: '02',
    title: '3-Level Referral Commission',
    description:
      'Earn structured referral rewards across three tiers: 12% on Level 1, 03% on Level 2, and 02% on Level 3 team activations.',
    outcome: '12% · 03% · 02% referral levels',
  },
  {
    id: 'feat-3',
    number: '03',
    title: 'Direct Support & Guidance',
    description:
      'Connect directly with the REX TRADERS support desk on Telegram (@rextrades0) for onboarding questions, plan selection, and account assistance.',
    outcome: 'Direct Telegram support (@rextrades0)',
  },
  {
    id: 'feat-4',
    number: '04',
    title: 'Convenient Easypaisa Deposits',
    description:
      'Transfer your selected plan investment to our official Easypaisa account (03260767504) and log your Transaction ID in the Client Portal.',
    outcome: 'Official Easypaisa: 03260767504',
  },
  {
    id: 'feat-5',
    number: '05',
    title: 'Official WhatsApp Channel Updates',
    description:
      'Stay informed with official announcements, schedule notices, and community updates broadcast via our official WhatsApp Channel.',
    outcome: 'Official WhatsApp Channel broadcasts',
  },
  {
    id: 'feat-6',
    number: '06',
    title: 'Verified Account & Payment Workflow',
    description:
      'Submit Easypaisa transaction details directly in your account portal. Every submission is manually reviewed by an administrator before status approval.',
    outcome: 'Manual administrator payment verification',
  },
];

export const DEFAULT_HOW_IT_WORKS: HowItWorksStep[] = [
  {
    stepNumber: '01',
    title: 'Select Your 30-Day Plan',
    description:
      'Review the 12 official REX TRADERS packages (from 1,200 PKR to 300,000 PKR) and choose the tier that fits your budget.',
    actionLabel: 'Browse 12 Plans',
  },
  {
    stepNumber: '02',
    title: 'Transfer via Official Easypaisa',
    description:
      'Send the exact investment amount for your chosen plan to our official Easypaisa number (03260767504) and save your Transaction ID (TID).',
    actionLabel: 'Copy Easypaisa Number',
  },
  {
    stepNumber: '03',
    title: 'Submit Transaction ID in Portal',
    description:
      'Sign in to the REX TRADERS Client Portal (or message Telegram Support @rextrades0) and submit your Transaction ID and sender number.',
    actionLabel: 'Submit Payment Reference',
  },
  {
    stepNumber: '04',
    title: 'Admin Approval & Plan Activation',
    description:
      'Our administrator verifies your Easypaisa transfer and marks your transaction Approved, activating your 30-day plan in your dashboard.',
    actionLabel: 'Open Client Portal',
  },
];

export const DEFAULT_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'Plans & Packages',
    question: 'What investment plans are available on REX TRADERS?',
    answer:
      'REX TRADERS offers 12 official 30-day plans: 1,200 PKR, 3,300 PKR, 8,000 PKR, 15,000 PKR, 28,000 PKR, 45,000 PKR, 62,000 PKR, 85,000 PKR, 115,000 PKR, 180,000 PKR, 250,000 PKR, and 300,000 PKR. Each plan has a 30-day (30 دن) duration.',
  },
  {
    id: 'faq-2',
    category: 'Referral Commission',
    question: 'How does the REX TRADERS Referral Commission work?',
    answer:
      'REX TRADERS features a 3-tier referral commission structure: Level 1 pays 12%, Level 2 pays 03%, and Level 3 pays 02% on qualified plan activations.',
  },
  {
    id: 'faq-3',
    category: 'Payments',
    question: 'How do I pay for my selected plan?',
    answer:
      'Send your chosen plan investment amount to our official Easypaisa number: 03260767504. Once sent, sign in to the Client Portal and submit your Transaction ID (TID), amount, and sender number for manual administrator verification.',
  },
  {
    id: 'faq-4',
    category: 'Payments',
    question: 'Are Easypaisa payments verified manually?',
    answer:
      'Yes. Every submitted Transaction ID starts with a Pending status and is only marked Approved after an administrator manually verifies the transfer against our official Easypaisa account.',
  },
  {
    id: 'faq-5',
    category: 'Contact & Channels',
    question: 'What are the official communication channels for REX TRADERS?',
    answer:
      'Our official communication channels are our Telegram Support (@rextrades0 at https://t.me/rextrades0) and our official WhatsApp Channel (https://whatsapp.com/channel/0029Vb5ZICEFSAt01mUETp3z).',
  },
  {
    id: 'faq-6',
    category: 'Account',
    question: 'How can I check the status of my submitted payment or active plan?',
    answer:
      'Sign in to the Client Portal using your registered account credentials. Your dashboard displays your current plan status, submitted Easypaisa transaction records (Pending, Approved, or Rejected), and any notes from the administrator.',
  },
];
