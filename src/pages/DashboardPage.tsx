import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  ShieldAlert, 
  Clock, 
  Building, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  Sparkles,
  Layers,
  History,
  FileCheck,
  Filter
} from 'lucide-react';
import { fetchDashboardAnalytics } from '../api/client';

interface DashboardPageProps {
  currentUser: any;
  onNavigate: (page: string, params?: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ currentUser, onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      const res = await fetchDashboardAnalytics();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 space-y-3 animate-pulse">
        <Activity className="w-8 h-8 text-emerald-400 mx-auto animate-spin" />
        <p className="text-sm font-medium">Aggregating 5,000 MSP Ticket Analytics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-950/40 border border-red-800/50 p-6 rounded-2xl text-red-300 text-sm">
        Failed to load dashboard: {error}
      </div>
    );
  }

  const { totalTickets, priorityCounts, baselineCounts, byOrg, byService, slaStats, overridesCount, falsePositivesCount, falseNegativesCount } = data;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-emerald-950/60 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-tr from-emerald-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-emerald-950/40">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>Executive MSP Prioritisation Dashboard</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                5,000 Live Tickets
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Multi-Organisation Incident Triage, SLA Compliance Benchmarking & Error Reduction
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('create-ticket')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/40 transition"
          >
            + Create New Incident Ticket
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Tickets */}
        <div 
          onClick={() => onNavigate('tickets')}
          className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl space-y-2 cursor-pointer transition"
        >
          <div className="flex justify-between text-xs text-slate-400">
            <span className="font-semibold">Total Tickets</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white">{totalTickets.toLocaleString()}</div>
          <p className="text-[10px] text-slate-400">Across 4 Customer Organisations</p>
        </div>

        {/* Critical Tickets */}
        <div 
          onClick={() => onNavigate('tickets', { priority: 'Critical' })}
          className="bg-red-950/30 border border-red-900/50 hover:border-red-500/60 p-4 rounded-2xl space-y-2 cursor-pointer transition"
        >
          <div className="flex justify-between text-xs text-red-300">
            <span className="font-semibold">Critical Incidents</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-red-400">{priorityCounts.Critical}</div>
          <p className="text-[10px] text-red-300">Target response &lt; 15-60 mins</p>
        </div>

        {/* High Tickets */}
        <div 
          onClick={() => onNavigate('tickets', { priority: 'High' })}
          className="bg-amber-950/30 border border-amber-900/50 hover:border-amber-500/60 p-4 rounded-2xl space-y-2 cursor-pointer transition"
        >
          <div className="flex justify-between text-xs text-amber-300">
            <span className="font-semibold">High Priority</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-amber-400">{priorityCounts.High}</div>
          <p className="text-[10px] text-amber-300">Target response &lt; 60 mins</p>
        </div>

        {/* Medium Tickets */}
        <div 
          onClick={() => onNavigate('tickets', { priority: 'Medium' })}
          className="bg-cyan-950/30 border border-cyan-900/50 hover:border-cyan-500/60 p-4 rounded-2xl space-y-2 cursor-pointer transition"
        >
          <div className="flex justify-between text-xs text-cyan-300">
            <span className="font-semibold">Medium Priority</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-cyan-400">{priorityCounts.Medium}</div>
          <p className="text-[10px] text-cyan-300">Departmental & multiple users</p>
        </div>

        {/* Low Tickets */}
        <div 
          onClick={() => onNavigate('tickets', { priority: 'Low' })}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl space-y-2 cursor-pointer transition"
        >
          <div className="flex justify-between text-xs text-slate-400">
            <span className="font-semibold">Low (Routine)</span>
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-slate-300">{priorityCounts.Low}</div>
          <p className="text-[10px] text-slate-500">Standard single user requests</p>
        </div>

      </div>

      {/* SLA Target Benchmark & Error Metrics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SLA Compliance Gauge Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>SLA Target Compliance</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Contract Benchmarked
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-400">Improved Prioritiser Compliance:</span>
                <span className="font-mono text-white text-base">{slaStats.complianceRate}%</span>
              </div>
              <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: `${slaStats.complianceRate}%` }}></div>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                <span>Met: {slaStats.metSla} incidents</span>
                <span className="text-red-400">Breached: {slaStats.breachedSla}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-400">Baseline Rule Method:</span>
                <span className="font-mono text-slate-300">{slaStats.baselineRate}%</span>
              </div>
              <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-slate-600 rounded-full" style={{ width: `${slaStats.baselineRate}%` }}></div>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Baseline missed urgent incidents due to strict keyword requirements.
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-emerald-300">
              ⚡ <strong>+{(slaStats.complianceRate - slaStats.baselineRate)}% Improvement:</strong> Prioritising genuine clinical and business disruption incidents within contract time commitments.
            </div>
          </div>
        </div>

        {/* Priority Imbalance Distribution */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span>Priority Volume Distribution</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Realistic Imbalance</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between font-mono">
                <span className="text-red-400 font-bold">Critical ({priorityCounts.Critical})</span>
                <span className="text-slate-400">{Math.round((priorityCounts.Critical / totalTickets) * 100)}%</span>
              </div>
              <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${(priorityCounts.Critical / totalTickets) * 100}%` }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-mono">
                <span className="text-amber-400 font-bold">High ({priorityCounts.High})</span>
                <span className="text-slate-400">{Math.round((priorityCounts.High / totalTickets) * 100)}%</span>
              </div>
              <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(priorityCounts.High / totalTickets) * 100}%` }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-mono">
                <span className="text-cyan-400 font-bold">Medium ({priorityCounts.Medium})</span>
                <span className="text-slate-400">{Math.round((priorityCounts.Medium / totalTickets) * 100)}%</span>
              </div>
              <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${(priorityCounts.Medium / totalTickets) * 100}%` }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-mono">
                <span className="text-slate-300 font-bold">Low ({priorityCounts.Low})</span>
                <span className="text-slate-400">{Math.round((priorityCounts.Low / totalTickets) * 100)}%</span>
              </div>
              <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-slate-500 rounded-full" style={{ width: `${(priorityCounts.Low / totalTickets) * 100}%` }}></div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 italic">
            Reflects real MSP environments where routine requests outnumber critical emergencies by ~18:1.
          </p>
        </div>

        {/* Error Reduction & Overrides */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <History className="w-4 h-4 text-purple-400" />
              <span>Governance & Error Metrics</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div 
              onClick={() => onNavigate('false-positives')}
              className="bg-slate-950 p-3 rounded-xl border border-slate-800 hover:border-amber-700/50 cursor-pointer transition space-y-1"
            >
              <span className="text-amber-400 text-[10px] font-bold block">False Positives</span>
              <span className="text-xl font-mono font-bold text-white">{falsePositivesCount}</span>
              <p className="text-[10px] text-slate-500">Routine tickets over-prioritised</p>
            </div>

            <div 
              onClick={() => onNavigate('false-negatives')}
              className="bg-slate-950 p-3 rounded-xl border border-slate-800 hover:border-red-700/50 cursor-pointer transition space-y-1"
            >
              <span className="text-red-400 text-[10px] font-bold block">False Negatives</span>
              <span className="text-xl font-mono font-bold text-white">{falseNegativesCount}</span>
              <p className="text-[10px] text-slate-500">Urgent incidents missed</p>
            </div>

            <div 
              onClick={() => onNavigate('audit-trail')}
              className="col-span-2 bg-purple-950/30 p-3 rounded-xl border border-purple-800/40 hover:border-purple-600/60 cursor-pointer transition flex items-center justify-between"
            >
              <div>
                <span className="text-purple-300 text-xs font-bold block">Auditable Manual Overrides</span>
                <span className="text-[10px] text-slate-400">Total logged override adjustments</span>
              </div>
              <span className="text-xl font-mono font-bold text-purple-300">{overridesCount}</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('performance')}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-2 border border-slate-700 transition"
          >
            <span>View Full Confusion Matrix & Accuracy</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Tickets by Organisation & Affected Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Organisation Distribution */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Building className="w-4 h-4 text-emerald-400" />
              <span>Customer Organisations & Contract SLAs</span>
            </h3>
            <button
              onClick={() => onNavigate('organisations')}
              className="text-xs text-emerald-400 hover:underline"
            >
              Manage Orgs
            </button>
          </div>

          <div className="space-y-3">
            {byOrg.map((org: any) => (
              <div 
                key={org.organisation_name}
                onClick={() => onNavigate('tickets', { organisation_id: org.organisation_name })}
                className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-200">{org.organisation_name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Contract: <span className="font-semibold text-emerald-400">{org.contract_level}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-white text-sm">{org.count.toLocaleString()} tickets</div>
                  <div className="text-[10px] text-red-400 font-mono">
                    {org.critical_count} Critical
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Affected Services Top 8 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Top Affected Services & Failure Distribution</span>
            </h3>
          </div>

          <div className="space-y-2">
            {byService.slice(0, 7).map((svc: any) => (
              <div 
                key={svc.affected_service}
                className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs"
              >
                <div>
                  <span className="font-semibold text-slate-200">{svc.affected_service}</span>
                  <span className="text-[10px] text-slate-500 ml-2 font-mono">({svc.service_category})</span>
                </div>
                <div className="flex items-center space-x-3 font-mono">
                  <span className="text-slate-400">{svc.count} total</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    svc.critical_count > 0 ? 'bg-red-950/60 text-red-400 border border-red-800/40' : 'bg-slate-900 text-slate-500'
                  }`}>
                    {svc.critical_count} Critical
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
