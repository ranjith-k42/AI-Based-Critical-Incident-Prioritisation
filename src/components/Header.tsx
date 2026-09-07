import React from 'react';
import { 
  ShieldAlert, 
  BarChart3, 
  Activity, 
  PlusCircle, 
  History, 
  Sliders, 
  Target, 
  AlertTriangle, 
  HeartPulse, 
  Building, 
  UserCheck, 
  FileCheck,
  FlaskConical,
  BrainCircuit,
  ArrowRightLeft,
  ChevronDown,
  LayoutDashboard
} from 'lucide-react';

interface HeaderProps {
  currentUser: any;
  users: any[];
  onSelectUser: (user: any) => void;
  activePage: string;
  onNavigate: (page: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  users,
  onSelectUser,
  activePage,
  onNavigate,
}) => {
  const isAdmin = currentUser?.role === 'MSP Administrator';
  const isAnalyst = currentUser?.role === 'MSP Support Analyst';
  const isCustomer = currentUser?.role === 'Customer Organisation User';
  const isPartner = currentUser?.role === 'External Partner';

  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'tickets', label: 'Ticket Queue (5,000)', icon: Activity },
    { id: 'create-ticket', label: '+ Create Ticket', icon: PlusCircle },
    { id: 'evidence', label: 'Priority Evidence', icon: BrainCircuit },
    ...(isAdmin || isAnalyst ? [{ id: 'override', label: 'Manual Override', icon: ArrowRightLeft }] : []),
    ...(isAdmin ? [{ id: 'audit-trail', label: 'Audit Trail', icon: History }] : []),
    { id: 'performance', label: 'Performance Evaluation', icon: Target },
    { id: 'false-positives', label: 'False Positives', icon: AlertTriangle },
    { id: 'false-negatives', label: 'False Negatives', icon: HeartPulse },
    { id: 'edge-cases', label: 'Edge Cases (3 Cases)', icon: FlaskConical },
    { id: 'organisations', label: 'Organisations', icon: Building },
    { id: 'roles', label: 'Roles & RBAC', icon: UserCheck },
    ...(isAdmin ? [{ id: 'configuration', label: 'System Configuration', icon: Sliders }] : []),
    { id: 'stakeholder-ethics', label: 'Validation & Ethics', icon: ShieldAlert },
    { id: 'deployment-checklist', label: 'Deployment Checklist', icon: FileCheck },
  ];

  return (
    <header className="bg-slate-900/95 border-b border-slate-800 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Branding & User Switcher */}
        <div className="flex flex-col lg:flex-row items-center justify-between py-3 gap-3">
          
          {/* Brand */}
          <div 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="p-2.5 bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 rounded-xl shadow-lg shadow-emerald-950/40 border border-emerald-400/30">
              <ShieldAlert className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent group-hover:text-emerald-300 transition">
                  Clinical & Business Impact Prioritiser
                </h1>
                <span className="text-[10px] px-2 py-0.2 rounded-full font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Full-Stack v3.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                MSP Enterprise Incident Triage & Automated Clinical Safety Engine
              </p>
            </div>
          </div>

          {/* User Persona & Role Selector */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-slate-950 p-2 rounded-2xl border border-slate-800 text-xs">
              <UserCheck className="w-4 h-4 text-emerald-400 ml-1" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400">Signed In As:</span>
                <select
                  value={currentUser?.id}
                  onChange={(e) => {
                    const u = users.find(x => x.id === e.target.value);
                    if (u) onSelectUser(u);
                  }}
                  className="bg-transparent text-xs text-slate-100 font-bold focus:outline-none cursor-pointer pr-2"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id} className="bg-slate-900 text-slate-200">
                      {u.name} — {u.role}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {currentUser?.organisation_name}
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('login')}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Switch Role
            </button>
          </div>

        </div>

        {/* Horizontal Navigation Menu */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 pt-1 border-t border-slate-800/60 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-950'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

      </div>
    </header>
  );
};
