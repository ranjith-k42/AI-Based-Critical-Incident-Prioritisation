import React from 'react';
import { ShieldAlert, UserCheck, Building, Lock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  currentUser: any;
  users: any[];
  onSelectUser: (user: any) => void;
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  currentUser,
  users,
  onSelectUser,
  onNavigate,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-emerald-950/60 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-tr from-emerald-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-emerald-950/40">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Authentication & Role-Based Access Control</h1>
            <p className="text-xs text-slate-400">
              Select an authorized user role to test permitted navigation, ticket scoping, and governance actions.
            </p>
          </div>
        </div>

        <div className="bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 text-xs">
          <span className="text-slate-400 block text-[10px]">Active Session:</span>
          <span className="font-bold text-emerald-400">{currentUser?.name}</span>
          <span className="text-slate-400 block text-[10px] font-mono">({currentUser?.role})</span>
        </div>
      </div>

      {/* Role Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.map((u) => {
          const isSelected = currentUser?.id === u.id;
          return (
            <div
              key={u.id}
              onClick={() => onSelectUser(u)}
              className={`p-5 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-4 ${
                isSelected
                  ? 'bg-gradient-to-br from-slate-900 to-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/40'
                  : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl border ${
                    isSelected ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{u.name}</h3>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-slate-800 inline-block mt-0.5">
                      {u.role}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <span className="text-[10px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full font-bold">
                    Active
                  </span>
                )}
              </div>

              <div className="text-xs space-y-1.5 text-slate-400 border-t border-slate-800 pt-3">
                <div className="flex items-center space-x-2">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  <span>Assigned Org: <strong className="text-slate-200">{u.organisation_name}</strong></span>
                </div>

                {/* Role capabilities breakdown */}
                <div className="pt-2 text-[11px] space-y-1">
                  {u.role === 'MSP Administrator' && (
                    <>
                      <div className="text-emerald-400 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Full global view across all organisations</span>
                      </div>
                      <div className="text-emerald-400 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Can perform manual priority overrides</span>
                      </div>
                      <div className="text-emerald-400 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Can configure global scoring weights & thresholds</span>
                      </div>
                    </>
                  )}

                  {u.role === 'MSP Support Analyst' && (
                    <>
                      <div className="text-emerald-400 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>View assigned and permitted tickets</span>
                      </div>
                      <div className="text-emerald-400 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>View prioritisation explanations & escalate</span>
                      </div>
                      <div className="text-red-400 flex items-center space-x-1.5">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cannot change global system thresholds</span>
                      </div>
                    </>
                  )}

                  {u.role === 'Customer Organisation User' && (
                    <>
                      <div className="text-emerald-400 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Create tickets and view own organisation tickets</span>
                      </div>
                      <div className="text-red-400 flex items-center space-x-1.5">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Restricted: Cannot view other organisations' tickets</span>
                      </div>
                    </>
                  )}

                  {u.role === 'External Partner' && (
                    <>
                      <div className="text-emerald-400 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>View assigned technical tickets & update resolution notes</span>
                      </div>
                      <div className="text-red-400 flex items-center space-x-1.5">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Restricted: Cannot change ticket priority</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectUser(u);
                  onNavigate('dashboard');
                }}
                className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition ${
                  isSelected
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <span>Login as {u.name.split(' ')[0]}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
