import React, { useState, useMemo } from 'react';
import { Language } from '../types';
import { generatePdfReport } from '../lib/pdfGenerator';
import {
  Truck,
  Sliders,
  FileText,
  Clock,
  RotateCcw,
  Fuel,
  DollarSign,
  PackageCheck,
  AlertOctagon,
  MapPin,
  TrendingUp,
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

interface FleetFuelModuleProps {
  language: Language;
}

interface FleetVehicle {
  id: string;
  nameFa: string;
  nameEn: string;
  lat: number;
  lng: number;
  capacityKg: number;
  currentFuelLiters: number;
  fuelCapacityLiters: number;
  consumptionRateLPerKm: number; // e.g. 0.25 L/km
  fixedCostUsd: number;
  costPerKmUsd: number;
  status: 'Available' | 'Maintenance';
}

interface DeliveryDestination {
  id: string;
  titleFa: string;
  titleEn: string;
  lat: number;
  lng: number;
  demandKg: number;
  priority: 'High' | 'Medium' | 'Low';
  itemType: 'Ration Packs' | 'Tents' | 'Water' | 'Medical Kits';
  roadDifficulty: number; // 0.0 = Normal, 0.3 = Damaged, 0.7 = Severe
}

export const FleetFuelModule: React.FC<FleetFuelModuleProps> = ({ language }) => {
  const isRtl = language === 'fa' || language === 'ar';

  // Cost & Scenario Settings
  const [fuelCostPerLiter, setFuelCostPerLiter] = useState<number>(0.85); // $0.85/L
  const [shortagePenaltyPerKg, setShortagePenaltyPerKg] = useState<number>(15.0); // $15/kg shortage penalty
  const [activeScenario, setActiveScenario] = useState<'Normal' | 'Damaged' | 'SevereDamage' | 'HighDemand' | 'LowFuel'>('Normal');

  // Vehicles Dataset
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([
    { id: 'V01', nameFa: 'کامیون سنگین ده-چرخ ۱', nameEn: 'Heavy Truck V01', lat: 34.3276, lng: 47.0778, capacityKg: 10000, currentFuelLiters: 180, fuelCapacityLiters: 200, consumptionRateLPerKm: 0.28, fixedCostUsd: 120, costPerKmUsd: 0.45, status: 'Available' },
    { id: 'V02', nameFa: 'کامیون بنز خاور ۲', nameEn: 'Medium Truck V02', lat: 34.1094, lng: 46.5273, capacityKg: 5000, currentFuelLiters: 110, fuelCapacityLiters: 120, consumptionRateLPerKm: 0.18, fixedCostUsd: 80, costPerKmUsd: 0.30, status: 'Available' },
    { id: 'V03', nameFa: 'وانت نیسان دوکابین ۳', nameEn: 'Light Van V03', lat: 34.4611, lng: 45.8627, capacityKg: 2000, currentFuelLiters: 60, fuelCapacityLiters: 70, consumptionRateLPerKm: 0.12, fixedCostUsd: 45, costPerKmUsd: 0.20, status: 'Available' },
  ]);

  // Destinations Dataset
  const [destinations, setDestinations] = useState<DeliveryDestination[]>([
    { id: 'D01', titleFa: 'کمپ اسکان اضطراری سرپل ذهاب', titleEn: 'Sarpol Shelter Camp D01', lat: 34.4680, lng: 45.8650, demandKg: 6500, priority: 'High', itemType: 'Tents', roadDifficulty: 0.3 },
    { id: 'D02', titleFa: 'انبار هلال احمر اسلام‌آباد غرب', titleEn: 'Eslamabad Relief Hub D02', lat: 34.1120, lng: 46.5300, demandKg: 4000, priority: 'High', itemType: 'Ration Packs', roadDifficulty: 0.1 },
    { id: 'D03', titleFa: 'پایگاه درمانگاهی قصرشیرین', titleEn: 'Qasr Medical Post D03', lat: 34.5161, lng: 45.5786, demandKg: 2500, priority: 'Medium', itemType: 'Medical Kits', roadDifficulty: 0.4 },
    { id: 'D04', titleFa: 'روستاهای کوهستانی پاوه', titleEn: 'Paveh Mountain Villages D04', lat: 35.0434, lng: 46.3562, demandKg: 3000, priority: 'Medium', itemType: 'Water', roadDifficulty: 0.6 },
  ]);

  const handleReset = () => {
    setFuelCostPerLiter(0.85);
    setShortagePenaltyPerKg(15.0);
    setActiveScenario('Normal');
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

  // VRP Optimization Solver
  const optimizationResults = useMemo(() => {
    // Scenario multipliers
    let roadMult = 1.0;
    let demandMult = 1.0;
    let fuelAvailMult = 1.0;

    if (activeScenario === 'Damaged') roadMult = 1.35;
    else if (activeScenario === 'SevereDamage') roadMult = 1.8;
    else if (activeScenario === 'HighDemand') demandMult = 1.5;
    else if (activeScenario === 'LowFuel') fuelAvailMult = 0.6;

    const routes: Array<{
      vehicle: FleetVehicle;
      destination: DeliveryDestination;
      distanceKm: number;
      fuelBurnLiters: number;
      fuelCost: number;
      distanceCost: number;
      fixedCost: number;
      deliveredKg: number;
      shortageKg: number;
      totalCost: number;
    }> = [];

    const availableVehicles = vehicles.filter((v) => v.status === 'Available');
    const assignedVehiclesSet = new Set<string>();

    destinations.forEach((dest) => {
      const effectiveDemand = Math.round(dest.demandKg * demandMult);
      let remainingDemand = effectiveDemand;

      // Find best available vehicle
      availableVehicles.forEach((veh) => {
        if (remainingDemand <= 0) return;
        if (assignedVehiclesSet.has(veh.id)) return;

        const distKm = calcHaversine(veh.lat, veh.lng, dest.lat, dest.lng);
        const effRoadDifficulty = dest.roadDifficulty * roadMult;
        const fuelBurn = distKm * veh.consumptionRateLPerKm * (1 + effRoadDifficulty);

        const effFuelAvailable = veh.currentFuelLiters * fuelAvailMult;

        // Check fuel feasibility constraint
        if (fuelBurn > effFuelAvailable) {
          return; // Infeasible due to fuel capacity
        }

        const delivered = Math.min(remainingDemand, veh.capacityKg);
        remainingDemand -= delivered;

        const fCost = fuelBurn * fuelCostPerLiter;
        const dCost = distKm * veh.costPerKmUsd;
        const fxCost = veh.fixedCostUsd;
        const sPenalty = remainingDemand * shortagePenaltyPerKg;

        const totalCost = fCost + dCost + fxCost + sPenalty;

        assignedVehiclesSet.add(veh.id);

        routes.push({
          vehicle: veh,
          destination: dest,
          distanceKm: Math.round(distKm * 10) / 10,
          fuelBurnLiters: Math.round(fuelBurn * 10) / 10,
          fuelCost: Math.round(fCost),
          distanceCost: Math.round(dCost),
          fixedCost: fxCost,
          deliveredKg: Math.round(delivered),
          shortageKg: Math.round(remainingDemand),
          totalCost: Math.round(totalCost),
        });
      });
    });

    // Aggregated Metrics
    const totalDist = routes.reduce((acc, r) => acc + r.distanceKm, 0);
    const totalFuelLiters = routes.reduce((acc, r) => acc + r.fuelBurnLiters, 0);
    const totalFuelCost = routes.reduce((acc, r) => acc + r.fuelCost, 0);
    const totalDistCost = routes.reduce((acc, r) => acc + r.distanceCost, 0);
    const totalFixedCost = routes.reduce((acc, r) => acc + r.fixedCost, 0);
    const totalDelivered = routes.reduce((acc, r) => acc + r.deliveredKg, 0);
    const totalShortage = routes.reduce((acc, r) => acc + r.shortageKg, 0);
    const totalOperationalCost = totalFuelCost + totalDistCost + totalFixedCost + totalShortage * shortagePenaltyPerKg;

    const totalDemandRequested = destinations.reduce((acc, d) => acc + Math.round(d.demandKg * demandMult), 0);
    const fulfillmentPct = Math.round((totalDelivered / Math.max(1, totalDemandRequested)) * 100);

    return {
      routes,
      totalDist: Math.round(totalDist * 10) / 10,
      totalFuelLiters: Math.round(totalFuelLiters * 10) / 10,
      totalFuelCost: Math.round(totalFuelCost),
      totalDistCost: Math.round(totalDistCost),
      totalFixedCost,
      totalOperationalCost: Math.round(totalOperationalCost),
      totalDelivered,
      totalShortage,
      fulfillmentPct,
      activeVehiclesCount: assignedVehiclesSet.size,
    };
  }, [vehicles, destinations, fuelCostPerLiter, shortagePenaltyPerKg, activeScenario]);

  // Operational Explanation Narrative
  const operationalNarrative = useMemo(() => {
    if (optimizationResults.routes.length === 0) return '';
    const r1 = optimizationResults.routes[0];
    if (language === 'fa') {
      return `خودروی ${r1.vehicle.nameFa} جهت اعزام به مقصد "${r1.destination.titleFa}" انتخاب گردید. مسیر سوخت‌رسانی متناظر دارای مسافت ${r1.distanceKm} کیلومتر و مصرف ${r1.fuelBurnLiters} لیتر سوخت است. نرخ برآورد برآورده‌سازی تقاضای کل ${optimizationResults.fulfillmentPct}٪ می‌باشد.`;
    } else {
      return `Vehicle ${r1.vehicle.nameEn} was assigned to destination "${r1.destination.titleEn}". Optimal route spans ${r1.distanceKm} km with ${r1.fuelBurnLiters} L fuel burn. Overall demand fulfillment rate is ${optimizationResults.fulfillmentPct}%.`;
    }
  }, [optimizationResults, language]);

  // PDF Export
  const handleExportPdf = () => {
    const isEn = language === 'en';
    const isAr = language === 'ar';

    const headers = isEn
      ? ['Vehicle', 'Destination', 'Distance (km)', 'Fuel Burn (L)', 'Delivered (kg)', 'Shortage (kg)', 'Total Cost ($)']
      : isAr
      ? ['المركبة', 'الوجهة', 'المسافة (کم)', 'استهلاك الوقود', 'الكمية المسلمة', 'النقص', 'التكلفة الإجمالية']
      : ['ناوگان/خودرو', 'مقصد تحویل', 'مسافت (کیلومتر)', 'مصرف سوخت (لیتر)', 'محموله تحویلی (کیلو)', 'کمبود (کیلو)', 'هزینه کل ($)'];

    const rows = optimizationResults.routes.map((r) => [
      isEn ? r.vehicle.nameEn : r.vehicle.nameFa,
      isEn ? r.destination.titleEn : r.destination.titleFa,
      `${r.distanceKm} km`,
      `${r.fuelBurnLiters} L`,
      `${r.deliveredKg} kg`,
      `${r.shortageKg} kg`,
      `$${r.totalCost}`,
    ]);

    generatePdfReport({
      language,
      title: isEn
        ? 'Fleet Fuel & Route Cost Optimization Report'
        : isAr
        ? 'تقرير تحسين استهلاك الوقود وتكاليف الأسطول'
        : 'گزارش بهینه‌سازی مسیر و مصرف سوخت ناوگان ترابری هلال احمر',
      subtitle: isEn
        ? `Total Cost: $${optimizationResults.totalOperationalCost} | Fuel Burned: ${optimizationResults.totalFuelLiters} L | Fulfillment: ${optimizationResults.fulfillmentPct}%`
        : isAr
        ? `التكلفة الإجمالية: $${optimizationResults.totalOperationalCost} | الوقود المستهلك: ${optimizationResults.totalFuelLiters} L`
        : `هزینه کل عملیات: $${optimizationResults.totalOperationalCost} | سوخت مصرفی: ${optimizationResults.totalFuelLiters} لیتر | درصد پوشش: ${optimizationResults.fulfillmentPct}٪`,
      filename: 'fleet_fuel_optimization_report.pdf',
      sections: [
        {
          heading: isEn ? '1. VRP Logistics KPIs' : '۱. شاخص‌های کلیدی مدیریت ناوگان ترابری (VRP KPIs)',
          keyValues: [
            { label: 'Total Operational Cost', value: `$${optimizationResults.totalOperationalCost}` },
            { label: 'Total Fuel Consumed', value: `${optimizationResults.totalFuelLiters} L` },
            { label: 'Total Distance Covered', value: `${optimizationResults.totalDist} km` },
            { label: 'Demand Fulfillment Rate', value: `${optimizationResults.fulfillmentPct}%` },
            { label: 'Active Fleet Deployed', value: optimizationResults.activeVehiclesCount },
          ],
        },
        {
          heading: isEn ? '2. Optimized Dispatch Routes Table' : '۲. ماتریس مسیرهای بهینه ترابری و سوخت',
          table: { headers, rows },
        },
        {
          heading: isEn ? '3. Operational Logistics Recommendation' : '۳. دستورالعمل و تحلیل بهینه‌سازی مسیرهای ترابری',
          text: operationalNarrative,
        },
      ],
    });
  };

  const costBreakdownData = useMemo(() => {
    return [
      { name: isRtl ? 'هزینه سوخت' : 'Fuel Cost', value: optimizationResults.totalFuelCost, color: '#f59e0b' },
      { name: isRtl ? 'هزینه پیمایش' : 'Distance Cost', value: optimizationResults.totalDistCost, color: '#3b82f6' },
      { name: isRtl ? 'هزینه ثابت' : 'Fixed Cost', value: optimizationResults.totalFixedCost, color: '#10b981' },
    ];
  }, [optimizationResults, isRtl]);

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="bg-[#14141a] p-6 rounded-2xl border border-[#262630] shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#D6001C]/20 border border-[#D6001C]/80 text-[#D6001C] rounded-xl shadow-inner">
            <Fuel className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>
                {language === 'fa'
                  ? 'ماژول ۴: بهینه‌سازی مصرف سوخت و هزینه مسیریابی ناوگان (Fleet Fuel & Route Optimization)'
                  : language === 'ar'
                  ? 'الوحدة ٤: تحسين استهلاك الوقود وتكاليف المسارات'
                  : 'Module 4: Fleet Fuel & Route Cost Optimization'}
              </span>
              <span className="bg-[#D6001C]/30 text-[#D6001C] text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border border-[#D6001C]/60 uppercase">
                VRP Solver
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'fa'
                ? 'مدل‌سازی مسیریابی وسایل نقلیه (VRP) با در نظر گرفتن ظرفیت سوخت، بارگیری و جریمه کمبود'
                : 'Vehicle Routing Problem solver matching cargo demand, tank capacity, and road difficulty'}
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
            <span>{language === 'fa' ? 'گزارش PDF ترابری' : 'Generate PDF Report'}</span>
          </button>
        </div>
      </div>

      {/* Grid Inputs vs Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel: Inputs & Scenario Controls */}
        <div className="lg:col-span-4 bg-[#14141a] p-5 rounded-2xl border border-[#262630] space-y-5">
          <div className="flex items-center justify-between border-b border-[#262630] pb-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#D6001C]" />
              <span>پارامترهای سوخت و سناریوها</span>
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="bg-[#1a1a22] p-3 rounded-xl border border-[#2a2a38] space-y-1.5">
              <div className="flex justify-between font-bold text-slate-300">
                <span>قیمت هر لیتر سوخت (Gasoline/Diesel):</span>
                <span className="font-mono text-emerald-400">${fuelCostPerLiter}/L</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.05"
                value={fuelCostPerLiter}
                onChange={(e) => setFuelCostPerLiter(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div className="bg-[#1a1a22] p-3 rounded-xl border border-[#2a2a38] space-y-1.5">
              <div className="flex justify-between font-bold text-slate-300">
                <span>جریمه کمبود محموله ($/kg Shortage):</span>
                <span className="font-mono text-amber-400">${shortagePenaltyPerKg}/kg</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={shortagePenaltyPerKg}
                onChange={(e) => setShortagePenaltyPerKg(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Scenario Buttons */}
            <div className="space-y-2">
              <label className="font-bold text-slate-300 block">انتخاب سناریوی ترابری (What-If):</label>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <button
                  onClick={() => setActiveScenario('Normal')}
                  className={`p-2 rounded-lg font-bold border cursor-pointer transition ${
                    activeScenario === 'Normal' ? 'bg-[#D6001C] text-white border-[#D6001C]' : 'bg-[#1a1a22] text-slate-300 border-[#2a2a38]'
                  }`}
                >
                  راه‌های عادی
                </button>
                <button
                  onClick={() => setActiveScenario('Damaged')}
                  className={`p-2 rounded-lg font-bold border cursor-pointer transition ${
                    activeScenario === 'Damaged' ? 'bg-[#D6001C] text-white border-[#D6001C]' : 'bg-[#1a1a22] text-slate-300 border-[#2a2a38]'
                  }`}
                >
                  معابر آسیب‌دیده
                </button>
                <button
                  onClick={() => setActiveScenario('HighDemand')}
                  className={`p-2 rounded-lg font-bold border cursor-pointer transition ${
                    activeScenario === 'HighDemand' ? 'bg-[#D6001C] text-white border-[#D6001C]' : 'bg-[#1a1a22] text-slate-300 border-[#2a2a38]'
                  }`}
                >
                  تقاضای بالا (+50%)
                </button>
                <button
                  onClick={() => setActiveScenario('LowFuel')}
                  className={`p-2 rounded-lg font-bold border cursor-pointer transition ${
                    activeScenario === 'LowFuel' ? 'bg-[#D6001C] text-white border-[#D6001C]' : 'bg-[#1a1a22] text-slate-300 border-[#2a2a38]'
                  }`}
                >
                  محدودیت سوخت
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: KPIs & Map */}
        <div className="lg:col-span-8 space-y-5">
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#14141a] p-3.5 rounded-xl border border-[#262630]">
              <p className="text-[10px] font-bold text-slate-400 uppercase">هزینه کل عملیات ترابری</p>
              <h3 className="text-xl font-black text-amber-400 mt-1 font-mono">${optimizationResults.totalOperationalCost}</h3>
            </div>
            <div className="bg-[#14141a] p-3.5 rounded-xl border border-[#262630]">
              <p className="text-[10px] font-bold text-slate-400 uppercase">کل سوخت مصرفی</p>
              <h3 className="text-xl font-black text-[#D6001C] mt-1 font-mono">{optimizationResults.totalFuelLiters} لیتر</h3>
            </div>
            <div className="bg-[#14141a] p-3.5 rounded-xl border border-[#262630]">
              <p className="text-[10px] font-bold text-slate-400 uppercase">پوشش تقاضای اقلام</p>
              <h3 className="text-xl font-black text-emerald-400 mt-1 font-mono">{optimizationResults.fulfillmentPct}%</h3>
            </div>
            <div className="bg-[#14141a] p-3.5 rounded-xl border border-[#262630]">
              <p className="text-[10px] font-bold text-slate-400 uppercase">مسافت کل پیمایش</p>
              <h3 className="text-xl font-black text-blue-400 mt-1 font-mono">{optimizationResults.totalDist} km</h3>
            </div>
          </div>

          {/* Interactive Map */}
          <div className="bg-[#14141a] p-4 rounded-2xl border border-[#262630] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D6001C]" />
                <span>نقشه مسیریابی و تحویل اقلام امدادی (Logistics Delivery Map)</span>
              </h3>
            </div>

            <div className="relative w-full h-72 bg-[#09090d] border border-[#222230] rounded-xl overflow-hidden p-2">
              <svg className="w-full h-full" viewBox="0 0 600 300">
                <defs>
                  <pattern id="grid-m4" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#222232" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-m4)" />

                {(() => {
                  const minLat = 34.0, maxLat = 35.2;
                  const minLng = 45.5, maxLng = 47.3;
                  const scaleX = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * 540 + 30;
                  const scaleY = (lat: number) => 280 - ((lat - minLat) / (maxLat - minLat)) * 250;

                  return (
                    <>
                      {/* Routes */}
                      {optimizationResults.routes.map((r, idx) => {
                        const x1 = scaleX(r.vehicle.lng);
                        const y1 = scaleY(r.vehicle.lat);
                        const x2 = scaleX(r.destination.lng);
                        const y2 = scaleY(r.destination.lat);

                        return (
                          <line
                            key={idx}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="#10b981"
                            strokeWidth="2.5"
                            strokeDasharray="5,5"
                          />
                        );
                      })}

                      {/* Vehicles */}
                      {vehicles.map((v) => {
                        const cx = scaleX(v.lng);
                        const cy = scaleY(v.lat);
                        return (
                          <g key={v.id}>
                            <rect x={cx - 10} y={cy - 10} width="20" height="20" rx="4" fill="#2563eb" stroke="#60a5fa" strokeWidth="2" />
                            <text x={cx} y={cy + 4} fill="#ffffff" fontSize="10" fontWeight="extrabold" textAnchor="middle">
                              V
                            </text>
                          </g>
                        );
                      })}

                      {/* Destinations */}
                      {destinations.map((d) => {
                        const cx = scaleX(d.lng);
                        const cy = scaleY(d.lat);
                        return (
                          <g key={d.id}>
                            <circle cx={cx} cy={cy} r="10" fill="#dc2626" stroke="#fca5a5" strokeWidth="2" />
                            <text x={cx} y={cy - 14} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                              {d.id}
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

      {/* Cost Breakdown Donut Chart & Table */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 bg-[#14141a] p-5 rounded-2xl border border-[#262630] space-y-3">
          <h4 className="text-xs font-bold text-slate-200 uppercase">تفکیک ساختار هزینه ترابری</h4>
          <div className="h-48 w-full text-xs flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={costBreakdownData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={5}>
                  {costBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="md:col-span-8 bg-[#14141a] p-5 rounded-2xl border border-[#262630] space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#D6001C]" />
            <span>جدول برنامه‌ریزی بهینه مسیرها و مصرف سوخت (Fleet Fuel Dispatch Table)</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-[#1e1e28] text-slate-300 font-bold border-b border-[#2a2a3a]">
                  <th className="p-2.5">خودرو</th>
                  <th className="p-2.5">مقصد تحویل</th>
                  <th className="p-2.5">مسافت (km)</th>
                  <th className="p-2.5">مصرف سوخت (L)</th>
                  <th className="p-2.5">تحویلی (kg)</th>
                  <th className="p-2.5">کمبود (kg)</th>
                  <th className="p-2.5">هزینه کل ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222230]">
                {optimizationResults.routes.map((r, idx) => (
                  <tr key={idx} className="hover:bg-[#1a1a24] transition">
                    <td className="p-2.5 font-bold text-white">{isRtl ? r.vehicle.nameFa : r.vehicle.nameEn}</td>
                    <td className="p-2.5 font-bold text-slate-300">{isRtl ? r.destination.titleFa : r.destination.titleEn}</td>
                    <td className="p-2.5 font-mono text-slate-300">{r.distanceKm} km</td>
                    <td className="p-2.5 font-mono font-bold text-[#D6001C]">{r.fuelBurnLiters} L</td>
                    <td className="p-2.5 font-mono text-emerald-400">{r.deliveredKg} kg</td>
                    <td className="p-2.5 font-mono text-amber-400">{r.shortageKg} kg</td>
                    <td className="p-2.5 font-mono font-bold text-amber-300">${r.totalCost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
