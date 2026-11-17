import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Gauge,
  Bell,
  Search,
  User,
  ShieldAlert,
  LogOut,
  Activity,
  Terminal,
  Check,
  X,
  Shield,
  Cpu,
  Layers,
  Zap,
  RotateCcw,
  LifeBuoy,
  Building2,
  ChevronDown,
  Lock,
  Unlock,
  ShieldCheck
} from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';

export default function Header() {
  const {
    activeTab,
    setActiveTab,
    metrics,
    lockdownMode,
    toggleLockdown,
    searchQuery,
    setSearchQuery,
    simulateAttack,
    user,
    setUser,
    tenants,
    activeTenant,
    switchTenant,
    isAdmin,
    notifications,
    markAllNotificationsRead,
    clearNotifications,
    removeNotification,
    logout
  } = useSecurity();

  const [isTenantOpen, setIsTenantOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [diagnosticRunning, setDiagnosticRunning] = useState(false);
  const [diagnosticSuccess, setDiagnosticSuccess] = useState(false);

  const containerRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsTenantOpen(false);
        setIsNotificationOpen(false);
        setIsDiagnosticsOpen(false);
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const unreadCount = notifications ? notifications.filter(n => !n.read).length : 0;

  const runQuickDiagnostics = () => {
    setDiagnosticRunning(true);
    setDiagnosticSuccess(false);
    setTimeout(() => {
      setDiagnosticRunning(false);
      setDiagnosticSuccess(true);
      setTimeout(() => setDiagnosticSuccess(false), 3000);
    }, 800);
  };

  const getSubBadge = () => {
    switch (activeTab) {
      case 'prompts-lab':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800">
            PROMPTS LAB
          </span>
        );
      case 'threat-map':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#201815] border border-amber-800/80 text-[10px] font-mono text-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>DEFCON 2</span>
          </div>
        );
      case 'telemetry':
        return (
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>SYSTEM ONLINE</span>
          </div>
        );
      case 'isolation-vault':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-rose-950/70 border border-rose-800 text-[10px] font-mono text-rose-300">
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            <span>CONTAINMENT ACTIVE</span>
          </div>
        );
      case 'settings':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800">
            SETTINGS
          </span>
        );
      case 'api-integration':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800">
            API INTEGRATION
          </span>
        );
      case 'support':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-600 font-bold">
            SUPPORT DESK
          </span>
        );
      default:
        return null;
    }
  };

  const currentTenant = tenants?.find(t => t.id === activeTenant) || tenants?.[0];

  return (
    <header
      ref={containerRef}
      className="h-14 w-full border-b border-cyber-border bg-[#0B0D12] px-6 flex items-center justify-between select-none relative z-50"
    >
      {/* Left Title */}
      <div className="flex items-center gap-3">
        <h1 className="font-extrabold text-sm lg:text-base tracking-wide uppercase text-white font-mono">
          AEGIS COMMAND CENTER
        </h1>
        {getSubBadge()}
      </div>

      {/* Center Search */}
      <div className="hidden md:flex items-center max-w-sm w-full mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'telemetry' ? 'Query Telemetry...' : 'Search IPs, Hashes...'}
            className="w-full pl-10 pr-3.5 py-1.5 rounded-lg bg-[#141A24] border border-slate-700 hover:border-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 text-xs lg:text-sm text-white font-semibold placeholder:text-slate-300 placeholder:font-medium font-mono focus:outline-none shadow-inner transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Quick attack simulator trigger */}
        <button
          onClick={simulateAttack}
          title="Simulate incoming threat detection"
          className="text-[11px] font-mono font-bold px-2.5 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-600/80 text-cyan-300 transition-colors hidden sm:block shadow-sm"
        >
          [SIMULATE ATTACK]
        </button>

        {/* Settings Button */}
        <button
          onClick={() => {
            setActiveTab('settings');
            setIsNotificationOpen(false);
            setIsDiagnosticsOpen(false);
            setIsProfileOpen(false);
          }}
          title="SOC System Settings"
          className={`p-2 rounded-lg border transition-all ${
            activeTab === 'settings'
              ? 'text-cyan-300 bg-cyan-950/80 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
              : 'text-slate-200 bg-[#141A24] border-slate-700 hover:text-cyan-300 hover:border-cyan-500/80 hover:bg-[#1A2230]'
          }`}
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Diagnostics Button & Flyout */}
        <div className="relative">
          <button
            onClick={() => {
              setIsDiagnosticsOpen(!isDiagnosticsOpen);
              setIsNotificationOpen(false);
              setIsProfileOpen(false);
            }}
            title="SOC Engine Diagnostics"
            className={`p-2 rounded-lg border transition-all ${
              isDiagnosticsOpen
                ? 'text-cyan-300 bg-cyan-950/80 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-slate-200 bg-[#141A24] border-slate-700 hover:text-cyan-300 hover:border-cyan-500/80 hover:bg-[#1A2230]'
            }`}
          >
            <Gauge className="w-4 h-4" />
          </button>

          {/* Diagnostics Dropdown Flyout */}
          {isDiagnosticsOpen && (
            <div className="absolute right-0 top-full mt-2 w-96 sm:w-[430px] rounded-xl bg-[#0B0F17] border border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.2)] p-5 space-y-3 font-mono text-xs sm:text-[13px] z-[60] animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2 text-cyan-300 font-extrabold text-xs sm:text-sm tracking-wider">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>SOC_ENGINE_DIAGNOSTICS</span>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-extrabold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-600/80">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  NOMINAL
                </span>
              </div>

              {/* Engine Metrics Grid */}
              <div className="space-y-2 text-xs sm:text-[13px]">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/70">
                  <span className="text-white font-bold tracking-wide">Core Utilization:</span>
                  <span className="text-cyan-300 font-extrabold">28.4% (4 Cores)</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/70">
                  <span className="text-white font-bold tracking-wide">Memory Allocation:</span>
                  <span className="text-cyan-300 font-extrabold">4.18 GB / 16.0 GB</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/70">
                  <span className="text-white font-bold tracking-wide">Packet Inspection Latency:</span>
                  <span className="text-emerald-300 font-extrabold">1.14 ms</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/70">
                  <span className="text-white font-bold tracking-wide">Wire Pipeline Throughput:</span>
                  <span className="text-cyan-300 font-extrabold">{metrics?.inspectedBandwidth || '4.2 Gbps'}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/70">
                  <span className="text-white font-bold tracking-wide">Active AST Workers:</span>
                  <span className="text-emerald-300 font-extrabold">3 Nodes Active</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-white font-bold tracking-wide">Heuristic Accuracy:</span>
                  <span className="text-emerald-300 font-extrabold">99.8% Certified</span>
                </div>
              </div>

              {/* Diagnostic Test Feedback */}
              {diagnosticSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-950/90 border border-emerald-400 text-emerald-200 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Subsystem sanity check passed: All buffers synced.</span>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2.5">
                <button
                  onClick={runQuickDiagnostics}
                  disabled={diagnosticRunning}
                  className="flex-1 py-2 px-3 rounded-lg bg-cyan-900/90 hover:bg-cyan-800 border border-cyan-400 text-cyan-100 text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Zap className="w-4 h-4 text-cyan-300" />
                  <span>{diagnosticRunning ? 'Scanning System...' : 'Run Diagnostics'}</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('telemetry');
                    setIsDiagnosticsOpen(false);
                  }}
                  className="py-2 px-4 rounded-lg bg-[#18202F] hover:bg-[#222C40] border border-slate-600 hover:border-cyan-400 text-white font-bold text-xs transition-all shadow-sm"
                >
                  Telemetry
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notification Bell & Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotificationOpen(!isNotificationOpen);
              setIsDiagnosticsOpen(false);
              setIsProfileOpen(false);
            }}
            title="Incident Notifications"
            className={`p-2 rounded-lg border transition-all relative ${
              isNotificationOpen
                ? 'text-cyan-300 bg-cyan-950/80 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-slate-200 bg-[#141A24] border-slate-700 hover:text-cyan-300 hover:border-cyan-500/80 hover:bg-[#1A2230]'
            }`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0B0D12]" />
            )}
          </button>

          {/* Notifications Flyout Dropdown */}
          {isNotificationOpen && (
            <div className="absolute right-0 top-full mt-2 w-96 sm:w-[430px] rounded-xl bg-[#0B0F17] border border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.2)] p-5 space-y-3 font-mono text-xs z-[60] animate-in fade-in zoom-in-95 duration-150">
              {/* Header with Title, Badge, and Action Buttons */}
              <div className="pb-3 border-b border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Bell className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span className="font-extrabold text-white text-xs sm:text-sm tracking-wider truncate">
                      INCIDENT_NOTIFICATIONS
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-900 border border-rose-500 text-rose-100 text-[11px] font-extrabold whitespace-nowrap flex-shrink-0 shadow-sm">
                      {unreadCount} NEW
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs pt-0.5">
                  <span className="text-[11px] text-slate-300 font-mono font-medium">
                    {notifications?.length || 0} Active Alerts
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={markAllNotificationsRead}
                      className="px-2.5 py-1 rounded bg-[#16202E] hover:bg-cyan-950 border border-slate-700 hover:border-cyan-400 text-cyan-300 hover:text-white font-bold text-xs transition-all shadow-sm"
                    >
                      Mark Read
                    </button>
                    <button
                      onClick={clearNotifications}
                      className="px-2.5 py-1 rounded bg-[#2A141A] hover:bg-rose-950 border border-rose-800/80 hover:border-rose-500 text-rose-300 hover:text-white font-bold text-xs transition-all shadow-sm"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
                {notifications && notifications.length > 0 ? (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-lg border transition-all flex items-start justify-between gap-3 ${
                        item.read
                          ? 'border-slate-800/80 bg-[#0F141F] text-slate-300'
                          : 'border-slate-600 hover:border-cyan-500/70 bg-[#141C2B] text-white shadow-md'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold border tracking-wider uppercase shadow-sm ${
                              item.severity === 'Critical'
                                ? 'bg-rose-900 border-rose-500 text-rose-100'
                                : item.severity === 'High'
                                ? 'bg-amber-900 border-amber-500 text-amber-100'
                                : 'bg-cyan-900 border-cyan-500 text-cyan-100'
                            }`}
                          >
                            {item.severity || 'Alert'}
                          </span>
                          <span className="text-xs text-slate-300 font-mono font-bold tracking-wide">{item.time}</span>
                        </div>
                        <p className="text-xs sm:text-[13px] leading-relaxed font-mono font-bold text-white tracking-wide">{item.text}</p>
                      </div>

                      <button
                        onClick={() => removeNotification(item.id)}
                        className="text-slate-400 hover:text-white hover:bg-slate-800/80 rounded p-1 transition-colors"
                        title="Dismiss alert"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-slate-300 text-xs font-mono font-bold">
                    All security incident queues clear.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Critical Badge */}
        <button
          onClick={toggleLockdown}
          title={lockdownMode ? 'Disengage Emergency Lockdown' : 'Engage Emergency Lockdown'}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-colors cursor-pointer border ${
            lockdownMode
              ? 'bg-rose-950 border-rose-500 text-rose-300 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.3)]'
              : 'bg-[#241416] hover:bg-rose-950/70 border-rose-800 text-rose-300 shadow-sm'
          }`}
        >
          {lockdownMode ? 'LOCKED' : 'CRITICAL'}
        </button>

        {/* Organization / Tenant Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsTenantOpen(!isTenantOpen);
              setIsProfileOpen(false);
              setIsNotificationOpen(false);
              setIsDiagnosticsOpen(false);
            }}
            title={
              isAdmin()
                ? 'Select Active Organization / Tenant Enclave'
                : `Bound to ${currentTenant?.shortName} (Restricted)`
            }
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-xs transition-all ${
              isAdmin()
                ? 'bg-[#121620] hover:bg-[#18202C] border-cyan-500/50 hover:border-cyan-400 text-slate-100 shadow-sm'
                : 'bg-[#15171D] border-amber-600/60 text-slate-200 cursor-pointer shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2">
              <Building2 className={`w-4 h-4 ${isAdmin() ? 'text-cyan-400' : 'text-amber-400'}`} />
              <div className="text-left hidden md:block">
                <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider leading-none">
                  TENANT
                </div>
                <div className="text-xs font-extrabold text-white leading-tight mt-0.5 max-w-[130px] truncate">
                  {currentTenant?.shortName || 'Global'}
                </div>
              </div>
            </div>
            {isAdmin() ? (
              <ChevronDown className="w-3.5 h-3.5 text-cyan-400 ml-0.5" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-amber-400 ml-0.5" title="Tenant Bound" />
            )}
          </button>

          {/* Tenant Dropdown Menu */}
          {isTenantOpen && (
            <div className="absolute right-0 top-full mt-2 w-84 sm:w-[420px] rounded-xl bg-[#0B0F17] border border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.2)] p-4 space-y-3 font-mono text-xs z-[60] animate-in fade-in zoom-in-95 duration-150">
              
              {/* Header */}
              <div className="p-3 rounded-lg bg-[#141C2B] border border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-500/60 flex items-center justify-center text-cyan-300">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold text-white text-xs sm:text-sm tracking-wide">
                      MULTI-TENANT ENCLAVE
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Logical & Cryptographic Segregation
                    </div>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  isAdmin()
                    ? 'bg-cyan-950/80 text-cyan-300 border-cyan-600'
                    : 'bg-amber-950/80 text-amber-300 border-amber-600'
                }`}>
                  {isAdmin() ? 'ADMIN ACCESS' : 'RESTRICTED'}
                </span>
              </div>

              {/* Warning if non-admin */}
              {!isAdmin() && (
                <div className="p-2.5 rounded-lg bg-[#201518] border border-rose-800 text-rose-300 text-[11px] flex items-start gap-2">
                  <Lock className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">TENANT ACCESS RESTRICTED:</span> Logged in as non-administrator (<span className="text-white font-bold">{user?.name}</span>). Cross-tenant switching is restricted to Administrator (<span className="text-cyan-300">SYS_ROOT_01</span>).
                  </div>
                </div>
              )}

              {/* Tenants list */}
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {tenants.map(t => {
                  const isActive = activeTenant === t.id;
                  const canSelect = isAdmin() || user?.tenantId === t.id;

                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        if (canSelect) {
                          switchTenant(t.id);
                          setIsTenantOpen(false);
                        }
                      }}
                      disabled={!canSelect}
                      className={`w-full p-2.5 rounded-lg border text-left transition-all ${
                        isActive
                          ? 'bg-[#152338] border-cyan-500 shadow-sm'
                          : canSelect
                          ? 'bg-[#12161E] hover:bg-[#18202E] border-slate-800 hover:border-slate-700'
                          : 'bg-[#111317]/60 border-slate-900 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`} />
                          <span className={`font-bold text-xs sm:text-sm ${isActive ? 'text-white' : 'text-slate-200'}`}>
                            {t.name}
                          </span>
                        </div>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-500">
                            ACTIVE
                          </span>
                        )}
                        {!canSelect && (
                          <span className="flex items-center gap-1 text-[10px] text-amber-400 font-bold">
                            <Lock className="w-3 h-3" />
                            LOCKED
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-slate-800/60 font-mono">
                        <span className="truncate">ENCLAVE: <span className="text-cyan-300 font-bold">{t.enclaveId}</span></span>
                        <span className="text-slate-400">{t.compliance}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Cryptographic Assurance Footer */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  AES-256-GCM Isolation Verified
                </span>
                <span className="font-bold text-slate-300">Zero Cross-Tenant Leakage</span>
              </div>

            </div>
          )}
        </div>

        {/* Operator Profile Block & Dropdown Menu */}
        <div className="relative">
          <div
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsTenantOpen(false);
              setIsNotificationOpen(false);
              setIsDiagnosticsOpen(false);
            }}
            className="flex items-center gap-2 pl-3 border-l border-cyber-border/80 cursor-pointer group hover:opacity-90 transition-opacity"
          >
            <div className="text-right hidden xl:block font-mono">
              <div className="text-xs text-white font-extrabold leading-tight group-hover:text-cyan-300 transition-colors">
                {user?.name || 'Administrator'}
              </div>
              <div className="text-[11px] text-cyan-300 font-bold leading-tight mt-0.5">
                {user?.role || 'SYS_ROOT_01'}
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-[#141C2B] border border-cyan-500/40 group-hover:border-cyan-400 flex items-center justify-center text-cyan-400 font-mono font-bold text-xs overflow-hidden transition-all shadow-sm">
              <div className="w-full h-full bg-gradient-to-tr from-cyan-900 via-slate-800 to-indigo-900 flex items-center justify-center">
                <User className="w-4 h-4 text-cyan-300" />
              </div>
            </div>
          </div>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-96 rounded-xl bg-[#0B0F17] border border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.2)] p-5 space-y-3.5 font-mono text-xs z-[60] animate-in fade-in zoom-in-95 duration-150">
              
              {/* Operator Identity Banner */}
              <div className="p-3.5 rounded-lg bg-[#141C2B] border border-slate-700 space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-300 font-bold text-base shadow-sm">
                    <User className="w-5 h-5 text-cyan-300" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-extrabold text-white text-sm sm:text-base truncate tracking-wide">
                      {user?.name || 'Administrator'}
                    </div>
                    <div className="text-xs text-cyan-300 font-extrabold truncate tracking-wide">
                      {user?.role || 'SYS_ROOT_01'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-[13px] pt-2.5 border-t border-slate-700/80">
                  <span className="text-white font-bold tracking-wide">Clearance:</span>
                  <span className="text-cyan-300 font-extrabold tracking-wide">{user?.clearance || 'TS/SCI CYBER-OPS'}</span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-[13px]">
                  <span className="text-white font-bold tracking-wide">Tenant Scope:</span>
                  <span className="text-emerald-400 font-extrabold tracking-wide">{currentTenant?.shortName}</span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-[13px]">
                  <span className="text-white font-bold tracking-wide">Enclave Status:</span>
                  <span className="flex items-center gap-1.5 text-emerald-400 font-extrabold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    ONLINE
                  </span>
                </div>
              </div>

              {/* Menu Actions */}
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-200 hover:text-white hover:bg-[#151D2A] border border-transparent hover:border-slate-700 transition-all text-left group"
                >
                  <User className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <div>
                    <div className="text-xs sm:text-sm font-extrabold text-white group-hover:text-cyan-300 tracking-wide">Profile Settings</div>
                    <div className="text-xs text-slate-200 font-medium">Credentials & Enclave Key</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-200 hover:text-white hover:bg-[#151D2A] border border-transparent hover:border-slate-700 transition-all text-left group"
                >
                  <Settings className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <div>
                    <div className="text-xs sm:text-sm font-extrabold text-white group-hover:text-cyan-300 tracking-wide">System Settings</div>
                    <div className="text-xs text-slate-200 font-medium">SOC Heuristics & Rules</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('telemetry');
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-200 hover:text-white hover:bg-[#151D2A] border border-transparent hover:border-slate-700 transition-all text-left group"
                >
                  <Terminal className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <div>
                    <div className="text-xs sm:text-sm font-extrabold text-white group-hover:text-cyan-300 tracking-wide">SOC Audit Logs</div>
                    <div className="text-xs text-slate-200 font-medium">Kernel Syslog Traces</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('support');
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-200 hover:text-white hover:bg-[#151D2A] border border-transparent hover:border-slate-700 transition-all text-left group"
                >
                  <LifeBuoy className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <div>
                    <div className="text-xs sm:text-sm font-extrabold text-white group-hover:text-cyan-300 tracking-wide">Operations Support</div>
                    <div className="text-xs text-slate-200 font-medium">Helpdesk & Incident Queue</div>
                  </div>
                </button>
              </div>

              {/* Demo Role Switcher Section for RBAC Verification */}
              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider px-1">
                  RBAC SIMULATOR (SECURITY TESTING)
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      setUser({
                        name: 'Administrator',
                        role: 'SYS_ROOT_01',
                        clearance: 'TS/SCI CYBER-OPS',
                        email: 'admin.root@aegis.defense.net',
                        avatar: 'AD',
                        tenantId: 'all',
                        isAdmin: true,
                        isLoggedIn: true
                      });
                      switchTenant('all');
                      setIsProfileOpen(false);
                    }}
                    className={`px-2 py-1.5 rounded text-[10px] font-bold border transition-colors ${
                      isAdmin()
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-500'
                        : 'bg-[#12161E] text-slate-300 border-slate-700 hover:text-white'
                    }`}
                  >
                    [ADMIN: ROOT]
                  </button>
                  <button
                    onClick={() => {
                      setUser({
                        name: 'SecOps Analyst',
                        role: 'FinTech SOC Operator',
                        clearance: 'SECRET / PCI-DSS',
                        email: 'analyst.fintech@client-a.com',
                        avatar: 'FA',
                        tenantId: 'fintech',
                        isAdmin: false,
                        isLoggedIn: true
                      });
                      switchTenant('fintech');
                      setIsProfileOpen(false);
                    }}
                    className={`px-2 py-1.5 rounded text-[10px] font-bold border transition-colors ${
                      !isAdmin() && user?.tenantId === 'fintech'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                        : 'bg-[#12161E] text-slate-300 border-slate-700 hover:text-white'
                    }`}
                  >
                    [FINTECH ONLY]
                  </button>
                </div>
              </div>

              {/* Sign Out Button */}
              <div className="pt-2 border-t border-slate-700">
                <button
                  onClick={() => {
                    logout();
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-rose-300 hover:text-white hover:bg-rose-950/70 border border-transparent hover:border-rose-800 transition-all text-left group"
                >
                  <LogOut className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <div>
                    <div className="text-xs sm:text-sm font-extrabold text-rose-300 group-hover:text-white tracking-wide">Sign Out</div>
                    <div className="text-xs text-rose-200/90 font-medium">Terminate session & lock terminal</div>
                  </div>
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </header>
  );
}

