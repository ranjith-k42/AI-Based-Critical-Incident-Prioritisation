import React, { useState, useEffect } from 'react';
import { Sliders, ShieldAlert, CheckCircle2, Lock, Save, RefreshCw } from 'lucide-react';
import { fetchConfigThresholds, updateConfigThresholds } from '../api/client';

interface ConfigurationPageProps {
  currentUser: any;
  onNavigate: (page: string) => void;
}

export const ConfigurationPage: React.FC<ConfigurationPageProps> = ({ currentUser, onNavigate }) => {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    try {
      setLoading(true);
      const res = await fetchConfigThresholds();
      setConfig(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await updateConfigThresholds({
        ...config,
        updated_by: currentUser?.name || 'MSP Administrator'
      });
      setConfig(res);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      alert(err.message || 'Error updating configuration');
    } finally {
      setSaving(false);
    }
  }

  const isAdmin = currentUser?.role === 'MSP Administrator';

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="p-3 bg-red-950/40 rounded-full w-14 h-14 mx-auto flex items-center justify-center text-red-400 border border-red-800/40">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Access Restricted: MSP Administrator Required</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Global scoring weights and threshold configuration can only be modified by an authorized MSP Administrator.
        </p>
        <button
          onClick={() => onNavigate('login')}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
        >
          Switch Role to Admin
        </button>
      </div>
    );
  }

  if (loading || !config) {
    return <div className="py-24 text-center text-slate-400">Loading configuration...</div>;
  }

  const totalPoints = Number(config.weight_clinical) + Number(config.weight_business) + Number(config.weight_criticality) + Number(config.weight_users) + Number(config.weight_schedule) + Number(config.weight_contract);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-emerald-950/60 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-tr from-emerald-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-emerald-950/40">
            <Sliders className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">System Scoring & Threshold Configuration</h1>
            <p className="text-xs text-slate-400">
              Configure multi-factor impact weights (0-100 total) and priority cutoffs.
            </p>
          </div>
        </div>

        <div className="bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 text-xs text-right">
          <span className="text-slate-400 block text-[10px]">Total Configured Points</span>
          <span className={`font-mono font-bold text-base ${totalPoints === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {totalPoints} / 100 pts
          </span>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-950/40 border border-emerald-800/50 p-4 rounded-2xl text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Configuration saved successfully to SQLite! New tickets will be triaged using these parameters.</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl backdrop-blur text-xs">
        
        {/* Scoring Factor Weights Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
            1. Multi-Factor Impact Weights (Max: 100 Points Total)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <label className="block text-emerald-400 font-bold">Clinical Impact Weight (0–30)</label>
              <input
                type="number"
                min="0"
                max="50"
                value={config.weight_clinical}
                onChange={(e) => setConfig({ ...config, weight_clinical: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 font-mono text-white text-base"
              />
              <p className="text-[10px] text-slate-500">ICU, EHR, medication dispenser, patient triage</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <label className="block text-blue-400 font-bold">Business Impact Weight (0–25)</label>
              <input
                type="number"
                min="0"
                max="50"
                value={config.weight_business}
                onChange={(e) => setConfig({ ...config, weight_business: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 font-mono text-white text-base"
              />
              <p className="text-[10px] text-slate-500">POS payment outage, payroll, financial revenue</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <label className="block text-purple-400 font-bold">Service Criticality (0–20)</label>
              <input
                type="number"
                min="0"
                max="40"
                value={config.weight_criticality}
                onChange={(e) => setConfig({ ...config, weight_criticality: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 font-mono text-white text-base"
              />
              <p className="text-[10px] text-slate-500">Tier-1 core services vs general office tools</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <label className="block text-amber-400 font-bold">Users Affected Weight (0–10)</label>
              <input
                type="number"
                min="0"
                max="25"
                value={config.weight_users}
                onChange={(e) => setConfig({ ...config, weight_users: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 font-mono text-white text-base"
              />
              <p className="text-[10px] text-slate-500">Number of impacted clinical & operational users</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <label className="block text-teal-400 font-bold">Operating Schedule Weight (0–10)</label>
              <input
                type="number"
                min="0"
                max="25"
                value={config.weight_schedule}
                onChange={(e) => setConfig({ ...config, weight_schedule: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 font-mono text-white text-base"
              />
              <p className="text-[10px] text-slate-500">24/7 continuous vs standard office hours</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <label className="block text-indigo-400 font-bold">Contract Priority Weight (0–5)</label>
              <input
                type="number"
                min="0"
                max="15"
                value={config.weight_contract}
                onChange={(e) => setConfig({ ...config, weight_contract: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 font-mono text-white text-base"
              />
              <p className="text-[10px] text-slate-500">Platinum (15m) vs Gold (30m) vs Standard (60m)</p>
            </div>

          </div>
        </div>

        {/* Priority Thresholds Section */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
            2. Priority Classification Thresholds (Points Cutoffs)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-red-950/30 p-4 rounded-2xl border border-red-900/50 space-y-2">
              <label className="block text-red-300 font-bold">Critical Threshold (Default: 80)</label>
              <input
                type="number"
                min="50"
                max="95"
                value={config.threshold_critical}
                onChange={(e) => setConfig({ ...config, threshold_critical: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-red-800 rounded-xl p-2 font-mono text-red-400 font-bold text-base"
              />
              <p className="text-[10px] text-slate-400">Score &gt;= this value assigned Critical</p>
            </div>

            <div className="bg-amber-950/30 p-4 rounded-2xl border border-amber-900/50 space-y-2">
              <label className="block text-amber-300 font-bold">High Threshold (Default: 60)</label>
              <input
                type="number"
                min="30"
                max="80"
                value={config.threshold_high}
                onChange={(e) => setConfig({ ...config, threshold_high: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-amber-800 rounded-xl p-2 font-mono text-amber-400 font-bold text-base"
              />
              <p className="text-[10px] text-slate-400">Score &gt;= this value assigned High</p>
            </div>

            <div className="bg-cyan-950/30 p-4 rounded-2xl border border-cyan-900/50 space-y-2">
              <label className="block text-cyan-300 font-bold">Medium Threshold (Default: 30)</label>
              <input
                type="number"
                min="10"
                max="50"
                value={config.threshold_medium}
                onChange={(e) => setConfig({ ...config, threshold_medium: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-cyan-800 rounded-xl p-2 font-mono text-cyan-400 font-bold text-base"
              />
              <p className="text-[10px] text-slate-400">Score &gt;= this value assigned Medium (else Low)</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <span className="text-[11px] text-slate-500 font-mono">
            Last updated by: {config.updated_by} ({new Date(config.updated_at).toLocaleString()})
          </span>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold flex items-center space-x-2 shadow-lg shadow-emerald-950/40 transition"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
