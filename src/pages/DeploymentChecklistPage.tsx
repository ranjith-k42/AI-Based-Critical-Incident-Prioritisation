import React, { useState } from 'react';
import { FileCheck, ShieldCheck, CheckCircle2, Lock, RefreshCw, Server, Database } from 'lucide-react';

interface ChecklistItem {
  id: string;
  category: 'Security' | 'Data Governance' | 'Model Operations' | 'MSP Infrastructure';
  title: string;
  description: string;
  status: 'Verified' | 'In Progress';
}

const initialItems: ChecklistItem[] = [
  { id: 'SEC-01', category: 'Security', title: 'Authentication & Session Management Enabled', description: 'Role-based access control enabled across all REST API endpoints.', status: 'Verified' },
  { id: 'SEC-02', category: 'Security', title: 'Multi-Tenant RBAC Isolation Enforcement', description: 'Customer users strictly restricted to own organisation records; external partners restricted to assigned tickets.', status: 'Verified' },
  { id: 'SEC-03', category: 'Security', title: 'Sensitive Patient PHI Minimisation', description: 'On-premise regex and named-entity anonymizer removes patient identifiers before processing.', status: 'Verified' },
  { id: 'DAT-01', category: 'Data Governance', title: 'Ticket Data Schema Validation', description: 'Mandatory operational context: affected service, user count, operating schedule, and contract level.', status: 'Verified' },
  { id: 'DAT-02', category: 'Data Governance', title: 'Immutable Audit Trail Ledger', description: 'Append-only audit table retaining original decisions, manual overrides, user identities, and timestamps.', status: 'Verified' },
  { id: 'MOD-01', category: 'Model Operations', title: 'Scoring Factor Weights & Thresholds Review', description: 'Clinical (30), Business (25), Criticality (20), Users (10), Schedule (10), Contract (5) verified with governance committee.', status: 'Verified' },
  { id: 'MOD-02', category: 'Model Operations', title: 'False Negative Real-Time Alerting', description: 'Automated monitor flagging any clinical service ticket classified below High for second-level review.', status: 'Verified' },
  { id: 'MOD-03', category: 'Model Operations', title: 'False Positive Keyword Suppressor Filter', description: 'Suppressor rules active to prevent non-critical desktop requests containing urgent keywords from triggering alarms.', status: 'Verified' },
  { id: 'OPS-01', category: 'MSP Infrastructure', title: 'Automated Database Backup Schedule', description: 'Daily SQLite snapshots and write-ahead logging enabled.', status: 'Verified' },
  { id: 'OPS-02', category: 'MSP Infrastructure', title: 'SLA Breach Warning Webhooks', description: 'Early warning triggered at 50% of SLA response target window for Platinum (7.5m), Gold (15m), and Standard (30m).', status: 'Verified' }
];

export const DeploymentChecklistPage: React.FC = () => {
  const [items, setItems] = useState<ChecklistItem[]>(initialItems);

  function toggleStatus(id: string) {
    setItems(items.map(i => i.id === id ? {
      ...i,
      status: i.status === 'Verified' ? 'In Progress' : 'Verified'
    } : i));
  }

  const verifiedCount = items.filter(i => i.status === 'Verified').length;
  const progressPercent = Math.round((verifiedCount / items.length) * 100);

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-950/60 via-slate-900 to-indigo-950/60 border border-teal-800/40 rounded-3xl p-6 shadow-xl backdrop-blur flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-teal-500/20 rounded-2xl border border-teal-500/40 text-teal-400">
            <FileCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Production Deployment & Readiness Checklist</h1>
            <p className="text-xs text-slate-400">
              Covers Security, Data Governance, AI Model Monitoring, and Operational Infrastructure.
            </p>
          </div>
        </div>

        <div className="bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 text-xs flex items-center space-x-3">
          <div>
            <span className="text-slate-400 block text-[10px]">Readiness Score</span>
            <span className="font-mono font-bold text-emerald-400 text-base">{progressPercent}%</span>
          </div>
          <div className="w-16 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      </div>

      {/* Categories */}
      {['Security', 'Data Governance', 'Model Operations', 'MSP Infrastructure'].map((category) => {
        const catItems = items.filter(i => i.category === category);
        return (
          <div key={category} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl backdrop-blur">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-800 pb-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>{category} Checklist</span>
            </h2>

            <div className="space-y-2.5">
              {catItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleStatus(item.id)}
                  className="bg-slate-950 hover:bg-slate-850 p-4 rounded-2xl border border-slate-800 flex items-start justify-between cursor-pointer transition text-xs"
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={item.status === 'Verified'}
                      onChange={() => {}}
                      className="mt-0.5 rounded bg-slate-900 border-slate-700 text-teal-500 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-200">{item.title}</span>
                        <span className="font-mono text-[10px] text-slate-500">[{item.id}]</span>
                      </div>
                      <p className="text-slate-400 mt-1 leading-relaxed text-[11px]">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border whitespace-nowrap ${
                    item.status === 'Verified'
                      ? 'bg-teal-500/10 text-teal-300 border-teal-500/30'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

    </div>
  );
};
