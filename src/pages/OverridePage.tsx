import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRightLeft, ShieldAlert, Lock, CheckCircle2, AlertTriangle, Building } from 'lucide-react';
import { fetchTicketById, overrideTicketPriority } from '../api/client';

interface OverridePageProps {
  ticketId?: string;
  currentUser: any;
  onNavigate: (page: string, params?: any) => void;
}

export const OverridePage: React.FC<OverridePageProps> = ({ ticketId, currentUser, onNavigate }) => {
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newPriority, setNewPriority] = useState<string>('Critical');
  const [reason, setReason] = useState<string>('Emergency department confirmed patient treatment delays.');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (ticketId) {
      loadTicket(ticketId);
    } else {
      loadTicket('TICK-00001');
    }
  }, [ticketId]);

  async function loadTicket(id: string) {
    try {
      setLoading(true);
      const res = await fetchTicketById(id);
      setTicket(res);
      setNewPriority(res.final_priority === 'Critical' ? 'High' : 'Critical');
    } catch (err: any) {
      setError(err.message || 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) {
      alert('A detailed reason is required for auditable overrides.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await overrideTicketPriority(ticket.ticket_id, {
        new_priority: newPriority,
        reason: reason.trim(),
        user_name: currentUser?.name || 'Authorized Lead',
        user_role: currentUser?.role || 'MSP Administrator',
        organisation_name: ticket.organisation_name
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Override submission failed');
    } finally {
      setSubmitting(false);
    }
  }

  const isAuthorized = currentUser?.role === 'MSP Administrator' || currentUser?.role === 'MSP Support Analyst';

  if (!isAuthorized) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="p-3 bg-red-950/40 rounded-full w-14 h-14 mx-auto flex items-center justify-center text-red-400 border border-red-800/40">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Access Denied: Unauthorised Role</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Your role ({currentUser?.role}) is not permitted to perform manual priority overrides. Switch to MSP Administrator or Analyst.
        </p>
        <button
          onClick={() => onNavigate('login')}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
        >
          Switch Role
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('tickets')}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Ticket Queue</span>
        </button>
      </div>

      <div className="bg-slate-900/90 border border-purple-900/40 rounded-3xl p-6 shadow-2xl backdrop-blur space-y-6">
        
        <div className="flex items-center space-x-3 border-b border-purple-900/40 pb-4">
          <div className="p-2.5 bg-purple-950/80 border border-purple-800/60 rounded-xl text-purple-300">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Manual Priority Override Interface</h2>
            <p className="text-xs text-purple-300">
              Auditable Governance Action — Permanent record preserved in immutable ledger.
            </p>
          </div>
        </div>

        {ticket && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex justify-between font-mono font-bold text-slate-200">
              <span>{ticket.ticket_id}</span>
              <span className="text-slate-400">{ticket.organisation_name}</span>
            </div>
            <p className="text-slate-300 italic line-clamp-2">"{ticket.ticket_content}"</p>
            <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800 text-[11px]">
              <span>Current Priority: <strong className="text-slate-200">{ticket.final_priority}</strong></span>
              <span>Automated Score: <strong className="text-emerald-400">{ticket.total_impact_score}/100</strong></span>
            </div>
          </div>
        )}

        {success ? (
          <div className="bg-emerald-950/40 border border-emerald-800/50 p-6 rounded-2xl text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">Override Successfully Logged in Audit Trail</h3>
            <p className="text-xs text-slate-300">
              The ticket priority has been updated to <strong>{newPriority}</strong> and recorded permanently in the immutable audit ledger.
            </p>
            <div className="flex justify-center space-x-3 pt-2">
              <button
                onClick={() => onNavigate('audit-trail')}
                className="px-4 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 text-xs font-semibold"
              >
                View Audit Trail
              </button>
              <button
                onClick={() => onNavigate('tickets')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Back to Tickets
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Authorised User</label>
                <input
                  type="text"
                  value={currentUser?.name}
                  disabled
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-300 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">User Role</label>
                <input
                  type="text"
                  value={currentUser?.role}
                  disabled
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-300 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Select New Target Priority</label>
              <div className="grid grid-cols-4 gap-2">
                {['Critical', 'High', 'Medium', 'Low'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setNewPriority(level)}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs transition ${
                      newPriority === level
                        ? level === 'Critical' ? 'bg-red-500/20 text-red-300 border-red-500 shadow-md'
                          : level === 'High' ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                          : level === 'Medium' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500'
                          : 'bg-slate-700 text-white border-slate-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Reason for Priority Override <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Provide clinical or business justification (e.g. Emergency department confirmed patient treatment delays)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-purple-500/60"
                required
              ></textarea>
            </div>

            {error && (
              <div className="bg-red-950/40 border border-red-800/50 p-2.5 rounded-xl text-red-300 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="bg-purple-950/30 border border-purple-900/50 p-3 rounded-xl text-[11px] text-purple-300">
              🔒 <strong>Compliance Notice:</strong> The original automated baseline decision ({ticket?.baseline_priority}) and improved score ({ticket?.total_impact_score}/100) will be preserved.
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('tickets')}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-purple-950/40 transition"
              >
                {submitting ? 'Recording Override...' : 'Submit Audited Override'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
