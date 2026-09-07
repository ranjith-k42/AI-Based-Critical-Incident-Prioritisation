import React, { useState, useEffect } from 'react';
import { History, Lock, Search, Filter, Calendar, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';
import { fetchAuditLogs } from '../api/client';

export const AuditTrailPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  useEffect(() => {
    loadAuditLogs();
  }, [roleFilter]);

  async function loadAuditLogs() {
    try {
      setLoading(true);
      const res = await fetchAuditLogs({ search, userRole: roleFilter });
      setLogs(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    loadAuditLogs();
  }

  const getPriorityStyle = (p: string) => {
    switch (p) {
      case 'Critical': return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'High': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Medium': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      default: return 'bg-slate-700/40 text-slate-300 border-slate-600/50';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-800/40 rounded-3xl p-6 shadow-xl backdrop-blur flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-purple-500/20 rounded-2xl border border-purple-500/40 text-purple-300">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>Auditable Decision Trail & Governance Ledger</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Immutable
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Permanent record of all manual priority modifications, authorized roles, timestamps, and justifications.
            </p>
          </div>
        </div>

        <div className="bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 text-xs">
          <span className="text-slate-400 block text-[10px]">Total Logged Actions</span>
          <span className="font-mono font-bold text-purple-300 text-sm">{logs.length} Entries</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search audit trail by ticket ID, user name, organization, or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-slate-200 focus:outline-none focus:border-purple-500/60"
          />
        </form>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <UserCheck className="w-4 h-4 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="All" className="bg-slate-900">All User Roles</option>
            <option value="MSP Administrator" className="bg-slate-900">MSP Administrator</option>
            <option value="MSP Support Analyst" className="bg-slate-900">MSP Support Analyst</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl shadow-xl overflow-hidden backdrop-blur">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Audit ID & Time</th>
                <th className="py-3 px-4">Ticket & Organisation</th>
                <th className="py-3 px-4">Authorised User</th>
                <th className="py-3 px-4">Priority Shift</th>
                <th className="py-3 px-4">Audited Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400">
                    Loading audit trail from SQLite...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-500">
                    No manual priority override logs found. Perform an override to generate entries.
                  </td>
                </tr>
              ) : (
                logs.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-800/40 transition">
                    
                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      <div className="font-mono font-bold text-purple-300">{entry.id}</div>
                      <div className="text-[10px] text-slate-500 mt-1 flex items-center space-x-1 font-mono">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{new Date(entry.timestamp).toLocaleString()}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-100">{entry.ticket_id}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{entry.organisation_name}</div>
                    </td>

                    <td className="py-3.5 px-4 align-top">
                      <div className="font-semibold text-slate-200">{entry.user_name}</div>
                      <div className="text-[10px] text-purple-300 font-mono mt-0.5 px-2 py-0.5 rounded bg-purple-950/50 border border-purple-800/40 inline-block">
                        {entry.user_role}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${getPriorityStyle(entry.original_priority)}`}>
                          {entry.original_priority}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                        <span className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${getPriorityStyle(entry.updated_priority)}`}>
                          {entry.updated_priority}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 align-top max-w-md">
                      <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-slate-200 text-xs italic leading-relaxed">
                        "{entry.reason}"
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
