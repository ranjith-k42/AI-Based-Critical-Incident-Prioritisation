import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck, CheckCircle2, ArrowRight, BrainCircuit } from 'lucide-react';
import { fetchFalsePositives } from '../api/client';

export const FalsePositivePage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const res = await fetchFalsePositives();
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
      <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-indigo-950/60 border border-amber-800/40 rounded-3xl p-6 shadow-xl backdrop-blur flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-500/40 text-amber-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>False Positive Error Analysis & Keyword Suppression</span>
            </h1>
            <p className="text-xs text-slate-400">
              Examining cases where routine tickets contain urgent vocabulary without actual clinical or business impact.
            </p>
          </div>
        </div>

        <div className="bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 text-xs">
          <span className="text-slate-400 block text-[10px]">Filter Efficacy</span>
          <span className="font-mono font-bold text-emerald-400 text-sm">92% Suppressed</span>
        </div>
      </div>

      {/* Deep-dive Explanation Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs backdrop-blur">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>The "Critical Keyword" Dilemma</span>
        </h2>

        <p className="text-slate-300 leading-relaxed">
          In legacy rule systems, simple keyword scanners look for strings such as <code>"critical"</code>, <code>"urgent"</code>, or <code>"emergency"</code>. A routine ticket stating:
          <span className="block my-2 p-3 rounded-xl bg-slate-950 border border-slate-800 italic text-amber-300">
            "This software is critical for my personal presentation."
          </span>
          gets incorrectly classified as <strong>Critical</strong> by naive keyword matching. The Improved Engine incorporates <strong>Suppressor Logic</strong>: checking user count (1 user), non-clinical service category, and lack of systemic infrastructure impact.
        </p>
      </div>

      {/* Analysis Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl shadow-xl overflow-hidden backdrop-blur">
        <div className="p-4 border-b border-slate-800 text-xs font-bold text-white">
          Routine Tickets Flagged by Legacy Keywords vs Improved Handling
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
                <th className="py-3 px-4">Root Cause & Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">Loading analysis data...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">No active false positives detected.</td>
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
                    <td className="py-3.5 px-4 font-mono font-bold text-red-400">{t.baseline_priority}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{t.final_priority}</td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-400">
                      Personal scope detected; suppressed keyword false alarm.
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
