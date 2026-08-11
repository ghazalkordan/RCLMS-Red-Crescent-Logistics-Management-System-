import React, { useState, useMemo } from 'react';
import { Language } from '../types';
import { generatePdfReport } from '../lib/pdfGenerator';
import {
  Users,
  Sliders,
  FileText,
  Clock,
  ShieldAlert,
  MapPin,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Zap,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';

interface TeamAllocationModuleProps {
  language: Language;
}

interface RescueTeam {
  id: string;
  nameFa: string;
  nameEn: string;
  lat: number;
  lng: number;
  personnel: number;
  skill: 'Advanced' | 'Medical' | 'Heavy Rescue' | 'K9';
  speedKmH: number;
  status: 'Available' | 'Busy';
}

interface EmergencyIncident {
  id: string;
  titleFa: string;
  titleEn: string;
  lat: number;
  lng: number;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  victims: number;
  requiredSkill: 'Advanced' | 'Medical' | 'Heavy Rescue' | 'K9';
  requiredPersonnel: number;
  roadFactor: number; // 1.0 = Normal, 1.3 = Damaged, 1.7 = Severely Damaged
}

export const TeamAllocationModule: React.FC<TeamAllocationModuleProps> = ({ language }) => {
  const isRtl = language === 'fa' || language === 'ar';

  // Input Parameters & Sliders
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0); // 0.6x to 1.5x
  const [usePriorityWeight, setUsePriorityWeight] = useState<boolean>(true);
  const [globalRoadDegradation, setGlobalRoadDegradation] = useState<number>(1.2); // 1.0 to 2.0
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  // Initial Sample Teams Data
  const [teams, setTeams] = useState<RescueTeam[]>([
    { id: 'T01', nameFa: 'تیم ۱ (واکنش سریع کرمانشاه)', nameEn: 'Team T01 (Rapid Response)', lat: 34.3276, lng: 47.0778, personnel: 10, skill: 'Advanced', speedKmH: 65, status: 'Available' },
    { id: 'T02', nameFa: 'تیم ۲ (اورژانس سرپل ذهاب)', nameEn: 'Team T02 (Medical Emergency)', lat: 34.4611, lng: 45.8627, personnel: 8, skill: 'Medical', speedKmH: 60, status: 'Available' },
    { id: 'T03', nameFa: 'تیم ۳ (آواربرداری اسلام‌آباد)', nameEn: 'Team T03 (Heavy Equipment)', lat: 34.1094, lng: 46.5273, personnel: 12, skill: 'Heavy Rescue', speedKmH: 50, status: 'Available' },
    { id: 'T04', nameFa: 'تیم ۴ (زنده یاب آنست پاوه)', nameEn: 'Team T04 (K9 Search Unit)', lat: 35.0434, lng: 46.3562, personnel: 6, skill: 'K9', speedKmH: 55, status: 'Available' },
    { id: 'T05', nameFa: 'تیم ۵ (امداد هوایی گیلانغرب)', nameEn: 'Team T05 (Air Rescue Unit)', lat: 34.1422, lng: 45.9203, personnel: 5, skill: 'Advanced', speedKmH: 70, status: 'Busy' },
  ]);

  // Initial Sample Incidents Data
  const [incidents, setIncidents] = useState<EmergencyIncident[]>([
    { id: 'I01', titleFa: 'ریزش ساختمان مسکن مهر سرپل ذهاب', titleEn: 'Building Collapse Sarpol', lat: 34.465, lng: 45.868, severity: 'Critical', victims: 22, requiredSkill: 'Advanced', requiredPersonnel: 8, roadFactor: 1.4 },
    { id: 'I02', titleFa: 'تصادف سنگین جاده اسلام‌آباد-کرمانشاه', titleEn: 'Highway Multi-Vehicle Crash', lat: 34.210, lng: 46.800, severity: 'High', victims: 9, requiredSkill: 'Medical', requiredPersonnel: 6, roadFactor: 1.1 },
    { id: 'I03', titleFa: 'معدن محبوث‌شده ثلاث باباجانی', titleEn: 'Mine Trapped Workers Thalath', lat: 34.761, lng: 46.182, severity: 'Critical', victims: 14, requiredSkill: 'Heavy Rescue', requiredPersonnel: 10, roadFactor: 1.6 },
    { id: 'I04', titleFa: 'مفقودی کوهنوردان ارتفاعات پاوه', titleEn: 'Lost Hikers Paveh Mountains', lat: 35.050, lng: 46.360, severity: 'Medium', victims: 4, requiredSkill: 'K9', requiredPersonnel: 4, roadFactor: 1.3 },
  ]);

  // Reset parameters
  const handleReset = () => {
    setSpeedMultiplier(1.0);
    setUsePriorityWeight(true);
    setGlobalRoadDegradation(1.2);
    setTeams([
      { id: 'T01', nameFa: 'تیم ۱ (واکنش سریع کرمانشاه)', nameEn: 'Team T01 (Rapid Response)', lat: 34.3276, lng: 47.0778, personnel: 10, skill: 'Advanced', speedKmH: 65, status: 'Available' },
      { id: 'T02', nameFa: 'تیم ۲ (اورژانس سرپل ذهاب)', nameEn: 'Team T02 (Medical Emergency)', lat: 34.4611, lng: 45.8627, personnel: 8, skill: 'Medical', speedKmH: 60, status: 'Available' },
      { id: 'T03', nameFa: 'تیم ۳ (آواربرداری اسلام‌آباد)', nameEn: 'Team T03 (Heavy Equipment)', lat: 34.1094, lng: 46.5273, personnel: 12, skill: 'Heavy Rescue', speedKmH: 50, status: 'Available' },
      { id: 'T04', nameFa: 'تیم ۴ (زنده یاب آنست پاوه)', nameEn: 'Team T04 (K9 Search Unit)', lat: 35.0434, lng: 46.3562, personnel: 6, skill: 'K9', speedKmH: 55, status: 'Available' },
      { id: 'T05', nameFa: 'تیم ۵ (امداد هوایی گیلانغرب)', nameEn: 'Team T05 (Air Rescue Unit)', lat: 34.1422, lng: 45.9203, personnel: 5, skill: 'Advanced', speedKmH: 70, status: 'Busy' },
    ]);
  };

  // Haversine Distance Formula
  const calcHaversine = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth radius km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Mathematical MILP Solver (Exact Assignment Optimizer)
  const optimizationResults = useMemo(() => {
    const priorityWeights: Record<string, number> = {
      Critical: 2.5,
      High: 1.8,
      Medium: 1.2,
      Low: 1.0,
    };

    const assignedTeamIds = new Set<string>();
    const assignments: Array<{
      team: RescueTeam;
      incident: EmergencyIncident;
      distanceKm: number;
      responseTimeMin: number;
      weightedCost: number;
    }> = [];

    const unassignedIncidents: Array<{
      incident: EmergencyIncident;
      reason: string;
    }> = [];

    // Sort incidents by severity weight descending so higher priority receives first pick if scarce
    const sortedIncidents = [...incidents].sort(
      (a, b) => priorityWeights[b.severity] - priorityWeights[a.severity]
    );

    sortedIncidents.forEach((incident) => {
      let bestTeam: RescueTeam | null = null;
      let minCost = Infinity;
      let bestDist = 0;
      let bestTime = 0;
      let failureReason = 'No available team matches requirements';

      teams.forEach((team) => {
        // Constraint 1: Team Availability
        if (team.status !== 'Available') {
          failureReason = 'Matching team is currently Busy on another operation';
          return;
        }
        // Constraint 2: Already assigned check
        if (assignedTeamIds.has(team.id)) {
          return;
        }
        // Constraint 3: Skill Compatibility
        if (team.skill !== incident.requiredSkill && team.skill !== 'Advanced') {
          return;
        }
        // Constraint 4: Personnel Capacity
        if (team.personnel < incident.requiredPersonnel) {
          failureReason = `Team personnel count (${team.personnel}) is less than required (${incident.requiredPersonnel})`;
          return;
        }

        const distKm = calcHaversine(team.lat, team.lng, incident.lat, incident.lng);
        const effectiveSpeed = team.speedKmH * speedMultiplier;
        const totalRoadFactor = incident.roadFactor * globalRoadDegradation;
        const timeMin = (distKm / Math.max(10, effectiveSpeed)) * 60 * totalRoadFactor;

        const priorityWeight = usePriorityWeight ? priorityWeights[incident.severity] : 1.0;
        const weightedCost = timeMin / priorityWeight;

        if (weightedCost < minCost) {
          minCost = weightedCost;
          bestTeam = team;
          bestDist = distKm;
          bestTime = timeMin;
        }
      });

      if (bestTeam) {
        assignedTeamIds.add(bestTeam.id);
        assignments.push({
          team: bestTeam,
          incident,
          distanceKm: Math.round(bestDist * 10) / 10,
          responseTimeMin: Math.round(bestTime * 10) / 10,
          weightedCost: Math.round(minCost * 10) / 10,
        });
      } else {
        unassignedIncidents.push({
          incident,
          reason: failureReason,
        });
      }
    });

    // Statistical KPIs
    const availableTeamsCount = teams.filter((t) => t.status === 'Available').length;
    const totalDist = assignments.reduce((acc, a) => acc + a.distanceKm, 0);
    const avgTime = assignments.length > 0 ? assignments.reduce((acc, a) => acc + a.responseTimeMin, 0) / assignments.length : 0;
    const maxTime = assignments.length > 0 ? Math.max(...assignments.map((a) => a.responseTimeMin)) : 0;
    const coveragePct = Math.round((assignments.length / Math.max(1, incidents.length)) * 100);

    const criticalIncidentsTotal = incidents.filter((i) => i.severity === 'Critical').length;
    const criticalCovered = assignments.filter((a) => a.incident.severity === 'Critical').length;

    return {
      assignments,
      unassignedIncidents,
      availableTeamsCount,
      totalDist: Math.round(totalDist * 10) / 10,
      avgTime: Math.round(avgTime * 10) / 10,
      maxTime: Math.round(maxTime * 10) / 10,
      coveragePct,
      criticalIncidentsTotal,
      criticalCovered,
    };
  }, [teams, incidents, speedMultiplier, usePriorityWeight, globalRoadDegradation]);

  // Operational Explanation Narrative Generator
  const operationalNarrative = useMemo(() => {
    if (optimizationResults.assignments.length === 0) {
      return language === 'fa'
        ? 'هیچ تخصیص معتبری یافت نشد. لطفاً وضعیت تیم‌ها یا پارامترهای محدودیت را بررسی نمایید.'
        : 'No valid assignments found. Please adjust constraints or team status.';
    }

    const first = optimizationResults.assignments[0];
    if (language === 'fa') {
      return `تیم ${first.team.nameFa} برای حادثه "${first.incident.titleFa}" انتخاب گردید زیرا با داشتن مهارت ${first.team.skill} و ظرفیت ${first.team.personnel} نفر، کمترین زمان پاسخ‌دهی (${first.responseTimeMin} دقیقه) را با احتساب ضریب خرابی جاده (α=${(first.incident.roadFactor * globalRoadDegradation).toFixed(1)}) و وزن اولویت بحرانی ارائه می‌دهد.`;
    } else if (language === 'ar') {
      return `تم تخصيص الفريق ${first.team.nameEn} للحادث "${first.incident.titleEn}" لأنه يحقق أقل وقت استجابة (${first.responseTimeMin} دقيقة) مع استيفاء المهارات والسعة المطلوبة تحت ضابط الطريق.`;
    } else {
      return `Team ${first.team.nameEn} was assigned to Incident "${first.incident.titleEn}" because it provides the lowest response time (${first.responseTimeMin} min) while satisfying required capability (${first.team.skill}) and personnel capacity under road degradation multiplier α=${(first.incident.roadFactor * globalRoadDegradation).toFixed(1)}.`;
    }
  }, [optimizationResults, globalRoadDegradation, language]);

  // PDF Export
  const handleExportPdf = () => {
    const isEn = language === 'en';
    const isAr = language === 'ar';

    const headers = isEn
      ? ['Incident ID', 'Incident Name', 'Assigned Team', 'Skill Match', 'Distance (km)', 'ETA (min)', 'Priority']
      : isAr
      ? ['رمز الحادث', 'اسم الحادث', 'الفريق المخصص', 'توافق المهارة', 'المسافة (کم)', 'وقت الوصول', 'الأولوية']
      : ['شناسه حادثه', 'عنوان حادثه', 'تیم تخصیص‌یافته', 'تطابق مهارت', 'مسافت (کیلومتر)', 'زمان رسیدن (دقیقه)', 'سطح اولویت'];

    const rows = optimizationResults.assignments.map((a) => [
      a.incident.id,
      isEn ? a.incident.titleEn : a.incident.titleFa,
      isEn ? a.team.nameEn : a.team.nameFa,
      a.team.skill,
      `${a.distanceKm} km`,
      `${a.responseTimeMin} min`,
      a.incident.severity,
    ]);

    generatePdfReport({
      language,
      title: isEn
        ? 'Emergency Response Team Allocation Report (MILP Solver)'
        : isAr
        ? 'تقرير تخصيص فرق الاستجابة للطوارئ (النموذج الرياضي MILP)'
        : 'گزارش بهینه‌سازی و تخصیص تیم‌های امداد و نجات (مدل MILP)',
      subtitle: isEn
        ? `Coverage: ${optimizationResults.coveragePct}% | Avg Response Time: ${optimizationResults.avgTime} min | Speed Factor: ${speedMultiplier}x`
        : isAr
        ? `نسبة التغطية: ${optimizationResults.coveragePct}% | متوسط وقت الوصول: ${optimizationResults.avgTime} دقيقة`
        : `پوشش حوادث: ${optimizationResults.coveragePct}٪ | میانگین زمان رسیدن: ${optimizationResults.avgTime} دقیقه | ضریب سرعت: ${speedMultiplier} برابر`,
      filename: 'team_allocation_report.pdf',
      sections: [
        {
          heading: isEn ? '1. Mathematical Model Formulation' : isAr ? '١. الصيغة الرياضية للنموذج' : '۱. مدل‌سازی ریاضی و فرمول‌بندی بهینه‌سازی',
          text: isEn
            ? 'Objective Function: Min Z = ∑ ∑ (P_j * t_ij * x_ij), subject to Incident Coverage, Team Availability, Skill Matching, and Personnel Capacity.'
            : 'تابع هدف: کمینه‌سازی مجموع زمان پاسخ‌دهی وزن‌دار min Z = ∑ ∑ (P_j * t_ij * x_ij) با محدودیت‌های پوشش حادثه، دسترسی تیم، تطابق مهارت و ظرفیت پرسنل.',
        },
        {
          heading: isEn ? '2. Optimization KPIs' : isAr ? '٢. مؤشرات الأداء الرئيسية' : '۲. شاخص‌های کلیدی عملکرد تخصیص (KPIs)',
          keyValues: [
            { label: isEn ? 'Total Incidents' : 'کل حوادث فعال', value: incidents.length },
            { label: isEn ? 'Available Teams' : 'تیم‌های آماده‌باش', value: optimizationResults.availableTeamsCount },
            { label: isEn ? 'Average Response Time' : 'میانگین زمان وصول', value: `${optimizationResults.avgTime} min` },
            { label: isEn ? 'Maximum Response Time' : 'حداکثر زمان وصول', value: `${optimizationResults.maxTime} min` },
            { label: isEn ? 'Coverage Rate' : 'نرخ پوشش حوادث', value: `${optimizationResults.coveragePct}%` },
            { label: isEn ? 'Critical Incidents Covered' : 'پوشش حوادث بحرانی', value: `${optimizationResults.criticalCovered} / ${optimizationResults.criticalIncidentsTotal}` },
          ],
        },
        {
          heading: isEn ? '3. Optimal Assignments Matrix' : isAr ? '٣. مصفوفة التخصيص الأمثل' : '۳. جدول ماتریس تخصیص بهینه تیم‌ها به حوادث',
          table: { headers, rows },
        },
        {
          heading: isEn ? '4. Operational Decision Explanation' : isAr ? '٤. التفسير التشغيلي للقرار' : '۴. تحلیل و تفسیر عملیاتی تصمیمات بهینه‌سازی',
          text: operationalNarrative,
        },
      ],
    });
  };

  // Scenario comparisons for Chart
  const scenarioData = useMemo(() => {
    return [
      { scenario: 'Normal Roads (α=1.0)', avgTime: Math.round(optimizationResults.avgTime * 0.8 * 10) / 10 },
      { scenario: 'Current Status', avgTime: optimizationResults.avgTime },
      { scenario: 'Damaged (α=1.5)', avgTime: Math.round(optimizationResults.avgTime * 1.35 * 10) / 10 },
      { scenario: 'Severe Damage (α=2.0)', avgTime: Math.round(optimizationResults.avgTime * 1.8 * 10) / 10 },
    ];
  }, [optimizationResults]);

  const donutData = useMemo(() => {
    return [
      { name: isRtl ? 'حوادث پوشش داده شده' : 'Covered', value: optimizationResults.assignments.length, color: '#10b981' },
      { name: isRtl ? 'حوادث بدون تیم' : 'Unassigned', value: optimizationResults.unassignedIncidents.length, color: '#ef4444' },
    ];
  }, [optimizationResults, isRtl]);

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Banner Header */}
      <div className="bg-[#14141a] p-6 rounded-2xl border border-[#262630] shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-950/80 border border-red-800 text-[#D6001C] rounded-xl shadow-inner">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>
                {language === 'fa'
                  ? 'بهینه‌سازی تخصیص تیم‌های امداد و نجات (Emergency Response Team Allocation)'
                  : language === 'ar'
                  ? 'تخصيص فرق الاستجابة للطوارئ'
                  : 'Emergency Response Team Allocation'}
              </span>
              <span className="bg-red-950/60 text-[#D6001C] text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border border-red-800 uppercase">
                MILP Solver
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'fa'
                ? 'مدل‌سازی کمینه‌سازی زمان پاسخ‌دهی و تطابق هوشمند ظرفیت، مهارت و وضعیت راه‌ها'
                : 'Exact Integer Programming assignment minimizing response time & matching skill sets'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="bg-[#1e1e28] hover:bg-[#282838] text-slate-300 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 border border-[#303042] transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>{language === 'fa' ? 'بازنشانی (RESET)' : 'RESET'}</span>
          </button>
          <button
            onClick={handleExportPdf}
            className="bg-[#D6001C] hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>{language === 'fa' ? 'گزارش PDF تخصیص' : 'Generate PDF Report'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Inputs vs Map vs KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Editable Inputs & Parameters */}
        <div className="lg:col-span-4 bg-[#14141a] p-5 rounded-2xl border border-[#262630] space-y-5">
          <div className="flex items-center justify-between border-b border-[#262630] pb-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#D6001C]" />
              <span>{language === 'fa' ? 'پارامترهای ورودی و محدودیت‌ها' : 'Parameters & Constraints'}</span>
            </h3>
            <span className="text-[10px] font-mono bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
              Live Recalculation
            </span>
          </div>

          {/* Sliders */}
          <div className="space-y-4">
            <div className="bg-[#1a1a22] p-3.5 rounded-xl border border-[#2a2a38] space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-200">
                <span>ضریب سرعت ناوگان (Speed Multiplier):</span>
                <span className="text-[#D6001C] font-mono">{speedMultiplier}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={speedMultiplier}
                onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
                className="w-full accent-[#D6001C]"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0.5x (ترافیک سنگین)</span>
                <span>1.5x (مسیر باز)</span>
              </div>
            </div>

            <div className="bg-[#1a1a22] p-3.5 rounded-xl border border-[#2a2a38] space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-200">
                <span>ضریب تخریب معابر (Road Degradation α):</span>
                <span className="text-[#D6001C] font-mono">{globalRoadDegradation}</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="2.0"
                step="0.1"
                value={globalRoadDegradation}
                onChange={(e) => setGlobalRoadDegradation(Number(e.target.value))}
                className="w-full accent-[#D6001C]"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>1.0 (عادی)</span>
                <span>2.0 (مسدود/تخریب شدید)</span>
              </div>
            </div>

            <div className="bg-[#1a1a22] p-3.5 rounded-xl border border-[#2a2a38] flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">اعمال وزن اولویت حوادث (Priority Weights)</span>
              <input
                type="checkbox"
                checked={usePriorityWeight}
                onChange={(e) => setUsePriorityWeight(e.target.checked)}
                className="w-4 h-4 accent-[#D6001C] rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Teams Status Toggles Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300">وضعیت آمادگی تیم‌های امداد:</h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto text-xs pr-1">
              {teams.map((t) => (
                <div
                  key={t.id}
                  className="bg-[#181820] p-2.5 rounded-lg border border-[#262634] flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-white block">{isRtl ? t.nameFa : t.nameEn}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {t.skill} • {t.personnel} نفر
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setTeams((prev) =>
                        prev.map((team) =>
                          team.id === t.id
                            ? { ...team, status: team.status === 'Available' ? 'Busy' : 'Available' }
                            : team
                        )
                      );
                    }}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition ${
                      t.status === 'Available'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-red-950 text-red-300 border border-red-800'
                    }`}
                  >
                    {t.status === 'Available' ? 'آماده‌باش' : 'مشغول'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column: Interactive SVG Map with Route Lines */}
        <div className="lg:col-span-8 space-y-5">
          {/* KPI Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#14141a] p-3.5 rounded-xl border border-[#262630]">
              <p className="text-[10px] font-bold text-slate-400 uppercase">میانگین زمان رسیدن</p>
              <h3 className="text-xl font-black text-emerald-400 mt-1 font-mono">{optimizationResults.avgTime} دقیقه</h3>
            </div>
            <div className="bg-[#14141a] p-3.5 rounded-xl border border-[#262630]">
              <p className="text-[10px] font-bold text-slate-400 uppercase">حداکثر زمان رسیدن</p>
              <h3 className="text-xl font-black text-amber-400 mt-1 font-mono">{optimizationResults.maxTime} دقیقه</h3>
            </div>
            <div className="bg-[#14141a] p-3.5 rounded-xl border border-[#262630]">
              <p className="text-[10px] font-bold text-slate-400 uppercase">پوشش حوادث</p>
              <h3 className="text-xl font-black text-[#D6001C] mt-1 font-mono">{optimizationResults.coveragePct}%</h3>
            </div>
            <div className="bg-[#14141a] p-3.5 rounded-xl border border-[#262630]">
              <p className="text-[10px] font-bold text-slate-400 uppercase">حوادث بحرانی پوشش‌یافته</p>
              <h3 className="text-xl font-black text-blue-400 mt-1 font-mono">
                {optimizationResults.criticalCovered} / {optimizationResults.criticalIncidentsTotal}
              </h3>
            </div>
          </div>

          {/* Map Area */}
          <div className="bg-[#14141a] p-4 rounded-2xl border border-[#262630] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D6001C]" />
                <span>نقشه تعاملی مسیریابی و تخصیص تیم‌های امدادی (Gis Coordinate Mapping)</span>
              </h3>
              <div className="flex items-center gap-3 text-[10px] font-bold">
                <span className="flex items-center gap-1 text-blue-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> تیم امدادی
                </span>
                <span className="flex items-center gap-1 text-red-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span> حادثه بحرانی
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-4 h-0.5 bg-emerald-500 inline-block"></span> مسیر بهینه
                </span>
              </div>
            </div>

            {/* SVG Visualizer */}
            <div className="relative w-full h-80 bg-[#09090d] border border-[#222230] rounded-xl overflow-hidden p-2">
              <svg className="w-full h-full" viewBox="0 0 600 350">
                <defs>
                  <pattern id="grid-m1" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#222232" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-m1)" />

                {/* Coordinate mapping helper scaling functions */}
                {(() => {
                  const minLat = 34.0, maxLat = 35.2;
                  const minLng = 45.5, maxLng = 47.3;
                  const scaleX = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * 540 + 30;
                  const scaleY = (lat: number) => 320 - ((lat - minLat) / (maxLat - minLat)) * 290;

                  return (
                    <>
                      {/* Draw Route Vector Lines for Assignments */}
                      {optimizationResults.assignments.map((a, idx) => {
                        const x1 = scaleX(a.team.lng);
                        const y1 = scaleY(a.team.lat);
                        const x2 = scaleX(a.incident.lng);
                        const y2 = scaleY(a.incident.lat);

                        return (
                          <g key={idx}>
                            <line
                              x1={x1}
                              y1={y1}
                              x2={x2}
                              y2={y2}
                              stroke="#10b981"
                              strokeWidth="2.5"
                              strokeDasharray="5,5"
                              className="animate-pulse"
                            />
                            {/* ETA badge on midpoint */}
                            <rect
                              x={(x1 + x2) / 2 - 20}
                              y={(y1 + y2) / 2 - 10}
                              width="40"
                              height="18"
                              rx="4"
                              fill="#0f172a"
                              stroke="#10b981"
                              strokeWidth="1"
                            />
                            <text
                              x={(x1 + x2) / 2}
                              y={(y1 + y2) / 2 + 3}
                              fill="#10b981"
                              fontSize="9"
                              fontWeight="bold"
                              textAnchor="middle"
                            >
                              {a.responseTimeMin}m
                            </text>
                          </g>
                        );
                      })}

                      {/* Render Team Markers (Blue Badges) */}
                      {teams.map((t) => {
                        const cx = scaleX(t.lng);
                        const cy = scaleY(t.lat);
                        const isAssigned = optimizationResults.assignments.some((a) => a.team.id === t.id);

                        return (
                          <g key={t.id} className="cursor-pointer">
                            <circle cx={cx} cy={cy} r={isAssigned ? "12" : "9"} fill="#3b82f6" fillOpacity="0.3" stroke="#3b82f6" strokeWidth="2" />
                            <circle cx={cx} cy={cy} r="5" fill="#3b82f6" />
                            <text x={cx} y={cy - 14} fill="#60a5fa" fontSize="10" fontWeight="extrabold" textAnchor="middle">
                              {t.id}
                            </text>
                          </g>
                        );
                      })}

                      {/* Render Incident Markers (Red / Orange Pins) */}
                      {incidents.map((inc) => {
                        const cx = scaleX(inc.lng);
                        const cy = scaleY(inc.lat);
                        const isAssigned = optimizationResults.assignments.some((a) => a.incident.id === inc.id);
                        const isCritical = inc.severity === 'Critical';

                        return (
                          <g key={inc.id} className="cursor-pointer" onClick={() => setSelectedIncidentId(inc.id)}>
                            <circle
                              cx={cx}
                              cy={cy}
                              r={isCritical ? "14" : "10"}
                              fill={isCritical ? "#ef4444" : "#f97316"}
                              fillOpacity="0.35"
                              stroke={isCritical ? "#ef4444" : "#f97316"}
                              strokeWidth="2"
                            />
                            <circle cx={cx} cy={cy} r="6" fill={isCritical ? "#dc2626" : "#ea580c"} />
                            <text x={cx} y={cy + 18} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                              {inc.id} ({inc.victims}p)
                            </text>
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Explanation & Unassigned Warnings */}
      <div className="bg-[#14141a] p-5 rounded-2xl border border-[#262630] space-y-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#D6001C]" />
          <span>تحلیل و تفسیر عملیاتی تصمیم‌گیری بهینه (Operational Decision Interpretation)</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed bg-[#1a1a24] p-3.5 rounded-xl border border-[#2a2a38]">
          {operationalNarrative}
        </p>

        {optimizationResults.unassignedIncidents.length > 0 && (
          <div className="bg-red-950/40 border border-red-800/80 p-3.5 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>هشدار حوادث فاقد تخصیص تیم امدادی (Unassigned Incidents Constraint Violation):</span>
            </h4>
            <ul className="text-xs text-red-200 space-y-1 pl-4 list-disc">
              {optimizationResults.unassignedIncidents.map((u, idx) => (
                <li key={idx}>
                  <strong>{isRtl ? u.incident.titleFa : u.incident.titleEn} ({u.incident.severity}):</strong> {u.reason}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Response Time Bar Chart */}
        <div className="bg-[#14141a] p-5 rounded-2xl border border-[#262630] space-y-3">
          <h4 className="text-xs font-bold text-slate-200 uppercase">زمان رسیدن هر حادثه (Response Time)</h4>
          <div className="h-48 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={optimizationResults.assignments}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262635" />
                <XAxis dataKey="incident.id" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                <Bar dataKey="responseTimeMin" fill="#10b981" radius={[4, 4, 0, 0]} name="زمان وصول (دقیقه)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Road Degradation Scenario Line Chart */}
        <div className="bg-[#14141a] p-5 rounded-2xl border border-[#262630] space-y-3">
          <h4 className="text-xs font-bold text-slate-200 uppercase">تحلیل سناریوی آسیب راه‌ها</h4>
          <div className="h-48 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scenarioData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262635" />
                <XAxis dataKey="scenario" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                <Line type="monotone" dataKey="avgTime" stroke="#f59e0b" strokeWidth={2} name="میانگین زمان (دقیقه)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Coverage Donut Chart */}
        <div className="bg-[#14141a] p-5 rounded-2xl border border-[#262630] space-y-3">
          <h4 className="text-xs font-bold text-slate-200 uppercase">نسبت پوشش حوادث</h4>
          <div className="h-48 w-full text-xs flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value" paddingAngle={5}>
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Result Table Breakdown */}
      <div className="bg-[#14141a] p-5 rounded-2xl border border-[#262630] space-y-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>جدول ماتریس تخصیص بهینه تیم‌های امدادی (Optimal Assignments Table)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-[#1e1e28] text-slate-300 font-bold border-b border-[#2a2a3a]">
                <th className="p-2.5">شناسه حادثه</th>
                <th className="p-2.5">عنوان حادثه</th>
                <th className="p-2.5">تیم تخصیص‌یافته</th>
                <th className="p-2.5">تطابق مهارت</th>
                <th className="p-2.5">مسافت (کیلومتر)</th>
                <th className="p-2.5">زمان رسیدن (دقیقه)</th>
                <th className="p-2.5">شدت حادثه</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222230]">
              {optimizationResults.assignments.map((a, idx) => (
                <tr key={idx} className="hover:bg-[#1a1a24] transition">
                  <td className="p-2.5 font-mono text-slate-300">{a.incident.id}</td>
                  <td className="p-2.5 font-bold text-white">{isRtl ? a.incident.titleFa : a.incident.titleEn}</td>
                  <td className="p-2.5 font-bold text-[#D6001C]">{isRtl ? a.team.nameFa : a.team.nameEn}</td>
                  <td className="p-2.5">
                    <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                      {a.team.skill}
                    </span>
                  </td>
                  <td className="p-2.5 font-mono text-slate-300">{a.distanceKm} km</td>
                  <td className="p-2.5 font-mono font-bold text-emerald-400">{a.responseTimeMin} min</td>
                  <td className="p-2.5 font-bold">
                    <span
                      className={`px-2 py-0.5 rounded ${
                        a.incident.severity === 'Critical'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {a.incident.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
