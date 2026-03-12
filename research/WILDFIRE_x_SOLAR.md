# WILDFIRE × SOLAR: Deep Research for Damage Curve Derivation

**InfraSure Damage Curve Library — Research Document**  
**Hazard:** Wildfire (Physical Damage Channel)  
**Asset Class:** Utility-Scale Solar Photovoltaic  
**Version:** 1.0 | March 2026  
**Methodology:** Component Threshold Aggregation → Logistic Sigmoid Fit  
**Intensity Variable:** Fireline Intensity I (kW/m, Byram 1959)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Hazard Physics & Triple-Channel Loss Framework](#2-hazard-physics--triple-channel-loss-framework)
3. [Intensity Variable Selection & Causal Hierarchy](#3-intensity-variable-selection--causal-hierarchy)
4. [Heat Flux Conversion Formula](#4-heat-flux-conversion-formula)
5. [PV_ARRAY × WILDFIRE (PV_MODULE)](#5-pv_array--wildfire-pv_module)
6. [MOUNTING × WILDFIRE (TRACKER, FIXED_MOUNT)](#6-mounting--wildfire-tracker-fixed_mount)
7. [INVERTER_SYSTEM × WILDFIRE (INVERTER, COMBINER_BOX)](#7-inverter_system--wildfire-inverter-combiner_box)
8. [SUBSTATION × WILDFIRE (TRANSFORMER)](#8-substation--wildfire-transformer)
9. [ELECTRICAL × WILDFIRE (CABLES)](#9-electrical--wildfire-cables)
10. [CIVIL_INFRA × WILDFIRE](#10-civil_infra--wildfire)
11. [Recommended Curve Parameters — Master Table](#11-recommended-curve-parameters--master-table)
12. [FSim Integration & Hazard Model Notes](#12-fsim-integration--hazard-model-notes)
13. [Real-World Wildfire Events: Calibration Anchors](#13-real-world-wildfire-events-calibration-anchors)
14. [Data Gaps & Recommendations](#14-data-gaps--recommendations)
15. [Sources & References](#15-sources--references)

---

## 1. Executive Summary

Wildfire is a **triple-channel loss hazard** for utility-scale solar:
1. **Physical damage** (primary): Direct thermal destruction of modules, electronics, structure
2. **Smoke soiling** (secondary): Production loss from irradiance attenuation and ash deposition
3. **PSPS grid shutoff** (tertiary): Revenue loss from utility-initiated de-energization

This document focuses on **Channel 1 (Physical Damage)** for damage curve derivation. The other two channels are noted and quantified separately but do not enter the physical damage ratio.

**Key intensity variable:** Byram's fireline intensity *I* (kW/m), connected to heat flux at the asset via *q* = 0.35 × *I* / *d*, where *d* is the distance from the fire front to the asset in meters. The derivation guide nominates this as the Level 2 causal variable — the "sweet spot" in the causal hierarchy between root cause (fire weather) and direct cause (component temperature).

**Derivation approach:** Component Threshold Aggregation (Method 1 per the derivation methods guide) — engineering thermal standards anchor component-level damage thresholds; weighted aggregation produces a subsystem damage curve; logistic function is fitted to the aggregate. This is the recommended approach for wildfire because temperature/heat-flux standards are comprehensive and the physics is tractable.

**Confidence:** Low to Low-Medium across all subsystems. Very few empirically calibrated wildfire damage curves exist for RE-specific assets. All curves should be treated as **engineering-judgment-based** until validated against actual loss events.

---

## 2. Hazard Physics & Triple-Channel Loss Framework

### 2.1 Physical Damage Mechanism (Channel 1)

A wildfire approaching a solar farm transfers energy to assets through three mechanisms:

| Mechanism | Fraction of Total Heat Transfer | Distance Dependence |
|-----------|--------------------------------|---------------------|
| Radiation | 50–70% | Decreases as 1/d (line source) |
| Convection | 20–40% | Near-field; drops rapidly with distance |
| Ember ignition | Variable | Can span long distances (>1 km) |

The **causal chain** for physical damage:

```
Fireline Intensity I (kW/m)
    ↓  [q = 0.35 × I / d]
Radiant + Convective Heat Flux q (kW/m²)
    ↓  [heat balance equation]
Component Surface Temperature T (°C)
    ↓  [engineering threshold]
Component Failure (EVA pyrolysis, solder melt, insulation failure, etc.)
    ↓  [cost-weighted aggregation]
Subsystem Damage Ratio DR (0.0–1.0)
```

### 2.2 Smoke Soiling Channel (Channel 2) — Note Only

Wildfire smoke causes **two distinct production loss mechanisms**:

1. **Irradiance attenuation**: Smoke aerosols scatter/absorb solar radiation. NCAR research quantified a **10–30% reduction in peak solar output** across California during the September 7–16, 2020 fire peak, with an average of 27% underperformance versus forecast ([Juliano et al., NCAR, 2022](https://news.ucar.edu/132875/california-wildfire-smoke-dimmed-solar-energy-2020)). Clean Power Research documented up to **20% GHI reduction** in the Central Valley in September 2020, with some locations experiencing the worst annual solar production in 20 years ([SolarAnywhere, 2021](https://www.solaranywhere.com/2021/2020-solar-deviation-summary-na-wildfire-smoke-impact-report/)).

2. **Ash soiling**: Particulate matter (PM10, PM2.5) deposits on module surfaces. NREL has documented high correlation between PM2.5 and soiling rates. Ash removal is required for full efficiency restoration; electrical isolation imaging (EL imaging) is needed to detect micro-fissures from thermal stress.

**Channel 2 is NOT included in physical damage ratio.** It should be modeled as a separate revenue loss function tied to regional fire weather indices, not fireline intensity.

### 2.3 PSPS Grid Shutoff Channel (Channel 3) — Note Only

California's Public Safety Power Shutoff (PSPS) program allows IOUs (PG&E, SCE, SDG&E, PacifiCorp, Bear Valley Electric) to de-energize lines when extreme fire conditions are forecast ([CPUC, 2024](https://www.cpuc.ca.gov/psps/)). Solar farms connected to de-energized circuits cannot export power regardless of physical condition.

- PSPS events typically last 24–48 hours
- California averaged 5–6 PSPS events/year 2013–2019
- 2019 PSPS affected approximately 800,000 customers

**Channel 3 is modeled separately as grid unavailability, not physical damage.**

---

## 3. Intensity Variable Selection & Causal Hierarchy

### 3.1 Why Fireline Intensity (kW/m)?

Per Section 1.5 of the InfraSure Derivation Guide, wildfire damage curves use **Byram's fireline intensity** *I* (kW/m) as the Level 2 intensity variable. The causal hierarchy for wildfire × solar is:

| Level | Variable | Units | Notes |
|-------|----------|-------|-------|
| Level 1 | Fire weather index (FWI), fuel moisture | Unitless | Root cause; too distal |
| **Level 2** | **Fireline intensity I** | **kW/m** | **✅ Recommended — InfraSure choice** |
| Level 3 | Heat flux at asset q | kW/m² | More direct but requires distance assumption |
| Level 4 | Component surface temperature T | °C | Most direct; never measured during fires |

**Justification for Level 2 (fireline intensity):**
- Standard metric in fire science; output of FSim, FlamMap, BehavePlus
- Generalizable across fuel types and topographies
- Can be validated against historical fire records
- Enables fire simulation tools (FSim) to drive damage modeling directly
- The intermediate conversion to heat flux (Level 3) is explicit and transparent

**Fireline Intensity Range for Solar Farm Exposure:**

| Fire Type | Typical I Range (kW/m) | FSim Intensity Class |
|-----------|----------------------|---------------------|
| Low-intensity grass fire | 10–500 | Class I–II |
| Moderate shrubland fire | 500–2,000 | Class II–III |
| High-intensity shrub/timber | 2,000–10,000 | Class III–IV |
| Extreme crown fire | 10,000–100,000 | Class V–VI |

Most utility-scale solar farms in California are located in grassland/scrub environments where *I* = 500–10,000 kW/m represents the realistic exposure range ([Scott, 2006, FIS scale; Pyrologix 2019 FSim methods](https://pyrologix.com/wp-content/uploads/2014/04/Scott_20121.pdf)).

### 3.2 Byram's Fireline Intensity Formula

Fireline intensity is calculated per [Byram (1959)](https://www.nature.com/articles/s41598-024-55132-3):

```
I = H × w × r
```

Where:
- I = fireline intensity (kW/m)
- H = heat of combustion (kJ/kg) — typically 18,600 kJ/kg for most fuels
- w = fuel load consumed (kg/m²)
- r = rate of fire spread (m/s)

This is the fundamental equation in BehavePlus and FSim. It forms the basis for all intensity outputs from USFS probabilistic fire modeling.

---

## 4. Heat Flux Conversion Formula

### 4.1 Line Source Radiant Heat Flux

Converting from fireline intensity *I* to radiant heat flux *q* at an asset distance *d* from the fire front:

```
q = C × I / d
```

Where:
- q = incident heat flux (kW/m²)
- I = fireline intensity (kW/m)
- d = perpendicular distance from fire front to asset (m)
- C = empirical coefficient ≈ **0.35** (middle of measured range 0.30–0.40)

This formula uses a **line source geometry** (1/d decay), appropriate for a wildfire front as opposed to the 1/d² decay of a point source. The line source form has been validated against measured heat fluxes in fire science literature ([Sullivan, 2003](https://www.publish.csiro.au/wf/WF02069); SFPE Handbook, 5th ed., Chapter 72).

### 4.2 Validation Against Published Data

| I (kW/m) | d (m) | Observed q (kW/m²) | Formula (C=0.35) | Agreement |
|----------|-------|-------------------|-----------------|-----------|
| 1,000 | 5 | 50–80 | 70 | ✓ |
| 2,000 | 10 | 50–80 | 70 | ✓ |
| 3,000 | 10 | 80–120 | 105 | ✓ |
| 5,000 | 15 | 80–120 | 117 | ✓ |
| 10,000 | 20 | 100–200 | 175 | ✓ |

*Source: SFPE Handbook, 5th ed. (2016), Chapter 72; Butler & Cohen (1998)*

### 4.3 Heat Flux Lookup Table at d = 10 m (Canonical Distance)

This document uses **d = 10 m** as the canonical distance for the damage curves — corresponding to fire at the perimeter or passing through the array. All curve parameters are calibrated for this assumption.

| I (kW/m) | q at d=10m (kW/m²) | Fire Behavior Context |
|----------|---------------------|----------------------|
| 200 | 7 | Very low-intensity grass fire |
| 500 | 18 | Low-intensity (grass/annual weed) |
| 1,000 | 35 | Moderate (shrub fire) |
| 1,500 | 53 | Active shrub/chaparral fire |
| 2,000 | 70 | High-intensity (chaparral) |
| 3,000 | 105 | Extreme chaparral / timber |
| 5,000 | 175 | Very high (crown/torching) |
| 7,000 | 245 | Extreme crown fire |
| 10,000 | 350 | Near-maximum (wind-driven crown) |

**Sensitivity note:** At d = 5 m (fire burning directly through the asset), all heat fluxes double. At d = 20 m (fire at outer perimeter), heat fluxes halve. Distance assumption is the **dominant source of uncertainty** in this framework.

---

## 5. PV_ARRAY × WILDFIRE (PV_MODULE)

**Subsystem weight in solar capex:** 0.28–0.35  
**Component:** PV_MODULE  
**Derivation approach:** Engineering-standard-based + proxy-adapted  
**Confidence:** Low-Medium

### 5.1 Physics of Damage

A PV module exposed to wildfire heat flux undergoes a sequential failure cascade:

```
Radiant heat flux → Glass thermal shock
                 → EVA encapsulant softening → pyrolysis → flaming
                 → Cell interconnect heating → solder melting → circuit failure
                 → Backsheet pyrolysis → structural collapse
                 → Junction box plastic ignition
```

**Detailed failure sequence by component:**

**Tempered glass front cover:**
- Normal operating temperature: ambient + 15–20°C (cells at 25°C NOCT + Δ)
- Thermal shock threshold: ΔT > 200°C across the glass (from ambient to fire exposure)
- At q = 40–50 kW/m², surface temperature rises >200°C within seconds → glass shatters
- DOE FEMP reports that average forest fires at 1,470°F (800°C) will melt aluminum (1,220°F) and stress tempered glass (thermal shock at 554–716°F) ([Energy.gov FEMP, 2024](https://www.energy.gov/femp/solar-photovoltaic-hardening-resilience-wildfire))
- Glass-glass construction is more thermally robust than glass-backsheet; thermally thick behavior confirmed in cone calorimeter tests ([Wang et al., 2015](https://pmc.ncbi.nlm.nih.gov/articles/PMC5455650/))

**EVA encapsulant (primary combustible):**
- EVA (ethylene-vinyl acetate copolymer) is the main combustible component of PV modules
- Critical heat flux (CHF) for ignition: **26 kW/m²** (confirmed by cone calorimeter experiments at polycrystalline modules, [Wang et al., 2015](https://pmc.ncbi.nlm.nih.gov/articles/PMC5455650/); confirmed in subsequent 2025 experiments, [Xiaoyu et al., 2025](https://www.sciencedirect.com/science/article/abs/pii/S0927024825001291))
- EVA melt/degradation onset: ~120–150°C; pyrolysis: ~200–280°C; ignition: with flame at ≥26 kW/m²
- Once EVA ignites, dripping behavior propagates fire along module strings
- Total heat release (THR) from a burning PV module: 38–57 MJ/m² — intermediate risk per Petrella's fire risk criteria

**PV backsheet (PET-based, glass/backsheet construction):**
- PET (polyethylene terephthalate) backsheet: melting ~250°C; ignition with flame ~400°C
- Backsheet is the first component to smoke and melt in fire exposure (surface-side ignition)
- Glass/glass modules do not exhibit flaming drip behavior; glass/backsheet modules do — burning-through observed at 30 kW gas burner output ([IRB test report, 2014](https://www.irbnet.de/daten/kbf/kbf_e_F_2897.pdf))

**Solder joints and cell interconnects:**
- Eutectic solder (60Sn/40Pb): melting point ~183°C
- Lead-free solder (SAC alloy): melting point ~217–220°C
- Silver ribbon contacts: melting point 1,760°F (960°C) — survive moderate fires but lose electrical contact through thermal delamination
- Cell cracks from thermal stress begin at moderate heat flux

**Junction box (ABS plastic, IP54 rated):**
- ABS plastic: softening ~100°C, deformation ~120°C, ignition ~400°C
- Ignition of junction box plastic at q ≥ 25 kW/m² (sustained 5-min exposure)
- After ignition, junction box failure is catastrophic (arcing, electrical failure)

### 5.2 Component Thermal Thresholds

| Component | Damage Onset | 50% Damage | Failure | Basis |
|-----------|-------------|------------|---------|-------|
| EVA encapsulant | 26 kW/m² | 50 kW/m² | 100 kW/m² | Wang et al. 2015; cone calorimeter CHF |
| PET backsheet | 26 kW/m² | 55 kW/m² | 80 kW/m² | SFPE Handbook; polymer pyrolysis data |
| Tempered glass | 40 kW/m² | 80 kW/m² | 160 kW/m² | DOE FEMP; thermal shock ΔT >200°C |
| Cell/solder joints | 40 kW/m² | 100 kW/m² | 200 kW/m² | Solder mp 183–220°C; derivation methods guide |
| Junction box | 25 kW/m² | 60 kW/m² | 120 kW/m² | Derivation methods guide; ABS thermal properties |

*All thresholds calibrated for ~5-minute fire residence time at the asset.*

### 5.3 UL/IEC Fire Classification

Solar modules are classified by fire exposure rating per the National Electrical Code / International Building Code and tested per UL 790:

| Class | Exposure Level | Test Duration | Flame Spread Limit | Application |
|-------|---------------|---------------|-------------------|-------------|
| Class A | Severe | 10 min at ~760°C | ≤6 feet | WUI areas; recommended |
| Class B | Moderate | 10 min | ≤8 feet | Urban areas |
| Class C | Light | 4 min | ≤13 feet | Minimum standard |

**IEC 61730 / UL 61730** (PV Module Safety Qualification) replaced UL 1703 and defines fire hazard requirements including:
- Flammability of materials
- Electrical spacing requirements to prevent arcing
- Fire resistance testing per UL 790 ([UL, 2017](https://code-authorities.ul.com/wp-content/uploads/sites/40/2017/05/CS10111_IEC_Solar-WP-Web_5-30.pdf))

**Recommendation from DOE FEMP:** Use Class A fire-rated modules in wildfire hazard areas. Non-combustible screens or barriers at the rear of modules reduce flame propagation risk.

### 5.4 Defensible Space and Setback

- **Zone 0 (0–5 ft):** Bare soil / non-combustible material immediately around structure perimeters
- **Zone 1 (5–30 ft):** Managed vegetation; annual grass ≤4 inches; spaced shrubs and trees
- Solar farm "defensible space": paving with concrete (feasible for small sites only); vegetation management plan via labor or livestock grazing per FEMA guidance
- FEMA recommends placing sensitive infrastructure underground to reduce wildfire risk; underground wiring/conduit is strongly recommended for new installations in high-hazard zones ([Energy.gov FEMP](https://www.energy.gov/femp/solar-photovoltaic-hardening-resilience-wildfire))
- NEC Article 691.10 minimum spacing between PV array rows for firefighter access

### 5.5 Weighted Component Aggregation

Cost weights within the PV_MODULE subsystem for damage aggregation:

| Component | Weight |
|-----------|--------|
| Glass + cell laminate assembly | 50% |
| EVA encapsulant | 15% |
| Backsheet | 10% |
| Junction box | 15% |
| Frame (aluminum extrusion) | 10% |

**Aggregated damage at key heat flux levels:**

| q (kW/m²) | I equiv. (d=10m) | EVA | Backsheet | Glass/Cell | J-Box | Agg. DR |
|-----------|-----------------|-----|-----------|-----------|-------|---------|
| 18 | 500 kW/m | 0% | 0% | 0% | 0% | ~0% |
| 35 | 1,000 kW/m | 7% | 7% | 0% | 10% | 4% |
| 70 | 2,000 kW/m | 48% | 47% | 22% | 58% | 37% |
| 105 | 3,000 kW/m | 89% | 75% | 51% | 73% | 66% |
| 175 | 5,000 kW/m | 95% | 95% | 89% | 95% | 92% |
| 245 | 7,000 kW/m | 95% | 95% | 95% | 95% | 95% |

### 5.6 Logistic Curve Parameters — PV_MODULE

```
DR(I) = 0.95 / (1 + exp(-0.00130 × (I − 2100)))
```

| Parameter | Value | Meaning |
|-----------|-------|---------|
| L | 0.95 | Maximum damage ratio (near-total loss for complete burn) |
| k | 0.00130 kW/m⁻¹ | Steepness (damage ramps over ~2,000 kW/m range) |
| x₀ | 2,100 kW/m | Midpoint intensity (DR = L/2 ≈ 47.5%) |

**Damage at key intensities:**

| I (kW/m) | DR | Notes |
|----------|-----|-------|
| 200 | ~0% | Below damage onset |
| 500 | 10% | Grass fire; minor EVA/backsheet stress |
| 1,000 | 18% | Shrub fire; junction box and backsheet damage |
| 2,000 | 44% | Active chaparral; EVA ignition, solder melt |
| 3,000 | 71% | High-intensity; most modules destroyed |
| 5,000 | 93% | Extreme fire; near-total module loss |
| 10,000 | 95% | Maximum — saturation |

**10th/25th/50th/75th/90th percentile intensity thresholds:**

| DR Threshold | Fireline Intensity |
|-------------|-------------------|
| DR = 10% | ~450 kW/m |
| DR = 25% | ~1,300 kW/m |
| DR = 50% | ~2,200 kW/m |
| DR = 75% | ~3,100 kW/m |
| DR = 90% | ~4,300 kW/m |

**Derivation approach:** Engineering-standard-based (CHF from cone calorimeter studies; component thermal properties from manufacturer specifications and fire engineering handbooks)  
**Confidence:** Low-Medium — CHF values are well-established from experiments; distance assumption (d=10m) introduces ±40% uncertainty  
**Maximum uncertainty estimate:** ±40–50% in x₀ and k  

---

## 6. MOUNTING × WILDFIRE (TRACKER, FIXED_MOUNT)

**Subsystem weight in solar capex:** 0.08–0.12  
**Components:** TRACKER (single-axis and dual-axis trackers), FIXED_MOUNT  
**Derivation approach:** Engineering-standard-based (steel fire design codes)  
**Confidence:** Low

### 6.1 Physics of Damage

Mounting structures face a fundamentally different damage pathway from PV modules: the failure mechanism is **thermal strength reduction** (not ignition) for steel, and **partial melting/softening** for aluminum.

**Steel torque tubes and driven piles:**

At elevated temperatures, structural steel loses yield strength per well-established relationships codified in Eurocode 3 Part 1-2, AISC 360, and NIST TN 1907:

| Temperature (°C) | Yield Strength Retention | Source |
|-----------------|--------------------------|--------|
| 20 (ambient) | 100% | Baseline |
| 200 | ~90% | EC3 Table 3.1 |
| 300 | ~80% | EC3 Table 3.1 |
| 400 | ~65% | EC3 Table 3.1 |
| 500 | ~40% | EC3 Table 3.1 |
| 600 | ~20–30% | EC3 Table 3.1; NIST TN 1907 |
| 700 | ~12% | EC3 Table 3.1 |

The critical temperature for structural steel (load ratio 0.6) is approximately **600°C** per Eurocode 3 ([Virdi, 2014](https://www.kiip.bg/archived-site/sb2014/07_1_Virdi_Sofia_Steel_Fire-FINAL.pdf)); at this point a steel member designed for standard loads will fail. In practice, solar tracker torque tubes have low utilization ratios (they are oversized for wind loads) so they may resist fire until temperatures approach 700–800°C.

**Heat flux to temperature relationship (approximation for 5-min exposure at d=10m):**
- q = 80 kW/m² → T_surface ≈ 300°C → ~80% yield strength retained → minor damage
- q = 150 kW/m² → T_surface ≈ 500°C → ~40% yield strength → significant damage
- q = 250 kW/m² → T_surface ≈ 700°C → ~12% yield strength → failure/collapse

**Aluminum tracker arms and drive shafts:**

The Aluminum Association reports that most aluminum alloys (6061, 6063 — standard structural and extruded grades used in solar tracker arms) begin to lose strength at **temperatures above 150°C (300°F)**, with the melting point at **660°C (1,220°F)** ([Aluminum Association, 2020](https://www.aluminum.org/sites/default/files/2021-11/FireSafetyAluminumAlloys_9.8.20.pdf)). Experimental data for fire-damaged AA6061 at 400°C and 500°C confirms significant strength loss ([Puplampu et al., 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC8385160/)).

- Alloy 6061-T6: yield strength 276 MPa at 20°C; reduced to ~140 MPa at 200°C; ~50 MPa at 300°C; melts at 660°C
- Alloy 6063-T5 (common in extruded tracker rails): lower baseline strength; similar temperature sensitivity
- DOE FEMP confirms aluminum melts at 1,220°F (660°C) and is expected to melt in average forest fires at 1,470°F ([Energy.gov FEMP, 2024](https://www.energy.gov/femp/solar-photovoltaic-hardening-resilience-wildfire))

**Motor/actuator electronics:**

Single-axis trackers use electric motors (slew drives or linear actuators) with electronics typically rated for ambient −40°C to +75°C. The motor/controller electronics fail at similar heat fluxes to inverters (see Section 7), making actuator electronics the **most vulnerable component** of the mounting subsystem.

### 6.2 Component Thresholds

| Component | Weight | q_begin (kW/m²) | q_50 (kW/m²) | q_fail (kW/m²) | Basis |
|-----------|--------|-----------------|--------------|----------------|-------|
| Steel torque tube | 40% | 100 | 250 | 450 | EC3 strength reduction; derivation methods guide |
| Aluminum arm (6061) | 25% | 40 | 120 | 250 | Aluminum Assoc. 2020; Puplampu 2021 |
| Motor/actuator electronics | 20% | 15 | 40 | 80 | IEC 62109-1 electronics temperature limits |
| Fixed bracket (steel) | 15% | 100 | 250 | 450 | Same as torque tube |

### 6.3 Logistic Curve Parameters — MOUNTING

```
DR(I) = 0.80 / (1 + exp(-0.00060 × (I − 3600)))
```

| Parameter | Value | Meaning |
|-----------|-------|---------|
| L | 0.80 | Maximum damage ratio — steel structure partially survives even extreme fires |
| k | 0.00060 kW/m⁻¹ | Low steepness — broad damage ramp due to mixed material vulnerability |
| x₀ | 3,600 kW/m | High midpoint — structure only half-damaged at very high intensity |

**Damage at key intensities:**

| I (kW/m) | DR | Notes |
|----------|-----|-------|
| 500 | 10% | Actuator motor damage only |
| 1,000 | 14% | Actuator + some aluminum softening |
| 2,000 | 22% | Aluminum arms bent/deformed; actuator failed |
| 3,000 | 35% | Significant aluminum damage; steel losing strength |
| 5,000 | 55% | Major structural damage; steel weakened |
| 10,000 | 78% | Near-maximum; steel melted/collapsed |

**Note on L < 1.0:** Galvanized steel posts and driven piles are extremely heat-resistant. Even in extreme fires, the majority of steel structural elements require only cleaning and re-painting rather than replacement. The L = 0.80 cap reflects this — even at maximum fire intensity, ~20% of the mounting structure value survives in repairable condition.

**10th/25th/50th/75th/90th percentile thresholds:**

| DR Threshold | Fireline Intensity |
|-------------|-------------------|
| DR = 10% | ~500 kW/m |
| DR = 25% | ~2,300 kW/m |
| DR = 50% (=L/2) | ~4,500 kW/m |
| DR = 75% (=0.94L) | ~8,100 kW/m |
| DR = 90% (>L) | N/A — exceeds L=0.80 |

**Derivation approach:** Engineering-standard-based (EC3 steel fire design; Aluminum Association data; IEC 62109 electronics)  
**Confidence:** Low — large uncertainty from mixed components; motor/electronics drive most of the low-intensity sensitivity  
**Maximum uncertainty estimate:** ±50% in x₀

---

## 7. INVERTER_SYSTEM × WILDFIRE (INVERTER, COMBINER_BOX)

**Subsystem weight in solar capex:** 0.06–0.10  
**Components:** INVERTER (central or string), COMBINER_BOX  
**Derivation approach:** Engineering-standard-based  
**Confidence:** Low-Medium

### 7.1 Physics of Damage

Inverters and combiner boxes are electronics-dominated subsystems. Their failure physics are primarily:

1. **Direct heat stress on electronics:** Power semiconductor devices (IGBTs, MOSFETs), capacitors, and PCBs have operating temperature limits far below wildfire heat flux levels
2. **Smoke particulate contamination:** Even without direct thermal damage, smoke infiltration into enclosures causes arcing, insulation failure, and electronic degradation
3. **Enclosure melting:** Fiberglass or steel enclosures provide varying protection depending on construction

**Operating and damage temperature limits:**

Per **IEC 62109-1** (Safety of Power Converters for Use in PV Systems), inverters must operate safely within their rated temperature range, with temperature rise test requirements to confirm components do not exceed rated limits ([Anern/IEC 62109 summary, 2025](https://www.anernstore.com/blogs/diy-solar-guides/iec-standards-pv-inverters-ess-safety)):

| Component | Max Operating Temp | Damage Onset Temp | Failure Temp |
|-----------|-------------------|------------------|-------------|
| IGBT/MOSFET semiconductors | 60–85°C junction | 100°C sustained | 150–175°C |
| Electrolytic capacitors | 85–105°C | 85°C sustained | 105°C |
| PCB (FR-4 laminate) | 130°C (Tg) | 110°C sustained | 130°C (delamination) |
| Plastic enclosure (fiberglass) | 130°C | 120°C | 200°C (igni.) |
| Aluminum heat sink | 200°C | 200°C | 660°C (melt) |

**Important nuance:** Modern string/central inverters are designed with IP54 or IP65 enclosures (NEMA 3R/4 equivalent). These enclosures significantly delay heat penetration, providing protection during short (1–2 min) fire passages. However, during sustained exposure (5+ min at high heat flux), enclosure failure leads to rapid electronics destruction.

**Smoke damage mechanism:** Wildfire smoke contains fine particulates (PM2.5) that infiltrate enclosure gaskets. These conductive particles can cause:
- Carbonized tracking on high-voltage PCB traces
- Gradual insulation resistance reduction
- Arc-induced failures in DC combiner boxes
This mechanism causes damage at heat flux levels **below** the direct thermal threshold.

### 7.2 Component Thresholds

| Component | Weight | q_begin (kW/m²) | q_50 (kW/m²) | q_fail (kW/m²) | Basis |
|-----------|--------|-----------------|--------------|----------------|-------|
| Central/string inverter | 70% | 15 | 40 | 80 | Derivation methods guide; IEC 62109-1 temp limits |
| Combiner box | 30% | 25 | 60 | 120 | Derivation methods guide; plastic enclosure limits |

### 7.3 Logistic Curve Parameters — INVERTER_SYSTEM

```
DR(I) = 0.95 / (1 + exp(-0.00210 × (I − 1300)))
```

| Parameter | Value | Meaning |
|-----------|-------|---------|
| L | 0.95 | Near-total loss — electronics are not salvageable after severe fire exposure |
| k | 0.00210 kW/m⁻¹ | High steepness — rapid transition from functional to failed |
| x₀ | 1,300 kW/m | Low midpoint — electronics fail at relatively low fire intensity |

**Damage at key intensities:**

| I (kW/m) | DR | Notes |
|----------|-----|-------|
| 200 | ~1% | Negligible |
| 500 | 15% | Smoke infiltration; some electronics stress |
| 1,000 | 33% | Moderate damage; enclosure compromised |
| 2,000 | 77% | Severe electronics damage |
| 3,000 | 92% | Near-total loss of inverter function |
| 5,000 | 95% | Maximum damage |

**Most vulnerable subsystem in the fleet** — inverters fail at the lowest fireline intensity of any major solar component. For a moderate chaparral fire at I = 2,000 kW/m, expected inverter damage is ~77% while PV module damage is only ~44%.

**This has significant implications for loss modeling:** On a per-fire-event basis, inverters will often be the binding constraint on system recovery, not the PV modules.

**Replacement cost note:** DOE FEMP cites a 200-kW rooftop system inverter replacement at **$16,000** ([Energy.gov FEMP, 2024](https://www.energy.gov/femp/solar-photovoltaic-hardening-resilience-wildfire)). For utility-scale central inverters (1–4 MW), replacement costs are $50,000–$150,000 each, with long lead times (8–24 weeks) post-fire.

**Derivation approach:** Engineering-standard-based  
**Confidence:** Low-Medium — electronics thermal limits well-documented; smoke infiltration threshold is expert judgment  
**Maximum uncertainty estimate:** ±35% in x₀ (enclosure protection provides significant but variable thermal buffering)

---

## 8. SUBSTATION × WILDFIRE (TRANSFORMER)

**Subsystem weight in solar capex:** 0.05–0.10  
**Component:** TRANSFORMER_MAIN (oil-filled pad-mount or substation), SWITCHGEAR  
**Derivation approach:** Engineering-standard-based + proxy-adapted  
**Confidence:** Low

### 8.1 Physics of Damage

Substation transformers present a compound wildfire risk combining direct thermal damage and **oil fire propagation**:

**Stage 1: External thermal loading**
- Wildfire radiant and convective heat flux heats transformer tank exterior
- Oil temperature rises; normal trip thresholds are **90°C (oil) / 95°C (winding)** per thermal protection standards
- At q = 30–80 kW/m², external heating can overwhelm cooling and raise oil temperature beyond operating limits

**Stage 2: Oil tank pressurization / rupture risk**
- Mineral transformer oil flash point: **140–160°C** ([Transformer oil flash point, 2025](https://www.oil-tester.com/transformer-oil-flash-point-and-its-importance/))
- Mineral oil fire point: ~165°C
- If the transformer experiences external fire exposure simultaneously with a fault, oil can vaporize and ignite catastrophically
- Cargill FR3 fluid (bio-based dielectric): flash point 330°C, fire point 360°C — roughly 2× safer ([Cargill, 2015](https://www.cargill.com/bioindustrial/fr3-fluid/fire-safety)) — but most utility transformers use mineral oil

**Stage 3: Bushing and insulator damage**
- High-voltage porcelain bushings: thermally robust (ceramic) but vulnerable to thermal shock from firefighting water application
- Silicone composite bushings: more thermally resistant; failure above ~300°C
- IEEE C2 (National Electrical Safety Code) establishes minimum clearances from vegetation — relevant to substation perimeter vegetation management

**Stage 4: Control and protection electronics**
- Substation relay panels, SCADA equipment, and protection devices are electronics with similar thermal vulnerability to inverters (~80°C operating, 150°C failure)
- These typically occupy conditioned buildings — the building provides significant thermal protection

**Vegetation Management Zones:**
NERC and utility wildfire mitigation plans establish minimum clearance zones around substations. California utilities' Wildfire Mitigation Plans (WMPs) require substations to maintain defined defensible perimeters. The University of Canterbury study on transformer fire protection ([Canterbury Fire Risk Report, 2019](https://ir.canterbury.ac.nz/bitstreams/bbf94619-f688-415c-ba73-42d2f8b70cb8/download)) documents that the primary wildfire risk to transformers is oil fire propagation following external ignition.

### 8.2 Component Thresholds

| Component | Weight | q_begin (kW/m²) | q_50 (kW/m²) | q_fail (kW/m²) | Basis |
|-----------|--------|-----------------|--------------|----------------|-------|
| Oil-filled transformer | 60% | 30 | 80 | 160 | SFPE Handbook; oil flash point ~140–160°C |
| Switchgear / disconnect | 25% | 20 | 50 | 100 | Electronics + metal enclosure |
| Control panel / relay | 15% | 15 | 40 | 80 | Electronics thermal limits (IEC 62109) |

### 8.3 Logistic Curve Parameters — SUBSTATION

```
DR(I) = 0.95 / (1 + exp(-0.00140 × (I − 1900)))
```

| Parameter | Value | Meaning |
|-----------|-------|---------|
| L | 0.95 | Near-total loss possible if transformer oil ignites |
| k | 0.00140 kW/m⁻¹ | Moderate steepness |
| x₀ | 1,900 kW/m | Midpoint — active chaparral fire is sufficient to cause major damage |

**Damage at key intensities:**

| I (kW/m) | DR | Notes |
|----------|-----|-------|
| 300 | ~4% | Minor; some electronics stress |
| 500 | 12% | Control electronics at risk |
| 1,000 | 21% | Switchgear and controls moderately damaged |
| 2,000 | 51% | Transformer may suffer oil overheating; significant damage |
| 3,000 | 79% | Transformer oil fire likely; major loss |
| 5,000 | 94% | Near-total substation loss |

**Critical note on transformer repair vs. replacement:**
- Transformer damage in wildfire often requires full replacement (not repair) due to oil contamination, winding damage, and bushing failure
- Lead times for large power transformers: 12–24 months post-order
- This makes substation damage disproportionately costly relative to the physical damage ratio

**IEEE C2 clearance requirements:**
The National Electrical Safety Code (IEEE C2) specifies minimum clearance distances from overhead lines to vegetation. While these apply primarily to transmission lines, substation perimeter vegetation management plans should comply with the minimum clearances in Rule 218 (vegetation around transmission structures).

**Derivation approach:** Engineering-standard-based (oil flash point anchors critical threshold; electronics limits from IEC 62109)  
**Confidence:** Low — transformer oil fire behavior is highly scenario-dependent (fault conditions, tank venting, suppression availability)  
**Maximum uncertainty estimate:** ±50% in x₀ and L (transformer oil fire scenarios are catastrophic; the curve may need bimodal treatment)

---

## 9. ELECTRICAL × WILDFIRE (CABLES)

**Subsystem weight in solar capex:** 0.08–0.12  
**Components:** CABLE_COLLECTION (DC strings), CABLE_AC (collection to POI)  
**Derivation approach:** Engineering-standard-based  
**Confidence:** Low

### 9.1 Physics of Damage

Solar farm cable systems combine underground and above-ground runs, with markedly different wildfire vulnerability:

**Cable insulation materials and thermal limits:**

| Insulation | Max Operating Temp | Short-Circuit Temp | Damage/Melt Temp | Standard |
|------------|-------------------|-------------------|-----------------|---------|
| XLPE (Cross-linked PE) | 90°C continuous | 250°C (1 sec) | ~250°C melt | IEC 60840; AEIC CS9 |
| PVC | 70°C continuous | 160°C (1 sec) | ~160–200°C | IEC 60502 |
| EPR (Ethylene-Propylene Rubber) | 90°C continuous | 250°C | ~300°C | IEC 60502 |

Per [ELEK Software analysis of XLPE temperature limits](https://elek.com/articles/temperature-limits-for-xlpe-cables/): the maximum operating temperature of XLPE insulated cables is **90°C** under normal conditions. IEC 60840 specifies this limit; AEIC CS9 permits up to 105°C for emergency operation (≤72 hrs).

XLPE insulation is thermally stable up to ~85°C (crosslinked polyethylene base); conventional XLPE melting temperature is ~103°C; heat-resistant XLPE melts at ~123°C. **At wildfire heat flux levels (25–150 kW/m²), cable insulation failure is virtually certain for above-ground runs.**

**Underground vs. above-ground vulnerability:**

Underground cable installation provides near-complete protection against wildfire radiant/convective heat:
- Soil provides excellent thermal insulation (k_soil ≈ 0.3–1.5 W/m·K)
- At typical burial depths (0.6–1.0 m), sustained surface temperatures of 500–800°C barely affect cables
- Underground cables are essentially **immune to wildfire heat flux** at standard burial depths
- This is a key recommendation from DOE FEMP: "FEMA recommends that utilities place any sensitive infrastructure underground to reduce its risk of wildfire" ([Energy.gov FEMP](https://www.energy.gov/femp/solar-photovoltaic-hardening-resilience-wildfire))

Above-ground cable runs (cable trays, conduit on structure, exposed messenger wire) are highly vulnerable:
- Exposed XLPE cable ignites at ~25–40 kW/m² (flame source; consistent with IEC 60332 flame propagation tests)
- IEC 60332-1: single cable flame retardancy test; typical screening value of q ≈ 10–25 kW/m² for cable ignition per SFPE Handbook fire dynamics calculations
- Once cable jacket ignites, electrical insulation fails; arcing can propagate fire along cable runs

**Typical solar farm cable routing:**
- DC string wires: often clipped to module frames or routed through aluminum wireways → **above-ground, highly vulnerable**
- DC collection cables (combiner box to inverter): may be in conduit below grade or in aboveground cable tray
- AC cables (MV, 34.5 kV): typically underground in solar farms → **low vulnerability**
- Assumption for this model: ~50% of cable system is effectively above-ground exposed

**Flame spread inhibition:**
IEC 60332-3 (flame propagation test for bunched cables) allows classification of flame-retardant cables. Solar farms in WUI areas should specify IEC 60332-3 Category C or better cables.

### 9.2 Component Thresholds

| Component | Weight | q_begin (kW/m²) | q_50 (kW/m²) | q_fail (kW/m²) | Basis |
|-----------|--------|-----------------|--------------|----------------|-------|
| DC string cables (overhead, ~50% exposure) | 30% | 25 | 70 | 150 | SFPE Handbook; IEC 60332 |
| DC collection cables (underground, ~50%) | 30% | 200 | 400 | 600 | Soil thermal insulation |
| AC collection cables | 30% | 25 | 70 | 150 | Above-ground runs assumed |
| Metal conduit / cable tray | 10% | 150 | 300 | 500 | Steel thermal limits |

**Note:** The 50/50 above/underground split is a baseline assumption. Sites with full underground cabling should use a modified curve with significantly lower damage at all intensities. This is the single most impactful site design variable for cable damage reduction.

### 9.3 Logistic Curve Parameters — ELECTRICAL

```
DR(I) = 0.65 / (1 + exp(-0.00080 × (I − 2500)))
```

| Parameter | Value | Meaning |
|-----------|-------|---------|
| L | 0.65 | Maximum damage ratio — L < 1.0 because underground cables survive |
| k | 0.00080 kW/m⁻¹ | Low steepness — broad transition due to mixed underground/overhead routing |
| x₀ | 2,500 kW/m | Midpoint — high because underground cables buffer the aggregate |

**Damage at key intensities:**

| I (kW/m) | DR | Notes |
|----------|-----|-------|
| 500 | 11% | Minor overhead cable damage |
| 1,000 | 15% | Moderate overhead cable insulation damage |
| 2,000 | 26% | Significant overhead cable loss |
| 3,000 | 41% | Most above-ground cable destroyed |
| 5,000 | 57% | Above-ground cables total loss; underground intact |
| 10,000 | 65% | Maximum — underground cables survive regardless |

**Site design modifier:** For fully underground cable installation, reduce L to 0.10 (only above-ground terminations at equipment are vulnerable). For fully above-ground, increase L to 0.85 and x₀ to 1,500.

**Derivation approach:** Engineering-standard-based (IEC 60332, XLPE thermal properties)  
**Confidence:** Low — cable routing ratio (above/underground) is highly site-specific and dominates the curve  
**Maximum uncertainty estimate:** ±50% in L (depends on site design)

---

## 10. CIVIL_INFRA × WILDFIRE

**Subsystem weight in solar capex:** 0.05–0.10  
**Components:** ROAD, FENCING, BUILDING  
**Derivation approach:** Proxy-adapted (building damage curves adapted for civil infrastructure)  
**Confidence:** Low

### 10.1 Physics of Damage

Civil infrastructure damage from wildfire follows the **building damage** paradigm most closely, and is the component area where the most existing building damage literature (IBHS, FEMA, CAL FIRE DINS) can be applied as a proxy.

**O&M Buildings:**
- Standard metal-clad industrial buildings: steel frame + metal cladding → thermally robust
- Wood-frame or light industrial buildings: highest vulnerability; fire spread dependent on combustibility
- IBHS's Camp Fire 2017/2018 damage analysis found that "vegetative clearance and topography had greater influence on damage level relative to building features" ([IBHS, 2020](https://ibhs.org/ibhs-news-releases/damage-analysis-of-2017-2018-wildfires-shows-importance-of-mitigation/))
- Metal O&M buildings: damage onset at ~q = 20 kW/m² (internal contents); total loss at ~q = 80 kW/m²
- Wood O&M buildings: damage onset at ~q = 10 kW/m²; total loss at ~q = 50 kW/m²

**Access Roads:**
- Gravel/decomposed granite roads: essentially fireproof (substrate unaffected)
- Asphalt concrete: surface softening begins at ~160°C (bitumen softening point); permanent deformation at ~200°C; not a major loss component
- Road damage from wildfire is primarily from debris flow, slope instability post-fire, and slope failures
- ASCE 2025 post-fire road damage assessment documented average road repair costs of **$127,783/km** for the 2020 megafires ([ASCE, 2025](https://www.asce.org/publications-and-news/civil-engineering-source/article/2025/01/15/as-wildfires-rage-in-la-area-infrastructure-including-roadways-under-threat))

**Fencing:**
- Chain-link fencing (galvanized steel): melts vinyl coating; structural failure at very high temperatures (>600°C); typically repairable with post-replacement
- Post-and-rail wood fencing: highly combustible; total loss at low heat fluxes
- Most utility-scale solar farms use chain-link or security panel fencing

### 10.2 Component Thresholds

| Component | Weight | q_begin (kW/m²) | q_50 (kW/m²) | q_fail (kW/m²) | Basis |
|-----------|--------|-----------------|--------------|----------------|-------|
| Fencing (chain-link, galvanized) | 30% | 80 | 250 | 500 | Steel thermal limits; vinyl coating loss |
| Access roads (asphalt) | 30% | 30 | 80 | 160 | Bitumen softening; surface deformation |
| O&M building (metal/frame) | 30% | 10 | 30 | 80 | IBHS data; building fire physics |
| Grading/drainage | 10% | 100 | 300 | 600 | Civil earthwork essentially immune |

### 10.3 Logistic Curve Parameters — CIVIL_INFRA

```
DR(I) = 0.75 / (1 + exp(-0.00090 × (I − 2100)))
```

| Parameter | Value | Meaning |
|-----------|-------|---------|
| L | 0.75 | Maximum damage ratio — significant fraction always survives (roads, drainage) |
| k | 0.00090 kW/m⁻¹ | Low-moderate steepness |
| x₀ | 2,100 kW/m | Midpoint — moderate fire causes major infrastructure damage |

**Damage at key intensities:**

| I (kW/m) | DR | Notes |
|----------|-----|-------|
| 100 | ~4% | O&M building minor smoke/heat damage |
| 500 | 14% | O&M building moderate damage; road surface affected |
| 1,000 | 20% | O&M building significant damage; fencing damaged |
| 2,000 | 36% | O&M building likely total loss; fencing major damage |
| 3,000 | 53% | Full infrastructure damage except roads/drainage |
| 5,000 | 70% | Near-maximum civil damage |

**Proxy adaptation note:** Civil infrastructure damage curves are most appropriately adapted from IBHS/FEMA residential building fragility functions, scaled for commercial/industrial construction. The CLIMADA wildfire impact module uses brightness temperature as a proxy — not directly applicable here. This is the weakest empirical basis among all subsystems.

**Derivation approach:** Proxy-adapted (building damage literature adapted for civil infrastructure)  
**Confidence:** Low — most empirical wildfire damage data is for residential buildings, not industrial/commercial  
**Maximum uncertainty estimate:** ±60% in all parameters

---

## 11. Recommended Curve Parameters — Master Table

### 11.1 Summary Parameters

All curves: `DR(I) = L / (1 + exp(-k × (I − x₀)))` where I is in kW/m (Byram's fireline intensity)

| Subsystem | Component | L | k (kW/m⁻¹) | x₀ (kW/m) | Conf. | Derivation Method |
|-----------|-----------|---|------------|-----------|-------|-----------------|
| PV_ARRAY | PV_MODULE | 0.95 | 0.00130 | 2,100 | Low-Med | Engineering standard |
| MOUNTING | TRACKER | 0.80 | 0.00060 | 3,600 | Low | Engineering standard |
| INVERTER_SYSTEM | INVERTER | 0.95 | 0.00210 | 1,300 | Low-Med | Engineering standard |
| SUBSTATION | TRANSFORMER | 0.95 | 0.00140 | 1,900 | Low | Eng. standard + proxy |
| ELECTRICAL | CABLES | 0.65 | 0.00080 | 2,500 | Low | Engineering standard |
| CIVIL_INFRA | ALL | 0.75 | 0.00090 | 2,100 | Low | Proxy-adapted |

### 11.2 Damage Ratio at Key Intensity Levels

| Subsystem | I=200 | I=500 | I=1,000 | I=2,000 | I=3,000 | I=5,000 | I=10,000 |
|-----------|-------|-------|---------|---------|---------|---------|----------|
| PV_MODULE | 0.02 | 0.10 | 0.18 | 0.44 | 0.71 | 0.93 | 0.95 |
| MOUNTING (TRACKER) | 0.01 | 0.10 | 0.14 | 0.22 | 0.35 | 0.55 | 0.78 |
| INVERTER_SYSTEM | 0.01 | 0.15 | 0.33 | 0.77 | 0.92 | 0.95 | 0.95 |
| SUBSTATION | 0.01 | 0.12 | 0.21 | 0.51 | 0.79 | 0.94 | 0.95 |
| ELECTRICAL (CABLES) | 0.01 | 0.11 | 0.15 | 0.26 | 0.41 | 0.57 | 0.65 |
| CIVIL_INFRA | 0.04 | 0.14 | 0.20 | 0.36 | 0.53 | 0.70 | 0.75 |

### 11.3 Intensity Thresholds at Key Damage Levels

| Subsystem | DR=10% | DR=25% | DR=50% | DR=75% | DR=90% |
|-----------|--------|--------|--------|--------|--------|
| PV_MODULE | ~450 | ~1,300 | ~2,200 | ~3,100 | ~4,300 |
| MOUNTING | ~500 | ~2,300 | ~4,500 | ~8,100 | >10,000 |
| INVERTER_SYSTEM | ~280 | ~800 | ~1,350 | ~1,950 | ~2,700 |
| SUBSTATION | ~370 | ~1,200 | ~1,975 | ~2,800 | ~3,950 |
| ELECTRICAL | ~400 | ~1,900 | ~4,000 | >10,000 | >10,000 |
| CIVIL_INFRA | ~50 | ~1,300 | ~2,900 | >10,000 | >10,000 |

All values in kW/m (Byram's fireline intensity). N/A where DR_max (L) < threshold value.

### 11.4 Relative Vulnerability Ranking

```
Most vulnerable to lowest fire intensity:
  1. INVERTER_SYSTEM  (x₀ = 1,300 kW/m)   — Electronics fail first
  2. SUBSTATION       (x₀ = 1,900 kW/m)   — Oil transformer fire risk
  3. PV_ARRAY         (x₀ = 2,100 kW/m)   — EVA ignition and cell failure
  4. CIVIL_INFRA      (x₀ = 2,100 kW/m)   — O&M buildings vulnerable
  5. ELECTRICAL       (x₀ = 2,500 kW/m)   — Buffered by underground cables
  6. MOUNTING         (x₀ = 3,600 kW/m)   — Steel structure most resistant
```

### 11.5 Curve ID Naming Convention

Per InfraSure taxonomy:
- `wildfire/pv_module_generic` — PV_MODULE curve
- `wildfire/tracker_generic` — MOUNTING (tracker) curve
- `wildfire/inverter_generic` — INVERTER_SYSTEM curve
- `wildfire/transformer_generic` — SUBSTATION curve
- `wildfire/cable_generic` — ELECTRICAL cables curve
- `wildfire/civil_infra_generic` — CIVIL_INFRA curve

---

## 12. FSim Integration & Hazard Model Notes

### 12.1 USFS Fire Simulation System (FSim)

FSim (USFS Fire Simulation System) is the primary USFS tool for generating conditional fire intensity distributions used in national probabilistic wildfire risk assessments ([Data.gov FSim, 2025](https://catalog.data.gov/dataset/probabilistic-wildfire-risk-map-service-cdbcf)):

- FSim simulates tens of thousands of hypothetical fire seasons using historical weather data
- Outputs include: **Burn Probability (BP)** and **Conditional Flame Length Probabilities (FLP)**
- BP × conditional intensity distribution → expected annual wildfire damage when convolved with damage curves
- Flame length is directly related to fireline intensity via Byram's relation: F_H = 0.0775 × I^0.46 (Byram 1959)

**FSim outputs for damage curve integration:**

| FSim Output | Symbol | Units | Use in Damage Model |
|-------------|--------|-------|---------------------|
| Burn probability | BP | Annual probability | P(fire occurs at this location) |
| Conditional flame length | CFL | ft or m | Convert to I via inverse Byram |
| Flame length exceedance | FLEP4, FLEP8 | Probability | P(FL > 4 ft, 8 ft) given fire |
| Mean fireline intensity | MFI | kW/m | Central tendency for damage calc |

The USFS Wildfire Risk to Communities (WRC) dataset ([wildfirerisk.org methods, 2024](https://wildfirerisk.org/wp-content/uploads/2024/05/WildfireRiskToCommunities_V2_Methods_Landscape-wideRisk.pdf)) provides:
- **iMFI** raster: mean conditional fireline intensity (kW/m) at 120-m resolution — directly usable as the x-axis input for InfraSure's damage curves

**Conversion: Flame Length → Fireline Intensity:**

Byram's flame length equation (widely used in FSim outputs):
```
I = (F_H / 0.0775)^(1/0.46)
```

Or equivalently:
```
F_H (m) = 0.0775 × I^0.46
```

| Flame Length (ft) | Flame Length (m) | I (kW/m) | Fire Control Category |
|-------------------|-----------------|----------|----------------------|
| 4 ft (1.2 m) | 1.2 | ~130 | Manual suppression limit |
| 8 ft (2.4 m) | 2.4 | ~450 | Mechanical control limit |
| 11 ft (3.4 m) | 3.4 | ~880 | Structure ignition begins |
| 15 ft (4.6 m) | 4.6 | ~1,500 | Active crown fire transition |
| 25 ft (7.6 m) | 7.6 | ~3,500 | Extreme fire |
| 50+ ft (15+ m) | 15+ | ~10,000 | Catastrophic crown fire |

### 12.2 BehavePlus Fire Behavior System

BehavePlus ([Andrews et al., 2003; AMS PDF](https://ams.confex.com/ams/pdfpapers/126669.pdf)) is the USFS desktop fire behavior modeling system that computes:
- Rate of spread, flame length, spotting distance, and scorch height
- **Fireline intensity** directly in kW/m (or BTU/ft/s)
- Inputs: fuel model, moisture content, terrain, wind

BehavePlus is appropriate for site-specific analysis of a solar farm in a specific fuel type (e.g., California Annual Grass, FM1; or California Chaparral, FM4). A site owner can estimate the conditional intensity distribution using BehavePlus for the relevant fuel model and weather percentiles.

### 12.3 CLIMADA Wildfire Module

Lüthi et al. (2021) developed the CLIMADA wildfire impact module ([Lüthi et al., 2021, GMD](https://gmd.copernicus.org/articles/14/7175/2021/)):
- Uses **brightness temperature** (VIIRS/MODIS satellite data) as the hazard intensity metric, calibrated against EM-DAT economic damage data
- Impact function is a sigmoid relating brightness temperature → mean damage ratio for generic built assets
- Does **not** provide RE-specific damage functions
- Applicable as a **cross-check** at regional scale but not directly usable for subsystem-level damage curves
- CLIMADA's intensity metric (brightness temperature, K) requires conversion and is less physically direct than fireline intensity for site-level analysis

The InfraSure approach (using fireline intensity directly from FSim) is more physically appropriate for utility-scale solar assets.

---

## 13. Real-World Wildfire Events: Calibration Anchors

Very few empirically documented wildfire damage events for utility-scale solar exist in the literature. The following provide limited calibration anchors:

### 13.1 California 2020 Wildfires — Smoke Production Loss (Channel 2)

- September 2020: CAISO solar generation down **13.4%** year-over-year during peak smoke week despite increased total capacity
- Peak irradiance reduction: up to **20%** GHI in Central Valley ([SolarAnywhere, 2021](https://www.solaranywhere.com/2021/2020-solar-deviation-summary-na-wildfire-smoke-impact-report/))
- NCAR study (Juliano et al., 2022): 10–30% peak hour production loss, 27% average forecast underperformance ([NCAR, 2022](https://news.ucar.edu/132875/california-wildfire-smoke-dimmed-solar-energy-2020))
- Cumulative annual impact at one Central Valley tracking PV site: −122 MWh/MW-DC (−5.8% of typical annual output)
- **Note:** These are smoke/Channel 2 losses, not physical damage

### 13.2 Camp Fire (Butte County, November 2018)

- 153,336 acres burned; 18,804 structures destroyed; 85 fatalities
- The most destructive fire in California history at the time
- Estimated fireline intensities: 3,000–20,000 kW/m during extreme wind-driven phase ([CAL OES After Action, 2025](https://www.caloes.ca.gov/wp-content/uploads/Preparedness/Documents/FINAL-AAR-2018-Camp-Fire-508-Clean-Copy-11.17.25.pdf))
- **No utility-scale solar farms were directly in the fire path.** However, the fire destroyed the Paradise area which has ground-mounted small commercial solar; anecdotal total-loss reports for directly burned arrays.
- IBHS analysis of 2017-2018 fires confirmed that vegetative clearance and topography were more predictive of damage than building features ([IBHS, 2020](https://ibhs.org/ibhs-news-releases/damage-analysis-of-2017-2018-wildfires-shows-importance-of-mitigation/))

### 13.3 PacifiCorp Wildfire Liability — Infrastructure Loss Context

PacifiCorp agreed to pay **$575 million** to settle federal claims for 6 wildfires (California and Oregon, 2020) that burned 290,000 acres of federal land ([DOJ, 2026](https://www.justice.gov/usao-edca/pr/pacificorp-agrees-pay-575-million-settle-claims-damage-caused-six-wildfires-california)). While these fires damaged electrical transmission infrastructure rather than solar farms, they document:
- Large-scale wildfire damage to electrical grid infrastructure
- The Slater Fire (Klamath NF, 2020): 157,229 acres
- The McKinney Fire (2022): 39,000 acres federal
- These events confirm the severe exposure of electrical infrastructure to California wildfires

### 13.4 Los Angeles 2025 Wildfires — Scale Reference

Milliman's January 2025 loss analysis for the Palisades and Eaton fires: **$25.2–$39.4 billion** insured losses ([Milliman, 2025](https://www.milliman.com/en/insight/industry-insured-losses-for-los-angeles-wildfires)). While primarily residential losses, the scale confirms that wildfire events can produce catastrophic losses to assets in the WUI.

### 13.5 Data Gap Acknowledgment

**Critical data gap:** No publicly available dataset systematically documents physical damage ratios for utility-scale solar farms from wildfires, with corresponding fireline intensity estimates. The curves derived in this document are **engineering-judgment-based** and require empirical calibration. Post-fire forensic studies of solar farms (if and when they occur) should be treated as priority calibration data.

The derivation guide notes a hypothetical calibration event structure:
- Event 1: Camp Fire 2018, Solar Farm X → 45% damage, ~12,000 kW/m estimated
- Event 2: Thomas Fire 2017, Solar Farm Y → 20% damage, ~6,000 kW/m estimated

Neither of these have been confirmed with actual solar farm damage data. These are illustrative examples only.

---

## 14. Data Gaps & Recommendations

### 14.1 Critical Data Gaps

| # | Data Gap | Impact on Curves | Priority |
|---|----------|-----------------|----------|
| 1 | **No empirical damage ratio data for solar farms in wildfires** | All curves are engineering-judgment based; cannot validate L, k, x₀ | Critical |
| 2 | **Distance (d) assumption not standardized** | ±factor of 2 in heat flux at any given intensity | High |
| 3 | **Fire residence time uncertainty** (1–30 min) | Thermal dose depends on duration, not just flux | High |
| 4 | **Enclosure protection factor for inverters** | IP-rated enclosures provide 1–5 min of significant thermal buffering | Medium |
| 5 | **Cable routing fraction** (above vs. below ground) | Dominates ELECTRICAL curve uncertainty; site-specific | High |
| 6 | **Transformer oil fire propagation** | Potentially catastrophic non-linear effect at specific oil temperature | High |
| 7 | **Combined fire + wind events** | Wind may increase heat flux; also physically damages structure | Medium |
| 8 | **Ember attack separate from radiant flux** | Embers can ignite from >1 km; not captured in q = 0.35I/d model | Medium |
| 9 | **Post-fire recovery costs** | Replacement vs. repair; lead times for transformers, inverters | Medium |
| 10 | **Tracker position at fire time** | Stow position (horizontal) vs. operational (tilted) affects exposure | Low |

### 14.2 Recommended Validation Steps

1. **Event tracking program:** Establish systematic data collection protocol for every solar farm that experiences direct wildfire exposure — document: GPS location, fire perimeter maps, FSim-estimated or post-fire estimated intensity, physical damage assessment by component, total replacement cost. Even 5–10 documented events would dramatically improve curve confidence.

2. **Post-fire forensic studies:** Partner with insurance adjusters and plant owners to conduct IEC 62446 / IEC 61215 compliant module testing on fire-damaged panels (EL imaging, IV curve testing). This would anchor the PV module damage curve at specific intensity levels.

3. **Lab-scale fire exposure testing:** Expose representative PV module assemblies, inverter enclosures, and cable runs to controlled heat flux (cone calorimeter or furnace-based) for 5-minute durations at q = 20, 40, 80, 120 kW/m². This would provide direct empirical threshold validation.

4. **FSim site analysis:** For a representative portfolio of solar farms in California, Oregon, and Southwest, run FSim or FlamMap to generate conditional fireline intensity distributions at each site. This would produce site-level exceedance probability curves compatible with the damage functions above.

5. **Distance sensitivity analysis:** Conduct systematic analysis of the d assumption. Consider using a spatial fire spread model (e.g., FarSite) to estimate actual fire penetration depth into solar array rows for different array spacings and fire approach angles.

6. **Expert elicitation:** Convene a panel of fire scientists, solar farm O&M engineers, and insurance professionals to review curve parameters and provide probabilistic estimates for L, k, x₀ with uncertainty bounds.

---

## 15. Sources & References

### Fire Science & Hazard Modeling

1. Byram, G.M. (1959). "Combustion of forest fuels." In *Forest Fire: Control and Use*, McGraw-Hill. — Foundational fireline intensity equation.

2. Alexander, M.E. (1982). "Calculating and interpreting forest fire intensities." *Canadian Journal of Botany*, 60(4), 349–357. DOI: 10.1139/b82-048. — Fireline intensity interpretation framework.

3. Scott, J.H. (2006). "Pyrologix Introduction to Fire Behavior Modeling." USFS. https://pyrologix.com/wp-content/uploads/2014/04/Scott_20121.pdf — Comprehensive fire behavior modeling reference; fireline intensity scale (FIS).

4. Sullivan, A.L. (2003). "A review of wildland fire spread models." *International Journal of Wildland Fire*. — Wildfire heat flux formula validation.

5. Butler, B.W. & Cohen, J.D. (1998). "Firefighter safety zones: a theoretical model based on radiative heating." *International Journal of Wildland Fire*, 8(2), 73–77. — Heat flux at distance from fire front.

6. SFPE Handbook of Fire Protection Engineering, 5th ed. (2016). Society of Fire Protection Engineers. Chapter 72: Wildland Fire Basics. — Component heat flux effects; standard fire engineering reference.

7. Andrews, P.L., Bevins, C.D., & Seli, R.C. (2003). "BehavePlus fire modeling system, version 2.0." USDA Forest Service. https://ams.confex.com/ams/pdfpapers/126669.pdf — BehavePlus fire modeling system description.

8. Lüthi, S., Aznar-Siguan, G., Fairless, C., & Bresch, D.N. (2021). "Globally consistent assessment of economic impacts of wildfires in the context of climate change." *Geoscientific Model Development*, 14, 7175–7187. DOI: 10.5194/gmd-14-7175-2021. https://gmd.copernicus.org/articles/14/7175/2021/ — CLIMADA wildfire impact module.

9. USFS Probabilistic Wildfire Risk (FSim). Data.gov, updated April 2025. https://catalog.data.gov/dataset/probabilistic-wildfire-risk-map-service-cdbcf — FSim national burn probability and conditional fire intensity data.

10. Wildfire Risk to Communities Methods, V2 (2024). wildfirerisk.org. https://wildfirerisk.org/wp-content/uploads/2024/05/WildfireRiskToCommunities_V2_Methods_Landscape-wideRisk.pdf — WildEST FlamMap methodology for national conditional flame length data.

11. Pyrologix (2019). "USFS Region 4 Wildfire Hazard Report: Methods and Results." https://pyrologix.com/wp-content/uploads/2019/11/Region4_WildfireHazardReport_04_26_19.pdf — FSim MFI (mean conditional fireline intensity) methodology.

12. Marchetti, L.J. (2020). "Estimating Fire Flame Height and Radiant Heat Flux from Fire." PDH Online. https://pdhonline.com/courses/m312/Radiant%20Flux.pdf — SFPE-based radiant heat flux calculation methods.

### PV Module Fire Properties

13. Wang, Y., et al. (2015). "Experimental Studies on the Flammability and Fire Hazards of Photovoltaic Modules." *Materials*, 8(7), 4210–4225. DOI: 10.3390/ma8074210. https://pmc.ncbi.nlm.nih.gov/articles/PMC5455650/ — Critical heat flux 26 kW/m² for PV module ignition; EVA fire behavior.

14. Xiaoyu, J., et al. (2025). "Experimental investigation on the combustion performance of single crystalline silicon PV modules." *Solar Energy Materials and Solar Cells*. DOI: 10.1016/j.solmat.2025.113140. https://www.sciencedirect.com/science/article/abs/pii/S0927024825001291 — Cone calorimeter EVA fire tests; CHF confirmation at 26 kW/m².

15. IRB Stuttgart (2014). "Fire behavior of PV modules: Summary of European fire tests." https://www.irbnet.de/daten/kbf/kbf_e_F_2897.pdf — Multi-standard PV fire testing; glass/backsheet vs. glass/glass fire behavior.

16. IEA PVPS Task 13 (2014). "Review of Failures of Photovoltaic Modules." IEA-PVPS T13-01. https://iea-pvps.org/wp-content/uploads/2020/01/IEA-PVPS_T13-01_2014_Review_of_Failures_of_Photovoltaic_Modules_Final.pdf — PV module failure mode taxonomy.

17. UL (2017). "IEC 61730 2nd Edition: Overview and Impact." UL Code Authorities. https://code-authorities.ul.com/wp-content/uploads/sites/40/2017/05/CS10111_IEC_Solar-WP-Web_5-30.pdf — IEC 61730 PV module safety standard; fire classification overview.

18. Keystone Compliance (2024). "IEC 61730-1 Photovoltaic Module Compliance Testing." https://keystonecompliance.com/iec-61730-1/ — IEC 61730 testing requirements overview.

19. Energy.gov FEMP (2024). "Solar Photovoltaic Hardening for Resilience – Wildfire." U.S. Department of Energy. https://www.energy.gov/femp/solar-photovoltaic-hardening-resilience-wildfire — DOE guidance on PV fire ratings, defensible space, temperature thresholds; Class A/B/C fire classifications.

### Steel & Aluminum Fire Properties

20. Eurocode 3: Design of steel structures — Part 1-2: General rules — Structural fire design (EN 1993-1-2:2005). CEN. https://www.phd.eng.br/wp-content/uploads/2015/12/en.1993.1.2.2005.pdf — Steel yield strength reduction factors at elevated temperature (Table 3.1).

21. NIST TN 1907 (2016). "Temperature-Dependent Material Modeling for Structural Steels." National Institute of Standards and Technology. https://nvlpubs.nist.gov/nistpubs/TechnicalNotes/NIST.TN.1907.pdf — NIST steel elevated-temperature constitutive models.

22. Lee, J. (2012). "Elevated-Temperature Properties of Steel for Structural-Fire Analysis." PhD Dissertation, University of Texas at Austin. https://fsel.engr.utexas.edu/pdfs/LEE_PhD_Dissertation_opt1.pdf — ASTM A992 structural steel at elevated temperature.

23. Aluminum Association (2020). "Fire Safety of Aluminum & Its Alloys." https://www.aluminum.org/sites/default/files/2021-11/FireSafetyAluminumAlloys_9.8.20.pdf — Aluminum alloys: strength loss above 150°C; melting at 660°C.

24. Puplampu, S.B. & Siriruk, A. (2021). "Stress-strain and microscopy data for fire-damaged aluminum alloy 6061 subjected to multiaxial loading." *Data in Brief*, 38. DOI: 10.17632/vg3wkkb69t.1. https://pmc.ncbi.nlm.nih.gov/articles/PMC8385160/ — AA6061 mechanical properties after fire damage at 400°C and 500°C.

### Electronics & Inverter Standards

25. IEC 62109-1:2010. "Safety of Power Converters for Use in Photovoltaic Power Systems — Part 1: General Requirements." IEC. — Temperature rise test requirements for PV inverters; maximum component temperatures.

26. Anern (2025). "IEC Standards for PV Inverters and ESS Safety: Ultimate Guide." https://www.anernstore.com/blogs/diy-solar-guides/iec-standards-pv-inverters-ess-safety — IEC 62109-1/-2 fire hazard protection requirements overview.

### Cable Thermal Limits

27. ELEK Software (2024). "Temperature Limits for XLPE Insulated Cables." https://elek.com/articles/temperature-limits-for-xlpe-cables/ — XLPE max operating temperature 90°C continuous; 105°C emergency (72 hrs); IEC 60840, AEIC CS9.

28. NPC Electric (2026). "XLPE vs PVC Cable 2026." https://www.npcelectric.com/news/xlpe-vs-pvc-power-cable-which-is-better-for-underground-high-temperature-use.html — XLPE: 90°C continuous, 250°C short-circuit; PVC: 70°C continuous, 160°C short-circuit.

29. Prysmian Group. "Low Voltage Power Cable XLPE, PVC, LSHF — SE Asia." IEC 60332-1 flame retardancy reference. https://asean.prysmian.com/sites/asean.prysmian.com/files/media/documents/Prysmian_LVCables_SEA.pdf

### Transformer Fire Risk

30. Oil-Tester.com (2025). "Transformer Oil Flash Point and Its Importance." https://www.oil-tester.com/transformer-oil-flash-point-and-its-importance/ — Mineral transformer oil flash point: 140°C; fire point: 165°C.

31. Cargill (2015). "FR3 Fluid Fire Safety." https://www.cargill.com/bioindustrial/fr3-fluid/fire-safety — Mineral oil: flash 155°C, fire 165°C; FR3 bio-fluid: flash 330°C, fire 360°C.

32. University of Canterbury (2019). "Risk Assessment of Transformer Fire Protection in a Typical New Zealand Substation." https://ir.canterbury.ac.nz/bitstreams/bbf94619-f688-415c-ba73-42d2f8b70cb8/download — Transformer fire risk assessment; event tree analysis.

### Solar Farm Wildfire Events & Loss Data

33. Juliano, T.W., et al. (2022). "California wildfire smoke dimmed solar energy in 2020." NCAR. https://news.ucar.edu/132875/california-wildfire-smoke-dimmed-solar-energy-2020 — 10–30% peak-hour production loss; smoke aerosol irradiance reduction.

34. Clean Power Research / SolarAnywhere (2021). "2020 Regional Solar Deviation Summary & U.S. Wildfire Smoke Impact Report." https://www.solaranywhere.com/2021/2020-solar-deviation-summary-na-wildfire-smoke-impact-report/ — 20% GHI reduction in Central Valley; worst year on record for tracking PV.

35. PV Tech (2022). "California wildfires in 2020 dimmed solar panels production by 10-30%." https://www.pv-tech.org/california-wildfires-in-2020-dimmed-solar-panels-production-by-10-30-says-ncar-study/ — Secondary reporting of NCAR study.

36. CAL OES (2025). "2018 Camp Fire After Action Report." https://www.caloes.ca.gov/wp-content/uploads/Preparedness/Documents/FINAL-AAR-2018-Camp-Fire-508-Clean-Copy-11.17.25.pdf — 153,336 acres; 18,804 structures; extreme wind-driven fire.

37. IBHS (2020). "Damage analysis of 2017-2018 wildfires shows importance of mitigation." https://ibhs.org/ibhs-news-releases/damage-analysis-of-2017-2018-wildfires-shows-importance-of-mitigation/ — Vegetative clearance > building features in determining damage.

38. DOJ (2026). "PacifiCorp Agrees to Pay $575 Million to Settle Claims for Damage Caused by Six Wildfires." https://www.justice.gov/usao-edca/pr/pacificorp-agrees-pay-575-million-settle-claims-damage-caused-six-wildfires-california — Wildfire liability for electrical infrastructure damage.

39. Milliman (2025). "Industry insured losses for Los Angeles wildfires." https://www.milliman.com/en/insight/industry-insured-losses-for-los-angeles-wildfires — $25.2–$39.4 billion insured losses from Palisades and Eaton fires.

40. Utility Dive (2024). "Nearly 100 utilities' credit ratings downgraded since 2020 as wildfire risk grows." https://www.utilitydive.com/news/nearly-100-utilities-credit-ratings-downgraded-since-2020-wildfires/730657/ — Wildfire risk impact on utility credit ratings.

### Regulatory & Standards

41. CPUC (2024). "Public Safety Power Shutoffs (PSPS)." https://www.cpuc.ca.gov/psps/ — PSPS framework; California IOU de-energization authority and event statistics.

42. Firetrace International (2022). "Solar Farm Fire Protection." https://www.firetrace.com/solar-farm-fire-protection — NFPA 855 requirements for solar and ESS fire protection.

43. NFPA. NFPA 855: Standard for the Installation of Stationary Energy Storage Systems. https://www.nfpa.org/codes-and-standards/nfpa-855-standard-development/855 — Minimum requirements for ESS fire risk mitigation.

44. Ready for Wildfire (2024). "Defensible Space." https://www.readyforwildfire.org/prepare-for-wildfire/defensible-space/ — Zone 0/1/2 defensible space guidelines for California.

45. ASCE (2025). "As wildfires rage in LA area, infrastructure under threat." https://www.asce.org/publications-and-news/civil-engineering-source/article/2025/01/15/as-wildfires-rage-in-la-area-infrastructure-including-roadways-under-threat — Road repair costs $127,783/km for 2020 Oregon/WA/CA megafires.

46. San Diego County (2013). "Draft Fire Protection Plan — Tierra del Sol Solar Farm Project." https://www.sandiegocounty.gov/content/dam/sdc/pds/ceqa/Soitec-Documents/RFPEIR/Appendix_3.1.4-5_DraftFireProtectionPlan_TDS_OPT_1.pdf — Solar farm fire protection plan; access, spacing, setback requirements.

47. Solar PV Systems Under Weather Extremes (2024). *Renewable Energy*, Elsevier. DOI: 10.1016/j.renene.2024.121881. https://www.sciencedirect.com/science/article/pii/S2352484724008813 — Extreme weather impacts on PV systems, including fire exposure.

---

## Appendix A: Component Weight Assumptions

The component weights used for aggregation within each subsystem are engineering estimates based on typical utility-scale solar project cost distributions (NREL SAM cost data, IRENA cost studies, industry experience):

| Subsystem | Component | Weight | Source |
|-----------|-----------|--------|--------|
| PV_MODULE | Glass + cells | 50% | NREL module cost breakdown |
| PV_MODULE | EVA encapsulant | 15% | |
| PV_MODULE | Backsheet | 10% | |
| PV_MODULE | Junction box | 15% | |
| PV_MODULE | Frame | 10% | |
| MOUNTING | Steel torque tube | 40% | SEIA tracker cost study |
| MOUNTING | Aluminum drive/arm | 25% | |
| MOUNTING | Motor/actuator | 20% | |
| MOUNTING | Fixed bracket | 15% | |
| INVERTER_SYSTEM | Inverter (central/string) | 70% | NREL SAM |
| INVERTER_SYSTEM | Combiner box | 30% | |
| SUBSTATION | Transformer | 60% | Industry cost estimates |
| SUBSTATION | Switchgear | 25% | |
| SUBSTATION | Control panel | 15% | |
| ELECTRICAL | DC string cables | 30% | Typical solar BOM |
| ELECTRICAL | DC collection cables | 30% | |
| ELECTRICAL | AC cables | 30% | |
| ELECTRICAL | Conduit/tray | 10% | |
| CIVIL_INFRA | Fencing | 30% | NREL BOS cost data |
| CIVIL_INFRA | Roads | 30% | |
| CIVIL_INFRA | O&M building | 30% | |
| CIVIL_INFRA | Grading/drainage | 10% | |

---

## Appendix B: Uncertainty Framework

All curves carry **±40–60% uncertainty** in the midpoint parameter x₀ and **±15–25% uncertainty** in L. The primary sources of uncertainty are:

| Source | Typical Contribution | Notes |
|--------|---------------------|-------|
| Distance assumption (d) | ±40% in q | 1/d scaling — d=5m doubles q vs. d=10m |
| Fire residence time | ±30% | 1–15 min exposures produce very different damage |
| Fuel/fire type variability | ±25% | Grass vs. chaparral vs. timber produce different combustion temperatures |
| Component material variability | ±15% | Manufacturing differences; age degradation |
| No empirical calibration data | Dominant | All curves are engineering-judgment-based |

The **correct interpretation** of these curves for risk modeling is:
1. Use the midpoint x₀ as the central estimate
2. Propagate ±50% uncertainty in x₀ to produce a confidence band
3. At any given intensity level, expect the true damage ratio to be within a factor of 2 of the modeled value
4. Treat the curves as order-of-magnitude reliable for loss modeling, not precision tools

---

*End of WILDFIRE × SOLAR Research Document*  
*File path: /home/user/workspace/damage_curve_research/WILDFIRE_x_SOLAR.md*  
*Version 1.0 | March 2026 | InfraSure Damage Curve Library*
