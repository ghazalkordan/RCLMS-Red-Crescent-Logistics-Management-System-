import React, { useState, useEffect, useCallback } from 'react';
import {
  Language,
  ThemeMode,
  UserRole,
  UserProfile,
  DisasterEvent,
  EmergencyRequest,
  LpSolverResult,
  GaSolverResult,
  Warehouse,
  ShelterCandidate,
  TransportVehicle,
  HelicopterAircraft,
  RoadNode,
  RoadEdge,
  ReliefItem,
  LpSolverParameters,
  GaParameters,
  DisasterScenario,
  AuditLogEntry,
  ChatMessage,
} from './types';
import { LandingEntryPage } from './components/LandingEntryPage';
import { AuthModal } from './components/AuthModal';
import { PublicPlatform } from './components/PublicPlatform';
import { Header } from './components/Header';
import { CommandCenter } from './components/CommandCenter';
import { LpLaboratory } from './components/LpLaboratory';
import { GaLaboratory } from './components/GaLaboratory';
import { GisMapExplorer } from './components/GisMapExplorer';
import { WarehouseManager } from './components/WarehouseManager';
import { ShelterFleetManager } from './components/ShelterFleetManager';
import { EmergencyIntake } from './components/EmergencyIntake';
import { ScenarioSimulator } from './components/ScenarioSimulator';
import { AdminGovernance } from './components/AdminGovernance';
import { UserProfileTab } from './components/UserProfileTab';
import { TeamAllocationModule } from './components/TeamAllocationModule';
import { IncidentPriorityModule } from './components/IncidentPriorityModule';
import { CasualtyHospitalModule } from './components/CasualtyHospitalModule';
import { FleetFuelModule } from './components/FleetFuelModule';
import { AiChatbotDrawer } from './components/AiChatbotDrawer';
import { Footer } from './components/Footer';

export default function App() {
  // Navigation & View Flow State
  const [currentView, setCurrentView] = useState<'landing' | 'rescuer_dashboard' | 'public_platform'>('landing');
  const [selectedConsole, setSelectedConsole] = useState<'rescuer' | 'public'>('public');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Application Settings State
  const [language, setLanguage] = useState<Language>('fa');
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [userRole, setUserRole] = useState<UserRole>('manager');
  const [activeTab, setActiveTab] = useState<string>('command_center');
  const [publicInitialTab, setPublicInitialTab] = useState<string>('request');
  const [emergencyMode, setEmergencyMode] = useState<boolean>(true);
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);

  // Data State fetched from Server
  const [disaster, setDisaster] = useState<DisasterEvent | null>(null);
  const [emergencyRequests, setEmergencyRequests] = useState<EmergencyRequest[]>([]);
  const [lpResult, setLpResult] = useState<LpSolverResult | null>(null);
  const [gaResult, setGaResult] = useState<GaSolverResult | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [shelters, setShelters] = useState<ShelterCandidate[]>([]);
  const [trucks, setTrucks] = useState<TransportVehicle[]>([]);
  const [helicopters, setHelicopters] = useState<HelicopterAircraft[]>([]);
  const [nodes, setNodes] = useState<RoadNode[]>([]);
  const [edges, setEdges] = useState<RoadEdge[]>([]);
  const [items, setItems] = useState<ReliefItem[]>([]);
  const [lpParams, setLpParams] = useState<LpSolverParameters | null>(null);
  const [gaParams, setGaParams] = useState<GaParameters | null>(null);
  const [scenarios, setScenarios] = useState<DisasterScenario[]>([]);
  const [activeScenario, setActiveScenario] = useState<DisasterScenario | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync html dir & dark mode class globally
  useEffect(() => {
    document.documentElement.dir = language === 'fa' || language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [language, theme]);

  // Fetch complete initial state from Express Server
  const fetchState = useCallback(async () => {
    try {
      const res = await fetch('/api/state');
      if (!res.ok) throw new Error('Failed to fetch state');
      const data = await res.json();

      if (data.disaster) setDisaster(data.disaster);
      if (data.emergencyRequests) setEmergencyRequests(data.emergencyRequests);
      setLpResult(data.lpResult || data.latestLpResult || null);
      setGaResult(data.gaResult || data.latestGaResult || null);
      if (data.warehouses) setWarehouses(data.warehouses);
      if (data.shelters) setShelters(data.shelters);
      if (data.trucks) setTrucks(data.trucks);
      if (data.helicopters) setHelicopters(data.helicopters);
      if (data.nodes) setNodes(data.nodes);
      if (data.edges) setEdges(data.edges);
      if (data.items) setItems(data.items);
      if (data.lpParams) setLpParams(data.lpParams);
      if (data.gaParams) setGaParams(data.gaParams);
      if (data.scenarios) {
        setScenarios(data.scenarios);
        if (data.scenarios.length > 0) {
          setActiveScenario(data.scenarios[0]);
        }
      }
      if (data.auditLogs) setAuditLogs(data.auditLogs);
      if (data.emergencyMode !== undefined) setEmergencyMode(data.emergencyMode);

      if (data.chatHistory && data.chatHistory.length > 0) {
        setChatMessages(data.chatHistory);
      } else {
        setChatMessages([
          {
            id: 'msg-1',
            sender: 'bot',
            text:
              language === 'fa'
                ? 'سلام. من دستیار هوشمند تصمیم‌گیری هلال احمر هستم. پاسخ‌ها متکی بر خروجی بهینه‌سازی LP/MILP، الگوریتم ژنتیک، قیمت‌های سایه و تحلیل‌های سناریو خواهد بود. چگونه می‌توانم کمک کنم؟'
                : language === 'ar'
                ? 'مرحباً. أنا المساعد الذكي لاتخاذ القرارات الهلال الأحمر. كيف يمكنني مساعدتك؟'
                : 'Hello. I am the Red Crescent Operations Decision Assistant. How can I assist you?',
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error('Error fetching state from server:', err);
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // Handler: Console Select on Landing Page
  const handleSelectConsole = (consoleType: 'rescuer' | 'public') => {
    setSelectedConsole(consoleType);
    setIsAuthModalOpen(true);
  };

  // Handler: Direct Emergency Request Button from Landing Page
  const handleOpenDirectEmergency = () => {
    setPublicInitialTab('request');
    setCurrentView('public_platform');
  };

  // Handler: Auth Success
  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    if (user.console === 'rescuer') {
      setUserRole(user.role || 'rescuer');
      setCurrentView('rescuer_dashboard');
    } else {
      setUserRole('citizen');
      setCurrentView('public_platform');
    }
  };

  // Handler: Run Solvers (LP & GA)
  const handleRunOptimization = async (
    customLpParams?: Partial<LpSolverParameters>,
    customGaParams?: Partial<GaParameters>
  ) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lpParams: customLpParams,
          gaParams: customGaParams,
          actorRole: userRole,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLpResult(data.lpResult);
        setGaResult(data.gaResult);
        if (data.lpParams) setLpParams(data.lpParams);
        if (data.gaParams) setGaParams(data.gaParams);
        await fetchState();
      }
    } catch (err) {
      console.error('Error running optimization:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Update Warehouse Inventory
  const handleUpdateInventory = async (warehouseId: string, itemId: string, quantity: number) => {
    try {
      const res = await fetch('/api/inventory/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ warehouseId, itemId, quantity, actorRole: userRole }),
      });
      const data = await res.json();
      if (data.success) {
        setWarehouses(data.warehouses);
        setLpResult(data.lpResult);
      }
    } catch (err) {
      console.error('Error updating inventory:', err);
    }
  };

  // Handler: Toggle Warehouse Availability
  const handleToggleWarehouseAvailability = async (warehouseId: string) => {
    try {
      const res = await fetch('/api/warehouse/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ warehouseId, actorRole: userRole }),
      });
      const data = await res.json();
      if (data.success) {
        setWarehouses(data.warehouses);
        setLpResult(data.lpResult);
      }
    } catch (err) {
      console.error('Error toggling warehouse:', err);
    }
  };

  // Handler: Toggle Road Blockage Status
  const handleToggleEdgeStatus = async (edgeId: string) => {
    try {
      const res = await fetch('/api/gis/edge/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ edgeId, actorRole: userRole }),
      });
      const data = await res.json();
      if (data.success) {
        setEdges(data.edges);
        setGaResult(data.gaResult);
      }
    } catch (err) {
      console.error('Error toggling edge:', err);
    }
  };

  // Handler: Toggle Weather Gating for Helicopters
  const handleToggleWeatherGating = async (heliId: string) => {
    try {
      const res = await fetch('/api/fleet/weather-toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ helicopterId: heliId, actorRole: userRole }),
      });
      const data = await res.json();
      if (data.success) {
        setHelicopters(data.helicopters);
        setGaResult(data.gaResult);
      }
    } catch (err) {
      console.error('Error toggling weather gating:', err);
    }
  };

  // Handler: Toggle Shelter Activation
  const handleToggleShelterActivation = async (shelterId: string) => {
    try {
      const res = await fetch('/api/shelter/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shelterId, actorRole: userRole }),
      });
      const data = await res.json();
      if (data.success) {
        setShelters(data.shelters);
        setGaResult(data.gaResult);
      }
    } catch (err) {
      console.error('Error toggling shelter activation:', err);
    }
  };

  // Handler: Submit Public Emergency Request
  const handleSubmitEmergencyRequest = async (formData: any) => {
    try {
      const res = await fetch('/api/emergency-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setEmergencyRequests(data.emergencyRequests);
        return data;
      }
    } catch (err) {
      console.error('Error submitting emergency request:', err);
    }
  };

  // Handler: Simulate Step
  const handleSimulateStep = async (actionType: string) => {
    try {
      const res = await fetch('/api/simulation/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType, actorRole: userRole }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.lpResult) setLpResult(data.lpResult);
        if (data.gaResult) setGaResult(data.gaResult);
        if (data.edges) setEdges(data.edges);
        if (data.emergencyRequests) setEmergencyRequests(data.emergencyRequests);
      }
      return data;
    } catch (err) {
      console.error('Error simulating step:', err);
    }
  };

  // Handler: Send Message to Gemini Chatbot
  const handleSendMessage = async (messageText: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: messageText,
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText, language }),
      });
      const data = await res.json();

      if (data.reply) {
        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'bot',
          text: data.reply,
          timestamp: new Date().toISOString(),
        };
        setChatMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err) {
      console.error('Error in chat:', err);
    }
  };

  // 1. VIEW: LANDING PAGE
  if (currentView === 'landing') {
    return (
      <>
        <LandingEntryPage
          language={language}
          onLanguageChange={setLanguage}
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          onSelectConsole={handleSelectConsole}
          onOpenDirectEmergency={handleOpenDirectEmergency}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          consoleType={selectedConsole}
          language={language}
          onAuthSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  // 2. VIEW: PUBLIC PLATFORM
  if (currentView === 'public_platform') {
    return (
      <>
        <PublicPlatform
          language={language}
          onLanguageChange={setLanguage}
          user={currentUser}
          onLogout={() => {
            setCurrentUser(null);
            setCurrentView('landing');
          }}
          onSwitchToRescuerConsole={() => {
            setSelectedConsole('rescuer');
            setIsAuthModalOpen(true);
          }}
          onOpenChatbot={() => setIsChatbotOpen(true)}
          initialTab={publicInitialTab}
        />

        <AiChatbotDrawer
          language={language}
          isOpen={isChatbotOpen}
          onOpen={() => setIsChatbotOpen(true)}
          onClose={() => setIsChatbotOpen(false)}
          messages={chatMessages}
          onSendMessage={handleSendMessage}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          consoleType={selectedConsole}
          language={language}
          onAuthSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  // Render Loader if initial fetch pending for Rescuer Dashboard
  if (isLoading || !disaster || !lpResult || !gaResult || !lpParams || !gaParams) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#050505] text-slate-900 dark:text-white flex flex-col items-center justify-center space-y-4 font-sans">
        <div className="w-12 h-12 rounded-full border-2 border-[#D6001C] border-t-transparent animate-spin" />
        <h2 className="text-sm font-bold tracking-widest text-[#D6001C] uppercase">
          {language === 'fa'
            ? 'در حال بارگذاری مرکز فرماندهی و بهینه‌سازی هلال احمر...'
            : 'Loading Red Crescent Command Center & Solvers...'}
        </h2>
      </div>
    );
  }

  // 3. VIEW: RESCUER OPERATIONAL DASHBOARD
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-[#e5e5e5] font-sans transition-colors duration-200">
      {/* Header */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        theme={theme}
        onThemeChange={setTheme}
        userRole={userRole}
        onUserRoleChange={setUserRole}
        emergencyMode={emergencyMode}
        onToggleEmergencyMode={() => setEmergencyMode(!emergencyMode)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenChatbot={() => setIsChatbotOpen(true)}
        onExitToLanding={() => {
          setCurrentUser(null);
          setCurrentView('landing');
        }}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'command_center' && (
          <CommandCenter
            language={language}
            disaster={disaster}
            emergencyRequests={emergencyRequests}
            lpResult={lpResult}
            gaResult={gaResult}
            warehouses={warehouses}
            shelters={shelters}
            trucks={trucks}
            helicopters={helicopters}
            onRunOptimization={() => handleRunOptimization()}
            onNavigateTab={setActiveTab}
            onOpenChatbot={(prompt) => {
              setIsChatbotOpen(true);
              if (prompt) handleSendMessage(prompt);
            }}
          />
        )}

        {activeTab === 'team_allocation' && (
          <TeamAllocationModule language={language} theme={theme} />
        )}

        {activeTab === 'incident_priority' && (
          <IncidentPriorityModule language={language} theme={theme} />
        )}

        {activeTab === 'casualty_hospital' && (
          <CasualtyHospitalModule language={language} theme={theme} />
        )}

        {activeTab === 'fleet_fuel' && (
          <FleetFuelModule language={language} theme={theme} />
        )}

        {activeTab === 'lp_lab' && (
          <LpLaboratory
            language={language}
            lpParams={lpParams}
            lpResult={lpResult}
            warehouses={warehouses}
            areas={disaster.affectedAreas}
            items={items}
            onSolveLp={(newParams) => handleRunOptimization(newParams, undefined)}
            onOpenChatbot={() => setIsChatbotOpen(true)}
          />
        )}

        {activeTab === 'ga_lab' && (
          <GaLaboratory
            language={language}
            gaParams={gaParams}
            gaResult={gaResult}
            shelters={shelters}
            areas={disaster.affectedAreas}
            trucks={trucks}
            helicopters={helicopters}
            onSolveGa={(newParams) => handleRunOptimization(undefined, newParams)}
            onOpenChatbot={() => setIsChatbotOpen(true)}
          />
        )}

        {activeTab === 'gis_map' && (
          <GisMapExplorer
            language={language}
            nodes={nodes}
            edges={edges}
            warehouses={warehouses}
            shelters={shelters}
            areas={disaster.affectedAreas}
            trucks={trucks}
            helicopters={helicopters}
            onToggleEdgeStatus={handleToggleEdgeStatus}
            onToggleWeatherGating={handleToggleWeatherGating}
            onRunOptimization={() => handleRunOptimization()}
          />
        )}

        {activeTab === 'warehouses' && (
          <WarehouseManager
            language={language}
            warehouses={warehouses}
            items={items}
            onUpdateInventory={handleUpdateInventory}
            onToggleWarehouseAvailability={handleToggleWarehouseAvailability}
          />
        )}

        {activeTab === 'shelters_fleet' && (
          <ShelterFleetManager
            language={language}
            shelters={shelters}
            trucks={trucks}
            helicopters={helicopters}
            onToggleShelterActivation={handleToggleShelterActivation}
            onToggleWeatherGating={handleToggleWeatherGating}
          />
        )}

        {activeTab === 'emergency_intake' && (
          <EmergencyIntake
            language={language}
            emergencyRequests={emergencyRequests}
            onSubmitRequest={handleSubmitEmergencyRequest}
          />
        )}

        {activeTab === 'scenarios_sim' && (
          <ScenarioSimulator
            language={language}
            scenarios={scenarios}
            activeScenario={activeScenario || scenarios[0]}
            onSelectScenario={(id) => {
              const sc = scenarios.find((s) => s.id === id);
              if (sc) setActiveScenario(sc);
            }}
            onSimulateStep={handleSimulateStep}
          />
        )}

        {activeTab === 'admin_governance' && (
          <AdminGovernance
            language={language}
            auditLogs={auditLogs}
            userRole={userRole}
            onClearAuditLogs={() => setAuditLogs([])}
          />
        )}

        {activeTab === 'user_profile' && (
          <UserProfileTab
            language={language}
            user={currentUser}
            userRole={userRole}
            onUserRoleChange={setUserRole}
            onUpdateProfile={(updated) => {
              setCurrentUser((prev) => (prev ? { ...prev, ...updated } : (updated as any)));
            }}
            consoleType="rescuer"
          />
        )}
      </main>

      {/* Grounded AI Assistant Drawer */}
      <AiChatbotDrawer
        language={language}
        isOpen={isChatbotOpen}
        onOpen={() => setIsChatbotOpen(true)}
        onClose={() => setIsChatbotOpen(false)}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
      />

      {/* Footer */}
      <Footer language={language} />
    </div>
  );
}
