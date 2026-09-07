import React, { useState, useEffect } from 'react';
import { FlaskConical, Sparkles, AlertTriangle, CheckCircle2, ArrowRightLeft, BrainCircuit } from 'lucide-react';
import { fetchEdgeCases } from '../api/client';

interface EdgeCasesPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const EdgeCasesPage: React.FC<EdgeCasesPageProps> = ({ onNavigate }) => {
  const [edges, setEdges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const res = await fetchEdgeCases();
      setEdges(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-purple-950/60 border border-emerald-800/40 rounded-3xl p-6 shadow-xl backdrop-blur flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/40 text-emerald-400">
            <FlaskConical className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>Required Edge & Failure Case Test Suite</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Stress Test Lab
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Demonstrates how naive keyword rules fail and how improved multi-factor context arrives at the correct priority.
            </p>
          </div>
        </div>
      </div>

      {/* Edge Case Cards */}
      <div className="space-y-4">
        {edges.map((ec, idx) => (
          <div
            key={ec.ticket_id}
            className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl backdrop-blur"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-3 gap-2">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  Case {idx + 1}: {ec.edge_case_type}
                </span>
                <span className="text-xs text-slate-400 font-semibold">{ec.organisation_name}</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onNavigate('evidence', { id: ec.ticket_id })}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition"
                >
                  <BrainCircuit className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Inspect Evidence</span>
                </button>
              </div>
            </div>

            {/* Ticket Text */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono">Ticket Content</span>
              <p className="text-sm font-semibold text-slate-100">
                "{ec.ticket_content}"
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-[11px] text-slate-400">
                <span>Service: <strong className="text-slate-200">{ec.affected_service}</strong></span>
                <span>•</span>
                <span>User Group: <strong className="text-slate-200">{ec.user_group}</strong></span>
                <span>•</span>
                <span>Users Impacted: <strong className="text-slate-200">{ec.number_of_affected_users}</strong></span>
                <span>•</span>
                <span>Schedule: <strong className="text-slate-200">{ec.operating_schedule}</strong></span>
              </div>
            </div>

            {/* Side-by-Side Model Outcome */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-400">Baseline Rule Output</span>
                  <span className={`px-2.5 py-0.5 rounded border ${
                    ec.baseline_priority === 'Critical' ? 'bg-red-500/20 text-red-300 border-red-500' :
                    ec.baseline_priority === 'High' ? 'bg-amber-500/20 text-amber-300 border-amber-500' :
                    ec.baseline_priority === 'Medium' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {ec.baseline_priority}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">{ec.baseline_explanation}</p>
                {ec.baseline_priority !== ec.final_priority && (
                  <div className="text-[10px] text-amber-400 bg-amber-950/40 p-2 rounded-lg border border-amber-900/40">
                    ⚠️ <strong>Baseline Failure:</strong> {
                      ec.edge_case_type.includes('Vague') 
                        ? 'False Negative: Missed clinical incident due to missing keyword.'
                        : ec.edge_case_type.includes('False')
                        ? 'False Positive: Routine request elevated due to string keyword.'
                        : 'Failed to elevate 24/7 medication emergency after-hours.'
                    }
                  </div>
                )}
              </div>

              <div className="bg-emerald-950/20 p-4 rounded-2xl border border-emerald-800/40 space-y-2">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-emerald-400 flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Improved AI Engine Output</span>
                  </span>
                  <span className={`px-2.5 py-0.5 rounded border ${
                    ec.improved_priority === 'Critical' ? 'bg-red-500/20 text-red-300 border-red-500' :
                    ec.improved_priority === 'High' ? 'bg-amber-500/20 text-amber-300 border-amber-500' :
                    ec.improved_priority === 'Medium' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {ec.improved_priority} ({ec.total_impact_score}/100)
                  </span>
                </div>
                <p className="text-slate-200 text-[11px] leading-relaxed">{ec.improved_explanation}</p>
                <div className="text-[10px] text-emerald-300 bg-emerald-950/60 p-2 rounded-lg border border-emerald-800/50">
                  ✅ <strong>AI Success:</strong> Correctly weighed service criticality, user group role, and operating hours.
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
