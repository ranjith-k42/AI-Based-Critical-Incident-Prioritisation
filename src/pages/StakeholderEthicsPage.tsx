import React from 'react';
import { HeartPulse, ShieldAlert, Scale, UserCheck, CheckCircle2, Lock, FileText } from 'lucide-react';

export const StakeholderEthicsPage: React.FC = () => {
  const stakeholderValidations = [
    {
      stakeholder: 'MSP Support Analyst',
      scenario: 'High-Impact Clinical Incident Detection',
      feedback: 'The evidence-based priority explanation helps me understand why a ticket is marked Critical, allowing immediate emergency dispatch.',
      issue: 'Initial keyword scanner misclassified Ward 3 medication sync issues as low priority.',
      improvement: 'Incorporated multi-factor clinical service category and user group weighting into the improved model.'
    },
    {
      stakeholder: 'Customer User (CityCare Hospital)',
      scenario: 'Multi-Tenant Queue Tracking',
      feedback: 'Important incidents are easier to identify and track without being drowned out by routine desktop requests.',
      issue: 'Hospital clinical team lacked visibility into whether their tickets met 15-minute SLA targets.',
      improvement: 'Added live SLA target countdown and contract compliance tracking on dashboard.'
    },
    {
      stakeholder: 'External Partner (MedTech Partner Services)',
      scenario: 'Scoped Access to Escalated Tickets',
      feedback: 'I can access only tickets assigned to my organisation and update technical work notes cleanly.',
      issue: 'External vendors previously had either complete visibility or zero visibility.',
      improvement: 'Implemented strict role-based row-level filtering isolating partner tickets.'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-emerald-950/60 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-tr from-emerald-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-emerald-950/40">
            <HeartPulse className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Stakeholder Validation & Clinical AI Ethics</h1>
            <p className="text-xs text-slate-400">
              Human-in-the-loop safeguards, non-bias contract protections, and clinical governance validation.
            </p>
          </div>
        </div>
      </div>

      {/* Stakeholder Validation Table (Section 19) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <span>Stakeholder Validation Statements</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stakeholderValidations.map((s, idx) => (
            <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs flex flex-col justify-between">
              <div>
                <span className="text-emerald-400 font-bold block">{s.stakeholder}</span>
                <span className="text-[10px] text-slate-500 font-mono">Scenario: {s.scenario}</span>
                <p className="text-slate-300 italic mt-2 leading-relaxed">
                  "{s.feedback}"
                </p>
              </div>

              <div className="border-t border-slate-800 pt-2 space-y-1 text-[11px]">
                <div className="text-amber-400 font-semibold">Identified: <span className="text-slate-400 font-normal">{s.issue}</span></div>
                <div className="text-emerald-400 font-semibold">Improved: <span className="text-slate-300 font-normal">{s.improvement}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ethics & Safety Principles (Section 20) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <Scale className="w-4 h-4 text-indigo-400" />
          <span>Ethics & AI Safety Framework</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>1. Human-in-the-Loop Decision Support</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              The prioritisation system supports human decision-making and does not replace human clinical triage. Automated prioritisation can make errors, which is why manual override is mandatory for exceptional situations.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-blue-400 font-bold">
              <Lock className="w-4 h-4" />
              <span>2. Strict Data Minimisation & HIPAA Compliance</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Patient or sensitive information must not be unnecessarily stored in ticket headers. All synthetic data used during development mimics real-world scenarios while preserving patient privacy.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-purple-400 font-bold">
              <Scale className="w-4 h-4" />
              <span>3. Anti-Bias & Contract Fairness Safeguards</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              High-contract tiers cannot starve clinical emergencies from standard tiers. A patient-facing medication failure from a Standard client is elevated over a routine VIP desktop question from a Platinum client.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-amber-400 font-bold">
              <FileText className="w-4 h-4" />
              <span>4. Explainability & Transparent Evidence</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Every High and Critical priority decision generates an evidence panel itemizing the exact factors, score breakdowns, and keyword signals to eliminate black-box decision opacity.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
