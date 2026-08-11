export type Language = 'fa' | 'en' | 'ar';
export type ThemeMode = 'light' | 'dark' | 'system';

export type UserRole =
  | 'visitor'
  | 'citizen'
  | 'volunteer'
  | 'rescuer'
  | 'manager'
  | 'analyst'
  | 'admin';

export type RescuerPreset =
  | 'field'
  | 'warehouse'
  | 'shelter'
  | 'fleet_air'
  | 'center_manager'
  | 'training';

export interface UserProfile {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  age?: number;
  placeOfResidence?: string;
  nationalId?: string;
  role: UserRole;
  console?: 'rescuer' | 'public';
  serviceLocation?: string;
  serviceType?: string;
  rescuerPreset?: RescuerPreset;
  membershipId?: string;
  verified: boolean;
  mfaEnabled?: boolean;
  assignedBranch?: string;
  permissions?: string[];
}

export type DisasterStatus = 'declared' | 'active' | 'recovery' | 'closed';
export type DisasterType =
  | 'earthquake'
  | 'flood'
  | 'landslide'
  | 'wildfire'
  | 'severe_storm'
  | 'building_collapse'
  | 'combined';

export interface DisasterEvent {
  id: string;
  title: string;
  type: DisasterType;
  region: string;
  status: DisasterStatus;
  declaredAt: string;
  affectedPopulation: number;
  severityScore: number; // 1-10
  emergencyMode: boolean;
  description: string;
}

export type IncidentPriority = 'critical' | 'high' | 'standard' | 'low';
export type RequestStatus = 'received' | 'under_review' | 'dispatched' | 'in_progress' | 'resolved';

export interface EmergencyRequest {
  id: string;
  trackingId?: string;
  trackingCode?: string;
  incidentType: string;
  reporterName?: string;
  phone?: string;
  contactPhone?: string;
  lat: number;
  lng: number;
  address: string;
  affectedCount: number;
  hasInjuries: boolean;
  medicalNeeds?: string;
  immediateDanger: boolean;
  priority?: IncidentPriority;
  priorityScore?: number;
  status: RequestStatus;
  createdAt?: string;
  timestamp?: string;
  notes?: string;
  description?: string;
  reporterRole?: string;
  isDuplicate?: boolean;
}

export interface DisasterIncident {
  id: string;
  disasterId: string;
  title: string;
  locationName: string;
  lat: number;
  lng: number;
  affectedCount: number;
  priority: IncidentPriority;
  requestsCount: number;
  status: 'active' | 'contained' | 'resolved';
}

export interface ReliefItem {
  id: string;
  nameFa: string;
  nameEn: string;
  category: 'shelter' | 'food' | 'medical' | 'bedding' | 'general';
  unit: string;
  unitWeightKg: number;
  unitVolumeM3: number;
  requiresColdChain: boolean;
  shelfLifeDays?: number;
  shortagePenaltyWeight: number; // Penalty weight per unmet unit
}

export interface WarehouseItemStock {
  itemId: string;
  quantity: number;
  allocated: number;
  available: number;
  expiryDate?: string;
}

export interface Warehouse {
  id: string;
  nameFa: string;
  nameEn: string;
  code: string;
  lat: number;
  lng: number;
  city: string;
  capacityM3: number;
  usedM3: number;
  isAvailable: boolean;
  damageStatus: 'operational' | 'partially_damaged' | 'inaccessible';
  hasColdChain: boolean;
  inventory: Record<string, number>; // itemId -> quantity
}

export interface AffectedArea {
  id: string;
  nameFa: string;
  nameEn: string;
  code: string;
  lat: number;
  lng: number;
  population: number;
  vulnerabilityIndex: number; // 1-5 multiplier
  priorityMultiplier: number;
  demands: Record<string, number>; // itemId -> quantity needed
  minServiceLevel: number; // 0-1 (e.g. 0.8 = 80% minimum)
  responseDeadlineHours: number;
}

export interface ShelterCandidate {
  id: string;
  nameFa: string;
  nameEn: string;
  lat: number;
  lng: number;
  capacityPeople: number;
  currentOccupancy: number;
  activationCost: number;
  floodRiskScore: number; // 1-10
  structuralSafetyScore: number; // 1-10
  hasHelicopterLandingZone: boolean;
  isActivated: boolean;
  assignedAreaIds: string[];
}

export type VehicleType = 'heavy_truck' | 'medium_truck' | 'light_van' | 'helicopter';

export interface TransportVehicle {
  id: string;
  name: string;
  type: VehicleType;
  plateNumber: string;
  capacityWeightKg: number;
  capacityVolumeM3: number;
  hasColdChain: boolean;
  maxRangeKm: number;
  status: 'available' | 'in_transit' | 'maintenance' | 'grounded';
  currentLat?: number;
  currentLng?: number;
}

export interface HelicopterAircraft {
  id: string;
  name?: string;
  callsign: string;
  model: string;
  maxPayloadKg: number;
  maxRangeKm: number;
  currentFuelPercent: number;
  weatherGated: boolean;
  status: 'ready' | 'airborne' | 'refueling' | 'grounded_weather';
  homeBaseLat: number;
  homeBaseLng: number;
}

export interface RoadEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  distanceKm: number;
  estimatedMinutes: number;
  status: 'open' | 'partially_blocked' | 'blocked';
  riskScore: number; // 1-10
  isAirRoute?: boolean;
}

export interface RoadNode {
  id: string;
  nameFa: string;
  nameEn: string;
  lat: number;
  lng: number;
  type: 'warehouse' | 'shelter' | 'area' | 'junction' | 'helibase';
  refId?: string; // ID of warehouse, shelter, or area
}

// LP/MILP Optimization Parameters & Output
export interface LpSolverParameters {
  modelMode: 'core' | 'extended' | 'advanced';
  budgetMax: number;
  fairnessMaxGap: number; // 0-1
  priorityWeights: {
    transportCost: number;
    unmetShortage: number;
    routeActivation: number;
    fairnessPenalty: number;
  };
  itemPenalties: Record<string, number>; // itemId -> weight
  warehouseAvailability: Record<string, boolean>; // warehouseId -> boolean
}

export interface LpAllocationFlow {
  warehouseId: string;
  warehouseName: string;
  areaId: string;
  areaName: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface BindingConstraint {
  id: string;
  nameFa: string;
  nameEn: string;
  type: 'warehouse_supply' | 'transport_capacity' | 'budget' | 'service_floor' | 'fairness';
  shadowPrice: number;
  slack: number;
  isBinding: boolean;
  interpretationFa: string;
  interpretationEn: string;
}

export interface SensitivityRange {
  parameterName: string;
  currentValue: number;
  allowableIncrease: number;
  allowableDecrease: number;
  unit: string;
}

export interface LpSolverResult {
  runId: string;
  timestamp: string;
  status: 'optimal' | 'feasible' | 'infeasible';
  objectiveValue: number;
  transportCost: number;
  shortagePenalty: number;
  routeActivationCost: number;
  allocations: LpAllocationFlow[];
  cargoManifest: Array<{
    warehouseId: string;
    warehouseName: string;
    areaId: string;
    areaName: string;
    itemId: string;
    itemName: string;
    quantity: number;
    volumeM3: number;
    weightKg: number;
  }>;
  shortages: Array<{
    areaId: string;
    areaName: string;
    itemId: string;
    itemName: string;
    demanded: number;
    delivered: number;
    shortage: number;
    percentMet: number;
  }>;
  bindingConstraints: BindingConstraint[];
  sensitivityRanges: SensitivityRange[];
  achievedFairnessGap: number;
  totalDeliveredVolumeM3: number;
  isStale?: boolean;
}

// Genetic Algorithm LRP Parameters & Output
export interface GaParameters {
  populationSize: number;
  maxGenerations: number;
  crossoverRate: number;
  mutationRate: number;
  tournamentSize: number;
  elitismPercent: number;
  crisisModePreset: boolean;
  weights: {
    facilityCost: number;
    routingCost: number;
    riskExposure: number;
    latenessPenalty: number;
    coverageReward: number;
  };
}

export interface VehicleRoute {
  vehicleId: string;
  vehicleName: string;
  type: 'truck' | 'helicopter';
  originId: string;
  originName: string;
  stops: Array<{
    nodeId: string;
    nodeName: string;
    lat: number;
    lng: number;
    arrivalTimeMinutes: number;
    deliveriesKg: number;
  }>;
  totalDistanceKm: number;
  totalTimeMinutes: number;
  riskScore: number;
  loadKg: number;
}

export interface GaBaselineComparison {
  method: 'greedy_heuristic' | 'opt2_heuristic' | 'genetic_algorithm' | 'exact_optimum';
  nameFa: string;
  nameEn: string;
  fitness: number;
  totalCost: number;
  coveragePercent: number;
  avgResponseMinutes: number;
  computeTimeMs: number;
}

export interface GaDecisionTraceItem {
  step: number;
  titleFa: string;
  titleEn: string;
  explanationFa: string;
  explanationEn: string;
  dataPoint: string;
}

export interface GaSolverResult {
  runId: string;
  timestamp: string;
  bestFitness: number;
  totalRoutingCost: number;
  facilityCost: number;
  totalRiskScore: number;
  coveragePercent: number;
  avgResponseTimeMinutes: number;
  selectedShelters: Array<{
    shelterId: string;
    shelterName: string;
    occupancy: number;
    capacity: number;
    assignedAreas: string[];
  }>;
  truckRoutes: VehicleRoute[];
  heliRoutes: VehicleRoute[];
  convergenceHistory: Array<{
    generation: number;
    bestFitness: number;
    avgFitness: number;
    diversity: number;
  }>;
  baselines: GaBaselineComparison[];
  decisionTrace: GaDecisionTraceItem[];
  isStale?: boolean;
}

// Scenario & What-If
export interface DisasterScenario {
  id: string;
  nameFa: string;
  nameEn: string;
  descriptionFa: string;
  descriptionEn: string;
  blockedEdgeIds?: string[];
  lpParams?: Partial<LpSolverParameters>;
  gaParams?: Partial<GaParameters>;
}

export type Scenario = DisasterScenario;

// Audit Trail
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  actionFa: string;
  actionEn: string;
  details: string;
  affectedEntity?: string;
}

// Chatbot Conversation
export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  timestamp: string;
  text: string;
  intent?: 'why_question' | 'what_if' | 'sensitivity' | 'comparison' | 'recommendation' | 'general';
  groundedData?: {
    bindingConstraints?: BindingConstraint[];
    lpResult?: LpSolverResult;
    gaResult?: GaSolverResult;
    decisionTrace?: GaDecisionTraceItem[];
  };
}

// Public Platform Models
export interface FacilityInfo {
  id: string;
  nameFa: string;
  nameEn: string;
  nameAr: string;
  type: 'station' | 'pharmacy' | 'medical_center' | 'blood_bank' | 'branch';
  cityFa: string;
  cityEn: string;
  cityAr: string;
  addressFa: string;
  addressEn: string;
  addressAr: string;
  phone: string;
  lat: number;
  lng: number;
  openHours: string;
  imageUrl?: string;
}

export interface EmergencyNumberItem {
  id: string;
  titleFa: string;
  titleEn: string;
  titleAr: string;
  number: string;
  descriptionFa: string;
  descriptionEn: string;
  descriptionAr: string;
  iconName: string;
}

export interface BloodDonationCenter {
  id: string;
  nameFa: string;
  nameEn: string;
  nameAr: string;
  cityFa: string;
  cityEn: string;
  cityAr: string;
  addressFa: string;
  addressEn: string;
  addressAr: string;
  phone: string;
  operatingHoursFa: string;
  operatingHoursEn: string;
  operatingHoursAr: string;
  urgentNeeds: string[]; // e.g. ['O+', 'A-']
  lat: number;
  lng: number;
}

export interface DonationCampaign {
  id: string;
  titleFa: string;
  titleEn: string;
  titleAr: string;
  targetAmountRials: number;
  collectedAmountRials: number;
  spentAmountRials: number;
  supportedRegionsFa: string;
  supportedRegionsEn: string;
  supportedRegionsAr: string;
  destinationSummaryFa: string;
  destinationSummaryEn: string;
  destinationSummaryAr: string;
  imageUrl?: string;
  donorsCount: number;
}

export interface VolunteerProgram {
  id: string;
  titleFa: string;
  titleEn: string;
  titleAr: string;
  category: 'rescue' | 'medical' | 'logistics' | 'social' | 'training';
  locationFa: string;
  locationEn: string;
  locationAr: string;
  duration: string;
  requirementsFa: string;
  requirementsEn: string;
  requirementsAr: string;
  imageUrl?: string;
}

export interface EmergencyAlertNotice {
  id: string;
  titleFa: string;
  titleEn: string;
  titleAr: string;
  type: 'earthquake' | 'flood' | 'storm' | 'snow' | 'general';
  severity: 'critical' | 'warning' | 'info';
  regionFa: string;
  regionEn: string;
  regionAr: string;
  publishedAt: string;
  contentFa: string;
  contentEn: string;
  contentAr: string;
  imageUrl?: string;
}

export interface FirstAidArticle {
  id: string;
  titleFa: string;
  titleEn: string;
  titleAr: string;
  category: 'cpr' | 'bleeding' | 'burns' | 'fractures' | 'earthquake_safety' | 'flood_safety';
  summaryFa: string;
  summaryEn: string;
  summaryAr: string;
  stepsFa: string[];
  stepsEn: string[];
  stepsAr: string[];
  imageUrl?: string;
}

export interface EducationalCourse {
  id: string;
  titleFa: string;
  titleEn: string;
  titleAr: string;
  levelFa: string;
  durationHours: number;
  category: 'first_aid' | 'disaster_prep' | 'mountain_rescue' | 'water_rescue' | 'psycho_social' | 'fire_safety';
  instructorFa: string;
  descriptionFa: string;
  topicsFa: string[];
  certificateProvided: boolean;
  enrolledCount: number;
  imageUrl?: string;
}

