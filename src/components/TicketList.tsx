import React, { useState } from 'react';
import { Ticket, UserRole, PriorityLevel } from '../types';
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Building, 
  BrainCircuit, 
  ShieldAlert,
  ArrowRightLeft,
  Sparkles,
  HelpCircle,
  Eye
} from 'lucide-react';
import { calculateTargetSLA } from '../engine/prioritisationEngine';

interface TicketListProps {
  tickets: Ticket[];
  activeRole: UserRole;
  onSelectTicket: (ticket: Ticket) => void;
  onOpenOverrideModal: (ticket: Ticket) => void;
}

export const TicketList: React.FC<TicketListProps> = ({
  tickets,
  activeRole,
  onSelectTicket,
  onOpenOverrideModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [onlyEdgeCases, setOnlyEdgeCases] = useState<boolean>(false);

  // Filter tickets according to active Role scope
  const scopedTickets = tickets.filter(ticket => {
    if (activeRole === 'Customer Org Manager (Healthcare)') {
      return ticket.organisationCategory === 'Healthcare';
    }
    if (activeRole === 'Customer Org Manager (Financial)') {
      return ticket.organisationCategory === 'Financial';
    }
    if (activeRole === 'External Partner / Vendor L3') {
      return ticket.escalationOutcome.includes('L3') || ticket.escalationOutcome.includes('Vendor');
    }
    return true; // MSP Admin sees all
  });

  const filteredTickets = scopedTickets.filter(ticket => {
    const matchesSearch = 
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticketContent.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.affectedService.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.userGroup.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesOrg = selectedOrg === 'All' || ticket.organisation === selectedOrg;
    const matchesPriority = selectedPriority === 'All' || ticket.finalPriority === selectedPriority;
    const matchesEdge = !onlyEdgeCases || ticket.isEdgeCase;

    return matchesSearch && matchesOrg && matchesPriority && matchesEdge;
  });

  const organisations = Array.from(new Set(scopedTickets.map(t => t.organisation)));

  const getPriorityBadgeStyle = (priority: PriorityLevel) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-500/15 text-red-400 border-red-500/40 shadow-sm shadow-red-950 animate-pulse';
      case 'High':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
      case 'Medium':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40';
      case 'Low':
        return 'bg-slate-700/40 text-slate-300 border-slate-600/50';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search tickets by ID, clinical term, service, or user group..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/60 placeholder-slate-500 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Org Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="bg-transparent text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900">All Organisations</option>
              {organisations.map(org => (
                <option key={org} value={org} className="bg-slate-900">{org}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-transparent text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900">All Priorities</option>
              <option value="Critical" className="bg-slate-900 text-red-400">Critical</option>
              <option value="High" className="bg-slate-900 text-amber-400">High</option>
              <option value="Medium" className="bg-slate-900 text-cyan-400">Medium</option>
              <option value="Low" className="bg-slate-900 text-slate-400">Low</option>
            </select>
          </div>

          {/* Edge Cases Toggle */}
          <label className="flex items-center space-x-2 bg-purple-950/30 border border-purple-800/40 px-3 py-2 rounded-xl cursor-pointer hover:bg-purple-900/40 transition">
            <input
              type="checkbox"
              checked={onlyEdgeCases}
              onChange={(e) => setOnlyEdgeCases(e.target.checked)}
              className="rounded bg-slate-900 border-purple-700 text-purple-600 focus:ring-purple-500"
            />
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs text-purple-300 font-medium whitespace-nowrap">Edge Cases Only</span>
          </label>
        </div>
      </div>

      {/* Ticket Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Ticket & Org</th>
                <th className="py-3.5 px-4">Content & Service</th>
                <th className="py-3.5 px-4 text-center">Baseline vs Improved</th>
                <th className="py-3.5 px-4">SLA Response Target</th>
                <th className="py-3.5 px-4">Status & Escalation</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No tickets found matching your search and role scope.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => {
                  const targetMins = calculateTargetSLA(ticket.finalPriority);
                  const isSlaBreached = ticket.responseTimeMins > targetMins;
                  const isBaselineMismatch = ticket.baselinePriority !== ticket.improvedPriority;

                  return (
                    <tr 
                      key={ticket.id}
                      className="hover:bg-slate-800/40 transition group"
                    >
                      {/* Ticket & Org */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-slate-100 group-hover:text-emerald-400 transition">
                            {ticket.id}
                          </span>
                          {ticket.isEdgeCase && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono">
                              Edge Case
                            </span>
                          )}
                        </div>
                        <div className="text-slate-400 font-medium mt-1 flex items-center space-x-1">
                          <Building className="w-3 h-3 text-slate-500" />
                          <span>{ticket.organisation}</span>
                        </div>
                        <div className="mt-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                            {ticket.contractPriority}
                          </span>
                        </div>
                      </td>

                      {/* Content & Service */}
                      <td className="py-3.5 px-4 align-top max-w-sm">
                        <p className="line-clamp-2 text-slate-200 font-medium">
                          {ticket.ticketContent}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-950/60 text-indigo-300 border border-indigo-800/50">
                            Svc: {ticket.affectedService}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                            User: {ticket.userGroup}
                          </span>
                        </div>
                      </td>

                      {/* Baseline vs Improved Side-by-Side */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex flex-col items-center justify-center space-y-1.5">
                          <div className="flex items-center space-x-2">
                            {/* Baseline Tag */}
                            <div className="flex flex-col items-center">
                              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">Baseline</span>
                              <span className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${getPriorityBadgeStyle(ticket.baselinePriority)}`}>
                                {ticket.baselinePriority}
                              </span>
                            </div>

                            <ArrowRightLeft className="w-3.5 h-3.5 text-slate-600 mt-3" />

                            {/* Improved Tag */}
                            <div className="flex flex-col items-center">
                              <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-mono flex items-center space-x-0.5">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>AI Context</span>
                              </span>
                              <span className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${getPriorityBadgeStyle(ticket.improvedPriority)}`}>
                                {ticket.improvedPriority}
                              </span>
                            </div>
                          </div>

                          {/* Override indicator if applicable */}
                          {ticket.isOverridden && (
                            <span className="px-2 py-0.5 rounded bg-purple-900/50 text-purple-300 border border-purple-700 text-[10px] font-mono">
                              Overridden to: {ticket.finalPriority}
                            </span>
                          )}

                          {isBaselineMismatch && (
                            <span className="text-[10px] text-amber-400/90 font-medium">
                              ⚠️ Classification Shift
                            </span>
                          )}
                        </div>
                      </td>

                      {/* SLA Response Target */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-mono font-medium text-slate-200">
                              {ticket.responseTimeMins} mins
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Target: <span className="font-mono text-slate-300">{targetMins} mins</span>
                          </div>
                          <div>
                            {isSlaBreached ? (
                              <span className="inline-flex items-center text-[10px] text-red-400 bg-red-950/40 border border-red-800/40 px-1.5 py-0.5 rounded">
                                <AlertTriangle className="w-3 h-3 mr-1" /> Breach
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-1.5 py-0.5 rounded">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> On Target
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status & Escalation */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex flex-col space-y-1">
                          <span className="font-semibold text-slate-200">
                            {ticket.resolutionStatus}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {ticket.escalationOutcome}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(ticket.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 align-top text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => onSelectTicket(ticket)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium flex items-center space-x-1 border border-slate-700 transition"
                            title="View AI Evidence & Risk Radar"
                          >
                            <BrainCircuit className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Evidence</span>
                          </button>

                          <button
                            onClick={() => onOpenOverrideModal(ticket)}
                            className="px-2 py-1.5 rounded-lg bg-purple-950/50 hover:bg-purple-900/60 text-purple-300 border border-purple-800/50 text-xs font-medium flex items-center space-x-1 transition"
                            title="Manual Priority Override"
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                            <span>Override</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
