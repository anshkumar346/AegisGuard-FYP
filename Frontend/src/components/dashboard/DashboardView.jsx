import React, { useState, useMemo } from 'react';
import {
  Shield,
  Activity,
  FileCode,
  Zap,
  Target,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RotateCw,
  Lock,
  Building2
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import {
  DASHBOARD_METRICS,
  DEFENSE_ACTIVITY_CHART,
  SYSLOG_TAIL
} from '../../data/mockSecurityData';
import { useSecurity } from '../../context/SecurityContext';
import FitVerseChatbot from './FitVerseChatbot';

export default function DashboardView() {
  const {
    lockdownMode,
    toggleLockdown,
    updateFirewallRules,
    addSyslog,
    activeTenant,
    tenants,
    syslogs,
    isAdmin,
    user
  } = useSecurity();

  const [deniedNotice, setDeniedNotice] = useState('');

  const currentTenant = tenants?.find(t => t.id === activeTenant) || tenants?.[0];

  const filteredLogs = useMemo(() => {
    if (activeTenant === 'all') return syslogs || [];
    return (syslogs || []).filter(
      l => !l.tenantId || l.tenantId === 'global' || l.tenantId === activeTenant
    );
  }, [syslogs, activeTenant]);

  const handleScan = () => {
    addSyslog(
      'INFO',
      'net_scanner',
      `[${currentTenant?.code || 'TENANT'}] Network subnet scan triggered across 144 nodes.`,
      activeTenant === 'all' ? 'global' : activeTenant
    );
  };

  const handleUpdateFirewall = () => {
    const res = updateFirewallRules();
    if (res && !res.success) {
      setDeniedNotice(`ACCESS DENIED: Modifying system-wide firewall rules requires Administrator role (SYS_ROOT_01). User '${user?.name}' is restricted.`);
      setTimeout(() => setDeniedNotice(''), 4500);
    }
  };

  const handleLockdown = () => {
    const res = toggleLockdown();
    if (res && !res.success) {
      setDeniedNotice(`ACCESS DENIED: Initiating perimeter lockdown requires Administrator role (SYS_ROOT_01). Action blocked for '${user?.name}'.`);
      setTimeout(() => setDeniedNotice(''), 4500);
    }
  };

  return (
    <div className="space-y-4 font-sans select-none">
      
      {/* Top 4 KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: 42% */}
        <div className="p-5 rounded-xl bg-[#101319] border border-[#1A202C] flex flex-col justify-between shadow-sm">
          <div>
            <div className="text-4xl font-extrabold font-mono text-cyan-400">
              42<span className="text-2xl">%</span>
            </div>
            <div className="w-full bg-[#18202F] h-2 rounded-full overflow-hidden mt-3">
              <div className="bg-cyan-400 h-full rounded-full" style={{ width: '42%' }} />
            </div>
            <div className="mt-2 text-xs font-mono text-slate-300 font-medium">
              Network Shield Capacity
            </div>
          </div>
        </div>

        {/* Metric 2: 03 Requires Attention */}
        <div className="p-5 rounded-xl bg-[#141215] border border-[#2B1B1E] flex flex-col justify-between shadow-sm">
          <div>
            <div className="text-4xl font-extrabold font-mono text-white">
              03
            </div>
            <div className="flex items-center gap-2 mt-3 text-sm font-mono text-rose-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>Requires Attention</span>
            </div>
          </div>
        </div>

        {/* Metric 3: 1,024 */}
        <div className="p-5 rounded-xl bg-[#101319] border border-[#1A202C] flex flex-col justify-between shadow-sm">
          <div>
            <div className="text-4xl font-extrabold font-mono text-emerald-400">
              1,024
            </div>
            <div className="mt-3 text-sm font-mono text-slate-200 font-semibold">
              99.8% Capacity
            </div>
          </div>
        </div>

        {/* Metric 4: 99.9% */}
        <div className="p-5 rounded-xl bg-[#101319] border border-[#1A202C] flex flex-col justify-between shadow-sm">
          <div>
            <div className="text-4xl font-extrabold font-mono text-white">
              99.9<span className="text-2xl">%</span>
            </div>
            <div className="mt-3 text-sm font-mono text-slate-200 font-semibold">
              Last failure: 42d ago
            </div>
          </div>
        </div>

      </div>

      {/* Middle Row: System Health (Left) + Defense Activity (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: System Health Gauge (4 Cols) */}
        <div className="lg:col-span-4 p-5 rounded-xl bg-[#101319] border border-[#1A202C] flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 text-sm font-mono uppercase tracking-wider text-white font-bold mb-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>SYSTEM HEALTH</span>
          </div>

          {/* Segmented Ring Donut */}
          <div className="my-6 flex items-center justify-center relative">
            <svg className="w-48 h-48 transform -rotate-90">
              {/* Background track */}
              <circle
                cx="96"
                cy="96"
                r="70"
                stroke="#18202F"
                strokeWidth="14"
                fill="transparent"
              />
              {/* Main Cyan arc */}
              <circle
                cx="96"
                cy="96"
                r="70"
                stroke="#00F0FF"
                strokeWidth="14"
                strokeDasharray={`${2 * Math.PI * 70 * 0.7} ${2 * Math.PI * 70 * 0.3}`}
                strokeDashoffset="0"
                strokeLinecap="round"
                fill="transparent"
              />
              {/* Top Accent Orange/Coral segment */}
              <circle
                cx="96"
                cy="96"
                r="70"
                stroke="#FB7185"
                strokeWidth="14"
                strokeDasharray={`${2 * Math.PI * 70 * 0.15} ${2 * Math.PI * 70 * 0.85}`}
                strokeDashoffset={`-${2 * Math.PI * 70 * 0.72}`}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Inner Center Label */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-black font-mono text-white">
                85%
              </span>
              <span className="text-xs font-mono tracking-widest text-cyan-400 font-extrabold uppercase mt-1">
                OPTIMAL
              </span>
            </div>
          </div>

          <div className="text-center text-xs font-mono text-slate-200 font-semibold">
            Aegis Heuristic Core Nominal
          </div>
        </div>

        {/* Right: Defense Activity Line Chart (8 Cols) */}
        <div className="lg:col-span-8 p-5 rounded-xl bg-[#101319] border border-[#1A202C] flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-mono uppercase tracking-wider text-white font-bold">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>DEFENSE ACTIVITY</span>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-5 text-sm font-mono font-semibold">
              <span className="flex items-center gap-2 text-cyan-400">
                <span className="w-3.5 h-1 bg-cyan-400 inline-block rounded-full" />
                Allowed
              </span>
              <span className="flex items-center gap-2 text-rose-400">
                <span className="w-3.5 h-1 border-b-2 border-rose-400 border-dashed inline-block" />
                Blocked
              </span>
            </div>
          </div>

          {/* Recharts Line Chart */}
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={DEFENSE_ACTIVITY_CHART} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="time"
                  stroke="#475569"
                  tick={{ fill: '#CBD5E1', fontSize: 12, fontFamily: 'monospace', fontWeight: 600 }}
                  tickLine={false}
                />
                <YAxis
                  stroke="#475569"
                  tick={{ fill: '#CBD5E1', fontSize: 12, fontFamily: 'monospace', fontWeight: 600 }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B0D12',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    color: '#F8FAFC'
                  }}
                />
                {/* Cyan solid allowed line */}
                <Line
                  type="monotone"
                  dataKey="allowed"
                  stroke="#00F0FF"
                  strokeWidth={2.5}
                  dot={false}
                />
                {/* Pink dashed blocked line */}
                <Line
                  type="monotone"
                  dataKey="blocked"
                  stroke="#FB7185"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Bottom Row: syslog_tail.log (Left) + QUICK ACTIONS (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: syslog_tail.log (8 Cols) */}
        <div className="lg:col-span-8 p-5 rounded-xl bg-[#0D0F14] border border-[#1A202C] shadow-sm font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
            <div className="flex items-center gap-2 text-white">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-sm tracking-wide">
                syslog_tail.log [{currentTenant?.shortName || 'Global'}]
              </span>
            </div>
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>LIVE ENCLAVE</span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs leading-relaxed font-medium">
            {filteredLogs.slice(0, 6).map((log, idx) => {
              const isCrit = log.level === 'CRIT' || log.level === 'ALERT';
              if (isCrit) {
                return (
                  <div key={idx} className="p-2.5 rounded-lg bg-[#241416] border border-rose-800 text-rose-200">
                    <span className="text-slate-400 mr-2 font-mono">{log.time}</span>
                    <span className="text-rose-400 font-extrabold mr-2">[{log.level}]</span>
                    <span className="font-semibold">{log.msg}</span>
                  </div>
                );
              }

              return (
                <div key={idx} className="px-1 text-slate-200 flex items-center">
                  <span className="text-slate-400 mr-2 font-mono">{log.time}</span>
                  <span className={`font-extrabold mr-2 ${log.level === 'WARN' ? 'text-amber-400' : 'text-cyan-400'}`}>
                    [{log.level}]
                  </span>
                  <span>{log.msg}</span>
                </div>
              );
            })}
            <div className="px-1 text-cyan-400 font-bold animate-pulse">
              14:25:12  _
            </div>
          </div>
        </div>

        {/* Right: QUICK ACTIONS (4 Cols) */}
        <div className="lg:col-span-4 p-5 rounded-xl bg-[#101319] border border-[#1A202C] flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-sm font-mono uppercase tracking-wider text-white font-bold mb-3">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>QUICK ACTIONS</span>
            </div>

            {/* Access Denied Warning Banner ("aur kisi ko na kuch kare") */}
            {deniedNotice && (
              <div className="mb-3.5 p-3 rounded-lg bg-[#251518] border border-rose-600 text-rose-300 text-xs font-mono flex items-start gap-2 shadow-lg animate-in fade-in">
                <Lock className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span className="font-semibold leading-relaxed">{deniedNotice}</span>
              </div>
            )}

            <div className="space-y-3 font-mono text-xs">
              {/* Scan Network */}
              <button
                onClick={handleScan}
                className="w-full p-3.5 rounded-lg bg-[#141A24] hover:bg-[#182232] border border-[#1F2B3E] text-white flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-950 flex items-center justify-center text-cyan-400 border border-cyan-800/60">
                    <Target className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm">Scan Network</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Update Firewall */}
              <button
                onClick={handleUpdateFirewall}
                className="w-full p-3.5 rounded-lg bg-[#141A24] hover:bg-[#182232] border border-[#1F2B3E] text-white flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-950 flex items-center justify-center text-emerald-400 border border-emerald-800/60">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-sm block">Update Firewall</span>
                    <span className="text-[11px] text-slate-400 font-medium">System-wide rule hot-reload</span>
                  </div>
                </div>
                {isAdmin() ? (
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                ) : (
                  <Lock className="w-4 h-4 text-amber-400" title="Admin Required" />
                )}
              </button>
            </div>
          </div>

          {/* Initiate Lockdown Button */}
          <div className="pt-4 mt-4 border-t border-slate-800/80 text-center font-mono">
            <button
              onClick={handleLockdown}
              className={`w-full py-3 px-4 rounded-lg border text-sm font-black transition-all ${
                lockdownMode
                  ? 'bg-rose-950 border-rose-500 text-rose-300 animate-pulse'
                  : 'bg-[#201416] hover:bg-rose-950/60 border-rose-900/60 text-rose-300'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span className="tracking-wider uppercase">
                  {lockdownMode ? 'DISENGAGE LOCKDOWN' : 'INITIATE LOCKDOWN'}
                </span>
                {!isAdmin() && <Lock className="w-4 h-4 text-amber-400 ml-1" />}
              </div>
            </button>
            <span className="text-xs text-slate-300 font-medium block mt-2">
              {isAdmin() ? 'Administrator Privileges Verified' : 'Locked: Requires Administrator Privileges'}
            </span>
          </div>
        </div>

      </div>

      {/* Floating Demo Chatbot (as visible on Figma screen) */}
      <FitVerseChatbot mode="floating" />

    </div>
  );
}
