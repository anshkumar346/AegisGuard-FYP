import React from 'react';
import {
  LayoutGrid,
  Globe,
  TerminalSquare,
  FlaskConical,
  Lock,
  Boxes,
  Shield,
  Settings,
  HelpCircle
} from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';

export default function Sidebar() {
  const {
    activeTab,
    setActiveTab,
    lockdownMode,
    toggleLockdown
  } = useSecurity();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'threat-map', label: 'Threat Map', icon: Globe },
    { id: 'telemetry', label: 'Telemetry', icon: TerminalSquare },
    { id: 'prompts-lab', label: 'Prompts Lab', icon: FlaskConical },
    { id: 'isolation-vault', label: 'Isolation Vault', icon: Lock },
    { id: 'api-integration', label: 'API Integration', icon: Boxes },
  ];

  return (
    <aside className="w-60 h-full flex-shrink-0 border-r border-cyber-border bg-[#0B0D12] flex flex-col justify-between py-3.5 px-3 select-none overflow-y-auto">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 px-1.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-blue-950/90 border border-blue-500/70 flex items-center justify-center text-blue-400 shadow-md flex-shrink-0">
            <Shield className="w-4 h-4 fill-blue-500/30" />
          </div>
          <div>
            <div className="font-extrabold text-sm tracking-wide text-blue-400 leading-tight">
              Aegis Command
            </div>
            <div className="text-[11px] uppercase tracking-wider text-slate-200 font-mono font-bold mt-0.5">
              VANGUARD SYSTEM
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all group ${
                  isActive
                    ? 'bg-[#082F38] text-cyan-300 font-bold border-l-2 border-cyan-400 shadow-sm'
                    : 'text-slate-200 hover:text-white hover:bg-slate-900/80'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-300 group-hover:text-cyan-300'}`} />
                <span className="tracking-wide text-[13px]">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="space-y-2 pt-2.5 border-t border-cyber-border/40 font-mono text-xs">
        {/* System Lock Button */}
        <button
          onClick={toggleLockdown}
          className={`w-full py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-xs transition-all border ${
            lockdownMode
              ? 'bg-rose-950 border-rose-500 text-rose-300 font-bold animate-pulse'
              : 'bg-[#181418] hover:bg-rose-950/40 border-rose-900/60 text-rose-300 font-semibold'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span className="text-xs font-bold tracking-wider uppercase">
            {lockdownMode ? 'SYSTEM LOCKED' : 'SYSTEM LOCK'}
          </span>
        </button>

        {/* Settings & Support */}
        <div className="space-y-0.5">
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-sans transition-all group ${
              activeTab === 'settings'
                ? 'bg-[#082F38] text-cyan-300 font-bold border-l-2 border-cyan-400 shadow-sm'
                : 'text-slate-200 hover:text-white hover:bg-slate-900/80'
            }`}
          >
            <Settings className={`w-4 h-4 flex-shrink-0 ${activeTab === 'settings' ? 'text-cyan-400' : 'text-slate-300 group-hover:text-cyan-300'}`} />
            <span className="text-[13px] font-semibold">Settings</span>
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-sans transition-all group ${
              activeTab === 'support'
                ? 'bg-[#082F38] text-cyan-300 font-bold border-l-2 border-cyan-400 shadow-sm'
                : 'text-slate-200 hover:text-white hover:bg-slate-900/80'
            }`}
          >
            <HelpCircle className={`w-4 h-4 flex-shrink-0 ${activeTab === 'support' ? 'text-cyan-400' : 'text-slate-300 group-hover:text-cyan-300'}`} />
            <span className="text-[13px] font-semibold">Support</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
