import {
  DisasterEvent,
  DisasterIncident,
  EmergencyRequest,
  Warehouse,
  AffectedArea,
  ShelterCandidate,
  TransportVehicle,
  HelicopterAircraft,
  RoadNode,
  RoadEdge,
  ReliefItem,
  LpSolverParameters,
  GaParameters,
  DisasterScenario,
  AuditLogEntry,
  FacilityInfo,
  EmergencyNumberItem,
  BloodDonationCenter,
  DonationCampaign,
  VolunteerProgram,
  EmergencyAlertNotice,
  FirstAidArticle,
  EducationalCourse,
} from '../types';

export const INITIAL_RELIEF_ITEMS: ReliefItem[] = [
  { id: 'item_tent', nameFa: 'چادر امدادی ۴×۳ اسکلتی', nameEn: 'Relief Tent (4x3m)', category: 'shelter', unit: 'تخته', unitWeightKg: 45, unitVolumeM3: 0.35, requiresColdChain: false, shortagePenaltyWeight: 1500 },
  { id: 'item_blanket', nameFa: 'پتو نمدی حرارتی', nameEn: 'Thermal Blanket', category: 'bedding', unit: 'تخته', unitWeightKg: 2.5, unitVolumeM3: 0.02, requiresColdChain: false, shortagePenaltyWeight: 800 },
  { id: 'item_food_pack', nameFa: 'بسته غذایی ۷۲ ساعته', nameEn: '72hr Food Pack', category: 'food', unit: 'بسته', unitWeightKg: 12, unitVolumeM3: 0.05, requiresColdChain: false, shelfLifeDays: 365, shortagePenaltyWeight: 2200 },
  { id: 'item_medical_kit', nameFa: 'کیت دارویی و ترومای اضطراری', nameEn: 'Emergency Trauma Kit', category: 'medical', unit: 'کیت', unitWeightKg: 8, unitVolumeM3: 0.03, requiresColdChain: true, shelfLifeDays: 180, shortagePenaltyWeight: 5000 },
  { id: 'item_water_purifier', nameFa: 'دستگاه تصفیه آب و گالن ۱۰L', nameEn: 'Water Filter & 10L Canister', category: 'general', unit: 'دستگاه', unitWeightKg: 3.2, unitVolumeM3: 0.015, requiresColdChain: false, shortagePenaltyWeight: 1800 },
  { id: 'item_hygiene_kit', nameFa: 'پک بهداشتی خانواده', nameEn: 'Family Hygiene Pack', category: 'general', unit: 'پک', unitWeightKg: 5, unitVolumeM3: 0.025, requiresColdChain: false, shortagePenaltyWeight: 1200 },
];

const CITIES = ['تهران', 'مشهد', 'اصفهان', 'کرج', 'شیراز', 'تبریز', 'قم', 'اهواز', 'کرمانشاه', 'ارومیه'];

// EXACTLY 10 WAREHOUSES
export const INITIAL_WAREHOUSES: Warehouse[] = CITIES.map((city, i) => ({
  id: `wh_${i + 1}`,
  nameFa: `انبار لجستیک و امداد هلال احمر ${city}`,
  nameEn: `${city} Central Warehouse Hub`,
  code: `WH-0${i + 1}`,
  lat: Number((32.0 + (i % 5) * 1.4).toFixed(3)),
  lng: Number((51.0 + Math.floor(i / 5) * 3.0).toFixed(3)),
  city,
  capacityM3: 12000 + i * 500,
  usedM3: 5000 + i * 300,
  isAvailable: true,
  damageStatus: i === 8 ? 'partially_damaged' : 'operational',
  hasColdChain: i % 2 === 0,
  inventory: {
    item_tent: 1500 + i * 100,
    item_blanket: 8000 + i * 200,
    item_food_pack: 6000 + i * 150,
    item_medical_kit: 1200 + i * 50,
    item_water_purifier: 900 + i * 40,
    item_hygiene_kit: 2000 + i * 80,
  },
}));

// EXACTLY 10 AFFECTED AREAS
export const INITIAL_AFFECTED_AREAS: AffectedArea[] = CITIES.map((city, i) => ({
  id: `area_${i + 1}`,
  nameFa: `${city} - منطقه بحرانی و آسیب‌دیده ${i + 1}`,
  nameEn: `${city} Disaster Impact Zone ${i + 1}`,
  code: `AREA-0${i + 1}`,
  lat: Number((32.2 + (i % 5) * 1.3).toFixed(3)),
  lng: Number((51.2 + Math.floor(i / 5) * 2.9).toFixed(3)),
  population: 8000 + i * 1000,
  vulnerabilityIndex: Number((3.5 + (i % 4) * 0.4).toFixed(1)),
  priorityMultiplier: Number((1.2 + (i % 3) * 0.3).toFixed(1)),
  demands: {
    item_tent: 400 + i * 30,
    item_blanket: 2000 + i * 100,
    item_food_pack: 1500 + i * 80,
    item_medical_kit: 300 + i * 20,
    item_water_purifier: 350 + i * 25,
    item_hygiene_kit: 500 + i * 35,
  },
  minServiceLevel: 0.8,
  responseDeadlineHours: 6 + (i % 6),
}));

// EXACTLY 10 SHELTERS
export const INITIAL_SHELTERS: ShelterCandidate[] = CITIES.map((city, i) => ({
  id: `shelter_${i + 1}`,
  nameFa: `کمپ اسکان اضطراری هلال ${city}`,
  nameEn: `${city} Emergency Shelter Camp`,
  lat: Number((32.1 + (i % 5) * 1.35).toFixed(3)),
  lng: Number((51.1 + Math.floor(i / 5) * 2.95).toFixed(3)),
  capacityPeople: 4000 + i * 500,
  currentOccupancy: 1200 + i * 200,
  activationCost: 6000 + i * 400,
  floodRiskScore: (i % 3) + 1,
  structuralSafetyScore: 8,
  hasHelicopterLandingZone: i % 2 === 0,
  isActivated: true,
  assignedAreaIds: [`area_${i + 1}`],
}));

// EXACTLY 10 FLEET VEHICLES
export const INITIAL_VEHICLES: TransportVehicle[] = CITIES.map((city, i) => ({
  id: `veh_${i + 1}`,
  name: `کامیون سنگین ترابری هلال ${city} (کد ${i + 1})`,
  type: i % 3 === 0 ? 'heavy_truck' : i % 2 === 0 ? 'medium_truck' : 'light_van',
  plateNumber: `${24 + i} ج ${210 + i} - ایران ${33 + i}`,
  capacityWeightKg: 4000 + i * 500,
  capacityVolumeM3: 15 + i,
  hasColdChain: i % 2 === 0,
  maxRangeKm: 500,
  status: 'available',
  currentLat: Number((32.0 + (i % 5) * 1.4).toFixed(3)),
  currentLng: Number((51.0 + Math.floor(i / 5) * 3.0).toFixed(3)),
}));

// EXACTLY 10 HELICOPTERS
export const INITIAL_HELICOPTERS: HelicopterAircraft[] = CITIES.map((city, i) => ({
  id: `heli_${i + 1}`,
  name: `بالگرد سنگین امداد و نجات هلال ${city}`,
  callsign: `RESCUE-0${i + 1}`,
  model: i % 2 === 0 ? 'Mi-17V5 Heavy Transport' : 'Bell 212 Twin',
  maxPayloadKg: 2000 + i * 150,
  maxRangeKm: 450 + i * 10,
  currentFuelPercent: 85 + (i % 15),
  weatherGated: false,
  status: 'ready',
  homeBaseLat: Number((32.0 + (i % 5) * 1.4).toFixed(3)),
  homeBaseLng: Number((51.0 + Math.floor(i / 5) * 3.0).toFixed(3)),
}));

export const INITIAL_DISASTER: DisasterEvent = {
  id: 'disaster_iran_national_2026',
  title: 'شبکه ملی امداد، نجات و پاسخ به بحران هلال احمر جمهوری اسلامی ایران',
  type: 'earthquake',
  region: 'پوشش کامل کلان‌شهرها و شهرهای اصلی کشور',
  status: 'active',
  declaredAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  affectedPopulation: 140000,
  severityScore: 8.5,
  emergencyMode: true,
  description: 'سامانه هوشمند پایش و تخصیص لجستیک امدادی (LP)، مسیریابی خودکار (GA) و پردازش هوشمند زنده.',
};

export const INITIAL_INCIDENTS: DisasterIncident[] = [
  { id: 'inc_01', disasterId: 'disaster_iran_national_2026', title: 'زلزله و تخریب سازه‌ای در مناطق شهری', locationName: 'سرپل ذهاب و غرب', lat: 34.46, lng: 45.86, affectedCount: 14500, priority: 'critical', requestsCount: 42, status: 'active' },
  { id: 'inc_02', disasterId: 'disaster_iran_national_2026', title: 'سیلاب و طغیان رودخانه‌ها در جنوب کشور', locationName: 'چابهار و بلوچستان', lat: 25.29, lng: 60.64, affectedCount: 11200, priority: 'high', requestsCount: 28, status: 'active' },
];

// EXACTLY 10 CITIZEN EMERGENCY REQUESTS
export const INITIAL_EMERGENCY_REQUESTS: EmergencyRequest[] = CITIES.map((city, i) => ({
  id: `req_${i + 1}`,
  trackingId: `RC-REQ-98${10 + i}`,
  incidentType: i % 2 === 0 ? 'تخریب ساختمانی و نیاز به آواربرداری' : 'کمبود شدید چادر، غذا و دارو',
  reporterName: `شهروند ${city} (${i + 1})`,
  phone: `0912${1000000 + (i + 1) * 3333}`,
  lat: Number((32.0 + (i % 5) * 1.3).toFixed(3)),
  lng: Number((51.0 + Math.floor(i / 5) * 2.8).toFixed(3)),
  address: `استان ${city}، بخش مرکزی، خیابان امام، پلاک ${i + 10}`,
  affectedCount: 3 + i,
  hasInjuries: i % 2 === 0,
  medicalNeeds: i % 2 === 0 ? 'نیاز فوری به سرم، باند و پانسمان' : 'نیاز به داروهای عمومی',
  immediateDanger: i % 3 === 0,
  priority: i % 3 === 0 ? 'critical' : 'high',
  status: i % 4 === 0 ? 'resolved' : 'in_progress',
  createdAt: new Date(Date.now() - 3600000 * (i + 1)).toISOString(),
}));

// EXACTLY 10 ROAD NODES
export const INITIAL_ROAD_NODES: RoadNode[] = CITIES.map((city, i) => ({
  id: `node_${i + 1}`,
  nameFa: `گره ترانزیتی و شریانی ${city}`,
  nameEn: `${city} Strategic Highway Node`,
  lat: Number((32.0 + (i % 5) * 1.4).toFixed(3)),
  lng: Number((51.0 + Math.floor(i / 5) * 3.0).toFixed(3)),
  type: i % 3 === 0 ? 'warehouse' : i % 2 === 0 ? 'shelter' : 'junction',
}));

// EXACTLY 10 ROAD EDGES
export const INITIAL_ROAD_EDGES: RoadEdge[] = Array.from({ length: 10 }, (_, i) => ({
  id: `edge_${i + 1}`,
  fromNodeId: `node_${i + 1}`,
  toNodeId: `node_${((i + 1) % 10) + 1}`,
  distanceKm: 45 + i * 12,
  estimatedMinutes: 35 + i * 10,
  status: i % 4 === 0 ? 'blocked' : 'open',
  riskScore: Number((1.1 + (i % 3) * 0.8).toFixed(1)),
}));

// EXACTLY 10 SCENARIOS
export const INITIAL_SCENARIOS: DisasterScenario[] = CITIES.map((city, i) => ({
  id: `scen_${i + 1}`,
  nameFa: `سناریوی زلزله و بحران جاده‌ای در ${city}`,
  nameEn: `Earthquake & Logistics Crisis in ${city}`,
  descriptionFa: `شبیه‌سازی حوادث غیرمترقبه و افت تخصیص در محورهای اصلی ${city}`,
  descriptionEn: `Disaster simulation with route disruptions near ${city}`,
  blockedEdgeIds: [`edge_${(i % 10) + 1}`],
  lpParams: { modelMode: 'advanced', budgetMax: 40000000 + i * 2000000 },
  gaParams: { populationSize: 80, maxGenerations: 120 },
}));

// EXACTLY 10 AUDIT LOGS
export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = CITIES.map((city, i) => ({
  id: `aud_${i + 1}`,
  timestamp: new Date(Date.now() - 1800000 * (i + 1)).toISOString(),
  userId: `usr_${i + 1}`,
  userName: `اپراتور ستاد بحران ${city}`,
  userRole: i % 2 === 0 ? 'manager' : 'admin',
  actionFa: `اجرای الگوریتم بهینه‌سازی و بررسی انبار ${city}`,
  actionEn: `Ran optimization solver & inspected warehouse in ${city}`,
  details: `LP Status: Optimal, GA Route Fitness score updated.`,
}));

export const DEFAULT_LP_PARAMS: LpSolverParameters = {
  modelMode: 'advanced',
  budgetMax: 100000000,
  fairnessMaxGap: 0.15,
  priorityWeights: { transportCost: 0.3, unmetShortage: 0.4, routeActivation: 0.15, fairnessPenalty: 0.15 },
  itemPenalties: { item_tent: 1500, item_medical_kit: 5000 },
  warehouseAvailability: {},
};

export const DEFAULT_GA_PARAMS: GaParameters = {
  populationSize: 80,
  maxGenerations: 120,
  crossoverRate: 0.8,
  mutationRate: 0.1,
  tournamentSize: 4,
  elitismPercent: 0.05,
  crisisModePreset: true,
  weights: { facilityCost: 0.25, routingCost: 0.35, riskExposure: 0.2, latenessPenalty: 0.1, coverageReward: 0.1 },
};

// EXACTLY 10 PUBLIC FACILITIES
export const PUBLIC_FACILITIES: FacilityInfo[] = CITIES.map((city, i) => ({
  id: `fac_${i + 1}`,
  nameFa: `مرکز اصلی امداد و نجات هلال احمر ${city}`,
  nameEn: `${city} Main Red Crescent Center`,
  nameAr: `مركز الهلال الأحمر في ${city}`,
  type: 'station',
  cityFa: city,
  cityEn: city,
  cityAr: city,
  addressFa: `${city}، خیابان هلال احمر، مجتمع مرکزی شماره ${i + 1}`,
  addressEn: `${city}, Red Crescent St, Central Complex No ${i + 1}`,
  addressAr: `${city} شارع الهلال الأحمر`,
  phone: `0${21 + (i % 70)}-8877${1000 + i}`,
  lat: Number((32.0 + (i % 5) * 1.4).toFixed(3)),
  lng: Number((51.0 + Math.floor(i / 5) * 3.0).toFixed(3)),
  openHours: '۲۴ ساعته شبانه‌روزی',
}));

// EXACTLY 10 BLOOD DONATION CENTERS
export const BLOOD_DONATION_CENTERS: BloodDonationCenter[] = CITIES.map((city, i) => ({
  id: `blood_${i + 1}`,
  nameFa: `مرکز اصلی اهدا و انتقال خون ${city}`,
  nameEn: `${city} Blood Donation Hub`,
  nameAr: `مركز نقل الدم في ${city}`,
  cityFa: city,
  cityEn: city,
  cityAr: city,
  addressFa: `${city}، خیابان پاسداران، ساختمان انتقال خون`,
  addressEn: `${city}, Pasdaran St, Blood Center`,
  addressAr: `${city} شارع پاسداران`,
  phone: `0${21 + (i % 50)}-2200${1000 + i}`,
  operatingHoursFa: '۸ صبح الی ۸ شب',
  operatingHoursEn: '8 AM - 8 PM',
  operatingHoursAr: '۸ صباحا - ۸ مساء',
  urgentNeeds: ['O-', 'A-', 'AB-', 'O+'],
  lat: Number((32.1 + (i % 5) * 1.4).toFixed(3)),
  lng: Number((51.1 + Math.floor(i / 5) * 3.0).toFixed(3)),
}));

// EXACTLY 10 FIRST AID ARTICLES WITH IMAGES
export const FIRST_AID_ARTICLES: FirstAidArticle[] = CITIES.map((city, i) => ({
  id: `fa_${i + 1}`,
  titleFa: `دستورالعمل جامع کمک‌های اولیه در ${city} (درس ${i + 1})`,
  titleEn: `First Aid & Disaster Guide ${i + 1}`,
  titleAr: `الإسعافات الأولية ${i + 1}`,
  category: i % 3 === 0 ? 'cpr' : i % 2 === 0 ? 'bleeding' : 'earthquake_safety',
  summaryFa: `روش‌های استاندارد بین‌المللی ارزیابی مصدوم، تثبیت وضعیت و انتقال ایمن به مراکز درمانی.`,
  summaryEn: `Standard international first aid procedures and trauma management.`,
  summaryAr: 'الإجراءات القياسية للإسعافات الأولية.',
  stepsFa: ['ارزیابی محیط و ایمنی', 'بررسی علائم حیاتی', 'تماس سریع با شماره ۱۱۲', 'اقدام فوری تثبیت'],
  stepsEn: ['Check safety', 'Check vitals', 'Call 112', 'Apply first aid'],
  stepsAr: ['فحص السلامة', 'فحص العلامات الحيوية', 'الاتصال برقم ۱۱۲', 'تقديم الإسعافات'],
  imageUrl: [
    'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1583324113626-70df0f4deaab?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80',
  ][i],
}));

// EXACTLY 10 VOLUNTEER PROGRAMS WITH IMAGES
export const VOLUNTEER_PROGRAMS: VolunteerProgram[] = CITIES.map((city, i) => ({
  id: `vol_${i + 1}`,
  nameFa: `پایگاه فراخوان نیروهای داوطلب ${city}`,
  titleFa: `طرح ملی داوطلبان امدادی و اجتماعی ${city}`,
  titleEn: `${city} Volunteer Outreach Program`,
  titleAr: `برنامج المتطوعين في ${city}`,
  category: i % 3 === 0 ? 'rescue' : i % 2 === 0 ? 'medical' : 'social',
  locationFa: `استان ${city} و تمام شهرستان‌های تابعه`,
  locationEn: `Province of ${city} and sub-districts`,
  locationAr: `محافظة ${city}`,
  duration: 'دائمی و پروژه‌ای',
  requirementsFa: 'داشتن کارت ملی و گذراندن دوره پایه امدادگری',
  requirementsEn: 'ID card and basic rescue training',
  requirementsAr: 'الهوية الوطنية وشهادة التدريب',
  imageUrl: [
    'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=600&q=80',
  ][i],
}));

// EXACTLY 10 EMERGENCY ALERT NOTICES
export const EMERGENCY_ALERT_NOTICES: EmergencyAlertNotice[] = CITIES.map((city, i) => ({
  id: `alert_${i + 1}`,
  titleFa: `هشدار مهم هلال احمر برای استان ${city} (اطلاعیه شماره ${i + 1})`,
  titleEn: `Red Crescent Alert Notice for ${city}`,
  titleAr: `تحذير الهلال الأحمر في ${city}`,
  type: i % 3 === 0 ? 'earthquake' : i % 2 === 0 ? 'flood' : 'snow',
  severity: i % 3 === 0 ? 'critical' : 'warning',
  regionFa: `منطقه و حومه ${city}`,
  regionEn: `${city} Metro Area`,
  regionAr: `منطقة ${city}`,
  publishedAt: new Date(Date.now() - 3600000 * (i + 2)).toISOString(),
  contentFa: `پایگاه‌های امدادی در حالت آماده‌باش کامل قرار دارند. لطفا دستورالعمل‌های ایمنی را رعایت فرمایید.`,
  contentEn: `Relief stations are on high alert. Follow safety protocol.`,
  contentAr: `فرق الإغاثة في حالة تأهب قصوى.`,
}));

// EXACTLY 10 EMERGENCY NUMBERS
export const EMERGENCY_NUMBERS: EmergencyNumberItem[] = [
  { id: 'num_112', number: '112', titleFa: 'ندای امداد هلال احمر (تلفن رایگان ۲۴ ساعته)', titleEn: 'Red Crescent Hotline', titleAr: 'طوارئ الهلال الأحمر', descriptionFa: 'پاسخگویی به حوادث جاده‌ای، کوهستان و ززلزل بدون سیم‌کارت', descriptionEn: '24/7 Toll-free rescue service without SIM', descriptionAr: 'طوارئ مجانية بدون شريحة', iconName: 'Siren' },
  { id: 'num_115', number: '115', titleFa: 'اورژانس فوریت‌های پزشکی کشور', titleEn: 'Ambulance & Medical Emergency', titleAr: 'الإسعاف الطبي', descriptionFa: 'خدمات پزشکی اضطراری و اعزام آمبولانس', descriptionEn: 'Medical emergency hotline', descriptionAr: 'خدمة الإسعاف الطبي', iconName: 'Phone' },
  { id: 'num_125', number: '125', titleFa: 'سازمان آتش‌نشانی و خدمات ایمنی', titleEn: 'Fire & Rescue Dept', titleAr: 'الإطفاء والإنقاذ', descriptionFa: 'اطفاء حریق، اتقاء حوادث شهری و امداد سانحه', descriptionEn: 'Fire fighting and rescue operations', descriptionAr: 'خدمة الإطفاء', iconName: 'PhoneCall' },
  { id: 'num_110', number: '110', titleFa: 'فوریت‌های پلیسی و انتظامی', titleEn: 'Police Emergency Line', titleAr: 'الشرطة', descriptionFa: 'برقراری امنیت و گزارش حوادث فوریتی', descriptionEn: 'Police hotline', descriptionAr: 'طوارئ الشرطة', iconName: 'ShieldAlert' },
  { id: 'num_141', number: '141', titleFa: 'مدیریت راه‌ها و وضعیت جاده‌ها', titleEn: 'Road Status Hotline', titleAr: 'حالة الطرق', descriptionFa: 'استعلام زنده وضعیت انسداد و تردد جاده‌های کشور', descriptionEn: 'Highway status report', descriptionAr: 'استعلام حالة الطرق', iconName: 'Navigation' },
  { id: 'num_190', number: '190', titleFa: 'سامانه اطلاعات دارویی و سلامت', titleEn: 'Pharma & Drug Info Line', titleAr: 'معلومات الدواء', descriptionFa: 'استعلام نایاب‌ترین داروها و مشاوره دارویی زنده', descriptionEn: 'Drug availability helpline', descriptionAr: 'معلومات الأدوية', iconName: 'Pill' },
  { id: 'num_1480', number: '1480', titleFa: 'مشاوره روانشناختی بحران و آسیب', titleEn: 'Crisis Psychological Support', titleAr: 'الدعم النفسي', descriptionFa: 'ارائه مشاوره رایگان روحی و روانی در شرایط بحران', descriptionEn: 'Mental health and crisis support', descriptionAr: 'الدعم النفسي للزمات', iconName: 'HeartHandshake' },
  { id: 'num_1504', number: '1504', titleFa: 'یگان حفاظت از منابع طبیعی و جنگل‌ها', titleEn: 'Forest Fire & Nature Protection', titleAr: 'حماية الغابات', descriptionFa: 'گزارش آتش‌سوزی جنگل‌ها و مراتع کشور', descriptionEn: 'Forest fire reporting hotline', descriptionAr: 'الإبلاغ عن حرائق الغابات', iconName: 'Flame' },
  { id: 'num_122', number: '122', titleFa: 'حوادث آب و فاضلاب شهری', titleEn: 'Water & Sewage Emergency', titleAr: 'طوارئ المياه', descriptionFa: 'گزارش شکستگی لوله‌های آب و بحران آبرسانی', descriptionEn: 'Water supply emergency line', descriptionAr: 'طوارئ شبكات المياه', iconName: 'Droplets' },
  { id: 'num_194', number: '194', titleFa: 'حوادث و امداد گاز شهری', titleEn: 'Gas Leak & Emergency Service', titleAr: 'طوارئ الغاز', descriptionFa: 'گزارش نشت گاز و حوادث خطوط لوله', descriptionEn: 'Gas leak emergency helpline', descriptionAr: 'طوارئ تسرب الغاز', iconName: 'Zap' },
];

// EXACTLY 10 DONATION CAMPAIGNS WITH IMAGES
export const DONATION_CAMPAIGNS: DonationCampaign[] = CITIES.map((city, i) => ({
  id: `camp_${i + 1}`,
  titleFa: `پویش ملی مردمی امداد و زلزلزدگان ${city}`,
  titleEn: `Relief Campaign for ${city}`,
  titleAr: `حملة إغاثة ${city}`,
  targetAmountRials: 400000000000 + i * 50000000000,
  collectedAmountRials: 250000000000 + i * 30000000000,
  spentAmountRials: 210000000000 + i * 25000000000,
  supportedRegionsFa: `مناطق شهری و روستایی ${city}`,
  supportedRegionsEn: `Urban and rural districts of ${city}`,
  supportedRegionsAr: `مناطق ${city}`,
  destinationSummaryFa: 'خرید مستقیم چادر، پتو، جیره ۷۲ ساعته و دارو',
  destinationSummaryEn: 'Direct procurement of tents, blankets & medicines',
  destinationSummaryAr: 'شراء الخيام والأدوية',
  donorsCount: 15000 + i * 2500,
  imageUrl: [
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1532629345422-7515f3d16bb0?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1532629345422-7515f3d16bb0?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=600&q=80',
  ][i],
}));

// EXACTLY 10 EDUCATIONAL COURSES WITH IMAGES
export const EDUCATIONAL_COURSES: EducationalCourse[] = [
  { id: 'cour_01', titleFa: 'دوره جامع امداد و کمک‌های اولیه پایه (۸ ساعته)', titleEn: 'Basic First Aid Certification', titleAr: 'الإسعافات الأولية الأساسية', levelFa: 'عمومی و مقدماتی', durationHours: 8, category: 'first_aid', instructorFa: 'دکتر محمدرضا حسینی (مدرس ارشد هلال احمر)', descriptionFa: 'آموزش عملی ارزیابی مصدوم، تنفس مصنوعی، ماساژ قلبی و کنترل خونریزی‌های حاد.', topicsFa: ['ارزیابی اولیه مصدوم', 'روش‌های انسداد راه هوایی', 'ماساژ قلبی CPR', 'پانسمان و آتل‌بندی'], certificateProvided: true, enrolledCount: 12400, imageUrl: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=600&q=80' },
  { id: 'cour_02', titleFa: 'دوره تخصصی آمادگی در برابر زلزله و آواربرداری', titleEn: 'Earthquake Readiness & Collapse Rescue', titleAr: 'الاستعداد للزلزال والإنقاذ', levelFa: 'متوسط و پیشرفته', durationHours: 16, category: 'disaster_prep', instructorFa: 'مهندس علیرضا رضایی (فرمانده نجات در آوار)', descriptionFa: 'اصول پناه‌گیری، خروج اضطراری، ایمن‌سازی منزل و تکنیک‌های جستجو در آوار.', topicsFa: ['نقاط امن منزل و محیط کار', 'کیف اضطراری زلزله', 'شناسایی علائم حیاتی آوار', 'ابزارهای آواربرداری سبک'], certificateProvided: true, enrolledCount: 8900, imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80' },
  { id: 'cour_03', titleFa: 'دوره جستجو و نجات در کوهستان و مناطق صعب‌العبور', titleEn: 'Mountain Search & Rescue Course', titleAr: 'الإنقاذ الجبلي', levelFa: 'تخصصی امدادگران', durationHours: 24, category: 'mountain_rescue', instructorFa: 'کپتن مهدی کاظمی (مربی بین‌المللی کوهستان)', descriptionFa: 'استفاده از کارابین، بسکت نجات، بقا در شرایط سخت جوی و مسیریابی با GPS.', topicsFa: ['گره‌زدن و طناب‌ریزی', 'بسکت‌کشی در صخره', 'بقای ۳۶ ساعته در سرما', 'ناوبری و قطب‌نما'], certificateProvided: true, enrolledCount: 4300, imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80' },
  { id: 'cour_04', titleFa: 'دوره امداد و نجات در سیلاب و خروشان‌ترین آب‌ها', titleEn: 'Water & Flood Rescue Specialist', titleAr: 'الإنقاذ من السيول', levelFa: 'تخصصی پیشرفته', durationHours: 20, category: 'water_rescue', instructorFa: 'استاد حسین باقری (نجات‌غریق بین‌المللی)', descriptionFa: 'تکنیک‌های شنای دفاعی در سیلاب، هدایت قایق‌های جیمینی و نجات مصدوم از جریان آب.', topicsFa: ['هیدرودینامیک جریان سیل', 'قایق‌رانی نجات جیمینی', 'پرتاب طناب نجاتی', 'مدیریت غرق‌شدگی'], certificateProvided: true, enrolledCount: 3100, imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80' },
  { id: 'cour_05', titleFa: 'دوره حمایت‌های روانی - اجتماعی در بلاهای طبیعی (سحر)', titleEn: 'Psycho-Social First Aid (MHPSS)', titleAr: 'الدعم النفسي في الكوارث', levelFa: 'عمومی و تخصصی', durationHours: 12, category: 'psycho_social', instructorFa: 'دکتر مریم احمدی (روانشناس ستاد بحران)', descriptionFa: 'نحوه مواجهه با بازماندگان حوادث، کاهش استرس پس از سانحه (PTSD) و ارتباط با کودکان.', topicsFa: ['همدلی و گوش‌دادن فعال', 'مدیریت اضطراب بازماندگان', 'مراقبت روانی از کودکان', 'پیشگیری از سوختگی شغلی امدادگر'], certificateProvided: true, enrolledCount: 9500, imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80' },
  { id: 'cour_06', titleFa: 'دوره ایمنی در برابر حریق و اطفای حریق خانگی', titleEn: 'Fire Safety & Extinguisher Operation', titleAr: 'السلامة من الحرائق', levelFa: 'مقدماتی برای عموم', durationHours: 6, category: 'fire_safety', instructorFa: 'سرهنگ احمدی (کارشناس سازمان آتش‌نشانی)', descriptionFa: 'شناخت انواع کپسول‌های اطفای حریق، خفه‌کردن آتش و نحوه تخلیه دود.', topicsFa: ['مثلث و مربع حریق', 'کار با کپسول CO2 و پودری', 'قطع انشعابات اضطراری', 'تخلیه امن ساختمان'], certificateProvided: true, enrolledCount: 15200, imageUrl: 'https://images.unsplash.com/photo-1583324113626-70df0f4deaab?auto=format&fit=crop&w=600&q=80' },
  { id: 'cour_07', titleFa: 'دوره پیشرفته فوریت‌های پزشکی و ترومای جاده‌ای', titleEn: 'Advanced Trauma Life Support (ATLS)', titleAr: 'الإسعافات المتقدمة للروح', levelFa: 'ویژه کادر درمان و امدادگران', durationHours: 32, category: 'first_aid', instructorFa: 'دکتر کیانوش رستمی (متخصص طب اورژانس)', descriptionFa: 'لارنگوسکوپی، تثبیت ستون فقرات، تزریق سرم اضطراری و مدیریت شوک.', topicsFa: ['لارنگوسکوپی و راه هوایی', 'مدیریت شوک هیپوولمیک', 'تثبیت آسیب‌های نخاعی', 'تریاژ جاده‌ای START'], certificateProvided: true, enrolledCount: 2800, imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80' },
  { id: 'cour_08', titleFa: 'دوره پدافند غیرعامل و مقابله با مخاطرات شیمیایی', titleEn: 'CBRN Hazards & Civil Defense', titleAr: 'الدفاع المدني المخاطر الكيميائية', levelFa: 'تخصصی', durationHours: 18, category: 'disaster_prep', instructorFa: 'دکتر اصغری (متخصص پدافند غیرعامل)', descriptionFa: 'استفاده از ماسک‌های فیلتردار، رفع آلودگی و پروتکل‌های قرنطینه مخاطرات محیطی.', topicsFa: ['شناسایی گازهای سمی', 'پوشیدن لباس hazmat', 'رفع آلودگی اولیه', 'حریم‌های حفاظتی'], certificateProvided: true, enrolledCount: 1900, imageUrl: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=600&q=80' },
  { id: 'cour_09', titleFa: 'دوره فوریت‌های امدادی در نوزادان و کودکان (PALS)', titleEn: 'Pediatric Advanced Life Support', titleAr: 'إسعاف الأطفال والرضع', levelFa: 'عمومی و والدین', durationHours: 10, category: 'first_aid', instructorFa: 'دکتر نرگس سلیمانی (متخصص اطفال)', descriptionFa: 'مانور هایملیک در شیرخواران، CPR کودکان و تب و تشنج اضطراری.', topicsFa: ['انسداد راه هوایی در نوزاد', 'CPR مخصوص کودکان', 'کنترل تشنج ناشی از تب', 'مسمومیت‌های شایع کودکان'], certificateProvided: true, enrolledCount: 11100, imageUrl: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=600&q=80' },
  { id: 'cour_10', titleFa: 'دوره تخصصی تریاژ و مدیریت مصدومان انبوه (MCI)', titleEn: 'Mass Casualty Incident Triage', titleAr: 'إدارة الإصابات الجماعية', levelFa: 'تخصصی مدیریتی', durationHours: 14, category: 'disaster_prep', instructorFa: 'دکتر حبیب‌الله مرادی (مدیر تریاژ کشوری)', descriptionFa: 'سیستم تریاژ START و JumpSTART، کدگذاری رنگی مصدومان و اولویت‌بندی اعزام.', topicsFa: ['الگوریتم START Triage', 'تگ‌های رنگی قرمز، زرد، سبز، سیاه', 'مدیریت صف آمبولانس', 'فرماندهی صحنه حادثه'], certificateProvided: true, enrolledCount: 3600, imageUrl: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=600&q=80' },
];

export const MOCK_FACILITIES = PUBLIC_FACILITIES;
export const BLOOD_DONATION_CENTRES = BLOOD_DONATION_CENTERS;
