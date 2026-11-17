import React from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import DashboardView from './components/dashboard/DashboardView';
import ThreatMapView from './components/dashboard/ThreatMapView';
import TelemetryView from './components/dashboard/TelemetryView';
import PromptsLabView from './components/dashboard/PromptsLabView';
import IsolationVaultView from './components/dashboard/IsolationVaultView';
import APIIntegrationView from './components/dashboard/APIIntegrationView';
import SettingsView from './components/dashboard/SettingsView';
import SupportView from './components/dashboard/SupportView';
import AuthModal from './components/dashboard/AuthModal';
import { useSecurity, SecurityProvider } from './context/SecurityContext';

function DashboardContent() {
  const { activeTab, setActiveTab } = useSecurity();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'threat-map':
        return <ThreatMapView />;
      case 'telemetry':
        return <TelemetryView />;
      case 'prompts-lab':
        return <PromptsLabView />;
      case 'isolation-vault':
        return <IsolationVaultView />;
      case 'api-integration':
        return <APIIntegrationView />;
      case 'settings':
        return <SettingsView />;
      case 'support':
        return <SupportView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="h-screen max-h-screen flex flex-col bg-[#080A0E] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black overflow-hidden">
      {/* Top Header */}
      <Header />

      {/* Main View Area with Sidebar */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Exact Sidebar */}
        <Sidebar />

        {/* Dynamic Viewport Container */}
        <main className="flex-1 overflow-y-auto min-h-0 p-4 lg:p-6 pb-20 md:pb-6">
          <div className="max-w-[1700px] mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-[#0B0D12]/95 backdrop-blur-md border-t border-cyber-border z-30 flex items-center justify-around py-2 font-mono text-[10px]">
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'threat-map', label: 'Threat Map' },
          { id: 'telemetry', label: 'Telemetry' },
          { id: 'prompts-lab', label: 'Prompts Lab' },
          { id: 'isolation-vault', label: 'Vault' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-2 py-1 rounded transition-colors ${
              activeTab === item.id ? 'text-cyan-400 font-bold' : 'text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Global Security Gateway Auth Modal */}
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <SecurityProvider>
      <DashboardContent />
    </SecurityProvider>
  );
}
