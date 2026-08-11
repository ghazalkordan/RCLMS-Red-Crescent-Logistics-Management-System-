import React, { useState, useMemo } from 'react';
import { Language } from '../types';
import { generatePdfReport } from '../lib/pdfGenerator';
import {
  AlertTriangle,
  Sliders,
  FileText,
  Clock,
  RotateCcw,
  Activity,
  Layers,
  MapPin,
  Flame,
  Zap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

interface IncidentPriorityModuleProps {
  language: Language;
}

interface IncidentRawData {
  id: string;
  titleFa: string;
  titleEn: string;
  lat: number;
  lng: number;
  severityRaw: number; // 1 - 10
  victimsRaw: number; // headcount
  populationExposedRaw: number; // headcount
  waitingTimeHoursRaw: number; // hours
  medicalUrgencyRaw: number; // 1 - 10
  infraDamageRaw: number; // 1 - 10
  distanceKmRaw: number; // km (negative risk)
  requiredResourcesRaw: number; // 1 - 10
}

export const IncidentPriorityModule: React.FC<IncidentPriorityModuleProps> = ({ language }) => {
  const isRtl = language === 'fa' || language === 'ar';

  // Dynamic Criteria Weight Sliders (total sum should normalize to 100%)
  const [weights, setWeights] = useState({
    severity: 20,
    victims: 25,
    population: 15,
    waitingTime: 10,
    medicalUrgency: 15,
    infraDamage: 10,
    distance: 5,
  });

  // Configurable Triage Thresholds
  const [thresholds, setThresholds] = useState({
    medium: 25,
    high: 50,
    critical: 75,
  });

  // What-If Scenario Controls
  const [victimMultiplier, setVictimMultiplier] = useState<number>(1.0); // 1.0 to 2.5 (+150%)
  const [extraWaitingTimeHours, setExtraWaitingTimeHours] = useState<number>(0); // 0 to 12 hours
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('I01');

  // Sample Incident Datasets
  const [incidents, setIncidents] = useState<IncidentRawData[]>([
    { id: 'I01', titleFa: 'زلزله و تخریب بیمارستان سرپل ذهاب', titleEn: 'Hospital Collapse Sarpol', lat: 34.4611, lng: 45.8627, severityRaw: 9, victimsRaw: 35, populationExposedRaw: 1200, waitingTimeHoursRaw: 2.5, medicalUrgencyRaw: 10, infraDamageRaw: 9, distanceKmRaw: 15, requiredResourcesRaw: 9 },
    { id: 'I02', titleFa: 'انفجار خط لوله گاز اسلام‌آباد غرب', titleEn: 'Gas Pipeline Explosion Eslamabad', lat: 34.1094, lng: 46.5273, severityRaw: 8, victimsRaw: 18, populationExposedRaw: 800, waitingTimeHoursRaw: 1.2, medicalUrgencyRaw: 8, infraDamageRaw: 10, distanceKmRaw: 28, requiredResourcesRaw: 8 },
    { id: 'I03', titleFa: 'سیل و آبگرفتگی روستاهای جوانرود', titleEn: 'Flash Flood Javanrud Villages', lat: 34.7961, lng: 46.4953, severityRaw: 6, victimsRaw: 12, populationExposedRaw: 2500, waitingTimeHoursRaw: 5.0, medicalUrgencyRaw: 6, infraDamageRaw: 7, distanceKmRaw: 42, requiredResourcesRaw: 6 },
    { id: 'I04', titleFa: 'آتش‌سوزی گسترده جنگل‌های پاوه', titleEn: 'Paveh Forest Wildfire', lat: 35.0434, lng: 46.3562, severityRaw: 5, victimsRaw: 3, populationExposedRaw: 400, waitingTimeHoursRaw: 8.0, medicalUrgencyRaw: 4, infraDamageRaw: 5, distanceKmRaw: 55, requiredResourcesRaw: 7 },
    { id: 'I05', titleFa: 'نشت گاز شیمیایی شهرک صنعتی کرمانشاه', titleEn: 'Chemical Leak Industrial Zone', lat: 34.3276, lng: 47.0778, severityRaw: 9, victimsRaw: 24, populationExposedRaw: 3500, waitingTimeHoursRaw: 0.8, medicalUrgencyRaw: 9, infraDamageRaw: 6, distanceKmRaw: 8, requiredResourcesRaw: 10 },
  ]);

  const handleReset = () => {
    setWeights({ severity: 20, victims: 25, population: 15, waitingTime: 10, medicalUrgency: 15, infraDamage: 10, distance: 5 });
    setThresholds({ medium: 25, high: 50, critical: 75 });
    setVictimMultiplier(1.0);
    setExtraWaitingTimeHours(0);
  };

  // Mathematical AHP / Weighted Triage Calculation
  const calculatedResults = useMemo(() => {
    const sumW = (Object.values(weights) as number[]).reduce((a: number, b: number) => a + b, 0) || 1;
    const wNorm = {
      severity: Number(weights.severity) / sumW,
      victims: Number(weights.victims) / sumW,
      population: Number(weights.population) / sumW,
      waitingTime: Number(weights.waitingTime) / sumW,
      medicalUrgency: Number(weights.medicalUrgency) / sumW,
      infraDamage: Number(weights.infraDamage) / sumW,
      distance: Number(weights.distance) / sumW,
    };

    // Find min and max for Min-Max Normalization
    const maxVals = {
      severity: Math.max(...incidents.map((i) => i.severityRaw)),
      victims: Math.max(...incidents.map((i) => i.victimsRaw * victimMultiplier)),
      population: Math.max(...incidents.map((i) => i.populationExposedRaw)),
      waitingTime: Math.max(...incidents.map((i) => i.waitingTimeHoursRaw + extraWaitingTimeHours)),
      medicalUrgency: Math.max(...incidents.map((i) => i.medicalUrgencyRaw)),
      infraDamage: Math.max(...incidents.map((i) => i.infraDamageRaw)),
      distance: Math.max(...incidents.map((i) => i.distanceKmRaw)),
    };

    const minVals = {
      severity: Math.min(...incidents.map((i) => i.severityRaw)),
      victims: Math.min(...incidents.map((i) => i.victimsRaw * victimMultiplier)),
      population: Math.min(...incidents.map((i) => i.populationExposedRaw)),
      waitingTime: Math.min(...incidents.map((i) => i.waitingTimeHoursRaw + extraWaitingTimeHours)),
      medicalUrgency: Math.min(...incidents.map((i) => i.medicalUrgencyRaw)),
      infraDamage: Math.min(...incidents.map((i) => i.infraDamageRaw)),
      distance: Math.min(...incidents.map((i) => i.distanceKmRaw)),
    };

    const normalizePos = (val: number, min: number, max: number) => {
      if (max === min) return 50;
      return 100 * ((val - min) / (max - min));
    };

    const normalizeNeg = (val: number, min: number, max: number) => {
      if (max === min) return 50;
      return 100 * (1 - (val - min) / (max - min));
    };

    // Calculate baseline and scenario-adjusted scores
    const items = incidents.map((inc) => {
      // Adjusted values under what-if scenario
      const adjVictims = inc.victimsRaw * victimMultiplier;
      const adjWaitTime = inc.waitingTimeHoursRaw + extraWaitingTimeHours;

      // Baseline Score (without what-if)
      const baseNorm = {
        S: normalizePos(inc.severityRaw, minVals.severity, maxVals.severity),
        V: normalizePos(inc.victimsRaw, minVals.victims, maxVals.victims),
        P: normalizePos(inc.populationExposedRaw, minVals.population, maxVals.population),
        W: normalizePos(inc.waitingTimeHoursRaw, minVals.waitingTime, maxVals.waitingTime),
        M: normalizePos(inc.medicalUrgencyRaw, minVals.medicalUrgency, maxVals.medicalUrgency),
        D: normalizePos(inc.infraDamageRaw, minVals.infraDamage, maxVals.infraDamage),
        Dist: normalizeNeg(inc.distanceKmRaw, minVals.distance, maxVals.distance),
      };

      const baseScore =
        wNorm.severity * baseNorm.S +
        wNorm.victims * baseNorm.V +
        wNorm.population * baseNorm.P +
        wNorm.waitingTime * baseNorm.W +
        wNorm.medicalUrgency * baseNorm.M +
        wNorm.infraDamage * baseNorm.D +
        wNorm.distance * baseNorm.Dist;

      // Scenario Score
      const norm = {
        S: normalizePos(inc.severityRaw, minVals.severity, maxVals.severity),
        V: normalizePos(adjVictims, minVals.victims, maxVals.victims),
        P: normalizePos(inc.populationExposedRaw, minVals.population, maxVals.population),
        W: normalizePos(adjWaitTime, minVals.waitingTime, maxVals.waitingTime),
        M: normalizePos(inc.medicalUrgencyRaw, minVals.medicalUrgency, maxVals.medicalUrgency),
        D: normalizePos(inc.infraDamageRaw, minVals.infraDamage, maxVals.infraDamage),
        Dist: normalizeNeg(inc.distanceKmRaw, minVals.distance, maxVals.distance),
      };

      const scenarioScore =
        wNorm.severity * norm.S +
        wNorm.victims * norm.V +
        wNorm.population * norm.P +
        wNorm.waitingTime * norm.W +
        wNorm.medicalUrgency * norm.M +
        wNorm.infraDamage * norm.D +
        wNorm.distance * norm.Dist;

      const priorityScore = Math.round(scenarioScore * 10) / 10;
      const basePriorityScore = Math.round(baseScore * 10) / 10;
      const deltaPct = Math.round(((priorityScore - basePriorityScore) / Math.max(1, basePriorityScore)) * 100);

      let classification: 'Critical' | 'High' | 'Medium' | 'Low' = 'Low';
      if (priorityScore >= thresholds.critical) classification = 'Critical';
      else if (priorityScore >= thresholds.high) classification = 'High';
      else if (priorityScore >= thresholds.medium) classification = 'Medium';

      return {
        incident: inc,
        adjVictims: Math.round(adjVictims),
        adjWaitTime: Math.round(adjWaitTime * 10) / 10,
        norm,
        basePriorityScore,
        priorityScore,
        deltaPct,
        classification,
      };
    });

    // Sort by priorityScore descending
    const sorted = [...items].sort((a, b) => b.priorityScore - a.priorityScore);

    const criticalCount = sorted.filter((s) => s.classification === 'Critical').length;
    const highCount = sorted.filter((s) => s.classification === 'High').length;
    const avgScore = sorted.reduce((acc, s) => acc + s.priorityScore, 0) / sorted.length;

    return {
      sorted,
      criticalCount,
      highCount,
      avgScore: Math.round(avgScore * 10) / 10,
    };
  }, [incidents, weights, thresholds, victimMultiplier, extraWaitingTimeHours]);

  // Selected incident details for Radar Chart
  const selectedItem = useMemo(() => {
    return calculatedResults.sorted.find((s) => s.incident.id === selectedIncidentId) || calculatedResults.sorted[0];
  }, [calculatedResults, selectedIncidentId]);

  const radarData = useMemo(() => {
    if (!selectedItem) return [];
    return [
      { criterion: isRtl ? 'شدت حادثه' : 'Severity', score: Math.round(selectedItem.norm.S) },
      { criterion: isRtl ? 'مصدومان' : 'Victims', score: Math.round(selectedItem.norm.V) },
      { criterion: isRtl ? 'جمعیت در معرض' : 'Population', score: Math.round(selectedItem.norm.P) },
      { criterion: isRtl ? 'زمان انتظار' : 'Waiting', score: Math.round(selectedItem.norm.W) },
      { criterion: isRtl ? 'فوریت پزشکی' : 'Medical', score: Math.round(selectedItem.norm.M) },
      { criterion: isRtl ? 'خسارت زیرساخت' : 'Infra Damage', score: Math.round(selectedItem.norm.D) },
      { criterion: isRtl ? 'نزدیکی به تیم' : 'Proximity', score: Math.round(selectedItem.norm.Dist) },
    ];
  }, [selectedItem, isRtl]);

  // Timeline evolution chart data
  const timelineData = useMemo(() => {
    if (!selectedItem) return [];
    const points = [];
    for (let t = 0; t <= 12; t += 2) {
      const waitBonus = t * 4; // simulated waiting time score escalation
      const scoreT = Math.min(100, Math.round((selectedItem.priorityScore + waitBonus) * 10) / 10);
      points.push({ time: `+${t}h`, score: scoreT });
    }
    return points;
  }, [selectedItem]);

  // Operational Explanation Narrative
  const operationalNarrative = useMemo(() => {
    if (calculatedResults.sorted.length === 0) return '';
    const top = calculatedResults.sorted[0];
    if (language === 'fa') {
      return `حادثه "${top.incident.titleFa}" با امتیاز اولویت ${top.priorityScore} (کلاس ${top.classification}) در رتبه نخست تریاژ تخصیص منابع قرار گرفت. عوامل اصلی تاثیرگذار شامل شدت (${top.incident.severityRaw}/10)، تعداد مصدومان (${top.adjVictims} نفر) و فوریت پزشکی می‌باشد.`;
    } else {
      return `Incident "${top.incident.titleEn}" with Priority Score ${top.priorityScore} (${top.classification}) achieved Rank #1 in triage allocation. Major contributing factors include Severity (${top.incident.severityRaw}/10), Casualties (${top.adjVictims}), and Medical Urgency.`;
    }
  }, [calculatedResults, language]);

  // PDF Export
  const handleExportPdf = () => {
    const isEn = language === 'en';
    const isAr = language === 'ar';

    const headers = isEn
      ? ['Rank', 'Incident ID', 'Title', 'Priority Score', 'Classification', 'Casualties', 'Wait Time']
      : isAr
      ? ['الرتبة', 'رمز الحادث', 'عنوان الحادث', 'درجة الأولوية', 'التصنيف', 'الضحايا', 'وقت الانتظار']
      : ['رتبه', 'شناسه', 'عنوان حادثه', 'امتیاز اولویت (PS)', 'سطح اولویت', 'تعداد مصدومان', 'زمان انتظار'];

    const rows = calculatedResults.sorted.map((item, index) => [
      `#${index + 1}`,
      item.incident.id,
      isEn ? item.incident.titleEn : item.incident.titleFa,
      item.priorityScore.toString(),
      item.classification,
      item.adjVictims.toString(),
      `${item.adjWaitTime} hrs`,
    ]);

    generatePdfReport({
      language,
      title: isEn
        ? 'Incident Priority & Resource Triage Report (AHP Matrix)'
        : isAr
        ? 'تقرير أولويات الحوادث وفرز الموارد (مصفوفة AHP)'
        : 'گزارش اولویت‌بندی حوادث و تریاژ منابع (مدل AHP)',
      subtitle: isEn
        ? `Avg Priority Score: ${calculatedResults.avgScore} | Critical Count: ${calculatedResults.criticalCount}`
        : isAr
        ? `متوسط درجة الأولوية: ${calculatedResults.avgScore} | الحالات الحرجة: ${calculatedResults.criticalCount}`
        : `میانگین امتیاز اولویت: ${calculatedResults.avgScore} | حوادث بحرانی: ${calculatedResults.criticalCount}`,
      filename: 'incident_priority_report.pdf',
      sections: [
        {
          heading: isEn ? '1. Multi-Criteria Weightings' : '۱. اوزان شاخص‌های چندمعیاره تریاژ (AHP Weights)',
          keyValues: [
            { label: 'Severity Weight', value: `${weights.severity}%` },
            { label: 'Victims Weight', value: `${weights.victims}%` },
            { label: 'Population Weight', value: `${weights.population}%` },
            { label: 'Waiting Time Weight', value: `${weights.waitingTime}%` },
            { label: 'Medical Urgency Weight', value: `${weights.medicalUrgency}%` },
            { label: 'Infra Damage Weight', value: `${weights.infraDamage}%` },
          ],
        },
        {
          heading: isEn ? '2. Incident Priority Matrix' : '۲. ماتریس رتبه‌بندی اولویت حوادث',
          table: { headers, rows },
        },
        {
          heading: isEn ? '3. Operational Recommendation' : '۳. تحلیل و دستورالعمل عملیاتی اعزام منابع',
          text: operationalNarrative,
        },
      ],
    });
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="bg-[#14141a] p-6 rounded-2xl border border-[#262630] shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-950/80 border border-amber-800 text-amber-400 rounded-xl shadow-inner">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>
                {language === 'fa'
                  ? 'موتور اولویت‌بندی و تریاژ حوادث (Incident Priority & Resource Triage)'
                  : language === 'ar'
                  ? 'محرك أولويات الحوادث وفرز الموارد'
                  : 'Incident Priority & Resource Triage Engine'}
              </span>
              <span className="bg-amber-950/60 text-amber-400 text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border border-amber-800 uppercase">
                AHP Multi-Criteria
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'fa'
                ? 'رتبه‌بندی خطی وزن‌دار حوادث همزمان بر اساس شدت، آسیب‌دیدگان، فوریت و زمان انتظار'
                : 'Weighted linear combination priority scoring with dynamic thresholding and scenario what-if'}
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
            <span>{language === 'fa' ? 'گزارش PDF تریاژ' : 'Generate PDF Report'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sliders for Criteria Weights & What-If Scenarios */}
        <div className="lg:col-span-4 bg-[#14141a] p-5 rounded-2xl border border-[#262630] space-y-5">
          <div className="flex items-center justify-between border-b border-[#262630] pb-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>تنظیم اوزان شاخص‌های تریاژ (Dynamic Weights)</span>
            </h3>
          </div>

          <div className="space-y-3.5 text-xs">
            {Object.entries(weights).map(([key, val]) => (
              <div key={key} className="bg-[#1a1a22] p-2.5 rounded-xl border border-[#2a2a38] space-y-1.5">
                <div className="flex justify-between font-bold text-slate-300">
                  <span>
                    {key === 'severity'
                      ? 'شدت حادثه'
                      : key === 'victims'
                      ? 'تعداد مصدومان'
                      : key === 'population'
                      ? 'جمعیت در معرض خطر'
                      : key === 'waitingTime'
                      ? 'زمان انتظار'
                      : key === 'medicalUrgency'
                      ? 'فوریت پزشکی'
                      : key === 'infraDamage'
                      ? 'خسارت زیرساخت'
                      : 'فاصله تا تیم'}
                  </span>
                  <span className="font-mono text-amber-400">{val}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={val}
                  onChange={(e) => setWeights({ ...weights, [key]: Number(e.target.value) })}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            ))}
          </div>

          {/* What-If Controls */}
          <div className="bg-amber-950/20 border border-amber-900/60 p-3.5 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-amber-400 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>شبیه‌سازی سناریو (What-If Analysis):</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">افزایش تعداد مصدومان (+{Math.round((victimMultiplier - 1) * 100)}%):</label>
                <input
                  type="range"
                  min="1.0"
                  max="2.5"
                  step="0.1"
                  value={victimMultiplier}
                  onChange={(e) => setVictimMultiplier(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">افزایش زمان انتظار (+{extraWaitingTimeHours} ساعت):</label>
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="1"
                  value={extraWaitingTimeHours}
                  onChange={(e) => setExtraWaitingTimeHours(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right: Map + Charts */}
        <div className="lg:col-span-8 space-y-5">
          {/* Map Preview */}
          <div className="bg-[#14141a] p-4 rounded-2xl border border-[#262630] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>نقشه اولویت‌بندی مکانی حوادث (Triage Spatial Map)</span>
              </h3>
              <div className="flex items-center gap-3 text-[10px] font-bold">
                <span className="flex items-center gap-1 text-red-400">🔴 بحرانی (PS≥75)</span>
                <span className="flex items-center gap-1 text-amber-400">🟠 بالا (50-75)</span>
                <span className="flex items-center gap-1 text-yellow-400">🟡 متوسط (25-50)</span>
                <span className="flex items-center gap-1 text-emerald-400">🟢 کم (PS&lt;25)</span>
              </div>
            </div>

            {/* SVG Interactive Map */}
            <div className="relative w-full h-72 bg-[#09090d] border border-[#222230] rounded-xl overflow-hidden p-2">
              <svg className="w-full h-full" viewBox="0 0 600 300">
                <defs>
                  <pattern id="grid-m2" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#222232" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-m2)" />

                {(() => {
                  const minLat = 34.0, maxLat = 35.2;
                  const minLng = 45.5, maxLng = 47.3;
                  const scaleX = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * 540 + 30;
                  const scaleY = (lat: number) => 280 - ((lat - minLat) / (maxLat - minLat)) * 250;

                  return calculatedResults.sorted.map((item) => {
                    const cx = scaleX(item.incident.lng);
                    const cy = scaleY(item.incident.lat);
                    const color =
                      item.classification === 'Critical'
                        ? '#ef4444'
                        : item.classification === 'High'
                        ? '#f97316'
                        : item.classification === 'Medium'
                        ? '#eab308'
                        : '#10b981';

                    const isSelected = item.incident.id === selectedIncidentId;

                    return (
                      <g key={item.incident.id} className="cursor-pointer" onClick={() => setSelectedIncidentId(item.incident.id)}>
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isSelected ? "20" : "14"}
                          fill={color}
                          fillOpacity="0.3"
                          stroke={color}
                          strokeWidth={isSelected ? "3" : "1.5"}
                          className="transition-all"
                        />
                        <circle cx={cx} cy={cy} r="6" fill={color} />
                        <text x={cx} y={cy - 18} fill="#ffffff" fontSize="10" fontWeight="extrabold" textAnchor="middle">
                          {item.incident.id} (PS: {item.priorityScore})
                        </text>
                      </g>
                    );
                  });
                })()}
              </svg>
            </div>
          </div>

          {/* Bar Chart & Radar Chart Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Priority Score Bar Chart */}
            <div className="bg-[#14141a] p-4 rounded-2xl border border-[#262630] space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase">امتیاز اولویت تریاژ (Priority Score PS)</h4>
              <div className="h-52 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={calculatedResults.sorted}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262635" />
                    <XAxis dataKey="incident.id" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                    <Bar dataKey="priorityScore" fill="#f59e0b" radius={[4, 4, 0, 0]} name="امتیاز اولویت" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar Chart for Selected Incident */}
            <div className="bg-[#14141a] p-4 rounded-2xl border border-[#262630] space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase">
                نمودار راداری ابعاد خطر ({selectedItem?.incident.id})
              </h4>
              <div className="h-52 w-full text-xs flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="criterion" stroke="#cbd5e1" fontSize={10} />
                    <PolarRadiusAxis domain={[0, 100]} stroke="#64748b" fontSize={8} />
                    <Radar name={selectedItem?.incident.id} dataKey="score" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Triage Matrix Table */}
      <div className="bg-[#14141a] p-5 rounded-2xl border border-[#262630] space-y-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span>جدول رتبه‌بندی اولویت تخصیص منابع (Resource Triage Ranking Table)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-[#1e1e28] text-slate-300 font-bold border-b border-[#2a2a3a]">
                <th className="p-2.5">رتبه</th>
                <th className="p-2.5">شناسه</th>
                <th className="p-2.5">عنوان حادثه</th>
                <th className="p-2.5">امتیاز اولویت (PS)</th>
                <th className="p-2.5">تغییر سناریو</th>
                <th className="p-2.5">سطح تریاژ</th>
                <th className="p-2.5">مصدومان</th>
                <th className="p-2.5">زمان انتظار</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222230]">
              {calculatedResults.sorted.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#1a1a24] transition cursor-pointer" onClick={() => setSelectedIncidentId(item.incident.id)}>
                  <td className="p-2.5 font-mono font-bold text-amber-400">#{idx + 1}</td>
                  <td className="p-2.5 font-mono text-slate-300">{item.incident.id}</td>
                  <td className="p-2.5 font-bold text-white">{isRtl ? item.incident.titleFa : item.incident.titleEn}</td>
                  <td className="p-2.5 font-mono font-black text-amber-400 text-sm">{item.priorityScore}</td>
                  <td className="p-2.5 font-mono text-xs">
                    <span className={item.deltaPct >= 0 ? 'text-red-400' : 'text-emerald-400'}>
                      {item.deltaPct >= 0 ? `+${item.deltaPct}%` : `${item.deltaPct}%`}
                    </span>
                  </td>
                  <td className="p-2.5 font-bold">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] ${
                        item.classification === 'Critical'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : item.classification === 'High'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {item.classification}
                    </span>
                  </td>
                  <td className="p-2.5 font-mono text-slate-300">{item.adjVictims} نفر</td>
                  <td className="p-2.5 font-mono text-slate-300">{item.adjWaitTime} ساعت</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
