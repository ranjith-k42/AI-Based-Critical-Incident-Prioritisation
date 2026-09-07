import React, { useState } from 'react';
import { Ticket, PriorityLevel, UserRole } from '../types';
import { X, ArrowRightLeft, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';

interface ManualOverrideModalProps {
  ticket: Ticket | null;
  activeRole: UserRole;
  onClose: () => void;
  onSubmitOverride: (ticketId: string, newPriority: PriorityLevel, reason: string, userName: string) => void;
}

export const ManualOverrideModal: React.FC<ManualOverrideModalProps> = ({
  ticket,
  activeRole,
  onClose,
  onSubmitOverride,
}) => {
  if (!ticket) return null;

  const [newPriority, setNewPriority] = useState<PriorityLevel>(ticket.finalPriority);
  const [reason, setReason] = useState<string>('');
  const [userName, setUserName] = useState<string>(
    activeRole.includes('Healthcare') ? 'Dr. Sarah Jenkins' :
    activeRole.includes('Financial') ? 'Alex Rivera' :
    activeRole.includes('Vendor') ? 'L3 Technical Lead' : 'Mark Vance (Admin)'
  );
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('A detailed clinical or business reason is required for auditable override logging.');
      return;
    }
    if (newPriority === ticket.finalPriority) {
      setError('Selected new priority is identical to current assigned priority.');
      return;
    }

    onSubmitOverride(ticket.id, newPriority, reason.trim(), userName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden relative">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-purple-950/60 to-slate-900 border-b border-purple-800/40 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Manual Priority Override</h3>
              <p className="text-xs text-purple-300">Auditable Governance Action</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Target Ticket Summary */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1">
            <div className="flex justify-between font-mono font-bold text-slate-200">
              <span>{ticket.id}</span>
              <span className="text-slate-400 font-sans font-normal">{ticket.organisation}</span>
            </div>
            <p className="text-slate-300 line-clamp-2 italic">"{ticket.ticketContent}"</p>
            <div className="text-[11px] text-slate-400 pt-1 flex justify-between">
              <span>Current Priority: <strong className="text-slate-200">{ticket.finalPriority}</strong></span>
              <span>Baseline: {ticket.baselinePriority} | Improved: {ticket.improvedPriority}</span>
            </div>
          </div>

          {/* User Persona & Role Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Authorised User Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500/60"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Active Role</label>
              <input
                type="text"
                value={activeRole}
                disabled
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-slate-400 font-mono"
              />
            </div>
          </div>

          {/* New Priority Level Select */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Select New Target Priority</label>
            <div className="grid grid-cols-4 gap-2">
              {(['Critical', 'High', 'Medium', 'Low'] as PriorityLevel[]).map((level) => (
                <button
                  type="button"
                  key={level}
                  onClick={() => setNewPriority(level)}
                  className={`py-2 px-3 rounded-xl border font-bold text-xs transition ${
                    newPriority === level
                      ? level === 'Critical'
                        ? 'bg-red-500/20 text-red-300 border-red-500 shadow-md shadow-red-950'
                        : level === 'High'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                        : level === 'Medium'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500'
                        : 'bg-slate-700 text-slate-100 border-slate-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Override Justification <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Provide explicit clinical or operational reason (e.g. Nursing supervisor confirmed active ICU patient impact; or Staging environment false positive)..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500/60 placeholder-slate-500"
              required
            ></textarea>
          </div>

          {error && (
            <div className="bg-red-950/40 border border-red-800/50 text-red-300 p-2.5 rounded-xl text-[11px] flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-purple-950/30 border border-purple-900/50 p-2.5 rounded-xl text-[11px] text-purple-300">
            🔒 <strong>Audit Notice:</strong> This action will be permanently recorded in the immutable audit log with your name, role, timestamp, original priority, updated priority, and justification.
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-purple-950/40 transition"
            >
              Submit Audited Override
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
