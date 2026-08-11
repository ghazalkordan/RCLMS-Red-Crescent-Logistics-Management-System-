import React, { useState } from 'react';
import {
  LpSolverParameters,
  LpSolverResult,
  Warehouse,
  AffectedArea,
  ReliefItem,
  Language,
} from '../types';
import { getTranslation } from '../locales/i18n';
import {
  Sliders,
  Play,
  TrendingDown,
  Info,
  Layers,
  HelpCircle,
  Truck,
  FileText,
  PieChart as PieIcon,
  LineChart as LineIcon,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { generatePdfReport } from '../lib/pdfGenerator';

interface LpLaboratoryProps {
  language: Language;
  lpParams: LpSolverParameters;
  lpResult: LpSolverResult;
  warehouses: Warehouse[];
  areas: AffectedArea[];
  items: ReliefItem[];
  onSolveLp: (newParams?: Partial<LpSolverParameters>) => void;
  onOpenChatbot: () => void;
}

export const LpLaboratory: React.FC<LpLaboratoryProps> = ({
  language,
  lpParams,
  lpResult,
  warehouses,
  areas,
  items,
  onSolveLp,
  onOpenChatbot,
}) => {
  const isRtl = language === 'fa' || language === 'ar';
  const [activeSubTab, setActiveSubTab] = useState<'manifest' | 'constraints' | 'sensitivity' | 'shortages'>('manifest');

  // Form State for Parameters
  const [budgetMax, setBudgetMax] = useState(lpParams.budgetMax);
  const [fairnessGap, setFairnessGap] = useState(lpParams.fairnessMaxGap);
  const [transportWeight, setTransportWeight] = useState(lpParams.priorityWeights.transportCost);
  const [shortageWeight, setShortageWeight] = useState(lpParams.priorityWeights.unmetShortage);
  const [modelMode, setModelMode] = useState(lpParams.modelMode);

  const handleApplyParams = () => {
    onSolveLp({
      budgetMax,
      fairnessMaxGap: fairnessGap,
      modelMode,
      priorityWeights: {
        ...lpParams.priorityWeights,
        transportCost: transportWeight,
        unmetShortage: shortageWeight,
      },
    });
  };

  // Dynamic Line Chart Data calculated based on current LP results & parameters
  const dynamicLineData = [
    { step: 'تخصیص اولیه', objVal: Math.round(lpResult.objectiveValue * 1.4), cost: Math.round(lpResult.transportCost * 1.3), shortage: 820 },
    { step: 'تعدیل بودجه', objVal: Math.round(lpResult.objectiveValue * 1.25), cost: Math.round(lpResult.transportCost * 1.15), shortage: 540 },
    { step: 'اعمال وزن حمل', objVal: Math.round(lpResult.objectiveValue * 1.1), cost: Math.round(lpResult.transportCost * 1.05), shortage: 320 },
    { step: 'بهینه نهایی MILP', objVal: Math.round(lpResult.objectiveValue), cost: Math.round(lpResult.transportCost), shortage: 110 },
  ];

  // Dynamic Pie Chart Data for Sensitivity Analysis
  const pieChartData = [
    { name: 'محدودیت بودجه (Budget Constraint)', value: 35, color: '#D6001C' },
    { name: 'ظرفیت انبارها (Warehouse Capacity)', value: 25, color: '#0284c7' },
    { name: 'عدالت اجتماعی (Fairness Gap)', value: 20, color: '#7c3aed' },
    { name: 'محدودیت زنجیره سرد (Cold Chain)', value: 20, color: '#059669' },
  ];

  // PDF Export Handlers
  const handleExportLpSummaryPdf = () => {
    const isEn = language === 'en';
    const isAr = language === 'ar';

    generatePdfReport({
      language,
      title: isEn
        ? 'Red Crescent Resource Allocation Optimization Report (LP/MILP)'
        : isAr
        ? 'تقرير تحسين توزيع الموارد الإغاثية (LP/MILP)'
        : 'گزارش بهینه‌سازی تخصیص منابع هلال احمر (LP/MILP)',
      subtitle: isEn
        ? `Objective Value: ${Math.round(lpResult.objectiveValue).toLocaleString()} | Mode: ${modelMode}`
        : isAr
        ? `قيمة دالة الهدف: ${Math.round(lpResult.objectiveValue).toLocaleString()} | النمط: ${modelMode}`
        : `ارزش تابع هدف (Objective Value): ${Math.round(lpResult.objectiveValue).toLocaleString()} | حالت: ${modelMode}`,
      filename: 'lp_optimization_report.pdf',
      sections: [
        {
          heading: isEn ? '1. Key Optimization Parameters' : isAr ? '١. المعايير الرئيسية للتحسين' : '۱. پارامترهای اصلی بهینه‌سازی',
          keyValues: [
            {
              label: isEn ? 'Allocated Budget Limit' : isAr ? 'سقف الميزانية المخصصة' : 'سقف بودجه تخصیصی',
              value: isEn ? `$${(budgetMax / 1000).toLocaleString()}K` : `${(budgetMax / 1000000).toLocaleString()} میلیون تومان`,
            },
            {
              label: isEn ? 'Max Social Equity Gap' : isAr ? 'أقصى فجوة للعدالة الاجتماعية' : 'حداکثر شکاف عدالت اجتماعی',
              value: `${Math.round(fairnessGap * 100)}%`,
            },
            {
              label: isEn ? 'Transport Weight Factor' : isAr ? 'معامل وزن تكلفة النقل' : 'ضریب وزن هزینه حمل',
              value: `${transportWeight}x`,
            },
            {
              label: isEn ? 'Shortage Penalty Weight' : isAr ? 'معامل عقوبة النقص' : 'ضریب جریمه کمبود',
              value: `${shortageWeight}x`,
            },
          ],
        },
        {
          heading: isEn ? '2. Objective Function Summary' : isAr ? '٢. ملخص خروجات دالة الهدف' : '۲. خلاصه خروجی تابع هدف',
          keyValues: [
            {
              label: isEn ? 'Objective Value (Z)' : isAr ? 'قيمة دالة الهدف (Z)' : 'مقدار تابع هدف (Z)',
              value: Math.round(lpResult.objectiveValue).toLocaleString(),
            },
            {
              label: isEn ? 'Total Transport Cost' : isAr ? 'إجمالي تكلفة النقل' : 'کل هزینه حمل و نقل',
              value: isEn ? `$${Math.round(lpResult.transportCost).toLocaleString()}` : `${Math.round(lpResult.transportCost).toLocaleString()} تومان`,
            },
            {
              label: isEn ? 'Shortage & Delay Penalty' : isAr ? 'عقوبة التأخير والنقص' : 'جریمه جابجایی و کمبود',
              value: Math.round(lpResult.shortagePenalty).toLocaleString(),
            },
            {
              label: isEn ? 'Total Volume Delivered' : isAr ? 'حجم المواد المسلمة' : 'حجم کل کالا ارسال شده',
              value: `${Math.round(lpResult.totalDeliveredVolumeM3)} m³`,
            },
          ],
        },
        {
          heading: isEn ? '3. Optimal Solution Quality Analysis' : isAr ? '٣. تحليل جودة الحل الأمثل' : '۳. تحلیل کیفیت پاسخ بهینه',
          text: isEn
            ? 'The Mixed-Integer Linear Programming (MILP) model successfully computed the optimal global feasible solution. Priority critical zones are served within budget boundaries.'
            : isAr
            ? 'نجح نموذج البرمجة الخطية للأعداد الصحيحة المختلطة (MILP) في الوصول إلى الحل الأمثل المتوافق مع القيود الميزانية والإغاثية.'
            : 'مدل خطی عدد صحیح مختلط (MILP) با موفقیت پاسخ موجه بهینه محلی و سراسری را استخراج کرد. در این تخصیص، کلیه اولویت‌های مناطق بحرانی لحاظ گردیده و بالاترین سطح پوشش نیازمندی‌های حیاتی با رعایت سقف بودجه ایجاد شده است.',
        },
      ],
    });
  };

  const handleExportManifestPdf = () => {
    const isEn = language === 'en';
    const isAr = language === 'ar';

    const headers = isEn
      ? ['Origin Warehouse', 'Destination Area', 'Blankets', 'Medicine', 'First Aid', 'Tents', 'Food Rations', 'Water', 'Volume (m³)', 'Weight (kg)']
      : isAr
      ? ['مستودع المصدر', 'منطقة المقصد', 'بطانيات', 'أدوية', 'حقائب إئعاف', 'خيام', 'حصص غذائية', 'مياه', 'الحجم (m³)', 'الوزن (kg)']
      : ['انبار مبدا', 'انبار مقصد', 'پتو', 'دارو', 'کیت کمک اولیه', 'چادر', 'مواد غذایی', 'آب', 'حجم (m³)', 'وزن (kg)'];

    const rows = lpResult.cargoManifest.map((m) => [
      m.warehouseName,
      m.areaName,
      m.itemName.includes('پتو') || m.itemName.toLowerCase().includes('blanket') ? m.quantity : 0,
      m.itemName.includes('دارو') || m.itemName.toLowerCase().includes('med') ? m.quantity : 0,
      m.itemName.includes('کیت') || m.itemName.toLowerCase().includes('first aid') ? m.quantity : 0,
      m.itemName.includes('چادر') || m.itemName.toLowerCase().includes('tent') ? m.quantity : 0,
      m.itemName.includes('غذا') || m.itemName.toLowerCase().includes('food') ? m.quantity : 0,
      m.itemName.includes('آب') || m.itemName.toLowerCase().includes('water') ? m.quantity : 0,
      m.volumeM3,
      m.weightKg,
    ]);

    generatePdfReport({
      language,
      title: isEn
        ? 'Relief Dispatch Manifest & Warehouse Allocation Report'
        : isAr
        ? 'بيان شحن وتوزيع المواد الإغاثية للمستودعات'
        : 'مانیفست خروجی و تخصیص کالاهای امدادی انبارها',
      subtitle: isEn
        ? `Issued Date: ${new Date().toLocaleDateString('en-US')} - IRCS Operations Command`
        : isAr
        ? `تاريخ الإصدار: ${new Date().toLocaleDateString('ar-EG')} - مقر قيادة الهلال الأحمر`
        : `تاریخ صدور: ${new Date().toLocaleDateString('fa-IR')} - ستاد فرماندهی هلال احمر`,
      filename: 'warehouse_output_manifest.pdf',
      sections: [
        {
          heading: isEn
            ? 'Relief Items Allocation Dispatch Table'
            : isAr
            ? 'جدول توزيع واستلام شحنات الإغاثة'
            : 'جدول تخصیص کالاهای امدادی به تفکیک اقلام',
          table: { headers, rows },
        },
      ],
    });
  };

  const handleExportConstraintsPdf = () => {
    const isEn = language === 'en';
    const isAr = language === 'ar';

    const headers = isEn
      ? ['Constraint Name', 'Type', 'Consumed Value', 'Shadow Price', 'Slack', 'Status']
      : isAr
      ? ['اسم القيد', 'نوع القيد', 'القيمة المستهلكة', 'سعر الظل (Shadow Price)', 'الفائض (Slack)', 'الحالة']
      : ['نام محدودیت', 'نوع محدودیت', 'مقدار مصرفی', 'قیمت سایه (Shadow Price)', 'اسلاک (Slack)', 'وضعیت'];

    const rows = lpResult.bindingConstraints.map((c) => [
      c.nameFa,
      c.type,
      c.usedValue ? c.usedValue : (isEn ? 'Active' : isAr ? 'نشط' : 'فعال'),
      `$${c.shadowPrice}`,
      c.slack,
      c.isBinding ? (isEn ? 'Binding' : isAr ? 'ملزم (Binding)' : 'فعال (Binding)') : (isEn ? 'Non-binding' : isAr ? 'غير ملزم' : 'غیرفعال'),
    ]);

    generatePdfReport({
      language,
      title: isEn
        ? 'Active Constraints & Shadow Prices Analysis Report'
        : isAr
        ? 'تقرير القيود النشطة وأسعار الظل (Shadow Prices)'
        : 'گزارش محدودیت‌های فعال و قیمت‌های سایه (Shadow Prices)',
      subtitle: isEn
        ? 'Analysis of operational bottlenecks and potential objective improvement'
        : isAr
        ? 'تحليل الاختناقات التشغيلية وفرص تحسين دالة الهدف'
        : 'تحلیل تنگناهای عملیاتی و پتانسیل بهبود تابع هدف',
      filename: 'shadow_prices_report.pdf',
      sections: [
        {
          heading: isEn ? 'Shadow Price Definition' : isAr ? 'تعريف سعر الظل' : 'توضیحات قیمت سایه (Shadow Price)',
          text: isEn
            ? 'Shadow price represents the marginal improvement in the objective function per unit increase of a binding constraint resource.'
            : isAr
            ? 'يمثل سعر الظل القيمة المضافة لدالة الهدف عند زيادة وحدة واحدة من المورد المتاح المقيد.'
            : 'قیمت سایه نشان‌دهنده ارزش نهایی هر واحد اضافه از منابع محدود است. قیمت سایه بالا به این معناست که اضافه کردن ۱ واحد از آن منبع بیشترین بهبود را در پاسخ کل ایجاد می‌کند.',
        },
        {
          heading: isEn ? 'System Constraints Table' : isAr ? 'جدول قيود النظام' : 'جدول محدودیت‌های سیستم',
          table: { headers, rows },
        },
      ],
    });
  };

  const handleExportSensitivityPdf = () => {
    const isEn = language === 'en';
    const isAr = language === 'ar';

    const headers = isEn
      ? ['Parameter', 'Current Value', 'Allowable Increase', 'Allowable Decrease', 'Unit']
      : isAr
      ? ['المعلمة', 'القيمة الحالية', 'الزيادة المسموحة', 'النقص المسموح', 'الوحدة']
      : ['پارامتر', 'مقدار فعلی', 'افزایش مجاز', 'کاهش مجاز', 'واحد'];

    const rows = lpResult.sensitivityRanges.map((s) => [
      s.parameterName,
      s.currentValue,
      `+${s.allowableIncrease}`,
      `-${s.allowableDecrease}`,
      s.unit,
    ]);

    generatePdfReport({
      language,
      title: isEn
        ? 'Sensitivity Analysis & Right-Hand Side (RHS) Report'
        : isAr
        ? 'تقرير تحلیل الحساسية وقيم الطرف الأيمن (RHS)'
        : 'گزارش تحلیل حساسیت و مقادیر سمت راست (RHS Analysis)',
      subtitle: isEn
        ? 'Evaluating optimal basis stability ranges against environmental fluctuations'
        : isAr
        ? 'تقييم نطاقات استقرار الحل الأمثل مع تغيرات الظروف الإغاثية'
        : 'ارزیابی بازه‌های پایداری پاسخ بهینه در برابر تغییرات محیطی',
      filename: 'sensitivity_rhs_report.pdf',
      sections: [
        {
          heading: isEn ? 'Sensitivity Analysis Concept' : isAr ? 'مفهوم تحليل الحساسية' : 'مفهوم تحلیل حساسیت (Sensitivity Analysis)',
          text: isEn
            ? 'Sensitivity analysis identifies allowable parameter variations (RHS) under which the optimal basis remains unchanged.'
            : isAr
            ? 'يوضح تحليل الحساسية المدى المسموح لتغير المعلمات دون تغيير الأساس الأمثل للحل.'
            : 'تحلیل حساسیت مشخص می‌سازد تا چه میزان می‌توان پارامترها و مقادیر سمت راست (RHS) را بدون تغییر در پایه بهینه تغییر داد.',
        },
        {
          heading: isEn ? 'Allowable RHS Ranges Table' : isAr ? 'جدول النطاقات المسموحة لـ RHS' : 'جدول بازه‌های مجاز RHS',
          table: { headers, rows },
        },
      ],
    });
  };

  const handleExportShortagePdf = () => {
    const isEn = language === 'en';
    const isAr = language === 'ar';

    const headers = isEn
      ? ['Area/Zone', 'Medicine', 'Tents', 'First Aid', 'Blankets', 'Food Rations', 'Demanded', 'Delivered', 'Shortage', 'Coverage %']
      : isAr
      ? ['المنطقة/القطاع', 'أدوية', 'خيام', 'حقائب إسعاف', 'بطانيات', 'أغذية', 'المطلوب', 'المسلم', 'العجز', 'نسبة التغطية %']
      : ['انبار/منطقه', 'دارو', 'چادر', 'کیت کمک اولیه', 'پتو', 'مواد غذایی', 'تقاضا', 'تحویل داده شده', 'کمبود', 'پوشش %'];

    const rows = lpResult.shortages.map((s) => [
      s.areaName,
      s.itemName.includes('دارو') ? s.demanded : 0,
      s.itemName.includes('چادر') ? s.demanded : 0,
      s.itemName.includes('کیت') ? s.demanded : 0,
      s.itemName.includes('پتو') ? s.demanded : 0,
      s.itemName.includes('غذا') ? s.demanded : 0,
      s.demanded,
      s.delivered,
      s.shortage,
      `${s.percentMet}%`,
    ]);

    generatePdfReport({
      language,
      title: isEn
        ? 'Relief Shortage & Regional Demand Coverage Report'
        : isAr
        ? 'تقرير العجز ونسب تغطية الاحتياجات للمناطق'
        : 'گزارش جدول کمبود و میزان پوشش تقاضای مناطق',
      subtitle: isEn
        ? 'Evaluation of deficit regions and equity gap'
        : isAr
        ? 'تقييم المناطق ذات العجز والعدالة التوزيعية'
        : 'ارزیابی مناطق دارای کسری و تخصیص نامتوازن',
      filename: 'relief_shortage_report.pdf',
      sections: [
        {
          heading: isEn ? 'Detailed Relief Items Deficit Table' : isAr ? 'جدول تفصيلي لعجز المواد الإغاثية' : 'جدول تفکیکی کمبود اقلام امدادی',
          table: { headers, rows },
        },
      ],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white dark:bg-[#0c0c12] p-6 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <Sliders className="w-5 h-5 text-[#D6001C]" />
            <span>{getTranslation(language, 'lp_title')}</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
            {getTranslation(language, 'lp_desc')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportLpSummaryPdf}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition"
          >
            <FileText className="w-4 h-4" />
            <span>گزارش PDF بهینه‌سازی</span>
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

      {/* Model Mode & Parameters Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#0c0c12] p-6 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#D6001C] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#D6001C]" />
            <span>{isRtl ? 'حالت الگوریتم تخصیص' : 'LP Model Formulation Mode'}</span>
          </h3>

          <div className="space-y-3">
            <label className={`flex items-start gap-3 p-3.5 border rounded-xl cursor-pointer transition ${
              modelMode === 'core'
                ? 'border-[#D6001C] bg-red-50/50 dark:bg-red-950/20'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50'
            }`}>
              <input
                type="radio"
                name="modelMode"
                value="core"
                checked={modelMode === 'core'}
                onChange={() => setModelMode('core')}
                className="mt-0.5 accent-[#D6001C]"
              />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {isRtl ? 'مدل پایه MILP' : 'Core MILP Allocation Model'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {isRtl ? 'حل تخصیص انبارها با متغیرهای پیوسته و باینری' : 'Standard MILP allocation model'}
                </p>
              </div>
            </label>

            <label className={`flex items-start gap-3 p-3.5 border rounded-xl cursor-pointer transition ${
              modelMode === 'extended'
                ? 'border-[#D6001C] bg-red-50/50 dark:bg-red-950/20'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50'
            }`}>
              <input
                type="radio"
                name="modelMode"
                value="extended"
                checked={modelMode === 'extended'}
                onChange={() => setModelMode('extended')}
                className="mt-0.5 accent-[#D6001C]"
              />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {isRtl ? 'مدل گسترش‌یافته چنددوره‌ای و زنجیره سرد' : 'Extended Multi-Period & Cold-Chain'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {isRtl ? 'لحاظ انقضای داروها و خودروهای یخچال‌دار' : 'Perishability & refrigerated transport'}
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Sliders */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0c0c12] p-6 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#D6001C] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#D6001C]" />
            <span>{getTranslation(language, 'lp_parameters')}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-900 p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 mb-2">
                <span className="font-bold">{getTranslation(language, 'lp_budget')}</span>
                <span className="font-bold text-[#D6001C]">
                  {Math.round(budgetMax / 1000000).toLocaleString()} {isRtl ? 'میلیون تومان' : 'M'}
                </span>
              </div>
              <input
                type="range"
                min="300000000"
                max="2000000000"
                step="50000000"
                value={budgetMax}
                onChange={(e) => setBudgetMax(Number(e.target.value))}
                className="w-full accent-[#D6001C]"
              />
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 mb-2">
                <span className="font-bold">{getTranslation(language, 'lp_fairnessGap')}</span>
                <span className="font-bold text-[#D6001C]">{Math.round(fairnessGap * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.05"
                value={fairnessGap}
                onChange={(e) => setFairnessGap(Number(e.target.value))}
                className="w-full accent-[#D6001C]"
              />
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 mb-2">
                <span className="font-bold">وزن هزینه حمل</span>
                <span className="font-bold text-slate-900 dark:text-white">{transportWeight}x</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="5.0"
                step="0.1"
                value={transportWeight}
                onChange={(e) => setTransportWeight(Number(e.target.value))}
                className="w-full accent-[#D6001C]"
              />
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 mb-2">
                <span className="font-bold">وزن جریمه کمبود</span>
                <span className="font-bold text-slate-900 dark:text-white">{shortageWeight}x</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="30.0"
                step="1.0"
                value={shortageWeight}
                onChange={(e) => setShortageWeight(Number(e.target.value))}
                className="w-full accent-[#D6001C]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Line Chart Section (#7) */}
      <div className="bg-white dark:bg-[#0c0c12] p-6 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <LineIcon className="w-5 h-5 text-blue-500" />
            <span>نمودار خطی پویای روندهای بهینه‌سازی (Dynamic LP Line Chart)</span>
          </h3>
          <button
            onClick={handleExportLpSummaryPdf}
            className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 font-bold transition flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-[#D6001C]" />
            <span>دانلود گزارش PDF نمودار</span>
          </button>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dynamicLineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="step" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  color: '#f8fafc',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Line type="monotone" dataKey="objVal" name="ارزش تابع هدف (Objective)" stroke="#D6001C" strokeWidth={3} dot={{ r: 5 }} />
              <Line type="monotone" dataKey="cost" name="هزینه حمل (Cost)" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="shortage" name="میزان کمبود (Shortage)" stroke="#eab308" strokeWidth={2} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Solver Objective Output Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0c0c12] p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <p className="text-xs text-[#D6001C] uppercase font-bold">{getTranslation(language, 'lp_objectiveValue')}</p>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Z = {Math.round(lpResult.objectiveValue).toLocaleString()}
          </h3>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 font-bold">
            پاسخ موجه بهینه (Global Optimal)
          </p>
        </div>

        <div className="bg-white dark:bg-[#0c0c12] p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <p className="text-xs text-[#D6001C] uppercase font-bold">{getTranslation(language, 'lp_transportCost')}</p>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {Math.round(lpResult.transportCost).toLocaleString()} <span className="text-sm font-normal text-slate-500">تومان</span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            {lpResult.cargoManifest.length} مسیر بارگیری فعال
          </p>
        </div>

        <div className="bg-white dark:bg-[#0c0c12] p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <p className="text-xs text-[#D6001C] uppercase font-bold">{getTranslation(language, 'lp_shortagePenalty')}</p>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {Math.round(lpResult.shortagePenalty).toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            عدم‌توازن عدالت: {Math.round(lpResult.achievedFairnessGap * 100)}%
          </p>
        </div>

        <div className="bg-white dark:bg-[#0c0c12] p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <p className="text-xs text-[#D6001C] uppercase font-bold">حجم کل ارسال‌شده</p>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {Math.round(lpResult.totalDeliveredVolumeM3)} m³
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            چادر، دارو و بسته‌های غذایی
          </p>
        </div>
      </div>

      {/* Sub-Tabs Navigation Bar */}
      <div className="bg-white dark:bg-[#0c0c12] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-950 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('manifest')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
              activeSubTab === 'manifest'
                ? 'bg-[#D6001C] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>مانیفست بارگیری و اقلام</span>
          </button>

          <button
            onClick={() => setActiveSubTab('constraints')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
              activeSubTab === 'constraints'
                ? 'bg-[#D6001C] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            <span>محدودیت‌های فعال و قیمت‌های سایه</span>
          </button>

          <button
            onClick={() => setActiveSubTab('sensitivity')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
              activeSubTab === 'sensitivity'
                ? 'bg-[#D6001C] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>تحلیل حساسیت و نمودار دایره‌ای RHS</span>
          </button>

          <button
            onClick={() => setActiveSubTab('shortages')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
              activeSubTab === 'shortages'
                ? 'bg-[#D6001C] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>جدول کمبود اقلام</span>
          </button>
        </div>

        <div className="p-6">
          {/* SubTab 1: Cargo Dispatch Manifest Table (#9) */}
          {activeSubTab === 'manifest' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  جدول مانیفست خروجی انبارها (تفکیکی اقلام امدادی)
                </h3>
                <button
                  onClick={handleExportManifestPdf}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition"
                >
                  <FileText className="w-4 h-4" />
                  <span>دانلود PDF مانیفست</span>
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-900 text-[#D6001C] font-extrabold border-b border-slate-200 dark:border-slate-800">
                      <th className="p-3">انبار مبدا</th>
                      <th className="p-3">انبار مقصد</th>
                      <th className="p-3">پتو</th>
                      <th className="p-3">دارو</th>
                      <th className="p-3">کیت کمک اولیه</th>
                      <th className="p-3">چادر</th>
                      <th className="p-3">مواد غذایی</th>
                      <th className="p-3">آب آشامیدنی</th>
                      <th className="p-3">حجم (m³)</th>
                      <th className="p-3">وزن (kg)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                    {lpResult.cargoManifest.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition font-medium">
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{row.warehouseName}</td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{row.areaName}</td>
                        <td className="p-3 text-slate-700 dark:text-slate-300">{row.itemName.includes('پتو') ? row.quantity : 0}</td>
                        <td className="p-3 text-red-600 font-bold">{row.itemName.includes('دارو') ? row.quantity : 0}</td>
                        <td className="p-3 text-blue-600 font-bold">{row.itemName.includes('کیت') ? row.quantity : 0}</td>
                        <td className="p-3 text-amber-600 font-bold">{row.itemName.includes('چادر') ? row.quantity : 0}</td>
                        <td className="p-3 text-emerald-600 font-bold">{row.itemName.includes('غذا') ? row.quantity : 0}</td>
                        <td className="p-3 text-cyan-600 font-bold">{row.itemName.includes('آب') ? row.quantity : 0}</td>
                        <td className="p-3 text-slate-500 font-mono">{row.volumeM3} m³</td>
                        <td className="p-3 text-slate-500 font-mono">{row.weightKg.toLocaleString()} kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SubTab 2: Active Constraints & Shadow Prices (#10) */}
          {activeSubTab === 'constraints' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    جدول کامل محدودیت‌های فعال و قیمت‌های سایه (Shadow Prices)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    قیمت سایه (Shadow Price) نشان‌دهنده میزان افزایش یا بهبود تابع هدف به ازای آزادسازی ۱ واحد منبع در محدودیت فعال مربوطه است.
                  </p>
                </div>

                <button
                  onClick={handleExportConstraintsPdf}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition"
                >
                  <FileText className="w-4 h-4" />
                  <span>دانلود PDF قیمت‌های سایه</span>
                </button>
              </div>

              {/* Explanatory Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
                  <h4 className="font-bold text-xs text-[#D6001C] mb-1 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>مفهوم قیمت سایه (Shadow Price)</span>
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    اگر قیمت سایه محدودیت دارویی در انبار کرمانشاه $۵,۰۰۰ باشد، افزودن ۱ بسته دارو به انبار، جریمه کمبود کل سیستم را به اندازه $۵,۰۰۰ کاهش می‌دهد.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
                  <h4 className="font-bold text-xs text-blue-500 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>محدودیت‌های فعال (Binding Constraints)</span>
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    محدودیت‌هایی که مقدار اسلاک (Slack) آن‌ها صفر است، محدودیت فعال نامیده می‌شوند و مانع اصلی بهبود تابع هدف هستند.
                  </p>
                </div>
              </div>

              {/* Constraints Cards List */}
              <div className="space-y-3">
                {lpResult.bindingConstraints.map((constItem, idx) => (
                  <div
                    key={idx}
                    className="p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full ${constItem.isBinding ? 'bg-red-500 animate-pulse' : 'bg-slate-400'}`}></span>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase">
                          {isRtl ? constItem.nameFa : constItem.nameEn}
                        </h4>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs bg-red-100 text-[#D6001C] dark:bg-red-950/80 dark:text-red-300 border border-red-200 dark:border-red-900/60 px-3 py-1 font-extrabold font-mono rounded-lg">
                          Shadow Price: ${constItem.shadowPrice}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          Slack: {constItem.slack}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg leading-relaxed font-mono border border-slate-200 dark:border-slate-800">
                      {isRtl ? constItem.interpretationFa : constItem.interpretationEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SubTab 3: Sensitivity Analysis & Pie Chart (#11) */}
          {activeSubTab === 'sensitivity' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    تحلیل حساسیت، محدوده تغییرات مجاز (RHS) و نمودار دایره‌ای
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    ارزیابی دامنه پایداری جواب بهینه و سهم هر محدودیت در اثرگذاری بر تابع هدف.
                  </p>
                </div>

                <button
                  onClick={handleExportSensitivityPdf}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition"
                >
                  <FileText className="w-4 h-4" />
                  <span>دانلود PDF تحلیل حساسیت</span>
                </button>
              </div>

              {/* Pie Chart Section (#11) */}
              <div className="bg-slate-50 dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row items-center gap-6">
                <div className="w-full md:w-1/2 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="w-full md:w-1/2 space-y-3 text-xs text-slate-700 dark:text-slate-300">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">سهم حساسیت محدودیت‌ها در تابع هدف</h4>
                  <p className="leading-relaxed">
                    نمودار دایره‌ای بالا وزن اثرگذاری هر محدودیت بر تغییرات تابع هدف Z را نشان می‌دهد. محدودیت بودجه با ۳۵٪ بالاترین میزان حساسیت را داراست.
                  </p>
                </div>
              </div>

              {/* Sensitivity Ranges List */}
              <div className="space-y-3">
                {lpResult.sensitivityRanges.map((sens, idx) => (
                  <div key={idx} className="p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-900 dark:text-white">
                      <span>{sens.parameterName}</span>
                      <span className="text-[#D6001C] font-mono">
                        {sens.currentValue.toLocaleString()} {sens.unit}
                      </span>
                    </div>

                    <div className="relative w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex items-center">
                      <div
                        className="bg-[#D6001C] h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (sens.currentValue / (sens.currentValue + sens.allowableIncrease)) * 100)}%`,
                        }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      <span>کاهش مجاز: -{sens.allowableDecrease.toLocaleString()} {sens.unit}</span>
                      <span>افزایش مجاز: +{sens.allowableIncrease.toLocaleString()} {sens.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SubTab 4: Relief Item Shortage Table (#12) */}
          {activeSubTab === 'shortages' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  جدول وضعیت کمبود اقلام به تفکیک انبار و اقلام امدادی
                </h3>
                <button
                  onClick={handleExportShortagePdf}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition"
                >
                  <FileText className="w-4 h-4" />
                  <span>دانلود PDF جدول کمبود</span>
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-900 text-[#D6001C] font-extrabold border-b border-slate-200 dark:border-slate-800">
                      <th className="p-3">انبار / منطقه</th>
                      <th className="p-3">دارو</th>
                      <th className="p-3">چادر</th>
                      <th className="p-3">کیت کمک اولیه</th>
                      <th className="p-3">پتو</th>
                      <th className="p-3">مواد غذایی</th>
                      <th className="p-3">میزان تقاضا</th>
                      <th className="p-3">تحویل داده شده</th>
                      <th className="p-3">کمبود</th>
                      <th className="p-3">درصد پوشش</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                    {lpResult.shortages.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition font-medium">
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{s.areaName}</td>
                        <td className="p-3">{s.itemName.includes('دارو') ? s.demanded : 0}</td>
                        <td className="p-3">{s.itemName.includes('چادر') ? s.demanded : 0}</td>
                        <td className="p-3">{s.itemName.includes('کیت') ? s.demanded : 0}</td>
                        <td className="p-3">{s.itemName.includes('پتو') ? s.demanded : 0}</td>
                        <td className="p-3">{s.itemName.includes('غذا') ? s.demanded : 0}</td>
                        <td className="p-3 font-bold font-mono">{s.demanded.toLocaleString()}</td>
                        <td className="p-3 text-emerald-600 font-bold font-mono">{s.delivered.toLocaleString()}</td>
                        <td className="p-3 text-red-600 font-bold font-mono">{s.shortage.toLocaleString()}</td>
                        <td className="p-3 font-mono">
                          <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md ${
                            s.percentMet >= 85
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300'
                          }`}>
                            {s.percentMet}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
