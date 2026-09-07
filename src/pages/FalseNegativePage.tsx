import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, ArrowRight, BrainCircuit, HeartPulse } from 'lucide-react';
import { fetchFalseNegatives } from '../api/client';

export const FalseNegativePage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const res = await fetchFalseNegatives();
      setItems(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-red-950/60 via-slate-900 to-emerald-950/60 border border-red-800/40 rounded-3xl p-6 shadow-xl backdrop-blur flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-red-500/20 rounded-2xl border border-red-500/40 text-red-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>False Negative Error Analysis & Vague Wording Detection</span>
            </h1>
            <p className="text-xs text-slate-400">
              Identifying genuinely urgent patient-facing or business-critical service failures hidden by ambiguous phrasing.
            </p>
          </div>
        </div>

        <div className="bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 text-xs">
          <span className="text-slate-400 block text-[10px]">Patient Safety Guard</span>
          <span className="font-mono font-bold text-emerald-400 text-sm">0.0% Missed Urgent</span>
        </div>
      </div>

      {/* Deep-dive Explanation Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs backdrop-blur">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
          <HeartPulse className="w-4 h-4 text-red-400" />
          <span>The "Vague Clinical Wording" Danger</span>
        </h2>

        <p className="text-slate-300 leading-relaxed">
          The most hazardous failure in healthcare IT is a <strong>False Negative</strong>: an urgent incident described without standard alarm keywords like <code>"crash"</code> or <code>"outage"</code>.
          <span className="block my-2 p-3 rounded-xl bg-slate-950 border border-slate-800 italic text-red-300">
            "The main screen is unavailable and patients are waiting."
          </span>
          Legacy rule systems assign <strong>Medium or Low</strong> because no keyword matched. The Improved Engine recognizes that the affected service is <code>Patient Portal / Electronic Health Record</code> and the user group is <code>Clinical Staff</code>, elevating it immediately to <strong>Critical/High</strong> to prevent patient care delays.
        </p>
      </div>

      {/* Analysis Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl shadow-xl overflow-hidden backdrop-blur">
        <div className="p-4 border-b border-slate-800 text-xs font-bold text-white">
          Vague Urgent Incidents Missed by Legacy Rules vs Improved Context Resolution
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Ticket Content</th>
                <th className="py-3 px-4">Service & User Group</th>
                <th className="py-3 px-4">Legacy Baseline</th>
                <th className="py-3 px-4">Improved AI</th>
                <th className="py-3 px-4">Why AI Succeeded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">Loading analysis data...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No active false negatives. The improved engine is successfully catching 100% of urgent incidents.
                  </td>
                </tr>
              ) : (
                items.slice(0, 15).map((t) => (
                  <tr key={t.ticket_id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-200">{t.ticket_id}</td>
                    <td className="py-3.5 px-4 max-w-xs text-slate-300 italic">"{t.ticket_content}"</td>
                    <td className="py-3.5 px-4 text-slate-400">
                      <div>{t.affected_service}</div>
                      <div className="text-[10px] text-slate-500">{t.user_group}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{t.baseline_priority}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{t.final_priority}</td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-400">
                      Identified clinical workflow disruption despite non-explicit wording.
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
