import React, { useState } from 'react';
import { RedCrescentLogo } from './RedCrescentLogo';
import { RotatingGlobeBackground } from './RotatingGlobeBackground';
import {
  Language,
  UserProfile,
  EmergencyRequest,
  DisasterIncident,
  FacilityInfo,
  EmergencyNumberItem,
  BloodDonationCenter,
  DonationCampaign,
  VolunteerProgram,
  EmergencyAlertNotice,
  FirstAidArticle,
} from '../types';
import { getTranslation } from '../locales/i18n';
import {
  MOCK_FACILITIES,
  EMERGENCY_NUMBERS,
  BLOOD_DONATION_CENTRES,
  DONATION_CAMPAIGNS,
  VOLUNTEER_PROGRAMS,
  EMERGENCY_ALERT_NOTICES,
  FIRST_AID_ARTICLES,
  EDUCATIONAL_COURSES,
} from '../data/mockData';
import {
  Siren,
  MapPin,
  Bell,
  Heart,
  PhoneCall,
  Droplet,
  Users,
  BookOpen,
  GraduationCap,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Compass,
  ArrowRight,
  ArrowLeft,
  Send,
  ShieldCheck,
  Building2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  UserCheck,
  LogOut,
  Filter,
  Navigation,
  Activity,
  Ambulance,
  Flame,
  ShieldAlert,
  HeartHandshake,
  Bot,
  User,
  Menu,
  X,
} from 'lucide-react';
import { UserProfileTab } from './UserProfileTab';
import { Footer } from './Footer';

interface PublicPlatformProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  user: UserProfile | null;
  onLogout: () => void;
  onSwitchToRescuerConsole?: () => void;
  onOpenChatbot?: () => void;
  initialTab?: string;
}

export const PublicPlatform: React.FC<PublicPlatformProps> = ({
  language,
  onLanguageChange,
  user,
  onLogout,
  onSwitchToRescuerConsole,
  onOpenChatbot,
  initialTab = 'request',
}) => {

  const isRtl = language === 'fa' || language === 'ar';
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  const [isPublicDrawerOpen, setIsPublicDrawerOpen] = useState(false);
  const [donationMode, setDonationMode] = useState<'money' | 'goods'>('money');
  const [requestSubTab, setRequestSubTab] = useState<'ticket' | 'track'>('ticket');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [goodsItem, setGoodsItem] = useState('tents');
  const [goodsQty, setGoodsQty] = useState(5);
  const [goodsWarehouse, setGoodsWarehouse] = useState('انبار شماره ۱ - تهران‌پارس');

  // Course Registration Modal State
  const [selectedCourseForRegistration, setSelectedCourseForRegistration] = useState<any | null>(null);
  const [courseRegistrationSuccess, setCourseRegistrationSuccess] = useState<boolean>(false);
  const [courseStudentName, setCourseStudentName] = useState('');
  const [courseNationalCode, setCourseNationalCode] = useState('');
  const [coursePhone, setCoursePhone] = useState('');
  const [courseCity, setCourseCity] = useState('تهران');
  const [courseType, setCourseType] = useState('in_person');

  // Menu items list with Red Crescent Centers at the VERY BOTTOM as requested (#32)
  const publicMenuItems = [
    { id: 'request', label: getTranslation(language, 'public_tab_request'), icon: Siren },
    { id: 'local_relief', label: 'جدول وضعیت امدادرسانی محلی', icon: ShieldAlert },
    { id: 'map', label: getTranslation(language, 'public_tab_map'), icon: Compass },
    { id: 'blood', label: getTranslation(language, 'public_tab_blood'), icon: Droplet },
    { id: 'donations', label: getTranslation(language, 'public_tab_donations'), icon: Heart },
    { id: 'volunteer', label: getTranslation(language, 'public_tab_volunteer'), icon: Users },
    { id: 'news', label: getTranslation(language, 'public_tab_news'), icon: Bell },
    { id: 'firstaid', label: getTranslation(language, 'public_tab_firstaid'), icon: BookOpen },
    { id: 'courses', label: language === 'fa' ? 'دوره‌های آموزشی (۱۲)' : 'Training Courses', icon: GraduationCap },
    { id: 'track', label: 'درخواست‌ها (تیکت و پیگیری)', icon: Search },
    { id: 'profile', label: getTranslation(language, 'public_tab_profile'), icon: User },
    { id: 'centers', label: getTranslation(language, 'public_tab_centers'), icon: Building2 }, // Red Crescent Centers moved to VERY BOTTOM
  ];
  // Form State: Submit Emergency Request
  const [incidentType, setIncidentType] = useState<string>('earthquake');
  const [address, setAddress] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [affectedCount, setAffectedCount] = useState<number>(2);
  const [hasInjuries, setHasInjuries] = useState<boolean>(true);
  const [immediateDanger, setImmediateDanger] = useState<boolean>(true);
  const [description, setDescription] = useState<string>('');
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [submittedRequestCode, setSubmittedRequestCode] = useState<string | null>(null);

  // Form State: Track Request
  const [searchTrackingCode, setSearchTrackingCode] = useState<string>('');
  const [foundRequest, setFoundRequest] = useState<any | null>(null);
  const [trackingError, setTrackingError] = useState<string>('');

  // Facility Search / Filter
  const [facilitySearch, setFacilitySearch] = useState<string>('');
  const [facilityTypeFilter, setFacilityTypeFilter] = useState<string>('all');

  // Donation Form Modal / Input
  const [selectedCampaign, setSelectedCampaign] = useState<DonationCampaign | null>(null);
  const [donationAmount, setDonationAmount] = useState<number>(500000); // 500k Rials
  const [donorName, setDonorName] = useState<string>('');
  const [donationSuccess, setDonationSuccess] = useState<boolean>(false);

  // Volunteer Signup Form Modal
  const [selectedVolunteerProgram, setSelectedVolunteerProgram] = useState<VolunteerProgram | null>(null);
  const [volunteerPhone, setVolunteerPhone] = useState<string>('');
  const [volunteerCity, setVolunteerCity] = useState<string>('');
  const [volunteerSuccess, setVolunteerSuccess] = useState<boolean>(false);

  // User submitted requests state
  const [myRequests, setMyRequests] = useState<EmergencyRequest[]>([
    {
      id: 'req_demo_01',
      trackingCode: 'RC-REQ-48210',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      incidentType: 'earthquake',
      affectedCount: 4,
      hasInjuries: true,
      immediateDanger: true,
      description: 'ریزش دیوار و نیاز به جک و آواربرداری در سرپل ذهاب',
      address: 'سرپل ذهاب، محله مسکن مهر، بلوک ۵',
      contactPhone: '09121112233',
      lat: 34.462,
      lng: 45.865,
      status: 'dispatched',
      priorityScore: 92,
      reporterRole: 'citizen',
    },
  ]);

  // Handle GPS Auto Detect with real device geolocation & reverse geocoding
  const handleGetLocation = () => {
    setGpsLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setGpsLocation({ lat, lng });

          try {
            // Real reverse geocoding call via OpenStreetMap Nominatim
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=${language === 'fa' ? 'fa' : 'en'}`
            );
            if (res.ok) {
              const data = await res.json();
              if (data && data.display_name) {
                setAddress(data.display_name);
              } else {
                setAddress(
                  language === 'fa'
                    ? `موقعیت مکانی زنده دستگاه: عرض جغرافیایی ${lat.toFixed(5)}، طول جغرافیایی ${lng.toFixed(5)}`
                    : `Live Device Coordinates: Lat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)}`
                );
              }
            } else {
              setAddress(
                language === 'fa'
                  ? `موقعیت مکانی زنده دستگاه: عرض جغرافیایی ${lat.toFixed(5)}، طول جغرافیایی ${lng.toFixed(5)}`
                  : `Live Device Coordinates: Lat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)}`
              );
            }
          } catch (err) {
            console.warn('Reverse geocoding notice:', err);
            setAddress(
              language === 'fa'
                ? `موقعیت دقیق دستگاه ثبت شد (عرض: ${lat.toFixed(5)}، طول: ${lng.toFixed(5)})`
                : `Device Coordinates Recorded (Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)})`
            );
          } finally {
            setGpsLoading(false);
          }
        },
        (error) => {
          console.warn('GPS Error:', error);
          setGpsLoading(false);
          alert(
            language === 'fa'
              ? 'دسترسی به GPS برقرار نشد. لطفاً دسترسی موقعیت مکانی مرورگر را فعال فرمایید.'
              : 'GPS access failed. Please enable browser location permissions.'
          );
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    } else {
      setGpsLoading(false);
      alert(
        language === 'fa'
          ? 'دستگاه یا مرورگر شما از قابلیت GPS پشتیبانی نمی‌کند.'
          : 'Geolocation is not supported by your browser.'
      );
    }
  };

  // Handle Emergency Request Submission
  const handleSubmitEmergencyRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const code = `RC-REQ-${Math.floor(10000 + Math.random() * 90000)}`;
    const newReq: EmergencyRequest = {
      id: `req_${Date.now()}`,
      trackingCode: code,
      timestamp: new Date().toISOString(),
      incidentType: incidentType as any,
      affectedCount,
      hasInjuries,
      immediateDanger,
      description,
      address: address || 'سرپل ذهاب، منطقه عمومی',
      contactPhone: phone || '09120000000',
      lat: gpsLocation?.lat || 34.4612,
      lng: gpsLocation?.lng || 45.8624,
      status: 'received',
      priorityScore: (immediateDanger ? 50 : 20) + (hasInjuries ? 30 : 10) + Math.min(affectedCount * 2, 20),
      reporterRole: user?.role || 'citizen',
    };

    setMyRequests([newReq, ...myRequests]);
    setSubmittedRequestCode(code);
  };

  // Handle Request Tracking Search
  const handleTrackSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackingError('');
    setFoundRequest(null);
    if (!searchTrackingCode.trim()) return;

    const found = myRequests.find(
      (r) => r.trackingCode.toLowerCase() === searchTrackingCode.trim().toLowerCase()
    );

    if (found) {
      setFoundRequest(found);
    } else if (searchTrackingCode.trim().toUpperCase() === 'RC-REQ-48210') {
      setFoundRequest(myRequests[0]);
    } else {
      // Create a mock found request for user code if valid pattern
      if (searchTrackingCode.trim().startsWith('RC-')) {
        setFoundRequest({
          id: 'req_found_mock',
          trackingCode: searchTrackingCode.trim().toUpperCase(),
          timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
          incidentType: 'earthquake',
          affectedCount: 2,
          hasInjuries: false,
          immediateDanger: true,
          description: 'درخواست ثبت‌شده در سامانه ملی امداد هلال احمر',
          address: 'منطقه عملیاتی غرب کشور',
          contactPhone: '0912***4455',
          lat: 34.46,
          lng: 45.86,
          status: 'under_review',
          priorityScore: 78,
          reporterRole: 'citizen',
        });
      } else {
        setTrackingError(
          language === 'fa'
            ? 'کد رهگیری یافت نشد. لطفاً کد را مجدداً بررسی فرمایید (مثال: RC-REQ-48210).'
            : 'Tracking code not found. Please verify the code format (e.g. RC-REQ-48210).'
        );
      }
    }
  };

  // Filter facilities
  const filteredFacilities = MOCK_FACILITIES.filter((f) => {
    const matchesSearch =
      f.nameFa.includes(facilitySearch) ||
      f.cityFa.includes(facilitySearch) ||
      f.addressFa.includes(facilitySearch) ||
      f.nameEn.toLowerCase().includes(facilitySearch.toLowerCase());
    const matchesType = facilityTypeFilter === 'all' || f.type === facilityTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col"
    >
      {/* Top Header - Collage Gradient Blue to Red */}
      <header className="border-b border-blue-900/50 bg-gradient-to-r from-blue-950 via-slate-900 to-red-950 text-white shadow-xl backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Top-Right 3-Line Hamburger Menu Button (#32) */}
          <button
            onClick={() => setIsPublicDrawerOpen(true)}
            className="p-2.5 rounded-xl bg-red-600/30 hover:bg-red-600/60 text-white border border-red-500/50 flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            title="منوی خدمات (Services Menu)"
          >
            <Menu className="w-5 h-5 text-white" />
            <span className="text-xs font-bold hidden sm:inline">
              {language === 'fa' ? 'منوی خدمات' : language === 'ar' ? 'قائمة الخدمات' : 'Services Menu'}
            </span>
          </button>

          {/* Return Arrow Button */}
          <button
            onClick={onLogout}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-red-950/60 text-red-400 border border-slate-700/60 transition-colors"
            title="Return to Landing Page"
          >
            {isRtl ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </button>

          <RedCrescentLogo size={34} />
          <div>
            <h1 className="font-bold text-base sm:text-lg leading-tight text-white flex items-center gap-2">
              {getTranslation(language, 'appName')}
            </h1>
            <p className="text-xs text-blue-200/80 hidden sm:block">
              {getTranslation(language, 'publicConsoleDesc')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-neutral-800 rounded-lg p-1 text-xs">
            <button
              onClick={() => onLanguageChange('fa')}
              className={`px-2 py-1 rounded-md transition-all ${
                language === 'fa'
                  ? 'bg-white dark:bg-neutral-700 text-[#D6001C] font-bold shadow-xs'
                  : 'text-slate-600 dark:text-neutral-400'
              }`}
            >
              فارسی
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-1 rounded-md transition-all ${
                language === 'en'
                  ? 'bg-white dark:bg-neutral-700 text-[#D6001C] font-bold shadow-xs'
                  : 'text-slate-600 dark:text-neutral-400'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange('ar')}
              className={`px-2 py-1 rounded-md transition-all ${
                language === 'ar'
                  ? 'bg-white dark:bg-neutral-700 text-[#D6001C] font-bold shadow-xs'
                  : 'text-slate-600 dark:text-neutral-400'
              }`}
            >
              العربية
            </button>
          </div>

          {/* User Profile */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="text-xs text-right hidden sm:block">
                <div className="font-bold text-slate-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-[10px] text-[#D6001C] font-mono">{user.username}</div>
              </div>
            </div>
          ) : null}

          {onSwitchToRescuerConsole && (
            <button
              onClick={onSwitchToRescuerConsole}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-[#D6001C] dark:text-red-400 hover:bg-red-100 transition-colors hidden md:flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>کنسول امدادگران</span>
            </button>
          )}
        </div>
      </header>

      {/* Public Side Navigation Drawer Overlay (#32) */}
      {isPublicDrawerOpen && (
        <div className="fixed inset-0 z-50 flex" dir={isRtl ? 'rtl' : 'ltr'}>
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsPublicDrawerOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] bg-slate-900 dark:bg-slate-950 text-slate-100 border-l border-r border-blue-900/60 shadow-2xl flex flex-col h-full z-10">
            <div className="p-4 border-b border-blue-900/60 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-3">
                <RedCrescentLogo size={32} />
                <div>
                  <h3 className="font-extrabold text-sm text-white">منوی درگاه عمومی</h3>
                  <p className="text-[11px] text-red-400">جمعیت هلال احمر جمهوری اسلامی ایران</p>
                </div>
              </div>
              <button
                onClick={() => setIsPublicDrawerOpen(false)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
              {publicMenuItems.map((item) => {
                const IconComp = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsPublicDrawerOpen(false);
                    }}
                    className={`w-full p-3 rounded-xl flex items-center gap-3 text-sm font-bold transition-all text-right ${
                      isActive
                        ? 'bg-[#D6001C] text-white shadow-md'
                        : 'bg-slate-800/40 hover:bg-slate-800 text-slate-300 hover:text-white border border-transparent'
                    }`}
                  >
                    <IconComp className={`w-5 h-5 ${isActive ? 'text-white' : 'text-cyan-400'}`} />
                    <span className="flex-1">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-4 border-t border-blue-900/60 bg-slate-950 text-xs text-slate-400 text-center">
              <span>خط اضطراری شبانه‌روزی ۱۱۲ (بدون سیم‌کارت)</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 flex-1 w-full space-y-8">
        {/* SECTION 1: PROMINENT HEADER WITH RED CRESCENT RELIEF BACKGROUND IMAGE (#28) */}
        <section className="relative rounded-3xl overflow-hidden border-2 border-red-900/40 p-6 lg:p-10 shadow-2xl bg-slate-950 text-white">
          {/* Real Red Crescent Rescue Worker Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity filter brightness-110 contrast-125"
            style={{
              backgroundImage: `url('/src/assets/images/red_crescent_rescue_1786433020735.jpg')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-900/60" />

          <div className="relative z-10 text-center max-w-3xl mx-auto mb-8 space-y-3">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#D6001C] text-white text-xs font-black uppercase tracking-widest shadow-lg border border-red-400/40">
              جمعیت هلال احمر جمهوری اسلامی ایران
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
              {getTranslation(language, 'public_headline')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl mx-auto font-medium drop-shadow-sm">
              خدمات عمومی، ثبت درخواست‌های اضطراری، پیدا کردن نزدیک‌ترین مراکز هلال احمر، مشاهده هشدارهای زنده و اهدای کمک به حادثه‌دیدگان
            </p>
          </div>

          {/* 4 Large High-Contrast Bold Action Cards */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Emergency Request */}
            <button
              onClick={() => {
                setActiveTab('request');
                document.getElementById('public-tabs-scroll')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`group p-6 rounded-2xl border-2 text-right transition-all duration-200 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between shadow-xl ${
                activeTab === 'request'
                  ? 'bg-gradient-to-br from-[#D6001C] to-red-900 text-white border-white ring-4 ring-red-500/50 shadow-red-900/80 scale-[1.02]'
                  : 'bg-slate-900/90 hover:bg-red-950/90 border-red-500/80 hover:border-red-400 text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-white text-[#D6001C] flex items-center justify-center font-extrabold shadow-md group-hover:scale-110 transition-transform">
                  <Siren className="w-6 h-6 animate-pulse text-[#D6001C]" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                  اعزام فوری 🚨
                </span>
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white mb-1.5 drop-shadow-xs">
                  {getTranslation(language, 'public_action1')}
                </h3>
                <p className="text-xs text-red-100/90 leading-relaxed font-medium">
                  ثبت آدرس، موقعیت دقیق GPS و اعزام سریع نیروهای نجات
                </p>
              </div>
            </button>

            {/* Card 2: Find Center */}
            <button
              onClick={() => {
                setActiveTab('centers');
              }}
              className={`group p-6 rounded-2xl border-2 text-right transition-all duration-200 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between shadow-xl ${
                activeTab === 'centers'
                  ? 'bg-gradient-to-br from-blue-700 to-indigo-950 text-white border-white ring-4 ring-blue-500/50 shadow-blue-900/80 scale-[1.02]'
                  : 'bg-slate-900/90 hover:bg-blue-950/90 border-blue-500/80 hover:border-blue-400 text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-white text-blue-700 flex items-center justify-center font-extrabold shadow-md group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                  مراکز زنده 📍
                </span>
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white mb-1.5 drop-shadow-xs">
                  {getTranslation(language, 'public_action2')}
                </h3>
                <p className="text-xs text-blue-100/90 leading-relaxed font-medium">
                  داروخانه‌ها، درمانگاه‌ها و پایگاه‌های جاده‌ای هلال احمر
                </p>
              </div>
            </button>

            {/* Card 3: Regional Alerts */}
            <button
              onClick={() => {
                setActiveTab('news');
              }}
              className={`group p-6 rounded-2xl border-2 text-right transition-all duration-200 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between shadow-xl ${
                activeTab === 'news'
                  ? 'bg-gradient-to-br from-amber-600 to-orange-950 text-white border-white ring-4 ring-amber-500/50 shadow-amber-900/80 scale-[1.02]'
                  : 'bg-slate-900/90 hover:bg-amber-950/90 border-amber-500/80 hover:border-amber-400 text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-white text-amber-600 flex items-center justify-center font-extrabold shadow-md group-hover:scale-110 transition-transform">
                  <Bell className="w-6 h-6 text-amber-600" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-xs">
                  اطلاعیه و هشدار 📢
                </span>
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white mb-1.5 drop-shadow-xs">
                  {getTranslation(language, 'public_action3')}
                </h3>
                <p className="text-xs text-amber-100/90 leading-relaxed font-medium">
                  هشدارهای زلزله، سیل، انسداد جاده‌ها و اخبار هلال احمر
                </p>
              </div>
            </button>

            {/* Card 4: Donations & Help */}
            <button
              onClick={() => {
                setActiveTab('donations');
              }}
              className={`group p-6 rounded-2xl border-2 text-right transition-all duration-200 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between shadow-xl ${
                activeTab === 'donations'
                  ? 'bg-gradient-to-br from-emerald-600 to-teal-950 text-white border-white ring-4 ring-emerald-500/50 shadow-emerald-900/80 scale-[1.02]'
                  : 'bg-slate-900/90 hover:bg-emerald-950/90 border-emerald-500/80 hover:border-emerald-400 text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-white text-emerald-700 flex items-center justify-center font-extrabold shadow-md group-hover:scale-110 transition-transform">
                  <Heart className="w-6 h-6 text-emerald-600" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                  اهدای آنلاین ❤️
                </span>
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white mb-1.5 drop-shadow-xs">
                  {getTranslation(language, 'public_action4')}
                </h3>
                <p className="text-xs text-emerald-100/90 leading-relaxed font-medium">
                  پویش‌های مالی، اهدای اقلام زیستی و گزارش شفاف هزینه‌ها
                </p>
              </div>
            </button>
          </div>
        </section>

        {/* SECTION 2: ACTIVE SERVICE SECTION BAR WITH 3-LINE MENU TRIGGER */}
        <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-neutral-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPublicDrawerOpen(true)}
              className="p-2.5 rounded-xl bg-[#D6001C] hover:bg-red-700 text-white font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
              title="منوی خدمات (Services Menu)"
            >
              <Menu className="w-5 h-5 text-white" />
              <span className="text-xs font-bold">
                {language === 'fa' ? 'منوی خدمات' : language === 'ar' ? 'قائمة الخدمات' : 'Services Menu'}
              </span>
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-neutral-800 hidden sm:block" />

            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 text-sm font-black">
              <span className="text-xs text-slate-400 font-normal">
                {language === 'fa' ? 'بخش فعال:' : language === 'ar' ? 'القسم النشط:' : 'Active Section:'}
              </span>
              <span className="text-[#D6001C]">
                {publicMenuItems.find((m) => m.id === activeTab)?.label || 'خدمات عمومی'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsPublicDrawerOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-300 text-xs font-bold transition flex items-center gap-1.5"
          >
            <span>{language === 'fa' ? 'تغییر خدمت' : language === 'ar' ? 'تغيير الخدمة' : 'Change Service'}</span>
            {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* TAB 1: SUBMIT EMERGENCY REQUEST */}
        {activeTab === 'request' && (
          <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 lg:p-8 shadow-xs">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-neutral-800">
                <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950/60 text-[#D6001C]">
                  <Siren className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {getTranslation(language, 'public_tab_request')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">
                    اطلاعات حادثه را با دقت وارد فرمایید تا نزدیک‌ترین تیم‌های عملیاتی اعزام شوند
                  </p>
                </div>
              </div>

              {submittedRequestCode ? (
                <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-extrabold text-emerald-800 dark:text-emerald-300">
                    درخواست امداد با موفقیت ثبت شد
                  </h4>
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">
                    کد رهگیری اختصاصی شما:
                  </p>
                  <div className="inline-block px-6 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-emerald-300 dark:border-emerald-700 font-mono text-2xl font-black text-[#D6001C] tracking-widest shadow-inner">
                    {submittedRequestCode}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-neutral-400 max-w-md mx-auto">
                    این کد را یادداشت فرمایید. مرکز فرماندهی هلال احمر فوراً درخواست را بررسی و تیم امدادی را اعزام می‌کند.
                  </p>
                  <div className="flex justify-center gap-4 pt-2">
                    <button
                      onClick={() => {
                        setSearchTrackingCode(submittedRequestCode);
                        setActiveTab('track');
                      }}
                      className="px-6 py-2.5 rounded-xl bg-[#D6001C] text-white font-bold text-xs shadow-md hover:bg-[#b50017] transition-colors"
                    >
                      پیگیری زنده وضعیت امدادرسانی
                    </button>
                    <button
                      onClick={() => setSubmittedRequestCode(null)}
                      className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-neutral-800 text-slate-800 dark:text-neutral-200 font-bold text-xs hover:bg-slate-300"
                    >
                      ثبت درخواست جدید
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitEmergencyRequest} className="space-y-6">
                  {/* GPS Detect Button */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Navigation className="w-5 h-5 text-[#D6001C]" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          شناسایی هوشمند موقعیت مکانی (GPS)
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-neutral-400">
                          با فشردن کلید زیر، مختصات دقیق شما برای هدایت آمبولانس و تیم نجات ارسال می‌شود
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={gpsLoading}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-neutral-800 text-white font-bold text-xs hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shrink-0"
                    >
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span>{gpsLoading ? 'در حال دریافت GPS...' : '📍 استفاده از موقعیت مکانی من'}</span>
                    </button>
                  </div>

                  {/* Incident Type & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                        {getTranslation(language, 'form_incidentType')} *
                      </label>
                      <select
                        value={incidentType}
                        onChange={(e) => setIncidentType(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:border-[#D6001C]"
                      >
                        <option value="earthquake">زلزله و آواربرداری</option>
                        <option value="flood">سیلاب و آب‌گرفتگی شديد</option>
                        <option value="road_accident">تصادف و حادثه جاده‌ای</option>
                        <option value="snow_trapped">گرفتاری در برف و کولاک کوهستان</option>
                        <option value="medical_emergency">اورژانس و فوریت‌های پزشکی</option>
                        <option value="fire">آتش‌سوزی و انفجار</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                        {getTranslation(language, 'form_phone')} *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="09121112233"
                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:border-[#D6001C]"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                      {getTranslation(language, 'form_address')} *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="شهر، خیابان اصلی، کوچه، پلاک یا نشانه بارز محل حادثه..."
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:border-[#D6001C]"
                    />
                  </div>

                  {/* Affected Count & Checkboxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                        {getTranslation(language, 'form_affectedCount')}
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={affectedCount}
                        onChange={(e) => setAffectedCount(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:border-[#D6001C]"
                      />
                    </div>

                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-neutral-200">
                        <input
                          type="checkbox"
                          checked={hasInjuries}
                          onChange={(e) => setHasInjuries(e.target.checked)}
                          className="w-4 h-4 rounded text-[#D6001C] focus:ring-[#D6001C]"
                        />
                        <span>{getTranslation(language, 'form_injuries')}</span>
                      </label>
                    </div>

                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-red-600 dark:text-red-400">
                        <input
                          type="checkbox"
                          checked={immediateDanger}
                          onChange={(e) => setImmediateDanger(e.target.checked)}
                          className="w-4 h-4 rounded text-[#D6001C] focus:ring-[#D6001C]"
                        />
                        <span>{getTranslation(language, 'form_immediateDanger')}</span>
                      </label>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                      توضیحات تکمیلی و درخواست اقلام خاص
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="اگر نیاز به چادر، پتو، جیره غذایی ۷۲ ساعته یا تجهیزات آواربرداری دارید ذکر فرمایید..."
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:border-[#D6001C]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-[#D6001C] hover:bg-[#b50017] text-white font-extrabold text-base shadow-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Siren className="w-5 h-5" />
                    <span>{getTranslation(language, 'form_submitRequest')}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* TAB 1.5: LOCAL RELIEF STATUS TABLE (#30) */}
        {activeTab === 'local_relief' && (
          <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 lg:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-neutral-800 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950/60 text-[#D6001C]">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    جدول وضعیت امدادرسانی محلی مناطق بحرانی
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">
                    رصد لحظه‌ای میزان پیشرفت عملیات نجات، اسکان اضطراری و توزیع اقلام در شهرستان‌های تحت پوشش
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold font-mono">
                به‌روزرسانی زنده: {new Date().toLocaleTimeString('fa-IR')}
              </span>
            </div>

            {/* Relief Status Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-neutral-800">
              <table className="w-full text-right text-xs text-slate-700 dark:text-neutral-200">
                <thead className="bg-slate-100 dark:bg-neutral-900 text-slate-900 dark:text-white font-extrabold uppercase text-[11px] border-b border-slate-200 dark:border-neutral-800">
                  <tr>
                    <th className="p-3.5">شهرستان / منطقه بحرانی</th>
                    <th className="p-3.5">نوع حادثه</th>
                    <th className="p-3.5">تیم امدادی مستقر</th>
                    <th className="p-3.5">پناهگاه و ظرفیت اسکان</th>
                    <th className="p-3.5">جیره غذایی ۷۲ساعته توزیع‌شده</th>
                    <th className="p-3.5">پایگاه درمانی سیار</th>
                    <th className="p-3.5 text-center">وضعیت عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/60">
                  {[
                    {
                      region: 'کرمانشاه - سرپل ذهاب',
                      incident: 'زلزله ۷.۳ ریشتری',
                      team: 'تیم واکنش سریع (ایثار) کُردستان & کرمانشاه',
                      shelter: 'ورزشگاه تختی (۸۵۰ / ۱۰۰۰ نفر)',
                      foodPacks: '۳,۴۵۰ بسته',
                      medical: 'بیمارستان صحرایی فعال',
                      status: 'active',
                    },
                    {
                      region: 'لرستان - معمولان و پلدختر',
                      incident: 'سیل و طغیان رودخانه',
                      team: 'تیم غواصی و قایقرانی خوزستان',
                      shelter: 'کمپ سالن ورزشی (۴۲۰ / ۵۰۰ نفر)',
                      foodPacks: '۱,۸۹0 بسته',
                      medical: 'درمانگاه سیار ۲۴ ساعته',
                      status: 'active',
                    },
                    {
                      region: 'کردستان - مریوان',
                      incident: 'آتش‌سوزی جنگل‌های زاگرس',
                      team: 'یگان هوابرد بالگردی و داوطلبان',
                      shelter: 'مدرسه شبانه‌روزی (۱۸۰ / ۳۰۰ نفر)',
                      foodPacks: '۹۲۰ بسته',
                      medical: 'تیم اکسیژن‌تراپی سیار',
                      status: 'active',
                    },
                    {
                      region: 'مازندران - گردنه کندوان',
                      incident: 'برف و کولاک شدید',
                      team: 'پایگاه امداد جاده‌ای کوهستان',
                      shelter: 'پایگاه امداد جاده‌ای (۲۲۰ / ۲۵۰ نفر)',
                      foodPacks: '۱,۱۰۰ بسته',
                      medical: 'آمبولانس فوریت‌های پزشکی',
                      status: 'stabilized',
                    },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-neutral-900/50 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">{row.region}</td>
                      <td className="p-3.5 text-red-600 dark:text-red-400 font-semibold">{row.incident}</td>
                      <td className="p-3.5">{row.team}</td>
                      <td className="p-3.5 font-mono">{row.shelter}</td>
                      <td className="p-3.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold">{row.foodPacks}</td>
                      <td className="p-3.5">{row.medical}</td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          row.status === 'active'
                            ? 'bg-red-100 dark:bg-red-950/60 text-[#D6001C] animate-pulse'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        }`}>
                          {row.status === 'active' ? 'در حال امدادرسانی 🚨' : 'تثبیت‌شده ✅'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: REGIONAL MAP & ROTATING GLOBE */}
        {activeTab === 'map' && (
          <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 lg:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <Compass className="w-6 h-6 text-[#D6001C]" />
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {getTranslation(language, 'public_tab_map')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">
                    رصد زنده کره زمین و پایش هوشمند نقاط بحرانی، پناهگاه‌ها و مراکز هلال احمر
                  </p>
                </div>
              </div>
            </div>

            {/* Rotating Earth Globe Container */}
            <div className="relative w-full h-[450px] bg-slate-950 rounded-2xl overflow-hidden border-2 border-blue-900/60 flex items-center justify-center p-4 shadow-2xl">
              {/* Blue Ambient Backdrop Halo */}
              <div className="absolute w-[350px] h-[350px] rounded-full bg-cyan-500/10 blur-[80px] pointer-events-none" />

              {/* Rotating Globe Element in Center */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                <RotatingGlobeBackground />
              </div>

              {/* Key Humanitarian Radar & Map Points Overlay */}
              <div className="relative z-10 w-full h-full max-w-2xl mx-auto flex items-center justify-center">
                {/* Center Node: Kermanshah HQ */}
                <div className="absolute top-[45%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-blue-600/30 border-2 border-cyan-400 animate-ping absolute" />
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xl relative border border-cyan-300">
                    🏢
                  </div>
                  <span className="text-[11px] font-extrabold text-white bg-slate-900/95 px-2.5 py-1 rounded-lg mt-1.5 shadow-md border border-cyan-500/50">
                    ستاد مرکزی کرمانشاه
                  </span>
                </div>

                {/* Pin 1: Sarpol-e Zahab Disaster Zone */}
                <div className="absolute top-[30%] left-[28%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
                  <div className="w-9 h-9 rounded-full bg-red-600/40 border-2 border-red-500 animate-ping absolute" />
                  <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow-xl relative border border-red-300">
                    🚨
                  </div>
                  <span className="text-[11px] font-extrabold text-white bg-slate-900/95 px-2.5 py-1 rounded-lg mt-1.5 shadow-md border border-red-500/50">
                    کانون زلزله سرپل ذهاب (شدت ۷.۳)
                  </span>
                </div>

                {/* Pin 2: Active Shelter */}
                <div className="absolute top-[65%] left-[68%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xl border border-emerald-300">
                    🏕️
                  </div>
                  <span className="text-[11px] font-extrabold text-white bg-slate-900/95 px-2.5 py-1 rounded-lg mt-1.5 shadow-md border border-emerald-500/50">
                    پناهگاه ورزشگاه (ظرفیت ۸۵٪)
                  </span>
                </div>

                {/* Pin 3: Blocked Mountain Road */}
                <div className="absolute top-[25%] left-[72%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-xl border border-amber-300">
                    ⚠️
                  </div>
                  <span className="text-[11px] font-extrabold text-white bg-slate-900/95 px-2.5 py-1 rounded-lg mt-1.5 shadow-md border border-amber-500/50">
                    محور پاوه (ریزش کوه - مسدود)
                  </span>
                </div>

                {/* Pin 4: Helicopter Air Corridor Node */}
                <div className="absolute top-[75%] left-[32%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xl border border-purple-300">
                    🚁
                  </div>
                  <span className="text-[11px] font-extrabold text-white bg-slate-900/95 px-2.5 py-1 rounded-lg mt-1.5 shadow-md border border-purple-500/50">
                    دالان هوایی بالگرد امداد
                  </span>
                </div>
              </div>

              {/* Map Legend */}
              <div className="absolute bottom-4 right-4 bg-slate-900/95 border border-blue-900/60 rounded-xl p-3.5 text-[11px] text-slate-200 space-y-1.5 backdrop-blur-md shadow-2xl">
                <div className="font-bold text-cyan-400 mb-1 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  <span>راهنمای نقاط کروی هلال احمر</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span>کانون آسیب‌دیده و بحرانی</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>ستاد و انبار لجستیک</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span>پناهگاه و اسکان اضطراری</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-500" />
                  <span>دالان پروازی بالگرد</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RED CRESCENT CENTERS LOCATOR */}
        {activeTab === 'centers' && (
          <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 lg:p-8 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-[#D6001C]" />
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {getTranslation(language, 'public_tab_centers')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">
                    پایگاه‌ها، درمانگاه‌ها و داروخانه‌های رسمی هلال احمر
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute top-3 right-3" />
                  <input
                    type="text"
                    value={facilitySearch}
                    onChange={(e) => setFacilitySearch(e.target.value)}
                    placeholder="جستجو بر اساس شهر یا آدرس..."
                    className="w-full px-3 py-2 pr-9 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:border-[#D6001C]"
                  />
                </div>

                <select
                  value={facilityTypeFilter}
                  onChange={(e) => setFacilityTypeFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:border-[#D6001C]"
                >
                  <option value="all">همه مراکز</option>
                  <option value="station">پایگاه‌های امدادی جاده‌ای</option>
                  <option value="pharmacy">داروخانه‌های تخصصی</option>
                  <option value="medical_center">درمانگاه‌ها و مراکز درمانی</option>
                  <option value="branch">شعب استانی و شهری</option>
                </select>
              </div>
            </div>

            {/* Facilities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredFacilities.map((facility) => (
                <div
                  key={facility.id}
                  className="bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl overflow-hidden hover:border-[#D6001C] transition-colors flex flex-col justify-between"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <span className="inline-block px-2.5 py-1 rounded-md bg-red-100 dark:bg-red-950/60 text-[#D6001C] text-[10px] font-bold mb-2">
                          {facility.type === 'station'
                            ? 'پایگاه امداد جاده‌ای'
                            : facility.type === 'pharmacy'
                            ? 'داروخانه تخصصی'
                            : facility.type === 'medical_center'
                            ? 'درمانگاه هلال احمر'
                            : 'شعبه مرکزی'}
                        </span>
                        <h4 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                          {language === 'fa' ? facility.nameFa : language === 'ar' ? facility.nameAr : facility.nameEn}
                        </h4>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-slate-200 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 text-xs font-bold shrink-0">
                        {facility.cityFa}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600 dark:text-neutral-400 mt-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-[#D6001C] shrink-0 mt-0.5" />
                        <span>{language === 'fa' ? facility.addressFa : facility.addressEn}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <PhoneCall className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="font-mono font-bold">{facility.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>ساعات کاری: {facility.openHours}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-100 dark:bg-neutral-800/60 border-t border-slate-200 dark:border-neutral-800 flex items-center justify-between">
                    <a
                      href={`tel:${facility.phone}`}
                      className="px-4 py-2 rounded-xl bg-[#D6001C] text-white font-bold text-xs hover:bg-[#b50017] transition-colors flex items-center gap-1.5"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>تماس مستقیم</span>
                    </a>
                    <button
                      onClick={() => alert(`موقعیت مکانی روی نقشه: Lat ${facility.lat}, Lng ${facility.lng}`)}
                      className="text-xs font-bold text-slate-700 dark:text-neutral-300 hover:text-[#D6001C] flex items-center gap-1"
                    >
                      <span>مسیریابی روی نقشه</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: EMERGENCY CONTACTS */}
        {activeTab === 'contacts' && (
          <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 lg:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-neutral-800">
              <PhoneCall className="w-6 h-6 text-[#D6001C]" />
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {getTranslation(language, 'public_tab_contacts')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  خطوط ارتباطی رایگان و شبانه‌روزی امداد و نجات کشور
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {EMERGENCY_NUMBERS.map((num) => (
                <div
                  key={num.id}
                  className="p-6 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 hover:border-[#D6001C] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="px-4 py-2 rounded-xl bg-[#D6001C] text-white font-mono font-black text-2xl shadow-sm">
                        {num.number}
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-[#D6001C] flex items-center justify-center">
                        <PhoneCall className="w-5 h-5" />
                      </div>
                    </div>

                    <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                      {language === 'fa' ? num.titleFa : language === 'ar' ? num.titleAr : num.titleEn}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed mb-6">
                      {language === 'fa' ? num.descriptionFa : num.descriptionEn}
                    </p>
                  </div>

                  <a
                    href={`tel:${num.number}`}
                    className="w-full py-3 rounded-xl bg-slate-900 dark:bg-neutral-800 hover:bg-[#D6001C] text-white font-bold text-xs text-center transition-colors flex items-center justify-center gap-2"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>شماره‌گیری شماره {num.number}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: BLOOD DONATION */}
        {activeTab === 'blood' && (
          <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 lg:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-neutral-800">
              <Droplet className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {getTranslation(language, 'public_tab_blood')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  پایگاه‌های انتقال خون و گروه‌های خونی مورد نیاز فوری در مناطق حادثه‌دیده
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {BLOOD_DONATION_CENTRES.map((center) => (
                <div
                  key={center.id}
                  className="p-6 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">
                        {language === 'fa' ? center.nameFa : center.nameEn}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                        {language === 'fa' ? center.addressFa : center.addressEn}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-[#D6001C] font-bold text-xs shrink-0">
                      {center.cityFa}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-700 dark:text-neutral-300 mb-2">
                      گروه‌های خونی با نیاز فوری:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {center.urgentNeeds.map((group) => (
                        <span
                          key={group}
                          className="px-3 py-1 rounded-lg bg-red-600 text-white font-mono font-black text-xs shadow-xs animate-pulse"
                        >
                          {group}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-neutral-800 flex items-center justify-between text-xs text-slate-600 dark:text-neutral-400">
                    <span>{center.operatingHoursFa}</span>
                    <a
                      href={`tel:${center.phone}`}
                      className="font-bold text-[#D6001C] hover:underline"
                    >
                      {center.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Blood Donation Registration Form (#33) */}
            <div className="p-6 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 space-y-4">
              <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Droplet className="w-5 h-5 text-red-600 animate-bounce" />
                <span>ثبت‌نام آنلاین نوبت اهدای خون</span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-neutral-400">
                جهت تسریع فرایند اهدای خون در مراکز هلال احمر و سازمان انتقال خون، اطلاعات زیر را وارد نمایید.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('نوبت اهدای خون شما با موفقیت ثبت شد. کد پیگیری نوبت: BD-98412');
                }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs"
              >
                <div>
                  <label className="block font-bold text-slate-700 dark:text-neutral-300 mb-1">نام و نام خانوادگی *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: علی رضایی"
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-neutral-300 mb-1">کد ملی (۱۰ رقمی) *</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="0012345678"
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-neutral-300 mb-1">شماره همراه *</label>
                  <input
                    type="tel"
                    required
                    placeholder="09123456789"
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-neutral-300 mb-1">گروه خونی *</label>
                  <select className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl">
                    <option value="O-">O منفی (نیاز بسیار فوری)</option>
                    <option value="A-">A منفی</option>
                    <option value="B-">B منفی</option>
                    <option value="AB-">AB منفی</option>
                    <option value="O+">O مثبت</option>
                    <option value="A+">A مثبت</option>
                    <option value="B+">B مثبت</option>
                    <option value="AB+">AB مثبت</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-neutral-300 mb-1">مرکز اهدای خون *</label>
                  <select className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl">
                    <option>مرکز وصال شیرازی تهران</option>
                    <option>پایگاه هلال احمر کرمانشاه</option>
                    <option>پایگاه مرکزی تبریز</option>
                    <option>پایگاه خوزستان (اهواز)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-neutral-300 mb-1">تاریخ و نوبت *</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl"
                  />
                </div>
                <div className="md:col-span-3 pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition"
                  >
                    تایید و دریافت کد رزرو نوبت اهدای خون
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 6: DONATIONS & TRANSPARENCY */}
        {activeTab === 'donations' && (
          <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 lg:p-8 shadow-xs space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-neutral-800 gap-4">
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6 text-[#D6001C]" />
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {getTranslation(language, 'public_tab_donations')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">
                    پویش‌های مردمی و گزارش شفاف محل مصرف کمک‌های نقدی و غیرنقدی
                  </p>
                </div>
              </div>

              {/* 2 Distinct Buttons: Donate Money vs Donate Goods (#34) */}
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-neutral-800 p-1 rounded-xl">
                <button
                  onClick={() => setDonationMode('money')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                    donationMode === 'money'
                      ? 'bg-[#D6001C] text-white shadow-sm'
                      : 'text-slate-700 dark:text-neutral-300 hover:text-slate-900'
                  }`}
                >
                  💳 اهدای آنلاین پول
                </button>
                <button
                  onClick={() => setDonationMode('goods')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                    donationMode === 'goods'
                      ? 'bg-[#D6001C] text-white shadow-sm'
                      : 'text-slate-700 dark:text-neutral-300 hover:text-slate-900'
                  }`}
                >
                  📦 اهدای کالای امدادی
                </button>
              </div>
            </div>

            {/* View A: Money Donations */}
            {donationMode === 'money' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {DONATION_CAMPAIGNS.map((camp) => {
                  const percent = Math.round((camp.collectedAmountRials / camp.targetAmountRials) * 100);
                  return (
                    <div
                      key={camp.id}
                      className="p-6 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-5 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <h4 className="font-extrabold text-lg text-slate-900 dark:text-white leading-snug">
                          {language === 'fa' ? camp.titleFa : camp.titleEn}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                          {language === 'fa' ? camp.destinationSummaryFa : camp.destinationSummaryEn}
                        </p>

                        {/* Progress Bar */}
                        <div>
                          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                            <span className="text-slate-700 dark:text-neutral-300">
                              جمع‌آوری شده: {(camp.collectedAmountRials / 1000000000).toLocaleString()} میلیارد ریال
                            </span>
                            <span className="text-[#D6001C] font-mono">{percent}٪</span>
                          </div>
                          <div className="w-full h-3 bg-slate-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#D6001C] transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[11px] text-slate-500 dark:text-neutral-400 mt-1">
                            <span>هدف: {(camp.targetAmountRials / 1000000000).toLocaleString()} میلیارد ریال</span>
                            <span>مشارکت‌کنندگان: {camp.donorsCount.toLocaleString()} نفر</span>
                          </div>
                        </div>

                        {/* Transparency Breakdown */}
                        <div className="p-3 rounded-xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-xs space-y-1">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                            <span>شفافیت مالی (هزینه‌شده):</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                              {(camp.spentAmountRials / 1000000000).toLocaleString()} میلیارد ریال
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-neutral-400">
                            مناطق تحت پوشش: {camp.supportedRegionsFa}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedCampaign(camp)}
                        className="w-full py-3 rounded-xl bg-[#D6001C] hover:bg-[#b50017] text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                      >
                        <Heart className="w-4 h-4" />
                        <span>مشارکت آنلاین در این پویش</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* View B: Relief Goods Donation (#34) */}
            {donationMode === 'goods' && (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-6">
                <div>
                  <h4 className="font-extrabold text-lg text-slate-900 dark:text-white mb-1">
                    ثبت و تحویل کالای اقلام امدادی به انبارهای هلال احمر
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">
                    کمک‌های غیرنقدی شامل اقلام نو و بسته‌بندی شده توسط تیم تحویل‌گیرنده هلال احمر رسید رسمی می‌گردند.
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert(`رسید اهدای کالای شما ثبت شد. کد تحویل به انبار: GD-77341. لطفاً به ${goodsWarehouse} مراجعه فرمایید.`);
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs"
                >
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-neutral-300 mb-1">نوع کالا / اقلام امدادی *</label>
                    <select
                      value={goodsItem}
                      onChange={(e) => setGoodsItem(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl"
                    >
                      <option value="tents">چادر امدادی ۴ نفره نو (استاندارد هلال احمر)</option>
                      <option value="blankets">پتوی گلبافت / گرم نمدی (بسته‌بندی)</option>
                      <option value="food">بسته جیره غذایی ۷۲ ساعته (کنسروجات، خرما، برنج)</option>
                      <option value="hygiene">بسته بهداشتی (صداقت، شوینده، لوازم بانوان)</option>
                      <option value="clothes">لباس گرم و کاپشن زنانه / مردانه / بچگانه (نو)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-neutral-300 mb-1">تعداد / مقدار کالا *</label>
                    <input
                      type="number"
                      min={1}
                      value={goodsQty}
                      onChange={(e) => setGoodsQty(Number(e.target.value))}
                      className="w-full px-3 py-2.5 bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl font-mono font-bold"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-700 dark:text-neutral-300 mb-1">انبار / پایگاه تحویل‌گیرنده *</label>
                    <select
                      value={goodsWarehouse}
                      onChange={(e) => setGoodsWarehouse(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl"
                    >
                      <option value="انبار شماره ۱ - تهران‌پارس">انبار مرکزی تهران‌پارس (تهران)</option>
                      <option value="انبار هلال احمر کرمانشاه">انبار امدادی کرمانشاه (میدان فردوسی)</option>
                      <option value="پایگاه پشتیبانی اهواز">پایگاه پشتیبانی عملیات امداد خوزستان (اهواز)</option>
                      <option value="پایگاه جاده‌ای چناران">پایگاه پشتیبانی هلال احمر مشهد (چناران)</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
                    >
                      ثبت اهدای کالا و صدور قبض دیجیتال تحویل انبار
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Donation Modal / Form */}
            {selectedCampaign && (
              <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    پرداخت و اهدای کمک مالی به: {selectedCampaign.titleFa}
                  </h4>
                  <button
                    onClick={() => setSelectedCampaign(null)}
                    className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    انصراف
                  </button>
                </div>

                {donationSuccess ? (
                  <div className="p-4 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold text-center">
                    با تشکر از نیت خیرخواهانه شما. رسید دیجیتال هلال احمر صادر گردید.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                          مبلغ اهدایی (ریال)
                        </label>
                        <input
                          type="number"
                          value={donationAmount}
                          onChange={(e) => setDonationAmount(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl text-xs font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                          نام نیکوکار (اختیاری)
                        </label>
                        <input
                          type="text"
                          value={donorName}
                          onChange={(e) => setDonorName(e.target.value)}
                          placeholder="خیر گمنام"
                          className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl text-xs"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => {
                            setDonationSuccess(true);
                            setTimeout(() => {
                              setDonationSuccess(false);
                              setSelectedCampaign(null);
                            }, 2000);
                          }}
                          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
                        >
                          انتقال به درگاه امن بانکی
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: VOLUNTEER & PROGRAMS */}
        {activeTab === 'volunteer' && (
          <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 lg:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-neutral-800">
              <Users className="w-6 h-6 text-[#D6001C]" />
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {getTranslation(language, 'public_tab_volunteer')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  ثبت‌نام در گروه‌های امدادی، کادر درمان و پشتیبانی لجستیک هلال احمر
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {VOLUNTEER_PROGRAMS.map((prog) => (
                <div
                  key={prog.id}
                  className="p-6 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <span className="inline-block px-2.5 py-1 rounded-md bg-red-100 dark:bg-red-950/60 text-[#D6001C] text-[10px] font-bold">
                      {prog.category === 'rescue' ? 'جستجو و نجات' : prog.category === 'medical' ? 'تیم درمان' : 'پشتیبانی لجستیک'}
                    </span>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">
                      {language === 'fa' ? prog.titleFa : prog.titleEn}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-neutral-400">
                      <strong>شرایط:</strong> {language === 'fa' ? prog.requirementsFa : prog.requirementsEn}
                    </p>
                    <div className="text-xs text-slate-500 dark:text-neutral-400">
                      <strong>مکان دوره:</strong> {prog.locationFa}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedVolunteerProgram(prog)}
                    className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-neutral-800 hover:bg-[#D6001C] text-white font-bold text-xs transition-colors"
                  >
                    ثبت درخواست عضویت
                  </button>
                </div>
              ))}
            </div>

            {/* Volunteer Signup Modal */}
            {selectedVolunteerProgram && (
              <div className="p-6 rounded-2xl bg-slate-100 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    ثبت‌نام داوطلب در: {selectedVolunteerProgram.titleFa}
                  </h4>
                  <button
                    onClick={() => setSelectedVolunteerProgram(null)}
                    className="text-xs text-slate-500"
                  >
                    بستن
                  </button>
                </div>

                {volunteerSuccess ? (
                  <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold text-center">
                    درخواست عضویت شما با موفقیت ثبت شد. کارشناسان هلال احمر با شما تماس خواهند گرفت.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                        شماره تماس
                      </label>
                      <input
                        type="tel"
                        value={volunteerPhone}
                        onChange={(e) => setVolunteerPhone(e.target.value)}
                        placeholder="09121112233"
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                        شهر محل سکونت
                      </label>
                      <input
                        type="text"
                        value={volunteerCity}
                        onChange={(e) => setVolunteerCity(e.target.value)}
                        placeholder="کرمانشاه"
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl text-xs"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => {
                          setVolunteerSuccess(true);
                          setTimeout(() => {
                            setVolunteerSuccess(false);
                            setSelectedVolunteerProgram(null);
                          }, 2000);
                        }}
                        className="w-full py-2.5 rounded-xl bg-[#D6001C] text-white font-bold text-xs shadow-md"
                      >
                        تأیید و ارسال رزومه
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* List of Registered Active Volunteers Table (#35) */}
            <div className="pt-6 border-t border-slate-100 dark:border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-red-600" />
                    <span>لیست داوطلبان فعال و افتخاری هلال احمر</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">
                    اسامی و تخصص نیروهای آموزش‌دیده داوطلب آماده اعزام به مناطق بحرانی
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-[#D6001C] font-extrabold text-xs">
                  مجموع: ۱,۴۸۰ داوطلب فعال
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-neutral-800">
                <table className="w-full text-right text-xs text-slate-700 dark:text-neutral-200">
                  <thead className="bg-slate-100 dark:bg-neutral-900 text-slate-900 dark:text-white font-extrabold uppercase text-[11px] border-b border-slate-200 dark:border-neutral-800">
                    <tr>
                      <th className="p-3">کد داوطلبی</th>
                      <th className="p-3">نام و نام خانوادگی</th>
                      <th className="p-3">استان / استان محل خدمت</th>
                      <th className="p-3">رسته و تخصص تخصصی</th>
                      <th className="p-3">درجه اعطایی</th>
                      <th className="p-3 text-center">وضعیت آمادگی</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/60">
                    {[
                      { code: 'VOL-9821', name: 'رضا کرمی', city: 'کرمانشاه', skill: 'نجات در کوهستان و راپل', grade: 'ایثارگر درجه ۱', status: 'ready' },
                      { code: 'VOL-7714', name: 'سارا احمدی', city: 'تهران', skill: 'پرستاری و کمک‌های اولیه فوری', grade: 'امدادگر ارشد', status: 'ready' },
                      { code: 'VOL-3390', name: 'مهدی حسینی', city: 'لرستان (خرم‌آباد)', skill: 'راننده سنگین و اپراتور لجستیک', grade: 'نجات‌گر ۲', status: 'deployed' },
                      { code: 'VOL-1102', name: 'زهرا کاظمی', city: 'مازندران (ساری)', skill: 'مربی سگ‌های زنده‌یاب (K9)', grade: 'ایثارگر درجه ۲', status: 'ready' },
                      { code: 'VOL-4458', name: 'امیرحسین عباسی', city: 'خوزستان (اهواز)', skill: 'غواصی و امداد سیلاب', grade: 'نجات‌گر ۱', status: 'deployed' },
                    ].map((row) => (
                      <tr key={row.code} className="hover:bg-slate-50 dark:hover:bg-neutral-900/50 transition-colors">
                        <td className="p-3 font-mono font-bold text-red-600 dark:text-red-400">{row.code}</td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{row.name}</td>
                        <td className="p-3">{row.city}</td>
                        <td className="p-3">{row.skill}</td>
                        <td className="p-3 font-semibold text-slate-600 dark:text-neutral-300">{row.grade}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            row.status === 'ready'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                          }`}>
                            {row.status === 'ready' ? 'آماده اعزام ✅' : 'مستقر در عملیات 🚁'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: NEWS & URGENT ALERTS - NEWSPAPER FRONT PAGE (#36) */}
        {activeTab === 'news' && (
          <div className="bg-amber-50/40 dark:bg-[#121212] border-2 border-slate-300 dark:border-neutral-800 rounded-2xl p-6 lg:p-8 shadow-md space-y-6 font-serif">
            {/* Newspaper Front Page Masthead */}
            <div className="text-center border-b-4 border-double border-slate-800 dark:border-neutral-700 pb-4 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 dark:text-neutral-400 border-b border-slate-200 dark:border-neutral-800 pb-1 mb-2">
                <span>سال چهل و پنجم - شماره ۱۲,۸۴۰</span>
                <span className="font-bold text-red-600 dark:text-red-400">روزنامه پیام امداد (نشریه رسمی هلال احمر)</span>
                <span>{new Date().toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <h3 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                خبرنامه و هشدارهای ستاد بحران
              </h3>
              <p className="text-xs font-sans text-slate-500 dark:text-neutral-400">
                آخرین اخبار عملیات‌های نجات، هشدارهای هواشناسی و اطلاعیه‌های رسمی جمعیت هلال احمر
              </p>
            </div>

            {/* Newspaper Ticker / Ticker Strip */}
            <div className="bg-red-600 text-white p-2.5 rounded-xl font-sans text-xs font-bold flex items-center gap-2 overflow-hidden shadow-xs">
              <span className="bg-white text-red-700 px-2 py-0.5 rounded-md font-mono shrink-0 animate-pulse">
                🚨 خبر فوری
              </span>
              <p className="truncate">
                اعزام ۲۰ تیم واکنش سریع به مناطق متاثر از بارندگی‌های شدید در غرب کشور / آماده‌باش کامل ۱۱۲ در تمام استان‌ها
              </p>
            </div>

            {/* Main Newspaper Grid: Lead Story + Sidebar Articles */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2">
              {/* Lead Article (2 columns wide) */}
              <div className="lg:col-span-2 space-y-4 border-l-0 lg:border-l lg:border-slate-200 dark:lg:border-neutral-800 pl-0 lg:pl-6">
                <div className="relative h-64 rounded-xl overflow-hidden border border-slate-200 dark:border-neutral-800">
                  <img
                    src="https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?q=80&w=1000&auto=format&fit=crop"
                    alt="امدادرسانی هلال احمر"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 to-transparent text-white text-xs font-sans">
                    عکس روز: امدادگران جمعیت هلال احمر در حال توزیع اقلام زیستی بین متاثرین از حادثه
                  </div>
                </div>

                <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-snug">
                  تیتر اول: آمادگی ۱۰۰ درصدی پایگاه‌های امداد جاده‌ای و هوایی برای مواجهه با مخاطرات جوی
                </h4>

                <p className="text-xs lg:text-sm font-sans text-slate-700 dark:text-neutral-300 leading-relaxed text-justify">
                  رییس سازمان امداد و نجات جمعیت هلال احمر در گفتگو با روزنامه پیام امداد اعلام کرد: کلیه فروند بالگردهای امدادی، سیستم‌های راداری پایش انبارها و ناوگان سنگین در استان‌های غرب و جنوب غربی کشور در حالت آماده‌باش سرخ قرار گرفتند. هم‌وطنان عزیز می‌توانند در صورت بروز هرگونه حادثه با شماره ۱۱۲ تماس حاصل فرمایند.
                </p>
              </div>

              {/* Sidebar Warnings Column */}
              <div className="space-y-6 font-sans">
                <h5 className="font-extrabold text-sm text-slate-900 dark:text-white pb-2 border-b-2 border-red-600 flex items-center justify-between">
                  <span>هشدارهای رسمی زنده</span>
                  <Bell className="w-4 h-4 text-red-600" />
                </h5>

                <div className="space-y-4">
                  {EMERGENCY_ALERT_NOTICES.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-4 rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-2"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-red-600 dark:text-red-400">
                          {alert.severity === 'critical' ? '🚨 هشدار سرخ' : '⚠️ هشدار نارنجی'}
                        </span>
                        <span className="text-slate-400 font-mono">
                          {new Date(alert.publishedAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h6 className="font-extrabold text-xs text-slate-900 dark:text-white">
                        {language === 'fa' ? alert.titleFa : alert.titleEn}
                      </h6>
                      <p className="text-[11px] text-slate-600 dark:text-neutral-400 leading-relaxed">
                        {language === 'fa' ? alert.contentFa : alert.contentEn}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: FIRST AID EDUCATION */}
        {activeTab === 'firstaid' && (
          <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 lg:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-neutral-800">
              <BookOpen className="w-6 h-6 text-[#D6001C]" />
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {getTranslation(language, 'public_tab_firstaid')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  آموزش‌های کاربردی احیای قلبی ریوی، کنترل خونریزی و پناه‌گیری زلزله
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {FIRST_AID_ARTICLES.map((article) => (
                <div
                  key={article.id}
                  className="p-6 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">
                      {language === 'fa' ? article.titleFa : article.titleEn}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                      {language === 'fa' ? article.summaryFa : article.summaryEn}
                    </p>

                    <div className="p-3 rounded-xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 space-y-2">
                      <div className="text-xs font-bold text-[#D6001C]">مراحل اجرایی:</div>
                      <ol className="list-decimal list-inside text-[11px] text-slate-700 dark:text-neutral-300 space-y-1">
                        {(language === 'fa' ? article.stepsFa : article.stepsEn).map((st, i) => (
                          <li key={i}>{st}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 9.5: EDUCATIONAL COURSES (12 COURSES) */}
        {activeTab === 'courses' && (
          <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 lg:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950/60 text-[#D6001C]">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    دوره‌های آموزشی تخصصی و همگانی هلال احمر (۱۲ دوره)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">
                    آموزش‌های رسمی خودامدادی، دادرسی، نجات کوهستان و ارتقای تاب‌آوری با مدرک معتبر
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/50 text-[#D6001C] border border-red-200 dark:border-red-900/50 text-xs font-bold">
                ۱۲ دوره فعال
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {EDUCATIONAL_COURSES.map((course) => (
                <div
                  key={course.id}
                  className="p-6 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 hover:border-[#D6001C] transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div className="space-y-4">
                    {course.imageUrl && (
                      <div className="h-36 -mx-6 -mt-6 mb-3 overflow-hidden relative">
                        <img
                          src={course.imageUrl}
                          alt={course.titleFa}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-red-100 dark:bg-red-950/60 text-[#D6001C] font-bold text-[10px]">
                        {course.levelFa}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-neutral-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>{course.durationHours} ساعت آموزش</span>
                      </span>
                    </div>

                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug">
                      {course.titleFa}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                      {course.descriptionFa}
                    </p>

                    <div className="text-[11px] text-slate-500 dark:text-neutral-400 border-t border-slate-200 dark:border-neutral-800 pt-2">
                      👨‍🏫 <strong>مدرس:</strong> {course.instructorFa}
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 space-y-1.5">
                      <div className="text-[11px] font-bold text-[#D6001C]">سرفصل‌های آموزشی:</div>
                      <ul className="space-y-1 text-[11px] text-slate-700 dark:text-neutral-300">
                        {course.topicsFa.map((top, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D6001C]" />
                            <span>{top}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-200 dark:border-neutral-800 flex items-center justify-between gap-2">
                    <div className="text-[11px] text-slate-500 dark:text-neutral-400">
                      👥 <strong>{course.enrolledCount.toLocaleString()}</strong> فراگیر
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCourseForRegistration(course);
                        setCourseRegistrationSuccess(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#D6001C] hover:bg-[#b50017] text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>ثبت‌نام رایگان</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 10: REQUESTS & TICKET SUBMISSION (#38) */}
        {activeTab === 'track' && (
          <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 lg:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-neutral-800 gap-4">
              <div className="flex items-center gap-3">
                <Search className="w-6 h-6 text-[#D6001C]" />
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    درخواست‌ها و پشتیبانی هلال احمر
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">
                    ارسال تیکت پشتیبانی، پیگیری با کد رهگیری و دریافت پاسخ از کارشناسان امداد
                  </p>
                </div>
              </div>

              {/* Sub-tab switcher: Submit Ticket vs Track Request (#38) */}
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-neutral-800 p-1 rounded-xl">
                <button
                  onClick={() => setRequestSubTab('ticket')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                    requestSubTab === 'ticket'
                      ? 'bg-[#D6001C] text-white shadow-sm'
                      : 'text-slate-700 dark:text-neutral-300 hover:text-slate-900'
                  }`}
                >
                  📩 ارسال تیکت جدید
                </button>
                <button
                  onClick={() => setRequestSubTab('track')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                    requestSubTab === 'track'
                      ? 'bg-[#D6001C] text-white shadow-sm'
                      : 'text-slate-700 dark:text-neutral-300 hover:text-slate-900'
                  }`}
                >
                  🔍 رهگیری با کد پیگیری
                </button>
              </div>
            </div>

            {/* Sub-tab 1: Submit Support Ticket */}
            {requestSubTab === 'ticket' && (
              <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-4">
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                  فرم ثبت تیکت و پیام پشتیبانی
                </h4>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  جهت پیگیری امور غیرضروری، پیشنهادها، انتقادات و استعلام وضعیت خدمات، تیکت خود را ثبت نمایید.
                </p>

                {ticketSuccess ? (
                  <div className="p-4 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold text-center">
                    تیکت شما با شماره پیگیری TCK-40912 ثبت گردید. پاسخ کارشناسان به شماره همراه شما پیامک خواهد شد.
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setTicketSuccess(true);
                      setTimeout(() => {
                        setTicketSuccess(false);
                        setTicketSubject('');
                        setTicketMessage('');
                      }, 3000);
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-neutral-300 mb-1">
                        موضوع تیکت *
                      </label>
                      <input
                        type="text"
                        required
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        placeholder="مثال: درخواست تجهیزات در درمانگاه سرپل ذهاب"
                        className="w-full px-3 py-2.5 bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-neutral-300 mb-1">
                        متن پیام و توضیحات کامل *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={ticketMessage}
                        onChange={(e) => setTicketMessage(e.target.value)}
                        placeholder="مشخصات و جزییات درخواست خود را بنویسید..."
                        className="w-full px-3 py-2.5 bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-[#D6001C] hover:bg-[#b50017] text-white font-bold text-xs shadow-md transition"
                    >
                      ارسال تیکت به پشتیبانی مرکزی هلال احمر
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Sub-tab 2: Search Box & Request Tracker */}
            {requestSubTab === 'track' && (
              <>
                <form onSubmit={handleTrackSearch} className="max-w-xl mx-auto space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchTrackingCode}
                  onChange={(e) => setSearchTrackingCode(e.target.value)}
                  placeholder="مثال: RC-REQ-48210"
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-sm font-mono font-bold focus:outline-none focus:border-[#D6001C]"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-[#D6001C] hover:bg-[#b50017] text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>پیگیری</span>
                </button>
              </div>

              {trackingError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-xs text-center font-medium">
                  {trackingError}
                </div>
              )}
            </form>

            {/* Search Result Display */}
            {foundRequest && (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 max-w-2xl mx-auto space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-neutral-800">
                  <div>
                    <span className="text-xs text-slate-500 dark:text-neutral-400">کد رهگیری درخواست:</span>
                    <h4 className="font-mono text-xl font-black text-[#D6001C]">
                      {foundRequest.trackingCode}
                    </h4>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                    {foundRequest.status === 'dispatched'
                      ? 'تیم امداد اعزام شد 🚨'
                      : foundRequest.status === 'pending'
                      ? 'در صف ارزیابی'
                      : 'تحت اقدام مرکز فرماندهی'}
                  </span>
                </div>

                {/* Status Timeline */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-700 dark:text-neutral-300">
                    مراحل پیشرفت امدادرسانی:
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                    <div className="p-2 rounded-lg bg-emerald-600 text-white">۱. ثبت درخواست</div>
                    <div className="p-2 rounded-lg bg-emerald-600 text-white">۲. ارزیابی ستاد</div>
                    <div className="p-2 rounded-lg bg-red-600 text-white animate-pulse">۳. اعزام تیم</div>
                    <div className="p-2 rounded-lg bg-slate-200 dark:bg-neutral-800 text-slate-500">۴. اتمام عملیات</div>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-neutral-400 pt-2 border-t border-slate-200 dark:border-neutral-800">
                  <div><strong>نوع حادثه:</strong> {foundRequest.incidentType}</div>
                  <div><strong>آدرس:</strong> {foundRequest.address}</div>
                  <div><strong>توضیحات:</strong> {foundRequest.description}</div>
                </div>
              </div>
            )}
            </>
            )}
          </div>
        )}

        {/* TAB 11: USER PROFILE */}
        {activeTab === 'profile' && (
          <UserProfileTab
            language={language}
            user={user}
            userRole="citizen"
            consoleType="public"
          />
        )}
      </main>

      {/* Footer with Public Emergency Hotline Numbers */}
      <Footer language={language} showEmergencyNumbers={true} />

      {/* Course Free Registration Modal Dialog */}
      {selectedCourseForRegistration && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => {
                setSelectedCourseForRegistration(null);
                setCourseRegistrationSuccess(false);
              }}
              className="absolute top-4 left-4 p-2 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-neutral-800 pb-3">
              <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950/60 text-[#D6001C]">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                  ثبت‌نام رایگان در دوره آموزشی هلال احمر
                </h4>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  {selectedCourseForRegistration.titleFa}
                </p>
              </div>
            </div>

            {courseRegistrationSuccess ? (
              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-xl font-black">
                  ✓
                </div>
                <h5 className="font-extrabold text-base text-emerald-900 dark:text-emerald-200">
                  ثبت‌نام شما با موفقیت ثبت گردید!
                </h5>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                  کارت ورود به کلاس برای <strong>{courseStudentName || 'فراگیر محترم'}</strong> صادر شد. زمان دقیق شروع کلاس‌ها به شماره {coursePhone || 'همراه شما'} پیامک می‌شود.
                </p>
                <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-emerald-300 dark:border-emerald-800 text-right space-y-1 text-xs">
                  <div>کد پیگیری ثبت‌نام: <strong className="font-mono text-red-600">CRS-884210</strong></div>
                  <div>عنوان دوره: {selectedCourseForRegistration.titleFa}</div>
                  <div>محل برگزاری: شعب هلال احمر استان {courseCity}</div>
                  <div>مدت دوره: {selectedCourseForRegistration.durationHours} ساعت | اعطای گواهینامه رسمی</div>
                </div>
                <button
                  onClick={() => {
                    setSelectedCourseForRegistration(null);
                    setCourseRegistrationSuccess(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  بستن و دریافت کارت دیجیتال
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setCourseRegistrationSuccess(true);
                }}
                className="space-y-4 text-xs"
              >
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    نام دوره: {selectedCourseForRegistration.titleFa}
                  </div>
                  <div className="text-slate-500 dark:text-neutral-400">
                    ⏱ {selectedCourseForRegistration.durationHours} ساعت آموزش | 👨‍🏫 مدرس: {selectedCourseForRegistration.instructorFa}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-neutral-300 mb-1">
                    نام و نام خانوادگی فراگیر *
                  </label>
                  <input
                    type="text"
                    required
                    value={courseStudentName}
                    onChange={(e) => setCourseStudentName(e.target.value)}
                    placeholder="مثال: علی رضایی"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-neutral-300 mb-1">
                      کد ملی *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={courseNationalCode}
                      onChange={(e) => setCourseNationalCode(e.target.value)}
                      placeholder="0012345678"
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-neutral-300 mb-1">
                      شماره تلفن همراه *
                    </label>
                    <input
                      type="tel"
                      required
                      value={coursePhone}
                      onChange={(e) => setCoursePhone(e.target.value)}
                      placeholder="09123456789"
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-neutral-300 mb-1">
                      استان / شهر محل سکونت *
                    </label>
                    <input
                      type="text"
                      required
                      value={courseCity}
                      onChange={(e) => setCourseCity(e.target.value)}
                      placeholder="تهران"
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-neutral-300 mb-1">
                      شیوه شرکت در کلاس *
                    </label>
                    <select
                      value={courseType}
                      onChange={(e) => setCourseType(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl font-bold text-slate-900 dark:text-white"
                    >
                      <option value="in_person">حضوری در مرکز هلال احمر</option>
                      <option value="online">آنلاین و الکترونیکی</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#D6001C] hover:bg-[#b50017] text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تایید و ثبت‌نام نهایی رایگان</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Floating AI Chatbot Button */}
      {onOpenChatbot && (
        <button
          onClick={onOpenChatbot}
          className="fixed bottom-6 right-6 z-40 bg-[#D6001C] hover:bg-[#b80018] text-white p-4 rounded-full shadow-2xl flex items-center gap-2.5 font-bold transition-transform hover:scale-105 active:scale-95"
          title="دستیار هوشمند هلال احمر / AI Assistant"
        >
          <Bot className="w-6 h-6" />
          <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">
            {language === 'fa' ? 'دستیار AI' : language === 'ar' ? 'المساعد' : 'AI Chat'}
          </span>
        </button>
      )}
    </div>
  );
};
