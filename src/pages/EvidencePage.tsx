import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  BrainCircuit, 
  ShieldAlert, 
  Activity, 
  Building, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import { fetchTicketById } from '../api/client';

interface EvidencePageProps {
  ticketId?: string;
  onNavigate: (page: string, params?: any) => void;
}

export const EvidencePage: React.FC<EvidencePageProps> = ({ ticketId, onNavigate }) => {
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ticketId) {
      loadTicket(ticketId);
    } else {
      // Default to edge case 1 if no id passed
      loadTicket('TICK-EDGE-001');
    }
  }, [ticketId]);

  async function loadTicket(id: string) {
    try {
      setLoading(true);
      const res = await fetchTicketById(id);
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
        <p className="text-sm">Retrieving Algorithmic Evidence...</p>
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

  const evidenceList = ticket.evidence || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('ticket-detail', { id: ticket.ticket_id })}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Ticket Details</span>
        </button>

        <span className="text-xs font-mono text-slate-500">
          Ticket: <strong className="text-slate-200">{ticket.ticket_id}</strong> ({ticket.organisation_name})
        </span>
      </div>

      {/* Main Evidence Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur space-y-6">
        
        {/* Priority & Score Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-950 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Assigned Priority:</span>
              <span className={`text-base font-bold px-3 py-1 rounded-xl border ${
                ticket.final_priority === 'Critical' ? 'bg-red-500/20 text-red-300 border-red-500' :
                ticket.final_priority === 'High' ? 'bg-amber-500/20 text-amber-300 border-amber-500' :
                ticket.final_priority === 'Medium' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500' : 'bg-slate-800 text-slate-300'
              }`}>
                {ticket.final_priority}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Contract Response Target: <span className="font-bold text-emerald-400">{ticket.contract_level === 'Platinum' ? '15 minutes' : ticket.contract_level === 'Gold' ? '30 minutes' : '60 minutes'}</span>
            </p>
          </div>

          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Impact Score</span>
            <div className="text-3xl font-mono font-bold text-emerald-400">
              {ticket.total_impact_score}<span className="text-lg text-slate-500 font-normal">/100</span>
            </div>
          </div>
        </div>

        {/* Multi-Factor Breakdown Bars */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Configured Factor Weighting Breakdown</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
            
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Clinical Impact:</span>
                <span className="font-mono text-emerald-400 font-bold">{ticket.clinical_score}/30</span>
              </div>
              <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(ticket.clinical_score / 30) * 100}%` }}></div>
              </div>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Business Impact:</span>
                <span className="font-mono text-blue-400 font-bold">{ticket.business_score}/25</span>
              </div>
              <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(ticket.business_score / 25) * 100}%` }}></div>
              </div>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Service Criticality:</span>
                <span className="font-mono text-purple-400 font-bold">{ticket.criticality_score}/20</span>
              </div>
              <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(ticket.criticality_score / 20) * 100}%` }}></div>
              </div>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Users Affected:</span>
                <span className="font-mono text-amber-400 font-bold">{ticket.users_score}/10</span>
              </div>
              <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(ticket.users_score / 10) * 100}%` }}></div>
              </div>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Operating Schedule:</span>
                <span className="font-mono text-teal-400 font-bold">{ticket.schedule_score}/10</span>
              </div>
              <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: `${(ticket.schedule_score / 10) * 100}%` }}></div>
              </div>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Contract Priority:</span>
                <span className="font-mono text-indigo-400 font-bold">{ticket.contract_score}/5</span>
              </div>
              <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(ticket.contract_score / 5) * 100}%` }}></div>
              </div>
            </div>

          </div>
        </div>

        {/* Itemized Evidence Factors List (Requirement 9) */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Auditable Evidence Trail Used for Priority Decision</span>
          </h3>

          <div className="space-y-2 text-xs">
            {evidenceList.length === 0 ? (
              <p className="text-slate-500 italic">No explicit risk triggers captured. Classified as standard routine support.</p>
            ) : (
              evidenceList.map((ev: string, idx: number) => (
                <div 
                  key={idx}
                  className={`p-3 rounded-xl border flex items-start space-x-3 ${
                    ev.includes('SUPPRESSOR')
                      ? 'bg-slate-900 border-slate-800 text-slate-400'
                      : ev.includes('clinical') || ev.includes('patient') || ev.includes('Emergency')
                      ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-200'
                      : 'bg-indigo-950/40 border-indigo-800/50 text-indigo-200'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-slate-950 flex items-center justify-center font-mono text-[10px] text-slate-400 flex-shrink-0 mt-0.5 border border-slate-800">
                    {idx + 1}
                  </span>
                  <span className="font-medium leading-relaxed">{ev}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Narrative Engine Explanation */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Natural Language Engine Justification</span>
          <p className="text-slate-200 italic leading-relaxed">
            "{ticket.improved_explanation}"
          </p>
        </div>

      </div>
    </div>
  );
};
