import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Key,
  Copy,
  Check,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Ban,
  Plus,
  Eye,
  EyeOff,
  Terminal,
  Code,
  AlertTriangle,
  Lock,
  Building2,
  Server,
  RefreshCw,
  Search,
  Filter,
  Clock,
  Activity,
  X
} from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';

export default function APIIntegrationView() {
  const {
    apiKeys,
    generateApiKey,
    revokeApiKey,
    deleteApiKey,
    activeTenant,
    tenants,
    user,
    isAdmin,
    addSyslog
  } = useSecurity();

  const isUserAdmin = isAdmin(user);

  // Active tenant object
  const currentTenantObj = useMemo(() => {
    return tenants.find(t => t.id === activeTenant) || tenants[0];
  }, [tenants, activeTenant]);

  // Filtered keys based on context:
  // If user is Admin:
  //   - If activeTenant === 'all', show Master Key + all tenant keys (grouped/listed)
  //   - If specific tenant selected, show Master Key (top authority) + keys for that tenant
  // If user is Non-Admin (tenant role):
  //   - Show ONLY keys for their assigned tenant (strictly isolated)
  const tenantFilteredKeys = useMemo(() => {
    if (!isUserAdmin) {
      const boundTenant = user.tenantId || 'fintech';
      return apiKeys.filter(k => !k.isMaster && k.tenantId === boundTenant);
    }

    if (activeTenant === 'all') {
      return apiKeys.filter(k => !k.isMaster);
    }

    return apiKeys.filter(k => !k.isMaster && k.tenantId === activeTenant);
  }, [apiKeys, isUserAdmin, activeTenant, user]);

  // Master key
  const masterKey = useMemo(() => {
    return apiKeys.find(k => k.isMaster);
  }, [apiKeys]);

  // UI States
  const [copiedKeyId, setCopiedKeyId] = useState(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [revealedKeys, setRevealedKeys] = useState({});
  const [revealMaster, setRevealMaster] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'REVOKED'
  const [searchKeyQuery, setSearchKeyQuery] = useState('');
  const [activeCodeTab, setActiveCodeTab] = useState('python'); // 'python' | 'node' | 'curl'
  const [selectedKeyForSnippet, setSelectedKeyForSnippet] = useState(null);

  // Key Generation Modal State
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyRateLimit, setNewKeyRateLimit] = useState('5,000 req/s');
  const [newKeyTenantId, setNewKeyTenantId] = useState(
    !isUserAdmin ? (user.tenantId || 'fintech') : (activeTenant === 'all' ? 'fintech' : activeTenant)
  );

  // The key to use in the code integration playground
  const activeSnippetKey = useMemo(() => {
    if (selectedKeyForSnippet) {
      const found = apiKeys.find(k => k.id === selectedKeyForSnippet);
      if (found) {
        // Master key can only be used if in global account of administrator
        if (found.isMaster) {
          if (isUserAdmin && activeTenant === 'all') {
            return found.token;
          }
        } else {
          return found.token;
        }
      }
    }
    // Default to first active tenant key
    const activeTenantKey = tenantFilteredKeys.find(k => k.status === 'ACTIVE');
    if (activeTenantKey) return activeTenantKey.token;
    // Master key fallback is strictly limited to Global Account of Administrator
    if (isUserAdmin && activeTenant === 'all' && masterKey) return masterKey.token;
    return 'aegis_live_token_placeholder';
  }, [selectedKeyForSnippet, apiKeys, tenantFilteredKeys, isUserAdmin, activeTenant, masterKey]);

  // Filter keys by status & search
  const displayedTenantKeys = useMemo(() => {
    return tenantFilteredKeys.filter(k => {
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && k.status === 'ACTIVE') ||
        (statusFilter === 'REVOKED' && k.status === 'REVOKED');
      const matchesSearch =
        searchKeyQuery.trim() === '' ||
        k.name.toLowerCase().includes(searchKeyQuery.toLowerCase()) ||
        k.token.toLowerCase().includes(searchKeyQuery.toLowerCase()) ||
        k.enclaveId.toLowerCase().includes(searchKeyQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [tenantFilteredKeys, statusFilter, searchKeyQuery]);

  // Copy handler with clipboard
  const handleCopy = (text, id) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    setCopiedKeyId(id);
    addSyslog('INFO', 'api_gateway', `API credential copied to operator clipboard [${id}].`);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleCopySnippet = (snippetText) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(snippetText);
    }
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const toggleReveal = (keyId) => {
    setRevealedKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const maskToken = (token) => {
    if (!token) return '';
    if (token.length <= 14) return '••••••••••••';
    return token.slice(0, 10) + '••••••••••••••••' + token.slice(-4);
  };

  // Submit Key Generation
  const handleCreateKey = (e) => {
    e.preventDefault();
    const effectiveTenant = !isUserAdmin
      ? (user.tenantId || 'fintech')
      : newKeyTenantId;

    const res = generateApiKey({
      name: newKeyName,
      rateLimit: newKeyRateLimit,
      targetTenantId: effectiveTenant
    });

    if (res?.success) {
      setIsGenerateModalOpen(false);
      setNewKeyName('');
      setSelectedKeyForSnippet(res.key.id);
    }
  };

  // Open modal with current tenant preset
  const openGenerateModal = () => {
    const defaultTenant = !isUserAdmin
      ? (user.tenantId || 'fintech')
      : (activeTenant === 'all' ? 'fintech' : activeTenant);
    setNewKeyTenantId(defaultTenant);
    setNewKeyName('');
    setNewKeyRateLimit('5,000 req/s');
    setIsGenerateModalOpen(true);
  };

  // Code snippets
  const pythonSnippet = `import requests

def inspect_prompt(user_input: str) -> bool:
    """
    Submits prompt to Aegis Sentinel AST inspection engine.
    Returns True if ALLOWED, False if quarantined / blocked.
    """
    response = requests.post(
        "https://api.aegisguard.io/v1/intercept",
        headers={
            "Authorization": "Bearer ${activeSnippetKey}",
            "Content-Type": "application/json"
        },
        json={
            "prompt": user_input,
            "model": "aegis-sentinel-v4",
            "enclave": "${currentTenantObj?.enclaveId || 'ENC-ROOT-00'}"
        },
        timeout=1.5
    )
    result = response.json()
    return result.get("verdict") == "ALLOWED"`;

  const nodeSnippet = `import axios from 'axios';

export async function inspectPrompt(userInput: string): Promise<boolean> {
  const { data } = await axios.post(
    'https://api.aegisguard.io/v1/intercept',
    {
      prompt: userInput,
      model: 'aegis-sentinel-v4',
      enclave: '${currentTenantObj?.enclaveId || 'ENC-ROOT-00'}'
    },
    {
      headers: {
        'Authorization': 'Bearer ${activeSnippetKey}',
        'Content-Type': 'application/json'
      },
      timeout: 1500
    }
  );
  return data.verdict === 'ALLOWED';
}`;

  const curlSnippet = `curl -X POST "https://api.aegisguard.io/v1/intercept" \\
  -H "Authorization: Bearer ${activeSnippetKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Evaluate system boundary integrity",
    "model": "aegis-sentinel-v4",
    "enclave": "${currentTenantObj?.enclaveId || 'ENC-ROOT-00'}"
  }'`;

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      
      {/* View Header with Context Badge */}
      <div className="p-4 rounded-xl bg-[#0D0F14] border border-cyber-border shadow-cyber-card flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <Boxes className="w-5 h-5 text-cyan-400 flex-shrink-0" />
            <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider">
              Aegis Sentinel API & Credential Enclave
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950/80 text-cyan-300 border border-cyan-800 font-bold">
              GATEWAY v1.4
            </span>
          </div>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 font-medium font-sans">
            Cryptographic token lifecycle management, reverse proxy hooks, and multi-tenant pipeline authorization.
          </p>
        </div>

        {/* Isolation Context Badge */}
        <div className="flex flex-wrap items-center gap-2">
          {isUserAdmin && activeTenant === 'all' ? (
            <div className="px-3 py-1.5 rounded-lg bg-cyan-950/70 border border-cyan-500/50 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <div className="text-left">
                <span className="text-[10px] block text-cyan-400 font-bold uppercase tracking-wider">
                  GLOBAL ADMINISTRATOR ACCOUNT
                </span>
                <span className="text-xs text-slate-100 font-bold">
                  Root Master Authority (All Enclaves)
                </span>
              </div>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-500/50 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <div className="text-left">
                <span className="text-[10px] block text-emerald-400 font-bold uppercase tracking-wider">
                  CLIENT ACCOUNT CONTEXT
                </span>
                <span className="text-xs text-slate-100 font-bold">
                  {currentTenantObj.name} [{currentTenantObj.enclaveId}]
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 1: MASTER KEY (ONLY VISIBLE IN GLOBAL ACCOUNT OF ADMINISTRATOR) */}
      {isUserAdmin && activeTenant === 'all' && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#0E1522] via-[#0D121B] to-[#0A0D13] border-2 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.12)] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-slate-800 gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-400/60 flex items-center justify-center text-cyan-300">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm tracking-wide">
                    {masterKey ? masterKey.name : 'Aegis Sentinel Root Master Authority Key'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-500/70">
                    MASTER KEY (ROOT AUTHORITY)
                  </span>
                </div>
                <span className="text-[11px] text-slate-300 block font-sans">
                  Permanent global authorization credential. Unrestricted cross-tenant SIEM ingestion and firewall policy override.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-black/60 border border-slate-700 text-cyan-300 text-[11px] font-bold">
                RATE LIMIT: UNLIMITED
              </span>
              <span className="px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-[11px] font-bold">
                STATUS: ACTIVE (PROTECTED)
              </span>
            </div>
          </div>

          {/* Master Token Display */}
          <div className="p-3.5 rounded-lg bg-[#07090D] border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold mb-1">
                <span>ROOT TOKEN (SHA-256 SIGNED):</span>
                <span className="text-cyan-400 font-mono">[ENCLAVE: ALL-ROOT-00]</span>
              </div>
              <div className="text-white font-mono font-bold text-sm select-all tracking-wider break-all">
                {revealMaster ? masterKey?.token : maskToken(masterKey?.token)}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setRevealMaster(!revealMaster)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 font-semibold transition-colors"
                title={revealMaster ? 'Mask Token' : 'Reveal Token'}
              >
                {revealMaster ? <EyeOff className="w-3.5 h-3.5 text-cyan-300" /> : <Eye className="w-3.5 h-3.5 text-slate-300" />}
                <span>{revealMaster ? 'Hide' : 'Reveal'}</span>
              </button>

              <button
                onClick={() => masterKey && handleCopy(masterKey.token, 'master')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#082F38] hover:bg-[#0C4A57] text-cyan-200 hover:text-cyan-100 border border-cyan-500/60 font-bold transition-colors shadow-sm"
              >
                {copiedKeyId === 'master' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKeyId === 'master' ? 'Copied' : 'Copy Master Key'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: TENANT API KEY MANAGEMENT (UNLIMITED GENERATION, REVOKE, DELETE) */}
      <div className="p-4 rounded-xl bg-[#0D0F14] border border-cyber-border shadow-cyber-card space-y-4">
        
        {/* Sub-header with Title, Stats, and Generate Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-sm sm:text-base tracking-wide uppercase">
                {isUserAdmin && activeTenant === 'all'
                  ? 'All Tenant Isolated API Keys'
                  : `${currentTenantObj.shortName} API Keys`}
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-slate-300 border border-slate-700 font-bold">
                {displayedTenantKeys.length} Total
              </span>
            </div>
            <p className="text-slate-300 text-xs mt-0.5 font-sans">
              Tenants can generate unlimited isolated API keys for microservices, reverse proxies, and LLM applications. Revoked or deleted keys can be re-issued at any time.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Generate Key Button */}
            <button
              onClick={openGenerateModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-[#082F38] to-[#0A3E4A] hover:from-[#0C4A57] hover:to-[#0E5B6C] text-cyan-200 hover:text-white border border-cyan-400/70 font-bold text-xs shadow-md transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 text-cyan-300" />
              <span>Generate New API Key</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-[#080A0E] p-1 rounded-lg border border-slate-800">
            {['ALL', 'ACTIVE', 'REVOKED'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded text-[11px] font-bold transition-colors ${
                  statusFilter === status
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by name, token, or enclave..."
              value={searchKeyQuery}
              onChange={(e) => setSearchKeyQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#080A0E] border border-slate-800 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* API Keys List */}
        <div className="space-y-3">
          {displayedTenantKeys.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#090B10] border border-dashed border-slate-800 text-center space-y-3">
              <Key className="w-8 h-8 mx-auto text-slate-600" />
              <div className="text-slate-300 text-sm font-bold">
                No API keys found matching the current filter.
              </div>
              <p className="text-slate-500 text-xs max-w-md mx-auto font-sans">
                You can generate as many API keys as required for your microservices and edge proxies. All keys are cryptographically partitioned.
              </p>
              <button
                onClick={openGenerateModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#082F38] text-cyan-300 hover:text-white border border-cyan-500 font-bold text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Generate First Key</span>
              </button>
            </div>
          ) : (
            displayedTenantKeys.map((keyItem) => {
              const isRevealed = !!revealedKeys[keyItem.id];
              const isSelected = selectedKeyForSnippet === keyItem.id;
              const isRevoked = keyItem.status === 'REVOKED';

              // Find tenant details
              const itemTenant = tenants.find(t => t.id === keyItem.tenantId) || currentTenantObj;

              return (
                <div
                  key={keyItem.id}
                  className={`p-3.5 rounded-xl transition-all border ${
                    isSelected
                      ? 'bg-[#101724] border-cyan-500/70 shadow-sm'
                      : isRevoked
                      ? 'bg-[#0B0D12]/70 border-rose-950/60 opacity-80'
                      : 'bg-[#10141C] border-slate-800/90 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    
                    {/* Left: Key Meta */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-white text-sm tracking-wide">
                          {keyItem.name}
                        </span>

                        {/* Status Badge */}
                        {isRevoked ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800/80 flex items-center gap-1">
                            <Ban className="w-3 h-3 text-rose-400" />
                            <span>REVOKED</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/80 flex items-center gap-1">
                            <Activity className="w-3 h-3 text-emerald-400" />
                            <span>ACTIVE</span>
                          </span>
                        )}

                        {/* Tenant Enclave Tag */}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${itemTenant.badgeClass || 'bg-slate-900 text-slate-300 border-slate-700'}`}>
                          {itemTenant.shortName} [{keyItem.enclaveId}]
                        </span>

                        {/* Rate Limit Tag */}
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900/90 text-slate-300 border border-slate-800 font-mono">
                          {keyItem.rateLimit}
                        </span>
                      </div>

                      {/* Token Value Display */}
                      <div className="flex items-center gap-2 pt-1 font-mono">
                        <span className="text-slate-400 text-xs font-semibold">TOKEN:</span>
                        <span className={`text-xs sm:text-sm font-bold tracking-wider select-all break-all ${
                          isRevoked ? 'text-slate-400 line-through' : 'text-cyan-200'
                        }`}>
                          {isRevealed ? keyItem.token : maskToken(keyItem.token)}
                        </span>
                      </div>

                      {/* Timestamps */}
                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-sans">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>Created: {keyItem.createdAt}</span>
                        </span>
                        <span>Last Ingress: <strong className="text-slate-300">{keyItem.lastUsed}</strong></span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-wrap items-center gap-2 flex-shrink-0 pt-2 lg:pt-0">
                      {/* Select for code snippet */}
                      {!isRevoked && (
                        <button
                          onClick={() => setSelectedKeyForSnippet(keyItem.id)}
                          className={`px-2.5 py-1.5 rounded text-xs font-bold transition-colors border ${
                            isSelected
                              ? 'bg-cyan-950 text-cyan-300 border-cyan-500'
                              : 'bg-slate-900 text-slate-300 hover:text-white border-slate-800'
                          }`}
                          title="Use in Code Playground"
                        >
                          {isSelected ? 'Selected in Hook' : 'Use in Hook'}
                        </button>
                      )}

                      {/* Reveal Toggle */}
                      <button
                        onClick={() => toggleReveal(keyItem.id)}
                        className="p-1.5 rounded bg-[#151A24] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                        title={isRevealed ? 'Mask Token' : 'Reveal Token'}
                      >
                        {isRevealed ? <EyeOff className="w-4 h-4 text-cyan-300" /> : <Eye className="w-4 h-4 text-slate-300" />}
                      </button>

                      {/* Copy Button */}
                      <button
                        onClick={() => handleCopy(keyItem.token, keyItem.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#18202E] hover:bg-cyan-950 text-slate-100 hover:text-cyan-300 border border-slate-700 text-xs font-bold transition-colors"
                        title="Copy API Token"
                      >
                        {copiedKeyId === keyItem.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedKeyId === keyItem.id ? 'Copied' : 'Copy'}</span>
                      </button>

                      {/* Revoke Button (only if active) */}
                      {!isRevoked && (
                        <button
                          onClick={() => revokeApiKey(keyItem.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-rose-950/40 hover:bg-rose-950 text-rose-300 hover:text-rose-100 border border-rose-900/70 text-xs font-bold transition-colors"
                          title="Revoke Token (Blocks traffic immediately)"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Revoke</span>
                        </button>
                      )}

                      {/* Delete Button */}
                      <button
                        onClick={() => deleteApiKey(keyItem.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-900/80 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-800 text-xs font-semibold transition-colors"
                        title="Permanently Delete Key"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* SECTION 3: CODE INTEGRATION PLAYGROUND & ENDPOINTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Code Integration Hook (7 Cols) */}
        <div className="lg:col-span-7 p-4 rounded-xl bg-[#0D0F14] border border-cyber-border shadow-cyber-card space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-slate-800 gap-2">
            <div>
              <span className="font-bold text-white text-sm block">Integration Hook Playground</span>
              <span className="text-[11px] text-slate-400 font-sans">
                Active Token: <strong className="text-cyan-300 font-mono">{activeSnippetKey.slice(0, 16)}...</strong>
              </span>
            </div>

            {/* Language Switcher Tabs */}
            <div className="flex items-center gap-1 bg-[#080A0E] p-1 rounded-lg border border-slate-800">
              {[
                { id: 'python', label: 'Python (OpenAI)' },
                { id: 'node', label: 'Node.js (TypeScript)' },
                { id: 'curl', label: 'cURL' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCodeTab(tab.id)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                    activeCodeTab === tab.id
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Snippet Viewer */}
          <div className="relative">
            <pre className="p-3.5 rounded-lg bg-black/95 border border-slate-800 text-cyan-200 overflow-x-auto text-xs sm:text-sm leading-relaxed font-mono">
              {activeCodeTab === 'python' && pythonSnippet}
              {activeCodeTab === 'node' && nodeSnippet}
              {activeCodeTab === 'curl' && curlSnippet}
            </pre>

            {/* Copy Snippet Button */}
            <button
              onClick={() => {
                const text =
                  activeCodeTab === 'python'
                    ? pythonSnippet
                    : activeCodeTab === 'node'
                    ? nodeSnippet
                    : curlSnippet;
                handleCopySnippet(text);
              }}
              className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#18202E]/90 hover:bg-cyan-950 text-slate-200 hover:text-cyan-300 border border-slate-700 text-xs font-bold transition-colors backdrop-blur-sm shadow-md"
            >
              {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSnippet ? 'Snippet Copied' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Active Endpoints & Webhooks (5 Cols) */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-[#0D0F14] border border-cyber-border shadow-cyber-card space-y-3">
          <div className="pb-2.5 border-b border-slate-800 font-bold text-white text-sm flex items-center justify-between">
            <span>Production Gateway Endpoints</span>
            <span className="text-[11px] text-emerald-400 font-bold">ALL SERVICES OPERATIONAL</span>
          </div>

          <div className="space-y-2.5 text-xs sm:text-sm">
            <div className="p-3.5 rounded-lg bg-[#12161E] border border-cyber-border hover:border-slate-700 transition-colors">
              <div className="flex justify-between items-center mb-1">
                <span className="text-emerald-400 font-bold text-sm">POST /v1/intercept</span>
                <span className="text-xs text-slate-300 font-semibold font-mono">0.42 ms avg</span>
              </div>
              <span className="text-slate-200 font-medium font-sans">
                Deep packet AST prompt inspection hook. Enforces strict zero-leakage token boundaries.
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-[#12161E] border border-cyber-border hover:border-slate-700 transition-colors">
              <div className="flex justify-between items-center mb-1">
                <span className="text-emerald-400 font-bold text-sm">POST /v1/quarantine</span>
                <span className="text-xs text-slate-300 font-semibold font-mono">BGP Synced</span>
              </div>
              <span className="text-slate-200 font-medium font-sans">
                Dynamic node sandboxing, forensic memory dumps, and rogue session termination.
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-[#12161E] border border-cyber-border hover:border-slate-700 transition-colors">
              <div className="flex justify-between items-center mb-1">
                <span className="text-cyan-300 font-bold text-sm">GET /v1/telemetry/feed</span>
                <span className="text-xs text-slate-300 font-semibold font-mono">SSE Stream</span>
              </div>
              <span className="text-slate-200 font-medium font-sans">
                Real-time incident event stream and vector metrics formatted for SIEM / Splunk.
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* GENERATE NEW API KEY MODAL (UNLIMITED GENERATION) */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-xl bg-[#0D1017] border-2 border-cyan-500/70 shadow-[0_0_30px_rgba(6,182,212,0.25)] p-5 space-y-4 animate-in fade-in zoom-in duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base uppercase tracking-wider">
                  Generate New API Key
                </h3>
              </div>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateKey} className="space-y-4">
              
              {/* Key Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wide block">
                  Key Name / Microservice Identifier
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Payment Gateway Ingress Proxy, LangChain Hook"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#07090D] border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm font-sans focus:outline-none focus:border-cyan-400"
                />
                <span className="text-[11px] text-slate-400 font-sans block">
                  Give this key a descriptive name to identify its integration node.
                </span>
              </div>

              {/* Rate Limit Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wide block">
                  Rate Limit Quota
                </label>
                <select
                  value={newKeyRateLimit}
                  onChange={(e) => setNewKeyRateLimit(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#07090D] border border-slate-700 text-white text-xs sm:text-sm font-sans focus:outline-none focus:border-cyan-400"
                >
                  <option value="1,000 req/s">1,000 req/s (Sandbox / Staging)</option>
                  <option value="3,500 req/s">3,500 req/s (Standard Telemetry)</option>
                  <option value="5,000 req/s">5,000 req/s (Production High Availability)</option>
                  <option value="10,000 req/s">10,000 req/s (Ultra-Low Latency Core)</option>
                  {isUserAdmin && activeTenant === 'all' && <option value="UNLIMITED / PRIORITY 0">Unlimited (Root Admin Only)</option>}
                </select>
              </div>

              {/* Organization / Tenant Enclave */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wide block">
                  Target Tenant Enclave
                </label>
                {isUserAdmin ? (
                  <select
                    value={newKeyTenantId}
                    onChange={(e) => setNewKeyTenantId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-[#07090D] border border-slate-700 text-white text-xs sm:text-sm font-sans focus:outline-none focus:border-cyan-400"
                  >
                    {tenants.filter(t => t.id !== 'all').map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} [{t.enclaveId}]
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-2.5 rounded-lg bg-[#07090D] border border-slate-800 text-slate-200 text-xs flex items-center justify-between">
                    <span className="font-bold text-emerald-400">{currentTenantObj.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono">ENCLAVE: {currentTenantObj.enclaveId}</span>
                  </div>
                )}
                <span className="text-[11px] text-slate-400 font-sans block">
                  Keys are cryptographically sealed to this enclave. Tokens cannot be used across different tenant boundaries.
                </span>
              </div>

              {/* Info Note on Unlimited Keys */}
              <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/60 text-cyan-200 text-[11px] font-sans flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Unlimited Keys Supported:</strong> You can generate, revoke, or delete as many keys as your infrastructure demands. Revoked keys are retained in audit logs.
                </span>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-black font-bold text-xs transition-all shadow-md active:scale-95"
                >
                  Generate & Activate Key
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
