import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { z } from 'zod';

const PORT = 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'rex_traders_db.json');
const TOKEN_SECRET = process.env.SESSION_SECRET || 'rex-traders-hmac-secret-key-2026-prod';

// --- Password & Token Utilities ---
function hashPassword(password: string, salt?: string): string {
  const useSalt = salt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, useSalt, 64).toString('hex');
  return `${useSalt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(derived, 'hex'));
}

interface TokenPayload {
  userId: string;
  role: 'user' | 'admin';
  exp: number;
}

function signToken(payload: TokenPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verifyToken(token: string): TokenPayload | null {
  try {
    const [data, sig] = token.split('.');
    if (!data || !sig) return null;
    const expectedSig = crypto.createHmac('sha256', TOKEN_SECRET).update(data).digest('base64url');
    if (sig !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8')) as TokenPayload;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// --- Database Types & Initial Seed ---
interface StoredUser {
  id: string;
  name: string;
  identifier: string;
  passwordHash: string;
  role: 'user' | 'admin';
  activePlanId: string | null;
  createdAt: string;
}

interface StoredPlan {
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

interface StoredTransaction {
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
  status: 'Pending' | 'Approved' | 'Rejected';
  adminNotes: string;
  reviewedAt: string | null;
}

interface StoredInquiry {
  id: string;
  name: string;
  contactInfo: string;
  subject: string;
  message: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  adminReply: string;
  createdAt: string;
}

interface StoredSettings {
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

interface DatabaseSchema {
  settings: StoredSettings;
  users: StoredUser[];
  plans: StoredPlan[];
  transactions: StoredTransaction[];
  inquiries: StoredInquiry[];
}

const INITIAL_PLANS: StoredPlan[] = [
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

const INITIAL_DB: DatabaseSchema = {
  settings: {
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
  },
  users: [
    {
      id: 'usr-admin-1',
      name: 'REX TRADERS Administrator',
      identifier: 'admin@rextraders.com',
      passwordHash: hashPassword('RexAdmin2026!'),
      role: 'admin',
      activePlanId: 'plan-8000',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr-client-1',
      name: 'Client Account',
      identifier: 'client@rextraders.com',
      passwordHash: hashPassword('RexClient2026!'),
      role: 'user',
      activePlanId: null,
      createdAt: new Date().toISOString(),
    },
  ],
  plans: INITIAL_PLANS,
  transactions: [],
  inquiries: [],
};

function loadDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), 'utf-8');
      return JSON.parse(JSON.stringify(INITIAL_DB));
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as DatabaseSchema;

    // Synchronize official contact channels and logo
    parsed.settings.whatsappChannelUrl = 'https://whatsapp.com/channel/0029Vb5ZICEFSAt01mUETp3z';
    parsed.settings.telegramSupportUrl = 'https://t.me/rextrades0';
    parsed.settings.easypaisaNumber = '03260767504';
    if (!parsed.settings.logoUrl) {
      parsed.settings.logoUrl = '/rex-traders-logo.svg';
    }

    // Migrate old placeholder plans to the 12 official REX TRADERS plans
    const hasLegacyPlans = parsed.plans.some((p) => p.id === 'plan-standard');
    if (hasLegacyPlans || parsed.plans.length === 0) {
      parsed.plans = JSON.parse(JSON.stringify(INITIAL_PLANS));
      parsed.settings.heroHeadline = INITIAL_DB.settings.heroHeadline;
      parsed.settings.heroSubheadline = INITIAL_DB.settings.heroSubheadline;
      saveDb(parsed);
    }

    return parsed;
  } catch {
    return JSON.parse(JSON.stringify(INITIAL_DB));
  }
}

function saveDb(db: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tempFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}

// --- Simple In-Memory Rate Limiter ---
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function rateLimit(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${req.path}:${ip}`;
    const now = Date.now();
    const record = rateLimitMap.get(key);
    if (!record || now > record.resetAt) {
      rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    if (record.count >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests. Please wait a moment and try again.',
      });
    }
    record.count += 1;
    return next();
  };
}

// --- Input Sanitization Helper ---
function sanitizeText(str: string): string {
  return str.replace(/[<>]/g, '').trim();
}

// --- Zod Validation Schemas ---
const RegisterSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters').max(80),
  identifier: z
    .string()
    .min(4, 'Email or phone number must be at least 4 characters')
    .max(100),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
});

const LoginSchema = z.object({
  identifier: z.string().min(1, 'Email or phone number is required'),
  password: z.string().min(1, 'Password is required'),
});

const TransactionSubmitSchema = z.object({
  planId: z.string().min(1, 'Please select a valid service plan'),
  transactionId: z
    .string()
    .min(5, 'Easypaisa Transaction ID (TID) must be at least 5 characters')
    .max(40, 'Transaction ID is too long'),
  amount: z.string().min(1, 'Transferred amount is required').max(40),
  senderNumber: z
    .string()
    .min(10, 'Sender mobile/account number must be at least 10 digits')
    .max(20),
});

const TransactionReviewSchema = z.object({
  status: z.enum(['Pending', 'Approved', 'Rejected']),
  adminNotes: z.string().max(500).optional().default(''),
});

const PlanSchema = z.object({
  name: z.string().min(2, 'Plan name is required').max(80),
  targetAudience: z.string().min(4, 'Target audience summary is required').max(160),
  price: z.string().min(1, 'Price label is required').max(60),
  currency: z.string().min(1).max(10).default('PKR'),
  duration: z.string().min(2, 'Duration is required').max(60),
  description: z.string().min(10, 'Description is required').max(400),
  features: z.array(z.string().min(1).max(140)).min(1, 'Include at least 1 feature'),
  ctaText: z.string().min(2).max(40).default('Select Plan'),
  isPopular: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
});

const InquirySchema = z.object({
  name: z.string().min(2, 'Your name is required').max(80),
  contactInfo: z
    .string()
    .min(4, 'Telegram username, WhatsApp number, or email is required')
    .max(100),
  subject: z.string().min(3, 'Subject is required').max(120),
  message: z.string().min(10, 'Please provide at least 10 characters in your message').max(1500),
});

const InquiryUpdateSchema = z.object({
  status: z.enum(['Open', 'In Progress', 'Resolved']),
  adminReply: z.string().max(1000).optional().default(''),
});

const SettingsUpdateSchema = z.object({
  logoUrl: z.string().max(500000).nullable().optional(),
  heroHeadline: z.string().min(5).max(160).optional(),
  heroSubheadline: z.string().min(10).max(400).optional(),
  announcementText: z.string().max(250).optional(),
});

// --- Auth Middleware ---
interface AuthenticatedRequest extends Request {
  user?: StoredUser;
}

function getAuthenticatedUser(req: Request, db: DatabaseSchema): StoredUser | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  const payload = verifyToken(token);
  if (!payload) return null;
  const user = db.users.find((u) => u.id === payload.userId);
  return user || null;
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const db = loadDb();
  const user = getAuthenticatedUser(req, db);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  req.user = user;
  next();
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const db = loadDb();
  const user = getAuthenticatedUser(req, db);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator privileges required.' });
  }
  req.user = user;
  next();
}

async function startServer() {
  const app = express();

  // Security headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  app.use(express.json({ limit: '1mb' }));

  // Ensure DB is initialized
  loadDb();

  // --- Public API Routes ---
  app.get('/api/public/bootstrap', (_req, res) => {
    const db = loadDb();
    const activePlans = db.plans.filter((p) => p.active);
    res.json({
      settings: db.settings,
      plans: activePlans,
    });
  });

  // --- Auth Routes ---
  app.post('/api/auth/register', rateLimit(15, 60_000), (req, res) => {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Invalid registration data',
      });
    }

    const db = loadDb();
    const normalizedIdentifier = sanitizeText(parsed.data.identifier).toLowerCase();
    const existing = db.users.find((u) => u.identifier.toLowerCase() === normalizedIdentifier);
    if (existing) {
      return res.status(409).json({
        error: 'An account with this email or phone number already exists.',
      });
    }

    const newUser: StoredUser = {
      id: `usr-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      name: sanitizeText(parsed.data.name),
      identifier: normalizedIdentifier,
      passwordHash: hashPassword(parsed.data.password),
      role: 'user',
      activePlanId: null,
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    saveDb(db);

    const token = signToken({
      userId: newUser.id,
      role: newUser.role,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        identifier: newUser.identifier,
        role: newUser.role,
        activePlanId: newUser.activePlanId,
        createdAt: newUser.createdAt,
      },
    });
  });

  app.post('/api/auth/login', rateLimit(20, 60_000), (req, res) => {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Invalid login credentials',
      });
    }

    const db = loadDb();
    const normalizedIdentifier = sanitizeText(parsed.data.identifier).toLowerCase();
    const user = db.users.find((u) => u.identifier.toLowerCase() === normalizedIdentifier);

    if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
      return res.status(401).json({
        error: 'Invalid email/phone or password.',
      });
    }

    const token = signToken({
      userId: user.id,
      role: user.role,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        identifier: user.identifier,
        role: user.role,
        activePlanId: user.activePlanId,
        createdAt: user.createdAt,
      },
    });
  });

  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
    const u = req.user!;
    res.json({
      user: {
        id: u.id,
        name: u.name,
        identifier: u.identifier,
        role: u.role,
        activePlanId: u.activePlanId,
        createdAt: u.createdAt,
      },
    });
  });

  // --- Client Portal: Transactions ---
  app.get('/api/transactions/my', requireAuth, (req: AuthenticatedRequest, res) => {
    const db = loadDb();
    const list = db.transactions
      .filter((t) => t.userId === req.user!.id)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    res.json({ transactions: list });
  });

  app.post(
    '/api/transactions',
    requireAuth,
    rateLimit(10, 60_000),
    (req: AuthenticatedRequest, res) => {
      const parsed = TransactionSubmitSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: parsed.error.issues[0]?.message || 'Invalid transaction details',
        });
      }

      const db = loadDb();
      const plan = db.plans.find((p) => p.id === parsed.data.planId);
      if (!plan) {
        return res.status(404).json({ error: 'Selected plan was not found.' });
      }

      const cleanTid = sanitizeText(parsed.data.transactionId);
      const duplicate = db.transactions.find(
        (t) => t.transactionId.toLowerCase() === cleanTid.toLowerCase()
      );
      if (duplicate) {
        return res.status(409).json({
          error: 'This Easypaisa Transaction ID has already been submitted.',
        });
      }

      const newTx: StoredTransaction = {
        id: `tx-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
        userId: req.user!.id,
        userName: req.user!.name,
        userIdentifier: req.user!.identifier,
        planId: plan.id,
        planName: plan.name,
        transactionId: cleanTid,
        amount: sanitizeText(parsed.data.amount),
        paymentMethod: `Easypaisa (${db.settings.easypaisaNumber})`,
        senderNumber: sanitizeText(parsed.data.senderNumber),
        submittedAt: new Date().toISOString(),
        status: 'Pending',
        adminNotes: 'Awaiting manual administrator verification of Easypaisa transfer.',
        reviewedAt: null,
      };

      db.transactions.push(newTx);
      saveDb(db);

      return res.status(201).json({
        transaction: newTx,
        message:
          'Payment reference recorded with status: Pending. An administrator will verify your Easypaisa Transaction ID before activating your plan.',
      });
    }
  );

  // --- Public & Client Support Inquiries ---
  app.post('/api/inquiries', rateLimit(10, 60_000), (req, res) => {
    const parsed = InquirySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Please check your inquiry fields.',
      });
    }

    const db = loadDb();
    const inquiry: StoredInquiry = {
      id: `inq-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      name: sanitizeText(parsed.data.name),
      contactInfo: sanitizeText(parsed.data.contactInfo),
      subject: sanitizeText(parsed.data.subject),
      message: sanitizeText(parsed.data.message),
      status: 'Open',
      adminReply: '',
      createdAt: new Date().toISOString(),
    };

    db.inquiries.push(inquiry);
    saveDb(db);

    return res.status(201).json({
      inquiry,
      message:
        'Your support request has been logged. For immediate assistance, you can also message us directly on Telegram (@rextrades0).',
    });
  });

  // --- Admin Panel Routes (Strictly Server-Side Protected) ---
  app.get('/api/admin/overview', requireAdmin, (_req: AuthenticatedRequest, res) => {
    const db = loadDb();
    const safeUsers = db.users.map((u) => ({
      id: u.id,
      name: u.name,
      identifier: u.identifier,
      role: u.role,
      activePlanId: u.activePlanId,
      createdAt: u.createdAt,
    }));

    res.json({
      settings: db.settings,
      users: safeUsers,
      plans: db.plans,
      transactions: [...db.transactions].sort(
        (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      ),
      inquiries: [...db.inquiries].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    });
  });

  app.patch('/api/admin/transactions/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
    const parsed = TransactionReviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Invalid review payload',
      });
    }

    const db = loadDb();
    const tx = db.transactions.find((t) => t.id === req.params.id);
    if (!tx) {
      return res.status(404).json({ error: 'Transaction record not found.' });
    }

    tx.status = parsed.data.status;
    tx.adminNotes = sanitizeText(parsed.data.adminNotes);
    tx.reviewedAt = new Date().toISOString();

    // If Approved, assign the plan to the user's account
    const user = db.users.find((u) => u.id === tx.userId);
    if (user) {
      if (parsed.data.status === 'Approved') {
        user.activePlanId = tx.planId;
      } else if (parsed.data.status === 'Rejected' && user.activePlanId === tx.planId) {
        user.activePlanId = null;
      }
    }

    saveDb(db);
    return res.json({ transaction: tx });
  });

  app.post('/api/admin/plans', requireAdmin, (req: AuthenticatedRequest, res) => {
    const parsed = PlanSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Invalid plan configuration',
      });
    }

    const db = loadDb();
    const newPlan: StoredPlan = {
      id: `plan-${Date.now()}`,
      name: sanitizeText(parsed.data.name),
      targetAudience: sanitizeText(parsed.data.targetAudience),
      price: sanitizeText(parsed.data.price),
      currency: sanitizeText(parsed.data.currency),
      duration: sanitizeText(parsed.data.duration),
      description: sanitizeText(parsed.data.description),
      features: parsed.data.features.map((f) => sanitizeText(f)),
      ctaText: sanitizeText(parsed.data.ctaText),
      isPopular: Boolean(parsed.data.isPopular),
      active: Boolean(parsed.data.active),
    };

    db.plans.push(newPlan);
    saveDb(db);
    return res.status(201).json({ plan: newPlan });
  });

  app.put('/api/admin/plans/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
    const parsed = PlanSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Invalid plan configuration',
      });
    }

    const db = loadDb();
    const idx = db.plans.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Plan not found.' });
    }

    db.plans[idx] = {
      ...db.plans[idx],
      name: sanitizeText(parsed.data.name),
      targetAudience: sanitizeText(parsed.data.targetAudience),
      price: sanitizeText(parsed.data.price),
      currency: sanitizeText(parsed.data.currency),
      duration: sanitizeText(parsed.data.duration),
      description: sanitizeText(parsed.data.description),
      features: parsed.data.features.map((f) => sanitizeText(f)),
      ctaText: sanitizeText(parsed.data.ctaText),
      isPopular: Boolean(parsed.data.isPopular),
      active: Boolean(parsed.data.active),
    };

    saveDb(db);
    return res.json({ plan: db.plans[idx] });
  });

  app.delete('/api/admin/plans/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
    const db = loadDb();
    const idx = db.plans.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Plan not found.' });
    }
    db.plans.splice(idx, 1);
    saveDb(db);
    return res.json({ success: true });
  });

  app.patch('/api/admin/inquiries/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
    const parsed = InquiryUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Invalid inquiry update',
      });
    }

    const db = loadDb();
    const inquiry = db.inquiries.find((i) => i.id === req.params.id);
    if (!inquiry) {
      return res.status(404).json({ error: 'Support inquiry not found.' });
    }

    inquiry.status = parsed.data.status;
    inquiry.adminReply = sanitizeText(parsed.data.adminReply);
    saveDb(db);
    return res.json({ inquiry });
  });

  app.put('/api/admin/settings', requireAdmin, (req: AuthenticatedRequest, res) => {
    const parsed = SettingsUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Invalid settings data',
      });
    }

    const db = loadDb();
    if (parsed.data.logoUrl !== undefined) {
      db.settings.logoUrl = parsed.data.logoUrl ? parsed.data.logoUrl.trim() : null;
    }
    if (parsed.data.heroHeadline !== undefined) {
      db.settings.heroHeadline = sanitizeText(parsed.data.heroHeadline);
    }
    if (parsed.data.heroSubheadline !== undefined) {
      db.settings.heroSubheadline = sanitizeText(parsed.data.heroSubheadline);
    }
    if (parsed.data.announcementText !== undefined) {
      db.settings.announcementText = sanitizeText(parsed.data.announcementText);
    }

    saveDb(db);
    return res.json({ settings: db.settings });
  });

  app.patch('/api/admin/users/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
    const db = loadDb();
    const user = db.users.find((u) => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    if (typeof req.body.activePlanId === 'string' || req.body.activePlanId === null) {
      user.activePlanId = req.body.activePlanId;
    }
    if (req.body.role === 'user' || req.body.role === 'admin') {
      // Prevent removing own admin role
      if (user.id !== req.user!.id) {
        user.role = req.body.role;
      }
    }
    saveDb(db);
    return res.json({
      user: {
        id: user.id,
        name: user.name,
        identifier: user.identifier,
        role: user.role,
        activePlanId: user.activePlanId,
        createdAt: user.createdAt,
      },
    });
  });

  // Catch-all for unknown API endpoints
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`REX TRADERS server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
