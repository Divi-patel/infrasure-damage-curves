# Research Context for Damage Curve Derivation

## What This Is For
InfraSure is building a transparent damage curve library for renewable energy (RE) assets — solar and wind farms. Each damage curve maps hazard intensity (x-axis) to damage ratio (y-axis, 0.0 to 1.0) for a specific subsystem × hazard pair.

## Functional Form
All curves use the logistic/sigmoid form:
```
f(x) = L / (1 + exp(-k * (x - x0)))
```
Where:
- L = maximum damage ratio (0.0-1.0), i.e., the asymptotic cap
- k = steepness (how quickly damage ramps up)
- x0 = midpoint (intensity at which damage = L/2)

## What Each Research File Must Cover

For each subsystem × hazard pair:

### 1. Physics of Damage
- What physically happens to this subsystem when exposed to this hazard
- Primary failure mechanisms (e.g., hail impact → glass fracture → cell microcracking → power loss)
- Secondary/cascading effects
- Failure modes: sudden vs gradual, repairable vs replacement

### 2. Intensity Variable Selection
- What variable to use on the x-axis (following causal hierarchy from derivation guide)
- Units and measurement conventions
- Why this variable is the right Level 2 choice
- Conversion factors if needed (e.g., hail diameter to kinetic energy)

### 3. Engineering Thresholds & Standards
- IEC, ASCE, UL, ASTM, NFPA, or other standards that define design limits
- Component test standards (e.g., IEC 61215 hail test = 25mm at 23 m/s)
- Design wind speeds from IEC 61400-1 turbine classes
- Threshold intensities where damage onset begins, is moderate, and reaches saturation

### 4. Component-Level Breakdown
- Which specific components within the subsystem are vulnerable
- Cost weighting of each component within the subsystem
- Damage thresholds per component
- How individual component failures aggregate to subsystem damage

### 5. Existing Damage Curves / Functions in Literature
- What HAZUS, CLIMADA, IBHS, academic papers, and industry reports provide
- Specific parameter values where available
- Whether curves are RE-specific or adapted from buildings/infrastructure
- Gaps in current literature

### 6. Recommended Curve Parameters
- Proposed L, k, x0 values with justification
- How these map to the 10%, 50%, 90% damage thresholds
- Confidence level (high/medium/low) and why
- Sensitivity analysis — which parameter matters most

### 7. Sources & References
- Every source cited must include: author/organization, title, year, and URL/DOI where available
- Distinguish between: empirical data, engineering standards, expert judgment, proxy adaptation
- Rate source quality: peer-reviewed > government standard > industry report > expert judgment

### 8. Data Gaps & Recommendations
- What data doesn't exist yet
- What validation would improve confidence
- Recommended next steps for curve refinement

## Key Existing Sources Referenced in InfraSure's Work
- HAZUS Flood/Hurricane/Wind Model Technical Manual (FEMA)
- CLIMADA open-source impact functions (ETH Zurich)
- IBHS hail vulnerability studies
- First Street Foundation / Arup methodology
- IEC 61215 (PV module testing), IEC 61400-1 (wind turbine design)
- ASCE 7-22 (minimum design loads)
- Fragility Functions Resource Report (multi-hazard)
- Prahl et al. (2016) unified damage function framework
- NREL SAM cost data
- "The vulnerability of solar panels to hail" paper
- "An open-source radar-based hail damage model" paper
- "Towards an improved wind speed scale vs. damage description" paper
- "The development of wind damage bands for buildings" paper

## Curve ID Naming Convention
```
{hazard_type}/{target}_{specificity}
```
Examples: `hail/pv_module_generic`, `hurricane/blade_generic`, `wildfire/pv_array_generic`

## InfraSure's Subsystem Taxonomy

### Solar Subsystems (with typical capex weights):
- PV_ARRAY (0.28-0.35) — Components: PV_MODULE
- MOUNTING (0.08-0.12) — Components: TRACKER, FIXED_MOUNT
- INVERTER_SYSTEM (0.06-0.10) — Components: INVERTER, COMBINER_BOX
- SUBSTATION (0.05-0.10) — Components: TRANSFORMER_MAIN, TRANSFORMER_AUX, SWITCHGEAR
- ELECTRICAL (0.08-0.12) — Components: CABLE_COLLECTION, CABLE_AC
- CIVIL_INFRA (0.05-0.10) — Components: ROAD, FENCING, BUILDING
- SCADA (0.02-0.05) — Components: MONITORING_SYSTEM, MET_STATION

### Wind Subsystems (with typical capex weights):
- ROTOR_ASSEMBLY (0.25-0.30) — Components: BLADE, HUB, PITCH_SYSTEM
- NACELLE (0.20-0.25) — Components: GEARBOX, GENERATOR, YAW_SYSTEM, COOLING_SYSTEM
- TOWER (0.12-0.15) — Components: TOWER_SECTION
- FOUNDATION (0.08-0.12) — Components: FOUNDATION_BASE
- POWER_ELECTRONICS (0.03-0.05) — Components: POWER_CONVERTER, CONTROLLER
- SUBSTATION (0.05-0.10) — same as solar
- ELECTRICAL (0.08-0.12) — same as solar
- CIVIL_INFRA (0.05-0.10) — same as solar
- SCADA (0.02-0.05) — same as solar
