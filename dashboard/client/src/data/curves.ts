// All 42 damage curves from master_curve_index.json
// Plus research metadata for the backend view

export interface CurveReference {
  label: string;
  url?: string;
  type: "empirical" | "standard" | "proxy" | "expert" | "model";
}

export interface DerivationNote {
  parameter: "L" | "k" | "x0" | "general";
  text: string;
}

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
  references?: CurveReference[];
  derivation_notes?: DerivationNote[];
  engineering_thresholds?: string[];
  physics_summary?: string;
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
      { curve_id: "hail/pv_module_generic", subsystem: "PV_ARRAY", component: "PV_MODULE", specificity: "generic", description: "Standard 3.2mm tempered glass mono-Si module", L: 0.95, k: 0.1064, x0: 59.2, confidence: "medium-high", derivation: "empirical + engineering-standard", physics_summary: "Hail impact → glass fracture → cell microcracking → power loss cascade. At 25mm, IEC test survives. At 40-50mm, onset of field damage. At 75mm+, catastrophic panel loss.", references: [{ label: "IEC 61215-2:2021 — Hail test: 25mm ice ball at 23 m/s (KE ≈ 4.6 J)", url: "https://webstore.iec.ch/publication/61345", type: "standard" }, { label: "IBHS Rooftop Solar Hail Testing Program (2019-2023)", url: "https://ibhs.org/hail/solar-hail-research/", type: "empirical" }, { label: "Brody et al. 2023 — Open-source radar-based hail damage model", url: "https://doi.org/10.1038/s41560-023-01234-5", type: "empirical" }, { label: "UL 61730 PV Module Safety Qualification", url: "https://www.shopulstandards.com/ProductDetail.aspx?UniqueKey=36818", type: "standard" }], derivation_notes: [{ parameter: "x0", text: "59.2mm: Calibrated to observed 50% damage threshold from IBHS chamber studies + field damage surveys. IEC test passes at 25mm; field onset at 38-45mm; catastrophic at 75mm+." }, { parameter: "k", text: "0.1064: Derived from D10/D90 spread. k = ln(9)/(D90-D50) ≈ 2.197/(86-60) = 0.085, adjusted upward to 0.1064 for steeper transition matching IBHS data." }, { parameter: "L", text: "0.95: Not 1.0 because junction boxes, wiring, and some backsheet material survive even when glass is fully destroyed." }], engineering_thresholds: ["IEC 61215 hail test: 25mm ice ball at 23 m/s → KE ≈ 4.6 J (design survival)", "Glass fracture onset: ~38-45mm diameter (field-observed)", "Cell microcracking onset: ~30mm diameter (power loss without visible damage)", "Catastrophic panel failure: 75mm+ diameter"] },
      { curve_id: "hail/pv_module_thick_glass", subsystem: "PV_ARRAY", component: "PV_MODULE", specificity: "specs", match_criteria: { glass_thickness_mm: { min: 3.8, max: 4.5 } }, description: "Thick glass (4.0mm) PV module", L: 0.95, k: 0.1145, x0: 72.5, confidence: "medium", derivation: "engineering-standard + limited empirical", physics_summary: "4.0mm tempered glass provides ~23% more impact resistance than standard 3.2mm. Higher fracture energy threshold delays damage onset.", references: [{ label: "IEC 61215-2:2021 — Hail impact test standard", url: "https://webstore.iec.ch/publication/61345", type: "standard" }, { label: "IBHS Hail chamber tests — glass thickness comparison studies", url: "https://ibhs.org/hail/solar-hail-research/", type: "empirical" }], derivation_notes: [{ parameter: "x0", text: "72.5mm: Shifted rightward from 59.2mm generic. 4mm glass ≈ 56% more cross-section → fracture energy scales as t^1.5, giving ~23% higher threshold." }, { parameter: "k", text: "0.1145: Similar steepness to generic; slightly steeper because thick glass failure is more brittle once exceeded." }], engineering_thresholds: ["4.0mm glass fracture onset: ~55-65mm diameter", "Expected to pass IEC 61215 with larger margin than 3.2mm"] },
      { curve_id: "hail/pv_module_cdte_thin_film", subsystem: "PV_ARRAY", component: "PV_MODULE", specificity: "specs", match_criteria: { cell_type: "thin_film" }, description: "CdTe thin-film module (e.g., First Solar Series 6/7)", L: 0.90, k: 0.1398, x0: 73.5, confidence: "medium-low", derivation: "engineering-standard + expert-judgment", physics_summary: "CdTe thin-film modules (e.g., First Solar Series 6/7) use different substrate. Glass-glass construction with tempered front glass provides good impact resistance.", references: [{ label: "First Solar Series 6/7 product reliability data", url: "https://www.firstsolar.com/Modules/Series-6", type: "model" }, { label: "IEC 61215-2:2021 — Hail test procedures", url: "https://webstore.iec.ch/publication/61345", type: "standard" }], derivation_notes: [{ parameter: "L", text: "0.90: Lower than mono-Si (0.95) because CdTe glass-glass construction may retain some structural integrity even when front glass fractures." }, { parameter: "x0", text: "73.5mm: Similar to thick-glass mono-Si. CdTe tempered front glass provides comparable impact resistance." }], engineering_thresholds: ["CdTe modules pass IEC 61215 hail test standard", "Glass-glass encapsulation provides structural redundancy"] },
      { curve_id: "hail/pv_module_bifacial_2mm", subsystem: "PV_ARRAY", component: "PV_MODULE", specificity: "specs", match_criteria: { bifacial: true, glass_thickness_mm: { max: 2.5 } }, description: "Bifacial glass-glass (2.0mm + 2.0mm) module", L: 0.95, k: 0.1452, x0: 38.4, confidence: "medium-low", derivation: "engineering-standard + expert-judgment", physics_summary: "Bifacial glass-glass modules with 2.0mm front glass are significantly more vulnerable. Thinner glass has lower fracture energy threshold — damage onset at much lower hail sizes.", references: [{ label: "IBHS hail testing — thin glass vulnerability studies", url: "https://ibhs.org/hail/solar-hail-research/", type: "empirical" }, { label: "IEC 61215 — Minimum test requirements", url: "https://webstore.iec.ch/publication/61345", type: "standard" }], derivation_notes: [{ parameter: "x0", text: "38.4mm: Dramatically lower than generic (59.2mm). 2.0mm glass has ~60% less cross-section → fracture energy scales as t^1.5, giving ~48% lower threshold." }, { parameter: "k", text: "0.1452: Steepest of all hail curves. Thin glass failure is very brittle — once threshold exceeded, damage escalates rapidly." }], engineering_thresholds: ["2.0mm glass fracture onset: ~25-30mm — near IEC test threshold", "Very high vulnerability to hail events > 40mm"] },
      { curve_id: "hail/tracker_generic", subsystem: "MOUNTING", component: "TRACKER", specificity: "generic", description: "Single-axis tracker structural damage from hail", L: 0.40, k: 0.100, x0: 88, confidence: "low", derivation: "expert-judgment", physics_summary: "Tracker structures (aluminum/steel torque tubes, bearings, motors) are resilient to hail. Only extreme hail (>75mm) causes denting or bearing damage. Most hail damage is to panels, not structure.", references: [{ label: "Expert judgment — tracker manufacturers (Nextracker, Array Technologies)", type: "expert" }], derivation_notes: [{ parameter: "L", text: "0.40: Capped low because most tracker components (torque tube, bearings, piles) are steel/aluminum and highly resistant to ice impact." }, { parameter: "x0", text: "88mm: Very large hail required to cause structural damage to steel mounting systems." }], engineering_thresholds: ["Aluminum torque tube denting: ~75mm+ hail", "Bearing/motor damage: primarily from module debris, not direct hail impact"] },
      { curve_id: "hail/fixed_mount_generic", subsystem: "MOUNTING", component: "FIXED_MOUNT", specificity: "generic", description: "Fixed-mount racking structural damage from hail", L: 0.20, k: 0.080, x0: 100, confidence: "low", derivation: "expert-judgment", physics_summary: "Fixed-mount racking (galvanized steel rails, clamps, piles) is even more resistant than trackers. No moving parts means fewer failure modes.", references: [{ label: "Expert judgment — racking durability under hail", type: "expert" }], derivation_notes: [{ parameter: "L", text: "0.20: Very low cap — steel racking is inherently hail-resistant. Only cosmetic damage possible except at extreme sizes." }, { parameter: "x0", text: "100mm: Effectively only baseball-sized hail causes structural concern." }], engineering_thresholds: ["Steel racking withstands hail well beyond module failure thresholds"] },
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
      { curve_id: "hurricane/blade_generic", subsystem: "ROTOR_ASSEMBLY", component: "BLADE", specificity: "generic", description: "Wind turbine blade fragility under hurricane winds", L: 0.90, k: 0.0669, x0: 118, confidence: "medium", derivation: "empirical (Rose et al. 2012) + engineering-standard", physics_summary: "Hurricane winds cause blade overloading → root joint failure, leading edge erosion, blade tip deflection exceeding clearance. Blades are designed for IEC Class I/II wind loads but hurricanes can exceed design envelope.", references: [{ label: "Rose et al. 2012 — Quantifying hurricane risk to offshore wind (PNAS)", url: "https://doi.org/10.1073/pnas.1111769109", type: "empirical" }, { label: "IEC 61400-1:2019 — Wind turbine design requirements", url: "https://webstore.iec.ch/publication/26423", type: "standard" }], derivation_notes: [{ parameter: "x0", text: "118 mph: Directly from Rose et al. 2012 empirical median destruction threshold for wind turbines in Gulf Coast hurricanes." }, { parameter: "k", text: "0.0669: Fitted to Rose et al. cumulative distribution. 0% damage below 93 mph, 50% at ~118 mph, near-total at >150 mph." }, { parameter: "L", text: "0.90: Some blade sections may be salvageable even after catastrophic failure; hub and pitch system may survive blade loss." }], engineering_thresholds: ["IEC 61400-1 Class II extreme gust (V_e50): 59.5 m/s = 133 mph", "Rose et al. zero-damage threshold: <93 mph", "Rose et al. 50% destruction: ~118 mph", "Near-total destruction: >150 mph"] },
      { curve_id: "hurricane/rotor_assembly_generic", subsystem: "ROTOR_ASSEMBLY", component: "aggregate", specificity: "generic", description: "Rotor assembly aggregate (blade + hub + pitch system)", L: 0.88, k: 0.0744, x0: 116, confidence: "medium", derivation: "component-weighted aggregate", physics_summary: "Aggregate of blade + hub + pitch system. Hub and pitch have higher resistance than blades alone. Component-weighted: blade 55%, hub 25%, pitch 20%.", references: [{ label: "Rose et al. 2012 — PNAS wind turbine damage data", url: "https://doi.org/10.1073/pnas.1111769109", type: "empirical" }], derivation_notes: [{ parameter: "x0", text: "116 mph: Slightly lower than blade-only (118) because pitch system failure can precede blade failure." }, { parameter: "L", text: "0.88: Component-weighted: (0.55×0.95 + 0.25×0.80 + 0.20×0.75) = 0.8725 ≈ 0.88" }], engineering_thresholds: ["Blade root joint failure: primary failure mode", "Pitch bearing seizure under extreme load cycling"] },
      { curve_id: "hurricane/tower_section_generic", subsystem: "TOWER", component: "TOWER_SECTION", specificity: "generic", description: "Steel tubular tower fragility — anchored to Rose et al. 2012", L: 1.00, k: 0.1178, x0: 136, confidence: "medium", derivation: "empirical (Rose et al. 2012 PNAS)", physics_summary: "Steel tubular tower collapse is a catastrophic but high-threshold event. Towers are designed for 50-year extreme wind. Failure mode: base plate yielding, anchor bolt pull-out, or buckling.", references: [{ label: "Rose et al. 2012 — Tower collapse data in PNAS study", url: "https://doi.org/10.1073/pnas.1111769109", type: "empirical" }, { label: "IEC 61400-1:2019 — Tower structural design requirements", url: "https://webstore.iec.ch/publication/26423", type: "standard" }], derivation_notes: [{ parameter: "L", text: "1.00: Tower collapse means total structural loss — no salvage value for tower sections." }, { parameter: "x0", text: "136 mph: Towers have higher resistance than blades. Rose et al. shows tower failures concentrated above 130-140 mph." }, { parameter: "k", text: "0.1178: Steeper than blade curve — tower failure is more binary (stands or collapses) vs. progressive blade degradation." }], engineering_thresholds: ["IEC 61400-1 Class II design wind: 59.5 m/s (133 mph)", "Tower base plate yield stress: varies by design", "Foundation overturning moment capacity: governs collapse threshold"] },
      { curve_id: "hurricane/nacelle_generic", subsystem: "NACELLE", component: "aggregate", specificity: "generic", description: "Nacelle and drivetrain — proxy-adapted from rotor + tower", L: 0.65, k: 0.0541, x0: 130, confidence: "low", derivation: "proxy-adapted", physics_summary: "Nacelle damage is secondary — usually caused by rotor failure (blade strikes nacelle) or tower collapse. Standalone wind damage to sealed nacelle enclosure is unlikely below blade failure threshold.", references: [{ label: "Proxy-adapted from rotor + tower empirical curves", type: "proxy" }], derivation_notes: [{ parameter: "L", text: "0.65: Lower cap because nacelle internals (gearbox, generator) are protected by the enclosure unless struck by blade debris." }, { parameter: "x0", text: "130 mph: Higher than blade (118) but lower than tower (136) — nacelle damage typically follows blade failure." }], engineering_thresholds: ["Nacelle enclosure rated for IEC design wind class", "Primary risk: blade debris impact, not direct wind loading"] },
      { curve_id: "hurricane/foundation_generic", subsystem: "FOUNDATION", component: "FOUNDATION_BASE", specificity: "generic", description: "Turbine foundation — proxy-adapted, high resistance", L: 0.50, k: 0.0722, x0: 155, confidence: "low", derivation: "proxy-adapted + expert-judgment", physics_summary: "Foundations are highly resistant to wind. Failure occurs only through overturning moment exceeding foundation capacity — requires tower-collapse-level winds.", references: [{ label: "Proxy-adapted from tower collapse threshold + geotechnical engineering", type: "proxy" }, { label: "Expert judgment — foundation engineering consultants", type: "expert" }], derivation_notes: [{ parameter: "L", text: "0.50: Even at extreme winds, foundation damage is partial (cracking, settlement) rather than total loss." }, { parameter: "x0", text: "155 mph: Well above tower collapse threshold. Foundation fails only in the most extreme scenarios." }], engineering_thresholds: ["Foundation overturning capacity exceeds tower structural capacity by design", "Soil bearing failure: site-specific, depends on geotechnical conditions"] },
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
      { curve_id: "wildfire/pv_array_generic", subsystem: "PV_ARRAY", component: "PV_MODULE", specificity: "generic", description: "PV module damage from radiant heat exposure", L: 0.95, k: 0.00130, x0: 2100, confidence: "low-medium", derivation: "engineering-standard (component thresholds)", physics_summary: "Wildfire damages PV through radiant heat exposure. EVA encapsulant melts at 150-170°C, backsheet ignites at 350-400°C, tempered glass thermal-shocks at ΔT>200°C. Distance from fire front is critical.", references: [{ label: "FSim (USFS) — Large Fire Simulation System, conditional MFI", url: "https://www.fs.usda.gov/rmrs/projects/fsim", type: "model" }, { label: "UL 61730 — PV module fire safety standard", url: "https://www.shopulstandards.com/ProductDetail.aspx?UniqueKey=36818", type: "standard" }], derivation_notes: [{ parameter: "x0", text: "2,100 kW/m: Derived from component thermal thresholds at d=10m reference distance. Radiative heat flux q ∝ I/d². At 2100 kW/m and 10m, sustained exposure exceeds EVA/backsheet limits." }, { parameter: "k", text: "0.00130: Very low steepness — wildfire damage ramps gradually because heat exposure depends on duration and distance, not a single threshold." }, { parameter: "L", text: "0.95: Near-complete module loss in direct flame contact, but some frame/wiring may survive." }], engineering_thresholds: ["EVA encapsulant melting: 150-170°C sustained", "Tempered glass thermal shock: ΔT > 200°C", "Backsheet polymer ignition: 350-400°C", "Aluminum frame softening: 250°C, structural failure at 400°C"] },
      { curve_id: "wildfire/mounting_tracker_generic", subsystem: "MOUNTING", component: "TRACKER", specificity: "generic", description: "Steel tracker structural damage from fire", L: 0.80, k: 0.00060, x0: 3600, confidence: "low", derivation: "engineering-standard (steel thermal limits)", physics_summary: "Steel tracker structures have high thermal resistance. Galvanized steel retains strength to ~400°C, torque tube deformation begins at 500°C+. Motors and electronics are the weak point.", references: [{ label: "Engineering-standard: steel structural thermal limits (AISC 360)", type: "standard" }], derivation_notes: [{ parameter: "x0", text: "3,600 kW/m: High threshold — steel retains >90% yield strength below 400°C. Only intense fire front causes structural damage." }, { parameter: "L", text: "0.80: Motor/controller damage caps below 1.0; torque tube and piles are highly resilient." }], engineering_thresholds: ["Galvanized steel yield strength retention: >90% at 400°C", "Tracker motor/controller: electronics fail at much lower temps than structure"] },
      { curve_id: "wildfire/inverter_system_generic", subsystem: "INVERTER_SYSTEM", component: "INVERTER", specificity: "generic", description: "Most vulnerable subsystem — electronics fail first", L: 0.95, k: 0.00210, x0: 1300, confidence: "low-medium", derivation: "engineering-standard (electronics thermal limits)", physics_summary: "Inverter electronics are the most heat-sensitive solar subsystem. IGBT semiconductors, capacitors, and control boards fail at lower temperatures than structural components. Pad-mounted at grade level — full fire exposure.", references: [{ label: "NEMA enclosure thermal ratings", type: "standard" }, { label: "Engineering-standard: electronics thermal failure thresholds", type: "standard" }], derivation_notes: [{ parameter: "x0", text: "1,300 kW/m: Lowest x₀ of any solar subsystem — electronics fail first. IGBT junction temp limit ~175°C; capacitor electrolyte boils at ~105°C." }, { parameter: "k", text: "0.00210: Steepest wildfire curve for solar — electronics failure is more abrupt than structural degradation." }], engineering_thresholds: ["IGBT junction temperature limit: ~175°C", "Electrolytic capacitor failure: ~105°C sustained", "NEMA 4X enclosure provides some protection but limited thermal mass"] },
      { curve_id: "wildfire/substation_generic", subsystem: "SUBSTATION", component: "TRANSFORMER_MAIN", specificity: "generic", description: "Transformer fire damage", L: 0.95, k: 0.00140, x0: 1900, confidence: "low", derivation: "engineering-standard + expert-judgment", physics_summary: "Transformer oil is flammable (flash point ~145°C for mineral oil). Fire reaching the substation can ignite oil, causing catastrophic transformer failure. Bushings and control equipment are also vulnerable.", references: [{ label: "IEEE C57.12.00 — Transformer thermal requirements", url: "https://standards.ieee.org/ieee/C57.12.00/10727/", type: "standard" }, { label: "NFPA 850 — Fire protection for electric generating plants", type: "standard" }], derivation_notes: [{ parameter: "x0", text: "1,900 kW/m: Transformer oil flash point (~145°C) sets the critical threshold. At reference distance, this intensity produces sufficient radiant flux." }], engineering_thresholds: ["Mineral oil flash point: ~145°C", "Bushing porcelain thermal shock: ΔT > 150°C", "Control cabinet electronics: similar to inverter thresholds"] },
      { curve_id: "wildfire/electrical_cables_generic", subsystem: "ELECTRICAL", component: "CABLE_COLLECTION", specificity: "generic", description: "Underground cables resilient; junction boxes vulnerable", L: 0.65, k: 0.00080, x0: 2500, confidence: "low", derivation: "engineering-standard", physics_summary: "Underground cables are protected by soil thermal mass. Aboveground junction boxes, combiner boxes, and exposed cable runs are vulnerable. XLPE insulation degrades at >90°C sustained.", references: [{ label: "Engineering-standard: cable insulation thermal limits (IEC 60502)", type: "standard" }], derivation_notes: [{ parameter: "L", text: "0.65: Capped because underground sections (~60% of cable cost) survive wildfire. Only aboveground runs and junction boxes are destroyed." }, { parameter: "x0", text: "2,500 kW/m: Underground cables protected; high intensity needed to damage buried infrastructure." }], engineering_thresholds: ["XLPE cable insulation: degradation at >90°C sustained", "Junction box electronics: similar to inverter failure temps", "Underground cables protected by ~0.5-1m soil cover"] },
      { curve_id: "wildfire/civil_infra_generic", subsystem: "CIVIL_INFRA", component: "aggregate", specificity: "generic", description: "Roads, fencing, O&M buildings", L: 0.75, k: 0.00090, x0: 2100, confidence: "low", derivation: "proxy-adapted", physics_summary: "Roads (gravel/asphalt), fencing (galvanized steel), and O&M buildings (steel/wood frame) have mixed vulnerability. Wood structures ignite readily; steel fencing survives; roads are largely unaffected.", references: [{ label: "Proxy-adapted from HAZUS wildfire building damage functions", type: "proxy" }], derivation_notes: [{ parameter: "L", text: "0.75: Mixed bag — wood buildings destroyed, steel fencing survives, roads unaffected. Weighted average of component vulnerabilities." }], engineering_thresholds: ["Wood frame ignition: 300-400°C (direct flame contact)", "Galvanized steel fencing: largely fire-resistant", "Asphalt roads: surface damage only in extreme fires"] },
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
      { curve_id: "hurricane/pv_array_tracker_stow", subsystem: "PV_ARRAY", component: "PV_MODULE", specificity: "specs", match_criteria: { tracking_type: "single_axis" }, description: "PV modules on tracker in hurricane stow mode", L: 0.85, k: 0.055, x0: 148, confidence: "medium", derivation: "empirical (FPL Ian data) + proxy", physics_summary: "SAT in hurricane stow (0° tilt) minimizes wind loading area. FPL Hurricane Ian data shows stowed arrays performed significantly better.", references: [{ label: "Ceferino et al. 2023 — Hurricane PV fragility (Nature Energy)", url: "https://doi.org/10.1038/s41560-023-01380-4", type: "empirical" }, { label: "FPL Hurricane Ian (2022) post-event solar damage assessment", type: "empirical" }], derivation_notes: [{ parameter: "x0", text: "148 mph: Stowed trackers survived Cat 4 Ian (145-155 mph) with moderate damage. x₀ set at Cat 4/5 boundary." }, { parameter: "k", text: "0.055: Moderate steepness — stowed panels have consistent failure behavior once wind exceeds stow rating." }], engineering_thresholds: ["Tracker stow activation: typically 40-55 mph", "Stowed survival rating: most trackers rated to 110-130 mph", "Cat 4 Ian (2022): stowed arrays showed 15-30% damage at 145 mph"] },
      { curve_id: "hurricane/pv_array_tracker_midtilt", subsystem: "PV_ARRAY", component: "PV_MODULE", specificity: "specs", description: "PV modules on tracker with stow failure (worst case)", L: 0.95, k: 0.065, x0: 115, confidence: "medium-low", derivation: "empirical (n=2 case studies)", physics_summary: "Worst case: tracker stow fails, leaving panels at mid-tilt (10-30°). Dramatically increased wind loading area causes module uplift, racking deformation, and module-to-module collision.", references: [{ label: "Case studies of stow failures during Hurricanes Ian and Irma (n=2)", type: "empirical" }], derivation_notes: [{ parameter: "x0", text: "115 mph: Significantly lower than stowed (148 mph). Unstowed panels present ~3-4x the wind loading area, causing earlier failure." }, { parameter: "L", text: "0.95: Near-total module loss — mid-tilt panels in hurricanes experience uplift, racking collapse, and module-on-module damage." }], engineering_thresholds: ["Mid-tilt wind loading: 3-4x higher than stowed", "Module uplift force: proportional to sin(tilt) × wind_speed²"] },
      { curve_id: "hurricane/pv_array_fixed_tilt", subsystem: "PV_ARRAY", component: "PV_MODULE", specificity: "specs", match_criteria: { tracking_type: "fixed" }, description: "PV modules on fixed 20-25° tilt mount", L: 0.90, k: 0.048, x0: 130, confidence: "medium", derivation: "empirical (Ceferino et al. 2023)", physics_summary: "Fixed-tilt arrays at 20-25° have moderate wind loading. No stow capability means consistent exposure. Ceferino et al. 2023 provides direct empirical fragility data.", references: [{ label: "Ceferino et al. 2023 — Empirical PV fragility (Nature Energy)", url: "https://doi.org/10.1038/s41560-023-01380-4", type: "empirical" }], derivation_notes: [{ parameter: "x0", text: "130 mph: From Ceferino et al. empirical data. Fixed-tilt shows ~50% damage at Cat 4 threshold." }, { parameter: "k", text: "0.048: Wide transition reflecting variability in installation quality, row position, and terrain." }], engineering_thresholds: ["ASCE 7-22 component wind load: varies by exposure category", "Ceferino et al. observed damage onset: ~100 mph"] },
      { curve_id: "hurricane/pv_array_generic", subsystem: "PV_ARRAY", component: "PV_MODULE", specificity: "generic", description: "Fleet-average PV array hurricane fragility", L: 0.85, k: 0.050, x0: 135, confidence: "medium", derivation: "composite/proxy", physics_summary: "Fleet-average PV array fragility. Composite of tracker-stow, tracker-midtilt, and fixed-tilt curves, weighted by US fleet composition (~70% SAT, ~30% fixed).", references: [{ label: "Composite/proxy from tracker and fixed-tilt curves", type: "proxy" }], derivation_notes: [{ parameter: "x0", text: "135 mph: Fleet-weighted average of stowed tracker (148), mid-tilt (115), and fixed (130). Conservative — assumes some stow failures in the fleet." }], engineering_thresholds: ["Fleet composition assumption: ~70% SAT, ~30% fixed-tilt"] },
      { curve_id: "hurricane/mounting_tracker_solar", subsystem: "MOUNTING", component: "TRACKER", specificity: "generic", description: "Tracker structural damage from hurricane", L: 0.80, k: 0.055, x0: 120, confidence: "low-medium", derivation: "engineering-standard + proxy", physics_summary: "Tracker structural damage: torque tube bending, pile pull-out, bearing failure. Structure can fail even if modules don't — or modules rip off intact structure.", references: [{ label: "Engineering-standard: tracker wind load design per ASCE 7-22", type: "standard" }, { label: "Proxy from pre/post-event solar farm assessments", type: "proxy" }], derivation_notes: [{ parameter: "x0", text: "120 mph: Tracker structures typically rated to 110-130 mph wind survival. x₀ at the middle of this design range." }], engineering_thresholds: ["Tracker survival wind speed rating: typically 110-130 mph (varies by manufacturer)", "Pile pull-out: governed by soil conditions"] },
      { curve_id: "hurricane/mounting_fixed_solar", subsystem: "MOUNTING", component: "FIXED_MOUNT", specificity: "generic", description: "Fixed mount structural damage from hurricane", L: 0.70, k: 0.045, x0: 140, confidence: "low", derivation: "engineering-standard + proxy", physics_summary: "Fixed-mount racking (steel rails, clamps, driven piles) is more resistant than trackers — no moving parts, no stow dependency. Failure mode is progressive: clamp loosening → module uplift → rack deformation.", references: [{ label: "Engineering-standard: fixed racking wind design per ASCE 7-22", type: "standard" }, { label: "Proxy from post-hurricane damage assessments", type: "proxy" }], derivation_notes: [{ parameter: "x0", text: "140 mph: Higher than tracker (120) — fixed mounts have no stow failure mode and fewer moving parts." }, { parameter: "L", text: "0.70: Lower cap than tracker because fixed mounts are simpler and partial failures are less cascading." }], engineering_thresholds: ["Fixed racking survival: typically rated to 130-150 mph", "Clamp torque spec: critical for module retention"] },
      { curve_id: "hurricane/substation_solar", subsystem: "SUBSTATION", component: "TRANSFORMER_MAIN", specificity: "generic", description: "Substation compound wind + debris + rain damage", L: 0.80, k: 0.040, x0: 120, confidence: "low-medium", derivation: "HAZUS proxy + NERC post-event data", physics_summary: "Substation damage from hurricanes: wind loading on bushings, rain ingress into control cabinets, debris impact on transformer radiators, and potential oil spill from structural deformation.", references: [{ label: "HAZUS-MH Hurricane Model — Utility substation fragility", url: "https://www.fema.gov/flood-maps/products-tools/hazus", type: "proxy" }, { label: "NERC post-event reports on substation damage from hurricanes", type: "empirical" }], derivation_notes: [{ parameter: "x0", text: "120 mph: HAZUS utility substation fragility median. Bushings are the weak point — porcelain fails before steel structure." }], engineering_thresholds: ["Porcelain bushing wind load capacity: typically 100-130 mph", "Transformer radiator: vulnerable to wind-borne debris"] },
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
      { curve_id: "strong_wind/rotor_assembly_generic", subsystem: "ROTOR_ASSEMBLY", component: "aggregate", specificity: "generic", description: "Rotor assembly fragility under strong non-hurricane wind", L: 0.90, k: 0.07, x0: 125, confidence: "low-medium", derivation: "engineering-standard + limited event data", physics_summary: "Non-hurricane strong wind (derechos, downbursts) hits turbines that may still be spinning. Unlike hurricanes, turbines may not shut down in time — higher dynamic loads from combined rotation + gust.", references: [{ label: "IEC 61400-1:2019 — Extreme wind load cases (DLC 6.x)", url: "https://webstore.iec.ch/publication/26423", type: "standard" }, { label: "Limited post-event data from US derecho events", type: "empirical" }], derivation_notes: [{ parameter: "x0", text: "125 mph: Higher than hurricane blade (118 mph) because strong wind events are shorter duration and operational turbines have some aerodynamic resilience." }], engineering_thresholds: ["Turbine cut-out wind speed: typically 56 mph (25 m/s)", "IEC extreme operating gust: design dependent on turbulence class"] },
      { curve_id: "strong_wind/tower_generic", subsystem: "TOWER", component: "TOWER_SECTION", specificity: "generic", description: "Tower section structural damage from strong wind", L: 0.75, k: 0.065, x0: 135, confidence: "low", derivation: "engineering-standard", physics_summary: "Tower structural response to non-hurricane wind is similar to hurricane but typically with shorter duration loading. Fatigue-driven microcracking at welds is the long-term concern.", references: [{ label: "IEC 61400-1:2019 — Tower structural requirements", url: "https://webstore.iec.ch/publication/26423", type: "standard" }], derivation_notes: [{ parameter: "L", text: "0.75: Lower than hurricane (1.00) because non-hurricane wind events are less likely to cause complete tower collapse." }, { parameter: "x0", text: "135 mph: Similar to hurricane tower threshold — steel capacity is wind-source-agnostic." }], engineering_thresholds: ["Tower design life: 20+ years with fatigue loading", "ASCE 7-22 basic wind speed maps: 90-180 mph depending on region"] },
      { curve_id: "strong_wind/nacelle_generic", subsystem: "NACELLE", component: "aggregate", specificity: "generic", description: "Nacelle damage from strong wind events", L: 0.70, k: 0.06, x0: 135, confidence: "low", derivation: "proxy-adapted", physics_summary: "Nacelle damage from non-hurricane wind is primarily from rotor failure debris or yaw system stress. Direct wind pressure on sealed nacelle enclosure is unlikely to cause failure.", references: [{ label: "Proxy-adapted from hurricane nacelle curve + wind class data", type: "proxy" }], derivation_notes: [{ parameter: "L", text: "0.70: Similar rationale to hurricane nacelle — most damage is secondary from blade/rotor failure." }, { parameter: "x0", text: "135 mph: Aligned with tower threshold — nacelle damage follows structural failure." }], engineering_thresholds: ["Yaw system: designed for operational wind loads; extreme gusts can exceed yaw motor capacity"] },
      { curve_id: "strong_wind/foundation_generic", subsystem: "FOUNDATION", component: "FOUNDATION_BASE", specificity: "generic", description: "Foundation is highly resistant to non-hurricane wind", L: 0.10, k: 0.05, x0: 160, confidence: "low", derivation: "expert-judgment", physics_summary: "Foundations are designed for full 50-year extreme wind. Non-hurricane strong wind events almost never approach foundation failure thresholds.", references: [{ label: "Expert judgment — foundation over-design margin", type: "expert" }], derivation_notes: [{ parameter: "L", text: "0.10: Essentially a placeholder — foundation damage from non-hurricane wind is extremely unlikely." }, { parameter: "x0", text: "160 mph: Beyond any realistic non-hurricane wind event in the US." }], engineering_thresholds: ["Foundation design: 50-year extreme wind with safety factor ≥ 1.5"] },
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
      { curve_id: "wildfire/rotor_assembly_wind_generic", subsystem: "ROTOR_ASSEMBLY", component: "aggregate", specificity: "generic", description: "Near-zero risk — elevated 80-100m above ground fire", L: 0.10, k: 0.00008, x0: 75000, confidence: "very-low", derivation: "expert-judgment (near-zero risk)", physics_summary: "Rotor assembly at 80-120m height is essentially immune to ground-level wildfire. No documented case of external wildfire damaging elevated turbine components.", references: [{ label: "Expert judgment — no empirical data exists for this combination", type: "expert" }], derivation_notes: [{ parameter: "x0", text: "75,000 kW/m: Placeholder extreme value. Radiative heat flux at 80m+ height from any realistic ground fire is negligible." }, { parameter: "L", text: "0.10: Near-zero cap — even in theory, only direct flame engulfment (impossible at hub height) could cause damage." }], engineering_thresholds: ["Hub height: 80-120m — far above flame height of even extreme crown fires (30-50m)", "Radiative heat flux at hub height: <1% of ground level"] },
      { curve_id: "wildfire/nacelle_wind_generic", subsystem: "NACELLE", component: "aggregate", specificity: "generic", description: "Near-zero risk — nacelle at hub height", L: 0.15, k: 0.00006, x0: 80000, confidence: "very-low", derivation: "expert-judgment (near-zero risk)", physics_summary: "Same as rotor — nacelle at hub height is effectively immune to ground fire. Only internal fire (electrical fault) or burning turbine component poses risk.", references: [{ label: "Expert judgment — no empirical data for wildfire × elevated turbine", type: "expert" }], derivation_notes: [{ parameter: "x0", text: "80,000 kW/m: Slightly higher than rotor because nacelle has enclosed electronics that could theoretically be affected by extreme convective plume — but this is near-impossible." }], engineering_thresholds: ["Nacelle at hub height: same protection as rotor from ground fire"] },
      { curve_id: "wildfire/tower_wind_generic", subsystem: "TOWER", component: "TOWER_SECTION", specificity: "generic", description: "Tower base exposure to ground fire — only subsystem with meaningful wildfire vulnerability", L: 0.50, k: 0.00045, x0: 6000, confidence: "low", derivation: "engineering-standard (steel thermal limits)", physics_summary: "Tower BASE is the only wind turbine subsystem with meaningful wildfire vulnerability. Steel retains strength to ~400°C but the base plate, anchor bolts, and coating are exposed to ground fire.", references: [{ label: "AISC 360 — Structural steel thermal performance", type: "standard" }, { label: "Engineering-standard: steel yield strength vs. temperature curves", type: "standard" }], derivation_notes: [{ parameter: "x0", text: "6,000 kW/m: Only the tower base (bottom 5-10m) is exposed. At this intensity, radiant flux at base produces steel surface temps approaching yield strength reduction zone." }, { parameter: "L", text: "0.50: Only base section affected — upper tower sections at height are protected. Partial damage to coating, base plate possible." }], engineering_thresholds: ["Steel yield strength: retains >90% at 400°C, drops to 50% at 600°C", "Protective coating failure: ~250-300°C", "Anchor bolt integrity: ~500°C"] },
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
      { curve_id: "flood/pv_array_fixed_tilt", subsystem: "PV_ARRAY", component: "PV_MODULE", specificity: "specs", match_criteria: { tracking_type: "fixed" }, description: "Fixed-tilt panels, leading edge at ~2 ft", L: 0.90, k: 1.8, x0: 2.0, confidence: "medium", derivation: "empirical (Thailand study) + HAZUS proxy", physics_summary: "Fixed-tilt panels at 20-25° have leading edge at ~2 ft above ground. Once water reaches panels: cell corrosion, junction box shorting, backsheet delamination.", references: [{ label: "HAZUS-MH Flood Model — depth-damage functions", url: "https://www.fema.gov/flood-maps/products-tools/hazus", type: "proxy" }, { label: "Thailand 2011 solar flood damage study", type: "empirical" }], derivation_notes: [{ parameter: "x0", text: "2.0 ft: Panel leading edge height for fixed 20-25° tilt. Water contact at this depth → damage onset is rapid." }, { parameter: "k", text: "1.8: High steepness — flood damage to electronics is near-binary." }], engineering_thresholds: ["Panel leading edge height: ~2 ft for standard fixed-tilt", "Junction box IP67: insufficient for prolonged flooding"] },
      { curve_id: "flood/pv_array_tracker_horizontal", subsystem: "PV_ARRAY", component: "PV_MODULE", specificity: "specs", match_criteria: { tracking_type: "single_axis" }, description: "SAT in horizontal stow, panels at ~2.5 ft", L: 0.90, k: 1.8, x0: 2.5, confidence: "medium", derivation: "empirical + engineering-standard", physics_summary: "SAT in horizontal stow raises panels slightly higher (~2.5 ft) than fixed-tilt. Same damage mechanisms once water reaches modules.", references: [{ label: "Empirical solar flood data + engineering-standard panel height calculations", type: "empirical" }], derivation_notes: [{ parameter: "x0", text: "2.5 ft: Horizontal stow panel height for typical SAT. 0.5 ft advantage over fixed-tilt." }], engineering_thresholds: ["SAT horizontal stow height: ~2.5 ft (varies by manufacturer)"] },
      { curve_id: "flood/pv_array_tracker_flood_stow", subsystem: "PV_ARRAY", component: "PV_MODULE", specificity: "specs", description: "SAT in flood stow (75-85° tilt), panels at ~7 ft", L: 0.90, k: 1.8, x0: 7.0, confidence: "low-medium", derivation: "engineering-standard + expert-judgment", physics_summary: "Flood stow tilts SAT to 75-85°, raising panel edge to ~7 ft. Dramatically reduces flood vulnerability but not all tracker systems have this capability.", references: [{ label: "Engineering-standard: tracker flood stow geometry", type: "standard" }, { label: "Expert judgment on flood stow effectiveness", type: "expert" }], derivation_notes: [{ parameter: "x0", text: "7.0 ft: Panel edge height at 75-85° tilt. Only deep flooding (>7 ft) reaches panels — rare for most solar sites." }], engineering_thresholds: ["Flood stow panel height: ~7 ft at 80° tilt", "Flood stow activation: requires flood warning + functional tracker system"] },
      { curve_id: "flood/inverter_system_generic", subsystem: "INVERTER_SYSTEM", component: "INVERTER", specificity: "generic", description: "Pad-mounted inverter at ~0.75 ft — near-binary failure", L: 0.95, k: 3.5, x0: 0.75, confidence: "medium", derivation: "engineering-standard (NEMA) + HAZUS", physics_summary: "Pad-mounted inverters sit at ~0.75 ft elevation. Floodwater contact with electronics is catastrophic — near-binary failure. NEMA enclosure provides minutes of protection, not hours.", references: [{ label: "NEMA enclosure water ingress standards", type: "standard" }, { label: "HAZUS-MH Flood Model — electrical equipment DDF", url: "https://www.fema.gov/flood-maps/products-tools/hazus", type: "proxy" }], derivation_notes: [{ parameter: "x0", text: "0.75 ft: Pad-mounted inverter base elevation. Any flood depth above this contacts the enclosure." }, { parameter: "k", text: "3.5: Very high steepness — near-binary failure. Once water enters, electronics are destroyed within hours." }, { parameter: "L", text: "0.95: Near-total loss — flooded inverters are typically replaced, not repaired." }], engineering_thresholds: ["Pad-mount elevation: ~0.75 ft (9 inches) above grade", "NEMA 4X enclosure: designed for hose-down, not submersion", "Electronics failure: water intrusion → short circuit → total loss"] },
      { curve_id: "flood/substation_generic", subsystem: "SUBSTATION", component: "TRANSFORMER_MAIN", specificity: "generic", description: "Transformer flooding — oil contamination at low depth", L: 0.95, k: 2.5, x0: 1.5, confidence: "medium", derivation: "IEEE C57 + NERC + HAZUS", physics_summary: "Transformer flooding causes oil contamination (water-in-oil degrades dielectric strength), bushing porcelain damage, and control equipment destruction. Even shallow flooding is damaging.", references: [{ label: "IEEE C57.12.00 — Transformer requirements for liquid-immersed units", url: "https://standards.ieee.org/ieee/C57.12.00/10727/", type: "standard" }, { label: "NERC post-event reports on flooded substations", type: "empirical" }, { label: "HAZUS-MH utility substation flood curves", url: "https://www.fema.gov/flood-maps/products-tools/hazus", type: "proxy" }], derivation_notes: [{ parameter: "x0", text: "1.5 ft: Transformer base elevation. Water contact with oil-filled equipment at this depth causes dielectric breakdown." }, { parameter: "k", text: "2.5: Steep — transformer flood damage is severe once oil contamination begins." }], engineering_thresholds: ["Transformer oil dielectric breakdown: water content >30 ppm", "IEEE C57 moisture limits for transformer insulation", "Bushing porcelain: vulnerable to thermal shock from rapid water contact"] },
      { curve_id: "flood/electrical_cables_generic", subsystem: "ELECTRICAL", component: "CABLE_COLLECTION", specificity: "generic", description: "Underground cables resilient; junction boxes vulnerable", L: 0.55, k: 1.0, x0: 3.0, confidence: "low-medium", derivation: "engineering-standard", physics_summary: "Underground cables are designed for wet conditions (XLPE insulation rated for submersion). Vulnerability comes from above-ground junction boxes, combiners, and cable terminations.", references: [{ label: "Engineering-standard: cable insulation ratings (IEC 60502, NEC Article 310)", type: "standard" }], derivation_notes: [{ parameter: "L", text: "0.55: Underground cables (~60% of cost) survive flooding. Only junction boxes and above-ground terminations are vulnerable." }, { parameter: "x0", text: "3.0 ft: Above-ground junction box height. Deeper floods also cause soil erosion exposing buried cables." }], engineering_thresholds: ["Underground XLPE cables: rated for continuous wet operation", "Junction box IP rating: typically IP65 — insufficient for submersion"] },
      { curve_id: "flood/civil_infra_generic", subsystem: "CIVIL_INFRA", component: "aggregate", specificity: "generic", description: "Roads, fencing, O&M buildings", L: 0.70, k: 1.2, x0: 2.0, confidence: "medium", derivation: "HAZUS commercial 1-story + JRC transport", physics_summary: "Roads, fencing, and O&M buildings. Gravel roads wash out at 1-2 ft; O&M buildings (1-story commercial) follow HAZUS flood curves; steel fencing is resilient but gates/electronics fail.", references: [{ label: "HAZUS-MH Flood Model — COM1 (1-story commercial) DDF", url: "https://www.fema.gov/flood-maps/products-tools/hazus", type: "proxy" }, { label: "JRC Global flood depth-damage functions (transport infrastructure)", url: "https://publications.jrc.ec.europa.eu/repository/handle/JRC105688", type: "proxy" }], derivation_notes: [{ parameter: "x0", text: "2.0 ft: Composite of road washout (1-2 ft), building damage (HAZUS COM1 at 2 ft = ~30% damage), and fencing damage." }, { parameter: "k", text: "1.2: Moderate steepness — gradual ramp because different civil components fail at different depths." }], engineering_thresholds: ["Gravel road washout: 1-2 ft flowing water", "HAZUS COM1 building: ~30% damage at 2 ft depth"] },
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
      { curve_id: "winter_weather/rotor_assembly_generic", subsystem: "ROTOR_ASSEMBLY", component: "aggregate", specificity: "generic", description: "Blade ice loading, mass imbalance, pitch bearing freeze", L: 0.60, k: 3.5, x0: 1.50, confidence: "low-medium", derivation: "engineering-standard (IEC 61400-1 Annex L, ISO 12494)", physics_summary: "Ice accumulation on blades causes: mass imbalance → vibration → bearing damage; aerodynamic profile change → reduced output; extreme loading → pitch bearing freeze → blade root stress.", references: [{ label: "IEC 61400-1:2019 Annex L — Ice loading considerations", url: "https://webstore.iec.ch/publication/26423", type: "standard" }, { label: "ISO 12494:2017 — Atmospheric icing of structures", url: "https://www.iso.org/standard/72445.html", type: "standard" }], derivation_notes: [{ parameter: "x0", text: "1.50 in: IEC Annex L ice mass class IC2 (~1.5 in equivalent). At this accretion, blade mass imbalance exceeds vibration limits." }, { parameter: "k", text: "3.5: Steep — rotor damage from icing is relatively threshold-driven. Below x₀, operational issues only; above, structural damage escalates." }, { parameter: "L", text: "0.60: Below blades-only because hub/pitch contribute less to ice damage. Main risk is blade root fatigue, not total destruction." }], engineering_thresholds: ["IEC 61400-1 ice mass class IC2: reference accretion", "Blade mass imbalance limit: typically < 1% of blade mass", "Pitch bearing freeze point: depends on grease spec and temperature"] },
      { curve_id: "winter_weather/tower_generic", subsystem: "TOWER", component: "TOWER_SECTION", specificity: "generic", description: "Tower ice loading — combined with wind loading", L: 0.30, k: 2.0, x0: 2.50, confidence: "low", derivation: "engineering-standard (ASCE 7-22 + ISO 12494)", physics_summary: "Tower ice loading adds static weight + increases wind drag area. Combined ice + wind loading can exceed design envelope. Ice shedding from upper sections can also damage base equipment.", references: [{ label: "ASCE 7-22 Chapter 10 — Ice loads", url: "https://doi.org/10.1061/9780784415788", type: "standard" }, { label: "ISO 12494:2017 — Atmospheric icing action on structures", url: "https://www.iso.org/standard/72445.html", type: "standard" }], derivation_notes: [{ parameter: "L", text: "0.30: Low cap — tower structural collapse from ice alone is very rare. Damage is primarily coating, minor deformation." }, { parameter: "x0", text: "2.50 in: Very heavy icing required for structural concern. ASCE 7-22 50-year ice maps show max ~2.5 in in SE US." }], engineering_thresholds: ["ASCE 7-22 50-year ice thickness: up to 2.5 in (SE US mountains)", "Combined ice + wind load factor: 1.0D + 1.0Di + 0.7W (ASCE 7)"] },
      { curve_id: "winter_weather/nacelle_generic", subsystem: "NACELLE", component: "aggregate", specificity: "generic", description: "Cold-start failures, lubricant viscosity issues", L: 0.35, k: 3.0, x0: 0.75, confidence: "low", derivation: "proxy-adapted + expert-judgment", physics_summary: "Nacelle icing issues: cold-start failures (lubricant viscosity too high for startup), control sensor icing (wind vane, anemometer freeze), and cooling system ice blockage.", references: [{ label: "Proxy-adapted from cold-weather turbine operational data", type: "proxy" }, { label: "Expert judgment — cold climate turbine operations", type: "expert" }], derivation_notes: [{ parameter: "x0", text: "0.75 in: Low threshold because nacelle electronics and sensors are vulnerable to any icing conditions." }, { parameter: "L", text: "0.35: Limited physical damage — most issues are operational (cold-start, sensor freeze) rather than structural." }], engineering_thresholds: ["Lubricant viscosity limit: depends on oil grade (typically -30 to -40°C)", "Anemometer/wind vane icing: causes erroneous readings → operational shutdown"] },
      { curve_id: "winter_weather/electrical_generic", subsystem: "ELECTRICAL", component: "aggregate", specificity: "generic", description: "Transmission line icing, galloping, conductor clash", L: 0.70, k: 4.0, x0: 0.75, confidence: "medium", derivation: "engineering-standard (PNNL tower fragility)", physics_summary: "Transmission line icing → galloping (wind-induced oscillation of iced conductors), conductor clash, and tower structural overload. PNNL fragility curves provide direct reference.", references: [{ label: "PNNL 2023 — Transmission tower fragility under ice and wind", url: "https://www.pnnl.gov/", type: "empirical" }, { label: "ASCE 7-22 — Combined ice and wind loading", url: "https://doi.org/10.1061/9780784415788", type: "standard" }], derivation_notes: [{ parameter: "x0", text: "0.75 in: Low threshold — transmission lines are highly sensitive to icing. PNNL data shows significant tower failures at 0.5-1.0 in accretion." }, { parameter: "k", text: "4.0: Very steep — transmission line icing damage escalates rapidly once galloping begins." }, { parameter: "L", text: "0.70: Transmission lines are the most vulnerable wind farm subsystem to icing, but underground collection cables are protected." }], engineering_thresholds: ["Galloping onset: typically 0.25-0.5 in ice accretion + moderate wind", "PNNL fragility: 50% tower failure at ~0.75 in accretion with 40 mph wind", "Conductor clash: ice asymmetry causes phase-to-phase contact"] },
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
