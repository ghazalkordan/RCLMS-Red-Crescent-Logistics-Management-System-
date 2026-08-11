import React, { useState } from 'react';
import {
  ShelterCandidate,
  TransportVehicle,
  HelicopterAircraft,
  Language,
} from '../types';
import { getTranslation } from '../locales/i18n';
import { Building, Truck, Plane, Search, ShieldCheck, AlertTriangle } from 'lucide-react';

interface ShelterFleetManagerProps {
  language: Language;
  shelters: ShelterCandidate[];
  trucks: TransportVehicle[];
  helicopters: HelicopterAircraft[];
  onToggleShelterActivation: (shelterId: string) => void;
  onToggleWeatherGating: (heliId: string) => void;
}

export const ShelterFleetManager: React.FC<ShelterFleetManagerProps> = ({
  language,
  shelters,
  trucks,
  helicopters,
  onToggleShelterActivation,
  onToggleWeatherGating,
}) => {
  const isRtl = language === 'fa' || language === 'ar';
  const [searchQuery, setSearchQuery] = useState('');

  // Filter lists based on search query
  const filteredShelters = shelters.filter(
    (s) =>
      s.nameFa.includes(searchQuery) ||
      s.nameEn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTrucks = trucks.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.plateNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHelis = helicopters.filter(
    (h) =>
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.callsign.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header with Search Bar (#19) */}
      <div className="bg-white dark:bg-[#0c0c12] p-6 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
              <Building className="w-5 h-5 text-[#D6001C]" />
              <span>{getTranslation(language, 'nav_sheltersFleet')}</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
              مدیریت مراکز اسکان موقت، ناوگان کامیون‌های زمینی و یگان هوابرد بالگردی با المان‌های بصری.
            </p>
          </div>

          {/* Search Input Bar (#19) */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute start-3 top-3" />
            <input
              type="text"
              placeholder="جستجوی مرکز، کامیون، بالگرد یا پلاک..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl ps-9 pe-4 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-[#D6001C]"
            />
          </div>
        </div>
      </div>

      {/* 3 Columns Layout (#11) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Shelters */}
        <div className="bg-white dark:bg-[#0c0c12] p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Building className="w-4 h-4 text-[#D6001C]" />
            <span>پناهگاه‌ها و اسکان اضطراری</span>
          </h3>

          <div className="space-y-3">
            {filteredShelters.map((s) => (
              <div key={s.id} className="p-3.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{s.nameFa}</h4>
                  <button
                    onClick={() => onToggleShelterActivation(s.id)}
                    className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-md transition ${
                      s.isActivated ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {s.isActivated ? 'فعال' : 'غیرفعال'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-mono">
                  <div>
                    <span className="font-bold">ظرفیت: </span>
                    <span className="text-[#D6001C] font-extrabold">{s.capacityPeople.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="font-bold">ریسک سیل: </span>
                    <span className={s.floodRiskScore > 3 ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}>
                      {s.floodRiskScore}/10
                    </span>
                  </div>
                </div>

                {s.hasHelicopterLandingZone && (
                  <div className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-900/60 px-2 py-0.5 w-max font-bold rounded-md">
                    پد فرود بالگرد ready
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Ground Fleet */}
        <div className="bg-white dark:bg-[#0c0c12] p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Truck className="w-4 h-4 text-blue-500" />
            <span>ناوگان ترابری زمینی</span>
          </h3>

          <div className="space-y-3">
            {filteredTrucks.map((t) => (
              <div key={t.id} className="p-3.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between font-extrabold text-slate-900 dark:text-white">
                  <span>{t.name}</span>
                  <span className="font-mono text-blue-500">{t.plateNumber}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-mono text-[11px]">
                  <span>ظرفیت: {t.capacityWeightKg.toLocaleString()} kg</span>
                  <span className="font-bold text-emerald-500">{t.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Airborne Unit */}
        <div className="bg-white dark:bg-[#0c0c12] p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Plane className="w-4 h-4 text-purple-500" />
            <span>یگان هوابرد بالگردی</span>
          </h3>

          <div className="space-y-3">
            {filteredHelis.map((h) => (
              <div key={h.id} className="p-3.5 border border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between font-extrabold text-slate-900 dark:text-white">
                  <span>{h.name}</span>
                  <span className="font-mono text-purple-400">{h.callsign}</span>
                </div>

                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                  <span>حداکثر بار: {h.maxPayloadKg.toLocaleString()} kg</span>
                  <button
                    onClick={() => onToggleWeatherGating(h.id)}
                    className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md transition ${
                      h.weatherGated ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {h.weatherGated ? 'زمین‌گیر' : 'آماده پرواز'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
