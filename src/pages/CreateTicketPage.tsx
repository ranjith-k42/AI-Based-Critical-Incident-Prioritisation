import React, { useState } from 'react';
import { PlusCircle, Sparkles, Building, Activity, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { createTicket } from '../api/client';

interface CreateTicketPageProps {
  currentUser: any;
  onNavigate: (page: string, params?: any) => void;
}

export const CreateTicketPage: React.FC<CreateTicketPageProps> = ({ currentUser, onNavigate }) => {
  const [organisationId, setOrganisationId] = useState(currentUser?.organisation_id !== 'MSP-INTERNAL' ? currentUser?.organisation_id : 'ORG-01');
  const [affectedService, setAffectedService] = useState('Electronic Health Record');
  const [serviceCategory, setServiceCategory] = useState('Clinical Core');
  const [userGroup, setUserGroup] = useState('Emergency Clinical Staff');
  const [numberOfUsers, setNumberOfUsers] = useState(85);
  const [duringHours, setDuringHours] = useState(true);
  const [escalationRequested, setEscalationRequested] = useState(true);
  const [ticketContent, setTicketContent] = useState('Electronic health record system unavailable in emergency department. Clinical staff unable to view patient charts or order medication.');
  const [submitting, setSubmitting] = useState(false);
  const [createdResult, setCreatedResult] = useState<any>(null);

  const presetScenarios = [
    {
      title: 'Emergency Clinical Outage',
      org: 'ORG-01',
      service: 'Electronic Health Record',
      category: 'Clinical Core',
      userGroup: 'Emergency Clinical Staff',
      users: 120,
      content: 'Emergency department unavailable for triage and patient admission. Electronic Health Record charts failing to load across all acute care terminals.'
    },
    {
      title: 'Routine Password Reset',
      org: 'ORG-04',
      service: 'Authentication Service',
      category: 'Identity & Access',
      userGroup: 'Administrative Staff',
      users: 1,
      content: 'User requested password reset for email and desktop workstation after return from annual leave.'
    },
    {
      title: 'Payment Gateway Outage',
      org: 'ORG-04',
      service: 'Payment System',
      category: 'Financial Business',
      userGroup: 'Customers',
      users: 250,
      content: 'Payment system complete outage across POS terminals. Customers unable to complete credit card checkout across all store branches.'
    }
  ];

  function applyPreset(p: typeof presetScenarios[0]) {
    setOrganisationId(p.org);
    setAffectedService(p.service);
    setServiceCategory(p.category);
    setUserGroup(p.userGroup);
    setNumberOfUsers(p.users);
    setTicketContent(p.content);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await createTicket({
        organisation_id: organisationId,
        affected_service: affectedService,
        service_category: serviceCategory,
        user_group: userGroup,
        number_of_affected_users: numberOfUsers,
        submitted_during_operating_hours: duringHours,
        escalation_requested: escalationRequested,
        ticket_content: ticketContent
      });
      setCreatedResult(res);
    } catch (err: any) {
      alert(err.message || 'Error creating ticket');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('tickets')}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Ticket Queue</span>
        </button>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur space-y-6">
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 bg-gradient-to-tr from-emerald-600 to-indigo-600 rounded-xl text-white">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Submit Incident Ticket for Automated Triage</h2>
            <p className="text-xs text-slate-400">
              Evaluated simultaneously by Baseline Rules and the Improved Clinical & Business Impact Engine.
            </p>
          </div>
        </div>

        {/* Preset Quick Fill Buttons */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Quick Test Scenarios:</span>
          <div className="flex flex-wrap gap-2">
            {presetScenarios.map((p) => (
              <button
                key={p.title}
                type="button"
                onClick={() => applyPreset(p)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition"
              >
                ⚡ {p.title}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Customer Organisation</label>
              <select
                value={organisationId}
                onChange={(e) => setOrganisationId(e.target.value)}
                disabled={currentUser?.role === 'Customer Organisation User'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
              >
                <option value="ORG-01">CityCare Hospital (Platinum - 15m SLA, 24/7)</option>
                <option value="ORG-02">Metro Health Clinic (Gold - 30m SLA, Extended)</option>
                <option value="ORG-03">MedTech Partner Services (Gold - 30m SLA, 24/7)</option>
                <option value="ORG-04">Retail Business Services (Standard - 60m SLA, Business)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Affected Service</label>
              <select
                value={affectedService}
                onChange={(e) => setAffectedService(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
              >
                <option value="Electronic Health Record">Electronic Health Record</option>
                <option value="Emergency Department System">Emergency Department System</option>
                <option value="Medication Management">Medication Management</option>
                <option value="Patient Portal">Patient Portal</option>
                <option value="Appointment System">Appointment System</option>
                <option value="Payment System">Payment System</option>
                <option value="Authentication Service">Authentication Service</option>
                <option value="Network">Network</option>
                <option value="Payroll">Payroll</option>
                <option value="Printing">Printing</option>
                <option value="Email">Email</option>
                <option value="Other">Other Desktop / General</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Ticket Description & Impact Details <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={4}
              value={ticketContent}
              onChange={(e) => setTicketContent(e.target.value)}
              placeholder="Describe the failure, clinical impact, or business disruption..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-emerald-500/60 leading-relaxed"
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">User Group Impacted</label>
              <select
                value={userGroup}
                onChange={(e) => setUserGroup(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
              >
                <option value="Emergency Clinical Staff">Emergency Clinical Staff</option>
                <option value="Doctors">Doctors</option>
                <option value="Nurses">Nurses</option>
                <option value="Administrative Staff">Administrative Staff</option>
                <option value="IT Support">IT Support</option>
                <option value="Customers">Customers</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Number of Affected Users</label>
              <input
                type="number"
                min="1"
                max="5000"
                value={numberOfUsers}
                onChange={(e) => setNumberOfUsers(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Operating Time Context</label>
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="duringHours"
                  checked={duringHours}
                  onChange={(e) => setDuringHours(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-emerald-500"
                />
                <label htmlFor="duringHours" className="text-slate-300 text-xs cursor-pointer">
                  During Active Hours
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/40 flex items-center space-x-2 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>{submitting ? 'Prioritising...' : 'Ingest & Evaluate Ticket'}</span>
            </button>
          </div>

        </form>

        {/* Live Result Preview */}
        {createdResult && (
          <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-5 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-white">Ticket Created & Triaged Successfully!</span>
              </div>
              <span className="font-mono text-xs text-slate-400">{createdResult.ticket_id}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 uppercase block text-[10px] font-mono">Baseline Priority</span>
                <span className="font-bold text-slate-200 text-sm">{createdResult.baseline_priority}</span>
                <p className="text-[11px] text-slate-400">{createdResult.baseline_explanation}</p>
              </div>

              <div className="bg-emerald-950/30 p-3 rounded-xl border border-emerald-800/50 space-y-1">
                <span className="text-emerald-400 uppercase block text-[10px] font-mono">Improved AI Priority</span>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-emerald-300 text-sm">{createdResult.improved_priority}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700">
                    Score: {createdResult.total_impact_score}/100
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">{createdResult.improved_explanation}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => onNavigate('evidence', { id: createdResult.ticket_id })}
                className="px-4 py-1.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-200 border border-emerald-700/60 text-xs font-semibold"
              >
                Inspect Evidence Panel
              </button>
              <button
                onClick={() => onNavigate('ticket-detail', { id: createdResult.ticket_id })}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                View Ticket Workflow
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
