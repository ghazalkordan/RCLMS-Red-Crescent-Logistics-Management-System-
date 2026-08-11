import React from 'react';
import { Language } from '../types';
import { getTranslation } from '../locales/i18n';
import { RedCrescentLogo } from './RedCrescentLogo';

interface FooterProps {
  language: Language;
  showEmergencyNumbers?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ language, showEmergencyNumbers = false }) => {
  const isRtl = language === 'fa' || language === 'ar';

  return (
    <footer className="mt-16 bg-slate-100 dark:bg-[#050505] text-slate-600 dark:text-white/40 text-[10px] uppercase tracking-wider border-t border-slate-200 dark:border-white/10 py-6 px-6 sm:px-10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <RedCrescentLogo size={24} />
          <div>
            <p className="font-bold text-xs text-slate-900 dark:text-white tracking-tight">{getTranslation(language, 'appName')}</p>
            <p className="text-[9px] text-slate-500 dark:text-white/30 tracking-wider font-light">{getTranslation(language, 'appSubName')}</p>
          </div>
        </div>

        {showEmergencyNumbers && (
          <div className="flex flex-wrap items-center justify-center gap-2 py-2 px-3 rounded-2xl bg-red-950/20 border border-red-900/30 text-xs text-white">
            <span className="font-bold text-[#D6001C] dark:text-red-400">خطوط اضطراری:</span>
            <a href="tel:112" className="px-3 py-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black font-mono shadow-xs transition">
              📞 ۱۱۲ امداد هلال احمر
            </a>
            <a href="tel:115" className="px-3 py-1 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black font-mono shadow-xs transition">
              🚑 ۱۱۵ اورژانس
            </a>
            <a href="tel:125" className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black font-mono shadow-xs transition">
              🚒 ۱۲۵ آتش‌نشانی
            </a>
            <a href="tel:110" className="px-3 py-1 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black font-mono shadow-xs transition">
              🚓 ۱۱۰ پلیس
            </a>
          </div>
        )}

        <div className="text-center sm:text-right rtl:sm:text-left text-[9px] text-slate-500 dark:text-white/30 space-y-1 tracking-wider">
          <p className="text-[#D6001C] dark:text-red-400 font-semibold">
            {isRtl
              ? 'سامانه هوشمند پشتیبانی از تصمیم‌گیری لجستیک بحران (LP/MILP & Location-Routing GA)'
              : 'Smart Crisis Logistics Decision Support System (MILP Allocation & GA Routing Engine)'}
          </p>
          <p>© {new Date().getFullYear()} Iranian Red Crescent Society & Research Operations Team</p>
        </div>
      </div>
    </footer>
  );
};
