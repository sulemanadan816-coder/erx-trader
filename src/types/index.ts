export type PageRoute =
  | 'home'
  | 'about'
  | 'services'
  | 'plans'
  | 'how-it-works'
  | 'faq'
  | 'contact'
  | 'terms'
  | 'privacy'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'admin'
  | 'not-found';

export interface ServicePlan {
  id: string;
  name: string;
  targetAudience: string;
  price: string;
  dailyProfit?: string;
  totalProfit?: string;
  currency: string;
  duration: string;
  description: string;
  features: string[];
  ctaText: string;
  isPopular?: boolean;
  active: boolean;
}

export interface ReferralLevel {
  level: string;
  commission: string;
  description: string;
}

export interface FeatureItem {
  id: string;
  number: string;
  title: string;
  description: string;
  outcome: string;
}

export interface HowItWorksStep {
  stepNumber: string;
  title: string;
  description: string;
  actionLabel: string;
}

export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export interface UserAccount {
  id: string;
  name: string;
  identifier: string; // email or phone/username
  role: 'user' | 'admin';
  activePlanId?: string | null;
  createdAt: string;
}

export type TransactionStatus = 'Pending' | 'Approved' | 'Rejected';

export interface PaymentTransaction {
  id: string;
  userId: string;
  userName: string;
  userIdentifier: string;
  planId: string;
  planName: string;
  transactionId: string;
  amount: string;
  paymentMethod: string;
  senderNumber: string;
  submittedAt: string;
  status: TransactionStatus;
  adminNotes: string;
  reviewedAt?: string | null;
}

export type InquiryStatus = 'Open' | 'In Progress' | 'Resolved';

export interface SupportInquiry {
  id: string;
  name: string;
  contactInfo: string;
  subject: string;
  message: string;
  status: InquiryStatus;
  adminReply: string;
  createdAt: string;
}

export interface SiteSettings {
  brandName: string;
  logoUrl: string | null;
  logoAlt: string;
  whatsappChannelUrl: string;
  telegramSupportUrl: string;
  telegramHandle: string;
  easypaisaNumber: string;
  easypaisaAccountLabel: string;
  heroHeadline: string;
  heroSubheadline: string;
  announcementText: string;
}
