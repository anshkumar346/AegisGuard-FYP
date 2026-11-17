import React, { useState } from 'react';
import {
  Settings,
  User,
  Shield,
  Cpu,
  Bell,
  Sliders,
  Key,
  Copy,
  Check,
  RotateCcw,
  Save,
  Lock,
  Eye,
  EyeOff,
  Server,
  Activity,
  Terminal,
  Volume2,
  VolumeX,
  FileText
} from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';

export default function SettingsView() {
  const {
    user,
    setUser,
    socSettings,
    updateSocSettings,
    addSyslog,
    isAdmin,
    activeTenant,
    tenants
  } = useSecurity();

  const [activeTab, setActiveTab] = useState('profile');
  const [saveStatus, setSaveStatus] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Form states initialized from context
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Administrator',
    role: user?.role || 'SYS_ROOT_01',
    clearance: user?.clearance || 'TS/SCI CYBER-OPS',
    email: user?.email || 'admin.root@aegis.defense.net',
    sessionTimeout: '30m'
  });

  const [defenseForm, setDefenseForm] = useState({
    autoQuarantine: socSettings?.autoQuarantine ?? true,
    dpiLevel: socSettings?.dpiLevel || 'Paranoid',
    rateLimitThreshold: socSettings?.rateLimitThreshold || 2500,
    bgpNullRoute: socSettings?.bgpNullRoute ?? true,
    honeyTokenTraps: socSettings?.honeyTokenTraps ?? true
  });

  const [astForm, setAstForm] = useState({
    astSensitivity: socSettings?.astSensitivity || 85,
    multiAgentConsensus: socSettings?.multiAgentConsensus || 'strict',
    obfuscationDecoder: socSettings?.obfuscationDecoder ?? true,
    jailbreakDictSync: socSettings?.jailbreakDictSync ?? true
  });

  const [alertsForm, setAlertsForm] = useState({
    siemWebhook: socSettings?.siemWebhook || 'https://siem.internal.aegis/v1/stream',
    syslogProtocol: socSettings?.syslogProtocol || 'TLS (Encrypted)',
    audioAlarms: socSettings?.audioAlarms ?? true
  });

  const [displayForm, setDisplayForm] = useState({
    scanlines: socSettings?.scanlines ?? true,
    telemetryPulseRate: socSettings?.telemetryPulseRate || 3,
    defaultLandingTab: socSettings?.defaultLandingTab || 'prompts-lab'
  });

  const [apiKey, setApiKey] = useState('aegis_sec_live_998f48bc29a041f8872e391b');

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRegenerateKey = () => {
    if (!isAdmin()) {
      setSaveError(`ACCESS DENIED: Master SOC API key regeneration requires Administrator clearance.`);
      setTimeout(() => setSaveError(''), 4500);
      return;
    }
    const chars = '0123456789abcdef';
    let res = 'aegis_sec_live_';
    for (let i = 0; i < 24; i++) {
      res += chars[Math.floor(Math.random() * chars.length)];
    }
    setApiKey(res);
    addSyslog('WARN', 'auth_key', 'Master SOC API access token regenerated.');
  };

  const handleSave = (e) => {
    e?.preventDefault();
    if (activeTab !== 'profile' && !isAdmin()) {
      setSaveError(`ACCESS DENIED: Committing system-wide SOC defense rules requires Administrator privileges. Operator '${user?.name}' is restricted.`);
      setTimeout(() => setSaveError(''), 4500);
      return;
    }

    setUser(prev => ({
      ...prev,
      name: profileForm.name,
      role: profileForm.role,
      clearance: profileForm.clearance,
      email: profileForm.email
    }));

    updateSocSettings({
      ...defenseForm,
      ...astForm,
      ...alertsForm,
      ...displayForm
    });

    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 3000);
  };

  const handleReset = () => {
    if (!isAdmin()) {
      setSaveError(`ACCESS DENIED: Resetting global SOC configuration requires Administrator privileges.`);
      setTimeout(() => setSaveError(''), 4500);
      return;
    }
    setProfileForm({
      name: 'Administrator',
      role: 'SYS_ROOT_01',
      clearance: 'TS/SCI CYBER-OPS',
      email: 'admin.root@aegis.defense.net',
      sessionTimeout: '30m'
    });
    setDefenseForm({
      autoQuarantine: true,
      dpiLevel: 'Paranoid',
      rateLimitThreshold: 2500,
      bgpNullRoute: true,
      honeyTokenTraps: true
    });
    setAstForm({
      astSensitivity: 85,
      multiAgentConsensus: 'strict',
      obfuscationDecoder: true,
      jailbreakDictSync: true
    });
    setAlertsForm({
      siemWebhook: 'https://siem.internal.aegis/v1/stream',
      syslogProtocol: 'TLS (Encrypted)',
      audioAlarms: true
    });
    setDisplayForm({
      scanlines: true,
      telemetryPulseRate: 3,
      defaultLandingTab: 'prompts-lab'
    });
    addSyslog('INFO', 'soc_config', 'System configuration reset to default parameters.');
  };

  const tabs = [
    { id: 'profile', label: 'Operator Profile', icon: User },
    { id: 'defense', label: 'SOC Defense Policies', icon: Shield },
    { id: 'ast', label: 'AI & AST Guardrails', icon: Cpu },
    { id: 'alerts', label: 'SIEM & Alert Streams', icon: Bell },
    { id: 'display', label: 'System & Display', icon: Sliders }
  ];

  return (
    <div className="space-y-6 font-mono text-xs sm:text-sm select-none">
      
      {/* Top Banner Header */}
      <div className="p-4 rounded-xl bg-[#0D0F14] border border-cyber-border shadow-cyber-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-cyan-950/70 border border-cyan-700/60 flex items-center justify-center text-cyan-400">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wider uppercase font-mono">
                SOC_CONFIGURATION // SYSTEM_PREFERENCES
              </h2>
              <span className="px-2.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-xs text-cyan-300 font-bold">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono font-medium mt-1">
              Operator Node: {user?.role || 'SYS_ROOT_01'} // Clearance: {user?.clearance || 'TS/SCI CYBER-OPS'}
            </p>
          </div>
        </div>

        {/* Global Save and Reset Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 font-mono text-xs sm:text-sm font-semibold transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-cyan-500 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs sm:text-sm font-bold tracking-wider transition-all shadow-cyber-cyan"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>

      {/* Save Success Banner */}
      {saveStatus && (
        <div className="p-3.5 rounded-lg bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs sm:text-sm font-mono font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>[SUCCESS] Configuration parameters securely encrypted and committed to Aegis vault.</span>
        </div>
      )}

      {/* Access Denied Warning Banner ("aur kisi ko na kuch kare") */}
      {saveError && (
        <div className="p-3.5 rounded-lg bg-[#251518] border border-rose-500 text-rose-200 text-xs sm:text-sm font-mono font-bold flex items-center gap-2 animate-in fade-in">
          <Lock className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Main Container: Tabs on Left + Content on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Navigation Tabs */}
        <div className="lg:col-span-3 space-y-1">
          <div className="p-2 rounded-xl bg-[#0D0F14] border border-cyber-border shadow-cyber-card space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-xs sm:text-sm font-mono transition-all text-left ${
                    isActive
                      ? 'bg-cyan-950/80 border border-cyan-500 text-white font-bold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/60 font-semibold'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className="tracking-wide">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick System Telemetry Card */}
          <div className="p-4 rounded-xl bg-[#0D0F14] border border-cyber-border shadow-cyber-card space-y-2.5 mt-4 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-300 pb-2 border-b border-slate-800">
              <span className="font-bold text-white uppercase text-xs">Vault Integrity</span>
              <span className="text-emerald-400 font-extrabold text-xs">100% SECURE</span>
            </div>
            <div className="space-y-1.5 text-slate-300 text-xs">
              <div className="flex justify-between">
                <span>Cryptographic Digest:</span>
                <span className="text-white font-bold">SHA-512-HSM</span>
              </div>
              <div className="flex justify-between">
                <span>Last Config Sync:</span>
                <span className="text-cyan-300 font-bold">Just Now</span>
              </div>
              <div className="flex justify-between">
                <span>Kernel Ring:</span>
                <span className="text-white font-bold">RING-0 DEFENSE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tab View Panels */}
        <div className="lg:col-span-9">
          
          {/* TAB 1: Operator Profile & Credentials */}
          {activeTab === 'profile' && (
            <div className="p-5 sm:p-6 rounded-xl bg-[#0D0F14] border border-cyber-border shadow-cyber-card space-y-6">
              <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider font-mono">
                    OPERATOR_PROFILE & ACCESS_CREDENTIALS
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                    Manage active security operator identity and master cryptographic access keys.
                  </p>
                </div>
                <div className="px-3 py-1 rounded bg-emerald-950/90 border border-emerald-600 text-emerald-300 text-xs font-bold font-mono">
                  SESSION VERIFIED
                </div>
              </div>

              {/* Profile Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm text-slate-200 font-bold font-mono">Operator Display Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#12161E] border border-slate-700 focus:border-cyan-400 text-white text-xs sm:text-sm font-semibold font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm text-slate-200 font-bold font-mono">Call-Sign / Role ID</label>
                  <input
                    type="text"
                    value={profileForm.role}
                    onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#12161E] border border-slate-700 focus:border-cyan-400 text-white text-xs sm:text-sm font-semibold font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm text-slate-200 font-bold font-mono">Security Clearance</label>
                  <select
                    value={profileForm.clearance}
                    onChange={(e) => setProfileForm({ ...profileForm, clearance: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#12161E] border border-slate-700 focus:border-cyan-400 text-white text-xs sm:text-sm font-semibold font-mono focus:outline-none"
                  >
                    <option value="TS/SCI CYBER-OPS">TS/SCI CYBER-OPS (Level 5 - Unrestricted)</option>
                    <option value="SECRET REDACTED">SECRET REDACTED (Level 4)</option>
                    <option value="CONFIDENTIAL SOC">CONFIDENTIAL SOC (Level 3)</option>
                    <option value="READ-ONLY AUDIT">READ-ONLY AUDIT (Level 1)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm text-slate-200 font-bold font-mono">Secure Email Enclave</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#12161E] border border-slate-700 focus:border-cyan-400 text-white text-xs sm:text-sm font-semibold font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Master API Token Section - Only visible in Global Account of Administrator */}
              {isAdmin() && activeTenant === 'all' && (
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-cyan-400" />
                      <span className="font-bold text-white text-xs sm:text-sm">SOC Master Access Token</span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium mt-1">
                      Used for programmatic telemetry ingestion and automated containment orchestration across all enclaves.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3.5 py-2.5 rounded-lg bg-[#12161E] border border-slate-700 text-xs sm:text-sm text-white font-mono flex items-center justify-between font-bold">
                      <span>{apiKeyVisible ? apiKey : '••••••••••••••••••••••••••••••••'}</span>
                      <button
                        type="button"
                        onClick={() => setApiKeyVisible(!apiKeyVisible)}
                        className="text-slate-300 hover:text-white"
                      >
                        {apiKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <button
                      onClick={handleCopyKey}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-100 font-mono text-xs sm:text-sm font-bold transition-colors"
                    >
                      {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={handleRegenerateKey}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-rose-900 bg-rose-950/50 hover:bg-rose-900/70 text-rose-200 font-mono text-xs sm:text-sm font-bold transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Regenerate</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 2FA & Session Controls */}
              <div className="pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg border border-slate-700 bg-[#11141B] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs sm:text-sm">Two-Factor Auth (FIDO2)</span>
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold border border-emerald-600 bg-emerald-950 text-emerald-300">
                      ENFORCED
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    Hardware YubiKey token bound to SYS_ROOT_01 enclave.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-700 bg-[#11141B] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs sm:text-sm">Session Inactivity Lock</span>
                    <select
                      value={profileForm.sessionTimeout}
                      onChange={(e) => setProfileForm({ ...profileForm, sessionTimeout: e.target.value })}
                      className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm font-mono font-semibold focus:outline-none"
                    >
                      <option value="15m">15 Minutes</option>
                      <option value="30m">30 Minutes</option>
                      <option value="1h">1 Hour</option>
                      <option value="8h">8 Hours</option>
                    </select>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    Auto-engages Emergency Terminal Lockdown upon idle timeout.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SOC Defense Policies */}
          {activeTab === 'defense' && (
            <div className="p-5 sm:p-6 rounded-xl bg-[#0D0F14] border border-cyber-border shadow-cyber-card space-y-6">
              <div className="pb-3 border-b border-slate-800">
                <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider font-mono">
                  SOC_DEFENSE_POLICIES & PERIMETER_RULES
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                  Configure real-time automated quarantine, rate limiting, and BGP null-route triggers.
                </p>
              </div>

              {/* Policy Toggles */}
              <div className="space-y-3.5">
                <div className="p-4 rounded-lg border border-slate-700 bg-[#11141B] flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-white text-xs sm:text-sm">Autonomous Cell Quarantine</div>
                    <p className="text-xs text-slate-300 font-medium mt-1">
                      Instantly seals suspicious workloads into the Isolation Vault when anomaly score exceeds 80%.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDefenseForm({ ...defenseForm, autoQuarantine: !defenseForm.autoQuarantine })}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      defenseForm.autoQuarantine ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out ${
                        defenseForm.autoQuarantine ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-4 rounded-lg border border-slate-700 bg-[#11141B] flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-white text-xs sm:text-sm">BGP Null-Route Auto-Enforcement</div>
                    <p className="text-xs text-slate-300 font-medium mt-1">
                      Automatically propagates blackhole routes to edge gateway routers on high-confidence volumetric floods.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDefenseForm({ ...defenseForm, bgpNullRoute: !defenseForm.bgpNullRoute })}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      defenseForm.bgpNullRoute ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out ${
                        defenseForm.bgpNullRoute ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-4 rounded-lg border border-slate-700 bg-[#11141B] flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-white text-xs sm:text-sm">HoneyToken Decoy Cluster Traps</div>
                    <p className="text-xs text-slate-300 font-medium mt-1">
                      Maintains synthetic database credentials in the DMZ. Any access triggers immediate attacker triangulation.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDefenseForm({ ...defenseForm, honeyTokenTraps: !defenseForm.honeyTokenTraps })}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      defenseForm.honeyTokenTraps ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out ${
                        defenseForm.honeyTokenTraps ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Sliders and Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm text-slate-200 font-bold font-mono">
                    Deep Packet Inspection (DPI) Heuristic Mode
                  </label>
                  <select
                    value={defenseForm.dpiLevel}
                    onChange={(e) => setDefenseForm({ ...defenseForm, dpiLevel: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#12161E] border border-slate-700 focus:border-cyan-400 text-white text-xs sm:text-sm font-semibold font-mono focus:outline-none"
                  >
                    <option value="Standard">Standard Heuristic (Low Latency &lt; 0.5ms)</option>
                    <option value="Aggressive">Aggressive Deep Scan (AST + Payload Parsing)</option>
                    <option value="Paranoid">Paranoid Full Assembly (Zero-Tolerance Sandbox)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs sm:text-sm text-slate-200 font-mono font-bold">
                    <span>Edge Rate Limit Threshold</span>
                    <span className="text-cyan-300 font-extrabold">{defenseForm.rateLimitThreshold} req/sec</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="10000"
                    step="250"
                    value={defenseForm.rateLimitThreshold}
                    onChange={(e) => setDefenseForm({ ...defenseForm, rateLimitThreshold: Number(e.target.value) })}
                    className="w-full accent-cyan-400"
                  />
                  <span className="text-xs text-slate-300 font-medium block">
                    Connections exceeding this rate trigger temporary IP rate-shedding.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AI & AST Guardrails */}
          {activeTab === 'ast' && (
            <div className="p-5 sm:p-6 rounded-xl bg-[#0D0F14] border border-cyber-border shadow-cyber-card space-y-6">
              <div className="pb-3 border-b border-slate-800">
                <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider font-mono">
                  LLM_GUARDRAILS & AST_DECOMPOSITION_PARAMETERS
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                  Calibrate prompt syntax analyzers, multi-agent arbitration thresholds, and jailbreak detectors.
                </p>
              </div>

              {/* AST Sensitivity Slider */}
              <div className="p-4 rounded-lg border border-slate-700 bg-[#11141B] space-y-2.5">
                <div className="flex items-center justify-between text-xs sm:text-sm font-mono">
                  <span className="font-bold text-white">AST Anomaly Sensitivity Threshold</span>
                  <span className="text-cyan-300 font-extrabold text-sm">{astForm.astSensitivity}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="99"
                  value={astForm.astSensitivity}
                  onChange={(e) => setAstForm({ ...astForm, astSensitivity: Number(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
                <div className="flex justify-between text-xs text-slate-300 font-mono font-medium">
                  <span>50% (Permissive / Relaxed)</span>
                  <span>85% (Optimal Aegis Baseline)</span>
                  <span>99% (Paranoid Zero-Override)</span>
                </div>
              </div>

              {/* Multi-Agent Strategy */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm text-slate-200 font-bold font-mono">
                  Multi-Agent Consensus Arbitration Strategy
                </label>
                <select
                  value={astForm.multiAgentConsensus}
                  onChange={(e) => setAstForm({ ...astForm, multiAgentConsensus: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#12161E] border border-slate-700 focus:border-cyan-400 text-white text-xs sm:text-sm font-semibold font-mono focus:outline-none"
                >
                  <option value="strict">Strict Consensus (All 3 nodes must agree: Logic, Semantic, Policy)</option>
                  <option value="majority">Majority Consensus (2 of 3 nodes pass threshold)</option>
                  <option value="veto">Single Veto (If any single node detects violation, trigger REJECTED)</option>
                </select>
              </div>

              {/* Checkbox Toggles */}
              <div className="space-y-3.5 pt-2">
                <div className="p-4 rounded-lg border border-slate-700 bg-[#11141B] flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-white text-xs sm:text-sm">Obfuscation & Character Encoding Normalizer</div>
                    <p className="text-xs text-slate-300 font-medium mt-1">
                      Decodes Base64, Hex, Leetspeak, and Unicode homoglyphs before token AST evaluation.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAstForm({ ...astForm, obfuscationDecoder: !astForm.obfuscationDecoder })}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      astForm.obfuscationDecoder ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out ${
                        astForm.obfuscationDecoder ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-4 rounded-lg border border-slate-700 bg-[#11141B] flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-white text-xs sm:text-sm">Jailbreak Heuristic Vector Sync</div>
                    <p className="text-xs text-slate-300 font-medium mt-1">
                      Subscribes to live MITRE ATLAS & OWASP LLM Top-10 threat pattern feeds.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAstForm({ ...astForm, jailbreakDictSync: !astForm.jailbreakDictSync })}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      astForm.jailbreakDictSync ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out ${
                        astForm.jailbreakDictSync ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SIEM & Alert Streams */}
          {activeTab === 'alerts' && (
            <div className="p-5 sm:p-6 rounded-xl bg-[#0D0F14] border border-cyber-border shadow-cyber-card space-y-6">
              <div className="pb-3 border-b border-slate-800">
                <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider font-mono">
                  SIEM_FORWARDING & LIVE_ALERT_STREAMS
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                  Route telemetry to external Splunk, Elastic, or Sentinel security clusters.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm text-slate-200 font-bold font-mono">SIEM Webhook Integration Endpoint</label>
                  <input
                    type="url"
                    value={alertsForm.siemWebhook}
                    onChange={(e) => setAlertsForm({ ...alertsForm, siemWebhook: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#12161E] border border-slate-700 focus:border-cyan-400 text-white text-xs sm:text-sm font-semibold font-mono focus:outline-none"
                  />
                  <span className="text-xs text-slate-300 font-medium block">
                    All incidents with Severity = Critical will be dispatched via JSON over HTTPS.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm text-slate-200 font-bold font-mono">Syslog Streaming Protocol</label>
                  <select
                    value={alertsForm.syslogProtocol}
                    onChange={(e) => setAlertsForm({ ...alertsForm, syslogProtocol: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#12161E] border border-slate-700 focus:border-cyan-400 text-white text-xs sm:text-sm font-semibold font-mono focus:outline-none"
                  >
                    <option value="TLS (Encrypted)">TLS RFC-5425 (Port 6514 - Mutual Certificate Auth)</option>
                    <option value="TCP (Reliable)">TCP RFC-5424 (Port 514 - Guaranteed Delivery)</option>
                    <option value="UDP (High Speed)">UDP RFC-3164 (Port 514 - High Throughput)</option>
                  </select>
                </div>

                <div className="p-4 rounded-lg border border-slate-700 bg-[#11141B] flex items-center justify-between gap-4 pt-3">
                  <div>
                    <div className="font-bold text-white text-xs sm:text-sm">Audio Alarm on Critical Incident Intercept</div>
                    <p className="text-xs text-slate-300 font-medium mt-1">
                      Plays low-frequency alert chime through SOC terminal speakers during DEFCON 1 breaches.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAlertsForm({ ...alertsForm, audioAlarms: !alertsForm.audioAlarms })}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      alertsForm.audioAlarms ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out ${
                        alertsForm.audioAlarms ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: System & Display */}
          {activeTab === 'display' && (
            <div className="p-5 sm:p-6 rounded-xl bg-[#0D0F14] border border-cyber-border shadow-cyber-card space-y-6">
              <div className="pb-3 border-b border-slate-800">
                <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider font-mono">
                  SYSTEM_ENVIRONMENT & DISPLAY_PREFERENCES
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                  Tune telemetry polling speed, terminal appearance, and default viewports.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-slate-700 bg-[#11141B] flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-white text-xs sm:text-sm">CRT Scanline Hologram Simulation</div>
                    <p className="text-xs text-slate-300 font-medium mt-1">
                      Renders subtle horizontal cyber-scanline grid overlays for retro SOC console immersion.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDisplayForm({ ...displayForm, scanlines: !displayForm.scanlines })}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      displayForm.scanlines ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out ${
                        displayForm.scanlines ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm text-slate-200 font-bold font-mono">Real-Time Telemetry Pulse Frequency</label>
                    <select
                      value={displayForm.telemetryPulseRate}
                      onChange={(e) => setDisplayForm({ ...displayForm, telemetryPulseRate: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#12161E] border border-slate-700 focus:border-cyan-400 text-white text-xs sm:text-sm font-semibold font-mono focus:outline-none"
                    >
                      <option value={1}>1.0 Second (Real-time Wire Speed)</option>
                      <option value={3}>3.0 Seconds (Standard SOC Balanced)</option>
                      <option value={5}>5.0 Seconds (Low Network Footprint)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm text-slate-200 font-bold font-mono">Default SOC Landing Viewport</label>
                    <select
                      value={displayForm.defaultLandingTab}
                      onChange={(e) => setDisplayForm({ ...displayForm, defaultLandingTab: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#12161E] border border-slate-700 focus:border-cyan-400 text-white text-xs sm:text-sm font-semibold font-mono focus:outline-none"
                    >
                      <option value="dashboard">SOC Dashboard (Overview Matrix)</option>
                      <option value="prompts-lab">Prompts Lab & AST Parser</option>
                      <option value="threat-map">Global Threat Map (Defcon)</option>
                      <option value="telemetry">Live Telemetry & Syslog Terminal</option>
                      <option value="isolation-vault">Isolation Vault Enclave</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
