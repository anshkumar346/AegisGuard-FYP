import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  User,
  KeyRound,
  X,
  CheckCircle,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authMode,
    setAuthMode,
    setUser,
    addSyslog
  } = useSecurity();

  const [email, setEmail] = useState('alex.vance@aegis.corp');
  const [password, setPassword] = useState('••••••••••••');
  const [name, setName] = useState('Cmdr. Alex Vance');
  const [role, setRole] = useState('Lead SecOps Architect');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const isRootAdmin = role === 'Lead SecOps Architect' || role === 'SYS_ROOT_01' || role === 'Administrator';
    const assignedTenant = isRootAdmin
      ? 'all'
      : role.includes('HealthCare')
      ? 'healthcare'
      : role.includes('GovDefense')
      ? 'defense'
      : 'fintech';

    setUser({
      name: name || (isRootAdmin ? 'Administrator' : 'SecOps Analyst'),
      role: role || 'SYS_ROOT_01',
      clearance: isRootAdmin ? 'TS/SCI CYBER-OPS' : 'SECRET // RESTRICTED',
      avatar: (name || 'OU').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      tenantId: assignedTenant,
      isAdmin: isRootAdmin,
      isLoggedIn: true
    });
    setSuccessMsg(authMode === 'login' ? 'Authentication Verified' : 'Agent Identity Registered');
    addSyslog('INFO', 'auth_gate', `Operator ${name} authenticated with role ${role} [Tenant: ${assignedTenant.toUpperCase()}]`);

    setTimeout(() => {
      setSuccessMsg('');
      setIsAuthModalOpen(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-cyber-card border border-cyan-500/50 shadow-cyber-cyan p-6 space-y-5 overflow-hidden">
        
        {/* Glowing Top Arc Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-cyber-surface transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header & Shield Icon */}
        <div className="flex flex-col items-center text-center space-y-2 pt-2">
          <div className="w-12 h-12 rounded-xl bg-cyber-surface border border-cyan-500/40 shadow-cyber-cyan flex items-center justify-center text-cyan-400">
            <Shield className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-lg font-extrabold font-mono tracking-wider text-slate-100">
              AEGIS GUARD
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              {authMode === 'login'
                ? 'Security Operations Access Gateway'
                : 'Register Cryptographic Agent Credentials'}
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-mono flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}! Redirecting to SOC...</span>
          </div>
        )}

        {/* Mode Switcher Tabs */}
        <div className="flex rounded-lg bg-cyber-darkest p-1 border border-cyber-border font-mono text-xs">
          <button
            type="button"
            onClick={() => setAuthMode('login')}
            className={`flex-1 py-1.5 rounded-md font-semibold transition-all ${
              authMode === 'login'
                ? 'bg-cyan-600 text-white shadow-cyber-cyan'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Operator Login
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('register')}
            className={`flex-1 py-1.5 rounded-md font-semibold transition-all ${
              authMode === 'register'
                ? 'bg-cyan-600 text-white shadow-cyber-cyan'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Register ID
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 font-mono text-xs">
          
          {authMode === 'register' && (
            <div>
              <label className="text-slate-300 block mb-1">Agent Call-Sign / Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Cmdr. Sarah Connor"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-cyber-surface border border-cyber-border focus:border-cyan-500 text-slate-200 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-slate-300 block mb-1">Clearance Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agent@aegis.corp"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-cyber-surface border border-cyber-border focus:border-cyan-500 text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-300">Passphrase</label>
              {authMode === 'login' && (
                <a href="#forgot" className="text-[11px] text-cyan-400 hover:underline">
                  Reset Token?
                </a>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-cyber-surface border border-cyber-border focus:border-cyan-500 text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 block mb-1">Security Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-cyber-surface border border-cyber-border text-slate-200 focus:outline-none"
            >
              <option value="Lead SecOps Architect">Administrator - Chief SecOps Architect (Root All-Tenants)</option>
              <option value="FinTech SecOps Analyst">FinTech SecOps Analyst (Client A Bound - Restricted)</option>
              <option value="HealthCare Compliance Auditor">HealthCare Compliance Auditor (Client B Bound - Restricted)</option>
              <option value="GovDefense Systems Operator">GovDefense Systems Operator (Client C Bound - Restricted)</option>
              <option value="Forensics Auditor">Forensics Auditor (Read-Only - Restricted)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold tracking-wider shadow-cyber-cyan transition-all flex items-center justify-center gap-2 mt-4"
          >
            <span>{authMode === 'login' ? 'Authenticate Session' : 'Create Agent Identity'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Login Bypass */}
        <div className="pt-2 border-t border-cyber-border/60 text-center font-mono">
          <button
            type="button"
            onClick={handleSubmit}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 underline"
          >
            [One-Click Operator Sign In (Demo Mode)]
          </button>
        </div>

      </div>
    </div>
  );
}
