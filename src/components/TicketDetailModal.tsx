import React from 'react';
import { Ticket, PriorityLevel, UserRole } from '../types';
import { 
  X, 
  BrainCircuit, 
  ShieldAlert, 
  Activity, 
  Building, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  History,
  ArrowRightLeft,
  Sparkles,
  Zap
} from 'lucide-react';
import { calculateTargetSLA } from '../engine/prioritisationEngine';

interface TicketDetailModalProps {
  ticket: Ticket | null;
  onClose: () => void;
  onOpenOverrideModal: (ticket: Ticket) => void;
  activeRole: UserRole;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  onClose,
  onOpenOverrideModal,
  activeRole,
}) => {
  if (!ticket) return null;

  const targetMins = calculateTargetSLA(ticket.finalPriority);
  const isSlaBreached = ticket.responseTimeMins > targetMins;

  const getPriorityStyle = (priority: PriorityLevel) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-500/20 text-red-300 border-red-500/50 shadow-md shadow-red-950/40';
      case 'High':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'Medium':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50';
      case 'Low':
        return 'bg-slate-700/50 text-slate-300 border-slate-600/60';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col">
        
        {/* Modal Header */}
        <div className="sticky top-0 bg-slate-900/95 border-b border-slate-800 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white font-mono">{ticket.id}</h2>
                <span className="text-xs text-slate-400 font-normal">| {ticket.organisation}</span>
                {ticket.isEdgeCase && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono">
                    {ticket.edgeCaseCategory}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">AI Priority Decision & Clinical/Business Risk Evidence</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">

          {/* Ticket Content Banner */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
              <span className="font-semibold text-slate-300">Ticket Content & Operational Parameters</span>
              <span>Logged: {new Date(ticket.timestamp).toLocaleString()}</span>
            </div>
            <p className="text-slate-100 text-sm font-medium leading-relaxed">
              "{ticket.ticketContent}"
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 text-xs">
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Affected Service</span>
                <span className="text-slate-200 font-semibold">{ticket.affectedService}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">User Group</span>
                <span className="text-slate-200 font-semibold">{ticket.userGroup}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Operating Schedule</span>
                <span className="text-slate-200 font-semibold">{ticket.operatingSchedule}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Contract Tier</span>
                <span className="text-slate-200 font-semibold">{ticket.contractPriority}</span>
              </div>
            </div>
          </div>

          {/* Side-by-Side Model Decisions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Baseline Model Box */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Baseline Rule Method</span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getPriorityStyle(ticket.baselinePriority)}`}>
                  {ticket.baselinePriority}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {ticket.baselineExplanation}
              </p>
              <div className="text-[11px] bg-slate-900/80 p-2 rounded-lg text-slate-400 border border-slate-800">
                ⚠️ <strong className="text-slate-300">Methodology:</strong> Standard keyword count + static contract tier boost. Ignores implicit clinical risk and operating schedule context.
              </div>
            </div>

            {/* Improved Model Box */}
            <div className="bg-gradient-to-br from-slate-950 via-slate-950 to-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 space-y-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-emerald-900/40 pb-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Improved AI Context Model</span>
                </span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getPriorityStyle(ticket.improvedPriority)}`}>
                  {ticket.improvedPriority}
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {ticket.improvedExplanation}
              </p>
              <div className="text-[11px] bg-emerald-950/30 p-2 rounded-lg text-emerald-300 border border-emerald-800/40 flex items-center space-x-2">
                <Zap className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  <strong>AI Composite Score:</strong> {ticket.compositeScore}/100 based on multi-dimensional clinical & operational weighting.
                </span>
              </div>
            </div>
          </div>

          {/* Risk Breakdown Indicators (Progress Bars) */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Multi-Dimensional Risk Vector Breakdown</span>
            </h3>

            <div className="space-y-3 text-xs">
              {/* Clinical Safety Risk */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-emerald-400 flex items-center space-x-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Clinical Safety & Patient Care Risk:</span>
                  </span>
                  <span className="font-mono font-bold text-slate-200">{ticket.clinicalSafetyScore}/100</span>
                </div>
                <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-red-500 rounded-full transition-all duration-500"
                    style={{ width: `${ticket.clinicalSafetyScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Business Disruption Score */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-blue-400 flex items-center space-x-1">
                    <Building className="w-3.5 h-3.5" />
                    <span>Business & Financial Disruption:</span>
                  </span>
                  <span className="font-mono font-bold text-slate-200">{ticket.businessDisruptionScore}/100</span>
                </div>
                <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${ticket.businessDisruptionScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Operational Urgency Score */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-amber-400 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Operational Schedule & Urgency:</span>
                  </span>
                  <span className="font-mono font-bold text-slate-200">{ticket.operationalUrgencyScore}/100</span>
                </div>
                <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${ticket.operationalUrgencyScore}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Signal Badges */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">Detected Risk Signals & Suppressors:</span>
              <div className="flex flex-wrap gap-1.5">
                {ticket.signalsDetected.map((signal, idx) => (
                  <span 
                    key={idx}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border ${
                      signal.includes('SUPPRESSOR')
                        ? 'bg-slate-800 text-slate-300 border-slate-700'
                        : signal.includes('Clinical')
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50'
                        : 'bg-indigo-950/60 text-indigo-300 border-indigo-800/50'
                    }`}
                  >
                    {signal}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Audit History (if overridden) */}
          {ticket.isOverridden && ticket.overrideHistory && ticket.overrideHistory.length > 0 && (
            <div className="bg-purple-950/20 border border-purple-800/40 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center space-x-2">
                <History className="w-4 h-4 text-purple-400" />
                <span>Auditable Manual Override History</span>
              </h4>
              <div className="space-y-2">
                {ticket.overrideHistory.map((entry) => (
                  <div key={entry.id} className="bg-slate-950 p-3 rounded-xl border border-purple-900/50 text-xs space-y-1">
                    <div className="flex justify-between text-slate-400 font-mono">
                      <span>User: {entry.userName} ({entry.userRole})</span>
                      <span>{new Date(entry.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="text-slate-200">
                      Changed from <span className="font-bold text-slate-400">{entry.originalPriority}</span> to <span className="font-bold text-purple-300">{entry.updatedPriority}</span>
                    </div>
                    <p className="text-slate-400 italic text-[11px]">
                      Reason: "{entry.reason}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-slate-900/95 border-t border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Current Assigned Priority: <span className={`font-bold px-2 py-0.5 rounded border ${getPriorityStyle(ticket.finalPriority)}`}>{ticket.finalPriority}</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                onClose();
                onOpenOverrideModal(ticket);
              }}
              className="px-4 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 border border-purple-700/60 text-xs font-semibold flex items-center space-x-2 transition"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Perform Manual Priority Override</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Close Window
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
