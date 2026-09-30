import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type {
  AuditLogEntry,
  DepositStatus,
  InquiryStatus,
  LedgerEntry,
  PaymentTransaction,
  SavedPayoutAccount,
  ServiceOrder,
  ServicePlan,
  SiteSettings,
  SupportInquiry,
  UnifiedTransaction,
  UserAccount,
  UserNotification,
  WalletAccount,
  WithdrawalMethodConfig,
  WithdrawalRequest,
  WithdrawalStatus,
} from '../types/index.ts';

const TOKEN_SECRET = process.env.SESSION_SECRET || 'rex-traders-hmac-secret-key-2026-prod';

export const OWNER_ADMIN_EMAIL = 'sulemanadan816@gmail.com';

export function hashPassword(password: string, salt?: string): string {
  const useSalt = salt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, useSalt, 64).toString('hex');
  return `${useSalt}:${derived}`;
}

// Pre-computed scrypt hashes for seeded accounts so createInitialDb() never blocks the event loop
const DEFAULT_OWNER_ADMIN_HASH = hashPassword(
  'Suleman@Rex2026!',
  '999bbb5c43dca034a75792ab5c0d7b9a'
);
const DEFAULT_CLIENT_PASSWORD_HASH =
  '2b2fb7c338ca016f82fcb3040ca12a22:7a297f0499c88226a1f736aff551da75e9e4b80490f276e3cd8a76865841e38a8457c4da85b8a23e40723af6ed862a8e81dd83108dba75e3064d7ffe33c5c07f';

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(derived, 'hex'));
}

export interface TokenPayload {
  userId: string;
  role: 'user' | 'admin';
  exp: number;
}

export function signToken(payload: TokenPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function verifyToken(token: string): TokenPayload | null {
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

export function maskAccountNumber(accountNumber: string): string {
  const clean = accountNumber.trim();
  if (clean.length <= 4) return clean;
  const visibleEnd = clean.slice(-4);
  const visibleStart = clean.slice(0, 2);
  return `${visibleStart}${'*'.repeat(Math.max(3, clean.length - 6))}${visibleEnd}`;
}

export function parseNumericPkr(val: string | number): number {
  if (typeof val === 'number') return Math.round(val);
  const digits = val.replace(/[^0-9.]/g, '');
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? Math.round(parsed) : 0;
}

export interface StoredUserRecord extends UserAccount {
  passwordHash: string;
  savedPayoutAccounts: SavedPayoutAccount[];
}

export interface DatabaseSchema {
  settings: SiteSettings;
  users: StoredUserRecord[];
  wallets: WalletAccount[];
  ledgerEntries: LedgerEntry[];
  unifiedTransactions: UnifiedTransaction[];
  transactions: PaymentTransaction[]; // Deposits
  orders: ServiceOrder[];
  withdrawalMethods: WithdrawalMethodConfig[];
  withdrawals: WithdrawalRequest[];
  notifications: UserNotification[];
  auditLogs: AuditLogEntry[];
  inquiries: SupportInquiry[];
  plans: ServicePlan[];
  idempotencyKeys: Record<string, { createdAt: number; resultId: string }>;
}

export const INITIAL_PLANS: ServicePlan[] = [
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

export const INITIAL_WITHDRAWAL_METHODS: WithdrawalMethodConfig[] = [
  {
    id: 'wm-easypaisa',
    name: 'Easypaisa',
    code: 'EASYPAISA',
    minAmount: 500,
    maxAmount: 500000,
    feePercent: 0,
    feeFixed: 0,
    accountLabel: 'Easypaisa Mobile Account Number (11 Digits)',
    requiresBankName: false,
    instructions: 'Enter your registered 11-digit Easypaisa mobile number and matching account title.',
    active: true,
  },
  {
    id: 'wm-jazzcash',
    name: 'JazzCash',
    code: 'JAZZCASH',
    minAmount: 500,
    maxAmount: 500000,
    feePercent: 0,
    feeFixed: 0,
    accountLabel: 'JazzCash Mobile Account Number (11 Digits)',
    requiresBankName: false,
    instructions: 'Enter your registered 11-digit JazzCash mobile number and matching account title.',
    active: true,
  },
  {
    id: 'wm-bank',
    name: 'Bank Transfer (IBAN / Account)',
    code: 'BANK_TRANSFER',
    minAmount: 1000,
    maxAmount: 2000000,
    feePercent: 0,
    feeFixed: 0,
    accountLabel: '24-Character PK IBAN or Bank Account Number',
    requiresBankName: true,
    instructions: 'Provide your full bank name, account title, and IBAN / account number.',
    active: true,
  },
];

export function createInitialDb(): DatabaseSchema {
  const now = new Date().toISOString();
  return {
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
        id: 'usr-admin-owner',
        name: 'Suleman Adan (REX TRADERS Owner)',
        identifier: OWNER_ADMIN_EMAIL,
        passwordHash: DEFAULT_OWNER_ADMIN_HASH,
        role: 'admin',
        status: 'ACTIVE',
        activePlanId: null,
        savedPayoutAccounts: [],
        createdAt: now,
      },
      {
        id: 'usr-client-1',
        name: 'Client Account',
        identifier: 'client@rextraders.com',
        passwordHash: DEFAULT_CLIENT_PASSWORD_HASH,
        role: 'user',
        status: 'ACTIVE',
        activePlanId: null,
        savedPayoutAccounts: [],
        createdAt: now,
      },
    ],
    wallets: [
      {
        id: 'wal-usr-admin-owner',
        userId: 'usr-admin-owner',
        availableBalance: 0,
        pendingBalance: 0,
        reservedWithdrawalBalance: 0,
        totalBalance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
        pendingWithdrawalsAmount: 0,
        completedWithdrawalsAmount: 0,
        currency: 'PKR',
        updatedAt: now,
      },
      {
        id: 'wal-usr-client-1',
        userId: 'usr-client-1',
        availableBalance: 0,
        pendingBalance: 0,
        reservedWithdrawalBalance: 0,
        totalBalance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
        pendingWithdrawalsAmount: 0,
        completedWithdrawalsAmount: 0,
        currency: 'PKR',
        updatedAt: now,
      },
    ],
    ledgerEntries: [],
    unifiedTransactions: [],
    transactions: [],
    orders: [],
    withdrawalMethods: JSON.parse(JSON.stringify(INITIAL_WITHDRAWAL_METHODS)),
    withdrawals: [],
    notifications: [
      {
        id: 'notif-welcome-client',
        userId: 'usr-client-1',
        title: 'Welcome to REX TRADERS Client Portal',
        message:
          'All wallet balances and transactions in this portal are 100% backed by our server-side ledger. Submit an Easypaisa deposit or select a plan to begin.',
        type: 'INFO',
        read: false,
        createdAt: now,
      },
    ],
    auditLogs: [],
    inquiries: [],
    plans: JSON.parse(JSON.stringify(INITIAL_PLANS)),
    idempotencyKeys: {},
  };
}

/**
 * Transactional Ledger Engine with Mutex Serialization & Atomic Rollback
 */
export class LedgerEngine {
  private dbFile: string;
  private dataDir: string;
  private lockQueue: Promise<unknown> = Promise.resolve();
  private cachedDb: DatabaseSchema | null = null;
  private cachedMtimeMs = 0;

  constructor(customDbFile?: string) {
    this.dbFile = customDbFile || path.resolve(process.cwd(), 'data', 'rex_traders_db.json');
    this.dataDir = path.dirname(this.dbFile);
    this.ensureInitialized();
  }

  private ensureInitialized(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    if (!fs.existsSync(this.dbFile)) {
      const initial = createInitialDb();
      this.writeDbSync(initial);
    } else {
      const db = this.readDbSync(true);
      this.writeDbSync(db);
    }
  }

  public readDbSync(forceDiskRead = false): DatabaseSchema {
    try {
      if (!forceDiskRead && this.cachedDb && fs.existsSync(this.dbFile)) {
        const stat = fs.statSync(this.dbFile);
        if (stat.mtimeMs === this.cachedMtimeMs) {
          return this.cachedDb;
        }
      }

      const raw = fs.readFileSync(this.dbFile, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<DatabaseSchema>;
      const fallback = createInitialDb();

      const resolvedPlans =
        Array.isArray(parsed.plans) &&
        parsed.plans.length > 0 &&
        !parsed.plans.some((p) => p.id === 'plan-standard')
          ? parsed.plans
          : fallback.plans;

      const validPlanIds = new Set(resolvedPlans.map((p) => p.id));

      // Purge any legacy admin@rextraders.com and strictly enforce that ONLY OWNER_ADMIN_EMAIL can have role='admin'
      const rawUsers = (parsed.users || fallback.users).filter(
        (u) => u.identifier.toLowerCase() !== 'admin@rextraders.com'
      );

      const normalizedUsers: StoredUserRecord[] = rawUsers.map((u) => {
        const isOwner = u.identifier.toLowerCase() === OWNER_ADMIN_EMAIL;
        return {
          ...u,
          role: isOwner ? 'admin' : 'user',
          status: isOwner ? 'ACTIVE' : u.status || 'ACTIVE',
          activePlanId:
            u.activePlanId && validPlanIds.has(u.activePlanId) ? u.activePlanId : null,
          savedPayoutAccounts: Array.isArray(u.savedPayoutAccounts) ? u.savedPayoutAccounts : [],
        };
      });

      if (!normalizedUsers.some((u) => u.identifier.toLowerCase() === OWNER_ADMIN_EMAIL)) {
        normalizedUsers.unshift(fallback.users[0]);
      }

      const db: DatabaseSchema = {
        settings: parsed.settings || fallback.settings,
        users: normalizedUsers,
        wallets: Array.isArray(parsed.wallets) ? parsed.wallets : fallback.wallets,
        ledgerEntries: Array.isArray(parsed.ledgerEntries) ? parsed.ledgerEntries : [],
        unifiedTransactions: Array.isArray(parsed.unifiedTransactions)
          ? parsed.unifiedTransactions
          : [],
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
        orders: Array.isArray(parsed.orders) ? parsed.orders : [],
        withdrawalMethods:
          Array.isArray(parsed.withdrawalMethods) && parsed.withdrawalMethods.length > 0
            ? parsed.withdrawalMethods
            : fallback.withdrawalMethods,
        withdrawals: Array.isArray(parsed.withdrawals) ? parsed.withdrawals : [],
        notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
        auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : [],
        inquiries: Array.isArray(parsed.inquiries) ? parsed.inquiries : [],
        plans: resolvedPlans,
        idempotencyKeys: parsed.idempotencyKeys || {},
      };

      // Ensure official channels stay synced
      db.settings.whatsappChannelUrl = 'https://whatsapp.com/channel/0029Vb5ZICEFSAt01mUETp3z';
      db.settings.telegramSupportUrl = 'https://t.me/rextrades0';
      db.settings.easypaisaNumber = '03260767504';
      if (!db.settings.logoUrl) {
        db.settings.logoUrl = '/rex-traders-logo.svg';
      }

      // Ensure every user has an authoritative Wallet row
      for (const u of db.users) {
        this.getOrCreateWallet(db, u.id);
      }

      if (fs.existsSync(this.dbFile)) {
        this.cachedMtimeMs = fs.statSync(this.dbFile).mtimeMs;
      }
      this.cachedDb = db;
      return db;
    } catch {
      const initial = createInitialDb();
      this.cachedDb = initial;
      return initial;
    }
  }

  private writeDbSync(db: DatabaseSchema): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    const tempFile = `${this.dbFile}.${crypto.randomBytes(4).toString('hex')}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tempFile, this.dbFile);
    this.cachedDb = db;
    if (fs.existsSync(this.dbFile)) {
      this.cachedMtimeMs = fs.statSync(this.dbFile).mtimeMs;
    }
  }

  /**
   * Executes a callback inside an exclusive serialized mutex lock with atomic rollback on error.
   */
  public async runInTransaction<T>(fn: (db: DatabaseSchema) => T | Promise<T>): Promise<T> {
    const execute = async (): Promise<T> => {
      const db = this.readDbSync();
      const result = await fn(db);
      // Recompute derived wallet totals before committing
      for (const u of db.users) {
        this.recalculateWalletDerivedMetrics(db, u.id);
      }
      this.writeDbSync(db);
      return result;
    };

    const next = this.lockQueue.then(execute, execute);
    this.lockQueue = next.then(
      () => undefined,
      () => undefined
    );
    return next;
  }

  public getOrCreateWallet(db: DatabaseSchema, userId: string): WalletAccount {
    let wallet = db.wallets.find((w) => w.userId === userId);
    if (!wallet) {
      wallet = {
        id: `wal-${userId}`,
        userId,
        availableBalance: 0,
        pendingBalance: 0,
        reservedWithdrawalBalance: 0,
        totalBalance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
        pendingWithdrawalsAmount: 0,
        completedWithdrawalsAmount: 0,
        currency: 'PKR',
        updatedAt: new Date().toISOString(),
      };
      db.wallets.push(wallet);
    }
    this.recalculateWalletDerivedMetrics(db, userId);
    return wallet;
  }

  public recalculateWalletDerivedMetrics(db: DatabaseSchema, userId: string): WalletAccount {
    let wallet = db.wallets.find((w) => w.userId === userId);
    if (!wallet) {
      wallet = {
        id: `wal-${userId}`,
        userId,
        availableBalance: 0,
        pendingBalance: 0,
        reservedWithdrawalBalance: 0,
        totalBalance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
        pendingWithdrawalsAmount: 0,
        completedWithdrawalsAmount: 0,
        currency: 'PKR',
        updatedAt: new Date().toISOString(),
      };
      db.wallets.push(wallet);
    }

    const pendingDepositsTotal = db.transactions
      .filter((t) => t.userId === userId && t.status === 'Pending')
      .reduce((sum, t) => sum + (t.numericAmount || parseNumericPkr(t.amount)), 0);

    const approvedDepositsTotal = db.transactions
      .filter((t) => t.userId === userId && t.status === 'Approved')
      .reduce((sum, t) => sum + (t.numericAmount || parseNumericPkr(t.amount)), 0);

    const pendingWithdrawalsTotal = db.withdrawals
      .filter((w) => w.userId === userId && (w.status === 'PENDING' || w.status === 'PROCESSING'))
      .reduce((sum, w) => sum + w.amount, 0);

    const completedWithdrawalsTotal = db.withdrawals
      .filter((w) => w.userId === userId && w.status === 'COMPLETED')
      .reduce((sum, w) => sum + w.amount, 0);

    wallet.reservedWithdrawalBalance = pendingWithdrawalsTotal;
    wallet.pendingWithdrawalsAmount = pendingWithdrawalsTotal;
    wallet.completedWithdrawalsAmount = completedWithdrawalsTotal;
    wallet.pendingBalance = pendingDepositsTotal + pendingWithdrawalsTotal;
    wallet.totalDeposited = approvedDepositsTotal;
    wallet.totalWithdrawn = completedWithdrawalsTotal;
    wallet.totalBalance = wallet.availableBalance + wallet.reservedWithdrawalBalance;
    wallet.updatedAt = new Date().toISOString();

    return wallet;
  }

  private appendLedgerEntry(
    db: DatabaseSchema,
    params: {
      userId: string;
      transactionId: string;
      type: LedgerEntry['type'];
      direction: 'CREDIT' | 'DEBIT';
      amount: number;
      balanceBefore: number;
      balanceAfter: number;
      pendingBefore: number;
      pendingAfter: number;
      description: string;
    }
  ): LedgerEntry {
    const entry: LedgerEntry = {
      id: `LEDG-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
      userId: params.userId,
      transactionId: params.transactionId,
      type: params.type,
      direction: params.direction,
      amount: params.amount,
      balanceBefore: params.balanceBefore,
      balanceAfter: params.balanceAfter,
      pendingBefore: params.pendingBefore,
      pendingAfter: params.pendingAfter,
      status: 'POSTED',
      description: params.description,
      createdAt: new Date().toISOString(),
    };
    db.ledgerEntries.push(entry);
    return entry;
  }

  private appendAuditLog(
    db: DatabaseSchema,
    params: {
      adminId: string;
      adminName: string;
      action: string;
      targetUserId: string;
      targetUserName: string;
      entityType: AuditLogEntry['entityType'];
      entityId: string;
      amount: number | null;
      previousState: string;
      newState: string;
      ipAddress?: string;
      userAgent?: string;
    }
  ): AuditLogEntry {
    const log: AuditLogEntry = {
      id: `AUD-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
      adminId: params.adminId,
      adminName: params.adminName,
      action: params.action,
      targetUserId: params.targetUserId,
      targetUserName: params.targetUserName,
      entityType: params.entityType,
      entityId: params.entityId,
      amount: params.amount,
      previousState: params.previousState,
      newState: params.newState,
      ipAddress: params.ipAddress || '127.0.0.1',
      userAgent: params.userAgent || 'server',
      timestamp: new Date().toISOString(),
    };
    db.auditLogs.push(log);
    return log;
  }

  private appendNotification(
    db: DatabaseSchema,
    userId: string,
    title: string,
    message: string,
    type: UserNotification['type'] = 'INFO'
  ): void {
    db.notifications.push({
      id: `NOTIF-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    });
  }

  // --- 1. Deposit Creation ---
  public async createDeposit(params: {
    userId: string;
    planId: string;
    transactionId: string;
    amount: string | number;
    senderNumber: string;
    paymentProofNote?: string;
    creditToWalletOnly?: boolean;
    idempotencyKey?: string;
  }): Promise<PaymentTransaction> {
    return this.runInTransaction((db) => {
      const user = db.users.find((u) => u.id === params.userId);
      if (!user) throw new Error('Authenticated user account not found.');
      if (user.status !== 'ACTIVE') throw new Error('Account is currently suspended.');

      if (params.idempotencyKey && db.idempotencyKeys[params.idempotencyKey]) {
        throw new Error('Duplicate deposit request detected.');
      }

      const cleanTid = params.transactionId.trim();
      if (cleanTid.length < 5) {
        throw new Error('Easypaisa Transaction ID (TID) must be at least 5 characters.');
      }

      const duplicate = db.transactions.find(
        (t) => t.transactionId.toLowerCase() === cleanTid.toLowerCase()
      );
      if (duplicate) {
        throw new Error('This Easypaisa Transaction ID has already been submitted.');
      }

      const isWalletTopup =
        params.creditToWalletOnly || params.planId === 'wallet-deposit';
      const plan = isWalletTopup
        ? null
        : db.plans.find((p) => p.id === params.planId);

      if (!isWalletTopup && !plan) {
        throw new Error('Selected service plan was not found.');
      }

      const numericAmount = parseNumericPkr(params.amount);
      if (numericAmount <= 0) {
        throw new Error('Deposit amount must be greater than zero.');
      }

      const now = new Date().toISOString();
      const depositId = `DEP-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      const unifiedTxId = `TXN-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

      const newDeposit: PaymentTransaction = {
        id: depositId,
        userId: user.id,
        userName: user.name,
        userIdentifier: user.identifier,
        planId: isWalletTopup ? 'wallet-deposit' : plan!.id,
        planName: isWalletTopup ? 'Wallet Deposit (Available Balance)' : plan!.name,
        transactionId: cleanTid,
        amount: `${numericAmount.toLocaleString()} PKR`,
        numericAmount,
        paymentMethod: `Easypaisa (${db.settings.easypaisaNumber})`,
        senderNumber: params.senderNumber.trim(),
        paymentProofNote: params.paymentProofNote?.trim() || '',
        creditToWalletOnly: isWalletTopup,
        submittedAt: now,
        status: 'Pending',
        adminNotes: 'Awaiting manual administrator verification of Easypaisa transfer.',
        reviewedAt: null,
        reviewedBy: null,
      };

      db.transactions.push(newDeposit);

      db.unifiedTransactions.push({
        id: unifiedTxId,
        userId: user.id,
        type: 'DEPOSIT',
        amount: numericAmount,
        fee: 0,
        netAmount: numericAmount,
        status: 'PENDING',
        referenceId: depositId,
        description: isWalletTopup
          ? `Easypaisa wallet deposit (TID: ${cleanTid}) — Pending admin verification`
          : `Easypaisa payment for ${plan!.name} (TID: ${cleanTid}) — Pending admin verification`,
        createdAt: now,
        updatedAt: now,
      });

      if (!isWalletTopup && plan) {
        db.orders.push({
          id: `ORD-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
          userId: user.id,
          userName: user.name,
          planId: plan.id,
          planName: plan.name,
          amount: numericAmount,
          duration: plan.duration,
          dailyProfit: plan.dailyProfit || '—',
          totalProfit: plan.totalProfit || '—',
          paymentSource: 'EASYPAISA_DEPOSIT',
          status: 'PENDING',
          referenceDepositId: depositId,
          createdAt: now,
          activatedAt: null,
        });
      }

      if (params.idempotencyKey) {
        db.idempotencyKeys[params.idempotencyKey] = {
          createdAt: Date.now(),
          resultId: depositId,
        };
      }

      this.appendNotification(
        db,
        user.id,
        'Easypaisa Deposit Submitted (Pending)',
        `Your Easypaisa transfer reference (TID: ${cleanTid}) for Rs. ${numericAmount.toLocaleString()} has been recorded as PENDING. It will be credited once verified by an administrator.`,
        'INFO'
      );

      return newDeposit;
    });
  }

  // --- 2. Admin Deposit Review (Approve / Reject) ---
  public async reviewDeposit(params: {
    adminId: string;
    depositId: string;
    status: DepositStatus;
    adminNotes?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<PaymentTransaction> {
    return this.runInTransaction((db) => {
      const admin = db.users.find(
        (u) =>
          u.id === params.adminId &&
          u.role === 'admin' &&
          u.identifier.toLowerCase() === OWNER_ADMIN_EMAIL
      );
      if (!admin) throw new Error('Unauthorized: Administrator privileges required.');

      const deposit = db.transactions.find((t) => t.id === params.depositId);
      if (!deposit) throw new Error('Deposit transaction record not found.');

      const prevStatus = deposit.status;
      if (prevStatus === params.status) {
        deposit.adminNotes = params.adminNotes?.trim() || deposit.adminNotes;
        return deposit;
      }

      if (prevStatus === 'Approved' && params.status !== 'Approved') {
        throw new Error(
          'An already approved deposit has posted immutable ledger entries. Use an Admin Balance Adjustment instead.'
        );
      }

      const user = db.users.find((u) => u.id === deposit.userId);
      if (!user) throw new Error('Target customer account not found.');

      const wallet = this.getOrCreateWallet(db, user.id);
      const amount = deposit.numericAmount || parseNumericPkr(deposit.amount);
      const now = new Date().toISOString();

      deposit.status = params.status;
      deposit.adminNotes =
        params.adminNotes?.trim() ||
        (params.status === 'Approved'
          ? 'Easypaisa transfer verified and approved by administrator.'
          : 'Easypaisa Transaction ID could not be verified.');
      deposit.reviewedAt = now;
      deposit.reviewedBy = admin.name;

      const unifiedTx = db.unifiedTransactions.find((u) => u.referenceId === deposit.id);
      const linkedOrder = db.orders.find((o) => o.referenceDepositId === deposit.id);

      if (params.status === 'Approved') {
        const balanceBefore = wallet.availableBalance;
        const pendingBefore = wallet.pendingBalance;
        const balanceAfterDeposit = balanceBefore + amount;

        wallet.availableBalance = balanceAfterDeposit;

        // 1. Immutable Ledger Entry for Approved Deposit
        this.appendLedgerEntry(db, {
          userId: user.id,
          transactionId: unifiedTx ? unifiedTx.id : deposit.id,
          type: 'DEPOSIT_APPROVED',
          direction: 'CREDIT',
          amount,
          balanceBefore,
          balanceAfter: balanceAfterDeposit,
          pendingBefore,
          pendingAfter: Math.max(0, pendingBefore - amount),
          description: `Approved Easypaisa deposit (TID: ${deposit.transactionId}) verified by ${admin.name}`,
        });

        if (unifiedTx) {
          unifiedTx.status = 'APPROVED';
          unifiedTx.updatedAt = now;
        }

        // 2. If deposit is strictly for wallet balance, keep funds in availableBalance.
        // If deposit is for a specific service plan, activate the plan and record the purchase OR if user deposited for a plan, let's activate the plan and credit/debit cleanly.
        if (!deposit.creditToWalletOnly && deposit.planId !== 'wallet-deposit') {
          user.activePlanId = deposit.planId;
          if (linkedOrder) {
            linkedOrder.status = 'ACTIVE';
            linkedOrder.activatedAt = now;
          }
          this.appendNotification(
            db,
            user.id,
            'Deposit Verified & Plan Activated',
            `Your Easypaisa transfer (TID: ${deposit.transactionId}) of Rs. ${amount.toLocaleString()} has been verified. Rs. ${amount.toLocaleString()} was credited to your wallet and your plan (${deposit.planName}) is now ACTIVE.`,
            'SUCCESS'
          );
        } else {
          this.appendNotification(
            db,
            user.id,
            'Wallet Deposit Approved',
            `Your Easypaisa deposit (TID: ${deposit.transactionId}) of Rs. ${amount.toLocaleString()} has been verified and added to your Available Balance.`,
            'SUCCESS'
          );
        }
      } else if (params.status === 'Rejected') {
        if (unifiedTx) {
          unifiedTx.status = 'REJECTED';
          unifiedTx.updatedAt = now;
        }
        if (linkedOrder) {
          linkedOrder.status = 'CANCELLED';
        }
        this.appendNotification(
          db,
          user.id,
          'Easypaisa Deposit Rejected',
          `Your submitted payment reference (TID: ${deposit.transactionId}) was marked REJECTED. Reason: ${deposit.adminNotes}`,
          'ERROR'
        );
      }

      this.appendAuditLog(db, {
        adminId: admin.id,
        adminName: admin.name,
        action: `DEPOSIT_${params.status.toUpperCase()}`,
        targetUserId: user.id,
        targetUserName: user.name,
        entityType: 'DEPOSIT',
        entityId: deposit.id,
        amount,
        previousState: `status=${prevStatus}`,
        newState: `status=${params.status}; notes=${deposit.adminNotes}`,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      });

      return deposit;
    });
  }

  // --- 3. Purchase Plan Using Available Wallet Balance ---
  public async purchasePlanWithWallet(params: {
    userId: string;
    planId: string;
    idempotencyKey?: string;
  }): Promise<ServiceOrder> {
    return this.runInTransaction((db) => {
      const user = db.users.find((u) => u.id === params.userId);
      if (!user) throw new Error('User not found.');
      if (user.status !== 'ACTIVE') throw new Error('Account is suspended.');

      if (params.idempotencyKey && db.idempotencyKeys[params.idempotencyKey]) {
        throw new Error('Duplicate plan purchase request.');
      }

      const plan = db.plans.find((p) => p.id === params.planId && p.active);
      if (!plan) throw new Error('Selected service plan is not available.');

      const price = parseNumericPkr(plan.price);
      if (price <= 0) throw new Error('Invalid plan price configuration.');

      const wallet = this.getOrCreateWallet(db, user.id);
      if (wallet.availableBalance < price) {
        throw new Error(
          `Insufficient available wallet balance. Required: Rs. ${price.toLocaleString()}, Available: Rs. ${wallet.availableBalance.toLocaleString()}.`
        );
      }

      const now = new Date().toISOString();
      const orderId = `ORD-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      const unifiedTxId = `TXN-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

      const balanceBefore = wallet.availableBalance;
      const balanceAfter = balanceBefore - price;
      wallet.availableBalance = balanceAfter;
      user.activePlanId = plan.id;

      const order: ServiceOrder = {
        id: orderId,
        userId: user.id,
        userName: user.name,
        planId: plan.id,
        planName: plan.name,
        amount: price,
        duration: plan.duration,
        dailyProfit: plan.dailyProfit || '—',
        totalProfit: plan.totalProfit || '—',
        paymentSource: 'WALLET',
        status: 'ACTIVE',
        referenceDepositId: null,
        createdAt: now,
        activatedAt: now,
      };
      db.orders.push(order);

      db.unifiedTransactions.push({
        id: unifiedTxId,
        userId: user.id,
        type: 'SERVICE_PURCHASE',
        amount: price,
        fee: 0,
        netAmount: price,
        status: 'COMPLETED',
        referenceId: orderId,
        description: `Purchased ${plan.name} using Available Wallet Balance`,
        createdAt: now,
        updatedAt: now,
      });

      this.appendLedgerEntry(db, {
        userId: user.id,
        transactionId: unifiedTxId,
        type: 'SERVICE_PURCHASE',
        direction: 'DEBIT',
        amount: price,
        balanceBefore,
        balanceAfter,
        pendingBefore: wallet.pendingBalance,
        pendingAfter: wallet.pendingBalance,
        description: `Service purchase: ${plan.name} (Order ${orderId})`,
      });

      if (params.idempotencyKey) {
        db.idempotencyKeys[params.idempotencyKey] = {
          createdAt: Date.now(),
          resultId: orderId,
        };
      }

      this.appendNotification(
        db,
        user.id,
        'Service Plan Activated via Wallet',
        `You purchased ${plan.name} for Rs. ${price.toLocaleString()} from your Available Balance.`,
        'SUCCESS'
      );

      return order;
    });
  }

  // --- 4. Create Withdrawal Request (Server-Side Validated & Reserved) ---
  public async createWithdrawal(params: {
    userId: string;
    amount: number;
    methodId: string;
    accountTitle: string;
    accountNumber: string;
    bankName?: string;
    saveAccount?: boolean;
    idempotencyKey?: string;
  }): Promise<WithdrawalRequest> {
    return this.runInTransaction((db) => {
      // 1. Verify User Authentication & Active Status
      const user = db.users.find((u) => u.id === params.userId);
      if (!user) throw new Error('Authentication required: User not found.');
      if (user.status !== 'ACTIVE') {
        throw new Error('Your account is not active and cannot submit withdrawals.');
      }

      // 2. Idempotency & Replay Protection
      if (params.idempotencyKey) {
        if (db.idempotencyKeys[params.idempotencyKey]) {
          throw new Error('Duplicate or replayed withdrawal request rejected.');
        }
      }

      // 3. Validate Amount > 0
      const grossAmount = Math.round(Number(params.amount));
      if (!Number.isFinite(grossAmount) || grossAmount <= 0) {
        throw new Error('Withdrawal amount must be greater than zero.');
      }

      // 4. Validate Withdrawal Method
      const method = db.withdrawalMethods.find(
        (m) => m.id === params.methodId && m.active
      );
      if (!method) {
        throw new Error('Selected withdrawal method is not supported or inactive.');
      }

      if (grossAmount < method.minAmount) {
        throw new Error(
          `Minimum withdrawal amount for ${method.name} is Rs. ${method.minAmount.toLocaleString()}.`
        );
      }
      if (grossAmount > method.maxAmount) {
        throw new Error(
          `Maximum single withdrawal amount for ${method.name} is Rs. ${method.maxAmount.toLocaleString()}.`
        );
      }

      // 5. Validate Required Payment Information
      const cleanTitle = (params.accountTitle || '').trim();
      const cleanNumber = (params.accountNumber || '').trim();
      const cleanBank = (params.bankName || '').trim();

      if (cleanTitle.length < 2) {
        throw new Error('Account holder name / title is required.');
      }
      if (cleanNumber.length < 7) {
        throw new Error('Valid destination account number or IBAN is required.');
      }
      if (method.requiresBankName && cleanBank.length < 2) {
        throw new Error('Bank name is required for Bank Transfer withdrawals.');
      }

      // 6. Verify Available Balance Server-Side
      const wallet = this.getOrCreateWallet(db, user.id);
      if (grossAmount > wallet.availableBalance) {
        throw new Error(
          `Insufficient available balance. Requested: Rs. ${grossAmount.toLocaleString()}, Available: Rs. ${wallet.availableBalance.toLocaleString()}.`
        );
      }

      // 7. Calculate Applicable Processing Fee & Net Amount Server-Side
      const fee = Math.round((grossAmount * method.feePercent) / 100) + method.feeFixed;
      const netAmount = grossAmount - fee;
      if (netAmount <= 0) {
        throw new Error('Withdrawal amount must exceed the processing fee.');
      }

      // 8. Reserve Funds from Available Balance Atomically
      const balanceBefore = wallet.availableBalance;
      const pendingBefore = wallet.pendingBalance;
      const balanceAfter = balanceBefore - grossAmount;
      const pendingAfter = pendingBefore + grossAmount;

      wallet.availableBalance = balanceAfter;
      wallet.reservedWithdrawalBalance += grossAmount;
      wallet.pendingBalance = pendingAfter;

      const now = new Date().toISOString();
      const withdrawalId = `WD-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      const unifiedTxId = `TXN-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

      const withdrawal: WithdrawalRequest = {
        id: withdrawalId,
        userId: user.id,
        userName: user.name,
        userIdentifier: user.identifier,
        amount: grossAmount,
        fee,
        netAmount,
        methodId: method.id,
        methodName: method.name,
        accountTitle: cleanTitle,
        accountNumber: cleanNumber,
        maskedAccountNumber: maskAccountNumber(cleanNumber),
        bankName: cleanBank || undefined,
        status: 'PENDING',
        adminNotes: 'Withdrawal submitted. Amount reserved from available balance pending admin review.',
        payoutReference: '',
        adminConfirmedRealPayout: false,
        history: [
          {
            fromStatus: 'CREATED',
            toStatus: 'PENDING',
            actorId: user.id,
            actorName: user.name,
            actorRole: 'user',
            note: `Requested withdrawal of Rs. ${grossAmount.toLocaleString()} via ${method.name}`,
            timestamp: now,
          },
        ],
        createdAt: now,
        updatedAt: now,
      };

      db.withdrawals.push(withdrawal);

      db.unifiedTransactions.push({
        id: unifiedTxId,
        userId: user.id,
        type: 'WITHDRAWAL',
        amount: grossAmount,
        fee,
        netAmount,
        status: 'PENDING',
        referenceId: withdrawalId,
        description: `Withdrawal request (${withdrawalId}) via ${method.name} to ${maskAccountNumber(cleanNumber)}`,
        createdAt: now,
        updatedAt: now,
      });

      this.appendLedgerEntry(db, {
        userId: user.id,
        transactionId: unifiedTxId,
        type: 'WITHDRAWAL_RESERVED',
        direction: 'DEBIT',
        amount: grossAmount,
        balanceBefore,
        balanceAfter,
        pendingBefore,
        pendingAfter,
        description: `Reserved Rs. ${grossAmount.toLocaleString()} for withdrawal request ${withdrawalId} (${method.name})`,
      });

      if (params.saveAccount) {
        const exists = user.savedPayoutAccounts.some(
          (a) =>
            a.methodId === method.id &&
            a.accountNumber.toLowerCase() === cleanNumber.toLowerCase()
        );
        if (!exists) {
          user.savedPayoutAccounts.push({
            id: `spa-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
            methodId: method.id,
            methodName: method.name,
            accountTitle: cleanTitle,
            accountNumber: cleanNumber,
            bankName: cleanBank || undefined,
            createdAt: now,
          });
        }
      }

      if (params.idempotencyKey) {
        db.idempotencyKeys[params.idempotencyKey] = {
          createdAt: Date.now(),
          resultId: withdrawalId,
        };
      }

      this.appendNotification(
        db,
        user.id,
        `Withdrawal Request Created (${withdrawalId})`,
        `Rs. ${grossAmount.toLocaleString()} has been reserved from your Available Balance for withdrawal via ${method.name}. Status: PENDING.`,
        'INFO'
      );

      return withdrawal;
    });
  }

  // --- 5. User Cancel Own Pending Withdrawal ---
  public async cancelUserWithdrawal(params: {
    userId: string;
    withdrawalId: string;
  }): Promise<WithdrawalRequest> {
    return this.runInTransaction((db) => {
      const user = db.users.find((u) => u.id === params.userId);
      if (!user) throw new Error('User not found.');

      const wd = db.withdrawals.find(
        (w) => w.id === params.withdrawalId && w.userId === user.id
      );
      if (!wd) throw new Error('Withdrawal request not found.');

      if (wd.status !== 'PENDING') {
        throw new Error(
          `Only PENDING withdrawals can be cancelled by the user. Current status: ${wd.status}.`
        );
      }

      const wallet = this.getOrCreateWallet(db, user.id);
      const balanceBefore = wallet.availableBalance;
      const pendingBefore = wallet.pendingBalance;
      const balanceAfter = balanceBefore + wd.amount;
      const pendingAfter = Math.max(0, pendingBefore - wd.amount);

      wallet.availableBalance = balanceAfter;
      wallet.reservedWithdrawalBalance = Math.max(
        0,
        wallet.reservedWithdrawalBalance - wd.amount
      );
      wallet.pendingBalance = pendingAfter;

      const now = new Date().toISOString();
      wd.status = 'CANCELLED';
      wd.adminNotes = 'Cancelled by customer. Reserved funds released back to Available Balance.';
      wd.updatedAt = now;
      wd.history.push({
        fromStatus: 'PENDING',
        toStatus: 'CANCELLED',
        actorId: user.id,
        actorName: user.name,
        actorRole: 'user',
        note: 'Cancelled by customer; reserved funds returned to available balance.',
        timestamp: now,
      });

      const unifiedTx = db.unifiedTransactions.find((t) => t.referenceId === wd.id);
      if (unifiedTx) {
        unifiedTx.status = 'CANCELLED';
        unifiedTx.updatedAt = now;
      }

      this.appendLedgerEntry(db, {
        userId: user.id,
        transactionId: unifiedTx ? unifiedTx.id : wd.id,
        type: 'WITHDRAWAL_RELEASED',
        direction: 'CREDIT',
        amount: wd.amount,
        balanceBefore,
        balanceAfter,
        pendingBefore,
        pendingAfter,
        description: `Released reserved Rs. ${wd.amount.toLocaleString()} from cancelled withdrawal ${wd.id}`,
      });

      this.appendNotification(
        db,
        user.id,
        `Withdrawal Cancelled (${wd.id})`,
        `Your withdrawal request ${wd.id} was cancelled and Rs. ${wd.amount.toLocaleString()} has been returned to your Available Balance.`,
        'WARNING'
      );

      return wd;
    });
  }

  // --- 6. Admin Withdrawal Management (Approve -> PROCESSING, Reject -> Release Funds, Complete -> Require Real Payout Confirmation) ---
  public async adminUpdateWithdrawal(params: {
    adminId: string;
    withdrawalId: string;
    status: WithdrawalStatus;
    adminNotes?: string;
    confirmRealPayoutSent?: boolean;
    payoutReference?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<WithdrawalRequest> {
    return this.runInTransaction((db) => {
      const admin = db.users.find(
        (u) =>
          u.id === params.adminId &&
          u.role === 'admin' &&
          u.identifier.toLowerCase() === OWNER_ADMIN_EMAIL
      );
      if (!admin) throw new Error('Unauthorized: Administrator privileges required.');

      const wd = db.withdrawals.find((w) => w.id === params.withdrawalId);
      if (!wd) throw new Error('Withdrawal request not found.');

      const user = db.users.find((u) => u.id === wd.userId);
      if (!user) throw new Error('Target user not found.');

      const prevStatus = wd.status;
      const now = new Date().toISOString();

      // If only updating internal notes without changing status
      if (prevStatus === params.status) {
        if (params.adminNotes !== undefined) {
          wd.adminNotes = params.adminNotes.trim();
          wd.updatedAt = now;
          this.appendAuditLog(db, {
            adminId: admin.id,
            adminName: admin.name,
            action: 'WITHDRAWAL_NOTE_UPDATED',
            targetUserId: user.id,
            targetUserName: user.name,
            entityType: 'WITHDRAWAL',
            entityId: wd.id,
            amount: wd.amount,
            previousState: `status=${prevStatus}`,
            newState: `status=${prevStatus}; note=${wd.adminNotes}`,
            ipAddress: params.ipAddress,
            userAgent: params.userAgent,
          });
        }
        return wd;
      }

      // Terminal states cannot be transitioned again
      if (prevStatus === 'COMPLETED' || prevStatus === 'REJECTED' || prevStatus === 'CANCELLED') {
        throw new Error(
          `Cannot change status of a withdrawal that is already ${prevStatus}.`
        );
      }

      const wallet = this.getOrCreateWallet(db, user.id);
      const unifiedTx = db.unifiedTransactions.find((t) => t.referenceId === wd.id);

      // Transition 1: Approve / Mark PROCESSING
      if (params.status === 'PROCESSING') {
        wd.status = 'PROCESSING';
        wd.adminNotes =
          params.adminNotes?.trim() ||
          'Approved by administrator. Payment is currently being processed.';
        wd.updatedAt = now;
        wd.history.push({
          fromStatus: prevStatus,
          toStatus: 'PROCESSING',
          actorId: admin.id,
          actorName: admin.name,
          actorRole: 'admin',
          note: wd.adminNotes,
          timestamp: now,
        });

        if (unifiedTx) {
          unifiedTx.status = 'PROCESSING';
          unifiedTx.updatedAt = now;
        }

        this.appendNotification(
          db,
          user.id,
          `Withdrawal Approved for Processing (${wd.id})`,
          `Your withdrawal request of Rs. ${wd.netAmount.toLocaleString()} via ${wd.methodName} has been approved by an administrator and is now PROCESSING.`,
          'INFO'
        );
      }
      // Transition 2: REJECTED (Must release reserved funds back to Available Balance!)
      else if (params.status === 'REJECTED') {
        const balanceBefore = wallet.availableBalance;
        const pendingBefore = wallet.pendingBalance;
        const balanceAfter = balanceBefore + wd.amount;
        const pendingAfter = Math.max(0, pendingBefore - wd.amount);

        wallet.availableBalance = balanceAfter;
        wallet.reservedWithdrawalBalance = Math.max(
          0,
          wallet.reservedWithdrawalBalance - wd.amount
        );
        wallet.pendingBalance = pendingAfter;

        wd.status = 'REJECTED';
        wd.adminNotes =
          params.adminNotes?.trim() ||
          'Withdrawal request rejected by administrator. Reserved funds returned to Available Balance.';
        wd.updatedAt = now;
        wd.history.push({
          fromStatus: prevStatus,
          toStatus: 'REJECTED',
          actorId: admin.id,
          actorName: admin.name,
          actorRole: 'admin',
          note: `${wd.adminNotes} (Rs. ${wd.amount.toLocaleString()} released back to available balance)`,
          timestamp: now,
        });

        if (unifiedTx) {
          unifiedTx.status = 'REJECTED';
          unifiedTx.updatedAt = now;
        }

        this.appendLedgerEntry(db, {
          userId: user.id,
          transactionId: unifiedTx ? unifiedTx.id : wd.id,
          type: 'WITHDRAWAL_RELEASED',
          direction: 'CREDIT',
          amount: wd.amount,
          balanceBefore,
          balanceAfter,
          pendingBefore,
          pendingAfter,
          description: `Released reserved Rs. ${wd.amount.toLocaleString()} from rejected withdrawal ${wd.id} (${wd.adminNotes})`,
        });

        this.appendNotification(
          db,
          user.id,
          `Withdrawal Rejected & Funds Released (${wd.id})`,
          `Your withdrawal request ${wd.id} was rejected (${wd.adminNotes}). The reserved Rs. ${wd.amount.toLocaleString()} has been returned to your Available Balance.`,
          'WARNING'
        );
      }
      // Transition 3: COMPLETED (Requires explicit real payout confirmation!)
      else if (params.status === 'COMPLETED') {
        if (!params.confirmRealPayoutSent) {
          throw new Error(
            'Admin must explicitly confirm that the actual payment transfer has been completed before marking a withdrawal as COMPLETED.'
          );
        }
        const cleanRef = (params.payoutReference || '').trim();
        if (cleanRef.length < 3) {
          throw new Error(
            'Please provide the real payment transfer reference / receipt ID before marking COMPLETED.'
          );
        }

        const pendingBefore = wallet.pendingBalance;
        const pendingAfter = Math.max(0, pendingBefore - wd.amount);
        wallet.reservedWithdrawalBalance = Math.max(
          0,
          wallet.reservedWithdrawalBalance - wd.amount
        );
        wallet.pendingBalance = pendingAfter;
        wallet.totalWithdrawn += wd.amount;

        wd.status = 'COMPLETED';
        wd.payoutReference = cleanRef;
        wd.adminConfirmedRealPayout = true;
        wd.adminNotes =
          params.adminNotes?.trim() ||
          `Payout completed via ${wd.methodName}. Transfer Ref: ${cleanRef}`;
        wd.updatedAt = now;
        wd.history.push({
          fromStatus: prevStatus,
          toStatus: 'COMPLETED',
          actorId: admin.id,
          actorName: admin.name,
          actorRole: 'admin',
          note: `Real payout confirmed (Ref: ${cleanRef}). ${wd.adminNotes}`,
          timestamp: now,
        });

        if (unifiedTx) {
          unifiedTx.status = 'COMPLETED';
          unifiedTx.description = `${unifiedTx.description} · Payout Ref: ${cleanRef}`;
          unifiedTx.updatedAt = now;
        }

        this.appendLedgerEntry(db, {
          userId: user.id,
          transactionId: unifiedTx ? unifiedTx.id : wd.id,
          type: 'WITHDRAWAL_COMPLETED',
          direction: 'DEBIT',
          amount: wd.amount,
          balanceBefore: wallet.availableBalance,
          balanceAfter: wallet.availableBalance,
          pendingBefore,
          pendingAfter,
          description: `Withdrawal ${wd.id} payout completed via ${wd.methodName} (Transfer Ref: ${cleanRef})`,
        });

        this.appendNotification(
          db,
          user.id,
          `Withdrawal Completed (${wd.id})`,
          `Your withdrawal of Rs. ${wd.netAmount.toLocaleString()} via ${wd.methodName} has been sent and marked COMPLETED (Transfer Ref: ${cleanRef}).`,
          'SUCCESS'
        );
      } else {
        throw new Error(`Unsupported target withdrawal status: ${params.status}`);
      }

      this.appendAuditLog(db, {
        adminId: admin.id,
        adminName: admin.name,
        action: `WITHDRAWAL_${params.status}`,
        targetUserId: user.id,
        targetUserName: user.name,
        entityType: 'WITHDRAWAL',
        entityId: wd.id,
        amount: wd.amount,
        previousState: `status=${prevStatus}`,
        newState: `status=${wd.status}; payoutRef=${wd.payoutReference || 'none'}; note=${wd.adminNotes}`,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      });

      return wd;
    });
  }

  // --- 7. Controlled Admin Balance Adjustment / Refund (Immutable Ledger Entry) ---
  public async adminAdjustBalance(params: {
    adminId: string;
    targetUserId: string;
    direction: 'CREDIT' | 'DEBIT';
    category: 'ADJUSTMENT' | 'REFUND';
    amount: number;
    reason: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{ wallet: WalletAccount; ledgerEntry: LedgerEntry }> {
    return this.runInTransaction((db) => {
      const admin = db.users.find(
        (u) =>
          u.id === params.adminId &&
          u.role === 'admin' &&
          u.identifier.toLowerCase() === OWNER_ADMIN_EMAIL
      );
      if (!admin) throw new Error('Unauthorized: Administrator privileges required.');

      const user = db.users.find((u) => u.id === params.targetUserId);
      if (!user) throw new Error('Target user account not found.');

      const amount = Math.round(Number(params.amount));
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error('Adjustment amount must be a positive number.');
      }

      const cleanReason = (params.reason || '').trim();
      if (cleanReason.length < 5) {
        throw new Error('A clear accounting reason (at least 5 characters) is required for audit compliance.');
      }

      const wallet = this.getOrCreateWallet(db, user.id);
      const balanceBefore = wallet.availableBalance;

      if (params.direction === 'DEBIT' && balanceBefore < amount) {
        throw new Error(
          `Cannot debit Rs. ${amount.toLocaleString()} because user only has Rs. ${balanceBefore.toLocaleString()} available balance.`
        );
      }

      const balanceAfter =
        params.direction === 'CREDIT' ? balanceBefore + amount : balanceBefore - amount;
      wallet.availableBalance = balanceAfter;

      const now = new Date().toISOString();
      const unifiedTxId = `TXN-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

      db.unifiedTransactions.push({
        id: unifiedTxId,
        userId: user.id,
        type: params.category === 'REFUND' ? 'REFUND' : 'ADJUSTMENT',
        amount,
        fee: 0,
        netAmount: amount,
        status: 'COMPLETED',
        referenceId: unifiedTxId,
        description: `${params.category} (${params.direction}): ${cleanReason}`,
        createdAt: now,
        updatedAt: now,
      });

      const ledgerEntry = this.appendLedgerEntry(db, {
        userId: user.id,
        transactionId: unifiedTxId,
        type: params.category === 'REFUND' ? 'REFUND' : 'ADMIN_ADJUSTMENT',
        direction: params.direction,
        amount,
        balanceBefore,
        balanceAfter,
        pendingBefore: wallet.pendingBalance,
        pendingAfter: wallet.pendingBalance,
        description: `Admin ${params.category.toLowerCase()} (${params.direction}) by ${admin.name}: ${cleanReason}`,
      });

      this.appendAuditLog(db, {
        adminId: admin.id,
        adminName: admin.name,
        action: `WALLET_${params.category}_${params.direction}`,
        targetUserId: user.id,
        targetUserName: user.name,
        entityType: 'WALLET',
        entityId: wallet.id,
        amount,
        previousState: `availableBalance=${balanceBefore}`,
        newState: `availableBalance=${balanceAfter}; reason=${cleanReason}`,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      });

      this.appendNotification(
        db,
        user.id,
        `Account Balance ${params.category === 'REFUND' ? 'Refund' : 'Adjustment'}`,
        `An administrator posted a ${params.direction} of Rs. ${amount.toLocaleString()} to your Available Balance. Reason: ${cleanReason}`,
        params.direction === 'CREDIT' ? 'SUCCESS' : 'WARNING'
      );

      return { wallet, ledgerEntry };
    });
  }

  // --- 8. Manage Configurable Withdrawal Methods (Admin) ---
  public async adminSaveWithdrawalMethod(params: {
    adminId: string;
    method: Omit<WithdrawalMethodConfig, 'id'> & { id?: string };
    ipAddress?: string;
    userAgent?: string;
  }): Promise<WithdrawalMethodConfig> {
    return this.runInTransaction((db) => {
      const admin = db.users.find(
        (u) =>
          u.id === params.adminId &&
          u.role === 'admin' &&
          u.identifier.toLowerCase() === OWNER_ADMIN_EMAIL
      );
      if (!admin) throw new Error('Unauthorized: Exclusive Owner Administrator privileges required.');

      if (params.method.id) {
        const idx = db.withdrawalMethods.findIndex((m) => m.id === params.method.id);
        if (idx === -1) throw new Error('Withdrawal method not found.');
        const prev = JSON.stringify(db.withdrawalMethods[idx]);
        db.withdrawalMethods[idx] = {
          ...db.withdrawalMethods[idx],
          ...params.method,
          id: params.method.id,
        };
        this.appendAuditLog(db, {
          adminId: admin.id,
          adminName: admin.name,
          action: 'WITHDRAWAL_METHOD_UPDATED',
          targetUserId: admin.id,
          targetUserName: 'System Configuration',
          entityType: 'METHOD',
          entityId: params.method.id,
          amount: null,
          previousState: prev,
          newState: JSON.stringify(db.withdrawalMethods[idx]),
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        });
        return db.withdrawalMethods[idx];
      } else {
        const newMethod: WithdrawalMethodConfig = {
          ...params.method,
          id: `wm-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
        };
        db.withdrawalMethods.push(newMethod);
        this.appendAuditLog(db, {
          adminId: admin.id,
          adminName: admin.name,
          action: 'WITHDRAWAL_METHOD_CREATED',
          targetUserId: admin.id,
          targetUserName: 'System Configuration',
          entityType: 'METHOD',
          entityId: newMethod.id,
          amount: null,
          previousState: 'none',
          newState: JSON.stringify(newMethod),
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        });
        return newMethod;
      }
    });
  }

  // --- 9. Owner Admin Change Password ---
  public async adminChangePassword(params: {
    adminId: string;
    currentPassword: string;
    newPassword: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    return this.runInTransaction((db) => {
      const admin = db.users.find(
        (u) =>
          u.id === params.adminId &&
          u.role === 'admin' &&
          u.identifier.toLowerCase() === OWNER_ADMIN_EMAIL
      );
      if (!admin) {
        throw new Error('Unauthorized: Only the owner administrator can change the admin password.');
      }
      if (!verifyPassword(params.currentPassword, admin.passwordHash)) {
        throw new Error('Current password is incorrect.');
      }
      if (params.newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters.');
      }
      admin.passwordHash = hashPassword(params.newPassword);
      this.appendAuditLog(db, {
        adminId: admin.id,
        adminName: admin.name,
        action: 'OWNER_ADMIN_PASSWORD_UPDATED',
        targetUserId: admin.id,
        targetUserName: admin.name,
        entityType: 'SETTINGS',
        entityId: admin.id,
        amount: null,
        previousState: 'passwordHash=***',
        newState: 'passwordHash=updated',
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      });
    });
  }
}
