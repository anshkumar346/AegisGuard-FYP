import React, { useState, useMemo, useEffect } from 'react';
import {
  Radio,
  Download,
  Filter,
  RotateCw,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ShieldCheck,
  Building2,
  Lock
} from 'lucide-react';
import { TELEMETRY_ROWS, TENANTS } from '../../data/mockSecurityData';
import { useSecurity } from '../../context/SecurityContext';
import FitVerseChatbot from './FitVerseChatbot';

const PAGE_SIZE = 20;

const TENANT_EVENT_COUNTS = {
  all: 14204,
  fintech: 5120,
  healthcare: 4890,
  defense: 4194
};

const PROTOCOLS = [
  'TCP/443', 'UDP/53', 'TCP/22', 'ICMP', 'UDP/123',
  'TCP/80', 'TCP/8080', 'TCP/3389', 'UDP/4500', 'TCP/8443'
];

const BASE_IPS = [
  '185.15.22.109', '45.33.19.2', '192.168.1.105', '130.133.149.69',
  '250.16.128.150', '129.92.78.235', '16.132.154.203', '165.240.100.154',
  '76.174.23.114', '106.212.212.169', '50.96.57.224', '251.246.152.141',
  '212.102.220.236', '137.244.202.129', '198.51.100.42', '203.0.113.19',
  '82.165.197.1', '194.26.29.112', '103.251.167.20', '185.220.101.5'
];

// Generates 20 deterministic telemetry rows for any page within tenant stream
function getTelemetryPageData(page, activeTenant) {
  const rows = [];
  const startIdx = (page - 1) * PAGE_SIZE;
  const tenantTotal = TENANT_EVENT_COUNTS[activeTenant] || 14204;

  for (let i = 0; i < PAGE_SIZE; i++) {
    const globalIdx = startIdx + i;
    if (globalIdx >= tenantTotal) break;

    const rowTenantId = activeTenant === 'all'
      ? (globalIdx % 3 === 0 ? 'fintech' : globalIdx % 3 === 1 ? 'healthcare' : 'defense')
      : activeTenant;

    const tenantObj = TENANTS.find(t => t.id === rowTenantId) || TENANTS[1];

    if (activeTenant === 'all' && globalIdx < TELEMETRY_ROWS.length) {
      const baseRow = TELEMETRY_ROWS[globalIdx];
      rows.push({
        ...baseRow,
        tenantName: TENANTS.find(t => t.id === baseRow.tenantId)?.shortName || 'FinTech Corp'
      });
    } else {
      const seed = (globalIdx * 9301 + 49297) % 233280;
      const baseIp = BASE_IPS[globalIdx % BASE_IPS.length];
      const ipParts = baseIp.split('.');
      const lastOctet = ((seed + globalIdx * 3) % 250) + 1;
      const ip = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.${lastOctet}`;

      const proto = PROTOCOLS[(globalIdx * 7 + seed) % PROTOCOLS.length];
      const risk = 18 + ((seed + globalIdx * 13) % 81);

      // Base timestamp: 2023-10-27T14:32:01.042Z minus offset
      const baseTime = 1698417121042;
      const eventTime = new Date(baseTime - (globalIdx * 2850));
      const timestamp = eventTime.toISOString();

      rows.push({
        id: globalIdx + 1,
        tenantId: rowTenantId,
        tenantName: tenantObj.shortName,
        timestamp,
        ip,
        protocol: proto,
        risk
      });
    }
  }
  return rows;
}

export default function TelemetryView() {
  const { addSyslog, searchQuery, activeTenant, tenants } = useSecurity();
  const [currentPage, setCurrentPage] = useState(1);
  const [timeFilter, setTimeFilter] = useState('Last 15 Min');
  const [minRisk, setMinRisk] = useState('');
  const [ipFilter, setIpFilter] = useState('');

  const currentTenant = tenants?.find(t => t.id === activeTenant) || tenants?.[0];
  const totalEvents = TENANT_EVENT_COUNTS[activeTenant] || 14204;
  const totalPages = Math.ceil(totalEvents / PAGE_SIZE);

  // Reset page when tenant changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTenant]);

  // Fetch page data
  const pageRows = useMemo(() => {
    return getTelemetryPageData(currentPage, activeTenant);
  }, [currentPage, activeTenant]);

  // Apply in-page filters
  const filteredRows = pageRows.filter(row => {
    const matchesRisk = !minRisk || row.risk >= Number(minRisk);
    const matchesIp = !ipFilter || row.ip.includes(ipFilter);
    const matchesSearch = !searchQuery ||
      row.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.protocol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.timestamp.includes(searchQuery);
    return matchesRisk && matchesIp && matchesSearch;
  });

  const startCount = totalEvents === 0 ? 0 : ((currentPage - 1) * PAGE_SIZE) + 1;
  const endCount = Math.min(currentPage * PAGE_SIZE, totalEvents);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  const handleLastPage = () => {
    setCurrentPage(totalPages);
  };

  const handleExportCSV = () => {
    const header = 'TENANT_ID,ENCLAVE_KEY,TIMESTAMP_UTC,SOURCE_IP,PROTOCOL,INTENT_RISK\n';
    const csvContent = filteredRows.map(r => `${r.tenantId || activeTenant},${currentTenant?.enclaveId || 'GLOBAL'},${r.timestamp},${r.ip},${r.protocol},${r.risk}`).join('\n');
    const blob = new Blob([header + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aegis-telemetry-${activeTenant}-page-${currentPage}-${Date.now()}.csv`;
    link.click();
    addSyslog(
      'INFO',
      'siem_export',
      `[${currentTenant?.code || 'TENANT'}] Exported telemetry log page ${currentPage} to CSV.`,
      activeTenant === 'all' ? 'global' : activeTenant
    );
  };

  const getRiskColor = (risk) => {
    if (risk >= 80) return { bar: 'bg-[#FB7185]', text: 'text-[#FB7185]' };
    if (risk >= 60) return { bar: 'bg-[#4ADE80]', text: 'text-[#4ADE80]' };
    if (risk >= 50) return { bar: 'bg-[#22C55E]', text: 'text-[#22C55E]' };
    return { bar: 'bg-[#22D3EE]', text: 'text-[#22D3EE]' };
  };

  const getTenantBadge = (tenantId) => {
    switch (tenantId) {
      case 'fintech':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-600/80';
      case 'healthcare':
        return 'bg-indigo-950/80 text-indigo-300 border-indigo-600/80';
      case 'defense':
        return 'bg-amber-950/80 text-amber-300 border-amber-600/80';
      default:
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-600/80';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 font-sans select-none">
      
      {/* Left 8 Cols: Live Threat Telemetry Table */}
      <div className="lg:col-span-8 p-5 rounded-2xl bg-[#0D0F14] border border-cyber-border shadow-cyber-card flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full border border-cyan-500/60 flex items-center justify-center text-cyan-400">
                  <Radio className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-extrabold tracking-tight text-slate-100 font-mono">
                  Live Threat Telemetry
                </h2>
              </div>
              <p className="text-sm text-slate-300 font-mono mt-1">
                Real-time SIEM audit logs and autonomous intercept analysis.
              </p>
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#141A24] hover:bg-[#182232] border border-[#1F2B3E] text-slate-100 text-xs sm:text-sm font-mono font-bold transition-colors"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>EXPORT CSV</span>
            </button>
          </div>

          {/* Tenant Enclave Cryptographic Isolation Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 my-3 rounded-xl bg-[#10141D] border border-cyan-500/40 font-mono text-xs shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="font-bold text-slate-200 uppercase tracking-wide">
                ISOLATED ENCLAVE STREAM:
              </span>
              <span className="px-2 py-0.5 rounded font-extrabold text-cyan-300 bg-cyan-950/90 border border-cyan-500">
                {currentTenant?.name}
              </span>
            </div>

            <div className="flex items-center gap-3 text-slate-300 flex-wrap">
              <span className="text-slate-400">ENCLAVE: <span className="text-emerald-400 font-bold">{currentTenant?.enclaveId}</span></span>
              <span className="hidden md:inline text-slate-400">KEY: <span className="text-cyan-300 font-bold">{currentTenant?.cryptoKey}</span></span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[11px] font-bold border border-slate-700">
                {currentTenant?.compliance}
              </span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3 py-3 font-mono text-xs sm:text-sm text-slate-200">
            <div className="flex items-center gap-1.5 font-bold text-slate-200 text-xs uppercase tracking-wider">
              <Filter className="w-4 h-4 text-cyan-400" />
              <span>FILTERS</span>
            </div>

            <div className="flex items-center gap-1 bg-[#12161E] px-2.5 py-1.5 rounded border border-cyber-border">
              <span className="text-xs text-slate-300 font-bold">TIME:</span>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="bg-transparent text-slate-100 text-xs sm:text-sm font-semibold focus:outline-none"
              >
                <option value="Last 15 Min" className="bg-[#12161E]">Last 15 Min</option>
                <option value="Last 1 Hour" className="bg-[#12161E]">Last 1 Hour</option>
                <option value="Last 24 Hours" className="bg-[#12161E]">Last 24 Hours</option>
              </select>
            </div>

            <div className="flex items-center gap-1 bg-[#12161E] px-2.5 py-1.5 rounded border border-cyber-border">
              <span className="text-xs text-slate-300 font-bold">RISK &gt;</span>
              <input
                type="text"
                value={minRisk}
                onChange={(e) => {
                  setMinRisk(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="75"
                className="w-12 bg-transparent text-slate-100 text-xs sm:text-sm font-bold focus:outline-none font-mono"
              />
            </div>

            <div className="flex items-center gap-1 bg-[#12161E] px-2.5 py-1.5 rounded border border-cyber-border">
              <span className="text-xs text-slate-300 font-bold">IP/SUBNET:</span>
              <input
                type="text"
                value={ipFilter}
                onChange={(e) => {
                  setIpFilter(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="185.15..."
                className="w-28 bg-transparent text-slate-100 text-xs sm:text-sm font-bold focus:outline-none font-mono"
              />
            </div>

            <button
              onClick={() => {
                setMinRisk('');
                setIpFilter('');
                setCurrentPage(1);
              }}
              title="Reset Filters"
              className="p-1.5 rounded bg-[#12161E] border border-cyber-border text-slate-300 hover:text-cyan-400 transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left font-mono text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-xs text-slate-200 font-bold uppercase tracking-wider">
                  <th className="py-3">TIMESTAMP (UTC)</th>
                  <th className="py-3">ORGANIZATION / TENANT</th>
                  <th className="py-3">SOURCE IP</th>
                  <th className="py-3">PROTOCOL</th>
                  <th className="py-3 w-40">INTENT RISK</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm font-medium">
                {filteredRows.length > 0 ? (
                  filteredRows.map((row) => {
                    const style = getRiskColor(row.risk);
                    const badgeClass = getTenantBadge(row.tenantId);
                    return (
                      <tr key={row.id} className="hover:bg-[#12161E]/70 transition-colors">
                        <td className="py-3 text-slate-200">{row.timestamp}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${badgeClass}`}>
                            {row.tenantName || 'FinTech Corp'}
                          </span>
                        </td>
                        <td className="py-3 text-cyan-300 font-bold text-sm">{row.ip}</td>
                        <td className="py-3 text-slate-200 font-semibold">{row.protocol}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-7 text-right font-bold text-sm ${style.text}`}>
                              {row.risk}
                            </span>
                            <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${style.bar}`} style={{ width: `${row.risk}%` }} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-mono text-xs">
                      No isolated telemetry events match current filter parameters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-3 border-t border-slate-800 font-mono text-xs sm:text-sm text-slate-300 font-semibold">
          <div>
            Showing <span className="text-white font-bold">{startCount}</span> - <span className="text-white font-bold">{endCount}</span> of <span className="text-cyan-400 font-bold">{totalEvents.toLocaleString()}</span> isolated events for <span className="text-white font-bold">{currentTenant?.shortName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleFirstPage}
              disabled={currentPage === 1}
              title="First Page"
              className="p-1.5 rounded-lg border border-slate-700 bg-[#12161E] text-slate-300 hover:text-cyan-300 hover:border-cyan-500/70 hover:bg-[#18202F] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              title="Previous Page"
              className="p-1.5 rounded-lg border border-slate-700 bg-[#12161E] text-slate-300 hover:text-cyan-300 hover:border-cyan-500/70 hover:bg-[#18202F] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#141A24] border border-slate-700 text-white font-bold">
              <span className="text-slate-300 text-xs">Page</span>
              <span className="text-cyan-300 font-extrabold px-1">{currentPage}</span>
              <span className="text-slate-400 text-xs">/ {totalPages.toLocaleString()}</span>
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              title="Next Page"
              className="p-1.5 rounded-lg border border-slate-700 bg-[#12161E] text-slate-300 hover:text-cyan-300 hover:border-cyan-500/70 hover:bg-[#18202F] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleLastPage}
              disabled={currentPage === totalPages}
              title="Last Page"
              className="p-1.5 rounded-lg border border-slate-700 bg-[#12161E] text-slate-300 hover:text-cyan-300 hover:border-cyan-500/70 hover:bg-[#18202F] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right 4 Cols: Docked FitVerse Gym Bot */}
      <div className="lg:col-span-4">
        <FitVerseChatbot mode="docked-telemetry" />
      </div>

    </div>
  );
}
