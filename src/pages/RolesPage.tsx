import React from 'react';
import { UserCheck, ShieldCheck, Check, X, Building, ArrowRight } from 'lucide-react';

interface RolesPageProps {
  currentUser: any;
  users: any[];
  onSelectUser: (user: any) => void;
  onNavigate: (page: string) => void;
}

export const RolesPage: React.FC<RolesPageProps> = ({
  currentUser,
  users,
  onSelectUser,
  onNavigate
}) => {
  const permissions = [
    { name: 'View All Organisations (CityCare, Metro, MedTech, Retail)', admin: true, analyst: true, customer: false, partner: false },
    { name: 'View All 5,000 Tickets Across Customers', admin: true, analyst: true, customer: false, partner: false },
    { name: 'View Own Organisation Tickets Only', admin: true, analyst: true, customer: true, partner: false },
    { name: 'View Assigned Technical Partner Tickets Only', admin: true, analyst: true, customer: false, partner: true },
    { name: 'Perform Auditable Manual Priority Overrides', admin: true, analyst: true, customer: false, partner: false },
    { name: 'Access Full Immutable Audit Trail Ledger', admin: true, analyst: false, customer: false, partner: false },
    { name: 'Configure Scoring Factor Weights & Priority Thresholds', admin: true, analyst: false, customer: false, partner: false },
    { name: 'Create New Support / Incident Tickets', admin: true, analyst: true, customer: true, partner: false },
    { name: 'Update Resolution Notes & Partner Status', admin: true, analyst: true, customer: false, partner: true },
    { name: 'Delete or Tamper with Historical Audit Logs', admin: false, analyst: false, customer: false, partner: false },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-emerald-950/60 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-tr from-emerald-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-emerald-950/40">
            <UserCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Role-Based Access Control (RBAC) & Permissions</h1>
            <p className="text-xs text-slate-400">
              Interactive permission matrix illustrating permitted workflows, data isolation, and governance boundaries.
            </p>
          </div>
        </div>

        <div className="bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 text-xs">
          <span className="text-slate-400 block text-[10px]">Active Session:</span>
          <span className="font-bold text-emerald-400">{currentUser?.name}</span>
          <span className="text-slate-400 block text-[10px] font-mono">({currentUser?.role})</span>
        </div>
      </div>

      {/* Quick Role Switcher Buttons */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3 backdrop-blur">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Test Application Navigation Through Different Roles:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {users.map((u) => {
            const isSelected = currentUser?.id === u.id;
            return (
              <button
                key={u.id}
                onClick={() => onSelectUser(u)}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/30'
                    : 'bg-slate-950 border-slate-800 hover:bg-slate-850 text-slate-400'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-200 text-xs">{u.name.split(' ')[0]}</span>
                  {isSelected && <span className="text-[10px] bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded font-bold">Active</span>}
                </div>
                <div className="text-[11px] text-emerald-400 font-mono">{u.role}</div>
                <div className="text-[10px] text-slate-500 truncate">{u.organisation_name}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Permission Matrix Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl shadow-xl overflow-hidden backdrop-blur">
        <div className="p-4 border-b border-slate-800 text-xs font-bold text-white">
          Access Control Capabilities Matrix
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Feature / Permitted Action</th>
                <th className="py-3 px-4 text-center">MSP Admin</th>
                <th className="py-3 px-4 text-center">MSP Analyst</th>
                <th className="py-3 px-4 text-center">Customer User</th>
                <th className="py-3 px-4 text-center">External Partner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {permissions.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-medium text-slate-200">{p.name}</td>
                  
                  <td className="py-3 px-4 text-center">
                    {p.admin ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-red-500/60 mx-auto" />}
                  </td>

                  <td className="py-3 px-4 text-center">
                    {p.analyst ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-red-500/60 mx-auto" />}
                  </td>

                  <td className="py-3 px-4 text-center">
                    {p.customer ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-red-500/60 mx-auto" />}
                  </td>

                  <td className="py-3 px-4 text-center">
                    {p.partner ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-red-500/60 mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
