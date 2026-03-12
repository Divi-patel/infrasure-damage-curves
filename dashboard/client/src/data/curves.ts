// All 42 damage curves from master_curve_index.json
// Plus research metadata for the backend view

export interface CurveParams {
  curve_id: string;
  subsystem: string;
  component: string;
  specificity: "generic" | "specs" | "model";
  match_criteria?: Record<string, any>;
  description?: string;
  L: number;
  k: number;
  x0: number;
  confidence: string;
  derivation: string;
}

export interface HazardGroup {
  hazard_code: string;
  research_file: string;
  asset_type: "solar" | "wind";
  priority_score: number;
  intensity_variable: string;
  intensity_unit: string;
  intensity_measure?: string;
  intensity_source?: string;
  notes?: string;
  curves: CurveParams[];
}

export interface UncoveredHazard {
  code: string;
  priority_score: number;
  reason: string;
}

export const HAZARD_COLORS: Record<string, string> = {
  HAIL: "#3b82f6",           // blue
  HURRICANE: "#ef4444",      // red
  WILDFIRE: "#f97316",       // orange
  STRONG_WIND: "#8b5cf6",    // purple
  RIVERINE_FLOOD: "#06b6d4", // cyan
  WINTER_WEATHER: "#64748b", // slate
};

export const HAZARD_ICONS: Record<string, string> = {
  HAIL: "⬡",
  HURRICANE: "🌀",
  WILDFIRE: "🔥",
  STRONG_WIND: "💨",
  RIVERINE_FLOOD: "🌊",
  WINTER_WEATHER: "❄️",
};

export const HAZARD_LABELS: Record<string, string> = {
  HAIL: "Hail",
  HURRICANE: "Hurricane",
  WILDFIRE: "Wildfire",
  STRONG_WIND: "Strong Wind",
  RIVERINE_FLOOD: "Flood",
  WINTER_WEATHER: "Winter Weather",
};

export const ASSET_TYPE_COLORS: Record<string, string> = {
  solar: "#eab308",
  wind: "#22d3ee",
};

export const SUBSYSTEM_LABELS: Record<string, string> = {
  PV_ARRAY: "PV Array",
  MOUNTING: "Mounting",
  INVERTER_SYSTEM: "Inverter System",
  SUBSTATION: "Substation",
  ELECTRICAL: "Electrical",
  CIVIL_INFRA: "Civil Infra",
  ROTOR_ASSEMBLY: "Rotor Assembly",
  TOWER: "Tower",
  NACELLE: "Nacelle",
  FOUNDATION: "Foundation",
};

export const CONFIDENCE_ORDER = [
  "medium-high",
  "medium",
  "low-medium",
  "medium-low",
  "low",
  "very-low",
];

export const CONFIDENCE_COLORS: Record<string, string> = {
  "medium-high": "#22c55e",
  "medium": "#84cc16",
  "low-medium": "#eab308",
  "medium-low": "#f59e0b",
  "low": "#f97316",
  "very-low": "#ef4444",
};

export const hazardGroups: HazardGroup[] = [
  {
    hazard_code: "HAIL",
    research_file: "HAIL_x_SOLAR.md",
    asset_type: "solar",
    priority_score: 5,
    intensity_variable: "hail_diameter_mm",
    intensity_unit: "mm",
    intensity_source: "MESH radar (NOAA MRMS)",
    curves: [
      { curve_id: "hail/pv_module_generic", subsystem: "PV_ARRAY", component: "PV_MODULE", specificity: "generic", description: "Standard 3.2mm tempered glass mono-Si module", L: 0.95, k: 0.1064, x0: 59.2, confidence: "medium-high", derivation: "empirical + engineering-standard" },
      { curve_id: "hail/pv_module_thick_glass", subsystem: "PV_ARRAY", component: "PV_MODULE", specificity: "specs", match_criteria: { glass_thickness_mm: { min: 3.8, max: 4.5 } }, description: "Thick glass (4.0mm) PV module", L: 0.95, k: 0.1145, x0: 72.5, confidence: "medium", derivation: "engineering-standard + limited empirical" },
      { curve_id: "hail/pv_module_cdte_thin_film", subsystem: "PV_ARRAY", component: "PV_MODULE", specificity: "specs", match_criteria: { cell_type: "thin_film" }, description: "CdTe thin-film module (e.g., First Solar Series 6/7)", L: 0.90, k: 0.1398, x0: 73.5, confidence: "medium-low", derivation: "engineering-standard + expert-judgment" },
      { curve_id: "hail/pv_module_bifacial_2mm", subsystem: "PV_ARRAY", component: "PV_MODULE", specificity: "specs", match_criteria: { bifacial: true, glass_thickness_mm: { max: 2.5 } }, description: "Bifacial glass-glass (2.0mm + 2.0mm) module", L: 0.95, k: 0.1452, x0: 38.4, confidence: "medium-low", derivation: "engineering-standard + expert-judgment" },
      { curve_id: "hail/tracker_generic", subsystem: "MOUNTING", component: "TRACKER", specificity: "generic", description: "Single-axis tracker structural damage from hail", L: 0.40, k: 0.100, x0: 88, confidence: "low", derivation: "expert-judgment" },
      { curve_id: "hail/fixed_mount_generic", subsystem: "MOUNTING", component: "FIXED_MOUNT", specificity: "generic", description: "Fixed-mount racking structural damage from hail", L: 0.20, k: 0.080, x0: 100, confidence: "low", derivation: "expert-judgment" },
    ],
  },
  {
    hazard_code: "HURRICANE",
    research_file: "HURRICANE_x_WIND.md",
    asset_type: "wind",
    priority_score: 5,
    intensity_variable: "wind_speed_mph",
    intensity_unit: "mph",
    intensity_measure: "3-second peak gust",
    intensity_source: "STORM/IBTrACS synthetic track library + wind field model",
    curves: [
      { curve_id: "hurricane/blade_generic", subsystem: "ROTOR_ASSEMBLY", component: "BLADE", specificity: "generic", description: "Wind turbine blade fragility under hurricane winds", L: 0.90, k: 0.0669, x0: 118, confidence: "medium", derivation: "empirical (Rose et al. 2012) + engineering-standard" },
      { curve_id: "hurricane/rotor_assembly_generic", subsystem: "ROTOR_ASSEMBLY", component: "aggregate", specificity: "generic", description: "Rotor assembly aggregate (blade + hub + pitch system)", L: 0.88, k: 0.0744, x0: 116, confidence: "medium", derivation: "component-weighted aggregate" },
      { curve_id: "hurricane/tower_section_generic", subsystem: "TOWER", component: "TOWER_SECTION", specificity: "generic", description: "Steel tubular tower fragility — anchored to Rose et al. 2012", L: 1.00, k: 0.1178, x0: 136, confidence: "medium", derivation: "empirical (Rose et al. 2012 PNAS)" },
      { curve_id: "hurricane/nacelle_generic", subsystem: "NACELLE", component: "aggregate", specificity: "generic", description: "Nacelle and drivetrain — proxy-adapted from rotor + tower", L: 0.65, k: 0.0541, x0: 130, confidence: "low", derivation: "proxy-adapted" },
      { curve_id: "hurricane/foundation_generic", subsystem: "FOUNDATION", component: "FOUNDATION_BASE", specificity: "generic", description: "Turbine foundation — proxy-adapted, high resistance", L: 0.50, k: 0.0722, x0: 155, confidence: "low", derivation: "proxy-adapted + expert-judgment" },
    ],
  },
  {
    hazard_code: "WILDFIRE",
    research_file: "WILDFIRE_x_SOLAR.md",
    asset_type: "solar",
    priority_score: 5,
    intensity_variable: "fireline_intensity_kWm",
    intensity_unit: "kW/m",
    intensity_measure: "Byram fireline intensity",
    intensity_source: "FSim (USFS) conditional iMFI",
    notes: "Triple-channel loss: physical damage (modeled), smoke soiling (separate), PSPS (separate). Curves model Channel 1 only.",
    curves: [
      { curve_id: "wildfire/pv_array_generic", subsystem: "PV_ARRAY", component: "PV_MODULE", specificity: "generic", description: "PV module damage from radiant heat exposure", L: 0.95, k: 0.00130, x0: 2100, confidence: "low-medium", derivation: "engineering-standard (component thresholds)" },
      { curve_id: "wildfire/mounting_tracker_generic", subsystem: "MOUNTING", component: "TRACKER", specificity: "generic", description: "Steel tracker structural damage from fire", L: 0.80, k: 0.00060, x0: 3600, confidence: "low", derivation: "engineering-standard (steel thermal limits)" },
      { curve_id: "wildfire/inverter_system_generic", subsystem: "INVERTER_SYSTEM", component: "INVERTER", specificity: "generic", description: "Most vulnerable subsystem — electronics fail first", L: 0.95, k: 0.00210, x0: 1300, confidence: "low-medium", derivation: "engineering-standard (electronics thermal limits)" },
      { curve_id: "wildfire/substation_generic", subsystem: "SUBSTATION", component: "TRANSFORMER_MAIN", specificity: "generic", description: "Transformer fire damage", L: 0.95, k: 0.00140, x0: 1900, confidence: "low", derivation: "engineering-standard + expert-judgment" },
      { curve_id: "wildfire/electrical_cables_generic", subsystem: "ELECTRICAL", component: "CABLE_COLLECTION", specificity: "generic", description: "Underground cables resilient; junction boxes vulnerable", L: 0.65, k: 0.00080, x0: 2500, confidence: "low", derivation: "engineering-standard" },
      { curve_id: "wildfire/civil_infra_generic", subsystem: "CIVIL_INFRA", component: "aggregate", specificity: "generic", description: "Roads, fencing, O&M buildings", L: 0.75, k: 0.00090, x0: 2100, confidence: "low", derivation: "proxy-adapted" },
    ],
  },
  {
    hazard_code: "HURRICANE",
    research_file: "HURRICANE_x_SOLAR.md",
    asset_type: "solar",
    priority_score: 4,
    intensity_variable: "wind_speed_mph",
    intensity_unit: "mph",
    intensity_measure: "3-second peak gust",
    curves: [
      { curve_id: "hurricane/pv_array_tracker_stow", subsystem: "PV_ARRAY", component: "PV_MODULE", specificity: "specs", match_criteria: { tracking_type: "single_axis" }, description: "PV modules on tracker in hurricane stow mode", L: 0.85, k: 0.055, x0: 148, confidence: "medium", derivation: "empirical (FPL Ian data) + proxy" },
      { curve_id: "hurricane/pv_array_tracker_midtilt", subsystem: "PV_ARRAY", component: "PV_MODULE", specificity: "specs", description: "PV modules on tracker with stow failure (worst case)", L: 0.95, k: 0.065, x0: 115, confidence: "medium-low", derivation: "empirical (n=2 case studies)" },
      { curve_id: "hurricane/pv_array_fixed_tilt", subsystem: "PV_ARRAY", component: "PV_MODULE", specificity: "specs", match_criteria: { tracking_type: "fixed" }, description: "PV modules on fixed 20-25° tilt mount", L: 0.90, k: 0.048, x0: 130, confidence: "medium", derivation: "empirical (Ceferino et al. 2023)" },
      { curve_id: "hurricane/pv_array_generic", subsystem: "PV_ARRAY", component: "PV_MODULE", specificity: "generic", description: "Fleet-average PV array hurricane fragility", L: 0.85, k: 0.050, x0: 135, confidence: "medium", derivation: "composite/proxy" },
      { curve_id: "hurricane/mounting_tracker_solar", subsystem: "MOUNTING", component: "TRACKER", specificity: "generic", description: "Tracker structural damage from hurricane", L: 0.80, k: 0.055, x0: 120, confidence: "low-medium", derivation: "engineering-standard + proxy" },
      { curve_id: "hurricane/mounting_fixed_solar", subsystem: "MOUNTING", component: "FIXED_MOUNT", specificity: "generic", description: "Fixed mount structural damage from hurricane", L: 0.70, k: 0.045, x0: 140, confidence: "low", derivation: "engineering-standard + proxy" },
      { curve_id: "hurricane/substation_solar", subsystem: "SUBSTATION", component: "TRANSFORMER_MAIN", specificity: "generic", description: "Substation compound wind + debris + rain damage", L: 0.80, k: 0.040, x0: 120, confidence: "low-medium", derivation: "HAZUS proxy + NERC post-event data" },
    ],
  },
  {
    hazard_code: "STRONG_WIND",
    research_file: "STRONG_WIND_x_WIND.md",
    asset_type: "wind",
    priority_score: 4,
    intensity_variable: "wind_speed_mph",
    intensity_unit: "mph",
    intensity_measure: "3-second peak gust",
    notes: "Covers derechos, downbursts, extratropical storms. Physical damage only — operational curtailment separate.",
    curves: [
      { curve_id: "strong_wind/rotor_assembly_generic", subsystem: "ROTOR_ASSEMBLY", component: "aggregate", specificity: "generic", description: "Rotor assembly fragility under strong non-hurricane wind", L: 0.90, k: 0.07, x0: 125, confidence: "low-medium", derivation: "engineering-standard + limited event data" },
      { curve_id: "strong_wind/tower_generic", subsystem: "TOWER", component: "TOWER_SECTION", specificity: "generic", description: "Tower section structural damage from strong wind", L: 0.75, k: 0.065, x0: 135, confidence: "low", derivation: "engineering-standard" },
      { curve_id: "strong_wind/nacelle_generic", subsystem: "NACELLE", component: "aggregate", specificity: "generic", description: "Nacelle damage from strong wind events", L: 0.70, k: 0.06, x0: 135, confidence: "low", derivation: "proxy-adapted" },
      { curve_id: "strong_wind/foundation_generic", subsystem: "FOUNDATION", component: "FOUNDATION_BASE", specificity: "generic", description: "Foundation is highly resistant to non-hurricane wind", L: 0.10, k: 0.05, x0: 160, confidence: "low", derivation: "expert-judgment" },
    ],
  },
  {
    hazard_code: "WILDFIRE",
    research_file: "WILDFIRE_x_WIND.md",
    asset_type: "wind",
    priority_score: 4,
    intensity_variable: "fireline_intensity_kWm",
    intensity_unit: "kW/m",
    notes: "Wind turbines are 10-50x less vulnerable to wildfire than solar due to elevation.",
    curves: [
      { curve_id: "wildfire/rotor_assembly_wind_generic", subsystem: "ROTOR_ASSEMBLY", component: "aggregate", specificity: "generic", description: "Near-zero risk — elevated 80-100m above ground fire", L: 0.10, k: 0.00008, x0: 75000, confidence: "very-low", derivation: "expert-judgment (near-zero risk)" },
      { curve_id: "wildfire/nacelle_wind_generic", subsystem: "NACELLE", component: "aggregate", specificity: "generic", description: "Near-zero risk — nacelle at hub height", L: 0.15, k: 0.00006, x0: 80000, confidence: "very-low", derivation: "expert-judgment (near-zero risk)" },
      { curve_id: "wildfire/tower_wind_generic", subsystem: "TOWER", component: "TOWER_SECTION", specificity: "generic", description: "Tower base exposure to ground fire — only subsystem with meaningful wildfire vulnerability", L: 0.50, k: 0.00045, x0: 6000, confidence: "low", derivation: "engineering-standard (steel thermal limits)" },
    ],
  },
  {
    hazard_code: "RIVERINE_FLOOD",
    research_file: "FLOOD_x_SOLAR.md",
    asset_type: "solar",
    priority_score: 4,
    intensity_variable: "flood_depth_ft",
    intensity_unit: "ft",
    intensity_measure: "flood depth above ground level at asset centroid",
    notes: "Depth-above-ground; component elevation offsets are critical.",
    curves: [
      { curve_id: "flood/pv_array_fixed_tilt", subsystem: "PV_ARRAY", component: "PV_MODULE", specificity: "specs", match_criteria: { tracking_type: "fixed" }, description: "Fixed-tilt panels, leading edge at ~2 ft", L: 0.90, k: 1.8, x0: 2.0, confidence: "medium", derivation: "empirical (Thailand study) + HAZUS proxy" },
      { curve_id: "flood/pv_array_tracker_horizontal", subsystem: "PV_ARRAY", component: "PV_MODULE", specificity: "specs", match_criteria: { tracking_type: "single_axis" }, description: "SAT in horizontal stow, panels at ~2.5 ft", L: 0.90, k: 1.8, x0: 2.5, confidence: "medium", derivation: "empirical + engineering-standard" },
      { curve_id: "flood/pv_array_tracker_flood_stow", subsystem: "PV_ARRAY", component: "PV_MODULE", specificity: "specs", description: "SAT in flood stow (75-85° tilt), panels at ~7 ft", L: 0.90, k: 1.8, x0: 7.0, confidence: "low-medium", derivation: "engineering-standard + expert-judgment" },
      { curve_id: "flood/inverter_system_generic", subsystem: "INVERTER_SYSTEM", component: "INVERTER", specificity: "generic", description: "Pad-mounted inverter at ~0.75 ft — near-binary failure", L: 0.95, k: 3.5, x0: 0.75, confidence: "medium", derivation: "engineering-standard (NEMA) + HAZUS" },
      { curve_id: "flood/substation_generic", subsystem: "SUBSTATION", component: "TRANSFORMER_MAIN", specificity: "generic", description: "Transformer flooding — oil contamination at low depth", L: 0.95, k: 2.5, x0: 1.5, confidence: "medium", derivation: "IEEE C57 + NERC + HAZUS" },
      { curve_id: "flood/electrical_cables_generic", subsystem: "ELECTRICAL", component: "CABLE_COLLECTION", specificity: "generic", description: "Underground cables resilient; junction boxes vulnerable", L: 0.55, k: 1.0, x0: 3.0, confidence: "low-medium", derivation: "engineering-standard" },
      { curve_id: "flood/civil_infra_generic", subsystem: "CIVIL_INFRA", component: "aggregate", specificity: "generic", description: "Roads, fencing, O&M buildings", L: 0.70, k: 1.2, x0: 2.0, confidence: "medium", derivation: "HAZUS commercial 1-story + JRC transport" },
    ],
  },
  {
    hazard_code: "WINTER_WEATHER",
    research_file: "WINTER_WEATHER_x_WIND.md",
    asset_type: "wind",
    priority_score: 4,
    intensity_variable: "ice_accretion_in",
    intensity_unit: "in",
    intensity_measure: "radial ice accretion on standard conductor",
    notes: "Two channels: physical damage (modeled) and operational icing curtailment (separate).",
    curves: [
      { curve_id: "winter_weather/rotor_assembly_generic", subsystem: "ROTOR_ASSEMBLY", component: "aggregate", specificity: "generic", description: "Blade ice loading, mass imbalance, pitch bearing freeze", L: 0.60, k: 3.5, x0: 1.50, confidence: "low-medium", derivation: "engineering-standard (IEC 61400-1 Annex L, ISO 12494)" },
      { curve_id: "winter_weather/tower_generic", subsystem: "TOWER", component: "TOWER_SECTION", specificity: "generic", description: "Tower ice loading — combined with wind loading", L: 0.30, k: 2.0, x0: 2.50, confidence: "low", derivation: "engineering-standard (ASCE 7-22 + ISO 12494)" },
      { curve_id: "winter_weather/nacelle_generic", subsystem: "NACELLE", component: "aggregate", specificity: "generic", description: "Cold-start failures, lubricant viscosity issues", L: 0.35, k: 3.0, x0: 0.75, confidence: "low", derivation: "proxy-adapted + expert-judgment" },
      { curve_id: "winter_weather/electrical_generic", subsystem: "ELECTRICAL", component: "aggregate", specificity: "generic", description: "Transmission line icing, galloping, conductor clash", L: 0.70, k: 4.0, x0: 0.75, confidence: "medium", derivation: "engineering-standard (PNNL tower fragility)" },
    ],
  },
];

export const uncoveredHazards: UncoveredHazard[] = [
  { code: "TORNADO", priority_score: 3, reason: "Idiosyncratic/localized; parameterized scenario model recommended" },
  { code: "HEAT_WAVE", priority_score: 3, reason: "Inverter de-rating only; simple temp exceedance model" },
  { code: "COLD_WAVE", priority_score: 3, reason: "Covered partially by WINTER_WEATHER; separate freeze model TBD" },
  { code: "ICE_STORM", priority_score: 3, reason: "Partially covered by WINTER_WEATHER; transmission line focus" },
  { code: "FREEZE", priority_score: 3, reason: "Thermal cycling stress model for solar; separate from ice loading" },
  { code: "FLASH_FLOOD", priority_score: 3, reason: "Similar to RIVERINE_FLOOD but with velocity component" },
  { code: "COASTAL_FLOOD", priority_score: 2, reason: "Storm surge; partially covered by HURRICANE compound hazard" },
  { code: "LIGHTNING", priority_score: 3, reason: "Attritional; frequency × severity model" },
  { code: "DUST_STORM", priority_score: 2, reason: "Soiling only; qualitative" },
  { code: "FOG", priority_score: 1, reason: "Negligible; qualitative flag only" },
];

// Key references cited across all 8 research files
export const keySources = [
  { id: 1, author: "Rose et al.", year: 2012, title: "Quantifying the hurricane risk to offshore wind turbines", journal: "PNAS", doi: "10.1073/pnas.1111769109", hazards: ["HURRICANE"], url: "https://doi.org/10.1073/pnas.1111769109" },
  { id: 2, author: "Ceferino et al.", year: 2023, title: "Hurricane-induced fragility curves for solar photovoltaic systems", journal: "Nature Energy", doi: "10.1038/s41560-023-01380-4", hazards: ["HURRICANE"], url: "https://doi.org/10.1038/s41560-023-01380-4" },
  { id: 3, author: "IBHS", year: 2023, title: "Rooftop Solar Hail Testing Program Results", journal: "IBHS Research", hazards: ["HAIL"], url: "https://ibhs.org/hail/solar-hail-research/" },
  { id: 4, author: "IEC 61215-2", year: 2021, title: "Terrestrial PV modules — Design qualification: Test procedures", journal: "IEC Standard", hazards: ["HAIL"], url: "https://webstore.iec.ch/publication/61345" },
  { id: 5, author: "HAZUS-MH", year: 2024, title: "Multi-Hazard Loss Estimation Methodology", journal: "FEMA", hazards: ["HURRICANE", "RIVERINE_FLOOD", "WILDFIRE"], url: "https://www.fema.gov/flood-maps/products-tools/hazus" },
  { id: 6, author: "CLIMADA", year: 2023, title: "Climate Adaptation Platform", journal: "ETH Zurich", hazards: ["HURRICANE", "WILDFIRE"], url: "https://wcr.ethz.ch/research/climada.html" },
  { id: 7, author: "ISO 12494", year: 2017, title: "Atmospheric icing of structures", journal: "ISO Standard", hazards: ["WINTER_WEATHER"], url: "https://www.iso.org/standard/72445.html" },
  { id: 8, author: "ASCE 7-22", year: 2022, title: "Minimum Design Loads and Associated Criteria", journal: "ASCE Standard", hazards: ["STRONG_WIND", "WINTER_WEATHER"], url: "https://doi.org/10.1061/9780784415788" },
  { id: 9, author: "IEC 61400-1", year: 2019, title: "Wind energy generation systems — Design requirements", journal: "IEC Standard", hazards: ["STRONG_WIND", "HURRICANE", "WINTER_WEATHER"], url: "https://webstore.iec.ch/publication/26423" },
  { id: 10, author: "PNNL", year: 2023, title: "Transmission Tower Fragility under Ice and Wind Loading", journal: "Pacific Northwest National Laboratory", hazards: ["WINTER_WEATHER"], url: "https://www.pnnl.gov/" },
  { id: 11, author: "IEEE C57", year: 2022, title: "Standard for General Requirements for Liquid-Immersed Transformers", journal: "IEEE Standard", hazards: ["RIVERINE_FLOOD"], url: "https://standards.ieee.org/ieee/C57.12.00/10727/" },
  { id: 12, author: "FSim/USFS", year: 2023, title: "Large Fire Simulation System", journal: "US Forest Service", hazards: ["WILDFIRE"], url: "https://www.fs.usda.gov/rmrs/projects/fsim" },
  { id: 13, author: "UL 61730", year: 2023, title: "Photovoltaic module safety qualification", journal: "UL Standard", hazards: ["HAIL", "WILDFIRE"], url: "https://www.shopulstandards.com/ProductDetail.aspx?UniqueKey=36818" },
  { id: 14, author: "JRC", year: 2017, title: "Global flood depth-damage functions", journal: "EU Joint Research Centre", hazards: ["RIVERINE_FLOOD"], url: "https://publications.jrc.ec.europa.eu/repository/handle/JRC105688" },
];

// Utility: compute logistic curve value
export function logistic(x: number, L: number, k: number, x0: number): number {
  return L / (1 + Math.exp(-k * (x - x0)));
}

// Get all curves as a flat list
export function getAllCurves(): (CurveParams & { hazard_code: string; asset_type: string; priority_score: number; intensity_unit: string; intensity_variable: string })[] {
  return hazardGroups.flatMap((g) =>
    g.curves.map((c) => ({
      ...c,
      hazard_code: g.hazard_code,
      asset_type: g.asset_type,
      priority_score: g.priority_score,
      intensity_unit: g.intensity_unit,
      intensity_variable: g.intensity_variable,
    }))
  );
}

// Get unique hazard × asset combinations
export function getHazardAssetPairs(): { hazard_code: string; asset_type: string; research_file: string; priority_score: number; curveCount: number }[] {
  return hazardGroups.map((g) => ({
    hazard_code: g.hazard_code,
    asset_type: g.asset_type,
    research_file: g.research_file,
    priority_score: g.priority_score,
    curveCount: g.curves.length,
  }));
}
