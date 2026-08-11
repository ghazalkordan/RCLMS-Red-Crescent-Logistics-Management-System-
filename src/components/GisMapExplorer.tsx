import React, { useState } from 'react';
import {
  RoadNode,
  RoadEdge,
  TransportVehicle,
  HelicopterAircraft,
  Language,
} from '../types';
import { getTranslation } from '../locales/i18n';
import { Layers, RotateCw, MapPin, Plane, Radar, FileText, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { generatePdfReport } from '../lib/pdfGenerator';

interface GisMapExplorerProps {
  language: Language;
  nodes: RoadNode[];
  edges: RoadEdge[];
  trucks: TransportVehicle[];
  helicopters: HelicopterAircraft[];
  onToggleEdgeStatus: (edgeId: string) => void;
  onToggleWeatherGating: (heliId: string) => void;
  onRunOptimization: () => void;
}

export const GisMapExplorer: React.FC<GisMapExplorerProps> = ({
  language,
  nodes,
  edges,
  trucks,
  helicopters,
  onToggleEdgeStatus,
  onToggleWeatherGating,
  onRunOptimization,
}) => {
  const isRtl = language === 'fa' || language === 'ar';
  const [selectedNode, setSelectedNode] = useState<RoadNode | null>(null);

  // Layer Visibility Toggles
  const [showWarehouses, setShowWarehouses] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showAreas, setShowAreas] = useState(true);
  const [showAirCorridors, setShowAirCorridors] = useState(true);

  // Map lat/lng coordinates onto the 800x600 Radar Screen centered dynamically
  function getRadarCoords(lat: number, lng: number) {
    const centerSvgX = 400;
    const centerSvgY = 300;
    const maxRadius = 230; // Max radius inside the 280px radar circle

    let minLat = 90,
      maxLat = -90,
      minLng = 180,
      maxLng = -180;

    if (nodes && nodes.length > 0) {
      nodes.forEach((n) => {
        if (n.lat < minLat) minLat = n.lat;
        if (n.lat > maxLat) maxLat = n.lat;
        if (n.lng < minLng) minLng = n.lng;
        if (n.lng > maxLng) maxLng = n.lng;
      });
    } else {
      minLat = 33.5;
      maxLat = 35.5;
      minLng = 45.0;
      maxLng = 49.0;
    }

    const midLat = (minLat + maxLat) / 2;
    const midLng = (minLng + maxLng) / 2;

    const spanLat = Math.max((maxLat - minLat) / 2, 0.4);
    const spanLng = Math.max((maxLng - minLng) / 2, 0.4);
    const maxSpan = Math.max(spanLat, spanLng);

    const dx = ((lng - midLng) / maxSpan) * maxRadius * 0.75;
    const dy = -((lat - midLat) / maxSpan) * maxRadius * 0.75;

    return {
      x: centerSvgX + dx,
      y: centerSvgY + dy,
    };
  }

  // Calculate distance in KM
  function calculateKmDistance(n1: RoadNode, n2: RoadNode) {
    const R = 6371;
    const dLat = ((n2.lat - n1.lat) * Math.PI) / 180;
    const dLng = ((n2.lng - n1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((n1.lat * Math.PI) / 180) *
        Math.cos((n2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  // Generate Radar PDF Report
  const handleExportRadarPdf = () => {
    const isEn = language === 'en';
    const isAr = language === 'ar';

    const edgeHeaders = isEn
      ? ['Origin', 'Destination', 'Distance (km)', 'Route Type', 'Road Status']
      : isAr
      ? ['المصدر', 'المقصد', 'المسافة (km)', 'نوع المسار', 'حالة الطريق']
      : ['مبدأ', 'مقصد', 'مسافت (km)', 'نوع مسیر', 'وضعیت جاده'];

    const edgeRows = edges.map((e) => {
      const u = nodes.find((n) => n.id === e.fromNodeId);
      const v = nodes.find((n) => n.id === e.toNodeId);
      const uName = u ? (isEn ? u.nameEn : u.nameFa) : (isEn ? 'Unknown' : isAr ? 'غیر معروف' : 'نامشخص');
      const vName = v ? (isEn ? v.nameEn : v.nameFa) : (isEn ? 'Unknown' : isAr ? 'غیر معروف' : 'نامشخص');

      return [
        uName,
        vName,
        `${e.distanceKm} km`,
        e.isAirRoute
          ? (isEn ? 'Air Corridor (Helicopter)' : isAr ? 'ممر جوي (مروحية)' : 'دالان هوایی (Helicopter)')
          : (isEn ? 'Ground Route' : isAr ? 'مسار بري' : 'مسیر زمینی'),
        e.status === 'blocked'
          ? (isEn ? 'Blocked' : isAr ? 'مسدود' : 'مسدود (Blocked)')
          : (isEn ? 'Open & Safe' : isAr ? 'مفتوح وآمن' : 'باز و ایمن'),
      ];
    });

    generatePdfReport({
      language,
      title: isEn
        ? 'Operational Logistics Radar & Disaster Routes Report'
        : isAr
        ? 'تقرير رادار اللوجستيات وإحداثيات مسارات الكوارث'
        : 'گزارش رادار عملیاتی و فواصل لجستیک مناطق بحرانی',
      subtitle: isEn
        ? `Radar Scan Time: ${new Date().toLocaleString('en-US')} - IRCS Command Center`
        : isAr
        ? `تاريخ مسح الرادار: ${new Date().toLocaleString('ar-EG')} - مقر إدارة الكوارث`
        : `تاریخ اسکن رادار: ${new Date().toLocaleString('fa-IR')} - ستاد بحران هلال احمر`,
      filename: 'radar_operations_report.pdf',
      sections: [
        {
          heading: isEn
            ? '1. Aerial & Ground Surveillance Radar Summary'
            : isAr
            ? '١. ملخص رادار المراقبة الجوية والبرية'
            : '۱. خلاصه وضعیت رادار رصد هوایی و زمینی',
          keyValues: [
            {
              label: isEn ? 'Total Radar Covered Nodes' : isAr ? 'إجمالي النقاط المغطاة بالرادار' : 'تعداد کل گره‌های تحت پوشش رادار',
              value: nodes.length,
            },
            {
              label: isEn ? 'Active Ground Routes' : isAr ? 'المسارات البرية النشطة' : 'تعداد مسیرهای زمینی فعال',
              value: edges.filter((e) => !e.isAirRoute).length,
            },
            {
              label: isEn ? 'Helicopter Air Corridors' : isAr ? 'الممرات الجوية للمروحيات' : 'تعداد دالان‌های پروازی بالگرد',
              value: edges.filter((e) => e.isAirRoute).length,
            },
            {
              label: isEn ? 'Blocked Road Axes' : isAr ? 'الطرق المسدودة' : 'محورهای دارای انسداد',
              value: edges.filter((e) => e.status === 'blocked').length,
            },
          ],
        },
        {
          heading: isEn
            ? '2. Route Distances & Road Network Table'
            : isAr
            ? '٢. جدول المسافات وحالة شبكة الطرق'
            : '۲. جدول فواصل و وضعیت راه‌های ارتباطی',
          table: { headers: edgeHeaders, rows: edgeRows },
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
            <Radar className="w-6 h-6 text-[#D6001C] animate-spin" />
            <span>رادار بزرگ عملیاتی و نقشه لجستیک امداد (Large Operations Radar)</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
            رصد زنده فواصل لجستیک، دالان‌های پرواز، و محورهای مسدود کشور روی اسکنر رادار عملیاتی هلال احمر.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportRadarPdf}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition"
          >
            <FileText className="w-4 h-4" />
            <span>گزارش PDF رادار نقشه</span>
          </button>

          <button
            onClick={onRunOptimization}
            className="bg-[#D6001C] hover:bg-red-700 text-white px-5 py-3 text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition"
          >
            <RotateCw className="w-4 h-4" />
            <span>محاسبه مجدد فواصل</span>
          </button>
        </div>
      </div>

      {/* Map Layer Toggles */}
      <div className="bg-white dark:bg-[#0c0c12] p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-bold text-[#D6001C] uppercase tracking-wider text-xs flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>لایه‌های رادار:</span>
          </span>

          <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={showWarehouses}
              onChange={(e) => setShowWarehouses(e.target.checked)}
              className="accent-[#D6001C]"
            />
            <span>انبارها</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={showShelters}
              onChange={(e) => setShowShelters(e.target.checked)}
              className="accent-[#D6001C]"
            />
            <span>پناهگاه‌ها</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={showAreas}
              onChange={(e) => setShowAreas(e.target.checked)}
              className="accent-[#D6001C]"
            />
            <span>مناطق بحرانی</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={showAirCorridors}
              onChange={(e) => setShowAirCorridors(e.target.checked)}
              className="accent-[#D6001C]"
            />
            <span>دالان هوایی بالگردها</span>
          </label>
        </div>

        <div className="text-slate-500 text-xs italic font-semibold">
          جهت تغییر وضعیت انسداد جاده، روی خط مستقیم جاده کلیک کنید.
        </div>
      </div>

      {/* Main Radar Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Large SVG Radar Scope (#16) */}
        <div className="lg:col-span-3 bg-slate-950 border-2 border-red-900/60 rounded-2xl shadow-2xl relative overflow-hidden h-[540px] flex items-center justify-center">
          <svg className="w-full h-full text-red-500" viewBox="0 0 800 600">
            {/* Radar Circular Concentric Range Rings */}
            <circle cx="400" cy="300" r="70" fill="none" stroke="#D6001C" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
            <circle cx="400" cy="300" r="140" fill="none" stroke="#D6001C" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
            <circle cx="400" cy="300" r="210" fill="none" stroke="#D6001C" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
            <circle cx="400" cy="300" r="280" fill="none" stroke="#D6001C" strokeWidth="1.5" opacity="0.6" />

            {/* Radar Crosshairs / Axes */}
            <line x1="400" y1="20" x2="400" y2="580" stroke="#D6001C" strokeWidth="1" opacity="0.4" />
            <line x1="20" y1="300" x2="780" y2="300" stroke="#D6001C" strokeWidth="1" opacity="0.4" />

            {/* Range Labels in KM */}
            <text x="405" y="225" fill="#ef4444" fontSize="10" fontWeight="bold">50 KM</text>
            <text x="405" y="155" fill="#ef4444" fontSize="10" fontWeight="bold">100 KM</text>
            <text x="405" y="85" fill="#ef4444" fontSize="10" fontWeight="bold">150 KM</text>

            {/* Rotating Sweep Beam */}
            <g transform="translate(400, 300)">
              <line x1="0" y1="0" x2="280" y2="0" stroke="#ef4444" strokeWidth="2.5" opacity="0.8">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0"
                  to="360"
                  dur="6s"
                  repeatCount="indefinite"
                />
              </line>
            </g>

            {/* Render Road & Air Edges */}
            {edges.map((edge) => {
              const uNode = nodes.find((n) => n.id === edge.fromNodeId);
              const vNode = nodes.find((n) => n.id === edge.toNodeId);
              if (!uNode || !vNode) return null;

              if (edge.isAirRoute && !showAirCorridors) return null;

              const uCoord = getRadarCoords(uNode.lat, uNode.lng);
              const vCoord = getRadarCoords(vNode.lat, vNode.lng);

              let strokeColor = '#D6001C';
              let strokeDash = 'none';

              if (edge.isAirRoute) {
                strokeColor = '#c084fc';
                strokeDash = '6,6';
              } else if (edge.status === 'blocked') {
                strokeColor = '#ef4444';
              }

              return (
                <g key={edge.id} className="cursor-pointer group" onClick={() => onToggleEdgeStatus(edge.id)}>
                  <line
                    x1={uCoord.x}
                    y1={uCoord.y}
                    x2={vCoord.x}
                    y2={vCoord.y}
                    stroke={strokeColor}
                    strokeWidth={edge.status === 'blocked' ? 4 : 2.5}
                    strokeDasharray={strokeDash}
                  />

                  {/* Distance Label in KM on Route Center */}
                  <text
                    x={(uCoord.x + vCoord.x) / 2}
                    y={(uCoord.y + vCoord.y) / 2 - 6}
                    fill="#38bdf8"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {edge.distanceKm} km
                  </text>

                  {/* Blockage Cross Marker */}
                  {edge.status === 'blocked' && !edge.isAirRoute && (
                    <g transform={`translate(${(uCoord.x + vCoord.x) / 2}, ${(uCoord.y + vCoord.y) / 2})`}>
                      <circle r="10" fill="#ef4444" />
                      <text x="0" y="3.5" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                        ✕
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Render Radar Nodes (Warehouses, Shelters, Areas) */}
            {nodes.map((node) => {
              if (node.type === 'warehouse' && !showWarehouses) return null;
              if (node.type === 'shelter' && !showShelters) return null;
              if (node.type === 'area' && !showAreas) return null;

              const coord = getRadarCoords(node.lat, node.lng);

              let fillColor = '#D6001C';
              if (node.type === 'area') fillColor = '#ef4444';
              if (node.type === 'shelter') fillColor = '#3b82f6';

              return (
                <g
                  key={node.id}
                  transform={`translate(${coord.x}, ${coord.y})`}
                  className="cursor-pointer hover:scale-125 transition"
                  onClick={() => setSelectedNode(node)}
                >
                  <circle r={node.type === 'warehouse' ? 12 : 9} fill={fillColor} stroke="#ffffff" strokeWidth="2" />
                  <text x="0" y="24" fill="#f8fafc" className="font-extrabold text-[11px]" textAnchor="middle">
                    {isRtl ? node.nameFa : node.nameEn}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Radar Overlay Legend - Bottom Left */}
          <div className="absolute bottom-4 start-4 bg-slate-900/95 border border-red-900/60 p-3.5 rounded-xl text-white text-[11px] font-mono space-y-1.5 shadow-2xl backdrop-blur-md">
            <div className="text-red-400 font-bold flex items-center gap-1.5 mb-1">
              <Radar className="w-3.5 h-3.5 animate-pulse" />
              <span>RADAR MONITOR & LEGEND</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D6001C]"></span>
              <span>انبار لجستیک هلال احمر</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span>پناهگاه اسکان اضطراری</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span>منطقه زلزله‌زده و کانون بحران</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              <span>دالان پروازی بالگرد امداد</span>
            </div>
          </div>
        </div>

        {/* Sidebar Inspector & Distance Calculation Table (#17) */}
        <div className="space-y-4">
          {selectedNode ? (
            <div className="bg-white dark:bg-[#0c0c12] p-5 border border-[#D6001C] rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#D6001C]" />
                  <span>{isRtl ? selectedNode.nameFa : selectedNode.nameEn}</span>
                </h3>
                <button onClick={() => setSelectedNode(null)} className="text-xs text-slate-400 font-bold">
                  ✕
                </button>
              </div>

              <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 font-mono">
                <p>
                  <span className="font-bold">نوع مرکز: </span>
                  <span className="text-[#D6001C] uppercase font-bold">{selectedNode.type}</span>
                </p>
                <p>
                  <span className="font-bold">موقعیت جغرافیایی: </span>
                  <span>{selectedNode.lat.toFixed(2)}N, {selectedNode.lng.toFixed(2)}E</span>
                </p>
              </div>

              <button
                onClick={onRunOptimization}
                className="w-full bg-[#D6001C] hover:bg-red-700 text-white py-2.5 text-xs font-bold rounded-xl transition"
              >
                مسیریابی به این مرکز
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#0c0c12] p-5 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-500 dark:text-slate-400 font-medium shadow-sm">
              برای مشاهده جزئیات هر مرکز، روی نقطه آن در اسکنر رادار کلیک کنید.
            </div>
          )}

          {/* Helicopter Weather Status */}
          <div className="bg-white dark:bg-[#0c0c12] p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Plane className="w-4 h-4 text-purple-600" />
              <span>وضعیت ناوگان بالگردی</span>
            </h3>

            {helicopters.map((h) => (
              <div key={h.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{h.callsign}</p>
                  <p className="text-[11px] text-slate-500">{h.model}</p>
                </div>

                <button
                  onClick={() => onToggleWeatherGating(h.id)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg transition ${
                    h.weatherGated ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                  }`}
                >
                  {h.weatherGated ? 'زمین‌گیر' : 'آماده پرواز'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Distance Analysis Matrix Table */}
      <div className="bg-white dark:bg-[#0c0c12] p-6 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4 mt-6">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#D6001C]" />
          <span>جدول تحلیل فواصل و زمان تخمینی رسیدن محموله (Logistics Distance Matrix)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <th className="p-3">مبدأ حرکت</th>
                <th className="p-3">مقصد تحویل</th>
                <th className="p-3">نوع مسیر</th>
                <th className="p-3">مسافت (کیلومتر)</th>
                <th className="p-3">زمان تخمینی (ساعت/دقیقه)</th>
                <th className="p-3">وضعیت محور</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {edges.map((e) => {
                const u = nodes.find((n) => n.id === e.fromNodeId);
                const v = nodes.find((n) => n.id === e.toNodeId);
                const travelTimeMin = e.isAirRoute
                  ? Math.round((e.distanceKm / 180) * 60)
                  : Math.round((e.distanceKm / 50) * 60);

                return (
                  <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/60">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">
                      {u ? (isRtl ? u.nameFa : u.nameEn) : 'نامشخص'}
                    </td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">
                      {v ? (isRtl ? v.nameFa : v.nameEn) : 'نامشخص'}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          e.isAirRoute
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                        }`}
                      >
                        {e.isAirRoute ? 'دالان هوایی بالگرد' : 'جاده زمینی'}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-[#D6001C]">{e.distanceKm} km</td>
                    <td className="p-3 font-mono">{travelTimeMin} دقیقه</td>
                    <td className="p-3">
                      {e.status === 'blocked' ? (
                        <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300 font-bold text-[11px] border border-red-300 dark:border-red-800">
                          مسدود (Blocked)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 font-bold text-[11px] border border-emerald-300 dark:border-emerald-800">
                          باز و ایمن
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
