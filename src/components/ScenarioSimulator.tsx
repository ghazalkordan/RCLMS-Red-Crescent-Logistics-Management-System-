import React, { useState } from 'react';
import { DisasterScenario, Language } from '../types';
import { getTranslation } from '../locales/i18n';
import { Play, RotateCcw, AlertTriangle, CheckCircle2, Zap, CloudRain, Flame, Snowflake, Activity } from 'lucide-react';

interface ScenarioSimulatorProps {
  language: Language;
  scenarios: DisasterScenario[];
  activeScenario: DisasterScenario;
  onSelectScenario: (scenarioId: string) => void;
  onSimulateStep: (actionType: string) => Promise<any>;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({
  language,
  scenarios,
  activeScenario,
  onSelectScenario,
  onSimulateStep,
}) => {
  const isRtl = language === 'fa' || language === 'ar';
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  // Dedicated Scenarios (1 per disaster type) (#12)
  const disasterScenariosList = [
    {
      id: 'scenario-earthquake-2026',
      nameFa: 'زلزله شدید ۷.۳ ریشتری (کرمانشاه - سرپل ذهاب)',
      nameEn: 'Severe 7.3 Magnitude Earthquake (Kermanshah)',
      descriptionFa: 'تخریب گسترده منازل، آسیب به انبارها و انسداد محورهای مواصلاتی کوهستانی.',
      descriptionEn: 'Widespread structural damage, warehouse impacts and mountain road blockages.',
      severityLevel: 'CRITICAL',
    },
    {
      id: 'scenario-flood-2026',
      nameFa: 'سیلاب سهمگین و طغیان رودخانه‌ها (سیل استان لرستان و گلستان)',
      nameEn: 'Flash Flood & Massive River Overflow',
      descriptionFa: 'طغیان رودخانه‌ها، آبگرفتگی منازل و قطع ارتباط جاده‌ای ۱۰ روستا در منطقه.',
      descriptionEn: 'River overflow, house flooding, and isolation of mountain villages.',
      severityLevel: 'HIGH',
    },
    {
      id: 'scenario-wildfire-2026',
      nameFa: 'آتش‌سوزی گسترده جنگل‌ها و مراتع (مریوان و زاگرس)',
      nameEn: 'Widespread Forest & Wildfire Disaster',
      descriptionFa: 'حریق وسیع در مراتع، دود سمی و نیاز به تخلیه اضطراری پناهگاه‌ها با بالگرد.',
      descriptionEn: 'Forest fires and toxic smoke requiring helicopter evacuations.',
      severityLevel: 'HIGH',
    },
    {
      id: 'scenario-blizzard-2026',
      nameFa: 'برف، کولاک و یخبندان سنگین گردنه‌های کوهستانی',
      nameEn: 'Heavy Blizzard & Mountain Pass Freeze',
      descriptionFa: 'سقوط بهمن، یخبندان شدید و مسدود شدن کامل ترابری سنگین زمینی.',
      descriptionEn: 'Avalanches and extreme freeze grounding ground transportation.',
      severityLevel: 'HIGH',
    },
    {
      id: 'scenario-tsunami-2026',
      nameFa: 'سونامی و پیشروی آب دریا در سواحل جنوبی (چابهار)',
      nameEn: 'Coastal Tsunami & Tidal Wave Surge',
      descriptionFa: 'امواج سهمگین، تخریب بنادر صیادی و نیاز فوری به اسکان اضطراری در ارتفاعات.',
      descriptionEn: 'Tidal waves destroying ports and requiring high-ground shelter relocation.',
      severityLevel: 'CRITICAL',
    },
    {
      id: 'scenario-landslide-2026',
      nameFa: 'زمین‌لغزش و رانش شدید جاده‌های جاده چالوس و هراز',
      nameEn: 'Severe Mountain Landslide & Mudslide',
      descriptionFa: 'ریزش هزاران تن سنگ و خاک، دفن جاده و مسدود شدن کامل مسیر امداد زمینی.',
      descriptionEn: 'Massive rockslides blocking ground relief corridors completely.',
      severityLevel: 'MEDIUM',
    },
    {
      id: 'scenario-volcano-2026',
      nameFa: 'فوران آتشفشان و انتشار خاکستر سمی (دماوند)',
      nameEn: 'Volcanic Eruption & Toxic Ash Cloud',
      descriptionFa: 'خروج گازهای سمی، بارش خاکستر بر شهرهای مجاور و آلودگی منابع آب شرب.',
      descriptionEn: 'Ash clouds polluting drinking water and causing respiratory emergencies.',
      severityLevel: 'CRITICAL',
    },
    {
      id: 'scenario-war-2026',
      nameFa: 'بحران و درگیری مسلحانه در مناطق مرزی',
      nameEn: 'Armed Conflict & Border Refugee Emergency',
      descriptionFa: 'آوارگی هموطنان، تخریب زیرساخت‌های شهری و نیاز به کمپ‌های پناهجویی اضطراری.',
      descriptionEn: 'Infrastructure destruction requiring emergency refugee camps.',
      severityLevel: 'CRITICAL',
    },
  ];

  const simulationPipeline = [
    { id: 'disaster_declared', titleFa: 'اعلام وقوع حادثه و فعال‌سازی ستاد بحران کشور', titleEn: 'Disaster Declared & National Ops Triggered' },
    { id: 'emergency_intake', titleFa: 'دریافت گزارش‌های مردمی و اولویت‌بندی هوشمند با AI', titleEn: 'AI Emergency Intake & Automated Priority Sorting' },
    { id: 'warehouse_damage', titleFa: 'ارزیابی آسیب به انبارها و مسدودی محورهای مواصلاتی', titleEn: 'Warehouse Damage Assessment & Blocked Roads' },
    { id: 'lp_optimization', titleFa: 'اجرای الگوریتم سیمپلکس (LP) و استخراج Shadow Price', titleEn: 'LP Optimization Execution & Dual Value Extraction' },
    { id: 'road_blocked', titleFa: 'ارزیابی وضعیت انسداد جاده‌ها و ریزش کوه/طغیان آب', titleEn: 'Road Landslide & Flood Blockage Verification' },
    { id: 'ga_routing', titleFa: 'اجرای الگوریتم ژنتیک (GA) و گسیل یگان هوابرد بالگردی', titleEn: 'GA Routing Algorithm Execution & Air Fleet Dispatch' },
  ];

  const handleNextStep = async () => {
    if (currentStep >= simulationPipeline.length) return;

    const step = simulationPipeline[currentStep];
    setIsSimulating(true);

    try {
      await onSimulateStep(step.id);
      setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${isRtl ? step.titleFa : step.titleEn}`]);
      setCurrentStep((prev) => prev + 1);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setLogs([]);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#0c0c12] p-6 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-colors">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <Zap className="w-5 h-5 text-[#D6001C]" />
          <span>{getTranslation(language, 'nav_scenariosSim')}</span>
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
          شبیه‌سازی انتهای‌به‌انتهای بحران‌های چندگانه (زلزله، سیل، آتش‌سوزی و برف/کولاک) با مدل‌سازی زنجیره امداد.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario Selection (#21) */}
        <div className="bg-white dark:bg-[#0c0c12] p-6 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#D6001C]">
            سناریوهای چندگانه بحران:
          </h3>

          <div className="space-y-3">
            {disasterScenariosList.map((sc) => (
              <div
                key={sc.id}
                onClick={() => onSelectScenario(sc.id)}
                className={`p-4 border rounded-xl cursor-pointer transition ${
                  activeScenario.id === sc.id
                    ? 'border-[#D6001C] bg-red-50 dark:bg-red-950/30 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                    {sc.nameFa}
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 rounded font-mono">
                    {sc.severityLevel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {sc.descriptionFa}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Simulation Pipeline Execution Controls */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0c0c12] p-6 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              خط‌لوله شبیه‌سازی گام‌به‌گام چرخه بحران
            </h3>

            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 border border-slate-200 dark:border-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>بازنشانی</span>
              </button>

              <button
                onClick={handleNextStep}
                disabled={isSimulating || currentStep >= simulationPipeline.length}
                className="bg-[#D6001C] hover:bg-red-700 text-white px-5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>اجرای گام بعدی</span>
              </button>
            </div>
          </div>

          {/* Pipeline Steps List */}
          <div className="space-y-3">
            {simulationPipeline.map((step, idx) => {
              const isDone = idx < currentStep;
              const isCurrent = idx === currentStep;

              return (
                <div
                  key={step.id}
                  className={`p-4 border rounded-xl flex items-center justify-between transition ${
                    isDone
                      ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300'
                      : isCurrent
                      ? 'border-[#D6001C] bg-red-50 dark:bg-red-950/30 text-slate-900 dark:text-white font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-[#D6001C] text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold">{step.titleFa}</span>
                  </div>

                  {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                </div>
              );
            })}
          </div>

          {/* Event Stream Console Logs */}
          <div className="bg-slate-900 p-4 border border-slate-800 rounded-xl font-mono text-xs text-red-400 space-y-1 h-36 overflow-y-auto">
            <p className="text-slate-500 italic">// Disaster Simulation Event Stream Console</p>
            {logs.map((log, lIdx) => (
              <p key={lIdx}>{log}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
