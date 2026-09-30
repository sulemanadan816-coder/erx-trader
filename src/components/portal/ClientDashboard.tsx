import React, { useEffect, useState, useCallback } from 'react';
import { Check, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import {
  PageRoute,
  PaymentTransaction,
  ServicePlan,
  SiteSettings,
  UserAccount,
} from '../../types';

interface ClientDashboardProps {
  user: UserAccount;
  token: string;
  settings: SiteSettings;
  plans: ServicePlan[];
  selectedPlanId: string | null;
  onNavigate: (page: PageRoute) => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  user,
  token,
  settings,
  plans,
  selectedPlanId,
  onNavigate,
}) => {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);
  const [txError, setTxError] = useState<string | null>(null);

  // Payment Submission Form State
  const [planId, setPlanId] = useState<string>(
    selectedPlanId || user.activePlanId || plans[0]?.id || ''
  );
  const [transactionId, setTransactionId] = useState('');
  const [amount, setAmount] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [copiedEasypaisa, setCopiedEasypaisa] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoadingTx(true);
    setTxError(null);
    try {
      const res = await fetch('/api/transactions/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setTxError(data.error || 'Could not load transaction history.');
      } else {
        setTransactions(data.transactions || []);
      }
    } catch {
      setTxError('Network error while loading transaction records.');
    } finally {
      setLoadingTx(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    if (selectedPlanId) {
      setPlanId(selectedPlanId);
      const found = plans.find((p) => p.id === selectedPlanId);
      if (found) setAmount(found.price);
    } else if (!planId && plans[0]?.id) {
      setPlanId(plans[0].id);
      setAmount(plans[0].price);
    }
  }, [selectedPlanId, plans, planId]);

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

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!planId) {
      setSubmitError('Please select a service plan.');
      return;
    }
    if (transactionId.trim().length < 5) {
      setSubmitError('Please enter your valid Easypaisa Transaction ID (TID).');
      return;
    }
    if (!amount.trim()) {
      setSubmitError('Please enter the transferred amount.');
      return;
    }
    if (senderNumber.trim().length < 10) {
      setSubmitError('Please enter the sender mobile/Easypaisa account number.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId,
          transactionId: transactionId.trim(),
          amount: amount.trim(),
          senderNumber: senderNumber.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || 'Could not submit payment reference.');
      } else {
        setSubmitSuccess(
          data.message ||
            'Transaction submitted with Pending status. An administrator will verify your transfer.'
        );
        setTransactionId('');
        setAmount('');
        setSenderNumber('');
        fetchTransactions();
      }
    } catch {
      setSubmitError('Network error while submitting payment reference.');
    } finally {
      setSubmitting(false);
    }
  };

  const activePlan = plans.find((p) => p.id === user.activePlanId);

  return (
    <section className="py-10 sm:py-14 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Bar Overview */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500 mb-1">
              <span>{settings.brandName}</span>
              <span aria-hidden="true"> · </span>
              <span>Client Portal</span>
              <span aria-hidden="true"> · </span>
              <span className="font-mono">{user.identifier}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome, {user.name}</h1>
            <p className="mt-1 text-xs text-slate-600">
              Current Plan Status:{' '}
              <span className="font-semibold text-slate-900">
                {activePlan ? `${activePlan.name} (Verified & Active)` : 'No Active Verified Plan'}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {user.role === 'admin' && (
              <button
                type="button"
                onClick={() => onNavigate('admin')}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer whitespace-nowrap"
              >
                Switch to Admin Panel
              </button>
            )}
            <a
              href={settings.telegramSupportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg whitespace-nowrap"
            >
              <span>Telegram Support</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href={settings.whatsappChannelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg whitespace-nowrap"
            >
              <span>WhatsApp Channel</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Main Grid: Left = Payment Verification Submission, Right = Instructions & History */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Submit Easypaisa Transaction Form (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div>
              <div className="text-xs text-slate-500 mb-1">
                <span>Manual Verification Workflow</span>
                <span aria-hidden="true"> · </span>
                <span>Easypaisa</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Submit Payment Reference for Verification
              </h2>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Transfer your plan fee to our official Easypaisa number below, then submit your
                Transaction ID (TID). All submissions start as <strong>Pending</strong> until
                verified by an administrator.
              </p>
            </div>

            {/* Official Easypaisa Box */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3">
              <div>
                <div className="text-xs text-slate-500">Official Easypaisa Number</div>
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

            <form onSubmit={handleSubmitPayment} className="space-y-4" noValidate>
              {submitError && (
                <div
                  role="alert"
                  className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-800"
                >
                  {submitError}
                </div>
              )}
              {submitSuccess && (
                <div
                  role="status"
                  className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs font-medium text-amber-900"
                >
                  {submitSuccess}
                </div>
              )}

              <div>
                <label
                  htmlFor="tx-plan"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Selected Service Plan
                </label>
                <select
                  id="tx-plan"
                  value={planId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    setPlanId(nextId);
                    const found = plans.find((p) => p.id === nextId);
                    if (found) setAmount(found.price);
                  }}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.duration} — {p.price})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="tx-id"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Easypaisa Transaction ID (TID)
                </label>
                <input
                  id="tx-id"
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. 240930184920"
                  required
                  className="w-full px-3.5 py-2.5 text-sm font-mono bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="tx-amount"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Amount Sent (PKR)
                  </label>
                  <input
                    id="tx-amount"
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 5,000 PKR"
                    required
                    className="w-full px-3.5 py-2.5 text-sm font-mono bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label
                    htmlFor="tx-sender"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Sender Mobile Number
                  </label>
                  <input
                    id="tx-sender"
                    type="text"
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    placeholder="03XX-XXXXXXX"
                    required
                    className="w-full px-3.5 py-2.5 text-sm font-mono bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
              >
                {submitting ? 'Recording Payment Reference...' : 'Submit Payment for Admin Review'}
              </button>
            </form>
          </div>

          {/* Transaction History Table (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs text-slate-500 mb-1">Verification Log</div>
                <h2 className="text-lg font-bold text-slate-900">
                  Submitted Payment Records
                </h2>
              </div>
              <button
                type="button"
                onClick={fetchTransactions}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            {txError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
                {txError}
              </div>
            )}

            {loadingTx ? (
              <div className="space-y-2 py-4">
                <div className="h-10 bg-slate-100 rounded animate-pulse" />
                <div className="h-10 bg-slate-100 rounded animate-pulse" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-sm font-semibold text-slate-900">
                  No payment submissions recorded yet
                </p>
                <p className="mt-1 text-xs text-slate-600 max-w-md mx-auto">
                  Once you send a plan payment to Easypaisa ({settings.easypaisaNumber}) and submit
                  the Transaction ID using the form, its verification status will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs text-slate-500">
                      <th className="py-2.5 pr-4 font-semibold">Transaction ID</th>
                      <th className="py-2.5 px-4 font-semibold">Plan</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Amount</th>
                      <th className="py-2.5 px-4 font-semibold">Status</th>
                      <th className="py-2.5 pl-4 font-semibold">Admin Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/80">
                        <td className="py-3 pr-4 font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                          {tx.transactionId}
                          <div className="text-[11px] font-normal text-slate-500">
                            {new Date(tx.submittedAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-800 font-medium">{tx.planName}</td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900 whitespace-nowrap">
                          {tx.amount}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
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
                        <td className="py-3 pl-4 text-slate-600 max-w-xs">{tx.adminNotes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
