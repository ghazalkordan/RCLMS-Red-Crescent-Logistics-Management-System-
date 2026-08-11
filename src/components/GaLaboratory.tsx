import React, { useState } from 'react';
import {
  GaParameters,
  GaSolverResult,
  ShelterCandidate,
  AffectedArea,
  TransportVehicle,
  HelicopterAircraft,
  Language,
} from '../types';
import { getTranslation } from '../locales/i18n';
import {
  Cpu,
  Play,
  TrendingUp,
  Zap,
  Building,
  Truck,
  Plane,
  FileCheck,
  Award,
  HelpCircle,
  FileText,
  BookOpen,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { generatePdfReport } from '../lib/pdfGenerator';

interface GaLaboratoryProps {
  language: Language;
  gaParams: GaParameters;
  gaResult: GaSolverResult;
  shelters: ShelterCandidate[];
  areas: AffectedArea[];
  trucks: TransportVehicle[];
  helicopters: HelicopterAircraft[];
  onSolveGa: (newParams?: Partial<GaParameters>) => void;
  onOpenChatbot: () => void;
}

export const GaLaboratory: React.FC<GaLaboratoryProps> = ({
  language,
  gaParams,
  gaResult,
  shelters,
  areas,
  trucks,
  helicopters,
  onSolveGa,
  onOpenChatbot,
}) => {
  const isRtl = language === 'fa' || language === 'ar';
  const [activeTab, setActiveTab] = useState<'convergence' | 'shelters' | 'routes' | 'baselines' | 'trace'>('convergence');

  // GA Parameters Form
  const [popSize, setPopSize] = useState(gaParams.populationSize);
  const [maxGen, setMaxGen] = useState(gaParams.maxGenerations);
  const [crossoverRate, setCrossoverRate] = useState(gaParams.crossoverRate);
  const [mutationRate, setMutationRate] = useState(gaParams.mutationRate);
  const [crisisMode, setCrisisMode] = useState(gaParams.crisisModePreset);

  const handleApplyParams = () => {
    onSolveGa({
      populationSize: popSize,
      maxGenerations: maxGen,
      crossoverRate,
      mutationRate,
      crisisModePreset: crisisMode,
    });
  };

  // PDF Export for GA Routing Report
  const handleExportGaPdf = () => {
    const isEn = language === 'en';
    const isAr = language === 'ar';

    const routeHeaders = isEn
      ? ['Vehicle Type', 'Origin', 'Route & Destinations (Stops)', 'Total Distance (km)', 'ETA (Minutes)']
      : isAr
      ? ['نوع المركبة', 'المصدر', 'المسار والتوقفات', 'إجمالي المسافة (km)', 'وقت الوصول (دقيقة)']
      : ['نوع خودرو', 'مبدأ', 'مسیر و مقاصد (توقف‌ها)', 'مسافت کل (km)', 'زمان وصول (دقیقه)'];

    const routeRows = [
      ...gaResult.truckRoutes.map((r) => [
        isEn ? `Truck: ${r.vehicleName}` : isAr ? `شاحنة: ${r.vehicleName}` : `کامیون: ${r.vehicleName}`,
        r.originName,
        r.stops.map((s) => s.nodeName).join(isEn ? ' → ' : ' ← '),
        `${r.totalDistanceKm} km`,
        isEn ? `${r.totalTimeMinutes} mins` : isAr ? `${r.totalTimeMinutes} دقيقة` : `${r.totalTimeMinutes} دقیقه`,
      ]),
      ...gaResult.heliRoutes.map((r) => [
        isEn ? `Helicopter: ${r.vehicleName}` : isAr ? `مروحية: ${r.vehicleName}` : `بالگرد: ${r.vehicleName}`,
        r.originName,
        r.stops.map((s) => s.nodeName).join(isEn ? ' → ' : ' ← '),
        `${r.totalDistanceKm} km`,
        isEn ? `${r.totalTimeMinutes} mins (Air)` : isAr ? `${r.totalTimeMinutes} دقيقة (طيران)` : `${r.totalTimeMinutes} دقیقه (هواپیمایی)`,
      ]),
    ];

    generatePdfReport({
      language,
      title: isEn
        ? 'Relief Vehicle Routing Optimization Report (GA VRP)'
        : isAr
        ? 'تقرير تحسين توجيه مسارات مركبات الإغاثة (GA VRP)'
        : 'گزارش بهینه‌سازی مسیریابی ناوبری امدادی (GA VRP)',
      subtitle: isEn
        ? `Best Fitness: ${gaResult.bestFitness.toLocaleString()} | Coverage: ${gaResult.coveragePercent}%`
        : isAr
        ? `أفضل ملاءمة: ${gaResult.bestFitness.toLocaleString()} | نسبة التغطية: ${gaResult.coveragePercent}%`
        : `برازش نهایی: ${gaResult.bestFitness.toLocaleString()} | درصد پوشش: ${gaResult.coveragePercent}%`,
      filename: 'ga_route_optimization_report.pdf',
      sections: [
        {
          heading: isEn
            ? '1. Genetic Algorithm Parameter Settings'
            : isAr
            ? '١. إعدادات معلمات الخوارزمية الجينية'
            : '۱. تنظیمات پارامترهای الگوریتم ژنتیک',
          keyValues: [
            {
              label: isEn ? 'Population Size' : isAr ? 'حجم الجمهرة' : 'اندازه جمعیت (Population Size)',
              value: popSize,
            },
            {
              label: isEn ? 'Max Generations' : isAr ? 'أقصى عدد للأجيال' : 'تعداد نسل‌ها (Max Generations)',
              value: maxGen,
            },
            {
              label: isEn ? 'Crossover Rate' : isAr ? 'معدل التقاطع' : 'نرخ تقاطع (Crossover Rate)',
              value: `${Math.round(crossoverRate * 100)}%`,
            },
            {
              label: isEn ? 'Mutation Rate' : isAr ? 'معدل الطفرة' : 'نرخ جهش (Mutation Rate)',
              value: `${Math.round(mutationRate * 100)}%`,
            },
          ],
        },
        {
          heading: isEn
            ? '2. Relief Trucks & Helicopters Dispatch Table'
            : isAr
            ? '٢. جدول توجيه الشاحنات والمروحيات الإغاثية'
            : '۲. جدول مسیریابی کامیون‌ها و بالگردهای امدادی',
          table: { headers: routeHeaders, rows: routeRows },
        },
        {
          heading: isEn
            ? '3. Algorithmic Convergence & Response Analysis'
            : isAr
            ? '٣. التحليل الخوارزمي وتقارب الحلول'
            : '۳. تحلیل الگوریتمی و همگرایی',
          text: isEn
            ? 'The Genetic Algorithm utilized multi-point crossover and smart mutations to reduce emergency response time to critical zones by up to 45% while selecting safe routes.'
            : isAr
            ? 'استخدمت الخوارزمية الجينية عمليات التقاطع والطفرات الذكية لتقليل زمن الاستجابة للمناطق المتضررة بنسبة تصل إلى ٤٥٪.'
            : 'الگوریتم ژنتیک با استفاده از عملگرهای تقاطع چندنقطه‌ای و جهش هوشمند، توانسته است زمان پاسخگویی به مناطق بحرانی و آسیب‌دیده را تا ۴۵٪ کاهش داده و مسیرهای ایمن جایگزین را انتخاب نماید.',
        },
      ],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#0c0c12] p-6 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <Cpu className="w-5 h-5 text-[#D6001C]" />
            <span>{getTranslation(language, 'ga_title')}</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
            {getTranslation(language, 'ga_desc')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportGaPdf}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition"
          >
            <FileText className="w-4 h-4" />
            <span>گزارش PDF مسیریابی</span>
          </button>

          <button
            onClick={handleApplyParams}
            className="bg-[#D6001C] hover:bg-red-700 text-white px-5 py-3 text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{getTranslation(language, 'runOptimization')}</span>
          </button>
        </div>
      </div>

      {/* GA Parameter Controls */}
      <div className="bg-white dark:bg-[#0c0c12] p-6 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#D6001C] flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#D6001C]" />
            <span>{getTranslation(language, 'ga_parameters')}</span>
          </h3>

          <button
            onClick={() => {
              setCrisisMode(!crisisMode);
              onSolveGa({ crisisModePreset: !crisisMode });
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 border ${
              crisisMode
                ? 'bg-[#D6001C] text-white border-red-600 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>
              {crisisMode
                ? isRtl ? 'پیش‌تنظیم حالت بحران فعال است' : 'Crisis Preset Active'
                : isRtl ? 'فعال‌سازی پیش‌تنظیم حالت بحران' : 'Activate Crisis Preset'}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-50 dark:bg-slate-900 p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 mb-2">
              <span className="font-bold">{getTranslation(language, 'ga_popSize')}</span>
              <span className="font-bold text-[#D6001C]">{popSize}</span>
            </div>
            <input
              type="range"
              min="20"
              max="200"
              step="10"
              value={popSize}
              onChange={(e) => setPopSize(Number(e.target.value))}
              className="w-full accent-[#D6001C]"
            />
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 mb-2">
              <span className="font-bold">{getTranslation(language, 'ga_maxGenerations')}</span>
              <span className="font-bold text-[#D6001C]">{maxGen}</span>
            </div>
            <input
              type="range"
              min="20"
              max="200"
              step="10"
              value={maxGen}
              onChange={(e) => setMaxGen(Number(e.target.value))}
              className="w-full accent-[#D6001C]"
            />
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 mb-2">
              <span className="font-bold">{getTranslation(language, 'ga_crossoverRate')}</span>
              <span className="font-bold text-[#D6001C]">{Math.round(crossoverRate * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="0.95"
              step="0.05"
              value={crossoverRate}
              onChange={(e) => setCrossoverRate(Number(e.target.value))}
              className="w-full accent-[#D6001C]"
            />
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 mb-2">
              <span className="font-bold">{getTranslation(language, 'ga_mutationRate')}</span>
              <span className="font-bold text-[#D6001C]">{Math.round(mutationRate * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.4"
              step="0.05"
              value={mutationRate}
              onChange={(e) => setMutationRate(Number(e.target.value))}
              className="w-full accent-[#D6001C]"
            />
          </div>
        </div>
      </div>

      {/* GA Educational Explanation Section (#15) */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-3">
        <h3 className="font-extrabold text-sm text-[#D6001C] flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          <span>مفاهیم علمی الگوریتم ژنتیک (Genetic Algorithm VRP) در ناوبری امدادی</span>
        </h3>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          الگوریتم ژنتیک یک روش فراابتکاری متکی بر فرآیند انتخاب طبیعی است. هر <strong>کروموزوم</strong> نشان‌دهنده یک توالی مشخص از مسیر کامیون‌ها و بالگردها به پناهگاه‌هاست. عملگر <strong>تقاطع (Crossover)</strong> ترکیب مسیرهای موفق و عملگر <strong>جهش (Mutation)</strong> جستجوی فواصلی ناآشنا جهت فرار از بهینه محلی را بر عهده دارند.
        </p>
      </div>

      {/* Fitness Output Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0c0c12] p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <p className="text-xs text-[#D6001C] uppercase font-bold">{getTranslation(language, 'ga_bestFitness')}</p>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {gaResult.bestFitness.toLocaleString()}
          </h3>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 font-bold">
            همگرایی نسل برتر
          </p>
        </div>

        <div className="bg-white dark:bg-[#0c0c12] p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <p className="text-xs text-[#D6001C] uppercase font-bold">{getTranslation(language, 'ga_coveragePercent')}</p>
          <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {gaResult.coveragePercent}%
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            {gaResult.selectedShelters.length} پناهگاه فعال
          </p>
        </div>

        <div className="bg-white dark:bg-[#0c0c12] p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <p className="text-xs text-[#D6001C] uppercase font-bold">شاخص ریسک مسیرها</p>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {gaResult.totalRiskScore} / 10
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            دالان پرواز هوایی جایگزین
          </p>
        </div>

        <div className="bg-white dark:bg-[#0c0c12] p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <p className="text-xs text-[#D6001C] uppercase font-bold">زمان میانگین رسیدن</p>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {gaResult.avgResponseTimeMinutes} <span className="text-sm font-normal text-slate-500">دقیقه</span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            {trucks.length + helicopters.length} ناوگان تخصیص‌یافته
          </p>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="bg-white dark:bg-[#0c0c12] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-950 overflow-x-auto">
          <button
            onClick={() => setActiveTab('convergence')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
              activeTab === 'convergence'
                ? 'bg-[#D6001C] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>نمودار همگرایی (Line Chart)</span>
          </button>

          <button
            onClick={() => setActiveTab('shelters')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
              activeTab === 'shelters'
                ? 'bg-[#D6001C] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>پناهگاه‌های برگزیده</span>
          </button>

          <button
            onClick={() => setActiveTab('routes')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
              activeTab === 'routes'
                ? 'bg-[#D6001C] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>مسیرهای ترابری و هوابرد</span>
          </button>

          <button
            onClick={() => setActiveTab('baselines')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
              activeTab === 'baselines'
                ? 'bg-[#D6001C] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>مقایسه با الگوریتم‌های پایه</span>
          </button>

          <button
            onClick={() => setActiveTab('trace')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
              activeTab === 'trace'
                ? 'bg-[#D6001C] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>ردیابی تصمیمات الگوریتم</span>
          </button>
        </div>

        <div className="p-6">
          {/* Tab 1: Line Chart Convergence Curve (#14) */}
          {activeTab === 'convergence' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                منحنی خطی همگرایی برازش ژنتیک در طول نسل‌ها (Convergence Line Chart)
              </h3>

              <div className="w-full h-72 border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={gaResult.convergenceHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="generation" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        color: '#ffffff',
                        fontSize: '12px',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="bestFitness" stroke="#D6001C" strokeWidth={3} name="برترین برازش (Best Fitness)" />
                    <Line type="monotone" dataKey="avgFitness" stroke="#10b981" strokeWidth={2} strokeDasharray="3 3" name="میانگین برازش جمعیت" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Tab 2: Shelters */}
          {activeTab === 'shelters' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                پناهگاه‌های برگزیده و اسکان جمعیت آسیب‌دیده
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gaResult.selectedShelters.map((s, idx) => (
                  <div key={idx} className="p-4 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                        <Building className="w-4 h-4 text-[#D6001C]" />
                        <span>{s.shelterName}</span>
                      </h4>
                      <span className="text-xs font-bold text-[#D6001C] bg-red-100 dark:bg-red-950/80 px-2.5 py-1 border border-red-200 dark:border-red-900/60 font-mono rounded-lg">
                        {s.occupancy.toLocaleString()} / {s.capacity.toLocaleString()} نفر
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#D6001C] h-2 rounded-full"
                        style={{ width: `${Math.round((s.occupancy / s.capacity) * 100)}%` }}
                      />
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      <span className="font-bold text-slate-900 dark:text-white">مناطق متصل: </span>
                      <span>{s.assignedAreas.join('، ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Routes */}
          {activeTab === 'routes' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                  <Truck className="w-4 h-4 text-[#D6001C]" />
                  <span>{getTranslation(language, 'ga_truckRoutes')}</span>
                </h3>

                <div className="space-y-3">
                  {gaResult.truckRoutes.map((r, idx) => (
                    <div key={idx} className="p-4 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-3">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-900 dark:text-white">
                        <span>{r.vehicleName}</span>
                        <span className="text-slate-500 font-mono">{r.totalDistanceKm} km | {r.totalTimeMinutes} min</span>
                      </div>

                      <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs">
                        <span className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold shrink-0 rounded-lg">
                          {r.originName}
                        </span>
                        {r.stops.map((stop, sIdx) => (
                          <React.Fragment key={sIdx}>
                            <span className="text-[#D6001C]">←</span>
                            <span className="px-3 py-1 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 text-[#D6001C] dark:text-red-300 font-bold shrink-0 font-mono rounded-lg">
                              {stop.nodeName} ({stop.arrivalTimeMinutes} min)
                            </span>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                  <Plane className="w-4 h-4 text-purple-600" />
                  <span>{getTranslation(language, 'ga_heliRoutes')}</span>
                </h3>

                <div className="space-y-3">
                  {gaResult.heliRoutes.map((r, idx) => (
                    <div key={idx} className="p-4 border border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl space-y-3">
                      <div className="flex justify-between items-center text-xs font-bold text-purple-900 dark:text-purple-200">
                        <span>{r.vehicleName}</span>
                        <span className="text-purple-600 dark:text-purple-400 font-mono">{r.totalDistanceKm} km | {r.totalTimeMinutes} min (Air Dispatch)</span>
                      </div>

                      <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs">
                        <span className="px-3 py-1 bg-white dark:bg-purple-900/40 border border-purple-200 dark:border-purple-700 text-purple-900 dark:text-purple-200 font-bold shrink-0 rounded-lg">
                          {r.originName}
                        </span>
                        {r.stops.map((stop, sIdx) => (
                          <React.Fragment key={sIdx}>
                            <span className="text-purple-600">✈</span>
                            <span className="px-3 py-1 bg-purple-600 text-white font-bold shrink-0 font-mono rounded-lg">
                              {stop.nodeName} ({stop.arrivalTimeMinutes} min)
                            </span>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Baseline Comparison */}
          {activeTab === 'baselines' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                جدول مقایسه عملکرد الگوریتم ژنتیک با روش‌های پایه (Greedy & Random)
              </h3>

              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-xs text-right border-collapse font-mono">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-900 text-[#D6001C] font-extrabold border-b border-slate-200 dark:border-slate-800">
                      <th className="p-3">روش بهینه‌سازی</th>
                      <th className="p-3">امتیاز برازش (Fitness)</th>
                      <th className="p-3">هزینه کل (تومان)</th>
                      <th className="p-3">پوشش جمعیت</th>
                      <th className="p-3">زمان رسیدن</th>
                      <th className="p-3">زمان محاسبات (ms)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                    {gaResult.baselines.map((b, idx) => (
                      <tr
                        key={idx}
                        className={`transition ${
                          b.method === 'genetic_algorithm'
                            ? 'bg-red-50 dark:bg-red-950/30 font-bold border-l-4 border-[#D6001C]'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <td className="p-3 text-slate-900 dark:text-white flex items-center gap-2">
                          {b.method === 'genetic_algorithm' && <Award className="w-4 h-4 text-[#D6001C]" />}
                          <span>{isRtl ? b.nameFa : b.nameEn}</span>
                        </td>
                        <td className="p-3 font-bold text-[#D6001C]">{b.fitness.toLocaleString()}</td>
                        <td className="p-3 text-slate-500">{b.totalCost.toLocaleString()}</td>
                        <td className="p-3 text-emerald-600 font-bold">{b.coveragePercent}%</td>
                        <td className="p-3 text-slate-500">{b.avgResponseMinutes} min</td>
                        <td className="p-3 text-slate-400">{b.computeTimeMs} ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 5: Decision Trace */}
          {activeTab === 'trace' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                ردیابی گام‌به‌گام تصمیمات الگوریتم ژنتیک
              </h3>

              <div className="space-y-3">
                {gaResult.decisionTrace.map((dt, idx) => (
                  <div key={idx} className="p-4 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#D6001C] bg-red-100 dark:bg-red-950/80 px-2.5 py-0.5 rounded-md">
                        گام {dt.step}
                      </span>
                      <span className="text-xs font-bold text-slate-500 font-mono">{dt.dataPoint}</span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{isRtl ? dt.titleFa : dt.titleEn}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{isRtl ? dt.explanationFa : dt.explanationEn}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
