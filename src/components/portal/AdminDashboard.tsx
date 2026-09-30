import React, { useEffect, useState, useCallback } from 'react';
import { Eye, EyeOff, Plus, RefreshCw, ShieldAlert, Trash2, Upload } from 'lucide-react';
import {
  AuditLogEntry,
  DepositStatus,
  InquiryStatus,
  LedgerEntry,
  PageRoute,
  PaymentTransaction,
  ServicePlan,
  SiteSettings,
  SupportInquiry,
  UserAccount,
  WalletAccount,
  WithdrawalMethodConfig,
  WithdrawalRequest,
  WithdrawalStatus,
} from '../../types';
import { apiRequest } from '../../utils/api';

interface AdminDashboardProps {
  token: string;
  settings: SiteSettings;
  onSettingsUpdated: (newSettings: SiteSettings) => void;
  onPlansUpdated: () => void;
  onNavigate: (page: PageRoute) => void;
}

type AdminTab =
  | 'withdrawals'
  | 'deposits'
  | 'wallets'
  | 'methods'
  | 'audit'
  | 'plans'
  | 'inquiries'
  | 'users'
  | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  token,
  settings,
  onSettingsUpdated,
  onPlansUpdated,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('withdrawals');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const [users, setUsers] = useState<UserAccount[]>([]);
  const [wallets, setWallets] = useState<WalletAccount[]>([]);
  const [plans, setPlans] = useState<ServicePlan[]>([]);
  const [deposits, setDeposits] = useState<PaymentTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [withdrawalMethods, setWithdrawalMethods] = useState<WithdrawalMethodConfig[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [auditLogs, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [inquiries, setInquiries] = useState<SupportInquiry[]>([]);

  // --- Withdrawal Management State ---
  const [wdFilter, setWdFilter] = useState<'ALL' | WithdrawalStatus>('ALL');
  const [wdNotesDraft, setWdNotesDraft] = useState<Record<string, string>>({});
  const [wdPayoutRefDraft, setWdPayoutRefDraft] = useState<Record<string, string>>({});
  const [wdConfirmRealPayout, setWdConfirmRealPayout] = useState<Record<string, boolean>>({});
  const [unmaskedWdIds, setUnmaskedWdIds] = useState<Record<string, boolean>>({});

  // --- Deposit Filter & Notes ---
  const [depFilter, setDepFilter] = useState<'All' | DepositStatus>('All');
  const [depNotesDraft, setDepNotesDraft] = useState<Record<string, string>>({});

  // --- Controlled Balance Adjustment Form ---
  const [adjUserId, setAdjUserId] = useState('');
  const [adjDirection, setAdjDirection] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [adjCategory, setAdjCategory] = useState<'ADJUSTMENT' | 'REFUND'>('ADJUSTMENT');
  const [adjAmount, setAdjAmount] = useState('');
  const [adjReason, setAdjReason] = useState('');

  // --- Configurable Withdrawal Method Form ---
  const [wmName, setWmName] = useState('');
  const [wmCode, setWmCode] = useState('');
  const [wmMin, setWmMin] = useState('500');
  const [wmMax, setWmMax] = useState('500000');
  const [wmFeePercent, setWmFeePercent] = useState('0');
  const [wmFeeFixed, setWmFeeFixed] = useState('0');
  const [wmLabel, setWmLabel] = useState('Account Number (11 Digits)');
  const [wmRequiresBank, setWmRequiresBank] = useState(false);
  const [wmInstructions, setWmInstructions] = useState('');

  // --- New Plan Form State ---
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState('');
  const [newPlanDaily, setNewPlanDaily] = useState('');
  const [newPlanTotal, setNewPlanTotal] = useState('');
  const [newPlanDuration, setNewPlanDuration] = useState('30 Days (30 دن)');
  const [newPlanDesc, setNewPlanDesc] = useState('');
  const [newPlanFeaturesText, setNewPlanFeaturesText] = useState('');
  const [newPlanPopular, setNewPlanPopular] = useState(false);

  // --- Settings Form State ---
  const [logoUrlInput, setLogoUrlInput] = useState<string>(settings.logoUrl || '');
  const [heroHeadlineInput, setHeroHeadlineInput] = useState<string>(settings.heroHeadline);
  const [heroSubheadlineInput, setHeroSubheadlineInput] = useState<string>(
    settings.heroSubheadline
  );
  const [currentOwnerPassword, setCurrentOwnerPassword] = useState('');
  const [newOwnerPassword, setNewOwnerPassword] = useState('');

  const fetchAdminOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/api/admin/overview', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setError(res.error || 'Failed to load administrator data.');
      } else {
        const data = res.data;
        const userList: UserAccount[] = data.users || [];
        setUsers(userList);
        if (userList.length > 0 && !adjUserId) {
          setAdjUserId(userList[0].id);
        }
        setWallets(data.wallets || []);
        setPlans(data.plans || []);
        setDeposits(data.transactions || []);
        setWithdrawals(data.withdrawals || []);
        setWithdrawalMethods(data.withdrawalMethods || []);
        setLedgerEntries(data.ledgerEntries || []);
        setAuditLog(data.auditLogs || []);
        setInquiries(data.inquiries || []);
        if (data.settings) {
          setLogoUrlInput(data.settings.logoUrl || '');
          setHeroHeadlineInput(data.settings.heroHeadline || '');
          setHeroSubheadlineInput(data.settings.heroSubheadline || '');
        }
      }
    } finally {
      setLoading(false);
    }
  }, [token, adjUserId]);

  useEffect(() => {
    fetchAdminOverview();
  }, [fetchAdminOverview]);

  const showFlash = (msg: string) => {
    setError(null);
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 4000);
  };

  // --- Admin Withdrawal Update ---
  const handleUpdateWithdrawal = async (wd: WithdrawalRequest, targetStatus: WithdrawalStatus) => {
    setError(null);
    const adminNotes = wdNotesDraft[wd.id] ?? wd.adminNotes;
    const payoutReference = wdPayoutRefDraft[wd.id] ?? wd.payoutReference ?? '';
    const confirmRealPayoutSent = Boolean(wdConfirmRealPayout[wd.id]);

    if (targetStatus === 'COMPLETED') {
      if (!confirmRealPayoutSent) {
        setError(
          `Cannot mark ${wd.id} COMPLETED: You must explicitly check the box confirming that the real payout of Rs. ${wd.netAmount.toLocaleString()} was sent.`
        );
        return;
      }
      if (payoutReference.trim().length < 3) {
        setError(
          `Cannot mark ${wd.id} COMPLETED: Please enter the actual transfer receipt / reference ID.`
        );
        return;
      }
    }

    const res = await apiRequest(`/api/admin/withdrawals/${wd.id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        status: targetStatus,
        adminNotes,
        confirmRealPayoutSent,
        payoutReference: payoutReference.trim(),
      }),
    });
    if (!res.ok) {
      setError(res.error || 'Could not update withdrawal status.');
    } else {
      showFlash(`Withdrawal ${wd.id} updated to ${targetStatus} (Audit log recorded).`);
      fetchAdminOverview();
    }
  };

  // --- Admin Deposit Review ---
  const handleReviewDeposit = async (id: string, status: DepositStatus) => {
    setError(null);
    const adminNotes =
      depNotesDraft[id] ??
      (status === 'Approved'
        ? 'Easypaisa transfer verified by administrator. Wallet credited.'
        : status === 'Rejected'
        ? 'Transaction ID could not be verified against Easypaisa records.'
        : 'Pending manual verification.');

    const res = await apiRequest(`/api/admin/transactions/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status, adminNotes }),
    });
    if (!res.ok) {
      setError(res.error || 'Could not update deposit status.');
    } else {
      showFlash(`Deposit ${id} marked as ${status} (Ledger & Audit log updated).`);
      fetchAdminOverview();
    }
  };

  // --- Admin Controlled Balance Adjustment ---
  const handleBalanceAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const numAmt = Math.round(Number(adjAmount) || 0);
    if (!adjUserId || numAmt <= 0 || adjReason.trim().length < 5) {
      setError('Select a user, enter a positive amount, and provide an audit reason (min 5 chars).');
      return;
    }

    const res = await apiRequest('/api/admin/wallets/adjust', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        targetUserId: adjUserId,
        direction: adjDirection,
        category: adjCategory,
        amount: numAmt,
        reason: adjReason.trim(),
      }),
    });
    if (!res.ok) {
      setError(res.error || 'Balance adjustment failed.');
    } else {
      setAdjAmount('');
      setAdjReason('');
      showFlash(
        `Posted immutable ${adjDirection} ledger adjustment of Rs. ${numAmt.toLocaleString()}.`
      );
      fetchAdminOverview();
    }
  };

  // --- Admin Save Withdrawal Method ---
  const handleCreateWithdrawalMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!wmName.trim() || !wmCode.trim()) {
      setError('Method name and code are required.');
      return;
    }

    const res = await apiRequest('/api/admin/withdrawal-methods', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: wmName.trim(),
        code: wmCode.trim().toUpperCase(),
        minAmount: Number(wmMin) || 500,
        maxAmount: Number(wmMax) || 500000,
        feePercent: Number(wmFeePercent) || 0,
        feeFixed: Number(wmFeeFixed) || 0,
        accountLabel: wmLabel.trim() || 'Account Number',
        requiresBankName: wmRequiresBank,
        instructions:
          wmInstructions.trim() || `Enter your registered ${wmName.trim()} account details.`,
        active: true,
      }),
    });
    if (!res.ok) {
      setError(res.error || 'Could not save withdrawal method.');
    } else {
      setWmName('');
      setWmCode('');
      setWmInstructions('');
      showFlash('Withdrawal method configuration saved.');
      fetchAdminOverview();
    }
  };

  const handleToggleMethodActive = async (m: WithdrawalMethodConfig) => {
    const res = await apiRequest('/api/admin/withdrawal-methods', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        ...m,
        active: !m.active,
      }),
    });
    if (res.ok) {
      showFlash(`Updated ${m.name} status.`);
      fetchAdminOverview();
    } else {
      setError(res.error || 'Could not toggle method status.');
    }
  };

  // --- Admin Create / Delete Plan ---
  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const features = newPlanFeaturesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (!newPlanName.trim() || !newPlanPrice.trim() || features.length === 0) {
      setError('Please fill in Plan Name, Price, and at least one feature line.');
      return;
    }

    const res = await apiRequest('/api/admin/plans', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: newPlanName.trim(),
        targetAudience: 'Structured 30-Day Package',
        price: newPlanPrice.trim(),
        dailyProfit: newPlanDaily.trim() || undefined,
        totalProfit: newPlanTotal.trim() || undefined,
        currency: 'PKR',
        duration: newPlanDuration.trim(),
        description:
          newPlanDesc.trim() ||
          'Structured trading service package with support and portal access.',
        features,
        ctaText: 'Invest Now',
        isPopular: newPlanPopular,
        active: true,
      }),
    });
    if (!res.ok) {
      setError(res.error || 'Could not create plan.');
    } else {
      setNewPlanName('');
      setNewPlanPrice('');
      setNewPlanDaily('');
      setNewPlanTotal('');
      setNewPlanDesc('');
      setNewPlanFeaturesText('');
      setNewPlanPopular(false);
      showFlash('New service plan created.');
      fetchAdminOverview();
      onPlansUpdated();
    }
  };

  const handleDeletePlan = async (id: string) => {
    const res = await apiRequest(`/api/admin/plans/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      showFlash('Service plan removed.');
      fetchAdminOverview();
      onPlansUpdated();
    } else {
      setError(res.error || 'Could not delete plan.');
    }
  };

  const handleUpdateInquiry = async (id: string, status: InquiryStatus, adminReply: string) => {
    const res = await apiRequest(`/api/admin/inquiries/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status, adminReply }),
    });
    if (res.ok) {
      showFlash(`Inquiry marked as ${status}.`);
      fetchAdminOverview();
    } else {
      setError(res.error || 'Could not update support inquiry.');
    }
  };

  const handleToggleUserStatus = async (u: UserAccount) => {
    const nextStatus = u.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    const res = await apiRequest(`/api/admin/users/${u.id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (res.ok) {
      showFlash(`User ${u.name} status set to ${nextStatus}.`);
      fetchAdminOverview();
    } else {
      setError(res.error || 'Could not update user status.');
    }
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLogoUrlInput(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiRequest<{ settings: SiteSettings }>('/api/admin/settings', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        logoUrl: logoUrlInput.trim() ? logoUrlInput.trim() : null,
        heroHeadline: heroHeadlineInput.trim(),
        heroSubheadline: heroSubheadlineInput.trim(),
      }),
    });
    if (res.ok && res.data?.settings) {
      onSettingsUpdated(res.data.settings);
      showFlash('Website & Logo settings updated across REX TRADERS.');
    } else {
      setError(res.error || 'Could not save settings.');
    }
  };

  const handleUpdateOwnerPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!currentOwnerPassword || newOwnerPassword.length < 8) {
      setError('Enter your current password and a new password of at least 8 characters.');
      return;
    }
    const res = await apiRequest('/api/admin/owner-password', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        currentPassword: currentOwnerPassword,
        newPassword: newOwnerPassword,
      }),
    });
    if (!res.ok) {
      setError(res.error || 'Failed to update owner password.');
    } else {
      setCurrentOwnerPassword('');
      setNewOwnerPassword('');
      showFlash('Owner administrator password updated and logged in audit trail.');
      fetchAdminOverview();
    }
  };

  const filteredWithdrawals =
    wdFilter === 'ALL' ? withdrawals : withdrawals.filter((w) => w.status === wdFilter);

  const filteredDeposits =
    depFilter === 'All' ? deposits : deposits.filter((t) => t.status === depFilter);

  return (
    <section className="py-8 sm:py-10 bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500 mb-1">
              <span>{settings.brandName}</span>
              <span aria-hidden="true"> · </span>
              <span>Exclusive Owner Console (sulemanadan816@gmail.com)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Withdrawals, Deposits, Ledger &amp; Audit Management
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap"
            >
              Switch to Client Dashboard
            </button>
            <button
              type="button"
              onClick={fetchAdminOverview}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Records</span>
            </button>
          </div>
        </div>

        {/* Summary Metrics Row (Tabular Numerals) */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-xs text-slate-500">Pending Withdrawals</div>
            <div className="mt-1 font-mono tabular-nums text-2xl font-bold text-amber-700">
              {withdrawals.filter((w) => w.status === 'PENDING' || w.status === 'PROCESSING').length}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-xs text-slate-500">Completed Withdrawals</div>
            <div className="mt-1 font-mono tabular-nums text-2xl font-bold text-emerald-700">
              {withdrawals.filter((w) => w.status === 'COMPLETED').length}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-xs text-slate-500">Pending Deposits</div>
            <div className="mt-1 font-mono tabular-nums text-2xl font-bold text-amber-700">
              {deposits.filter((t) => t.status === 'Pending').length}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-xs text-slate-500">Ledger Entries</div>
            <div className="mt-1 font-mono tabular-nums text-2xl font-bold text-slate-900">
              {ledgerEntries.length}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 col-span-2 lg:col-span-1">
            <div className="text-xs text-slate-500">Audit Log Events</div>
            <div className="mt-1 font-mono tabular-nums text-2xl font-bold text-slate-900">
              {auditLogs.length}
            </div>
          </div>
        </div>

        {actionMessage && (
          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900">
            {actionMessage}
          </div>
        )}
        {error && (
          <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-900">
            {error}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/80 rounded-lg">
          {(
            [
              { id: 'withdrawals', label: '1. Withdrawals Queue' },
              { id: 'deposits', label: '2. Easypaisa Deposits' },
              { id: 'wallets', label: '3. Wallets & Ledger' },
              { id: 'methods', label: '4. Withdrawal Methods' },
              { id: 'audit', label: '5. Audit Log' },
              { id: 'plans', label: '6. Plans' },
              { id: 'users', label: '7. Users' },
              { id: 'inquiries', label: '8. Support' },
              { id: 'settings', label: '9. Settings' },
            ] as { id: AdminTab; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ==================== TAB 1: ADMIN WITHDRAWAL MANAGEMENT ==================== */}
        {activeTab === 'withdrawals' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Customer Withdrawal Management
                </h2>
                <p className="text-xs text-slate-600">
                  Workflow: <strong>PENDING</strong> &rarr; <strong>PROCESSING</strong> (Approved)
                  &rarr; <strong>COMPLETED</strong> (Requires explicit confirmation that real payout
                  was executed). Rejecting a request automatically releases reserved funds back to
                  the user&apos;s Available Balance.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
                {(['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED', 'CANCELLED'] as const).map(
                  (st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setWdFilter(st)}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
                        wdFilter === st
                          ? 'bg-white text-slate-900 font-semibold shadow-xs'
                          : 'text-slate-600'
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>
            </div>

            {filteredWithdrawals.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                No withdrawal requests match filter ({wdFilter}).
              </div>
            ) : (
              <div className="space-y-4">
                {filteredWithdrawals.map((wd) => {
                  const isUnmasked = Boolean(unmaskedWdIds[wd.id]);
                  const isTerminal =
                    wd.status === 'COMPLETED' ||
                    wd.status === 'REJECTED' ||
                    wd.status === 'CANCELLED';

                  return (
                    <div
                      key={wd.id}
                      className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 text-xs"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2 font-mono">
                            <span className="font-bold text-sm text-slate-900">{wd.id}</span>
                            <span>·</span>
                            <span
                              className={`font-bold ${
                                wd.status === 'COMPLETED'
                                  ? 'text-emerald-700'
                                  : wd.status === 'REJECTED' || wd.status === 'CANCELLED'
                                  ? 'text-red-700'
                                  : wd.status === 'PROCESSING'
                                  ? 'text-sky-700'
                                  : 'text-amber-700'
                              }`}
                            >
                              Status: {wd.status}
                            </span>
                            <span>·</span>
                            <span className="text-slate-500">
                              Requested: {new Date(wd.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-slate-800">
                            Customer: <strong>{wd.userName}</strong> (
                            <span className="font-mono">{wd.userIdentifier}</span>)
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 font-mono tabular-nums">
                          <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                            <span className="text-slate-500 block text-[10px]">Gross Amount</span>
                            <span className="font-bold text-slate-900 text-sm">
                              Rs. {wd.amount.toLocaleString()}
                            </span>
                          </div>
                          <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                            <span className="text-slate-500 block text-[10px]">Processing Fee</span>
                            <span className="font-bold text-slate-700 text-sm">
                              Rs. {wd.fee.toLocaleString()}
                            </span>
                          </div>
                          <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                            <span className="text-slate-500 block text-[10px]">
                              Net Payout Due
                            </span>
                            <span className="font-bold text-emerald-700 text-sm">
                              Rs. {wd.netAmount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Destination Details & Controls */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                        <div className="lg:col-span-5 space-y-2">
                          <div className="font-semibold text-slate-900">
                            Method: {wd.methodName} {wd.bankName ? `(${wd.bankName})` : ''}
                          </div>
                          <div className="text-slate-700">
                            Account Title: <strong>{wd.accountTitle}</strong>
                          </div>
                          <div className="flex items-center gap-2 font-mono">
                            <span>
                              Destination:{' '}
                              <strong>
                                {isUnmasked ? wd.accountNumber : wd.maskedAccountNumber}
                              </strong>
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setUnmaskedWdIds((prev) => ({
                                  ...prev,
                                  [wd.id]: !prev[wd.id],
                                }))
                              }
                              className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100 cursor-pointer"
                            >
                              {isUnmasked ? (
                                <>
                                  <EyeOff className="w-3 h-3" />
                                  <span>Mask</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3 h-3" />
                                  <span>Reveal Full Account</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Approval / Rejection History */}
                          <div className="pt-2">
                            <div className="text-[11px] font-semibold text-slate-500 mb-1">
                              Status History
                            </div>
                            <div className="space-y-1 border-l-2 border-slate-300 pl-2.5 text-[11px] text-slate-600">
                              {wd.history.map((h, i) => (
                                <div key={i}>
                                  <span className="font-mono font-semibold text-slate-800">
                                    {h.fromStatus} &rarr; {h.toStatus}
                                  </span>{' '}
                                  by {h.actorName}: {h.note}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Admin Action Controls */}
                        <div className="lg:col-span-7 space-y-3 bg-white border border-slate-200 rounded-lg p-4">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Admin / Internal Note
                            </label>
                            <input
                              type="text"
                              value={wdNotesDraft[wd.id] ?? wd.adminNotes}
                              onChange={(e) =>
                                setWdNotesDraft((prev) => ({
                                  ...prev,
                                  [wd.id]: e.target.value,
                                }))
                              }
                              placeholder="Enter verification or payout note..."
                              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded"
                            />
                          </div>

                          {!isTerminal && (
                            <>
                              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                                <div className="font-semibold text-slate-900">
                                  Manual Payout Execution Confirmation (Required for COMPLETED)
                                </div>
                                <input
                                  type="text"
                                  value={wdPayoutRefDraft[wd.id] ?? wd.payoutReference ?? ''}
                                  onChange={(e) =>
                                    setWdPayoutRefDraft((prev) => ({
                                      ...prev,
                                      [wd.id]: e.target.value,
                                    }))
                                  }
                                  placeholder="Enter real bank/Easypaisa payout transfer ID (e.g. TX-994120)"
                                  className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded"
                                />
                                <label className="flex items-start gap-2 text-xs text-slate-800 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(wdConfirmRealPayout[wd.id])}
                                    onChange={(e) =>
                                      setWdConfirmRealPayout((prev) => ({
                                        ...prev,
                                        [wd.id]: e.target.checked,
                                      }))
                                    }
                                    className="mt-0.5"
                                  />
                                  <span>
                                    I confirm that the actual payment of{' '}
                                    <strong className="font-mono">
                                      Rs. {wd.netAmount.toLocaleString()}
                                    </strong>{' '}
                                    has been sent to {wd.accountTitle} ({wd.accountNumber}).
                                  </span>
                                </label>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                {wd.status === 'PENDING' && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateWithdrawal(wd, 'PROCESSING')}
                                    className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded cursor-pointer"
                                  >
                                    Approve &amp; Mark PROCESSING
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleUpdateWithdrawal(wd, 'COMPLETED')}
                                  className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded cursor-pointer"
                                >
                                  Mark COMPLETED (After Real Payout)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateWithdrawal(wd, 'REJECTED')}
                                  className="px-3 py-1.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded cursor-pointer"
                                >
                                  Reject &amp; Release Reserved Funds
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateWithdrawal(wd, wd.status)}
                                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
                                >
                                  Save Note Only
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 2: EASYPAISA DEPOSITS ==================== */}
        {activeTab === 'deposits' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Easypaisa Deposit &amp; Plan Payment Queue ({settings.easypaisaNumber})
                </h2>
                <p className="text-xs text-slate-600">
                  Approving a deposit posts an immutable CREDIT ledger entry to the customer&apos;s
                  Wallet and activates their selected plan if applicable.
                </p>
              </div>
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
                {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setDepFilter(status)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
                      depFilter === status
                        ? 'bg-white text-slate-900 font-semibold shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {filteredDeposits.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                No deposit submissions match filter ({depFilter}).
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs text-slate-500">
                      <th className="py-2.5 pr-4 font-semibold">Client</th>
                      <th className="py-2.5 px-4 font-semibold">Purpose / Plan</th>
                      <th className="py-2.5 px-4 font-semibold">Easypaisa TID &amp; Sender</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Amount</th>
                      <th className="py-2.5 px-4 font-semibold">Status</th>
                      <th className="py-2.5 pl-4 font-semibold">Verification Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {filteredDeposits.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/70">
                        <td className="py-3.5 pr-4">
                          <div className="font-semibold text-slate-900">{tx.userName}</div>
                          <div className="font-mono text-[11px] text-slate-500">
                            {tx.userIdentifier}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">{tx.planName}</td>
                        <td className="py-3.5 px-4 font-mono tabular-nums">
                          <div className="font-bold text-slate-900">TID: {tx.transactionId}</div>
                          <div className="text-[11px] text-slate-500">From: {tx.senderNumber}</div>
                          {tx.paymentProofNote && (
                            <div className="text-[11px] text-slate-600">
                              Note: {tx.paymentProofNote}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                          {tx.amount}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`font-semibold ${
                              tx.status === 'Approved'
                                ? 'text-emerald-700'
                                : tx.status === 'Rejected'
                                ? 'text-red-700'
                                : 'text-amber-700'
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3.5 pl-4 min-w-[250px]">
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              value={depNotesDraft[tx.id] ?? tx.adminNotes}
                              onChange={(e) =>
                                setDepNotesDraft((prev) => ({
                                  ...prev,
                                  [tx.id]: e.target.value,
                                }))
                              }
                              placeholder="Add verification note..."
                              className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded text-slate-900"
                            />
                            {tx.status !== 'Approved' && (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleReviewDeposit(tx.id, 'Approved')}
                                  className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded cursor-pointer"
                                >
                                  Approve &amp; Credit Wallet
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReviewDeposit(tx.id, 'Rejected')}
                                  className="px-2.5 py-1 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 3: WALLETS, ADJUSTMENTS & IMMUTABLE LEDGER ==================== */}
        {activeTab === 'wallets' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Controlled Balance Adjustment Form */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <div>
                  <div className="text-xs text-slate-500">Audited Accounting Action</div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Controlled Wallet Balance Adjustment
                  </h2>
                  <p className="mt-1 text-xs text-slate-600">
                    Historical ledger entries cannot be edited. Use this form to post a new
                    immutable <strong>ADJUSTMENT</strong> or <strong>REFUND</strong> entry.
                  </p>
                </div>

                <form onSubmit={handleBalanceAdjustment} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Target Customer Account
                    </label>
                    <select
                      value={adjUserId}
                      onChange={(e) => setAdjUserId(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                    >
                      {users.map((u) => {
                        const w = wallets.find((wal) => wal.userId === u.id);
                        return (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.identifier}) — Avail: Rs.{' '}
                            {(w?.availableBalance || 0).toLocaleString()}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Direction
                      </label>
                      <select
                        value={adjDirection}
                        onChange={(e) => setAdjDirection(e.target.value as 'CREDIT' | 'DEBIT')}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="CREDIT">CREDIT (+ Add Funds)</option>
                        <option value="DEBIT">DEBIT (- Deduct Funds)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Category
                      </label>
                      <select
                        value={adjCategory}
                        onChange={(e) =>
                          setAdjCategory(e.target.value as 'ADJUSTMENT' | 'REFUND')
                        }
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="ADJUSTMENT">ADJUSTMENT</option>
                        <option value="REFUND">REFUND</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Amount (PKR)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={adjAmount}
                      onChange={(e) => setAdjAmount(e.target.value)}
                      placeholder="e.g. 5000"
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mandatory Audit Reason
                    </label>
                    <input
                      type="text"
                      value={adjReason}
                      onChange={(e) => setAdjReason(e.target.value)}
                      placeholder="e.g. Verified referral commission or plan payout credit"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    Post Immutable Adjustment Entry
                  </button>
                </form>
              </div>

              {/* Customer Wallets Table */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Customer Wallet Balances</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs text-slate-500">
                        <th className="py-2 pr-3 font-semibold">User</th>
                        <th className="py-2 px-3 font-semibold text-right">Available</th>
                        <th className="py-2 px-3 font-semibold text-right">Pending / Reserved</th>
                        <th className="py-2 px-3 font-semibold text-right">Deposited</th>
                        <th className="py-2 pl-3 font-semibold text-right">Withdrawn</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs font-mono tabular-nums">
                      {users.map((u) => {
                        const w = wallets.find((wal) => wal.userId === u.id);
                        return (
                          <tr key={u.id}>
                            <td className="py-2.5 pr-3 font-sans">
                              <div className="font-semibold text-slate-900">{u.name}</div>
                              <div className="font-mono text-[11px] text-slate-500">
                                {u.identifier}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                              Rs. {(w?.availableBalance || 0).toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-right text-amber-700">
                              Rs. {(w?.pendingBalance || 0).toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-800">
                              Rs. {(w?.totalDeposited || 0).toLocaleString()}
                            </td>
                            <td className="py-2.5 pl-3 text-right text-slate-800">
                              Rs. {(w?.completedWithdrawalsAmount || 0).toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Global Immutable Ledger Table */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-900">
                Global Immutable Wallet Ledger ({ledgerEntries.length} Entries)
              </h2>
              {ledgerEntries.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                  No ledger entries posted yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs text-slate-500">
                        <th className="py-2.5 pr-3 font-semibold">Ledger ID / Timestamp</th>
                        <th className="py-2.5 px-3 font-semibold">User ID</th>
                        <th className="py-2.5 px-3 font-semibold">Type</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Amount</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Before &rarr; After</th>
                        <th className="py-2.5 pl-3 font-semibold">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs">
                      {ledgerEntries.slice(0, 50).map((entry) => (
                        <tr key={entry.id}>
                          <td className="py-2.5 pr-3 font-mono whitespace-nowrap">
                            <div className="font-semibold text-slate-900">{entry.id}</div>
                            <div className="text-[11px] text-slate-400">
                              {new Date(entry.createdAt).toLocaleString()}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{entry.userId}</td>
                          <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                            {entry.type}
                          </td>
                          <td
                            className={`py-2.5 px-3 text-right font-mono tabular-nums font-bold ${
                              entry.direction === 'CREDIT' ? 'text-emerald-700' : 'text-slate-900'
                            }`}
                          >
                            {entry.direction === 'CREDIT' ? '+' : '-'}Rs.{' '}
                            {entry.amount.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                            Rs. {entry.balanceBefore.toLocaleString()} &rarr; Rs.{' '}
                            {entry.balanceAfter.toLocaleString()}
                          </td>
                          <td className="py-2.5 pl-3 text-slate-600">{entry.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 4: CONFIGURABLE WITHDRAWAL METHODS ==================== */}
        {activeTab === 'methods' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-900">
                Add Configurable Withdrawal Method
              </h2>
              <form onSubmit={handleCreateWithdrawalMethod} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Method Name
                    </label>
                    <input
                      type="text"
                      value={wmName}
                      onChange={(e) => setWmName(e.target.value)}
                      placeholder="e.g. SadaPay / Bank"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Method Code
                    </label>
                    <input
                      type="text"
                      value={wmCode}
                      onChange={(e) => setWmCode(e.target.value)}
                      placeholder="e.g. SADAPAY"
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Min Withdrawal (PKR)
                    </label>
                    <input
                      type="number"
                      value={wmMin}
                      onChange={(e) => setWmMin(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Max Withdrawal (PKR)
                    </label>
                    <input
                      type="number"
                      value={wmMax}
                      onChange={(e) => setWmMax(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Fee Percent (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={wmFeePercent}
                      onChange={(e) => setWmFeePercent(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Fixed Fee (PKR)
                    </label>
                    <input
                      type="number"
                      value={wmFeeFixed}
                      onChange={(e) => setWmFeeFixed(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Field Label
                  </label>
                  <input
                    type="text"
                    value={wmLabel}
                    onChange={(e) => setWmLabel(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={wmRequiresBank}
                    onChange={(e) => setWmRequiresBank(e.target.checked)}
                  />
                  <span>Requires Bank Name Input</span>
                </label>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Save Withdrawal Method
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-900">
                Configured Withdrawal Methods
              </h2>
              <div className="space-y-3">
                {withdrawalMethods.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        {m.name} ({m.code}) —{' '}
                        <span className={m.active ? 'text-emerald-700' : 'text-red-700'}>
                          {m.active ? 'ACTIVE' : 'DISABLED'}
                        </span>
                      </div>
                      <div className="font-mono text-slate-600 mt-1">
                        Min: Rs. {m.minAmount.toLocaleString()} · Max: Rs.{' '}
                        {m.maxAmount.toLocaleString()} · Fee: {m.feePercent}% + Rs. {m.feeFixed}
                      </div>
                      <div className="text-slate-500 mt-0.5">{m.instructions}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleMethodActive(m)}
                      className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 rounded-lg cursor-pointer shrink-0"
                    >
                      {m.active ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 5: IMMUTABLE AUDIT LOG ==================== */}
        {activeTab === 'audit' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-slate-800" />
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Immutable Administrator Audit Log ({auditLogs.length})
                </h2>
                <p className="text-xs text-slate-600">
                  Records every sensitive administrative action with previous/new state and
                  metadata. Audit records cannot be edited or deleted.
                </p>
              </div>
            </div>

            {auditLogs.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                No administrative actions logged yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs text-slate-500">
                      <th className="py-2.5 pr-3 font-semibold">Timestamp / ID</th>
                      <th className="py-2.5 px-3 font-semibold">Admin</th>
                      <th className="py-2.5 px-3 font-semibold">Action</th>
                      <th className="py-2.5 px-3 font-semibold">Target User</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Amount</th>
                      <th className="py-2.5 pl-3 font-semibold">State Transition</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="py-3 pr-3 font-mono whitespace-nowrap">
                          <div className="font-semibold text-slate-900">{log.id}</div>
                          <div className="text-[11px] text-slate-400">
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-900">{log.adminName}</td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                          {log.action}
                        </td>
                        <td className="py-3 px-3 text-slate-700">{log.targetUserName}</td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                          {log.amount !== null ? `Rs. ${log.amount.toLocaleString()}` : '—'}
                        </td>
                        <td className="py-3 pl-3 font-mono text-[11px] text-slate-600 max-w-md">
                          <div>Prev: {log.previousState}</div>
                          <div className="text-slate-900">New: {log.newState}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 6: PLANS & PACKAGES MANAGER ==================== */}
        {activeTab === 'plans' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Add New Service Plan</h2>
              <form onSubmit={handleCreatePlan} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    value={newPlanName}
                    onChange={(e) => setNewPlanName(e.target.value)}
                    placeholder="e.g. Plan 13 — 500,000 Investment"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Investment
                    </label>
                    <input
                      type="text"
                      value={newPlanPrice}
                      onChange={(e) => setNewPlanPrice(e.target.value)}
                      placeholder="500,000 PKR"
                      className="w-full px-2.5 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Daily Profit
                    </label>
                    <input
                      type="text"
                      value={newPlanDaily}
                      onChange={(e) => setNewPlanDaily(e.target.value)}
                      placeholder="250,000 PKR"
                      className="w-full px-2.5 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Total Profit
                    </label>
                    <input
                      type="text"
                      value={newPlanTotal}
                      onChange={(e) => setNewPlanTotal(e.target.value)}
                      placeholder="7,500,000 PKR"
                      className="w-full px-2.5 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={newPlanDuration}
                    onChange={(e) => setNewPlanDuration(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Included Features (One per line)
                  </label>
                  <textarea
                    rows={3}
                    value={newPlanFeaturesText}
                    onChange={(e) => setNewPlanFeaturesText(e.target.value)}
                    placeholder="Investment: Rs. 500,000&#10;Daily Profit: Rs. 250,000"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Service Plan</span>
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-900">
                Active Service Plans ({plans.length})
              </h2>
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {plans.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{p.name}</div>
                      <div className="font-mono text-slate-600 mt-0.5">
                        Price: {p.price} · Daily: {p.dailyProfit || '—'} · Total:{' '}
                        {p.totalProfit || '—'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeletePlan(p.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 7: USERS ==================== */}
        {activeTab === 'users' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Registered Portal Accounts</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500">
                    <th className="py-2.5 pr-4 font-semibold">Name</th>
                    <th className="py-2.5 px-4 font-semibold">Identifier</th>
                    <th className="py-2.5 px-4 font-semibold">Role</th>
                    <th className="py-2.5 px-4 font-semibold">Status</th>
                    <th className="py-2.5 px-4 font-semibold">Active Plan</th>
                    <th className="py-2.5 pl-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {users.map((u) => {
                    const userPlan = plans.find((p) => p.id === u.activePlanId);
                    return (
                      <tr key={u.id}>
                        <td className="py-3 pr-4 font-semibold text-slate-900">{u.name}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{u.identifier}</td>
                        <td className="py-3 px-4 font-medium text-slate-800">{u.role}</td>
                        <td className="py-3 px-4 font-semibold">
                          <span
                            className={
                              u.status === 'SUSPENDED' ? 'text-red-700' : 'text-emerald-700'
                            }
                          >
                            {u.status || 'ACTIVE'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {userPlan ? userPlan.name : 'None'}
                        </td>
                        <td className="py-3 pl-4">
                          {u.role !== 'admin' && (
                            <button
                              type="button"
                              onClick={() => handleToggleUserStatus(u)}
                              className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
                            >
                              {u.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== TAB 8: SUPPORT INQUIRIES ==================== */}
        {activeTab === 'inquiries' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Client Support Inquiries</h2>
            {inquiries.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                No support inquiries submitted yet.
              </div>
            ) : (
              <div className="space-y-3">
                {inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="text-xs text-slate-500">
                        <span className="font-semibold text-slate-900">{inq.name}</span>
                        <span aria-hidden="true"> · </span>
                        <span className="font-mono">{inq.contactInfo}</span>
                        <span aria-hidden="true"> · </span>
                        <span>{new Date(inq.createdAt).toLocaleString()}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{inq.subject}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{inq.message}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {(['Open', 'In Progress', 'Resolved'] as InquiryStatus[]).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleUpdateInquiry(inq.id, st, inq.adminReply)}
                          className={`px-2.5 py-1 text-xs font-medium rounded cursor-pointer ${
                            inq.status === st
                              ? 'bg-slate-900 text-white font-semibold'
                              : 'bg-white border border-slate-300 text-slate-700'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 9: LOGO & WEBSITE SETTINGS ==================== */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Official {settings.brandName} Logo &amp; Hero Configuration
                </h2>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Upload Official Logo Image
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choose Logo File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setLogoUrlInput('/rex-traders-logo.svg')}
                      className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                    >
                      Use Default Official Logo
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Logo URL
                  </label>
                  <input
                    type="text"
                    value={logoUrlInput}
                    onChange={(e) => setLogoUrlInput(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Hero Headline
                  </label>
                  <input
                    type="text"
                    value={heroHeadlineInput}
                    onChange={(e) => setHeroHeadlineInput(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Hero Subheadline
                  </label>
                  <textarea
                    rows={3}
                    value={heroSubheadlineInput}
                    onChange={(e) => setHeroSubheadlineInput(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Save Website Settings
                </button>
              </form>
            </div>

            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Exclusive Owner Access &amp; Password
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Administrator Console access is strictly locked to{' '}
                  <strong className="font-mono text-slate-900">sulemanadan816@gmail.com</strong>. No
                  other account can access or be promoted to administrator.
                </p>
              </div>

              <form onSubmit={handleUpdateOwnerPassword} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Owner Password
                  </label>
                  <input
                    type="password"
                    value={currentOwnerPassword}
                    onChange={(e) => setCurrentOwnerPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Owner Password (min 8 characters)
                  </label>
                  <input
                    type="password"
                    value={newOwnerPassword}
                    onChange={(e) => setNewOwnerPassword(e.target.value)}
                    placeholder="Enter new strong password"
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Update Owner Password
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
