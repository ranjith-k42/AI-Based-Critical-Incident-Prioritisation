import React, { useState } from 'react';
import { FileCheck2, ShieldCheck, Lock, Eye, RefreshCw, UserCheck, CheckCircle2 } from 'lucide-react';

interface ChecklistItem {
  id: string;
  category: 'Data Privacy & HIPAA' | 'Security & Access Control' | 'Real-time Monitoring' | 'Model Maintenance' | 'Human Oversight';
  title: string;
  description: string;
  status: 'Completed' | 'In Progress' | 'Pending Review';
}

const initialItems: ChecklistItem[] = [
  {
    id: 'DEP-101',
    category: 'Data Privacy & HIPAA',
    title: 'PHI / PII Automated Scrubbing Pipeline',
    description: 'Ensure ticket text passes through an on-premise regex and named-entity anonymizer before reaching any external cloud NLP models.',
    status: 'Completed'
  },
  {
    id: 'DEP-102',
    category: 'Data Privacy & HIPAA',
    title: 'BAA (Business Associate Agreement) Sign-off',
    description: 'Signed HIPAA BAAs in place for all healthcare MSP tenant infrastructure and data stores.',
    status: 'Completed'
  },
  {
    id: 'DEP-201',
    category: 'Security & Access Control',
    title: 'Multi-Tenant RBAC Isolation Enforcement',
    description: 'Enforce strict row-level security (RLS) ensuring customer organization users can only access their own organization tickets.',
    status: 'Completed'
  },
  {
    id: 'DEP-202',
    category: 'Security & Access Control',
    title: 'Immutable Audit Log Tamper Resistance',
    description: 'Append-only audit trail backed by cryptographically hashed audit tables for override accountability.',
    status: 'Completed'
  },
  {
    id: 'DEP-301',
    category: 'Real-time Monitoring',
    title: 'SLA Breach Early Warning Webhooks',
    description: 'Real-time alert triggered if a Critical ticket response time approaches 50% of target limit (7 font mins).',
    status: 'Completed'
  },
  {
    id: 'DEP-302',
    category: 'Real-time Monitoring',
    title: 'AI Classification Drift & Mismatch Counter',
    description: 'Continuous dashboard monitoring track rate of manual overrides to detect model classification drift.',
    status: 'Completed'
  },
  {
    id: 'DEP-401',
    category: 'Model Maintenance',
    title: 'Quarterly Retraining & Benchmark Validation',
    description: 'Scheduled quarterly retraining on verified historical ticket logs and manual override justifications.',
    status: 'In Progress'
  },
  {
    id: 'DEP-501',
    category: 'Human Oversight',
    title: 'Clinical Escalation Committee Review',
    description: 'Weekly review of all Critical overrides by Clinical Governance Lead and IT Operations Director.',
    status: 'Completed'
  }
];

export const DeploymentChecklist: React.FC = () => {
  const [items, setItems] = useState<ChecklistItem[]>(initialItems);

  const toggleStatus = (id: string) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: item.status === 'Completed' ? 'In Progress' : 'Completed'
        };
      }
      return item;
    }));
  };

  const completedCount = items.filter(i => i.status === 'Completed').length;
  const progressPercent = Math.round((completedCount / items.length) * 100);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-950/60 via-slate-900 to-indigo-950/60 border border-teal-800/40 rounded-2xl p-5 shadow-lg backdrop-blur flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-teal-500/20 rounded-xl border border-teal-500/40 text-teal-400">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Production Deployment & Compliance Readiness Checklist</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                Production Ready
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Covers Data Privacy, HIPAA/GDPR, Security RBAC, Monitoring, Model Drift, and Human Oversight.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px]">Overall Readiness</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">{progressPercent}%</span>
          </div>
          <div className="w-20 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      </div>

      {/* Categories Grouping */}
      {['Data Privacy & HIPAA', 'Security & Access Control', 'Real-time Monitoring', 'Model Maintenance', 'Human Oversight'].map((cat) => {
        const catItems = items.filter(i => i.category === cat);
        return (
          <div key={cat} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 backdrop-blur">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-800 pb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{cat}</span>
            </h3>

            <div className="space-y-2">
              {catItems.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => toggleStatus(item.id)}
                  className="bg-slate-950 hover:bg-slate-800/40 p-3.5 rounded-xl border border-slate-800 flex items-start justify-between cursor-pointer transition text-xs"
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={item.status === 'Completed'}
                      onChange={() => {}}
                      className="mt-0.5 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
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
                    item.status === 'Completed'
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
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
