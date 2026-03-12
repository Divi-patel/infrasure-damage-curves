# Hazard Intensity Variables

> Why each hazard type uses its specific intensity metric and where to source the data

---

## Overview

The choice of intensity variable is one of the most consequential decisions in damage modeling. The wrong variable introduces noise, reduces predictive power, and makes curves non-transferable across regions. InfraSure follows a **causal hierarchy** — selecting the variable that most directly causes the physical damage mechanism.

---

## The Causal Hierarchy

For any hazard, there are multiple candidate intensity metrics. The hierarchy ranks them by causal proximity to damage:

```
CAUSAL HIERARCHY (most → least direct)
════════════════════════════════════════════════════════════════

Level 1: Direct Damage Driver
├── The physical quantity that directly causes failure
├── Examples: kinetic energy of hailstone, water depth at equipment
├── Best for damage modeling but often hard to measure/forecast
│
Level 2: Observable Proxy ← PREFERRED FOR MODELING
├── Measurable quantity with strong causal link to Level 1
├── Examples: hail diameter (proxy for KE), wind speed (proxy for force)
├── Available from weather data, forecasts, and post-event surveys
│
Level 3: Hazard Characterization
├── Event-level metric that correlates with damage
├── Examples: Saffir-Simpson category, EF-scale rating
├── Too coarse for continuous damage functions
│
Level 4: Exposure Indicator
├── Presence/absence or frequency metric
├── Examples: "in flood zone", "wildfire risk area"
├── Insufficient for quantitative damage estimation
```

All InfraSure curves use **Level 2 variables** — the sweet spot between causal directness and data availability.

---

## Intensity Variables by Hazard

### Hail

| Property | Value |
|----------|-------|
| **Variable** | `hail_diameter_mm` |
| **Unit** | Millimeters (mm) |
| **Measurement** | Maximum Expected Size of Hail (MESH) from dual-pol radar |
| **Range in curves** | 25–120 mm |
| **Why this variable** | Diameter determines kinetic energy (KE ∝ d³ × v²), which is the direct damage driver. Diameter is the most widely available metric from radar networks. |

**Causal chain:**
```
Hail diameter → Kinetic energy → Impact force → Glass fracture → Module damage
     ↑                                    ↑
  Measurable                        Depends on d, v,
  from radar                        angle, glass type
```

**Data sources:**
- **NOAA MRMS MESH** — Gridded radar-derived hail size, ~1 km resolution, 2-minute updates
- **NOAA Storm Events Database** — Post-event hail reports with measured stone sizes
- **SPC severe weather reports** — Historical hail events
- **Private hail data** — HailTrace, Understory (ground-truth sensor networks)

**Conversion to kinetic energy (for reference):**
```
KE = 0.5 × m × v²
m = (π/6) × ρ_ice × d³    (ρ_ice ≈ 900 kg/m³)
v = f(d)                    (terminal velocity from empirical relations)
```

For IEC 61215 test standard: 25mm ice ball at 23 m/s → KE ≈ 4.6 J

---

### Hurricane / Strong Wind

| Property | Value |
|----------|-------|
| **Variable** | `wind_speed_mph` |
| **Unit** | Miles per hour (mph) |
| **Measurement** | 3-second peak gust at 10m height, open terrain |
| **Range in curves** | 80–200 mph (hurricane), 70–180 mph (strong wind) |
| **Why this variable** | Wind force scales as v², making gust speed the primary damage driver. 3-second gust captures the short-duration peak loads that cause structural failure. |

**Causal chain:**
```
Wind speed → Dynamic pressure → Structural load → Exceeds capacity → Failure
     ↑            q = 0.5ρv²         ↑
  3-sec gust                   Function of geometry,
  at 10m                       exposure, shielding
```

**Why 3-second gust, not sustained wind:**
- Structural failure is driven by peak loads, not average loads
- Building codes (ASCE 7-22) use 3-second gust as the reference
- IEC 61400-1 turbine design classes reference 3-second extreme gust (V_e50)
- The Saffir-Simpson scale uses 1-minute sustained wind, which underestimates structural loading

**Data sources:**
- **IBTrACS** — Historical tropical cyclone tracks with intensity (global)
- **HURDAT2** — Atlantic/Pacific hurricane database (NOAA NHC)
- **Synthetic hurricane models** — STORM, Emanuel's method — extend historical record to ~10,000 years
- **ASOS/AWOS stations** — Surface wind observations (real-time + historical)
- **ERA5 reanalysis** — Gridded wind fields (for non-tropical strong wind events)

**Wind speed conversions:**
| From | To | Factor |
|------|----|--------|
| 1-min sustained | 3-sec gust | × 1.22 (over land) |
| 10-min sustained | 3-sec gust | × 1.43 (over land) |
| m/s | mph | × 2.237 |
| knots | mph | × 1.151 |

---

### Wildfire

| Property | Value |
|----------|-------|
| **Variable** | `fireline_intensity_kWm` |
| **Unit** | kW/m (kilowatts per meter of fire front) |
| **Measurement** | Byram fireline intensity |
| **Range in curves** | 500–100,000 kW/m |
| **Why this variable** | Fireline intensity integrates heat output, flame length, and rate of spread — the three factors that determine radiative heat flux exposure to nearby structures. |

**Causal chain:**
```
Fireline intensity → Radiative heat flux → Surface temperature → Material failure
        ↑                   q ∝ I/d²              ↑
  Byram formula:                          Depends on exposure
  I = H × w × R                          duration, material,
  (heat × fuel × spread)                 distance from flame
```

**Why not flame length or burn probability:**
- Flame length is too indirect (doesn't capture heat output from deep fuel beds)
- Burn probability is Level 4 (yes/no, not intensity)
- Fireline intensity directly scales with radiative flux, the actual damage mechanism

**Key assumption:** Curves assume a reference distance of d = 10m from the fire front to the asset. For assets with larger defensible space, intensity thresholds shift upward proportionally.

**Data sources:**
- **FSim (USFS)** — Fire Simulation system, produces conditional mean fireline intensity (MFI) maps
- **LANDFIRE** — Fuel model layers and fire behavior potential maps
- **FARSITE/FlamMap** — Fire behavior modeling tools
- **CAL FIRE FRAP** — California fire perimeter and severity data

**Triple-channel loss model for wildfire:**
InfraSure models three separate loss channels for wildfire:
1. **Physical damage** (modeled by these curves) — direct fire/heat damage to equipment
2. **Smoke soiling** (separate model) — particulate deposition reducing solar output; not modeled by fragility curves
3. **PSPS curtailment** (separate model) — Public Safety Power Shutoff causing grid disconnection; revenue loss model

---

### Riverine Flood

| Property | Value |
|----------|-------|
| **Variable** | `flood_depth_ft` |
| **Unit** | Feet (ft) above ground level at asset centroid |
| **Measurement** | Depth above ground level |
| **Range in curves** | 0–12 ft |
| **Why this variable** | Flood damage to ground-mounted equipment is driven by water contact with components. Depth above ground directly determines which components are submerged. |

**Causal chain:**
```
Flood depth → Component submersion → Water intrusion → Equipment damage
     ↑                ↑                               ↑
  Depth above    Depends on          Electronics: near-binary failure
  ground level   component           Structural: corrosion, soil loss
                 mounting height     Electrical: insulation breakdown
```

**Critical insight — component elevation matters more than flood depth:**

| Component | Typical Elevation | First Contact Depth |
|-----------|:-----------------:|:-------------------:|
| Underground cables | -2 to -4 ft | Always submerged (designed for it) |
| Pad-mounted inverter | 0.75 ft | 0.75 ft |
| Transformer base | 0.5–1.0 ft | 0.5 ft |
| Combiner box | 2–3 ft | 2 ft |
| Fixed-tilt panel edge | ~2 ft | 2 ft |
| SAT panel (horizontal) | ~2.5 ft | 2.5 ft |
| SAT panel (flood stow) | ~7 ft | 7 ft |

This is why the matching engine needs `tracking_type` and `flood_stow_capable` from specs — they determine which flood curve to apply.

**Why not velocity or duration:**
- Velocity matters for scour and debris impact but is hard to predict and highly localized
- Duration affects damage severity (longer submersion → more corrosion, more water intrusion) but complicates the single-variable model
- These are acknowledged limitations for Gen-2 enhancement

**Data sources:**
- **FEMA NFHL** — National Flood Hazard Layer; 100-year and 500-year floodplain boundaries
- **First Street Foundation** — Property-level flood risk with depth estimates
- **USGS streamflow gauges** — Real-time and historical river levels
- **HAND (Height Above Nearest Drainage)** — Terrain-based flood susceptibility
- **NWS flood inundation maps** — Event-specific flood depth forecasts

---

### Winter Weather (Ice)

| Property | Value |
|----------|-------|
| **Variable** | `ice_accretion_in` |
| **Unit** | Inches (in) of radial ice accretion on a standard conductor |
| **Measurement** | Radial ice thickness on a standard 1-inch diameter conductor |
| **Range in curves** | 0–4 inches |
| **Why this variable** | Ice loading is the primary structural threat; radial accretion determines the additional weight and aerodynamic profile that causes failures. |

**Causal chain:**
```
Ice accretion → Additional mass → Combined ice + wind load → Exceeds design → Failure
      ↑              ↑                    ↑
  Radial thickness   Scales as d²    Blade: imbalance
  on conductor       (annular area)  Tower: buckling
                                     Lines: galloping
```

**Two-channel model for winter weather:**
1. **Physical structural damage** (modeled by these curves) — ice loading exceeds design capacity
2. **Operational icing curtailment** (separate model) — turbines shut down due to ice detection, blade imbalance, or sensor icing. This is a revenue loss model, not a damage model.

**Key distinction:** Texas February 2021 caused massive revenue losses from Channel 2 (operational curtailment due to cold + ice) but essentially zero Channel 1 physical structural damage. The curves here model Channel 1 only.

**Data sources:**
- **ASOS ice accretion sensors** — Surface observations at airports
- **Sperry-Piltz Ice Accumulation Index (SPIA)** — Forecast-based ice loading metric
- **ASCE 7-22 ice maps** — 50-year return period ice thickness maps for structural design
- **ISO 12494** — Atmospheric icing classification
- **ERA5 reanalysis** — Temperature, humidity, and wind for icing condition estimation

---

## Summary Table

| Hazard | Variable | Unit | Range | Primary Data Source | Update Frequency |
|--------|----------|------|-------|--------------------|-----------------| 
| Hail | hail_diameter_mm | mm | 25–120 | NOAA MRMS MESH | Real-time (radar) |
| Hurricane | wind_speed_mph | mph | 80–200 | IBTrACS + Synthetic tracks | Event-based |
| Strong Wind | wind_speed_mph | mph | 70–180 | ERA5 + ASOS | Hourly/Event |
| Wildfire | fireline_intensity_kWm | kW/m | 500–100,000 | FSim (USFS) | Annual (static maps) |
| Flood | flood_depth_ft | ft | 0–12 | FEMA NFHL + First Street | Event/Annual |
| Winter Weather | ice_accretion_in | in | 0–4 | ASOS + SPIA + ASCE 7 | Event-based |

---

## Future Considerations

### Compound Intensity Variables

Some hazards have secondary intensity dimensions that affect damage but are not yet modeled:

| Primary Variable | Secondary Variable | Impact | Status |
|-----------------|-------------------|--------|--------|
| Wind speed (mph) | Debris density | Amplifies damage beyond clean wind | Gen-2 planned |
| Flood depth (ft) | Flow velocity (ft/s) | Scour, debris impact, structural loads | Gen-2 planned |
| Flood depth (ft) | Duration (hours) | Extended submersion → more corrosion | Gen-2 planned |
| Ice accretion (in) | Concurrent wind speed | Combined loading exceeds either alone | Gen-2 planned |
| Fireline intensity | Duration of exposure | Sustained heat → deeper material penetration | Gen-2 planned |

### Unit Standardization

The library uses American customary units (mph, ft, in) for wind, flood, and ice because:
- US building codes and design standards use these units (ASCE 7-22, FEMA)
- Most RE assets in the library are US-based
- Conversion to SI is straightforward: multiply mph × 0.447 → m/s, ft × 0.305 → m

For international deployment, a unit conversion layer in the API will handle SI ↔ customary conversion without changing underlying curve parameters.
