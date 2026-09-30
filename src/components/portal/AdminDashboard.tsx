import React, { useEffect, useState, useCallback } from 'react';
import { Plus, RefreshCw, Trash2, Upload } from 'lucide-react';
import {
  InquiryStatus,
  PageRoute,
  PaymentTransaction,
  ServicePlan,
  SiteSettings,
  SupportInquiry,
  TransactionStatus,
  UserAccount,
} from '../../types';

interface AdminDashboardProps {
  token: string;
  settings: SiteSettings;
  onSettingsUpdated: (newSettings: SiteSettings) => void;
  onPlansUpdated: () => void;
  onNavigate: (page: PageRoute) => void;
}

type AdminTab = 'transactions' | 'plans' | 'inquiries' | 'users' | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  token,
  settings,
  onSettingsUpdated,
  onPlansUpdated,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('transactions');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const [users, setUsers] = useState<UserAccount[]>([]);
  const [plans, setPlans] = useState<ServicePlan[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [inquiries, setInquiries] = useState<SupportInquiry[]>([]);

  // Filter state for Transactions
  const [txFilter, setTxFilter] = useState<'All' | TransactionStatus>('All');
  const [txNotesDraft, setTxNotesDraft] = useState<Record<string, string>>({});

  // New Plan Form State
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanAudience, setNewPlanAudience] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState('');
  const [newPlanDuration, setNewPlanDuration] = useState('30 Days Duration');
  const [newPlanDesc, setNewPlanDesc] = useState('');
  const [newPlanFeaturesText, setNewPlanFeaturesText] = useState('');
  const [newPlanPopular, setNewPlanPopular] = useState(false);

  // Settings Form State
  const [logoUrlInput, setLogoUrlInput] = useState<string>(settings.logoUrl || '');
  const [heroHeadlineInput, setHeroHeadlineInput] = useState<string>(settings.heroHeadline);
  const [heroSubheadlineInput, setHeroSubheadlineInput] = useState<string>(
    settings.heroSubheadline
  );

  const fetchAdminOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/overview', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to load administrator data.');
      } else {
        setUsers(data.users || []);
        setPlans(data.plans || []);
        setTransactions(data.transactions || []);
        setInquiries(data.inquiries || []);
        if (data.settings) {
          setLogoUrlInput(data.settings.logoUrl || '');
          setHeroHeadlineInput(data.settings.heroHeadline || '');
          setHeroSubheadlineInput(data.settings.heroSubheadline || '');
        }
      }
    } catch {
      setError('Network error while loading admin panel.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAdminOverview();
  }, [fetchAdminOverview]);

  const showFlash = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  };

  const handleReviewTransaction = async (id: string, status: TransactionStatus) => {
    const adminNotes =
      txNotesDraft[id] ??
      (status === 'Approved'
        ? 'Easypaisa transfer verified by administrator. Plan activated.'
        : status === 'Rejected'
        ? 'Transaction ID could not be verified against Easypaisa records.'
        : 'Pending manual verification.');

    try {
      const res = await fetch(`/api/admin/transactions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, adminNotes }),
      });
      if (res.ok) {
        showFlash(`Transaction marked as ${status}.`);
        fetchAdminOverview();
      }
    } catch {
      setError('Could not update transaction status.');
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const features = newPlanFeaturesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (!newPlanName.trim() || !newPlanPrice.trim() || features.length === 0) {
      setError('Please fill in Plan Name, Price, Description, and at least one feature line.');
      return;
    }

    try {
      const res = await fetch('/api/admin/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newPlanName.trim(),
          targetAudience:
            newPlanAudience.trim() || 'Structured service package for REX TRADERS clients',
          price: newPlanPrice.trim(),
          currency: 'PKR',
          duration: newPlanDuration.trim(),
          description:
            newPlanDesc.trim() ||
            'Structured trading service package with support and portal access.',
          features,
          ctaText: `Select ${newPlanName.trim()}`,
          isPopular: newPlanPopular,
          active: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not create plan.');
      } else {
        setNewPlanName('');
        setNewPlanAudience('');
        setNewPlanPrice('');
        setNewPlanDesc('');
        setNewPlanFeaturesText('');
        setNewPlanPopular(false);
        showFlash('New service plan created.');
        fetchAdminOverview();
        onPlansUpdated();
      }
    } catch {
      setError('Network error while creating plan.');
    }
  };

  const handleDeletePlan = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/plans/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showFlash('Service plan removed.');
        fetchAdminOverview();
        onPlansUpdated();
      }
    } catch {
      setError('Could not delete plan.');
    }
  };

  const handleUpdateInquiry = async (id: string, status: InquiryStatus, adminReply: string) => {
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, adminReply }),
      });
      if (res.ok) {
        showFlash(`Inquiry marked as ${status}.`);
        fetchAdminOverview();
      }
    } catch {
      setError('Could not update support inquiry.');
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
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          logoUrl: logoUrlInput.trim() ? logoUrlInput.trim() : null,
          heroHeadline: heroHeadlineInput.trim(),
          heroSubheadline: heroSubheadlineInput.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.settings) {
        onSettingsUpdated(data.settings);
        showFlash('Website & Logo settings updated across REX TRADERS.');
      } else {
        setError(data.error || 'Could not save settings.');
      }
    } catch {
      setError('Network error while saving settings.');
    }
  };

  const filteredTransactions =
    txFilter === 'All'
      ? transactions
      : transactions.filter((t) => t.status === txFilter);

  return (
    <section className="py-10 sm:py-12 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500 mb-1">
              <span>{settings.brandName}</span>
              <span aria-hidden="true"> · </span>
              <span>Administrator Console</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Operations, Payment Verification &amp; Website Settings
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap"
            >
              Client Portal View
            </button>
            <button
              type="button"
              onClick={fetchAdminOverview}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>

        {/* Summary Metrics Row (Tabular Numerals) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs text-slate-500">Pending Verifications</div>
            <div className="mt-1 font-mono tabular-nums text-2xl font-bold text-amber-700">
              {transactions.filter((t) => t.status === 'Pending').length}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs text-slate-500">Approved Transactions</div>
            <div className="mt-1 font-mono tabular-nums text-2xl font-bold text-emerald-700">
              {transactions.filter((t) => t.status === 'Approved').length}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs text-slate-500">Active Service Plans</div>
            <div className="mt-1 font-mono tabular-nums text-2xl font-bold text-slate-900">
              {plans.filter((p) => p.active).length}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs text-slate-500">Open Support Inquiries</div>
            <div className="mt-1 font-mono tabular-nums text-2xl font-bold text-slate-900">
              {inquiries.filter((i) => i.status !== 'Resolved').length}
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
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/80 rounded-lg w-fit">
          {(
            [
              { id: 'transactions', label: 'Payment Verifications' },
              { id: 'plans', label: 'Plans & Packages' },
              { id: 'inquiries', label: 'Support Inquiries' },
              { id: 'users', label: 'Registered Users' },
              { id: 'settings', label: 'Logo & Website Settings' },
            ] as { id: AdminTab; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: PAYMENT VERIFICATIONS */}
        {activeTab === 'transactions' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Easypaisa Payment Verification Queue ({settings.easypaisaNumber})
                </h2>
                <p className="text-xs text-slate-600">
                  Verify each submitted Transaction ID (TID) before marking Approved. Approving a
                  transaction activates the selected plan for that client.
                </p>
              </div>
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
                {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setTxFilter(status)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
                      txFilter === status
                        ? 'bg-white text-slate-900 font-semibold shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="h-24 bg-slate-100 rounded animate-pulse" />
            ) : filteredTransactions.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                No payment transactions match the selected filter ({txFilter}).
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs text-slate-500">
                      <th className="py-2.5 pr-4 font-semibold">Client</th>
                      <th className="py-2.5 px-4 font-semibold">Plan</th>
                      <th className="py-2.5 px-4 font-semibold">TID &amp; Sender</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Amount</th>
                      <th className="py-2.5 px-4 font-semibold">Status</th>
                      <th className="py-2.5 px-4 font-semibold">Admin Notes &amp; Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {filteredTransactions.map((tx) => (
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
                        <td className="py-3.5 pl-4 min-w-[260px]">
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              value={txNotesDraft[tx.id] ?? tx.adminNotes}
                              onChange={(e) =>
                                setTxNotesDraft((prev) => ({
                                  ...prev,
                                  [tx.id]: e.target.value,
                                }))
                              }
                              placeholder="Add verification note..."
                              className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded text-slate-900"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleReviewTransaction(tx.id, 'Approved')}
                                className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReviewTransaction(tx.id, 'Rejected')}
                                className="px-2.5 py-1 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded cursor-pointer"
                              >
                                Reject
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReviewTransaction(tx.id, 'Pending')}
                                className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
                              >
                                Set Pending
                              </button>
                            </div>
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

        {/* TAB 2: PLANS & PACKAGES MANAGER */}
        {activeTab === 'plans' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Add New Service Plan</h2>
              <p className="text-xs text-slate-600">
                Configure real service packages without hardcoded fake return promises.
              </p>
              <form onSubmit={handleCreatePlan} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    value={newPlanName}
                    onChange={(e) => setNewPlanName(e.target.value)}
                    placeholder="e.g. Monthly Service Package"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Price (PKR)
                    </label>
                    <input
                      type="text"
                      value={newPlanPrice}
                      onChange={(e) => setNewPlanPrice(e.target.value)}
                      placeholder="e.g. 5,000 PKR"
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={newPlanDuration}
                      onChange={(e) => setNewPlanDuration(e.target.value)}
                      placeholder="e.g. 30 Days Duration"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Audience Summary
                  </label>
                  <input
                    type="text"
                    value={newPlanAudience}
                    onChange={(e) => setNewPlanAudience(e.target.value)}
                    placeholder="Who this package is designed for"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={newPlanDesc}
                    onChange={(e) => setNewPlanDesc(e.target.value)}
                    placeholder="Summary of the service package scope..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Included Features (One per line)
                  </label>
                  <textarea
                    rows={4}
                    value={newPlanFeaturesText}
                    onChange={(e) => setNewPlanFeaturesText(e.target.value)}
                    placeholder={
                      'Access to REX TRADERS market briefings\nDirect Telegram support (@rextrades0)\nPortal verification tracking'
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={newPlanPopular}
                    onChange={(e) => setNewPlanPopular(e.target.checked)}
                  />
                  <span>Highlight as Recommended Tier</span>
                </label>
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
              <h2 className="text-lg font-bold text-slate-900">Existing Service Plans</h2>
              <div className="space-y-3">
                {plans.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="text-xs text-slate-500">
                        <span>{p.duration}</span>
                        <span aria-hidden="true"> · </span>
                        <span className="font-mono font-semibold text-slate-900">{p.price}</span>
                        {p.isPopular && (
                          <>
                            <span aria-hidden="true"> · </span>
                            <span className="font-semibold text-slate-900">Recommended</span>
                          </>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">{p.name}</h3>
                      <p className="text-xs text-slate-600 mt-1">{p.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeletePlan(p.id)}
                      className="self-start sm:self-center inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg cursor-pointer shrink-0"
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

        {/* TAB 3: SUPPORT INQUIRIES */}
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

        {/* TAB 4: USERS */}
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
                    <th className="py-2.5 px-4 font-semibold">Active Plan</th>
                    <th className="py-2.5 pl-4 font-semibold">Registered</th>
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
                        <td className="py-3 px-4 text-slate-700">
                          {userPlan ? userPlan.name : 'None'}
                        </td>
                        <td className="py-3 pl-4 font-mono tabular-nums text-slate-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: LOGO & WEBSITE SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-2xl space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Official {settings.brandName} Logo &amp; Hero Configuration
              </h2>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                When your official REX TRADERS logo is ready, upload it below or paste its image
                URL. It will immediately replace the placeholder in the Header and Footer while
                preserving aspect ratio.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Upload Official Logo Image (PNG / SVG / JPG)
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
                  {logoUrlInput && (
                    <button
                      type="button"
                      onClick={() => setLogoUrlInput('')}
                      className="px-3 py-2 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer"
                    >
                      Reset to Placeholder
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Or Enter Logo Image URL
                </label>
                <input
                  type="text"
                  value={logoUrlInput}
                  onChange={(e) => setLogoUrlInput(e.target.value)}
                  placeholder="Leave empty to display the default RT Logo Placeholder"
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
        )}
      </div>
    </section>
  );
};
