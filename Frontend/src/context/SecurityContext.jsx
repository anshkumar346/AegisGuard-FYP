import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  TENANTS,
  INITIAL_DEFENSE_SHIELDS,
  INITIAL_METRICS,
  INITIAL_INCIDENTS,
  HOURLY_TRAFFIC_DATA,
  INITIAL_SYSLOGS,
  INITIAL_API_KEYS
} from '../data/mockSecurityData';

const SecurityContext = createContext();

export function SecurityProvider({ children }) {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('tab')) return params.get('tab');
    }
    return 'prompts-lab';
  });
  const [activeTenant, setActiveTenant] = useState('all');
  const [apiKeys, setApiKeys] = useState(INITIAL_API_KEYS);
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const [defenseShields, setDefenseShields] = useState(INITIAL_DEFENSE_SHIELDS);
  const [trafficData, setTrafficData] = useState(HOURLY_TRAFFIC_DATA);
  const [syslogs, setSyslogs] = useState(INITIAL_SYSLOGS);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [lockdownMode, setLockdownMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState({
    name: 'Administrator',
    role: 'SYS_ROOT_01',
    clearance: 'TS/SCI CYBER-OPS',
    email: 'admin.root@aegis.defense.net',
    avatar: 'AD',
    tenantId: 'all',
    isAdmin: true,
    isLoggedIn: true
  });
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'SYN Flood attack suppressed by Aegis Shield.', time: '2m ago', severity: 'Critical', read: false },
    { id: 2, text: 'HoneyToken touch detected in DMZ Decoy Hub.', time: '5m ago', severity: 'High', read: false },
    { id: 3, text: 'AI Model Sentinel v4.2 weights auto-updated.', time: '14m ago', severity: 'Info', read: true }
  ]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [socSettings, setSocSettings] = useState({
    autoQuarantine: true,
    dpiLevel: 'Paranoid',
    rateLimitThreshold: 2500,
    bgpNullRoute: true,
    honeyTokenTraps: true,
    astSensitivity: 85,
    multiAgentConsensus: 'strict',
    obfuscationDecoder: true,
    jailbreakDictSync: true,
    siemWebhook: 'https://siem.internal.aegis/v1/stream',
    syslogProtocol: 'TLS (Encrypted)',
    audioAlarms: true,
    scanlines: true,
    telemetryPulseRate: 3,
    defaultLandingTab: 'prompts-lab'
  });

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const logout = () => {
    setUser(prev => ({ ...prev, isLoggedIn: false }));
    addSyslog('WARN', 'auth_gate', `Operator session '${user.name}' [${user.role}] terminated. Terminal locked.`);
    setIsAuthModalOpen(true);
    setAuthMode('login');
  };

  const updateSocSettings = (newSettings) => {
    setSocSettings(prev => ({ ...prev, ...newSettings }));
    addSyslog('INFO', 'soc_config', 'SOC system configuration updated and committed.');
  };

  // RBAC Access Control validator: checks if user has Administrator rights
  const isAdmin = (targetUser = user) => {
    if (!targetUser) return false;
    if (targetUser.isAdmin === true) return true;
    const role = (targetUser.role || '').toUpperCase();
    const name = (targetUser.name || '').toUpperCase();
    return (
      role === 'SYS_ROOT_01' ||
      role === 'ADMINISTRATOR' ||
      role.includes('ROOT') ||
      role.includes('CHIEF') ||
      role.includes('LEAD SECOPS ARCHITECT') ||
      name.includes('ADMINISTRATOR')
    );
  };

  // Safe Guarded Action: Blocks sensitive system modifications for non-administrators ("aur kisi ko na kuch kare")
  const guardedAction = (actionName, actionFn) => {
    if (!isAdmin(user)) {
      addSyslog(
        'ALERT',
        'access_denied',
        `ACCESS DENIED: Non-administrator '${user.name}' [${user.role}] attempted unauthorized action: '${actionName}'. Boundary enforcement active.`,
        user.tenantId || 'global'
      );
      setNotifications(prev => [
        {
          id: Date.now(),
          text: `ACCESS DENIED: '${actionName}' requires Administrator privileges.`,
          time: 'Just now',
          severity: 'Critical',
          read: false
        },
        ...prev
      ]);
      return { success: false, reason: 'Administrator clearance required.' };
    }
    actionFn();
    return { success: true };
  };

  // Switch Active Tenant with strict access control
  const switchTenant = (targetTenantId) => {
    const isUserAdmin = isAdmin(user);
    const targetTenantObj = TENANTS.find(t => t.id === targetTenantId);

    if (!isUserAdmin) {
      // Non-admin is strictly bound to their assigned organization
      const userTenant = user.tenantId || 'fintech';
      if (targetTenantId !== userTenant) {
        addSyslog(
          'CRIT',
          'access_violation',
          `SECURITY SAFEGUARD: Unauthorized tenant switch attempt to '${targetTenantId}' by '${user.name}' [${user.role}] blocked. Boundary violation logged.`,
          userTenant
        );
        setNotifications(prev => [
          {
            id: Date.now(),
            text: `ACCESS DENIED: Role ${user.role} is isolated to tenant ${userTenant.toUpperCase()}. Cross-tenant switching forbidden.`,
            time: 'Just now',
            severity: 'Critical',
            read: false
          },
          ...prev
        ]);
        return { success: false, reason: 'Cross-tenant switching is restricted strictly to the Administrator role.' };
      }
    }

    setActiveTenant(targetTenantId);
    const label = targetTenantObj ? targetTenantObj.name : targetTenantId;
    addSyslog(
      'INFO',
      'tenant_switch',
      `Active security context switched to: ${label} [${targetTenantObj?.enclaveId || 'GLOBAL'}]`,
      targetTenantId === 'all' ? 'global' : targetTenantId
    );
    return { success: true };
  };

  // Keep activeTenant aligned if user changes to a non-admin role bound to a single tenant
  useEffect(() => {
    if (!isAdmin(user) && user.tenantId && user.tenantId !== 'all') {
      setActiveTenant(user.tenantId);
    }
  }, [user]);

  // Toggle defense shield switches with RBAC check
  const toggleShield = (id) => {
    return guardedAction('Configure Defense Shield', () => {
      setDefenseShields(prev =>
        prev.map(shield =>
          shield.id === id ? { ...shield, active: !shield.active } : shield
        )
      );
      const target = defenseShields.find(s => s.id === id);
      if (target) {
        addSyslog('WARN', 'shield_config', `Defense Shield '${target.name}' set to ${!target.active ? 'ACTIVE' : 'DISABLED'}`);
      }
    });
  };

  // Add kernel syslog with tenant tagging
  const addSyslog = (level, src, msg, tenantId = null) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const newLog = {
      id: Date.now() + Math.random(),
      time: timeStr,
      level,
      src,
      tenantId: tenantId || (activeTenant === 'all' ? 'global' : activeTenant),
      msg
    };
    setSyslogs(prev => [newLog, ...prev.slice(0, 49)]); // keep 50
  };

  // Toggle Emergency Lockdown with RBAC check
  const toggleLockdown = () => {
    return guardedAction('Emergency Perimeter Lockdown', () => {
      setLockdownMode(prev => {
        const next = !prev;
        if (next) {
          setMetrics(m => ({ ...m, defconLevel: 1 }));
          addSyslog('ALERT', 'defense:lockdown', 'EMERGENCY DEFCON 1 ACTIVATED! All perimeter routes severed. Full isolation active.');
        } else {
          setMetrics(m => ({ ...m, defconLevel: 4 }));
          addSyslog('INFO', 'defense:lockdown', 'Lockdown disengaged. Standard Aegis Guard heuristics resumed.');
        }
        return next;
      });
    });
  };

  // Update Firewall rules with RBAC check
  const updateFirewallRules = () => {
    return guardedAction('Update Global Firewall Rules', () => {
      addSyslog('INFO', 'aegis_fw', 'Firewall rules updated. Threat signatures hot-reloaded across network shields.');
      setNotifications(prev => [
        {
          id: Date.now(),
          text: 'Firewall rules updated and hot-reloaded successfully.',
          time: 'Just now',
          severity: 'Info',
          read: false
        },
        ...prev
      ]);
    });
  };

  // Block an IP immediately with RBAC check
  const blockIP = (ip) => {
    return guardedAction('BGP Null-Route Ingress Block', () => {
      setIncidents(prev =>
        prev.map(inc => inc.sourceIP === ip ? { ...inc, status: 'Blocked (BGP)' } : inc)
      );
      addSyslog('WARN', 'bgp_firewall', `Manual null-route enforced on host ${ip}`);
      setMetrics(m => ({ ...m, totalThreatsBlocked: m.totalThreatsBlocked + 1 }));
    });
  };

  // Dismiss an incident
  const dismissIncident = (id) => {
    setIncidents(prev => prev.filter(inc => inc.id !== id));
    addSyslog('INFO', 'soc_triage', `Incident ${id} triaged and archived.`);
  };

  // Generate a new API Key for a tenant (unlimited key generation)
  const generateApiKey = ({ name, rateLimit, targetTenantId } = {}) => {
    const isUserAdmin = isAdmin(user);
    // Non-admin can only generate keys for their own tenant
    const effectiveTenantId = !isUserAdmin
      ? (user.tenantId || 'fintech')
      : (targetTenantId || (activeTenant === 'all' ? 'fintech' : activeTenant));

    const tenantObj = TENANTS.find(t => t.id === effectiveTenantId) || TENANTS[1];
    const tenantPrefix = (tenantObj.code || 'tenant').toLowerCase().replace(/[^a-z0-9]/g, '');
    const randHex = Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 6);
    const token = `aegis_live_${tenantPrefix}_${randHex}`;
    const keyId = `key_${effectiveTenantId}_${Date.now()}`;

    const newKey = {
      id: keyId,
      name: name?.trim() || `${tenantObj.shortName} API Ingress Key`,
      token,
      type: 'TENANT',
      tenantId: effectiveTenantId,
      tenantName: tenantObj.name,
      enclaveId: tenantObj.enclaveId,
      status: 'ACTIVE',
      rateLimit: rateLimit || '5,000 req/s',
      scope: 'PROMPT_INSPECTION_READ_WRITE',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      lastUsed: 'Never',
      isMaster: false
    };

    setApiKeys(prev => [newKey, ...prev]);

    addSyslog(
      'INFO',
      'api_gateway',
      `[API KEY GENERATED] New token '${newKey.name}' created for enclave ${newKey.enclaveId}. Rate limit: ${newKey.rateLimit}.`,
      effectiveTenantId
    );

    setNotifications(prev => [
      {
        id: Date.now(),
        text: `New API Key generated for ${tenantObj.shortName}: '${newKey.name}'`,
        time: 'Just now',
        severity: 'Info',
        read: false
      },
      ...prev
    ]);

    return { success: true, key: newKey };
  };

  // Revoke an existing API Key
  const revokeApiKey = (keyId) => {
    const target = apiKeys.find(k => k.id === keyId);
    if (!target) return { success: false, reason: 'Key not found.' };

    if (target.isMaster) {
      if (!isAdmin(user)) {
        addSyslog(
          'ALERT',
          'access_denied',
          `ACCESS DENIED: Unauthorized attempt to revoke Root Master Key by non-admin '${user.name}'.`,
          user.tenantId || 'global'
        );
        return { success: false, reason: 'Root Master Key cannot be revoked by non-administrators.' };
      }
    }

    if (!isAdmin(user) && target.tenantId !== user.tenantId) {
      addSyslog(
        'ALERT',
        'access_denied',
        `ACCESS DENIED: User '${user.name}' attempted to revoke key '${target.name}' belonging to another enclave.`,
        user.tenantId || 'global'
      );
      return { success: false, reason: 'Unauthorized access to external tenant key.' };
    }

    setApiKeys(prev =>
      prev.map(k => (k.id === keyId ? { ...k, status: 'REVOKED' } : k))
    );

    addSyslog(
      'WARN',
      'api_gateway',
      `[API KEY REVOKED] Token '${target.name}' [${keyId}] revoked. All requests using this token will be rejected.`,
      target.tenantId
    );

    setNotifications(prev => [
      {
        id: Date.now(),
        text: `API Key '${target.name}' has been REVOKED. Ingress traffic blocked.`,
        time: 'Just now',
        severity: 'High',
        read: false
      },
      ...prev
    ]);

    return { success: true };
  };

  // Delete an existing API Key permanently
  const deleteApiKey = (keyId) => {
    const target = apiKeys.find(k => k.id === keyId);
    if (!target) return { success: false, reason: 'Key not found.' };

    if (target.isMaster) {
      addSyslog(
        'ALERT',
        'access_denied',
        `SECURITY SAFEGUARD: Attempted deletion of Root Master Key rejected. Root authority credential is protected.`,
        'global'
      );
      setNotifications(prev => [
        {
          id: Date.now(),
          text: 'SAFEGUARD: Root Master Key is immutable and cannot be deleted.',
          time: 'Just now',
          severity: 'Critical',
          read: false
        },
        ...prev
      ]);
      return { success: false, reason: 'Root Master Key is immutable and cannot be deleted.' };
    }

    if (!isAdmin(user) && target.tenantId !== user.tenantId) {
      addSyslog(
        'ALERT',
        'access_denied',
        `ACCESS DENIED: User '${user.name}' attempted to delete key belonging to another enclave.`,
        user.tenantId || 'global'
      );
      return { success: false, reason: 'Unauthorized access to external tenant key.' };
    }

    setApiKeys(prev => prev.filter(k => k.id !== keyId));

    addSyslog(
      'ALERT',
      'api_gateway',
      `[API KEY DELETED] Token '${target.name}' [${keyId}] permanently deleted from enclave ${target.enclaveId}.`,
      target.tenantId
    );

    setNotifications(prev => [
      {
        id: Date.now(),
        text: `API Key '${target.name}' has been permanently deleted.`,
        time: 'Just now',
        severity: 'Info',
        read: false
      },
      ...prev
    ]);

    return { success: true };
  };

  // Attack Simulator function: Injects live threats tagged with active tenant context
  const simulateAttack = () => {
    const targetTenantId = activeTenant === 'all'
      ? (Math.random() > 0.5 ? 'fintech' : 'healthcare')
      : activeTenant;
    const targetTenantObj = TENANTS.find(t => t.id === targetTenantId) || TENANTS[1];

    const attackTypes = [
      {
        threat: 'Zero-Day RCE Exploit in Spring Framework',
        category: 'Web Exploit',
        severity: 'Critical',
        ip: '45.154.255.' + Math.floor(Math.random() * 250 + 1),
        country: 'RU',
        target: `${targetTenantObj.code}-Billing-API-Service-v2`,
        port: '8080 (REST)',
        proto: 'HTTP/2',
        mitre: 'T1210',
        hex: 'ff 04 a2 99 7f 30 11 22 41 41 41 41',
        ascii: 'POST /v2/spring-core HTTP/2..class.module.classLoader...'
      },
      {
        threat: 'UDP Memcached Reflection Flood (18 Gbps)',
        category: 'DDoS',
        severity: 'Critical',
        ip: '185.191.171.' + Math.floor(Math.random() * 250 + 1),
        country: 'CN',
        target: `${targetTenantObj.code}-Edge-Router-01`,
        port: '11211 (UDP)',
        proto: 'UDP',
        mitre: 'T1498.002',
        hex: '00 00 00 00 00 01 00 00 73 74 61 74 73 0d 0a',
        ascii: '........stats..'
      },
      {
        threat: 'Kerberoasting Ticket Extraction Attempt',
        category: 'Credential Attack',
        severity: 'High',
        ip: '10.200.15.' + Math.floor(Math.random() * 250 + 1),
        country: 'INTERNAL',
        target: `${targetTenantObj.code}-DC01-Kerberos-KDC`,
        port: '88 (Kerberos)',
        proto: 'TCP',
        mitre: 'T1558.003',
        hex: '6a 82 04 2c 30 82 04 28 a0 03 02 01 05 a1 03 02 01 0c',
        ascii: 'j..,0..(.........'
      }
    ];

    const pick = attackTypes[Math.floor(Math.random() * attackTypes.length)];
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const newIncId = 'INC-' + Math.floor(Math.random() * 9000 + 1000);

    const newIncident = {
      id: newIncId,
      tenantId: targetTenantId,
      tenantName: targetTenantObj.name,
      timestamp: timeStr,
      date: '2026-10-30',
      threat: pick.threat,
      category: pick.category,
      severity: pick.severity,
      sourceIP: pick.ip,
      country: pick.country,
      target: pick.target,
      port: pick.port,
      protocol: pick.proto,
      status: 'Auto-Blocked',
      mitreId: pick.mitre,
      confidence: '99.7%',
      packetPayload: {
        rawHex: pick.hex,
        decodedAscii: pick.ascii,
        signatures: ['AEGIS_HEURISTIC_TRIGGER', 'ANOMALY_VECTOR_EXCEEDED']
      }
    };

    setIncidents(prev => [newIncident, ...prev]);
    setMetrics(m => ({
      ...m,
      totalThreatsBlocked: m.totalThreatsBlocked + 1,
      defconLevel: 2
    }));
    addSyslog(
      'ALERT',
      'aegis_ai:realtime',
      `[ATTACK DETECTED] [${targetTenantObj.code}] ${pick.threat} from ${pick.ip} on ${pick.target}`,
      targetTenantId
    );

    // Add spike to traffic data
    setTrafficData(prev => [
      ...prev.slice(1),
      {
        time: timeStr.slice(0, 5),
        total: (Math.random() * 3 + 6).toFixed(1),
        malicious: (Math.random() * 2 + 1.8).toFixed(2),
        benign: 4.8,
        anomalies: Math.floor(Math.random() * 50 + 60)
      }
    ]);

    // Push notification
    setNotifications(prev => [
      { id: Date.now(), text: `[${targetTenantObj.shortName}] Critical ${pick.category} intercepted: ${pick.ip}`, time: 'Just now', read: false },
      ...prev
    ]);
  };

  // Background subtle telemetry pulse to simulate live SOC heartbeat
  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        inspectedBandwidth: (4.0 + Math.random() * 0.4).toFixed(1) + ' Gbps'
      }));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <SecurityContext.Provider value={{
      tenants: TENANTS,
      activeTenant,
      setActiveTenant,
      switchTenant,
      isAdmin,
      guardedAction,
      updateFirewallRules,
      activeTab,
      setActiveTab,
      metrics,
      setMetrics,
      incidents,
      defenseShields,
      toggleShield,
      trafficData,
      syslogs,
      addSyslog,
      selectedIncident,
      setSelectedIncident,
      isAuthModalOpen,
      setIsAuthModalOpen,
      authMode,
      setAuthMode,
      lockdownMode,
      toggleLockdown,
      blockIP,
      dismissIncident,
      simulateAttack,
      searchQuery,
      setSearchQuery,
      user,
      setUser,
      notifications,
      isNotificationOpen,
      setIsNotificationOpen,
      markAllNotificationsRead,
      clearNotifications,
      removeNotification,
      logout,
      socSettings,
      updateSocSettings,
      apiKeys,
      generateApiKey,
      revokeApiKey,
      deleteApiKey
    }}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}
