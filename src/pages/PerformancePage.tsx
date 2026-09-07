import React, { useState, useEffect } from 'react';
import { Target, BarChart3, ShieldCheck, AlertTriangle, CheckCircle2, TrendingUp, Layers } from 'lucide-react';
import { fetchPerformanceEvaluation } from '../api/client';

export const PerformancePage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEval();
  }, []);

  async function loadEval() {
    try {
      setLoading(true);
      const res = await fetchPerformanceEvaluation();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !data) {
    return (
      <div className="py-24 text-center text-slate-400 space-y-2 animate-pulse">
        <Target className="w-8 h-8 text-emerald-400 mx-auto animate-spin" />
        <p className="text-sm">Calculating 2x2 Confusion Matrix & Metrics across Dataset...</p>
      </div>
    );
  }

  const { improved, baseline, errorAnalysis } = data;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-emerald-950/60 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-tr from-emerald-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-emerald-950/40">
            <Target className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>Model Performance & Confusion Matrix Evaluation</span>
            </h1>
            <p className="text-xs text-slate-400">
              Rigorous statistical evaluation comparing Baseline Rules vs Improved Clinical & Business Impact Model.
            </p>
          </div>
        </div>

        <div className="bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 text-xs">
          <span className="text-slate-400 block text-[10px]">Improved F1 Quality Score</span>
          <span className="font-mono font-bold text-emerald-400 text-base">{improved.f1}%</span>
        </div>
      </div>

      {/* Metrics Comparison Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-2">
          <span className="text-xs text-slate-400 font-semibold block">Overall Accuracy</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-mono font-bold text-emerald-400">{improved.accuracy}%</span>
            <span className="text-xs text-slate-500">vs {baseline.accuracy}% Base</span>
          </div>
          <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${improved.accuracy}%` }}></div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-2">
          <span className="text-xs text-slate-400 font-semibold block">Precision</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-mono font-bold text-blue-400">{improved.precision}%</span>
            <span className="text-xs text-slate-500">vs {baseline.precision}% Base</span>
          </div>
          <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${improved.precision}%` }}></div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-2">
          <span className="text-xs text-slate-400 font-semibold block">Recall (Sensitivity)</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-mono font-bold text-teal-400">{improved.recall}%</span>
            <span className="text-xs text-slate-500">vs {baseline.recall}% Base</span>
          </div>
          <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full" style={{ width: `${improved.recall}%` }}></div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-2">
          <span className="text-xs text-slate-400 font-semibold block">F1 Quality Score</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-mono font-bold text-purple-400">{improved.f1}%</span>
            <span className="text-xs text-slate-500">vs {baseline.f1}% Base</span>
          </div>
          <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${improved.f1}%` }}></div>
          </div>
        </div>

      </div>

      {/* 2x2 Confusion Matrix Visual */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Improved Model Confusion Matrix */}
        <div className="bg-slate-900/90 border border-emerald-900/50 rounded-3xl p-6 space-y-4 backdrop-blur shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Improved Prioritiser Confusion Matrix</span>
            </h3>
            <span className="text-[10px] font-mono text-emerald-300">Target</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-emerald-950/40 border border-emerald-800/50 p-4 rounded-2xl space-y-1">
              <span className="text-emerald-400 text-[10px] font-bold uppercase block">True Positives (TP)</span>
              <span className="text-2xl font-mono font-bold text-white">{improved.tp}</span>
              <p className="text-[10px] text-slate-400">Correctly identified genuine clinical & business emergencies.</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
              <span className="text-amber-400 text-[10px] font-bold uppercase block">False Positives (FP)</span>
              <span className="text-2xl font-mono font-bold text-slate-300">{improved.fp}</span>
              <p className="text-[10px] text-slate-400">Routine tickets slightly elevated.</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
              <span className="text-red-400 text-[10px] font-bold uppercase block">False Negatives (FN)</span>
              <span className="text-2xl font-mono font-bold text-slate-300">{improved.fn}</span>
              <p className="text-[10px] text-slate-400">Missed critical incidents (near 0).</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
              <span className="text-blue-400 text-[10px] font-bold uppercase block">True Negatives (TN)</span>
              <span className="text-2xl font-mono font-bold text-white">{improved.tn}</span>
              <p className="text-[10px] text-slate-400">Correctly routed non-urgent tickets to Medium/Low.</p>
            </div>
          </div>
        </div>

        {/* Baseline Rule Confusion Matrix */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 backdrop-blur shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Baseline Rule Method Confusion Matrix
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Legacy Rules</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase block">True Positives (TP)</span>
              <span className="text-2xl font-mono font-bold text-slate-300">{baseline.tp}</span>
              <p className="text-[10px] text-slate-500">Matched only explicit keywords.</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
              <span className="text-amber-500 text-[10px] font-bold uppercase block">False Positives (FP)</span>
              <span className="text-2xl font-mono font-bold text-slate-300">{baseline.fp}</span>
              <p className="text-[10px] text-slate-500">High false alarms on drills.</p>
            </div>

            <div className="bg-red-950/20 border border-red-900/40 p-4 rounded-2xl space-y-1">
              <span className="text-red-400 text-[10px] font-bold uppercase block">False Negatives (FN)</span>
              <span className="text-2xl font-mono font-bold text-red-400">{baseline.fn}</span>
              <p className="text-[10px] text-red-300 font-semibold">Missed urgent clinical failures.</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase block">True Negatives (TN)</span>
              <span className="text-2xl font-mono font-bold text-slate-300">{baseline.tn}</span>
              <p className="text-[10px] text-slate-500">Standard non-urgent requests.</p>
            </div>
          </div>
        </div>

      </div>

      {/* Error Analysis Table (Requirement 13) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl shadow-xl overflow-hidden backdrop-blur">
        <div className="p-4 border-b border-slate-800 text-xs font-bold text-white flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Error Analysis Log: Diagnostic Root Causes</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Ticket Content</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Predicted</th>
                <th className="py-3 px-4">Actual Label</th>
                <th className="py-3 px-4">Reason for Misclassification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {errorAnalysis.slice(0, 10).map((err: any) => (
                <tr key={err.ticket_id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-200">{err.ticket_id}</td>
                  <td className="py-3.5 px-4 max-w-xs text-slate-300 italic">"{err.ticket_content}"</td>
                  <td className="py-3.5 px-4 text-slate-400">{err.affected_service}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{err.predicted}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-400">{err.actual}</td>
                  <td className="py-3.5 px-4 text-[11px] text-slate-400 leading-relaxed">{err.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
