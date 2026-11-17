import React, { useState, useMemo } from 'react';
import {
  Globe,
  Radio,
  Zap,
  Target,
  Layers,
  Crosshair,
  ShieldAlert,
  Server,
  Activity,
  Maximize2,
  ShieldCheck,
  Lock
} from 'lucide-react';
import {
  THREAT_MAP_INTEL,
  NODE_HEALTH_DATA,
  RECENT_TRACES
} from '../../data/mockSecurityData';
import { useSecurity } from '../../context/SecurityContext';
import FitVerseChatbot from './FitVerseChatbot';

export default function ThreatMapView() {
  const { addSyslog, activeTenant, tenants, isAdmin } = useSecurity();
  const [intel, setIntel] = useState(THREAT_MAP_INTEL);
  const [activeLayer, setActiveLayer] = useState('ALL');

  const currentTenant = tenants?.find(t => t.id === activeTenant) || tenants?.[0];

  const filteredIntel = useMemo(() => {
    if (activeTenant === 'all') return intel;
    return intel.filter(item => item.tenantId === activeTenant);
  }, [intel, activeTenant]);

  const handleIsolateNode = (ip) => {
    addSyslog(
      'CRIT',
      'bgp_nullroute',
      `[${currentTenant?.code || 'TENANT'}] BGP blackhole initiated for ${ip}. Ingress dropped.`,
      activeTenant === 'all' ? 'global' : activeTenant
    );
    setIntel(prev => prev.map(item => item.ip === ip ? { ...item, status: 'ISOLATED' } : item));
  };

  return (
    <div className="relative w-full h-[calc(100vh-6.5rem)] rounded-2xl bg-[#090B10] border border-cyber-border overflow-hidden select-none font-sans">
      
      {/* Background Cyber Map Canvas (SVG World Map with Attack Arcs) */}
      <div className="absolute inset-0 bg-[#090B10]">
        <svg className="w-full h-full opacity-70" viewBox="0 0 1200 700">
          <defs>
            <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#090B10" stopOpacity="0" />
            </radialGradient>
            <filter id="arcGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines */}
          <rect width="1200" height="700" fill="url(#mapGlow)" />
          {Array.from({ length: 14 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={i * 50}
              x2="1200"
              y2={i * 50}
              stroke="#131A26"
              strokeWidth="0.8"
            />
          ))}
          {Array.from({ length: 24 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={i * 50}
              y1="0"
              x2={i * 50}
              y2="700"
              stroke="#131A26"
              strokeWidth="0.8"
            />
          ))}

          {/* World Continents Schematic Shapes */}
          <g fill="#141C2B" stroke="#1E2A3E" strokeWidth="1">
            {/* North America */}
            <path d="M 180,140 Q 240,110 320,130 Q 360,190 310,260 Q 240,310 200,280 Q 150,220 180,140 Z" />
            {/* South America */}
            <path d="M 280,340 Q 340,360 360,420 Q 330,520 280,560 Q 250,480 260,390 Z" />
            {/* Europe */}
            <path d="M 520,130 Q 610,120 630,170 Q 580,240 520,220 Q 480,170 520,130 Z" />
            {/* Africa */}
            <path d="M 530,260 Q 620,260 640,340 Q 610,480 560,500 Q 500,420 500,320 Z" />
            {/* Asia */}
            <path d="M 660,120 Q 860,110 930,180 Q 890,320 780,340 Q 670,280 660,180 Z" />
            {/* Australia */}
            <path d="M 880,440 Q 980,430 990,500 Q 940,560 880,520 Z" />
          </g>

          {/* Attack Trajectory Arcs */}
          {/* Arc 1: Shenzhen to Frankfurt */}
          <path
            d="M 860,260 Q 700,80 560,180"
            fill="none"
            stroke="#EF4444"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            filter="url(#arcGlow)"
          >
            <animate attributeName="stroke-dashoffset" values="0;-100" dur="2s" repeatCount="indefinite" />
          </path>
          {/* Arc 2: Moscow to London */}
          <path
            d="M 680,160 Q 600,100 520,160"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2"
            strokeDasharray="4 4"
            filter="url(#arcGlow)"
          >
            <animate attributeName="stroke-dashoffset" values="0;-50" dur="2.5s" repeatCount="indefinite" />
          </path>
          {/* Arc 3: Tor/US to Frankfurt */}
          <path
            d="M 280,210 Q 420,100 560,180"
            fill="none"
            stroke="#00F0FF"
            strokeWidth="1.5"
            strokeDasharray="5 5"
          />

          {/* Node Points on Map */}
          {/* Shenzhen */}
          <circle cx="860" cy="260" r="5" fill="#EF4444" filter="url(#arcGlow)" />
          <circle cx="860" cy="260" r="14" fill="none" stroke="#EF4444" strokeWidth="1" className="animate-ping" />
          
          {/* Moscow */}
          <circle cx="680" cy="160" r="5" fill="#F59E0B" />
          
          {/* Frankfurt DC */}
          <circle cx="560" cy="180" r="6" fill="#00F0FF" filter="url(#arcGlow)" />
          <circle cx="560" cy="180" r="16" fill="none" stroke="#00F0FF" strokeWidth="1" className="animate-ping" />

          {/* US East */}
          <circle cx="280" cy="210" r="5" fill="#10B981" />
        </svg>
      </div>

      {/* Top Center: Tenant Isolation & Cryptographic Boundary Badge */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#0D1017]/95 backdrop-blur-md border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)] font-mono text-xs">
        <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">TENANT ISOLATION:</span>
          <span className="px-2 py-0.5 rounded font-extrabold text-cyan-300 bg-cyan-950/80 border border-cyan-600 text-[11px]">
            {currentTenant?.shortName || 'Global Enterprise'}
          </span>
          <span className="text-slate-400 hidden sm:inline">|</span>
          <span className="text-slate-300 hidden sm:inline text-[11px]">ENCLAVE: <span className="text-emerald-400 font-bold">{currentTenant?.enclaveId}</span></span>
          <span className="text-slate-400 hidden lg:inline">|</span>
          <span className="text-slate-400 hidden lg:inline text-[11px] font-mono">{currentTenant?.cryptoKey}</span>
        </div>
      </div>

      {/* Floating Card Top-Left: Source Intel */}
      <div className="absolute top-16 sm:top-4 left-4 z-20 w-80 sm:w-84 space-y-3 font-mono text-xs">
        <div className="p-3.5 rounded-xl bg-[#0D0F14]/90 backdrop-blur-md border border-cyber-border shadow-xl">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-slate-100 text-sm">Source Intel</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                LIVE
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                {filteredIntel.length} TARGETS
              </span>
            </div>
          </div>

          {/* Target List */}
          <div className="space-y-3 max-h-[calc(100vh-22rem)] overflow-y-auto pr-1">
            {filteredIntel.length === 0 ? (
              <div className="p-4 rounded-lg bg-[#12161E] border border-slate-800 text-center space-y-2">
                <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto" />
                <div className="text-xs text-white font-bold">Perimeter Clear</div>
                <div className="text-[11px] text-slate-300">
                  No active threat vectors isolated for {currentTenant?.shortName}.
                </div>
              </div>
            ) : (
              filteredIntel.map((item) => (
                <div
                  key={item.ip}
                  className={`p-3.5 rounded-xl bg-[#12161E]/95 border ${item.border} space-y-2.5 shadow-sm`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-white text-sm font-mono block">{item.ip}</span>
                      {item.tenantName && (
                        <span className="text-[10px] text-cyan-300 font-bold tracking-wide">
                          [{item.tenantName}]
                        </span>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${item.badge}`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-200 font-mono font-semibold">
                    <div>GEO: {item.geo}</div>
                    <div>ASN: {item.asn}</div>
                    <div>VEC: {item.vec}</div>
                    <div className="truncate" title={item.tgt}>TGT: {item.tgt}</div>
                  </div>

                  {/* Risk Progress */}
                  <div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full ${item.riskBar}`} style={{ width: `${item.risk}%` }} />
                    </div>
                    <div className="text-right text-xs text-slate-200 mt-1 font-bold">
                      {item.risk}% RISK
                    </div>
                  </div>

                  {item.status !== 'ISOLATED' && (
                    <button
                      onClick={() => handleIsolateNode(item.ip)}
                      className="w-full py-1.5 rounded-lg bg-[#201416] hover:bg-rose-950 border border-rose-800 text-rose-300 text-xs font-bold uppercase transition-colors"
                    >
                      ISOLATE NODE
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Floating Card Top-Right: Node Health */}
      <div className="absolute top-4 right-4 z-20 w-84 font-mono text-xs hidden sm:block">
        <div className="p-4 rounded-xl bg-[#0D0F14]/95 backdrop-blur-md border border-cyber-border shadow-2xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white text-sm">Node Health</span>
            </div>
            <span className="text-xs text-slate-300 font-semibold">Global Cluster</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-[#12161E] border border-cyber-border">
            <div>
              <span className="text-xs text-slate-300 font-bold block">GLOBAL UPTIME</span>
              <span className="text-2xl font-black text-white font-mono">99.9%</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>

          {/* Node List */}
          <div className="space-y-2">
            {NODE_HEALTH_DATA.map((node) => (
              <div
                key={node.name}
                className="p-2.5 rounded-lg bg-[#12161E]/90 border border-cyber-border flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white">{node.name}</div>
                  <div className="text-xs text-slate-300 font-medium">
                    Load: {node.load} | Temp: {node.temp}
                  </div>
                </div>
                <span className={`font-bold text-xs ${node.color}`}>
                  {node.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Card Bottom-Left: Recent Traces */}
      <div className="absolute bottom-4 left-4 z-20 w-88 font-mono text-xs">
        <div className="p-3.5 rounded-xl bg-[#0D0F14]/95 backdrop-blur-md border border-cyber-border shadow-2xl space-y-2">
          <div className="text-white font-bold uppercase tracking-wider text-xs pb-1.5 border-b border-slate-800 flex items-center justify-between">
            <span>Recent Traces</span>
            <span className="text-cyan-400 text-[11px] font-bold">STREAM</span>
          </div>
          {RECENT_TRACES.map((trace, i) => (
            <div key={i} className="text-slate-200 truncate leading-relaxed text-xs font-medium">
              {trace}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Center Map Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 p-1 rounded-xl bg-[#0D0F14]/90 backdrop-blur-md border border-cyber-border shadow-xl font-mono text-xs">
        <button
          onClick={() => addSyslog('INFO', 'map', 'Map perspective recentered on Frankfurt Hub.')}
          className="px-3 py-1.5 rounded-lg hover:bg-cyber-surface text-slate-300 hover:text-cyan-400 transition-colors"
        >
          RECENTER
        </button>
        <button
          onClick={() => addSyslog('INFO', 'map', 'Multi-layer BGP topology toggled.')}
          className="px-3 py-1.5 rounded-lg hover:bg-cyber-surface text-slate-300 hover:text-cyan-400 transition-colors"
        >
          LAYERS
        </button>
        <button
          onClick={() => addSyslog('WARN', 'map', 'Emergency manual routing override active.')}
          className="px-3 py-1.5 rounded-lg hover:bg-rose-950 text-rose-400 hover:text-rose-300 transition-colors"
        >
          OVERRIDE
        </button>
      </div>

      {/* Floating Chatbot */}
      <FitVerseChatbot mode="floating" />

    </div>
  );
}
