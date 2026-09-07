import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  Building, 
  BrainCircuit, 
  ArrowRightLeft, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  PlusCircle,
  Sparkles
} from 'lucide-react';
import { fetchTickets } from '../api/client';

interface TicketListPageProps {
  currentUser: any;
  onNavigate: (page: string, params?: any) => void;
  initialFilters?: any;
}

export const TicketListPage: React.FC<TicketListPageProps> = ({
  currentUser,
  onNavigate,
  initialFilters = {}
}) => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedOrg, setSelectedOrg] = useState(initialFilters.organisation_id || 'All');
  const [selectedPriority, setSelectedPriority] = useState(initialFilters.priority || 'All');
  const [selectedService, setSelectedService] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [edgeOnly, setEdgeOnly] = useState(false);

  useEffect(() => {
    loadTickets();
  }, [page, selectedOrg, selectedPriority, selectedService, selectedStatus, edgeOnly]);

  async function loadTickets() {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        page,
        limit: 20,
        organisation_id: selectedOrg,
        priority: selectedPriority,
        service: selectedService,
        status: selectedStatus,
        search,
        userRole: currentUser?.role,
        userOrgId: currentUser?.organisation_id,
        edgeOnly
      };

      const res = await fetchTickets(params);
      setTickets(res.tickets || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    loadTickets();
  }

  const getPriorityBadgeStyle = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-500/15 text-red-400 border-red-500/40 shadow-sm shadow-red-950';
      case 'High':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
      case 'Medium':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40';
      case 'Low':
        return 'bg-slate-700/40 text-slate-300 border-slate-600/50';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  const getSlaLimit = (contract: string) => {
    if (contract === 'Platinum') return 15;
    if (contract === 'Gold') return 30;
    return 60;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      
      {/* Top Header & Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span>MSP Service Ticket Queue</span>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {total.toLocaleString()} Matching
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Scoping: {currentUser?.role === 'Customer Organisation User' 
                ? `Restricted to ${currentUser?.organisation_name}` 
                : 'Global Multi-Organisation View'}
            </p>
          </div>

          <button
            onClick={() => onNavigate('create-ticket')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Ticket</span>
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by ID, keyword, service, or user group..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-slate-200 focus:outline-none focus:border-emerald-500/60"
            />
          </form>

          {/* Org Filter (disabled if customer user) */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center space-x-2">
            <Building className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedOrg}
              onChange={(e) => { setSelectedOrg(e.target.value); setPage(1); }}
              disabled={currentUser?.role === 'Customer Organisation User'}
              className="w-full bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900">All Organisations</option>
              <option value="CityCare Hospital" className="bg-slate-900">CityCare Hospital (Platinum)</option>
              <option value="Metro Health Clinic" className="bg-slate-900">Metro Health Clinic (Gold)</option>
              <option value="MedTech Partner Services" className="bg-slate-900">MedTech Partner (Gold)</option>
              <option value="Retail Business Services" className="bg-slate-900">Retail Business (Standard)</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedPriority}
              onChange={(e) => { setSelectedPriority(e.target.value); setPage(1); }}
              className="w-full bg-transparent text-slate-200 focus:outline-none cursor-pointer"
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
              checked={edgeOnly}
              onChange={(e) => { setEdgeOnly(e.target.checked); setPage(1); }}
              className="rounded bg-slate-900 border-purple-700 text-purple-600 focus:ring-purple-500 cursor-pointer"
            />
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-purple-300 font-medium">Edge Cases Only</span>
          </label>

        </div>
      </div>

      {/* Ticket Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl shadow-xl overflow-hidden backdrop-blur">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Ticket & Org</th>
                <th className="py-3 px-4">Content & Service</th>
                <th className="py-3 px-4 text-center">Baseline vs Improved</th>
                <th className="py-3 px-4">SLA Target Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    Loading records from SQLite database...
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-500">
                    No tickets found matching current filters.
                  </td>
                </tr>
              ) : (
                tickets.map((t) => {
                  const targetMins = getSlaLimit(t.contract_level);
                  const isBreach = t.response_time_minutes > targetMins;

                  return (
                    <tr key={t.ticket_id} className="hover:bg-slate-800/40 transition group">
                      
                      {/* Ticket & Org */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-center space-x-2">
                          <span 
                            onClick={() => onNavigate('ticket-detail', { id: t.ticket_id })}
                            className="font-mono font-bold text-slate-100 group-hover:text-emerald-400 cursor-pointer transition"
                          >
                            {t.ticket_id}
                          </span>
                          {t.is_edge_case === 1 && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono">
                              Edge Case
                            </span>
                          )}
                        </div>
                        <div className="text-slate-400 font-medium text-[11px] mt-0.5 flex items-center space-x-1">
                          <Building className="w-3 h-3 text-slate-500" />
                          <span>{t.organisation_name}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {t.contract_level}
                        </span>
                      </td>

                      {/* Content & Service */}
                      <td className="py-3.5 px-4 align-top max-w-sm">
                        <p className="line-clamp-2 text-slate-200 font-medium text-xs">
                          {t.ticket_content}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-950/60 text-indigo-300 border border-indigo-800/50">
                            {t.affected_service}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                            Users: {t.number_of_affected_users} ({t.user_group})
                          </span>
                        </div>
                      </td>

                      {/* Baseline vs Improved Priority */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex flex-col items-center space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${getPriorityBadgeStyle(t.baseline_priority)}`}>
                              {t.baseline_priority}
                            </span>
                            <ArrowRightLeft className="w-3 h-3 text-slate-600" />
                            <span className={`px-2 py-0.5 rounded border text-[11px] font-bold ${getPriorityBadgeStyle(t.improved_priority)}`}>
                              {t.improved_priority}
                            </span>
                          </div>

                          {t.is_overridden === 1 && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800 font-mono">
                              Overridden: {t.final_priority}
                            </span>
                          )}

                          <span className="text-[10px] font-mono text-slate-500">
                            Score: {t.total_impact_score}/100
                          </span>
                        </div>
                      </td>

                      {/* SLA Target Time */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-1 font-mono font-medium text-slate-200">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{t.response_time_minutes} mins</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Target: {targetMins} mins
                          </div>
                          {isBreach ? (
                            <span className="text-[10px] text-red-400 inline-flex items-center">
                              <AlertTriangle className="w-3 h-3 mr-1" /> Breached
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-400 inline-flex items-center">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> On Target
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 align-top">
                        <span className="font-semibold text-slate-200 text-xs block">
                          {t.incident_status}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(t.created_date_time).toLocaleDateString()}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 align-top text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => onNavigate('ticket-detail', { id: t.ticket_id })}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            title="View Workflow & Detail"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onNavigate('evidence', { id: t.ticket_id })}
                            className="px-2 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/50 text-[11px] font-semibold transition"
                            title="Priority Evidence Breakdown"
                          >
                            Evidence
                          </button>

                          {(currentUser?.role === 'MSP Administrator' || currentUser?.role === 'MSP Support Analyst') && (
                            <button
                              onClick={() => onNavigate('override', { id: t.ticket_id })}
                              className="px-2 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-800/50 text-[11px] font-semibold transition"
                              title="Manual Override"
                            >
                              Override
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing Page <span className="font-mono font-bold text-slate-200">{page}</span> of{' '}
            <span className="font-mono font-bold text-slate-200">{totalPages}</span> ({total.toLocaleString()} records)
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
