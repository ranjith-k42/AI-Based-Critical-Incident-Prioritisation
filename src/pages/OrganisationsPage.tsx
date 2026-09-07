import React, { useState, useEffect } from 'react';
import { Building, ShieldCheck, Clock, Layers, ArrowRight } from 'lucide-react';
import { fetchOrganisations } from '../api/client';

interface OrganisationsPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const OrganisationsPage: React.FC<OrganisationsPageProps> = ({ onNavigate }) => {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrgs();
  }, []);

  async function loadOrgs() {
    try {
      setLoading(true);
      const res = await fetchOrganisations();
      setOrgs(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-emerald-950/60 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-tr from-emerald-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-emerald-950/40">
            <Building className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Multi-Customer Organisation Profiles & SLAs</h1>
            <p className="text-xs text-slate-400">
              Contract response commitments, operating schedules, and designated critical services.
            </p>
          </div>
        </div>
      </div>

      {/* Organisation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {orgs.map((org) => (
          <div
            key={org.organisation_id}
            className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 backdrop-blur shadow-xl hover:border-slate-700 transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                  {org.organisation_id}
                </span>
                <h3 className="text-base font-bold text-white mt-1.5">{org.organisation_name}</h3>
              </div>

              <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${
                org.contract_level === 'Platinum' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' :
                org.contract_level === 'Gold' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                'bg-slate-800 text-slate-300 border-slate-700'
              }`}>
                {org.contract_level} SLA
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Critical Response Target</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {org.sla_critical_target_mins} minutes
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Operating Schedule</span>
                <span className="font-mono font-bold text-slate-200 text-sm">
                  {org.operating_schedule}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <span className="text-[11px] font-semibold text-slate-400 block">Designated Critical Services:</span>
              <div className="flex flex-wrap gap-1.5">
                {org.critical_services.split(',').map((svc: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-slate-950 text-slate-300 border border-slate-800"
                  >
                    {svc.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => onNavigate('tickets', { organisation_id: org.organisation_name })}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
              >
                <span>View All Tickets for {org.organisation_name.split(' ')[0]}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
