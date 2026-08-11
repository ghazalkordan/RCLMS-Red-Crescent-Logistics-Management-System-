import React, { useState, useMemo } from 'react';
import { Language } from '../types';
import { generatePdfReport } from '../lib/pdfGenerator';
import {
  HeartPulse,
  Sliders,
  FileText,
  Clock,
  RotateCcw,
  Activity,
  Hospital as HospitalIcon,
  Ambulance,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Zap,
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
  CartesianGrid,
  Legend,
} from 'recharts';

interface CasualtyHospitalModuleProps {
  language: Language;
}

interface CasualtyGroup {
  id: string;
  locationNameFa: string;
  locationNameEn: string;
  lat: number;
  lng: number;
  headcount: number;
  severity: 'Immediate' | 'Urgent' | 'Delayed'; // Red, Yellow, Green
  requiredSpecialty: 'Trauma' | 'Neurosurgery' | 'Burn' | 'General';
  requiresICU: boolean;
}

interface HospitalData {
  id: string;
  nameFa: string;
  nameEn: string;
  lat: number;
  lng: number;
  totalCapacity: number;
  availableBeds: number;
  icuBeds: number;
  specialties: Array<'Trauma' | 'Neurosurgery' | 'Burn' | 'General'>;
  currentOccupancyPct: number;
}

export const CasualtyHospitalModule: React.FC<CasualtyHospitalModuleProps> = ({ language }) => {
  const isRtl = language === 'fa' || language === 'ar';

  // Parameters
  const [trafficMultiplier, setTrafficMultiplier] = useState<number>(1.2); // 1.0 to 2.0
  const [ambulanceSpeedKmH, setAmbulanceSpeedKmH] = useState<number>(60);
  const [penaltyMismatch, setPenaltyMismatch] = useState<number>(50); // Penalty for specialty mismatch
  const [penaltyOverload, setPenaltyOverload] = useState<number>(30); // Penalty for hospital overload

  // Datasets
  const [casualties, setCasualties] = useState<CasualtyGroup[]>([
    { id: 'C01', locationNameFa: 'مصدومان آوار سرپل ذهاب', locationNameEn: 'Sarpol Debris Victims', lat: 34.4611, lng: 45.8627, headcount: 14, severity: 'Immediate', requiredSpecialty: 'Trauma', requiresICU: true },
    { id: 'C02', locationNameFa: 'سوختگی انفجار گاز اسلام‌آباد', locationNameEn: 'Gas Explosion Burn Victims', lat: 34.1094, lng: 46.5273, headcount: 8, severity: 'Immediate', requiredSpecialty: 'Burn', requiresICU: true },
    { id: 'C03', locationNameFa: 'ضربه‌مغزی حادثه جوانرود', locationNameEn: 'Head Trauma Victims Javanrud', lat: 34.7961, lng: 46.4953, headcount: 5, severity: 'Immediate', requiredSpecialty: 'Neurosurgery', requiresICU: true },
    { id: 'C04', locationNameFa: 'شکستگی و جراحت عمومی کنگاور', locationNameEn: 'General Injuries Kangavar', lat: 34.5044, lng: 47.9653, headcount: 22, severity: 'Urgent', requiredSpecialty: 'General', requiresICU: false },
    { id: 'C05', locationNameFa: 'مصدومان سطحی قصرشیرین', locationNameEn: 'Minor Injuries Qasr Shirin', lat: 34.5161, lng: 45.5786, headcount: 30, severity: 'Delayed', requiredSpecialty: 'General', requiresICU: false },
  ]);

  const [hospitals, setHospitals] = useState<HospitalData[]>([
    { id: 'H01', nameFa: 'بیمارستان طالقانی کرمانشاه (تروما و سوختگی)', nameEn: 'Taleghani Trauma & Burn Hospital', lat: 34.3276, lng: 47.0778, totalCapacity: 120, availableBeds: 25, icuBeds: 6, specialties: ['Trauma', 'Burn', 'General'], currentOccupancyPct: 79 },
    { id: 'H02', nameFa: 'بیمارستان امام رضا کرمانشاه (جراحی مغز و اعصاب)', nameEn: 'Imam Reza Specialty Hospital', lat: 34.3410, lng: 47.0910, totalCapacity: 200, availableBeds: 40, icuBeds: 12, specialties: ['Neurosurgery', 'Trauma', 'General'], currentOccupancyPct: 80 },
    { id: 'H03', nameFa: 'بیمارستان شهدا سرپل ذهاب', nameEn: 'Shohada Sarpol Field Hospital', lat: 34.4550, lng: 45.8600, totalCapacity: 50, availableBeds: 10, icuBeds: 2, specialties: ['General', 'Trauma'], currentOccupancyPct: 80 },
    { id: 'H04', nameFa: 'بیمارستان حضرت امام خمینی اسلام‌آباد', nameEn: 'Imam Khomeini Eslamabad Hospital', lat: 34.1150, lng: 46.5320, totalCapacity: 80, availableBeds: 15, icuBeds: 4, specialties: ['General', 'Trauma'], currentOccupancyPct: 81 },
  ]);

  const handleReset = () => {
    setTrafficMultiplier(1.2);
    setAmbulanceSpeedKmH(60);
    setPenaltyMismatch(50);
    setPenaltyOverload(30);
  };

  const calcHaversine = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Optimization Solver
  const optimizationResults = useMemo(() => {
    // Track assigned beds per hospital
    const currentBedsUsed: Record<string, number> = {};
    const currentIcuUsed: Record<string, number> = {};
    hospitals.forEach((h) => {
      currentBedsUsed[h.id] = 0;
      currentIcuUsed[h.id] = 0;
    });

    const assignments: Array<{
      casualty: CasualtyGroup;
      hospital: HospitalData;
      distanceKm: number;
      travelTimeMin: number;
      specialtyMatched: boolean;
      icuAssigned: boolean;
      cost: number;
    }> = [];

    // Sort casualties by severity: Immediate > Urgent > Delayed
    const severityRank = { Immediate: 3, Urgent: 2, Delayed: 1 };
    const sortedCasualties = [...casualties].sort((a, b) => severityRank[b.severity] - severityRank[a.severity]);

    sortedCasualties.forEach((cas) => {
      let bestHospital: HospitalData | null = null;
      let minCost = Infinity;
      let bestDist = 0;
      let bestTime = 0;
      let bestSpecialtyMatch = false;
      let bestIcuAssigned = false;

      hospitals.forEach((hosp) => {
        const distKm = calcHaversine(cas.lat, cas.lng, hosp.lat, hosp.lng);
        const travelTime = (distKm / Math.max(10, ambulanceSpeedKmH)) * 60 * trafficMultiplier;

        // Specialty check
        const hasSpecialty = hosp.specialties.includes(cas.requiredSpecialty);
        const specPenalty = hasSpecialty ? 0 : penaltyMismatch;

        // Bed & ICU availability check
        const remBeds = hosp.availableBeds - currentBedsUsed[hosp.id];
        const remIcu = hosp.icuBeds - currentIcuUsed[hosp.id];

        let overloadPen = 0;
        if (remBeds < cas.headcount) {
          overloadPen += penaltyOverload * (cas.headcount - Math.max(0, remBeds));
        }

        let icuPen = 0;
        if (cas.requiresICU && remIcu < cas.headcount) {
          icuPen += penaltyOverload * 1.5;
        }

        // Objective Function: Z = travelTime + specPenalty + overloadPen + icuPen
        const totalCost = travelTime + specPenalty + overloadPen + icuPen;

        if (totalCost < minCost) {
          minCost = totalCost;
          bestHospital = hosp;
          bestDist = distKm;
          bestTime = travelTime;
          bestSpecialtyMatch = hasSpecialty;
          bestIcuAssigned = cas.requiresICU && remIcu >= cas.headcount;
        }
      });

      if (bestHospital) {
        currentBedsUsed[(bestHospital as HospitalData).id] += cas.headcount;
        if (cas.requiresICU) {
          currentIcuUsed[(bestHospital as HospitalData).id] += cas.headcount;
        }

        assignments.push({
          casualty: cas,
          hospital: bestHospital,
          distanceKm: Math.round(bestDist * 10) / 10,
          travelTimeMin: Math.round(bestTime * 10) / 10,
          specialtyMatched: bestSpecialtyMatch,
          icuAssigned: bestIcuAssigned,
          cost: Math.round(minCost * 10) / 10,
        });
      }
    });

    const totalPatients = casualties.reduce((acc, c) => acc + c.headcount, 0);
    const avgTransportTime = assignments.length > 0 ? assignments.reduce((acc, a) => acc + a.travelTimeMin, 0) / assignments.length : 0;
    const maxTransportTime = assignments.length > 0 ? Math.max(...assignments.map((a) => a.travelTimeMin)) : 0;
    const matchedCount = assignments.filter((a) => a.specialtyMatched).length;
    const specialtyMatchPct = Math.round((matchedCount / Math.max(1, assignments.length)) * 100);

    // Hospital post-allocation occupancy
    const hospitalPostStats = hospitals.map((h) => {
      const added = currentBedsUsed[h.id] || 0;
      const totalUsedBeds = h.totalCapacity - h.availableBeds + added;
      const postOccPct = Math.min(100, Math.round((totalUsedBeds / h.totalCapacity) * 100));
      return {
        ...h,
        addedPatients: added,
        postOccPct,
        isOverloaded: postOccPct > 95,
      };
    });

    const overloadedCount = hospitalPostStats.filter((h) => h.isOverloaded).length;

    return {
      assignments,
      totalPatients,
      avgTransportTime: Math.round(avgTransportTime * 10) / 10,
      maxTransportTime: Math.round(maxTransportTime * 10) / 10,
      specialtyMatchPct,
      hospitalPostStats,
      overloadedCount,
    };
  }, [casualties, hospitals, ambulanceSpeedKmH, trafficMultiplier, penaltyMismatch, penaltyOverload]);

  // Operational Explanation Narrative
  const operationalNarrative = useMemo(() => {
    if (optimizationResults.assignments.length === 0) return '';
    const first = optimizationResults.assignments[0];
    if (language === 'fa') {
      return `مصدومان گروه "${first.casualty.locationNameFa}" (${first.casualty.headcount} نفر با حالت ${first.casualty.severity}) به بیمارستان "${first.hospital.nameFa}" تخصیص داده شدند تا با زمان انتقال ${first.travelTimeMin} دقیقه و دارا بودن تخصص ${first.casualty.requiredSpecialty}، درمان فوری دریافت نمایند.`;
    } else {
      return `Patients from "${first.casualty.locationNameEn}" (${first.casualty.headcount} ${first.casualty.severity}) were routed to "${first.hospital.nameEn}" with ETA ${first.travelTimeMin} min, matching specialty '${first.casualty.requiredSpecialty}'.`;
    }
  }, [optimizationResults, language]);

  // Export PDF
  const handleExportPdf = () => {
    const isEn = language === 'en';
    const isAr = language === 'ar';

    const headers = isEn
      ? ['Casualty Group', 'Count', 'Severity', 'Specialty Req.', 'Assigned Hospital', 'ETA (min)', 'Match']
      : isAr
      ? ['مجموعة الضحايا', 'العدد', 'الخطورة', 'التخصص المطلوب', 'المستشفى المخصص', 'وقت الوصول', 'التوافق']
      : ['گروه مصدومان', 'تعداد', 'شدت', 'تخصص موردنیاز', 'بیمارستان مقصد', 'زمان رساندن', 'تطابق تخصص'];

    const rows = optimizationResults.assignments.map((a) => [
      isEn ? a.casualty.locationNameEn : a.casualty.locationNameFa,
      a.casualty.headcount.toString(),
      a.casualty.severity,
      a.casualty.requiredSpecialty,
      isEn ? a.hospital.nameEn : a.hospital.nameFa,
      `${a.travelTimeMin} min`,
      a.specialtyMatched ? 'Yes' : 'No',
    ]);

    generatePdfReport({
      language,
      title: isEn
        ? 'Casualty-to-Hospital Allocation Report'
        : isAr
        ? 'تقرير توزيع المصابين على المستشفيات'
        : 'گزارش بهینه‌سازی و توزیع مصدومان به بیمارستان‌ها',
      subtitle: isEn
        ? `Patients Dispatched: ${optimizationResults.totalPatients} | Avg Transport Time: ${optimizationResults.avgTransportTime} min | Specialty Match: ${optimizationResults.specialtyMatchPct}%`
        : isAr
        ? `عدد المصابين: ${optimizationResults.totalPatients} | متوسط وقت النقل: ${optimizationResults.avgTransportTime} دقيقة`
        : `تعداد مصدومان: ${optimizationResults.totalPatients} نفر | میانگین زمان انتقال: ${optimizationResults.avgTransportTime} دقیقه | تطابق تخصص: ${optimizationResults.specialtyMatchPct}٪`,
      filename: 'casualty_hospital_report.pdf',
      sections: [
        {
          heading: isEn ? '1. Dispatch KPIs' : '۱. شاخص‌های کلیدی توزیع مصدومان (KPIs)',
          keyValues: [
            { label: 'Total Patients Assigned', value: optimizationResults.totalPatients },
            { label: 'Average ETA', value: `${optimizationResults.avgTransportTime} min` },
            { label: 'Max ETA', value: `${optimizationResults.maxTransportTime} min` },
            { label: 'Specialty Match Rate', value: `${optimizationResults.specialtyMatchPct}%` },
            { label: 'Overloaded Hospitals', value: optimizationResults.overloadedCount },
          ],
        },
        {
          heading: isEn ? '2. Casualty Routing Matrix' : '۲. ماتریس مسیریابی و توزیع بیماران',
          table: { headers, rows },
        },
        {
          heading: isEn ? '3. Operational Narrative' : '۳. تحلیل عملیاتی تخصیص تخت‌های اورژانس و آی‌سی‌یو',
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
          <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-400 rounded-xl shadow-inner">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>
                {language === 'fa'
                  ? 'ماژول ۳: بهینه‌سازی تخصیص مصدومان به بیمارستان‌ها (Casualty-to-Hospital Allocation)'
                  : language === 'ar'
                  ? 'الوحدة ٣: توزيع المصابين على المستشفيات'
                  : 'Module 3: Casualty-to-Hospital Allocation Optimization'}
              </span>
              <span className="bg-rose-950/60 text-rose-400 text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border border-rose-800 uppercase">
                Triage Router
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'fa'
                ? 'کمینه‌سازی زمان انتقال آمبولانس و جلوگیری از سرریز ظرفیت تخت‌های ICU و تخصصی'
                : 'Minimizing casualty transport time & preventing hospital ICU capacity overload'}
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
            <span>{language === 'fa' ? 'گزارش PDF توزیع' : 'Generate PDF Report'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs */}
        <div className="lg:col-span-4 bg-[#14141a] p-5 rounded-2xl border border-[#262630] space-y-5">
          <div className="flex items-center justify-between border-b border-[#262630] pb-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-rose-400" />
              <span>تنظیمات ترافیک و جریمه‌ها (Routing Weights)</span>
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="bg-[#1a1a22] p-3 rounded-xl border border-[#2a2a38] space-y-1.5">
              <div className="flex justify-between font-bold text-slate-300">
                <span>سرعت متوسط آمبولانس:</span>
                <span className="font-mono text-rose-400">{ambulanceSpeedKmH} km/h</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                value={ambulanceSpeedKmH}
                onChange={(e) => setAmbulanceSpeedKmH(Number(e.target.value))}
                className="w-full accent-rose-400 cursor-pointer"
              />
            </div>

            <div className="bg-[#1a1a22] p-3 rounded-xl border border-[#2a2a38] space-y-1.5">
              <div className="flex justify-between font-bold text-slate-300">
                <span>ضریب ترافیک و آسیب معابر:</span>
                <span className="font-mono text-rose-400">{trafficMultiplier}x</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="2.0"
                step="0.1"
                value={trafficMultiplier}
                onChange={(e) => setTrafficMultiplier(Number(e.target.value))}
                className="w-full accent-rose-400 cursor-pointer"
              />
            </div>

            <div className="bg-[#1a1a22] p-3 rounded-xl border border-[#2a2a38] space-y-1.5">
              <div className="flex justify-between font-bold text-slate-300">
                <span>جریمه عدم‌تطابق تخصص (Mismatch Penalty):</span>
                <span className="font-mono text-rose-400">{penaltyMismatch}</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={penaltyMismatch}
                onChange={(e) => setPenaltyMismatch(Number(e.target.value))}
                className="w-full accent-rose-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Center / Right Column */}
        <div className="lg:col-span-8 space-y-5">
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#14141a] p-3.5 rounded-xl border border-[#262630]">
              <p className="text-[10px] font-bold text-slate-400 uppercase">کل مصدومان انتقال‌یافته</p>
              <h3 className="text-xl font-black text-rose-400 mt-1 font-mono">{optimizationResults.totalPatients} نفر</h3>
            </div>
            <div className="bg-[#14141a] p-3.5 rounded-xl border border-[#262630]">
              <p className="text-[10px] font-bold text-slate-400 uppercase">میانگین زمان رساندن (ETA)</p>
              <h3 className="text-xl font-black text-emerald-400 mt-1 font-mono">{optimizationResults.avgTransportTime} دقیقه</h3>
            </div>
            <div className="bg-[#14141a] p-3.5 rounded-xl border border-[#262630]">
              <p className="text-[10px] font-bold text-slate-400 uppercase">نرخ تطابق تخصص پزشکی</p>
              <h3 className="text-xl font-black text-blue-400 mt-1 font-mono">{optimizationResults.specialtyMatchPct}%</h3>
            </div>
            <div className="bg-[#14141a] p-3.5 rounded-xl border border-[#262630]">
              <p className="text-[10px] font-bold text-slate-400 uppercase">بیمارستان‌های در آستانه اشغال</p>
              <h3 className="text-xl font-black text-amber-400 mt-1 font-mono">{optimizationResults.overloadedCount} مرکز</h3>
            </div>
          </div>

          {/* Interactive Map */}
          <div className="bg-[#14141a] p-4 rounded-2xl border border-[#262630] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>نقشه تعاملی توزیع بیماران و ناوگان آمبولانس (Hospital Routing Map)</span>
              </h3>
            </div>

            <div className="relative w-full h-72 bg-[#09090d] border border-[#222230] rounded-xl overflow-hidden p-2">
              <svg className="w-full h-full" viewBox="0 0 600 300">
                <defs>
                  <pattern id="grid-m3" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#222232" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-m3)" />

                {(() => {
                  const minLat = 34.0, maxLat = 35.2;
                  const minLng = 45.5, maxLng = 48.1;
                  const scaleX = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * 540 + 30;
                  const scaleY = (lat: number) => 280 - ((lat - minLat) / (maxLat - minLat)) * 250;

                  return (
                    <>
                      {/* Routes */}
                      {optimizationResults.assignments.map((a, idx) => {
                        const x1 = scaleX(a.casualty.lng);
                        const y1 = scaleY(a.casualty.lat);
                        const x2 = scaleX(a.hospital.lng);
                        const y2 = scaleY(a.hospital.lat);

                        const color =
                          a.casualty.severity === 'Immediate'
                            ? '#ef4444'
                            : a.casualty.severity === 'Urgent'
                            ? '#f59e0b'
                            : '#10b981';

                        return (
                          <line
                            key={idx}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke={color}
                            strokeWidth="2"
                            strokeDasharray="4,4"
                          />
                        );
                      })}

                      {/* Hospitals */}
                      {hospitals.map((h) => {
                        const cx = scaleX(h.lng);
                        const cy = scaleY(h.lat);

                        return (
                          <g key={h.id}>
                            <rect x={cx - 10} y={cy - 10} width="20" height="20" rx="4" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
                            <text x={cx} y={cy + 4} fill="#ffffff" fontSize="10" fontWeight="extrabold" textAnchor="middle">
                              H
                            </text>
                          </g>
                        );
                      })}

                      {/* Casualties */}
                      {casualties.map((c) => {
                        const cx = scaleX(c.lng);
                        const cy = scaleY(c.lat);
                        return (
                          <g key={c.id}>
                            <circle cx={cx} cy={cy} r="8" fill="#f43f5e" stroke="#fda4af" strokeWidth="1.5" />
                            <text x={cx} y={cy - 12} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                              {c.id} ({c.headcount}p)
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

          {/* Hospital Occupancy Chart */}
          <div className="bg-[#14141a] p-4 rounded-2xl border border-[#262630] space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase">درصد اشغال ظرفیت بیمارستان‌ها پس از بهینه‌سازی</h4>
            <div className="h-48 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={optimizationResults.hospitalPostStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262635" />
                  <XAxis dataKey="id" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                  <Bar dataKey="postOccPct" fill="#f43f5e" radius={[4, 4, 0, 0]} name="اشغال پس از پذیرش (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Table */}
      <div className="bg-[#14141a] p-5 rounded-2xl border border-[#262630] space-y-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>جدول برنامه توزیع و اعزام آمبولانس‌ها (Patient Allocation Dispatch Table)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-[#1e1e28] text-slate-300 font-bold border-b border-[#2a2a3a]">
                <th className="p-2.5">گروه مصدومان</th>
                <th className="p-2.5">تعداد</th>
                <th className="p-2.5">شدت</th>
                <th className="p-2.5">تخصص موردنیاز</th>
                <th className="p-2.5">بیمارستان مقصد</th>
                <th className="p-2.5">زمان رساندن (ETA)</th>
                <th className="p-2.5">تطابق تخصص</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222230]">
              {optimizationResults.assignments.map((a, idx) => (
                <tr key={idx} className="hover:bg-[#1a1a24] transition">
                  <td className="p-2.5 font-bold text-white">{isRtl ? a.casualty.locationNameFa : a.casualty.locationNameEn}</td>
                  <td className="p-2.5 font-mono text-slate-300">{a.casualty.headcount} نفر</td>
                  <td className="p-2.5 font-bold">
                    <span
                      className={`px-2 py-0.5 rounded ${
                        a.casualty.severity === 'Immediate'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {a.casualty.severity}
                    </span>
                  </td>
                  <td className="p-2.5 font-mono text-slate-300">{a.casualty.requiredSpecialty}</td>
                  <td className="p-2.5 font-bold text-rose-400">{isRtl ? a.hospital.nameFa : a.hospital.nameEn}</td>
                  <td className="p-2.5 font-mono font-bold text-emerald-400">{a.travelTimeMin} min</td>
                  <td className="p-2.5">
                    {a.specialtyMatched ? (
                      <span className="text-emerald-400 font-bold">✓ کامل</span>
                    ) : (
                      <span className="text-amber-400 font-bold">⚠️ ارجاع ثانویه</span>
                    )}
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
