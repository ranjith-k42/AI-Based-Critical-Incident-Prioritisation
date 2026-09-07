import React, { useState } from 'react';
import { Ticket, PriorityLevel } from '../types';
import { evaluateBaselinePriority, evaluateImprovedPriority } from '../engine/prioritisationEngine';
import { 
  FlaskConical, 
  Play, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRightLeft, 
  ShieldAlert, 
  Zap,
  Info
} from 'lucide-react';

interface EdgeCaseLabProps {
  edgeCaseTickets: Ticket[];
  onSelectTicket: (ticket: Ticket) => void;
}

export const EdgeCaseLab: React.FC<EdgeCaseLabProps> = ({ edgeCaseTickets, onSelectTicket }) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(edgeCaseTickets[0]?.id || 'TICK-9001');
  const [customText, setCustomText] = useState<string>('');
  const [customOrgCategory, setCustomOrgCategory] = useState<'Healthcare' | 'Financial' | 'Retail'>('Healthcare');
  const [customSchedule, setCustomSchedule] = useState<'24/7 365 Days' | 'Mon-Fri 08:00-18:00'>('24/7 365 Days');

  const activeTicket = edgeCaseTickets.find(t => t.id === selectedCaseId) || edgeCaseTickets[0];

  // Custom sandbox evaluation state
  const isCustomMode = selectedCaseId === 'CUSTOM';
  
  const evaluatedCustom = isCustomMode ? (() => {
    const raw: Partial<Ticket> = {
      ticketContent: customText || 'Screen freezing in ICU',
      organisationCategory: customOrgCategory,
      operatingSchedule: customSchedule,
      affectedService: 'EHR Clinical Workstation',
      userGroup: 'ICU Staff Nurse',
      contractPriority: 'SLA Gold (24/7)',
      incidentSeverity: 'P2 - Severe'
    };
    const b = evaluateBaselinePriority(raw);
    const imp = evaluateImprovedPriority(raw);
    return { baseline: b, improved: imp };
  })() : null;

  const getPriorityTag = (p: PriorityLevel) => {
    switch (p) {
      case 'Critical': return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'High': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Medium': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'Low': return 'bg-slate-700/40 text-slate-300 border-slate-600/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-purple-950/60 border border-emerald-800/40 rounded-2xl p-5 shadow-lg backdrop-blur flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/40 text-emerald-400">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Interactive Edge & Failure Case Test Laboratory</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                Stress Test Suite
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Demonstrates how naive keyword rules generate false positives and false negatives, and how context AI fixes them.
            </p>
          </div>
        </div>
      </div>

      {/* Scenario Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {edgeCaseTickets.map((t) => {
          const isSelected = selectedCaseId === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSelectedCaseId(t.id)}
              className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 ${
                isSelected
                  ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/30'
                  : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/50 text-slate-400'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                  {t.id}
                </span>
                <span className="text-[10px] text-purple-300 font-semibold">{t.edgeCaseCategory}</span>
              </div>
              <p className="text-xs font-semibold text-slate-200 line-clamp-2">
                {t.ticketContent}
              </p>
              <div className="text-[10px] flex items-center justify-between text-slate-400 border-t border-slate-800/60 pt-1.5">
                <span>Base: <strong className="text-slate-300">{t.baselinePriority}</strong></span>
                <span className="text-emerald-400 font-bold">AI: {t.improvedPriority}</span>
              </div>
            </button>
          );
        })}

        {/* Custom Input Sandbox Card */}
        <button
          onClick={() => setSelectedCaseId('CUSTOM')}
          className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 ${
            isCustomMode
              ? 'bg-purple-950/40 border-purple-500/60 shadow-lg shadow-purple-950/30'
              : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/50 text-slate-400'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
              SANDBOX
            </span>
            <span className="text-[10px] text-emerald-300 font-semibold">Custom Test</span>
          </div>
          <p className="text-xs font-semibold text-purple-200">
            Write or paste custom ticket content to evaluate...
          </p>
          <div className="text-[10px] text-purple-400 font-medium pt-1.5 border-t border-slate-800/60">
            ⚡ Live Interactive Engine
          </div>
        </button>
      </div>

      {/* Selected Scenario Detailed Playground */}
      {!isCustomMode && activeTicket && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 gap-2">
            <div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                Category: {activeTicket.edgeCaseCategory}
              </span>
              <h3 className="text-lg font-bold text-white mt-1">{activeTicket.organisation}</h3>
            </div>
            <button
              onClick={() => onSelectTicket(activeTicket)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-2 border border-slate-700 transition"
            >
              <Info className="w-4 h-4 text-emerald-400" />
              <span>Inspect Detailed AI Risk Radar</span>
            </button>
          </div>

          {/* Ticket Text */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">Ticket Content</span>
            <p className="text-slate-100 font-medium text-sm">
              "{activeTicket.ticketContent}"
            </p>
          </div>

          {/* Side-by-Side Benchmark Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Baseline Card */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Baseline Keyword Rules
                </span>
                <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${getPriorityTag(activeTicket.baselinePriority)}`}>
                  {activeTicket.baselinePriority}
                </span>
              </div>

              <div className="text-xs text-slate-300 space-y-2">
                <p><strong className="text-slate-400">Baseline Assessment:</strong> {activeTicket.baselineExplanation}</p>
                
                {activeTicket.baselinePriority !== activeTicket.improvedPriority && (
                  <div className="bg-amber-950/40 border border-amber-800/50 p-2.5 rounded-xl text-amber-300 text-[11px] flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Failure Mode:</strong> {
                        activeTicket.edgeCaseCategory === 'Vague Clinical Wording'
                          ? 'FALSE NEGATIVE - Missed urgent clinical incident due to lack of standard keywords like "crash" or "urgent".'
                          : activeTicket.edgeCaseCategory === 'False Alarm Keyword'
                          ? 'FALSE POSITIVE - Flagged non-urgent training sandbox as Critical due to keyword "emergency".'
                          : activeTicket.edgeCaseCategory === 'Out-of-Hours Critical Service'
                          ? 'FALSE NEGATIVE - Failed to elevate out-of-hours EHR database replication failure.'
                          : 'FALSE POSITIVE - Over-prioritised VIP password reset due to contract tier.'
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Improved AI Context Card */}
            <div className="bg-gradient-to-br from-slate-950 via-slate-950 to-emerald-950/30 border border-emerald-500/40 rounded-2xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-emerald-900/40 pb-3">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Improved AI Context Model</span>
                </span>
                <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${getPriorityTag(activeTicket.improvedPriority)}`}>
                  {activeTicket.improvedPriority}
                </span>
              </div>

              <div className="text-xs text-slate-200 space-y-2">
                <p><strong className="text-emerald-400">AI Assessment:</strong> {activeTicket.improvedExplanation}</p>

                <div className="bg-emerald-950/40 border border-emerald-800/50 p-2.5 rounded-xl text-emerald-300 text-[11px] flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Why AI Succeeded:</strong> Correctly integrated operational schedule, clinical patient impact detection, and test environment suppressors to arrive at {activeTicket.improvedPriority} priority.
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Custom Interactive Sandbox Form */}
      {isCustomMode && (
        <div className="bg-slate-900/90 border border-purple-800/40 rounded-3xl p-6 shadow-2xl space-y-4">
          <h3 className="text-base font-bold text-purple-200 flex items-center space-x-2">
            <Zap className="w-5 h-5 text-purple-400" />
            <span>Live Ticket Prioritisation Sandbox</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Enter Custom Ticket Content</label>
              <textarea
                rows={3}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Type or paste any scenario (e.g., 'Infusion pump monitor screen glitching during pre-op setup')..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-purple-500/60"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Organisation Category</label>
                <select
                  value={customOrgCategory}
                  onChange={(e) => setCustomOrgCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                >
                  <option value="Healthcare">Healthcare (Hospital / Clinic)</option>
                  <option value="Financial">Financial (Banking / Trading)</option>
                  <option value="Retail">Retail (Store / E-commerce)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Operating Schedule</label>
                <select
                  value={customSchedule}
                  onChange={(e) => setCustomSchedule(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                >
                  <option value="24/7 365 Days">24/7 365 Days</option>
                  <option value="Mon-Fri 08:00-18:00">Mon-Fri 08:00-18:00</option>
                </select>
              </div>
            </div>
          </div>

          {/* Live Evaluation Output */}
          {evaluatedCustom && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between font-bold text-slate-400">
                  <span>Baseline Priority Output</span>
                  <span className={`px-2.5 py-0.5 rounded border ${getPriorityTag(evaluatedCustom.baseline.priority)}`}>
                    {evaluatedCustom.baseline.priority}
                  </span>
                </div>
                <p className="text-slate-400">{evaluatedCustom.baseline.explanation}</p>
              </div>

              <div className="bg-emerald-950/20 p-4 rounded-2xl border border-emerald-800/40 text-xs space-y-2">
                <div className="flex justify-between font-bold text-emerald-400">
                  <span>Improved AI Context Output</span>
                  <span className={`px-2.5 py-0.5 rounded border ${getPriorityTag(evaluatedCustom.improved.priority)}`}>
                    {evaluatedCustom.improved.priority}
                  </span>
                </div>
                <p className="text-slate-200">{evaluatedCustom.improved.explanation}</p>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
