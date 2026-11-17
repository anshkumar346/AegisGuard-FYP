import React, { useState } from 'react';
import {
  Lock,
  Thermometer,
  Trash2,
  Layers,
  AlertTriangle,
  Flame,
  Zap,
  Activity,
  CheckCircle,
  FileText
} from 'lucide-react';
import {
  VAULT_CELLS,
  VAULT_LOGS
} from '../../data/mockSecurityData';
import { useSecurity } from '../../context/SecurityContext';
import FitVerseChatbot from './FitVerseChatbot';

export default function IsolationVaultView() {
  const { addSyslog } = useSecurity();
  const [cells, setCells] = useState(VAULT_CELLS);
  const [escapeAttempts, setEscapeAttempts] = useState(17);

  const handleTerminate = (cellId) => {
    addSyslog('WARN', 'vault_purge', `Cell ${cellId} session terminated. Memory wiped with zeroes.`);
    setCells(prev => prev.filter(c => c.id !== cellId));
  };

  const handleFullPurge = () => {
    addSyslog('CRIT', 'vault_purge', 'EMERGENCY FULL PURGE INITIATED. All 12 containment sandboxes flushed.');
    setCells([]);
    setEscapeAttempts(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 font-sans select-none">
      
      {/* Left 8 Cols: Adversarial Containment */}
      <div className="lg:col-span-8 p-5 rounded-2xl bg-[#0D0F14] border border-cyber-border shadow-cyber-card flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-100 font-mono">
                Adversarial Containment
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-200 font-mono mt-0.5 font-semibold">
                <span className="text-cyan-400 font-bold">*</span>
                <span>Sector 76 Schematic</span>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs sm:text-sm">
              <button
                onClick={handleFullPurge}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#201416] hover:bg-rose-950 border border-rose-900/80 text-rose-300 font-bold transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Full Purge</span>
              </button>

              <button
                onClick={() => addSyslog('INFO', 'deep_inspect', 'Decompilation pass executed on CELL_ALPHA_01.')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#141A24] hover:bg-[#182232] border border-[#1F2B3E] text-slate-100 font-bold transition-colors"
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Deep Inspect</span>
              </button>
            </div>
          </div>

          {/* Grid: Left Vitals + Right Containment Cells */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 my-4">
            
            {/* Vitals Column (4 Cols) */}
            <div className="md:col-span-4 space-y-4">
              
              {/* Vault Temp */}
              <div className="p-4 rounded-xl bg-[#12161E] border border-cyber-border font-mono">
                <div className="flex items-center gap-2 text-slate-300 text-xs sm:text-sm font-semibold mb-1">
                  <Thermometer className="w-4 h-4 text-cyan-400" />
                  <span>Vault Temp</span>
                </div>
                <div className="text-4xl font-extrabold text-white">
                  84.2°C
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                  <div className="bg-gradient-to-r from-cyan-400 to-rose-400 h-full rounded-full" style={{ width: '84%' }} />
                </div>
              </div>

              {/* Metrics */}
              <div className="p-4 rounded-xl bg-[#12161E] border border-cyber-border font-mono text-xs sm:text-sm space-y-2.5">
                <div className="font-bold text-white text-sm pb-1.5 border-b border-slate-700">
                  Metrics
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 font-medium">Active / Cells</span>
                  <span className="text-white font-bold">{cells.length} / 12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 font-medium">Data Synth Rate</span>
                  <span className="text-cyan-300 font-bold">2.4 GB/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 font-medium">Escape Attempts</span>
                  <span className="text-rose-400 font-bold">{escapeAttempts}</span>
                </div>
              </div>

            </div>

            {/* Cells Column (8 Cols) */}
            <div className="md:col-span-8 space-y-3 font-mono text-xs sm:text-sm">
              
              {/* Cell 1: CELL_ALPHA_01 */}
              {cells.find(c => c.id === 'CELL_ALPHA_01') && (
                <div className="p-4 rounded-xl bg-[#151216] border border-rose-900/60 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm tracking-wider">CELL_ALPHA_01</span>
                    <span className="text-rose-400 text-xs font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      CRITICAL
                    </span>
                  </div>

                  <div className="text-xs sm:text-sm text-slate-200 font-medium">
                    <span className="text-slate-400 font-bold">Entity:</span> APT-29 'Cozy Bear' (Suspected)
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-1.5 border-t border-slate-800">
                    <div>
                      <span className="text-slate-400 text-[11px] font-bold block">DWELL TIME</span>
                      <span className="text-slate-100 font-bold text-sm">14:02:45</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] font-bold block">VECTOR</span>
                      <span className="text-slate-100 font-bold text-sm">Zero-Day Exchg</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
                      <span>Synthetic Data Dump Status</span>
                      <span className="text-cyan-300 font-bold text-sm">68%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full rounded-full" style={{ width: '68%' }} />
                    </div>
                  </div>

                  <button
                    onClick={() => handleTerminate('CELL_ALPHA_01')}
                    className="w-full py-2 rounded bg-[#201416] hover:bg-rose-950 border border-rose-800 text-rose-300 font-bold text-xs sm:text-sm uppercase tracking-wider transition-colors"
                  >
                    Terminate Session
                  </button>
                </div>
              )}

              {/* Cell 2: CELL_BETA_04 */}
              {cells.find(c => c.id === 'CELL_BETA_04') && (
                <div className="p-4 rounded-xl bg-[#12161E] border border-cyber-border space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm tracking-wider">CELL_BETA_04</span>
                    <span className="text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      ANALYZING
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                    <div>
                      <span className="text-slate-400 text-[11px] font-bold block">DWELL TIME</span>
                      <span className="text-slate-100 font-bold text-sm">00:45:12</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] font-bold block">Synth Data Flow</span>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '34%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cell 3: Awaiting Intake */}
              <div className="p-4 rounded-xl border border-dashed border-slate-700 text-center text-slate-300 font-mono text-xs sm:text-sm font-semibold">
                Awaiting Intake
              </div>

            </div>

          </div>

          {/* Bottom Vault Activity Log */}
          <div className="p-4 rounded-xl bg-[#090B10] border border-cyber-border font-mono text-xs sm:text-sm text-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-800 text-white font-bold text-sm">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Vault Activity Log</span>
            </div>
            {VAULT_LOGS.map((log, i) => (
              <div key={i} className="truncate leading-relaxed font-medium">
                {log}
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs font-mono font-bold text-slate-300 pt-3 border-t border-slate-800">
          CONTAINMENT ZONE 76 • ISOLATION LEVEL EPSILON
        </div>
      </div>

      {/* Right 4 Cols: Docked FitVerse Gym Support Bot */}
      <div className="lg:col-span-4">
        <FitVerseChatbot mode="docked-vault" />
      </div>

    </div>
  );
}
