import React, { useState } from 'react';
import {
  ShieldAlert,
  Moon,
  Sun,
  Globe,
  Zap,
  Activity,
  ArrowLeft,
  ArrowRight,
  User,
  Menu,
  X,
  Building2,
  Truck,
  Layers,
  MapPin,
  Flame,
  UserCheck,
  Settings,
  HelpCircle,
  FileText,
  Users,
  HeartPulse,
  Fuel,
} from 'lucide-react';
import { Language, ThemeMode, UserRole } from '../types';
import { getTranslation } from '../locales/i18n';
import { RedCrescentLogo } from './RedCrescentLogo';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  userRole: UserRole;
  onUserRoleChange: (role: UserRole) => void;
  emergencyMode: boolean;
  onToggleEmergencyMode: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenChatbot: () => void;
  onExitToLanding?: () => void;
  consoleColorTheme?: 'blue' | 'red' | 'purple';
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  theme,
  onThemeChange,
  userRole,
  onUserRoleChange,
  emergencyMode,
  onToggleEmergencyMode,
  activeTab,
  onTabChange,
  onOpenChatbot,
  onExitToLanding,
  consoleColorTheme = 'blue',
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isRtl = language === 'fa' || language === 'ar';

  const navItems = [
    { id: 'command_center', labelKey: 'nav_commandCenter', icon: Activity },
    { id: 'team_allocation', labelKey: 'nav_teamAllocation', icon: Users },
    { id: 'incident_priority', labelKey: 'nav_incidentPriority', icon: Flame },
    { id: 'casualty_hospital', labelKey: 'nav_casualtyHospital', icon: HeartPulse },
    { id: 'fleet_fuel', labelKey: 'nav_fleetFuel', icon: Fuel },
    { id: 'lp_lab', labelKey: 'nav_lpLab', icon: Layers },
    { id: 'ga_lab', labelKey: 'nav_gaLab', icon: Settings },
    { id: 'gis_map', labelKey: 'nav_gisMap', icon: MapPin },
    { id: 'warehouses', labelKey: 'nav_warehouses', icon: Building2 },
    { id: 'shelters_fleet', labelKey: 'nav_sheltersFleet', icon: Truck },
    { id: 'emergency_intake', labelKey: 'nav_emergencyIntake', icon: ShieldAlert },
    { id: 'scenarios_sim', labelKey: 'nav_scenariosSim', icon: Flame },
    { id: 'admin_governance', labelKey: 'nav_adminGovernance', icon: UserCheck },
  ] as const;

  // Blue / Operations Blue Theme Palette
  const headerBgClass =
    consoleColorTheme === 'red'
      ? 'bg-gradient-to-r from-red-950 via-slate-900 to-slate-950 text-white'
      : consoleColorTheme === 'purple'
      ? 'bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 text-white'
      : 'bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white';

  return (
    <>
      <header className={`sticky top-0 z-40 ${headerBgClass} border-b border-blue-900/50 shadow-lg transition-colors duration-200`}>
        {/* Emergency Mode Banner */}
        {emergencyMode && (
          <div className="bg-[#D6001C] text-white px-6 py-2 flex items-center justify-between text-xs tracking-wider shadow-inner">
            <div className="flex items-center gap-2 font-bold">
              <ShieldAlert className="w-4 h-4 text-white shrink-0 animate-pulse" />
              <span>
                {language === 'fa'
                  ? '🚨 حالت اضطراری ملی فعال است — اولویت کامل با تسریع امدادرسانی و تخصیص منابع'
                  : language === 'ar'
                  ? '🚨 وضع الطوارئ الوطني نشط - الأولوية للتسريع والإغاثة'
                  : '🚨 NATIONAL EMERGENCY CRISIS MODE ACTIVE — HIGH PRIORITY DISPATCH'}
              </span>
            </div>
            <button
              onClick={onToggleEmergencyMode}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded text-[11px] uppercase font-semibold transition"
            >
              {getTranslation(language, 'deactivateEmergencyMode')}
            </button>
          </div>
        )}

        {/* Main Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Left Controls: Hamburger Menu + Logo + Title */}
          <div className="flex items-center gap-3">
            {/* Hamburger 3-Line Menu Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2.5 rounded-xl bg-blue-900/40 hover:bg-blue-800/60 border border-blue-700/50 text-blue-200 transition-all flex items-center gap-2 font-bold text-xs"
              title="منوی بخش‌ها"
            >
              <Menu className="w-5 h-5 text-cyan-400" />
              <span className="hidden sm:inline">منوی بخش‌ها</span>
            </button>

            {onExitToLanding && (
              <button
                onClick={onExitToLanding}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-red-950/60 text-red-400 border border-slate-700/60 transition-colors"
                title="بازگشت به صفحه اصلی"
              >
                {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              </button>
            )}

            <RedCrescentLogo size={36} />
            <div>
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center gap-2">
                <span>{getTranslation(language, 'appName')}</span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-white bg-blue-600 px-2 py-0.5 rounded-full border border-blue-400/40">
                  کنسول ستاد بحران
                </span>
              </h1>
              <p className="text-xs text-blue-200/80 font-medium hidden md:block">
                {getTranslation(language, 'appSubName')}
              </p>
            </div>
          </div>

          {/* Right Controls: Profile Button + Language Switcher + Theme Switch */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!emergencyMode && (
              <button
                onClick={onToggleEmergencyMode}
                className="hidden lg:flex items-center gap-1.5 bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/50 px-3 py-1.5 rounded-xl text-xs font-bold transition"
              >
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span>{getTranslation(language, 'activateEmergencyMode')}</span>
              </button>
            )}

            {/* Separate Profile Button in Header (#24) */}
            <button
              onClick={() => onTabChange('user_profile')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                activeTab === 'user_profile'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-md'
                  : 'bg-blue-900/50 hover:bg-blue-800/80 text-blue-100 border-blue-700/60'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-cyan-400/20 text-cyan-300 flex items-center justify-center font-black border border-cyan-400/40 text-[11px]">
                ♀
              </div>
              <span className="hidden sm:inline">پروفایل من</span>
            </button>

            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/60 p-1 rounded-xl text-xs font-medium">
              <Globe className="w-3.5 h-3.5 text-cyan-400 ml-1" />
              <button
                onClick={() => onLanguageChange('fa')}
                className={`px-2 py-0.5 rounded-lg transition-all ${
                  language === 'fa' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                فارسی
              </button>
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-0.5 rounded-lg transition-all ${
                  language === 'en' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => onLanguageChange('ar')}
                className={`px-2 py-0.5 rounded-lg transition-all ${
                  language === 'ar' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                العربية
              </button>
            </div>

            {/* Theme Switch */}
            <button
              onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
              className="bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 p-2 rounded-xl transition"
              title={theme === 'dark' ? 'حالت روشن' : 'حالت تاریک'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Vertical Drawer / Sidebar Overlay */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex" dir={isRtl ? 'rtl' : 'ltr'}>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-80 max-w-[85vw] bg-slate-900 dark:bg-slate-950 text-slate-100 border-l border-r border-blue-900/60 shadow-2xl flex flex-col h-full z-10">
            {/* Drawer Header */}
            <div className="p-4 border-b border-blue-900/60 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-3">
                <RedCrescentLogo size={32} />
                <div>
                  <h3 className="font-extrabold text-sm text-white">منوی مدیریت و عملیات</h3>
                  <p className="text-[11px] text-blue-300">جمعیت هلال احمر</p>
                </div>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Vertical Menu Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
              {navItems.map((item) => {
                const IconComp = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setIsDrawerOpen(false);
                    }}
                    className={`w-full p-3 rounded-xl flex items-center gap-3 text-sm font-bold transition-all text-right ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md border border-blue-400/40'
                        : 'bg-slate-800/40 hover:bg-slate-800 text-slate-300 hover:text-white border border-transparent'
                    }`}
                  >
                    <IconComp className={`w-5 h-5 ${isActive ? 'text-white' : 'text-cyan-400'}`} />
                    <span className="flex-1">{getTranslation(language, item.labelKey as any)}</span>
                  </button>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-blue-900/60 bg-slate-950 text-xs text-slate-400 text-center">
              <span>سامانه فرماندهی بهینه‌سازی و امداد و نجات</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
