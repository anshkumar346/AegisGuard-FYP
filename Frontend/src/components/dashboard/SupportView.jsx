import React, { useState } from 'react';
import {
  HelpCircle,
  LifeBuoy,
  Send,
  Ticket,
  FileText,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  Search,
  Download,
  Shield,
  Clock,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Layers,
  Radio,
  UserCheck,
  Check,
  RotateCw
} from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';

export default function SupportView() {
  const { user, addSyslog } = useSecurity();

  // Tab: 'tickets' | 'playbooks'
  const [activeTab, setActiveTab] = useState('tickets');

  // New Ticket Form State
  const [subject, setSubject] = useState('');
  const [severity, setSeverity] = useState('CRITICAL');
  const [affectedAsset, setAffectedAsset] = useState('LLM Guardrail & AST Parser');
  const [details, setDetails] = useState('');
  const [attachLogs, setAttachLogs] = useState(true);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search in Playbooks
  const [playbookQuery, setPlaybookQuery] = useState('');
  const [expandedPlaybook, setExpandedPlaybook] = useState(1);

  // Active Tickets Queue State
  const [ticketsList, setTicketsList] = useState([
    {
      id: 'INC-8812',
      title: 'Prompt Injection Bypass Attempt in FitVerse Gym Bot',
      severity: 'CRITICAL',
      asset: 'LLM Guardrail & AST Parser',
      assignee: 'NetOps Team Bravo',
      status: 'INVESTIGATING',
      time: '12m ago',
      operator: 'SYS_ROOT_01'
    },
    {
      id: 'INC-8794',
      title: 'Cell ALPHA_01 Zero-Day Containment Breach Attempt',
      severity: 'CRITICAL',
      asset: 'Isolation Vault (Sector 76)',
      assignee: 'SecOps Core Liaison',
      status: 'CONTAINED',
      time: '45m ago',
      operator: 'SYS_ROOT_01'
    },
    {
      id: 'INC-8740',
      title: 'BGP Route Flapping on Frankfurt Gateway Hub',
      severity: 'HIGH',
      asset: 'BGP Edge Gateways & Subnets',
      assignee: 'Tier-2 Edge NetOps',
      status: 'RESOLVED',
      time: '3h ago',
      operator: 'NET_GATE_04'
    },
    {
      id: 'INC-8702',
      title: 'SIEM Webhook TLS Mutual Handshake Latency Spike',
      severity: 'MEDIUM',
      asset: 'SIEM Telemetry & Syslog Stream',
      assignee: 'Systems Enclave Admin',
      status: 'RESOLVED',
      time: '6h ago',
      operator: 'AUDIT_SPEC_02'
    }
  ]);

  const [ticketFilter, setTicketFilter] = useState('ALL');

  const filteredTickets = ticketsList.filter(t => {
    if (ticketFilter === 'ALL') return true;
    if (ticketFilter === 'CRITICAL') return t.severity === 'CRITICAL';
    if (ticketFilter === 'ACTIVE') return t.status === 'INVESTIGATING' || t.status === 'CONTAINED';
    if (ticketFilter === 'RESOLVED') return t.status === 'RESOLVED';
    return true;
  });

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (!subject.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newId = `INC-${Math.floor(1000 + Math.random() * 9000)}`;
      const newTicket = {
        id: newId,
        title: subject,
        severity: severity,
        asset: affectedAsset,
        assignee: 'Vanguard Tier-3 NetOps',
        status: 'INVESTIGATING',
        time: 'Just now',
        operator: user?.role || 'SYS_ROOT_01'
      };

      setTicketsList([newTicket, ...ticketsList]);
      setSubmittedTicket(newTicket);
      setIsSubmitting(false);
      setSubject('');
      setDetails('');

      addSyslog('CRIT', 'support_desk', `Emergency incident ticket ${newId} dispatched to Tier-3 SOC NetOps.`);
    }, 600);
  };

  const handleDownloadDiagnostics = () => {
    const reportData = {
      system: 'Aegis Sentinel Command Center',
      version: 'v4.2.1-TS/SCI',
      timestamp: new Date().toISOString(),
      operator: user?.name || 'Administrator',
      role: user?.role || 'SYS_ROOT_01',
      clearance: user?.clearance || 'TS/SCI CYBER-OPS',
      vitals: {
        vaultIntegrity: '100% SECURE',
        activeSandboxes: 2,
        anomalySensitivity: '85%',
        rateLimitCap: '2500 req/s',
        bgpNullRoute: 'ENFORCED'
      },
      recentIncidents: ticketsList
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aegis-soc-diagnostics-${Date.now()}.json`;
    link.click();
    addSyslog('INFO', 'support_desk', 'Exported comprehensive system diagnostic core bundle.');
  };

  const PLAYBOOKS = [
    {
      id: 1,
      title: 'Prompt Injection Remediation & Dynamic AST Retuning',
      category: 'AI_GUARDRAIL',
      level: 'CRITICAL',
      steps: [
        'Engage real-time DPI packet inspection on port 443 /v1/intercept hook.',
        'Isolate malicious session tokens and dump AST tree weight distribution.',
        'Add detected semantic prompt embeddings to MITRE ATLAS threat dictionary.',
        'Trigger automated memory wipe and flush inference buffer caches.'
      ]
    },
    {
      id: 2,
      title: 'Emergency Isolation Vault Full Zero-Day Containment Purge',
      category: 'CONTAINMENT_VAULT',
      level: 'CRITICAL',
      steps: [
        'Engage physical hardware circuit breaker on sector 76 containment zone.',
        'Over-write sandbox volatile RAM storage arrays with 3-pass zeroes.',
        'Isolate compromised container network egress and sever DMZ bridge.',
        'Emit cryptographic incident manifest signed with SHA-512-HSM master digest.'
      ]
    },
    {
      id: 3,
      title: 'Mitigation of Distributed Volumetric SYN Floods with BGP Blackhole',
      category: 'NETWORK_PERIMETER',
      level: 'HIGH',
      steps: [
        'Analyze top ingress CIDR subnets exceeding 2,500 req/sec threshold.',
        'Broadcast BGP Community string 65535:666 (blackhole null-route) to Tier-1 upstream peers.',
        'Verify edge border routers drop packets at line rate with zero kernel overhead.',
        'Monitor syslog_tail.log feed for attacker IP migration to secondary targets.'
      ]
    },
    {
      id: 4,
      title: 'Hardware Security Module (HSM) Cryptographic Key Rotation',
      category: 'IDENTITY_ACCESS',
      level: 'MEDIUM',
      steps: [
        'Verify operator two-factor FIDO2 YubiKey token authentication.',
        'Generate new 256-bit entropy master key in secure enclave storage.',
        'Invalidate revoked bearer access tokens across all microservice API gateways.',
        'Confirm mutual TLS certificate synchronization across all 6 global SOC hubs.'
      ]
    }
  ];

  const filteredPlaybooks = PLAYBOOKS.filter(p =>
    p.title.toLowerCase().includes(playbookQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(playbookQuery.toLowerCase())
  );

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-950/80 border-rose-600 text-rose-300 font-extrabold';
      case 'HIGH':
        return 'bg-amber-950/80 border-amber-600 text-amber-300 font-bold';
      case 'MEDIUM':
        return 'bg-cyan-950/80 border-cyan-600 text-cyan-300 font-bold';
      default:
        return 'bg-slate-800 border-slate-600 text-slate-300 font-medium';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'INVESTIGATING':
        return 'bg-rose-950/60 border-rose-700 text-rose-400 font-bold animate-pulse';
      case 'CONTAINED':
        return 'bg-amber-950/60 border-amber-700 text-amber-300 font-bold';
      case 'RESOLVED':
        return 'bg-emerald-950/60 border-emerald-600 text-emerald-300 font-bold';
      default:
        return 'bg-slate-900 border-slate-700 text-slate-400';
    }
  };

  return (
    <div className="space-y-5 font-mono text-xs sm:text-sm select-none">
      
      {/* Top Banner Header */}
      <div className="p-4 rounded-xl bg-[#0D0F14] border border-cyber-border shadow-cyber-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-cyan-950/70 border border-cyan-700/60 flex items-center justify-center text-cyan-400 flex-shrink-0">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wider uppercase font-mono">
                AEGIS_SUPPORT // INCIDENT_OPERATIONS_DESK
              </h2>
              <span className="px-2.5 py-0.5 rounded bg-emerald-950/90 border border-emerald-600 text-xs text-emerald-300 font-bold">
                24/7 TIER-3 DISPATCH
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono font-medium mt-1">
              Operator: {user?.role || 'SYS_ROOT_01'} // Clearance: {user?.clearance || 'TS/SCI CYBER-OPS'} // Priority Escalation Active
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => addSyslog('WARN', 'hotline', 'Emergency hotline ping sent to NetOps Commander Duty Officer.')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-rose-900 bg-rose-950/50 hover:bg-rose-900/70 text-rose-200 font-mono text-xs sm:text-sm font-bold transition-colors"
          >
            <PhoneCall className="w-4 h-4 text-rose-400" />
            <span>Emergency Hotline</span>
          </button>
          <button
            onClick={handleDownloadDiagnostics}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-cyan-500 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs sm:text-sm font-bold tracking-wider transition-all shadow-cyber-cyan"
          >
            <Download className="w-4 h-4" />
            <span>Diagnostics Bundle</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0D0F14] border border-cyber-border shadow-sm">
          <div className="flex items-center justify-between text-slate-300 text-xs font-semibold mb-1">
            <span>Active Tickets</span>
            <Ticket className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {ticketsList.filter(t => t.status !== 'RESOLVED').length}
          </div>
          <div className="text-xs text-rose-400 font-bold mt-1">
            2 Critical In Progress
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0D0F14] border border-cyber-border shadow-sm">
          <div className="flex items-center justify-between text-slate-300 text-xs font-semibold mb-1">
            <span>Avg Response SLA</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-cyan-300 font-mono">
            &lt; 1.8 min
          </div>
          <div className="text-xs text-slate-300 font-medium mt-1">
            Tier-3 Rapid Escalation
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0D0F14] border border-cyber-border shadow-sm">
          <div className="flex items-center justify-between text-slate-300 text-xs font-semibold mb-1">
            <span>Global SOC Hubs</span>
            <Radio className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            06 Hubs
          </div>
          <div className="text-xs text-emerald-400 font-bold mt-1">
            100% Operational Status
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0D0F14] border border-cyber-border shadow-sm">
          <div className="flex items-center justify-between text-slate-300 text-xs font-semibold mb-1">
            <span>Clearance Enclave</span>
            <Shield className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">
            TS/SCI VETTED
          </div>
          <div className="text-xs text-slate-300 font-medium mt-1">
            Encrypted Core Channels
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column (7 cols) + Right Column (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left 7 Cols: Ticket Dispatch or Knowledge Base */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Navigation Bar inside Left Col */}
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#0D0F14] border border-cyber-border font-mono text-xs sm:text-sm">
            <button
              onClick={() => setActiveTab('tickets')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold transition-all ${
                activeTab === 'tickets'
                  ? 'bg-cyan-950/80 border border-cyan-500 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Ticket className="w-4 h-4 text-cyan-400" />
              <span>Submit Incident Ticket</span>
            </button>
            <button
              onClick={() => setActiveTab('playbooks')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold transition-all ${
                activeTab === 'playbooks'
                  ? 'bg-cyan-950/80 border border-cyan-500 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>SOC Playbooks & Manuals</span>
            </button>
          </div>

          {/* TAB 1: Dispatch New Incident Form */}
          {activeTab === 'tickets' && (
            <div className="p-5 sm:p-6 rounded-xl bg-[#0D0F14] border border-cyber-border shadow-cyber-card space-y-5">
              <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider font-mono">
                    DISPATCH_PRIORITY_INCIDENT
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                    Direct cryptographic incident routing to Tier-3 SOC engineering team.
                  </p>
                </div>
                <div className="px-2.5 py-1 rounded bg-rose-950/80 border border-rose-700 text-rose-300 text-xs font-bold font-mono">
                  SLA: &lt; 2 MIN
                </div>
              </div>

              {submittedTicket && (
                <div className="p-3.5 rounded-lg bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs sm:text-sm font-mono font-bold flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span>
                      [DISPATCHED] Incident #{submittedTicket.id} received. Assigned to {submittedTicket.assignee}.
                    </span>
                  </div>
                  <button
                    onClick={() => setSubmittedTicket(null)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm text-slate-200 font-bold font-mono">
                    Incident Summary / Vector Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Prompt Injection bypass detected on external LangChain inference proxy"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#12161E] border border-slate-700 focus:border-cyan-400 text-white text-xs sm:text-sm font-medium focus:outline-none placeholder-slate-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm text-slate-200 font-bold font-mono">
                      Priority Severity Level
                    </label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#12161E] border border-slate-700 focus:border-cyan-400 text-white text-xs sm:text-sm font-semibold focus:outline-none"
                    >
                      <option value="CRITICAL">CRITICAL (DEFCON 1 - Immediate Containment)</option>
                      <option value="HIGH">HIGH (Targeted Infiltration / Anomaly &gt; 80%)</option>
                      <option value="MEDIUM">MEDIUM (Policy Violation / Obfuscation Detected)</option>
                      <option value="LOW">LOW (General Inquiry / Heuristic Calibration)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm text-slate-200 font-bold font-mono">
                      Affected Defense Subsystem
                    </label>
                    <select
                      value={affectedAsset}
                      onChange={(e) => setAffectedAsset(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#12161E] border border-slate-700 focus:border-cyan-400 text-white text-xs sm:text-sm font-semibold focus:outline-none"
                    >
                      <option value="LLM Guardrail & AST Parser">LLM Guardrail & AST Parser</option>
                      <option value="Isolation Vault (Sector 76)">Isolation Vault (Sector 76)</option>
                      <option value="BGP Edge Gateways & Subnets">BGP Edge Gateways & Subnets</option>
                      <option value="SIEM Telemetry & Syslog Stream">SIEM Telemetry & Syslog Stream</option>
                      <option value="API Gateway v1.4">API Gateway v1.4</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm text-slate-200 font-bold font-mono">
                    Incident Forensic Context & Traces
                  </label>
                  <textarea
                    rows={4}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Enter payload dump, source IP, AST weights anomaly, or steps to reproduce the violation..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#12161E] border border-slate-700 focus:border-cyan-400 text-white text-xs sm:text-sm font-medium focus:outline-none placeholder-slate-500"
                  />
                </div>

                <div className="p-3.5 rounded-lg bg-[#12161E] border border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="attachLogs"
                      checked={attachLogs}
                      onChange={(e) => setAttachLogs(e.target.checked)}
                      className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                    />
                    <label htmlFor="attachLogs" className="text-xs text-slate-300 font-medium cursor-pointer">
                      Auto-attach kernel ring syslog snapshot & HSM diagnostic digest
                    </label>
                  </div>
                  <span className="text-xs text-cyan-300 font-bold">SHA-512 VERIFIED</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-cyan-500 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs sm:text-sm font-bold tracking-wider transition-all shadow-cyber-cyan cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'DISPATCHING TICKET...' : 'DISPATCH EMERGENCY TICKET'}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: SOC Playbooks */}
          {activeTab === 'playbooks' && (
            <div className="p-5 sm:p-6 rounded-xl bg-[#0D0F14] border border-cyber-border shadow-cyber-card space-y-5">
              <div className="pb-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider font-mono">
                    STANDARDIZED_SOC_PLAYBOOKS
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                    Step-by-step incident containment procedures vetted by Vanguard Cyber Command.
                  </p>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={playbookQuery}
                    onChange={(e) => setPlaybookQuery(e.target.value)}
                    placeholder="Search playbooks..."
                    className="w-56 pl-8 pr-3 py-1.5 rounded-lg bg-[#12161E] border border-slate-700 focus:border-cyan-400 text-white text-xs font-mono focus:outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-3">
                {filteredPlaybooks.map((playbook) => {
                  const isExpanded = expandedPlaybook === playbook.id;
                  return (
                    <div
                      key={playbook.id}
                      className="rounded-lg border border-slate-700 bg-[#12161E] overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedPlaybook(isExpanded ? null : playbook.id)}
                        className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${getSeverityBadge(playbook.level)}`}>
                            {playbook.level}
                          </span>
                          <span className="font-bold text-white text-xs sm:text-sm font-mono">
                            {playbook.title}
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 border-t border-slate-800/80 space-y-2.5 bg-black/40">
                          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                            Remediation Procedure Steps:
                          </div>
                          {playbook.steps.map((step, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                              <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                                {idx + 1}
                              </span>
                              <span className="leading-relaxed font-medium">{step}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Right 5 Cols: Active Tickets Queue & Escalation Directory */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Active Tickets Queue Card */}
          <div className="p-4 rounded-xl bg-[#0D0F14] border border-cyber-border shadow-cyber-card space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-white text-sm">Active Incident Queue</span>
              </div>
              <span className="text-xs text-slate-300 font-semibold">{filteredTickets.length} Incidents</span>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold pb-1">
              {['ALL', 'CRITICAL', 'ACTIVE', 'RESOLVED'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTicketFilter(filter)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    ticketFilter === filter
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                      : 'text-slate-400 hover:text-white bg-[#12161E] border border-slate-800'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Tickets list */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-3.5 rounded-lg bg-[#12161E] border border-slate-700 hover:border-cyan-500/60 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      {ticket.id}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${getStatusBadge(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>

                  <div className="text-xs sm:text-sm text-white font-semibold leading-snug">
                    {ticket.title}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-300 pt-1.5 border-t border-slate-800 font-medium">
                    <span>{ticket.assignee}</span>
                    <span className="text-slate-400">{ticket.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Secure Hotline & Direct Escalation Directory */}
          <div className="p-4 rounded-xl bg-[#0D0F14] border border-cyber-border shadow-cyber-card space-y-3 font-mono">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800 text-white font-bold text-sm">
              <PhoneCall className="w-4 h-4 text-rose-400" />
              <span>Secure Escalation Channels</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-lg bg-[#12161E] border border-slate-700 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-bold">Priority NetOps Bridge</span>
                  <span className="text-emerald-400 font-bold">ONLINE</span>
                </div>
                <div className="text-cyan-300 font-bold text-sm select-all">
                  +1 (800) 555-AEGIS-OPS
                </div>
                <div className="text-[11px] text-slate-400">
                  Duty Commander: Col. Vance (USCYBERCOM)
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#12161E] border border-slate-700 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-bold">Encrypted Signal Channel</span>
                  <span className="text-cyan-400 font-bold">E2EE ACTIVE</span>
                </div>
                <div className="text-white font-bold text-xs select-all">
                  #vanguard-soc-alpha-dispatch
                </div>
                <div className="text-[11px] text-slate-400">
                  Direct relay to Red/Blue Incident Handlers
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#12161E] border border-slate-700 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-bold">Gateway Round-Trip Ping</span>
                  <span className="text-emerald-400 font-bold">12 ms</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Direct fiber interconnect to Frankfurt primary cluster
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
