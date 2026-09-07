import React, { useState } from 'react';
import { AuditEntry, PriorityLevel } from '../types';
import { History, Search, ShieldCheck, UserCheck, Calendar, ArrowRight, FileText, Lock } from 'lucide-react';

interface AuditLogViewProps {
  auditTrail: AuditEntry[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ auditTrail }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const filteredLogs = auditTrail.filter(entry => {
    const matchesSearch = 
      entry.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.organisation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'All' || entry.userRole === roleFilter;

    return matchesSearch && matchesRole;
  });

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
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-800/40 rounded-2xl p-5 shadow-lg backdrop-blur flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/40 text-purple-300">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Auditable Priority Override Decision Trail</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                Immutable Ledger
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Complete, tamper-proof record of all manual priority modifications, authorized roles, and justifications.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Total Logged Overrides</span>
            <span className="font-mono font-bold text-purple-300 text-sm">{auditTrail.length}</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search audit trail by ticket ID, user name, organization, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500/60 placeholder-slate-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <UserCheck className="w-4 h-4 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="All" className="bg-slate-900">All User Roles</option>
            <option value="MSP Administrator" className="bg-slate-900">MSP Administrator</option>
            <option value="Customer Org Manager (Healthcare)" className="bg-slate-900">Healthcare Manager</option>
            <option value="Customer Org Manager (Financial)" className="bg-slate-900">Financial Manager</option>
          </select>
        </div>
      </div>

      {/* Audit Log Timeline Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Audit ID & Timestamp</th>
                <th className="py-3.5 px-4">Ticket & Organisation</th>
                <th className="py-3.5 px-4">Authorised User</th>
                <th className="py-3.5 px-4">Priority Shift</th>
                <th className="py-3.5 px-4">Audited Justification Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No override audit entries matching criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-800/40 transition">
                    {/* Audit ID & Time */}
                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      <div className="font-mono font-bold text-purple-300">{entry.id}</div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{new Date(entry.timestamp).toLocaleString()}</span>
                      </div>
                    </td>

                    {/* Ticket & Org */}
                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-100">{entry.ticketId}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{entry.organisation}</div>
                    </td>

                    {/* Authorised User */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-semibold text-slate-200">{entry.userName}</div>
                      <div className="text-[10px] text-purple-300 font-mono mt-0.5 bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-800/40 inline-block">
                        {entry.userRole}
                      </div>
                    </td>

                    {/* Priority Shift */}
                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${getPriorityTag(entry.originalPriority)}`}>
                          {entry.originalPriority}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                        <span className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${getPriorityTag(entry.updatedPriority)}`}>
                          {entry.updatedPriority}
                        </span>
                      </div>
                    </td>

                    {/* Reason */}
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
