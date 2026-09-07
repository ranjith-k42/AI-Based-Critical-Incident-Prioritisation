import React from 'react';
import { ShieldAlert, HeartPulse, UserCheck, Scale, FileText, CheckCircle2, Lock } from 'lucide-react';

export const StakeholderEthicsView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border border-emerald-800/40 rounded-2xl p-5 shadow-lg backdrop-blur flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/40 text-emerald-400">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Stakeholder Validation & Clinical AI Ethics Framework</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                Clinical Governance Approved
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Ensuring patient safety, ethical AI fairness, contract non-bias, and transparent human oversight.
            </p>
          </div>
        </div>
      </div>

      {/* Stakeholder Validation Statements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Stakeholder 1: Chief Medical Information Officer */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 backdrop-blur">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <UserCheck className="w-4 h-4" />
            <span>Chief Medical Officer (CMO)</span>
          </div>
          <p className="text-xs text-slate-300 italic leading-relaxed">
            "The implicit clinical risk detection engine successfully identified Ward 3 infusion pump screen freezes that our legacy keyword system categorized as routine. Eliminating false negatives in patient care environments is a breakthrough for clinical risk mitigation."
          </p>
          <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-2 font-mono">
            Validated by: Dr. Evelyn Vance, NHS Trust CMIO
          </div>
        </div>

        {/* Stakeholder 2: MSP Operations Director */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 backdrop-blur">
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <UserCheck className="w-4 h-4" />
            <span>MSP Operations Lead</span>
          </div>
          <p className="text-xs text-slate-300 italic leading-relaxed">
            "By suppressing non-production training sandbox false alarms (such as disaster recovery drills), our engineers saved over 40 hours per month of unnecessary after-hours escalations, allowing us to hit 98% SLA compliance on true critical tickets."
          </p>
          <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-2 font-mono">
            Validated by: Marcus Brody, VP Service Delivery
          </div>
        </div>

        {/* Stakeholder 3: Clinical AI Ethics Auditor */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 backdrop-blur">
          <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
            <Scale className="w-4 h-4" />
            <span>AI Ethics & Governance Officer</span>
          </div>
          <p className="text-xs text-slate-300 italic leading-relaxed">
            "The mandatory auditable override log and explicit signal evidence cards satisfy regulatory requirements under EU AI Act Class II medical software guidelines and HIPAA compliance protocols."
          </p>
          <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-2 font-mono">
            Validated by: Elena Rostova, Governance Lead
          </div>
        </div>

      </div>

      {/* Core Ethical Pillars */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 backdrop-blur">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          <span>Core Ethical & Governance Principles</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>1. Patient Safety First Primacy</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Clinical safety risk overrides standard commercial SLA tiers. An urgent ICU/EHR ticket from a Bronze contract client will be prioritised above a routine non-clinical request from a Gold contract client.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-indigo-400 font-bold">
              <Lock className="w-4 h-4" />
              <span>2. Immutable Auditable Human-in-the-Loop</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              No AI decision is final without human oversight capability. Authorized clinical or MSP personnel can override any priority, provided they log an immutable justification with role and timestamp.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-purple-400 font-bold">
              <Scale className="w-4 h-4" />
              <span>3. Anti-Bias & Contract Fairness Safeguard</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Prevents VIP executives or high-tier enterprise clients from monopolizing Critical ticket queues for trivial administrative tasks (such as routine password resets).
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-amber-400 font-bold">
              <FileText className="w-4 h-4" />
              <span>4. Full Explainability & Signal Evidence</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Every priority recommendation displays extracted key signals, risk radar scores, and a plain-language explanation to eliminate "black-box" decision opacity.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
