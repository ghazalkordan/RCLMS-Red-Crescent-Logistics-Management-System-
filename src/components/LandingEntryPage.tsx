import React from 'react';
import { RedCrescentLogo } from './RedCrescentLogo';
import { Language, ThemeMode } from '../types';
import { getTranslation } from '../locales/i18n';
import { Shield, Users, Siren, Sun, Moon, Globe2, ChevronRight, Heart } from 'lucide-react';
import { RotatingGlobeBackground } from './RotatingGlobeBackground';

interface LandingEntryPageProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onSelectConsole: (consoleType: 'rescuer' | 'public') => void;
  onOpenDirectEmergency: () => void;
}

export const LandingEntryPage: React.FC<LandingEntryPageProps> = ({
  language,
  onLanguageChange,
  theme,
  onToggleTheme,
  onSelectConsole,
  onOpenDirectEmergency,
}) => {
  const isRtl = language === 'fa' || language === 'ar';

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen relative text-slate-900 dark:text-slate-100 flex flex-col justify-between overflow-hidden bg-slate-950"
    >
      {/* High Quality Background Image with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/red_crescent_rescue_1786433020735.jpg"
          alt="Red Crescent Relief Operations"
          className="w-full h-full object-cover object-center filter brightness-50 contrast-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/70 to-slate-950/90" />
      </div>

      {/* Dark Blue Atmospheric Halo Glow */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
        <div className="w-[600px] h-[600px] sm:w-[1000px] sm:h-[1000px] rounded-full bg-blue-600/25 dark:bg-cyan-500/20 blur-[130px] transform-gpu animate-pulse" />
        <div className="absolute w-[450px] h-[450px] rounded-full bg-cyan-400/20 blur-[90px] transform-gpu" />
        <div className="absolute w-[800px] h-[800px] rounded-full bg-indigo-700/15 blur-[150px] transform-gpu" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 border-b border-white/10 bg-slate-900/60 backdrop-blur-md sticky top-0 px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RedCrescentLogo size={38} />
          <div>
            <h1 className="font-extrabold text-lg sm:text-xl leading-tight text-white flex items-center gap-2 drop-shadow-md">
              {getTranslation(language, 'appName')}
            </h1>
            <p className="text-xs text-slate-300 hidden sm:block">
              {getTranslation(language, 'appSubName')}
            </p>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector */}
          <div className="relative flex items-center bg-slate-800/80 border border-slate-700/60 rounded-lg p-1 text-xs">
            <Globe2 className="w-3.5 h-3.5 mx-1 text-slate-300" />
            <button
              onClick={() => onLanguageChange('fa')}
              className={`px-2 py-1 rounded-md transition-all font-medium ${
                language === 'fa'
                  ? 'bg-[#D6001C] text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              فارسی
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-1 rounded-md transition-all font-medium ${
                language === 'en'
                  ? 'bg-[#D6001C] text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange('ar')}
              className={`px-2 py-1 rounded-md transition-all font-medium ${
                language === 'ar'
                  ? 'bg-[#D6001C] text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              العربية
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-200 hover:bg-slate-700/80 transition-all"
            title="Toggle Light / Dark Mode"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>
        </div>
      </header>

      {/* Main Landing Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-12 lg:py-16 flex-1 flex flex-col justify-center items-center w-full">
        <div className="text-center max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/30 border border-red-500/40 text-red-200 text-xs font-semibold mb-4 backdrop-blur-md">
            <RedCrescentLogo size={18} />
            {getTranslation(language, 'appName')}
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4 drop-shadow-lg">
            {getTranslation(language, 'landingTitle')}
          </h2>
          <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-medium max-w-2xl mx-auto drop-shadow-sm">
            {getTranslation(language, 'landingSubtitle')}
          </p>
        </div>

        {/* Two Main Consoles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-12">
          {/* Console 1: Crisis & Operations Command */}
          <div
            onClick={() => onSelectConsole('rescuer')}
            className="group relative bg-slate-900/80 backdrop-blur-xl border-2 border-slate-700/80 hover:border-[#D6001C] rounded-2xl p-8 shadow-2xl hover:shadow-red-900/30 transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-xl bg-red-600/20 border border-red-500/40 text-[#D6001C] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Shield className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 flex items-center justify-between">
                <span>{getTranslation(language, 'rescuerConsoleTitle')}</span>
                <ChevronRight className={`w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors ${isRtl ? 'rotate-180' : ''}`} />
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                {getTranslation(language, 'rescuerConsoleDesc')}
              </p>
            </div>

            <div className="w-full py-3.5 px-4 rounded-xl bg-[#D6001C] hover:bg-red-700 text-white font-bold text-sm text-center shadow-lg transition-colors flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              <span>{getTranslation(language, 'rescuerConsoleButton')}</span>
            </div>
          </div>

          {/* Console 2: Public / Volunteer */}
          <div
            onClick={() => onSelectConsole('public')}
            className="group relative bg-slate-900/80 backdrop-blur-xl border-2 border-slate-700/80 hover:border-blue-500 rounded-2xl p-8 shadow-2xl hover:shadow-blue-900/30 transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 flex items-center justify-between">
                <span>{getTranslation(language, 'publicConsoleTitle')}</span>
                <ChevronRight className={`w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors ${isRtl ? 'rotate-180' : ''}`} />
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                {getTranslation(language, 'publicConsoleDesc')}
              </p>
            </div>

            <div className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm text-center shadow-lg transition-colors flex items-center justify-center gap-2">
              <Heart className="w-4 h-4 text-red-300" />
              <span>{getTranslation(language, 'publicConsoleButton')}</span>
            </div>
          </div>
        </div>

        {/* Emergency Request Highlight Button */}
        <div className="w-full max-w-4xl flex justify-center">
          <button
            onClick={onOpenDirectEmergency}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#D6001C] hover:bg-red-700 text-white font-extrabold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center gap-3 animate-pulse active:scale-95 border border-red-400/30"
          >
            <Siren className="w-6 h-6 animate-bounce text-yellow-300" />
            <span>{getTranslation(language, 'emergencyButton')}</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-5 text-center text-xs text-slate-400 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <RedCrescentLogo size={22} />
            <span className="font-semibold text-slate-200">{getTranslation(language, 'appName')}</span>
          </div>
          <div>
            <span>
              {language === 'fa'
                ? 'سامانه مدیریت و فرماندهی عملیات امداد و نجات'
                : language === 'ar'
                ? 'نظام القيادة وإدارة الإغاثة'
                : 'Emergency Relief Command System'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

