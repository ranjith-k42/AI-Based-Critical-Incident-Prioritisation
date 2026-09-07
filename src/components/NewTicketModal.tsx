import React, { useState } from 'react';
import { Ticket, ContractPriority, OperatingSchedule } from '../types';
import { evaluateBaselinePriority, evaluateImprovedPriority } from '../engine/prioritisationEngine';
import { X, PlusCircle, Sparkles, Building, Activity } from 'lucide-react';

interface NewTicketModalProps {
  onClose: () => void;
  onAddTicket: (ticket: Ticket) => void;
}

export const NewTicketModal: React.FC<NewTicketModalProps> = ({ onClose, onAddTicket }) => {
  const [organisation, setOrganisation] = useState('St. Jude Regional Health');
  const [organisationCategory, setOrganisationCategory] = useState<'Healthcare' | 'Financial' | 'Retail'>('Healthcare');
  const [contractPriority, setContractPriority] = useState<ContractPriority>('SLA Gold (24/7)');
  const [ticketContent, setTicketContent] = useState('');
  const [affectedService, setAffectedService] = useState('EHR Infusion & Patient Monitoring');
  const [userGroup, setUserGroup] = useState('ED & ICU Staff Nurses');
  const [operatingSchedule, setOperatingSchedule] = useState<OperatingSchedule>('24/7 365 Days');
  const [incidentSeverity, setIncidentSeverity] = useState<'P1 - Emergency' | 'P2 - Severe' | 'P3 - Moderate' | 'P4 - Minor'>('P2 - Severe');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketContent.trim()) return;

    const id = `TICK-${Math.floor(1000 + Math.random() * 9000)}`;
    const isClinicalService = organisationCategory === 'Healthcare' || affectedService.toLowerCase().includes('ehr') || affectedService.toLowerCase().includes('infusion');
    const isCriticalUserGroup = userGroup.toLowerCase().includes('icu') || userGroup.toLowerCase().includes('doctor') || userGroup.toLowerCase().includes('trader');

    const rawTicket: Partial<Ticket> = {
      id,
      organisation,
      organisationCategory,
      contractPriority,
      ticketContent: ticketContent.trim(),
      affectedService,
      isClinicalService,
      userGroup,
      isCriticalUserGroup,
      operatingSchedule,
      incidentSeverity,
      escalationOutcome: 'Escalated to L3',
      responseTimeMins: Math.floor(5 + Math.random() * 20),
      resolutionStatus: 'Open',
      timestamp: new Date().toISOString()
    };

    const baseline = evaluateBaselinePriority(rawTicket);
    const improved = evaluateImprovedPriority(rawTicket);

    const newTicket: Ticket = {
      ...rawTicket as Ticket,
      baselinePriority: baseline.priority,
      baselineExplanation: baseline.explanation,
      improvedPriority: improved.priority,
      improvedExplanation: improved.explanation,
      clinicalSafetyScore: improved.clinicalSafetyScore,
      businessDisruptionScore: improved.businessDisruptionScore,
      operationalUrgencyScore: improved.operationalUrgencyScore,
      compositeScore: improved.compositeScore,
      signalsDetected: improved.signalsDetected,
      finalPriority: improved.priority,
      isOverridden: false,
      overrideHistory: []
    };

    onAddTicket(newTicket);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Submit New Service Ticket</h3>
              <p className="text-xs text-slate-400">Real-Time AI Clinical & Business Risk Ingestion</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Organisation</label>
              <input
                type="text"
                value={organisation}
                onChange={(e) => setOrganisation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Sector Category</label>
              <select
                value={organisationCategory}
                onChange={(e) => setOrganisationCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
              >
                <option value="Healthcare">Healthcare</option>
                <option value="Financial">Financial</option>
                <option value="Retail">Retail</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Ticket Description & Impact Details <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Describe the issue (e.g. 'Station 3 tablet screens freezing during medication administration')..."
              value={ticketContent}
              onChange={(e) => setTicketContent(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-emerald-500/60"
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Affected Service</label>
              <input
                type="text"
                value={affectedService}
                onChange={(e) => setAffectedService(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Impacted User Group</label>
              <input
                type="text"
                value={userGroup}
                onChange={(e) => setUserGroup(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Contract SLA Priority</label>
              <select
                value={contractPriority}
                onChange={(e) => setContractPriority(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
              >
                <option value="SLA Gold (24/7)">SLA Gold (24/7)</option>
                <option value="SLA Silver (12/5)">SLA Silver (12/5)</option>
                <option value="SLA Bronze (Standard)">SLA Bronze (Standard)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Operating Schedule</label>
              <select
                value={operatingSchedule}
                onChange={(e) => setOperatingSchedule(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
              >
                <option value="24/7 365 Days">24/7 365 Days</option>
                <option value="Mon-Fri 08:00-18:00">Mon-Fri 08:00-18:00</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold flex items-center space-x-1.5 shadow-lg shadow-emerald-950/40"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ingest & Prioritise</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
