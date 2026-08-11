import React, { useState } from 'react';
import { EmergencyRequest, Language } from '../types';
import { getTranslation } from '../locales/i18n';
import {
  AlertOctagon,
  Send,
  CheckCircle2,
  Search,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

interface EmergencyIntakeProps {
  language: Language;
  emergencyRequests: EmergencyRequest[];
  onSubmitRequest: (formData: any) => Promise<any>;
}

export const EmergencyIntake: React.FC<EmergencyIntakeProps> = ({
  language,
  emergencyRequests,
  onSubmitRequest,
}) => {
  const isRtl = language === 'fa' || language === 'ar';

  // Form Fields
  const [incidentType, setIncidentType] = useState('تخریب ساختمان و گرفتاری زیر آوار');
  const [reporterName, setReporterName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [affectedCount, setAffectedCount] = useState(1);
  const [hasInjuries, setHasInjuries] = useState(false);
  const [medicalNeeds, setMedicalNeeds] = useState('');
  const [immediateDanger, setImmediateDanger] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  const [submittedTrackingId, setSubmittedTrackingId] = useState<string | null>(null);
  const [searchTrackingId, setSearchTrackingId] = useState('');
  const [searchedRequest, setSearchedRequest] = useState<EmergencyRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-existing Sample Requests (#20)
  const sampleRequests: EmergencyRequest[] = [
    {
      id: 'sample-1',
      trackingId: 'RC-REQ-98421',
      incidentType: 'تخریب ساختمان و آوار برداری',
      reporterName: 'علی رضایی',
      phone: '09123456789',
      lat: 34.32,
      lng: 47.07,
      address: 'کرمانشاه، بلوار طاق‌بستان، کوچه ۱۵',
      affectedCount: 4,
      hasInjuries: true,
      medicalNeeds: 'نیاز به آتلمانی و سرم خون',
      immediateDanger: true,
      timestamp: '۱۰ دقیقه پیش',
      status: 'dispatched',
    },
    {
      id: 'sample-2',
      trackingId: 'RC-REQ-98422',
      incidentType: 'کمبود شدید چادر و پتو',
      reporterName: 'سارا احمدی',
      phone: '09189876543',
      lat: 34.46,
      lng: 45.86,
      address: 'سرپل ذهاب، روستای قلعه شاهین',
      affectedCount: 12,
      hasInjuries: false,
      medicalNeeds: '',
      immediateDanger: false,
      timestamp: '۲۵ دقیقه پیش',
      status: 'received',
    },
    {
      id: 'sample-3',
      trackingId: 'RC-REQ-98423',
      incidentType: 'قطع جاده و محاصره در سیل',
      reporterName: 'مرتضی کرمی',
      phone: '09131112233',
      lat: 34.12,
      lng: 46.54,
      address: 'اسلام‌آباد غرب، محور حمیلان',
      affectedCount: 8,
      hasInjuries: true,
      medicalNeeds: 'انتقال هوایی بالگرد',
      immediateDanger: true,
      timestamp: '۱ ساعت پیش',
      status: 'resolved',
    },
  ];

  const handleGetLocation = () => {
    setGpsLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setGpsLocation({ lat, lng });

          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=${language === 'fa' ? 'fa' : 'en'}`
            );
            if (res.ok) {
              const data = await res.json();
              if (data && data.display_name) {
                setAddress(data.display_name);
              } else {
                setAddress(`موقعیت زنده GPS: عرض ${lat.toFixed(5)}، طول ${lng.toFixed(5)}`);
              }
            } else {
              setAddress(`موقعیت زنده GPS: عرض ${lat.toFixed(5)}، طول ${lng.toFixed(5)}`);
            }
          } catch (err) {
            setAddress(`موقعیت زنده دستگاه ثبت شد (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
          } finally {
            setGpsLoading(false);
          }
        },
        (err) => {
          setGpsLoading(false);
          alert('دسترسی به GPS برقرار نشد.');
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    } else {
      setGpsLoading(false);
      alert('مرورگر شما از قابلیّت GPS پشتیبانی نمی‌کند.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    setIsSubmitting(true);
    try {
      const res = await onSubmitRequest({
        incidentType,
        reporterName,
        phone,
        lat: gpsLocation?.lat || 34.46,
        lng: gpsLocation?.lng || 45.86,
        address: address || 'موقعیت حادثه ثبت شد',
        affectedCount,
        hasInjuries,
        medicalNeeds,
        immediateDanger,
      });

      if (res && res.request) {
        setSubmittedTrackingId(res.request.trackingId);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const allRequests = [...emergencyRequests, ...sampleRequests];

  const handleSearch = () => {
    const found = allRequests.find(
      (r) => r.trackingId.toLowerCase() === searchTrackingId.trim().toLowerCase()
    );
    setSearchedRequest(found || null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#0c0c12] p-6 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-colors">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <AlertOctagon className="w-5 h-5 text-[#D6001C]" />
          <span>{getTranslation(language, 'nav_emergencyIntake')}</span>
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
          درگاه عمومی اعلام حادثه و درخواست امداد اضطراری هلال احمر — ارزیابی هوشمند اولویت و تخصیص کد رهگیری.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form: Submit Emergency Request */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0c0c12] p-6 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-[#D6001C]" />
            <span>فرم آنلاین درخواست امداد اضطراری</span>
          </h3>

          {submittedTrackingId ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                درخواست امداد شما با موفقیت ثبت شد
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                کد رهگیری اختصاص‌یافته جهت پیگیری‌های بعدی:
              </p>
              <div className="text-2xl font-mono font-extrabold text-[#D6001C] bg-red-50 dark:bg-slate-900 border border-red-200 dark:border-red-900/50 py-3 px-6 inline-block rounded-xl">
                {submittedTrackingId}
              </div>
              <div>
                <button
                  onClick={() => setSubmittedTrackingId(null)}
                  className="mt-4 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  ثبت درخواست جدید
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#D6001C] text-xs mb-2 block">
                    نوع حادثه و آسیب *
                  </label>
                  <select
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-4 py-3 text-xs font-bold text-slate-900 dark:text-white rounded-xl outline-none focus:border-[#D6001C]"
                  >
                    <option value="تخریب ساختمان و گرفتاری زیر آوار">تخریب ساختمان و گرفتاری زیر آوار</option>
                    <option value="نیاز فوری به خدمات پزشکی و سرم">نیاز فوری به خدمات پزشکی و دارویی</option>
                    <option value="کمبود شدید چادر و پتو">کمبود شدید چادر و پتو</option>
                    <option value="قطع جاده و محاصره در سیل">قطع جاده و محاصره در سیل یا کوهستان</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#D6001C] text-xs mb-2 block">
                    شماره تماس همراه *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0912XXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-4 py-3 text-xs font-mono font-bold text-slate-900 dark:text-white rounded-xl outline-none focus:border-[#D6001C]"
                  />
                </div>
              </div>

              {/* GPS Detection Bar */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[#D6001C] shrink-0" />
                  <div>
                    <div className="font-extrabold text-slate-900 dark:text-white text-xs">
                      دریافت موقعیت واقعی از GPS
                    </div>
                    <div className="text-[11px] text-slate-500">
                      ثبت مستقیم آدرس زنده جهت اعزام سریع‌تر نیروهای امدادی
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={gpsLoading}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#D6001C] text-white font-bold text-xs transition flex items-center justify-center gap-2 shrink-0"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{gpsLoading ? 'در حال دریافت موقعیت...' : '📍 ثبت موقعیت مکانی من'}</span>
                </button>
              </div>

              <div>
                <label className="font-bold text-[#D6001C] text-xs mb-2 block">
                  آدرس محل دقیق حادثه
                </label>
                <input
                  type="text"
                  placeholder="شهر / روستا، خیابان، پلاک، نشانه"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-4 py-3 text-xs font-bold text-slate-900 dark:text-white rounded-xl outline-none focus:border-[#D6001C]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#D6001C] text-xs mb-2 block">
                    تعداد افراد حادثه‌دیده
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={affectedCount}
                    onChange={(e) => setAffectedCount(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-4 py-3 text-xs font-mono font-bold text-slate-900 dark:text-white rounded-xl outline-none focus:border-[#D6001C]"
                  />
                </div>

                <div className="space-y-3 pt-3">
                  <label className="flex items-center gap-3 cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={hasInjuries}
                      onChange={(e) => setHasInjuries(e.target.checked)}
                      className="accent-[#D6001C] w-4 h-4 rounded"
                    />
                    <span className="text-xs font-bold">وجود مصدوم و مجروح در محل حادثه</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer text-red-600 font-bold">
                    <input
                      type="checkbox"
                      checked={immediateDanger}
                      onChange={(e) => setImmediateDanger(e.target.checked)}
                      className="accent-red-600 w-4 h-4 rounded"
                    />
                    <span className="text-xs font-extrabold">خطر جان جدی فوریت بالا</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#D6001C] hover:bg-red-700 text-white py-3 text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>ثبت نهایی درخواست امداد و نجات</span>
              </button>
            </form>
          )}
        </div>

        {/* Tracking Sidebar with Sample Requests (#20) */}
        <div className="bg-white dark:bg-[#0c0c12] p-6 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-5">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Search className="w-4 h-4 text-[#D6001C]" />
            <span>پیگیری درخواست‌های ثبت‌شده</span>
          </h3>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="مثال: RC-REQ-98421"
              value={searchTrackingId}
              onChange={(e) => setSearchTrackingId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white rounded-xl outline-none focus:border-[#D6001C]"
            />
            <button
              onClick={handleSearch}
              className="bg-[#D6001C] hover:bg-red-700 text-white px-4 py-2 text-xs font-bold rounded-xl shrink-0 transition"
            >
              جستجو
            </button>
          </div>

          {/* Searched Single Request Result */}
          {searchedRequest && (
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-2 border-[#D6001C] rounded-xl text-xs space-y-2 font-mono">
              <div className="flex justify-between font-extrabold">
                <span className="text-slate-900 dark:text-white">{searchedRequest.trackingId}</span>
                <span className="text-[#D6001C] uppercase">{searchedRequest.status}</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-sans font-bold">{searchedRequest.incidentType}</p>
              <p className="text-slate-500 font-sans">{searchedRequest.address}</p>
            </div>
          )}

          {/* Pre-existing Sample Requests List (#20) */}
          <div className="space-y-3 pt-2">
            <h4 className="font-extrabold text-xs text-[#D6001C] uppercase tracking-wider">
              نمونه درخواست‌های فعال قبلی:
            </h4>

            {sampleRequests.map((sample) => (
              <div
                key={sample.id}
                onClick={() => {
                  setSearchTrackingId(sample.trackingId);
                  setSearchedRequest(sample);
                }}
                className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 cursor-pointer hover:border-[#D6001C] transition"
              >
                <div className="flex justify-between items-center text-xs font-mono font-extrabold">
                  <span className="text-slate-900 dark:text-white">{sample.trackingId}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] ${
                      sample.status === 'dispatched'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        : sample.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {sample.status === 'dispatched' ? 'اعزام تیم' : sample.status === 'resolved' ? 'امدادرسانی شد' : 'در صف بررسی'}
                  </span>
                </div>

                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{sample.incidentType}</p>
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>{sample.address}</span>
                  <span>{sample.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
