import React from 'react';
import {
  DisasterEvent,
  EmergencyRequest,
  LpSolverResult,
  GaSolverResult,
  Warehouse,
  ShelterCandidate,
  TransportVehicle,
  HelicopterAircraft,
  Language,
} from '../types';
import { getTranslation } from '../locales/i18n';
import {
  AlertTriangle,
  Users,
  Building2,
  Clock,
  Truck,
  CheckCircle2,
  TrendingUp,
  RotateCw,
  Zap,
  ShieldAlert,
  ArrowRight,
  Activity,
  HeartPulse,
  Fuel,
  Package,
  Compass,
  Flame,
  MapPin,
} from 'lucide-react';

interface CommandCenterProps {
  language: Language;
  disaster: DisasterEvent;
  emergencyRequests: EmergencyRequest[];
  lpResult: LpSolverResult;
  gaResult: GaSolverResult;
  warehouses: Warehouse[];
  shelters: ShelterCandidate[];
  trucks: TransportVehicle[];
  helicopters: HelicopterAircraft[];
  onRunOptimization: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenChatbot: (prompt?: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  language,
  disaster,
  emergencyRequests,
  lpResult,
  gaResult,
  warehouses,
  shelters,
  trucks,
  helicopters,
  onRunOptimization,
  onNavigateTab,
  onOpenChatbot,
}) => {
  const isRtl = language === 'fa' || language === 'ar';
  const isStale = lpResult.isStale || gaResult.isStale;

  const totalWarehouseCapacity = warehouses.reduce((s, w) => s + w.capacityM3, 0);
  const totalWarehouseUsed = warehouses.reduce((s, w) => s + w.usedM3, 0);
  const totalShelterCapacity = shelters.reduce((s, sh) => s + sh.capacityPeople, 0);
  const totalShelterOccupancy = shelters.reduce((s, sh) => s + sh.currentOccupancy, 0);

  const activeVehiclesCount = trucks.filter((t) => t.status === 'in_transit' || t.status === 'available').length;
  const readyHelisCount = helicopters.filter((h) => !h.weatherGated && h.status !== 'grounded_weather').length;

  return (
    <div className="space-y-6">
      {/* Zone 1: Situation Banner */}
      <div className="bg-white dark:bg-[#14141a] text-slate-900 dark:text-white rounded-2xl p-6 border border-slate-200 dark:border-[#262630] shadow-sm relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-[#D6001C]"></div>
        <div className="flex flex-wrap items-center justify-between gap-6 pt-1">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-[#D6001C] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {isRtl ? '🚨 بحران فعال ملی' : '🚨 ACTIVE CRISIS'}
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-xs font-mono">
                {getTranslation(language, 'lastUpdated')}: {new Date().toLocaleTimeString(language === 'fa' ? 'fa-IR' : 'en-US')}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {disaster.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-3xl leading-relaxed font-normal">
              {disaster.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isStale && (
              <div className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 text-xs px-3.5 py-2 rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-xs font-bold">{getTranslation(language, 'staleDataWarning')}</span>
              </div>
            )}

            <button
              onClick={onRunOptimization}
              className="bg-[#D6001C] hover:bg-[#b80018] text-white px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition-colors"
            >
              <RotateCw className="w-4 h-4" />
              <span>{getTranslation(language, 'runOptimization')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Zone 2: Humanitarian KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Service Level Coverage */}
        <div className="bg-white dark:bg-[#14141a] p-5 border border-slate-200 dark:border-[#262630] rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#D6001C]">
              {getTranslation(language, 'cc_serviceLevel')}
            </p>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {gaResult.coveragePercent}%
            </h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{isRtl ? 'تضمین حداقل کف خدمت' : 'Above min floor'}</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl border border-red-100 dark:border-red-900/40 text-[#D6001C] bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Response Time */}
        <div className="bg-white dark:bg-[#14141a] p-5 border border-slate-200 dark:border-[#262630] rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#D6001C]">
              {getTranslation(language, 'cc_avgResponseTime')}
            </p>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {gaResult.avgResponseTimeMinutes} <span className="text-sm font-normal text-slate-500">{isRtl ? 'دقیقه' : 'min'}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
              {isRtl ? 'ارسال هوابرد برای کوهستان' : 'Air corridor dispatched'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl border border-slate-200 dark:border-[#2e2e3d] text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#1a1a22] flex items-center justify-center">
            <Clock className="w-6 h-6 text-[#D6001C]" />
          </div>
        </div>

        {/* KPI 3: Active Emergency Requests */}
        <div className="bg-white dark:bg-[#14141a] p-5 border border-slate-200 dark:border-[#262630] rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#D6001C]">
              {getTranslation(language, 'cc_activeRequests')}
            </p>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {emergencyRequests.length}
            </h3>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 font-semibold">
              {emergencyRequests.filter((r) => r.priority === 'critical' || r.immediateDanger).length}{' '}
              {isRtl ? 'درخواست بحرانی' : 'critical alerts'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl border border-amber-200 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: Objective Function Z */}
        <div className="bg-white dark:bg-[#14141a] p-5 border border-slate-200 dark:border-[#262630] rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#D6001C]">
              {getTranslation(language, 'lp_objectiveValue')}
            </p>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {Math.round(lpResult.objectiveValue / 1000).toLocaleString()} k
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
              {isRtl ? 'بهینه شده با LP Solver' : 'Optimized via LP Engine'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl border border-red-100 dark:border-red-900/40 text-[#D6001C] bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Zone 3 & 4: Resources & GIS Quick Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resource Status */}
        <div className="bg-white dark:bg-[#14141a] p-6 border border-slate-200 dark:border-[#262630] rounded-2xl shadow-xs space-y-6">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-[#D6001C]" />
            <span>{isRtl ? 'وضعیت منابع و آمادگی انبارها' : 'Resource & Warehouse Status'}</span>
          </h3>

          {/* Warehouse Capacity Progress */}
          <div>
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-2 font-medium">
              <span>{getTranslation(language, 'cc_warehouseStock')}</span>
              <span className="font-mono text-slate-900 dark:text-white font-bold">
                {totalWarehouseUsed.toLocaleString()} / {totalWarehouseCapacity.toLocaleString()} m³
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-[#20202a] border border-slate-200 dark:border-[#2e2e3d] h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-[#D6001C] h-full transition-all"
                style={{ width: `${Math.round((totalWarehouseUsed / totalWarehouseCapacity) * 100)}%` }}
              />
            </div>
          </div>

          {/* Shelter Occupancy */}
          <div>
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-2 font-medium">
              <span>{getTranslation(language, 'cc_shelterOccupancy')}</span>
              <span className="font-mono text-slate-900 dark:text-white font-bold">
                {totalShelterOccupancy.toLocaleString()} / {totalShelterCapacity.toLocaleString()}{' '}
                {isRtl ? 'نفر' : 'people'}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-[#20202a] border border-slate-200 dark:border-[#2e2e3d] h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-red-400 h-full transition-all"
                style={{ width: `${Math.round((totalShelterOccupancy / totalShelterCapacity) * 100)}%` }}
              />
            </div>
          </div>

          {/* Fleet Readiness */}
          <div className="pt-4 border-t border-slate-200 dark:border-[#262630] grid grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-[#181820] p-3.5 rounded-xl border border-slate-200 dark:border-[#282835]">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase flex items-center gap-1.5 mb-1">
                <Truck className="w-3.5 h-3.5 text-[#D6001C]" />
                <span>{isRtl ? 'کامیون‌های آماده' : 'Ready Trucks'}</span>
              </p>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                {activeVehiclesCount} / {trucks.length}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-[#181820] p-3.5 rounded-xl border border-slate-200 dark:border-[#282835]">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase flex items-center gap-1.5 mb-1">
                <Zap className="w-3.5 h-3.5 text-[#D6001C]" />
                <span>{isRtl ? 'بالگردهای آماده' : 'Helicopters Ready'}</span>
              </p>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                {readyHelisCount} / {helicopters.length}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('lp_lab')}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#1c1c24] dark:hover:bg-[#242430] border border-slate-200 dark:border-[#2e2e3d] rounded-xl text-xs font-bold text-[#D6001C] dark:text-red-400 transition-colors"
          >
            {isRtl ? 'مشاهده جزئیات مانیفست بارگیری' : 'View Full Cargo Manifest'}
          </button>
        </div>

        {/* GIS Map Vector Thumbnail */}
        <div className="lg:col-span-2 bg-white dark:bg-[#14141a] p-6 border border-slate-200 dark:border-[#262630] rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-[#D6001C]" />
              <span>{isRtl ? 'نقشه زنده عملیات امداد و راه‌های آسیب‌دیده' : 'Live Operations GIS Network Map'}</span>
            </h3>
            <button
              onClick={() => onNavigateTab('gis_map')}
              className="text-xs text-[#D6001C] hover:underline font-bold"
            >
              {isRtl ? 'نقشه کامل (Full GIS) →' : 'Full Interactive Map →'}
            </button>
          </div>

          {/* Map Vector Graphic */}
          <div className="relative w-full h-64 bg-slate-50 dark:bg-[#0c0c10] border border-slate-200 dark:border-[#262630] rounded-xl overflow-hidden flex items-center justify-center p-4">
            <svg className="w-full h-full text-slate-400 dark:text-slate-600" viewBox="0 0 600 350">
              {/* Background Grid */}
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Road Network Edges */}
              <line x1="120" y1="180" x2="220" y2="120" stroke="#D6001C" strokeWidth="2.5" />
              <line x1="220" y1="120" x2="340" y2="150" stroke="#D6001C" strokeWidth="2.5" />
              <line x1="340" y1="150" x2="420" y2="220" stroke="currentColor" strokeOpacity="0.4" strokeWidth="2" strokeDasharray="5,5" />
              {/* Blocked road to Paveh */}
              <line x1="340" y1="150" x2="460" y2="90" stroke="#ef4444" strokeWidth="3" />
              <text x="390" y="110" fill="#ef4444" fontSize="10" fontWeight="bold">
                ✕ ROAD BLOCKED
              </text>

              {/* Air Corridor to Paveh */}
              <path d="M 340 150 Q 400 80 460 90" fill="none" stroke="#D6001C" strokeWidth="2" strokeDasharray="4,4" />

              {/* Nodes: Warehouses */}
              <g transform="translate(120, 180)">
                <circle r="12" fill="#D6001C" />
                <text x="0" y="24" fill="currentColor" fontSize="10" textAnchor="middle" fontWeight="bold">WH Tehran</text>
              </g>

              <g transform="translate(340, 150)">
                <circle r="14" fill="#D6001C" />
                <text x="0" y="26" fill="currentColor" fontSize="10" textAnchor="middle" fontWeight="bold">Kermanshah Hub</text>
              </g>

              {/* Nodes: Affected Areas */}
              <g transform="translate(420, 220)">
                <circle r="10" fill="#ef4444" />
                <text x="0" y="22" fill="currentColor" fontSize="10" textAnchor="middle">Sarpol-e Zahab</text>
              </g>

              <g transform="translate(460, 90)">
                <circle r="10" fill="#ef4444" />
                <text x="0" y="22" fill="currentColor" fontSize="10" textAnchor="middle">Paveh (Air Drop)</text>
              </g>

              {/* Animated Heli icon on air corridor */}
              <circle cx="400" cy="115" r="5" fill="#D6001C" className="animate-ping" />
            </svg>

            {/* Map Legend */}
            <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-[#14141a]/95 border border-slate-200 dark:border-[#262630] p-2.5 rounded-lg text-[10px] uppercase font-bold text-slate-700 dark:text-slate-300 space-y-1 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D6001C] inline-block"></span>
                <span>{isRtl ? 'انبار و هاب لجستیک' : 'Warehouse / Hub'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                <span>{isRtl ? 'منطقه آسیب‌دیده' : 'Affected Area'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 bg-[#D6001C] inline-block"></span>
                <span>{isRtl ? 'دالان پرواز بالگرد' : 'Air Flight Corridor'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zone 4.5: 10 Advanced Humanitarian Operations Modules Launcher */}
      <div className="bg-white dark:bg-[#14141a] p-6 border border-slate-200 dark:border-[#262630] rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#262630] pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/60 text-[#D6001C]">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>{isRtl ? '۱۰ ماژول تخصصی عملیات امداد و نجات' : '10 Advanced Operations Modules'}</span>
                <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/50 text-[#D6001C] dark:text-red-400 text-[10px] font-mono font-black border border-red-200 dark:border-red-900/50">
                  Decision Support
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isRtl ? 'سامانه‌های محاسباتی، بهینه‌سازی، شبیه‌سازی و صدور گزارش‌های PDF عملیاتی' : 'Real mathematical models, optimization solvers, and dynamic PDF reporting'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <button
            onClick={() => onNavigateTab('team_allocation')}
            className="p-3 bg-slate-50 hover:bg-red-50 dark:bg-[#181822] dark:hover:bg-[#222232] border border-slate-200 dark:border-[#282838] rounded-xl text-right transition-all group cursor-pointer"
          >
            <Users className="w-5 h-5 text-[#D6001C] mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-slate-900 dark:text-white">۱. تخصیص تیم‌های امداد</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">مدل MILP تطابق مهارت</div>
          </button>

          <button
            onClick={() => onNavigateTab('incident_priority')}
            className="p-3 bg-slate-50 hover:bg-red-50 dark:bg-[#181822] dark:hover:bg-[#222232] border border-slate-200 dark:border-[#282838] rounded-xl text-right transition-all group cursor-pointer"
          >
            <Flame className="w-5 h-5 text-[#D6001C] mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-slate-900 dark:text-white">۲. اولویت‌بندی حوادث</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">الگوریتم AHP و وزن‌دهی</div>
          </button>

          <button
            onClick={() => onNavigateTab('casualty_hospital')}
            className="p-3 bg-slate-50 hover:bg-red-50 dark:bg-[#181822] dark:hover:bg-[#222232] border border-slate-200 dark:border-[#282838] rounded-xl text-right transition-all group cursor-pointer"
          >
            <HeartPulse className="w-5 h-5 text-[#D6001C] mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-slate-900 dark:text-white">۳. اعزام به بیمارستان</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">موازنه ظرفیت ICU و تریاژ</div>
          </button>

          <button
            onClick={() => onNavigateTab('fleet_fuel')}
            className="p-3 bg-slate-50 hover:bg-red-50 dark:bg-[#181822] dark:hover:bg-[#222232] border border-slate-200 dark:border-[#282838] rounded-xl text-right transition-all group cursor-pointer"
          >
            <Fuel className="w-5 h-5 text-[#D6001C] mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-slate-900 dark:text-white">۴. بهینه‌سازی سوخت</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">مدل VRP و مصرف سوخت</div>
          </button>

          <button
            onClick={() => onNavigateTab('supply_forecast')}
            className="p-3 bg-slate-50 hover:bg-red-50 dark:bg-[#181822] dark:hover:bg-[#222232] border border-slate-200 dark:border-[#282838] rounded-xl text-right transition-all group cursor-pointer"
          >
            <Package className="w-5 h-5 text-[#D6001C] mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-slate-900 dark:text-white">۵. پیش‌بینی تقاضا</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">مدل تخمین جیره و اسکان</div>
          </button>

          <button
            onClick={() => onNavigateTab('shelter_capacity')}
            className="p-3 bg-slate-50 hover:bg-red-50 dark:bg-[#181822] dark:hover:bg-[#222232] border border-slate-200 dark:border-[#282838] rounded-xl text-right transition-all group cursor-pointer"
          >
            <Building2 className="w-5 h-5 text-[#D6001C] mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-slate-900 dark:text-white">۶. بهینه‌سازی اسکان</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">مدل سرریز ظرفیت پناهگاه</div>
          </button>

          <button
            onClick={() => onNavigateTab('heli_mission')}
            className="p-3 bg-slate-50 hover:bg-red-50 dark:bg-[#181822] dark:hover:bg-[#222232] border border-slate-200 dark:border-[#282838] rounded-xl text-right transition-all group cursor-pointer"
          >
            <Compass className="w-5 h-5 text-[#D6001C] mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-slate-900 dark:text-white">۷. پروازهای بالگردی</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">مسیریابی هوایی و وینچینگ</div>
          </button>

          <button
            onClick={() => onNavigateTab('disaster_spread')}
            className="p-3 bg-slate-50 hover:bg-red-50 dark:bg-[#181822] dark:hover:bg-[#222232] border border-slate-200 dark:border-[#282838] rounded-xl text-right transition-all group cursor-pointer"
          >
            <TrendingUp className="w-5 h-5 text-[#D6001C] mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-slate-900 dark:text-white">۸. شبیه‌ساز پیشروی</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">مدل انتشار T+0 تا T+72</div>
          </button>

          <button
            onClick={() => onNavigateTab('shift_optimization')}
            className="p-3 bg-slate-50 hover:bg-red-50 dark:bg-[#181822] dark:hover:bg-[#222232] border border-slate-200 dark:border-[#282838] rounded-xl text-right transition-all group cursor-pointer"
          >
            <Clock className="w-5 h-5 text-[#D6001C] mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-slate-900 dark:text-white">۹. شیفت‌بندی نیروها</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">برنامه‌ریزی رست و شیفت</div>
          </button>

          <button
            onClick={() => onNavigateTab('base_location')}
            className="p-3 bg-slate-50 hover:bg-red-50 dark:bg-[#181822] dark:hover:bg-[#222232] border border-slate-200 dark:border-[#282838] rounded-xl text-right transition-all group cursor-pointer"
          >
            <MapPin className="w-5 h-5 text-[#D6001C] mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-slate-900 dark:text-white">۱۰. مکان‌یابی پایگاه</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">مدل p-Median و MCLP</div>
          </button>
        </div>
      </div>

      {/* Zone 5: Expanded AI Analysis */}
      <div className="bg-white dark:bg-[#14141a] p-6 border border-slate-200 dark:border-[#262630] rounded-2xl shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-[#262630]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/60 text-[#D6001C]">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span>سامانه تحلیل هوشمند و تصمیم‌یار عملیاتی (AI Engine)</span>
                <span className="px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/50 text-[#D6001C] dark:text-red-400 text-[10px] font-mono font-black border border-red-200 dark:border-red-900/50 uppercase">
                  Grounded Gemini AI
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                پردازش زنده داده‌های لجستیک، محاسبه قیمت‌های سایه (Shadow Prices) و بهینه‌سازی توزیع عادلانه
              </p>
            </div>
          </div>
        </div>

        {/* AI Key Insights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Insight Card 1 */}
          <div className="bg-slate-50 dark:bg-[#181820] border border-slate-200 dark:border-[#282835] p-4.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#D6001C] uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>تحلیل قیمت سایه (Shadow Price Analysis)</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/50 text-[#D6001C] text-[10px] font-bold">
                تنگنای کمبود
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              قیمت سایه کیت‌های دارویی ۵,۰۰۰ واحد محاسبه گردید. تخصیص مجدد ۱۰۰ کیت ترومای اضافه از انبار تهران به منطقه زلزله‌زده، نرخ جریمه کمبود حیاتی را تا ۵۰۰,۰۰۰ واحد کاهش خواهد داد.
            </p>
          </div>

          {/* Insight Card 2 */}
          <div className="bg-slate-50 dark:bg-[#181820] border border-slate-200 dark:border-[#282835] p-4.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>تعدیل خودکار ناوگان و کریدور پروازی (GA VRP)</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                هوافضای امدادی
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              الگوریتم ژنتیک به علت مسدود شدن راه زمینی کوهستانی، پرواز ترابری بالگرد می-۱۷ را به صورتی اتوماتیک جایگزین کامیون کرده و زمان وصول امداد را ۴۵ دقیقه کاهش داد.
            </p>
          </div>
        </div>

        {/* Pre-defined Prompt Buttons (پیام‌های آماده هوش مصنوعی) */}
        <div className="pt-2">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2.5 flex items-center gap-1.5">
            <span>✨ پرومپت‌های هوشمند آماده (جهت پرسش فوری از هوش مصنوعی کلیک کنید):</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <button
              onClick={() => onOpenChatbot('لطفاً تحلیل کامل تخصیص چادر اسکلتی، میزان کمبود و قیمت سایه (Shadow Price) را ارائه دهید.')}
              className="p-3 rounded-xl bg-slate-100 hover:bg-red-50 dark:bg-[#181822] dark:hover:bg-[#252535] border border-slate-200 dark:border-[#2e2e3e] text-right transition-colors group cursor-pointer"
            >
              <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#D6001C] transition-colors mb-1">
                📊 تحلیل کامل تخصیص چادر
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                بررسی کمبود و قیمت سایه چادر اسکلتی در ۱۰ منطقه اصلی
              </div>
            </button>

            <button
              onClick={() => onOpenChatbot('وضعیت انسداد جاده‌ها و ریسک تخصیص ناوگان بالگردی و زمینی به مناطق کوهستانی را تحلیل کنید.')}
              className="p-3 rounded-xl bg-slate-100 hover:bg-red-50 dark:bg-[#181822] dark:hover:bg-[#252535] border border-slate-200 dark:border-[#2e2e3e] text-right transition-colors group cursor-pointer"
            >
              <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#D6001C] transition-colors mb-1">
                🚨 ارزیابی ریسک راه‌های کشور
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                ارزیابی انسداد محورهای کوهستانی و تخصیص بالگردها
              </div>
            </button>

            <button
              onClick={() => onOpenChatbot('شاخص عدالت توزیع (Fairness Index) و میزان پوشش تقاضای مناطق محروم را تحلیل فرمایید.')}
              className="p-3 rounded-xl bg-slate-100 hover:bg-red-50 dark:bg-[#181822] dark:hover:bg-[#252535] border border-slate-200 dark:border-[#2e2e3e] text-right transition-colors group cursor-pointer"
            >
              <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#D6001C] transition-colors mb-1">
                ⚖️ شاخص عدالت توزیع (Fairness)
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                تحلیل میزان پوشش نیازهای حیاتی و شکاف عدالت
              </div>
            </button>

            <button
              onClick={() => onOpenChatbot('خلاصه مانیفست ابلاغی و دستورالعمل اجرایی برای ستاد مدیریت بحران هلال احمر را صادر کنید.')}
              className="p-3 rounded-xl bg-slate-100 hover:bg-red-50 dark:bg-[#181822] dark:hover:bg-[#252535] border border-slate-200 dark:border-[#2e2e3e] text-right transition-colors group cursor-pointer"
            >
              <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#D6001C] transition-colors mb-1">
                📜 دستورالعمل فوری تخصیص
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                تنظیم مانیفست ابلاغی برای ستاد مدیریت بحران
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

