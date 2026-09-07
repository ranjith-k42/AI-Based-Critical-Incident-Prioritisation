import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  BrainCircuit, 
  ShieldAlert, 
  Clock, 
  Building, 
  Activity, 
  CheckCircle2, 
  ArrowRightLeft, 
  History, 
  FileText,
  AlertTriangle,
  GitCommit,
  Check,
  Zap
} from 'lucide-react';
import { fetchTicketById } from '../api/client';

interface TicketDetailPageProps {
  ticketId: string;
  currentUser: any;
  onNavigate: (page: string, params?: any) => void;
}

export const TicketDetailPage: React.FC<TicketDetailPageProps> = ({
  ticketId,
  currentUser,
  onNavigate,
}) => {
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  async function loadTicket() {
    try {
      setLoading(true);
      const res = await fetchTicketById(ticketId);
      setTicket(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 space-y-2 animate-pulse">
        <Activity className="w-8 h-8 text-emerald-400 mx-auto animate-spin" />
        <p className="text-sm">Loading Ticket Details from Database...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-8 text-center text-slate-400">
        Ticket not found. <button onClick={() => onNavigate('tickets')} className="text-emerald-400 underline ml-2">Back to tickets</button>
      </div>
    );
  }

  // Visual workflow sequence definition
  const workflowSteps = [
    { label: '1. Ticket Created', done: true, desc: new Date(ticket.created_date_time).toLocaleTimeString() },
    { label: '2. Baseline Priority', done: true, desc: `Assigned [${ticket.baseline_priority}]` },
    { label: '3. Impact Scoring', done: true, desc: `Score: ${ticket.total_impact_score}/100` },
    { label: '4. Evidence Generated', done: true, desc: `${(ticket.evidence || []).length} factors captured` },
    { label: '5. Automated Priority', done: true, desc: `Improved: [${ticket.improved_priority}]` },
    { label: '6. Manual Review', done: true, desc: ticket.is_overridden ? 'Reviewed with Override' : 'Automated Approval' },
    { label: '7. Manual Override', done: ticket.is_overridden === 1, desc: ticket.is_overridden ? `Overridden to [${ticket.final_priority}]` : 'None required' },
    { label: '8. Escalation', done: true, desc: ticket.escalation_outcome || 'Standard Routing' },
    { label: '9. Resolution Status', done: ticket.incident_status === 'Resolved', desc: ticket.incident_status },
    { label: '10. Audit Trail', done: true, desc: 'Immutable Log Stored' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('tickets')}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Ticket Queue</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('evidence', { id: ticket.ticket_id })}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/50 text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>View Full AI Evidence Panel</span>
          </button>

          {(currentUser?.role === 'MSP Administrator' || currentUser?.role === 'MSP Support Analyst') && (
            <button
              onClick={() => onNavigate('override', { id: ticket.ticket_id })}
              className="px-3.5 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800/60 text-purple-200 border border-purple-700/60 text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Perform Manual Override</span>
            </button>
          )}
        </div>
      </div>

      {/* Ticket Overview Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 gap-2">
          <div>
            <div className="flex items-center space-x-3">
              <span className="text-xl font-mono font-bold text-white">{ticket.ticket_id}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {ticket.organisation_name}
              </span>
              {ticket.is_edge_case === 1 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 font-mono">
                  Edge Case: {ticket.edge_case_type}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">Logged on {new Date(ticket.created_date_time).toLocaleString()}</p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">Final Priority</span>
              <span className={`text-sm px-3 py-1 rounded-xl font-bold border ${
                ticket.final_priority === 'Critical' ? 'bg-red-500/20 text-red-300 border-red-500' :
                ticket.final_priority === 'High' ? 'bg-amber-500/20 text-amber-300 border-amber-500' :
                ticket.final_priority === 'Medium' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500' : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}>
                {ticket.final_priority}
              </span>
            </div>
          </div>
        </div>

        {/* Content Box */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Ticket Content</span>
          <p className="text-sm font-medium text-slate-100 leading-relaxed">
            "{ticket.ticket_content}"
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Affected Service</span>
              <span className="text-slate-200 font-bold">{ticket.affected_service}</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">User Group</span>
              <span className="text-slate-200 font-bold">{ticket.user_group}</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Operating Schedule</span>
              <span className="text-slate-200 font-bold">{ticket.operating_schedule}</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Contract Tier</span>
              <span className="text-slate-200 font-bold">{ticket.contract_level}</span>
            </div>
          </div>
        </div>

        {/* Visual Ticket Workflow Sequence (Requirement 17) */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <GitCommit className="w-4 h-4 text-emerald-400" />
            <span>End-to-End Visual Ticket Workflow & Lifecycle</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            {workflowSteps.map((step, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-xl border flex flex-col justify-between space-y-1 ${
                  step.done 
                    ? 'bg-slate-900/90 border-slate-800 text-slate-200' 
                    : 'bg-slate-950/40 border-slate-900 text-slate-600'
                }`}
              >
                <div className="flex items-center space-x-1.5 font-bold text-[11px] text-emerald-400">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{step.label}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Audit History (if overridden) */}
        {ticket.auditHistory && ticket.auditHistory.length > 0 && (
          <div className="bg-purple-950/20 border border-purple-900/40 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center space-x-2">
              <History className="w-4 h-4 text-purple-400" />
              <span>Immutable Audit Trail Entries</span>
            </h4>
            <div className="space-y-2 text-xs">
              {ticket.auditHistory.map((a: any) => (
                <div key={a.id} className="bg-slate-950 p-3 rounded-xl border border-purple-900/50 space-y-1">
                  <div className="flex justify-between font-mono text-[11px] text-slate-400">
                    <span>Override by: <strong className="text-slate-200">{a.user_name}</strong> ({a.user_role})</span>
                    <span>{new Date(a.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="text-slate-300">
                    Changed from <span className="font-bold text-slate-400">{a.original_priority}</span> to <span className="font-bold text-purple-300">{a.updated_priority}</span>
                  </div>
                  <p className="text-slate-400 italic text-[11px]">
                    "{a.reason}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
