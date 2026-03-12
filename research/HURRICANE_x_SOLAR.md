# HURRICANE × Solar Subsystems: Deep Research for Damage Curve Derivation

**Prepared for:** InfraSure Transparent Damage Curve Library  
**Hazard:** HURRICANE — characterized by 3-second peak gust wind speed (mph)  
**Subsystems covered:** PV_ARRAY, MOUNTING, SUBSTATION  
**Curve IDs:** `hurricane/pv_array_generic`, `hurricane/pv_array_tracker_stow`, `hurricane/pv_array_tracker_midtilt`, `hurricane/pv_array_fixed_tilt`, `hurricane/mounting_tracker`, `hurricane/mounting_fixed`, `hurricane/substation_solar`  
**Last updated:** March 2026  
**Derivation basis:** Engineering standards, empirical post-event data, aerodynamic testing, proxy adaptation

---

## Table of Contents

1. [Hurricane vs. Strong Wind: Key Distinctions](#1-hurricane-vs-strong-wind-key-distinctions)
2. [PV_ARRAY × HURRICANE](#2-pv_array--hurricane)
3. [MOUNTING × HURRICANE](#3-mounting--hurricane)
4. [SUBSTATION × HURRICANE](#4-substation--hurricane)
5. [Recommended Curve Parameters Summary](#5-recommended-curve-parameters-summary)
6. [Data Gaps & Recommendations](#6-data-gaps--recommendations)
7. [Sources & References](#7-sources--references)

---

## 1. Hurricane vs. Strong Wind: Key Distinctions

This section explains why hurricane damage curves differ from generic STRONG_WIND curves and must be treated as a distinct hazard.

### 1.1 Compound Hazard Profile

A hurricane is not simply "very strong wind." It combines:

| Dimension | Strong Wind Event | Hurricane |
|-----------|------------------|-----------|
| **Wind duration** | Minutes to hours | 6–24+ hours of sustained force |
| **Sustained vs. gust ratio** | Gust-dominant | Both sustained (1-min avg) and 3-sec gusts are extreme |
| **Storm surge / flooding** | Absent | Significant — 0–15+ ft inundation near coast |
| **Wind-driven rain** | Light | Heavy; horizontal rain penetrates sealed enclosures |
| **Debris field** | Low | High — vegetation, building materials become projectiles |
| **Pressure cycling** | Single-direction | Rotating wind field; assets experience wind from multiple directions as eyewall passes |
| **Duration of uplift loading** | Brief peaks | Sustained uplift forces fatigue fasteners and foundations |
| **Grid disruption** | Localized | Widespread; substations may lose grid reference for days |

### 1.2 Wind Speed Variable Selection

**Selected intensity variable:** 3-second peak gust wind speed (mph) at 10 m height, open exposure (ASCE 7-22 / ASCE 49-21 conventions).

**Rationale:**
- 3-second gust governs structural panel uplift (peak aerodynamic pressure scales as V²)
- ASCE 7-22 basic wind speed maps use this variable for Risk Categories I–IV
- Post-event damage surveys (NERC, IBHS, FEMA) report peak gusts in mph
- Consistent with HAZUS hurricane model wind field outputs
- Enables direct comparison to component-rated pressures via `q = 0.00256 × Kz × Kzt × Kd × Ke × V²` (psf)

**Conversion to pressure:**  
At mean roof height for open-terrain ground-mount (Kz ≈ 0.85, Kzt = 1.0, Kd = 0.85, Ke = 1.0):  
`q (psf) ≈ 0.00185 × V² (mph²)`  

| V (mph) | V (m/s) | q (psf) | q (Pa) |
|---------|---------|---------|--------|
| 90      | 40.2    | 15.0    | 718    |
| 110     | 49.2    | 22.4    | 1,073  |
| 130     | 58.1    | 31.3    | 1,499  |
| 150     | 67.1    | 41.6    | 1,993  |
| 170     | 76.0    | 53.4    | 2,558  |
| 190     | 84.9    | 66.8    | 3,200  |
| 200     | 89.4    | 74.0    | 3,544  |

---

## 2. PV_ARRAY × HURRICANE

**Curve IDs:**  
- `hurricane/pv_array_generic` — Generic weighted average  
- `hurricane/pv_array_tracker_stow` — Single-axis tracker in hurricane stow (0° tilt)  
- `hurricane/pv_array_tracker_midtilt` — Tracker caught mid-tilt or stow failure  
- `hurricane/pv_array_fixed_tilt` — Fixed-tilt ground mount at 20–25°  

**Capex weight:** PV_ARRAY = 0.28–0.35 of total solar facility cost  
**Components:** PV_MODULE (essentially 100% of this subsystem's repair cost)

---

### 2.1 Physics of Damage

#### 2.1.1 Bernoulli Wind Pressure on Panels

The fundamental governing equation for aerodynamic loading:

```
p_net = 0.5 × ρ_air × V² × Cp_net
```

Where:
- `ρ_air ≈ 1.225 kg/m³` at sea level (lower at elevation)
- `V` = wind speed (m/s)
- `Cp_net` = net pressure coefficient (dimensionless), combining topside and underside contributions

For a ground-mounted panel at 25° tilt with wind approaching from the high side:
- **Positive pressure (push):** Acts on the windward face, pushing panel down
- **Negative pressure (uplift):** Acts on the back/underside, pulling panel up
- **Critical scenario:** Wind approaching from the uphill (low) edge → maximum uplift via underside suction

ASCE 7-22 Section 29.4.5 codifies the net normal force coefficient `GCgn` as a function of:
- Panel tilt angle (θ)
- Panel position in array: perimeter Zone 1 vs. interior Zone 2
- Wind directionality
- Array spacing and row-to-row geometry

**Key ASCE 7-22 finding:** Edge and corner panels experience 1.5× to 2× the pressure of interior panels. The `γE = 1.5` factor (vs. 1.0 for interior) explicitly captures this. This is the primary driver of cascade failure — edge panels fail first, become projectiles that damage interior rows.

#### 2.1.2 Failure Sequence

**Stage 1 — Fastener fatigue (sustained wind 60–90 mph):**  
Repeated loading cycles (4–10 Hz vortex shedding) loosen clamp bolts. Self-tapping screws in light-gauge channels are especially vulnerable to pull-out under cyclic loading.

**Stage 2 — Edge panel uplift (gusts 90–120 mph):**  
Perimeter panels experience pressure coefficients Cp,net ≈ −2.5 to −3.5 (uplift). At 130 mph: q ≈ 31 psf (1,485 Pa). With Cp = −2.5: net uplift ≈ 78 psf (3,735 Pa) on edge panels — exceeding standard 2,400 Pa ratings.

**Stage 3 — Panel liftoff and cascade (gusts 110–150 mph):**  
Released edge panels become wind-borne debris, impacting adjacent rows. Insurance loss surveys document cascade failures where 20–40% of array is destroyed by 2–3 initial panel failures. Post-event GSA/FEMP analysis of St. Croix (2017) documented complete array destruction from initial fastener failures.

**Stage 4 — Frame structural failure (gusts >130 mph):**  
Inadequately designed racking (light-gauge C-channels) buckles or twists. Closed-section tubular framing substantially outperforms open C-channels at equivalent weight.

**Stage 5 — Water ingress (concurrent with any wind stage):**  
Wind-driven rain penetrates cracked glass, junction boxes, and conduit entries. Electrical failures (arc faults, ground faults) can persist for months post-storm even on visually undamaged arrays.

**Stage 6 — Combined wind + flooding:**  
In stow position (0° tilt), flat panels accumulate surface water (ponding). Storm surge floods inverter pads, combiner boxes, and underground conduit. The GSA/FEMP St. Croix case documented flooding of underground conduit runs downhill to inverter/switchgear rooms.

#### 2.1.3 Tilt Angle Criticality

| Tilt Angle | Wind Load Characteristics | Failure Mode |
|------------|--------------------------|--------------|
| 0° (tracker stow) | Low static Cp, but **maximum torsional galloping risk**; near-flat acts as wing → vortex lock-in | Dynamic flutter failure at 40–75 mph; paradoxically more dangerous than 25° at moderate winds |
| 10–15° | Intermediate — recommended "safe stow" per FEMP research | Reduced dynamic + manageable static loads |
| 20–25° (fixed-tilt standard) | Higher static uplift on back face; well-characterized by ASCE 7 | Fastener pull-out + frame buckling at high gusts |
| 35–45° | High static drag; greater net force coefficient | Generally not used for utility scale; extreme structural demand |

**Critical insight from CPP Wind / NEXTracker research:** Trackers stowed flat (0°) are NOT safe during hurricanes. Torsional galloping — a self-excited aeroelastic instability — occurs at wind speeds as low as 40 m/s (89 mph) for trackers in flat stow. The mechanism involves vortex formation at the leading edge, creating a lock-in cycle that amplifies ±20–70° oscillation until structural failure.

---

### 2.2 Engineering Standards & Design Thresholds

#### 2.2.1 ASCE 7-22

ASCE 7-22 represents a major advance over prior versions by introducing **Section 29.4.5** (new in ASCE 7-22) specifically for ground-mounted fixed-tilt PV systems — previously absent, forcing engineers to use open building monoslope roof approximations.

**Key ASCE 7-22 provisions for solar:**

| Section | Scope | Key Change |
|---------|-------|------------|
| 29.4.3 | Low-slope rooftop PV (θ ≤ 7°) | Updated Cp values |
| 29.4.4 | Flush-mounted rooftop | Refined γA, γE factors |
| **29.4.5** | **Ground-mount fixed-tilt (new)** | **Site-specific GCgn, GCgm coefficients; zones 1 and 2** |
| 29.4.5.2 | Design force/moment calculations | Net force `Fn` and center-axis moment `Mc` equations |
| 29.4.5.3 | Dynamic amplification | Tracker-specific guidance |
| Ch. 32 | Tornado loads | Risk Category III/IV solar installations |

**Basic wind speed contours:** ASCE 7-22 maps were revised in hurricane-prone regions; coastal Florida, Puerto Rico, Caribbean now show 160–200+ mph design speeds for Risk Category II.

**Design wind pressure formula (ground mount):**
```
Fn = qh × GCgn × (Ag)    [Net normal force]
Mc = qh × GCgm × (Ag × Lc)  [Net moment about centerline]
```
Where `qh` is velocity pressure at mean panel height, `GCgn` is the combined net pressure coefficient, `Ag` is gross panel area, and `Lc` is chord length.

**Pressure coefficient ranges from ASCE 7-22 (approximated from figures):**
- Interior Zone 2: `GCgn` ≈ −1.2 to +1.8 (uplift/push)
- Perimeter Zone 1: `GCgn` ≈ −2.0 to +2.5 (up to 2× interior)

#### 2.2.2 IEC 61215:2021 — Module Mechanical Load Testing

The primary module-level standard specifies:

| Test | Load | Equivalent Wind Speed (approx.) | Duration |
|------|------|--------------------------------|----------|
| **Static Mechanical Load (SML)** — minimum | ±2,400 Pa (50 psf) | ~130–150 km/h (~80–93 mph) | 3 cycles × 1 hr |
| **Static Mechanical Load** — enhanced | ±5,400 Pa (112 psf) | ~195–210 km/h (~121–130 mph) | 3 cycles × 1 hr |
| **Dynamic Mechanical Load (DML)** — per IEC 62782 | ±1,000 Pa | N/A (cyclic fatigue) | 1,000 cycles at 3–7 Hz |
| **High-load DML** | ±5,400 Pa | ~121–130 mph | 1,000 cycles |

**Standard ratings context:**
- Most commodity modules: 2,400 Pa back uplift (standard IEC 61215 minimum)
- Premium modules (Silfab, Tongwei, etc.): 5,400 Pa front + 5,400 Pa back
- Ultra-premium modules (EcoFlow, specialized): 6,000–7,200 Pa
- The 2,400 Pa IEC minimum corresponds to **~80–93 mph gust** under typical ground-mount pressure conditions — equivalent to a **weak Category 1 hurricane** (74–95 mph sustained, gusts 90–115 mph)

**Implication for InfraSure curves:** Standard modules begin failing structurally at Category 1 hurricane gust conditions. The 50th percentile damage for a standard-specification array occurs within the Category 1–2 range.

#### 2.2.3 FM Global DS 7-106 (Ground-Mounted Solar PV)

FM Global's Data Sheet 7-106 provides insurer-grade design guidance:

- **Primary hurricane recommendation:** "Avoid locating ground-mounted solar panels in regions prone to tropical storms where exposed to large windborne debris"
- **Large windborne debris threshold:** Design wind speed ≥ 120 mph (54 m/s), OR 110–120 mph within 1 mile of ocean coast
- **Small windborne debris threshold:** Design wind speed ≥ 100 mph (45 m/s)
- **Design safety factor for connections:** 2.0 minimum (vs. 1.6 in standard ASCE)
- **Importance factor:** 1.15 (above standard 1.0 for Risk Category II solar)
- **Tracker interlock requirement:** Stow at 25% below wind tunnel-tested instability speed
- **Tracker testing frequency:** Wind tunnel validation annually at ≤ 35 mph (15 m/s) prior to storm season
- **FM Approval Standard 4478:** Covers rigid PV modules including simulated wind uplift, fire, hail resistance testing

**Key FM Global finding:** For tracker systems, dynamic and aeroelastic loads (torsional galloping, modal excitation, pile bending from row waviness) can cause catastrophic failures at wind speeds well below the static design load — consistent with CPP Wind's research.

#### 2.2.4 IEC 62817:2014 — Solar Tracker Design Qualification

Key wind-loading requirements from the standard:

| Parameter | Value | Type |
|-----------|-------|------|
| Max wind speed during tracking | 14 m/s (31 mph) | Manufacturer-specified example |
| Max wind speed in stow | **40 m/s (89 mph)** | Manufacturer-specified example |
| Torsional backlash limit | 0.1° maximum | Required test parameter |
| Angular deviation during "high wind" test | 5.2 m/s (12 mph) mean | Test condition |
| Payload for mechanical testing | 500 kg over 50 m² | Test requirement |

**IEC 62817 torsional stiffness requirement:** Torque tube twist ≤ 0.5°/m to maintain ±5° system accuracy — this stiffness target also governs aeroelastic stability.

**Critical gap:** IEC 62817 does not certify structural or foundational integrity for hurricane-level winds. It is a design qualification standard for tracking accuracy, not an extreme wind survival standard.

#### 2.2.5 SEAOC PV2-2017

SEAOC (Structural Engineers Association of California) PV2-2017 updates the 2012 guidance:
- Provides best practices for low-profile rooftop and ground-mount arrays
- Requires resonance analysis: natural frequency check using Strouhal number
- Recommends wind tunnel testing for sites with high terrain exposure
- Explicitly addresses vortex shedding risk at specific tilt angles
- Recommends 10–15° as a balanced tilt for hurricane-prone sites (reduces dynamic loading vs. 0° stow while limiting static uplift vs. 25° fixed)

---

### 2.3 Real Hurricane Events: Empirical Damage Data

#### 2.3.1 Hurricane Maria (Puerto Rico / USVI, September 2017)

- **Landfall intensity:** Category 4 / 5 at Puerto Rico; 135 kt (155 mph) sustained at landfall; gusts >175 mph at elevated sites
- **Solar damage — St. Croix GSA Array (469 kW):** **Total loss** at estimated maximum site wind speed of ~104 mph — well below the array's ASCE 7-10 design speed of 145 mph. Root cause: light-gauge C-channel racking, shared module clamps, corroded fasteners, 25° tilt creating high static uplift, unaccounted dynamic loading. Frame twisted, modules liberated, electrical BoS destroyed by flooding.
- **Solar damage — St. Thomas carport (137 kW):** ~50% loss. Carport configuration created atypical wind loading.
- **Solar damage — Puerto Rico (125 kW parking garage):** Only ~5% loss, remaining operational. Managed enclosed mounting, lower wind exposure.
- **Grid context:** 80% of Puerto Rico's utility poles destroyed; entire transmission network collapsed. Substation flooding widespread. Recovery took 11+ months for full restoration.
- **Key finding:** "Arrays that were totally destroyed were all designed to code" — current codes are necessary but insufficient for hurricane resilience when dynamic effects are not accounted for.

Source: U.S. DOE/FEMP, *Toward Solar Photovoltaic Storm Resilience* (2024); NOAA/NHC Tropical Cyclone Report for Maria (2023)

#### 2.3.2 Hurricane Irma (Florida, September 2017)

- **Landfall intensity:** Category 4 at Cudjoe Key (130 mph sustained), Category 3 at Marco Island (112 mph sustained; gusts to 129 mph Naples)
- **NERC observations:** 12 bulk electric system substations fully or partially affected; primarily transmission line damage (1× 500 kV, 48× 230 kV, 48× 138 kV forced outages)
- **Solar observations:** No large-scale solar farm damage reported to NERC. Most Florida utility solar installed 2016–2018 was designed to post-Andrew Florida Building Code requirements (FBC), which impose more stringent requirements than ASCE 7 alone.
- **FPL context:** FPL solar arrays (post-2010 construction) reported no significant damage despite encountering sustained winds 74–100+ mph across the system.

Source: NERC, *Hurricane Irma Event Analysis Report* (2017, published 2018)

#### 2.3.3 Hurricane Michael (Florida Panhandle, October 2018)

- **Landfall intensity:** Category 5 by NHC classification; 150 mph sustained, 155–160 mph gusts; Mexico Beach area gusts possibly 155–165 mph
- **Solar damage:** Limited documented utility-scale solar damage specifically reported in publicly available assessments. The Florida Panhandle had limited utility solar at the time. Agricultural structures (irrigation pivots, grain bins, barns not built to hurricane code) suffered extensive damage at Category 3-equivalent winds 40+ miles inland.
- **Forensic lesson:** Older structures not to hurricane code fail at Category 3 (110–130 mph) conditions; structures built to post-2002 FBC perform significantly better.

Source: Prevatt et al., *Hurricane Michael Data Enhancement Phase II* (Florida Building Commission, 2020); NHC Michael TCR

#### 2.3.4 Hurricane Ian (Southwest Florida, September 2022)

- **Landfall intensity:** Category 4; 150 mph sustained at landfall; gusts >165 mph near Fort Myers
- **FPL solar performance:** 38 solar farms in Ian's path; only **0.3% of 15 million solar panels damaged**. Panels secured 5 ft off ground on metal frames "assembled to withstand hurricane-force winds." This is the best-documented large-scale data point for modern, code-designed utility solar under a major hurricane.
- **Context for 0.3% damage:** FPL solar mostly post-2015 construction, designed to Florida Building Code (160+ mph design), trackers with hurricane stow protocols engaged in advance.
- **Contrast with residential:** 2,427 structures damaged on Estero Island alone, 158 severely damaged or destroyed. Solar clearly outperformed conventional construction.
- **Key limitation:** 0.3% represents total panel count; damage ratio for panels that DID experience full gust loading (near eye path) could be substantially higher.

Source: WMNF / Politico reporting on FPL statement; Hauptman et al., FAU remote sensing study (2024)

#### 2.3.5 Ceferino, Lin & Xi (2023) — Bayesian Solar Panel Fragility Curves

The most rigorous empirical fragility study available, published in *Reliability Engineering & System Safety* (2023):

- **Data source:** Solar panel structural performance data from Caribbean installations for Hurricanes Irma and Maria (2017) and Dorian (2019)
- **Functional form:** Lognormal fragility function
  ```
  P(failure | w) = Φ[ (ln(w) - ln(w̄)) / β ]
  ```
- **Derived parameters (from PNNL Fragility Functions Resource Report, citing Ceferino et al. 2021 preprint):**
  | Panel Type | Median w̄ | Dispersion β |
  |------------|-----------|-------------|
  | Ground-mounted | **58 m/s (130 mph)** | **0.30** |
  | Rooftop | Lower (not specified numerically) | Higher dispersion |
- **Critical finding:** Ground-mounted panels in the Caribbean performed **below code requirements** — panels rated for ASCE design speeds failed at lower observed winds. Rooftop panels performed especially poorly.
- **Implication:** The 50th percentile ground-mount panel fails at ~130 mph 3-second gust — consistent with the St. Croix case (104 mph failure on 145 mph-rated array suggests the actual fragility mean lies 20–30% below rated capacity due to installation deficiencies).
- **Follow-on work (Ceferino, Lin & Xi, 2023, ASCE Natural Hazards Review):** Full probabilistic framework for solar hurricane risk across 38 US states; Florida and Louisiana cloud cover alone reduces solar generation to 32% and 65% of normal at 100-year return periods; permanent panel damage causes 80% more losses than cloud cover alone at 200-year events.

---

### 2.4 Tracker Wind Ratings and Stow Effectiveness

#### 2.4.1 NEXTracker NX Horizon

- **Design wind survival speed:** Configurable up to **240 km/h (150 mph) 3-second gust** at 10 m height
- **Hurricane stow capability:** Intelligent wind stow activated by site-perimeter anemometers; triggers at site-specific predetermined gust threshold (typically ~50 mph); NX Navigator software enables remote manual override
- **Certification:** UL 2703, UL 3703
- **Hurricane Matthew (2016) test case:** NX Horizon survived; confirmed in-field at 100–130 mph design range
- **Key limitation (CPP Wind research, 2015):** NEXTracker-funded research found torsional galloping risk at flat stow in 40–89 mph range; NEXTracker's solution involves variable-row stow position (not uniform flat), damping, and stiffness — "the instability is quite robust, with little success found in disrupting the vortices"

Source: PV Magazine USA (2016); AES Racking Specification Sheets (2025); NX Horizon datasheet

#### 2.4.2 Array Technologies DuraTrack

- **Wind survival:** "Some of the harshest conditions on the planet"; DNV-validated passive stow system
- **Passive stow mechanism:** Mechanical (not electronic) — activated by aerodynamic torque force itself; no sensors or electricity required for engagement
- **Stow threshold example:** First row auto-stows at ~68 mph gust; re-stows at 80 mph; full array stow behavior varies by row position
- **Energy loss comparison:** Passive stow = 0.05% average annual energy loss vs. 2.8% for active stow strategies
- **Critical distinction from NEXTracker:** Passive stow means stow CAN occur without power or communication; safer during hurricane grid disruption scenarios

Source: Array Technologies DuraTrack product page; Array Technologies passive stow whitepaper; Ampacity/Nextracker whitepaper on risk mitigation

#### 2.4.3 FTC Solar Pioneer+ High Wind (2025)

- **Design wind survival:** **150 mph (241 km/h) 3-second gust**
- **Design philosophy:** Wind direction-agnostic safety stow; reinforced torque tubes, drive posts, damper assemblies; optimized torsional natural frequency per third-party stability criteria
- **Target markets:** Coastal, hurricane-prone, high-altitude regions
- **Configurable:** Module string sizes for wind categories 105–150 mph

Source: Solar Power World (August 2025)

#### 2.4.4 IEC 62817 Tracker Stow Speed Context

IEC 62817 example specifications show:
- Tracking ceases at 14 m/s (31 mph)
- Stow position maintained up to 40 m/s (89 mph, Category 1–2 hurricane level)

**The critical hurricane stow problem:** A stow-at-40 m/s design means:
1. Tracker is stowed before Category 1 conditions (74 mph sustained → ~85–95 mph gusts) ✓
2. But torsional galloping can occur at flat stow at 40–89 mph → tracker may fail **during the stow period** before the design storm arrives ✗
3. Power outage during storm may prevent active stow → passive stow systems are safer

#### 2.4.5 Stow Mode Vulnerability Matrix

| Scenario | Risk Level | Primary Failure Mode |
|----------|-----------|---------------------|
| Tracker pre-stowed (0°), power available, Category 1 approach | **MEDIUM** | Torsional galloping at 50–89 mph |
| Tracker pre-stowed (0°), power lost | **HIGH** | Galloping + no corrective action |
| Tracker stowed at 10–15°, power available | **LOW-MEDIUM** | Reduced galloping; higher static Cp |
| Tracker caught at 25–35° (mid-tilt, stow failed) | **VERY HIGH** | Maximum static uplift + dynamic amplification |
| Fixed-tilt at 25° | **HIGH** | Fastener fatigue + uplift at 110+ mph |
| Fixed-tilt at 25°, code-designed (ASCE 7-22, Exposure C) | **MEDIUM** | Survives to design wind; fails above |

---

### 2.5 Aerodynamic Research: University of Western Ontario and Others

**University of Western Ontario (UWO) / Western Engineering Wind Tunnel Research:**

The Boundary Layer Wind Tunnel Laboratory at UWO (now including the WindEEE Dome, the world's first full-scale 3D wind testing facility) has produced the most comprehensive aerodynamic database for ground-mounted solar panels:

- **Full-scale wind loading studies** at WindEEE Dome (Ahmed, Bitsuamlak, et al.): First full-scale (1:1) pressure tests on solar panels; confirmed that high-density pressure tap layouts capture aerodynamic features missed by low-density arrays; force balance tests yielded higher uplift forces than pressure integration due to dynamic effects
- **Scale model studies** (Aly & Bitsuamlak, 2013; Shademan & Naghib-Lahouti, 2020): Systematic boundary layer wind tunnel (BLWT) database for 25° and 40° panels at different heights; quantified scale model effects; validated LES computational models
- **Key findings:**
  - Smaller panels (lower to boundary layer) experience higher peak pressures per unit area
  - Mean pressure loads not significantly affected by turbulence intensity; peak pressures are
  - Uplift force from force-balance tests > uplift from pressure taps (dynamic effects)
  - Net pressure coefficient Cp,net for windward edge of 25° panel ≈ −2.5 to −3.0 (wind from low edge); center panel ≈ −1.2 to −1.5

**CPP Wind Engineering (Rohr, Bourke & Banks, 2015):**
- Comprehensive CFD and wind tunnel investigation of torsional galloping in single-axis trackers
- Critical finding: Instability occurs when tracker is "initially positioned roughly parallel to the ground" (±10° of flat)
- Critical velocity threshold: Most trackers stowed flat can expect torsional galloping at **wind speeds below 40 m/s (89 mph)** when not sheltered
- 40 m/s should be treated as a **3-second gust** threshold (not mean wind)
- Instability features hysteresis: once initiated above Ucr, must drop "considerably below Ucr" before stabilizing
- Simple fix: stow at non-zero angle (10–15°); introduces higher static loads but eliminates galloping risk
- Acknowledged by NEXTracker (who funded the research) as the basis for their variable-row stow strategy

**NREL (2024) — PVade Development:**
- NREL developing open-source PV Aerodynamic Design Engineering (PVade) fluid-structure interaction software
- Addresses dynamic instability mechanisms for solar trackers under hurricane conditions
- Identifies terrain buffeting, upstream wake effects, vortex shedding as compounding failure mechanisms

---

### 2.6 Existing Damage Curves / Functions

| Source | Subsystem | Functional Form | Parameters | Basis |
|--------|-----------|-----------------|------------|-------|
| Ceferino et al. (2021/2023) | Ground-mounted solar panel | Lognormal | **w̄ = 58 m/s (130 mph), β = 0.30** | Empirical (Irma, Maria, Dorian) |
| Ceferino et al. (2023) — ASCE NHR | Solar panel hurricane risk | Probabilistic (lognormal + cloud) | Not published numerically | Empirical + stochastic |
| PNNL Fragility Functions (2022) | Solar panel (wind) | Lognormal fragility | w̄ = 58 m/s, β = 0.30 (citing Ceferino) | Proxy — empirical |
| FM Global DS 7-106 | Ground-mount solar (wind) | Design threshold (binary, not sigmoid) | Avoid design speed ≥ 120 mph; separation dist. at ≥ 100 mph | Engineering standard |
| IEC 61215:2021 | PV module mechanical | Binary (pass/fail at test load) | 2,400 Pa min (≈80–93 mph) | Laboratory standard |
| HAZUS Hurricane Module | Buildings (proxy for solar) | Lognormal fragility by occupancy class | Multiple parameters by structure type | Expert judgment / empirical |
| DOE/FEMP OSTI-2570301 | GSA solar arrays (4 sites) | Qualitative/case study | Site failure ≈ 104 mph (below 145 mph design) | Empirical (2 sites, n=1 each) |

**Assessment:** The Ceferino et al. lognormal fragility (w̄ = 130 mph, β = 0.30) is the **strongest available empirical basis** for ground-mounted solar, but is derived from Caribbean installations (potentially lower installation quality than mainland US utility-scale). The FPL Hurricane Ian data point (0.3% damage, 150 mph gusts, code-compliant arrays) suggests higher-quality US utility solar has a higher median failure threshold, possibly w̄ = 150–160 mph.

---

### 2.7 Translating to Logistic Sigmoid Parameters

The InfraSure functional form is:
```
f(x) = L / (1 + exp(-k × (x - x0)))
```

**Converting from lognormal to logistic:**  
For a lognormal fragility with median `w̄` and dispersion `β`:
- x0 = w̄ (median → midpoint)
- k ≈ 1 / (β × w̄) × 4 (calibration to match lognormal shape)
- More precisely, k is fit so that f(x0 ± 1.28σ_log) = L × {0.10, 0.90}

**For w̄ = 130 mph, β = 0.30 (lognormal) → logistic approximation:**
- 10th percentile damage: x = 130 × exp(−1.28 × 0.30) = 130 × 0.68 = 88 mph
- 90th percentile damage: x = 130 × exp(+1.28 × 0.30) = 130 × 1.47 = 191 mph
- Spread = 191 − 88 = 103 mph over 10–90% range
- For logistic: k = ln(9) / ((x_90 − x_10)/2) = 2.197 / 51.5 ≈ **0.043**

---

### 2.8 Recommended Curve Parameters — PV_ARRAY

**Component cost allocation within PV_ARRAY subsystem:**
- PV_MODULE = ~95% of PV_ARRAY repair cost (frame + glass + cell + EVA)
- Balance (junction box, connectors, bypass diodes) = ~5%
- Therefore subsystem damage ≈ module damage

#### Curve 1: `hurricane/pv_array_tracker_stow` — Tracker in Active Hurricane Stow (0°)

**Scenario:** Tracker successfully stowed to 0° flat position prior to hurricane arrival; stow holds throughout storm.

**Key physics:**
- Reduced static Cp (near-zero for flat panel)
- **BUT:** Torsional galloping risk at 50–89 mph → potential failure before peak winds
- Risk depends heavily on design — passive stow (Array DuraTrack) mitigates galloping; active stow (controller-dependent) does not if power lost

**Evidence basis:**
- FPL Hurricane Ian (2022): 0.3% damage at ≤150 mph gusts (tracker stow confirmed operational)
- Trackers with code-compliant stow protocols survive Cat 2–3; begin failing in Cat 3–4 range
- Ceferino et al. (Caribbean, lesser-quality install): w̄ = 130 mph
- FPL/US utility standard (better install): damage onset ~110 mph; 50% ~150 mph; saturation ~180 mph

**Parameters:**
| Parameter | Value | Justification |
|-----------|-------|---------------|
| **L** | 0.85 | Maximum physical damage; some modules survive on non-hit rows; cable/BOS also damaged |
| **k** | 0.055 | Moderate steepness; certified trackers have narrow failure band |
| **x0** | 148 mph | Midpoint calibrated to US utility standard (~FPL performance); conservative vs. 130 mph Caribbean |
| **Confidence** | **MEDIUM** | Limited empirical data; FPL is n=1 utility; Ceferino is Caribbean-biased |

**Derivation rating:** Proxy-adapted (empirical + engineering standard)

**Damage thresholds:**
- 10% damage (onset): ~105 mph (Category 2 gust level)
- 50% damage: ~148 mph (Category 4 sustained)
- 90% damage: ~191 mph (Category 5 extreme)

---

#### Curve 2: `hurricane/pv_array_tracker_midtilt` — Tracker Caught Mid-Tilt or Stow Failure

**Scenario:** Tracker stow commanded but fails mechanically (motor failure, power loss, communications failure); tracker caught at 20–35° tilt during peak winds. OR: torsional galloping destroys tracker before peak arrival.

**Evidence basis:**
- NEXTracker whitepaper: "catastrophic in-field failure at wind speed of 80 km/h (50 mph) or even 65 km/h (40 mph)" for torsionally unstable tracker designs
- CPP Wind: most trackers flat stow become unstable below 40 m/s (89 mph)
- GSA/FEMP St. Croix: 25° fixed tilt, 104 mph → total loss
- FM Global: "excessive vibration, twisting, unbalanced loading" in trackers at high tilt

**Parameters:**
| Parameter | Value | Justification |
|-----------|-------|---------------|
| **L** | 0.95 | Near-total loss in severe hurricane; structure + modules destroyed |
| **k** | 0.065 | Steeper curve — vulnerability concentrated in 80–140 mph range |
| **x0** | 115 mph | Midpoint calibrated to St. Croix case + CPP Wind research; onset at ~80 mph |
| **Confidence** | **MEDIUM-LOW** | Limited n; St. Croix is a single poorly-designed system |

**Derivation rating:** Empirical (n=2 case studies) + engineering-judgment extrapolation

**Damage thresholds:**
- 10% damage (onset): ~79 mph (strong Cat 1 gust)
- 50% damage: ~115 mph (Cat 3 gust level)
- 90% damage: ~151 mph (Cat 4 sustained)

---

#### Curve 3: `hurricane/pv_array_fixed_tilt` — Fixed-Tilt Ground Mount at 20–25°

**Scenario:** Standard fixed-tilt array, properly installed to ASCE 7-16/22 requirements for local design wind speed. Tilt angle 20–25°.

**Evidence basis:**
- IEC 61215 minimum: 2,400 Pa → equivalent gust onset damage at ~80–93 mph (structural)
- IEC 61215 enhanced: 5,400 Pa → ~121–130 mph
- ASCE 7-22 design speeds for Florida coast: 160–185 mph (Risk Cat II); well-designed arrays survive
- GSA/FEMP cases: poor-quality fixed-tilt fails at ~104 mph; well-designed fails near/above design speed
- Caribbean empirical Ceferino median: 130 mph (mixed quality install)

**Parameters:**
| Parameter | Value | Justification |
|-----------|-------|---------------|
| **L** | 0.90 | High damage potential; frame + module destruction; some resilient |
| **k** | 0.048 | Moderate steepness; wider range of quality in fixed-tilt market |
| **x0** | 130 mph | Calibrated to Ceferino empirical median; reasonable for mixed install quality |
| **Confidence** | **MEDIUM** | Ceferino provides empirical anchor; quality-diversity creates wide uncertainty band |

**Derivation rating:** Empirical (Ceferino et al. 2023) + engineering-standard calibration

**Damage thresholds:**
- 10% damage (onset): ~92 mph (Category 2 gust)
- 50% damage: ~130 mph (Category 3 strong gust / Cat 4 lower end)
- 90% damage: ~168 mph (Category 4–5 gust)

---

#### Curve 4: `hurricane/pv_array_generic` — Weighted Average

A composite curve combining tracker-stow (50% of US utility solar fleet is tracked) and fixed-tilt (50%) with implicit allowance for stow failure rate (~10%):

```
DR_generic = 0.50 × [0.90 × DR_tracker_stow + 0.10 × DR_tracker_midtilt] + 0.50 × DR_fixed_tilt
```

**Parameters:**
| Parameter | Value | Justification |
|-----------|-------|---------------|
| **L** | 0.85 | Blended maximum; some resilience expected in modern arrays |
| **k** | 0.050 | Blended steepness |
| **x0** | 135 mph | Weighted midpoint; slightly higher than fixed-tilt alone |
| **Confidence** | **MEDIUM** | Aggregate; hides important technology differences |

**Derivation rating:** Proxy-adapted composite

---

## 3. MOUNTING × HURRICANE

**Curve IDs:** `hurricane/mounting_tracker`, `hurricane/mounting_fixed`  
**Capex weight:** MOUNTING = 0.08–0.12 of total solar facility cost  
**Components:** TRACKER (single-axis or dual-axis drive system, torque tube, purlin, motor, controller), FIXED_MOUNT (post, beam, racking frame, foundation)

---

### 3.1 Physics of Damage

The MOUNTING subsystem includes all structural elements that are **not** the PV module itself: posts/piles, foundations, racking beams, torque tubes, purlins, drive assemblies, and motor systems. Its failure modes are structurally distinct from module failure:

#### 3.1.1 Foundation / Pile Failure

Solar tracker piles are typically driven steel piles (W-sections, I-beams, or pipe piles) with 1.5–3.0 m embedment depth. Failure modes:

**A. Lateral overturning — governing failure mode for most trackers:**
- Wind moment arm from panel center to ground = 1.5–3 m (depends on hub height)
- Wind creates horizontal force (drag) + vertical uplift force → moment at pile head
- Soil lateral resistance (horizontal subgrade modulus) resists moment via passive earth pressure
- Critical formula: `M_demand = F_wind × h_arm` vs. `M_resist = kh × (embedment²/2)`
- Sandy coastal soils (Florida, Texas coastal) have low lateral modulus → greater pile deflection and earlier failure
- Saturated soils (hurricane rainfall + storm surge) reduce effective stress → 30–50% reduction in lateral capacity

**B. Vertical pullout:**
- Uplift force from panel uplift transfers to pile as tensile axial load
- Shaft friction capacity = π × d × L_embed × f_s (skin friction)
- Cohesionless soils: f_s = K × σ'_v × tan(δ) — sensitive to water saturation
- Cohesive soils (clay): f_s = α × Su — less sensitive to saturation

**C. Soil-pile interaction under hurricane conditions:**
- Hurricane rainfall softens upper soil layers; storm surge saturates coastal sites
- Tropical Florida soils: predominantly fine sand with low fines content → high permeability but low lateral stiffness
- Expansive clay soils: swell on wetting (Florida Panhandle, Texas) → pile uplift from soil swelling, not wind
- Climate-change consideration: repeated storm surge cycling (pathway 3 per ANZGeo2023) progressively erodes pile-soil contact, reducing holding strength over asset life

**Typical pile specifications for solar farms:**
- Diameter/section: 0.3–0.8 m (pipe) or equivalent W-section
- Embedment depth: 1.5–3.0 m (site-specific; sandy coastal = deeper)
- Pile spacing: 5–7 m along tracker row (30+ chord lengths)
- Solar pile design is generally driven by lateral resistance, not vertical load

#### 3.1.2 Torque Tube Buckling

The torque tube is the continuous horizontal steel member running the length of each tracker row (typically 30–100+ m), supported at driven piles every 5–7 m. It rotates to track the sun and transmits wind-induced torque to the drive system.

**Failure modes:**
- **Torsional buckling:** When torque exceeds pipe wall capacity; leads to permanent plastic deformation
- **Lateral-torsional buckling:** Combined bending + torsion at midspan between piles
- **Resonance failure:** If torque tube natural frequency aligns with vortex shedding frequency
  - CPP Wind research: SATs have torsional natural frequency near 1 Hz; galloping excitation at wind speeds of ~50–90 mph can drive resonance

**Geometry factor:** Longer span → lower torsional natural frequency → lower critical galloping speed. Shorter span (cross-braced designs) → higher critical speed. CPP Wind: "shorter trackers tend to be more resilient against torsional vibration instabilities."

#### 3.1.3 Motor and Drive System Failure

- Motor housing typically rated IP54 (splash-proof) to IP65 (dust-tight, water jets)
- Hurricane conditions: horizontal rain + debris → motor housing breach
- Motor failure during storm → tracker cannot respond to dynamic loading → higher torque on tube
- Motors at coastal sites corrode faster; salt spray accelerates insulation failure

#### 3.1.4 Fixed-Mount Structural Failure

Fixed-tilt mounting failure follows conventional structural steel/aluminum failure modes:
- **Post pullout/buckling:** Driven post (same as tracker) or concrete ballast foundation uplift
- **Racking beam failure:** Light-gauge C-channels under combined bending/torsion; tubular sections more resistant
- **Purlin-to-frame connection:** Bolted connections with inadequate torque or corroded hardware

**Key FEMP/GSA finding:** Light-gauge (14–16 ga) cold-rolled steel "C" or hat channels are NOT durable enough to survive severe weather without extreme bending and twisting. Closed-form (tubular) frame elements with low drag coefficients are superior.

---

### 3.2 Engineering Standards and Thresholds

#### 3.2.1 ASCE 7-22 Foundation Design for Hurricane Zones

- **Risk Category II, Exposure C:** Basic wind speed 150–200 mph in Florida coastal
- **Section 29.4.5.2 + geotechnical analysis:** Foundation must resist net uplift force `Fn` + moment `Mc`
- **Importance factor for connections:** FM Global recommends 1.15 (above standard 1.0)
- **Safety factor for connections (FM DS 7-106):** 2.0 minimum (vs. 1.6 standard)

#### 3.2.2 Soil-Dependent Design

| Soil Type | Lateral Capacity | Uplift Capacity | Hurricane Vulnerability |
|-----------|-----------------|-----------------|------------------------|
| Dense sand (dry) | High | High | Moderate |
| Loose/fine sand (coastal FL) | Low | Moderate | High |
| Saturated sand (storm surge) | Very Low | Low | Very High |
| Stiff clay | Moderate | High | Moderate |
| Expansive clay (wet) | Moderate (reduces) | Low (uplift risk) | High (swelling) |
| Limestone/rock | Very High | Very High | Very Low |

---

### 3.3 Post-Event Damage Patterns

**Florida (post-Ian, IAN path):** Modern tracker arrays largely intact despite 150 mph gusts in areas west of Ian's center. Older systems and systems not in stow failed at lower wind speeds.

**Texas (Hurricane Harvey 2017):** NERC report notes no damage to solar generation per ERCOT; limited utility solar in direct path at that time.

**Puerto Rico (Hurricane Maria 2017):** GSA St. Croix ground array — total loss included foundation/racking as well as modules. Racking described as "light-gauge unbraced beams" that twisted under wind torque, detaching from foundations before module failure.

**Key insight:** Mounting system and PV module often fail together in cascade — mounting failure triggers module release; module liftoff increases moment arm on remaining mounting, accelerating failure. They should be modeled as coupled, but for damage cost accounting, module replacement usually dominates (3–4× mounting replacement cost).

---

### 3.4 Recommended Curve Parameters — MOUNTING

**Important note:** MOUNTING damage ratios represent the structural mounting system only (posts, beams, racking, motors, foundations) — NOT including PV modules. Because mounting structures are more robust than panels in some failure modes but critically exposed in others (torsional galloping hits torque tube first), the curves differ from PV_ARRAY curves.

#### Curve 5: `hurricane/mounting_tracker` — Single-Axis Tracker Mounting System

**Evidence basis:**
- IEC 62817: Stow wind speed 40 m/s (89 mph); most trackers vulnerable to galloping below that
- CPP Wind: Failure below 40 m/s for flat-stow trackers; onset of structural concerns at 50 mph+
- FM Global DS 7-106: Aeroelastic and dynamic loading documented as primary failure mechanism
- Post-hurricane pattern: torque tube twist at pile heads → pile pullout at compromised soil → row collapse

**Parameters:**
| Parameter | Value | Justification |
|-----------|-------|---------------|
| **L** | 0.75 | Tracker mounting can suffer total loss on some rows but other rows survive; foundation rarely 100% failed |
| **k** | 0.058 | Steeper than PV_ARRAY — mounting failure concentrated in 80–130 mph band |
| **x0** | 120 mph | Lower than module midpoint (mounting fails first in cascades); onset at ~82 mph |
| **Confidence** | **LOW-MEDIUM** | No dedicated empirical tracker-structure fragility curve; expert judgment + physical reasoning |

**Derivation rating:** Engineering-standard-based + expert judgment

**Damage thresholds:**
- 10% damage (onset): ~82 mph (Category 2 sustained / Category 1 gust)
- 50% damage: ~120 mph (Category 3 sustained / midrange)
- 90% damage: ~158 mph (Category 4–5 range)

#### Curve 6: `hurricane/mounting_fixed` — Fixed-Tilt Mounting System

**Evidence basis:**
- Fixed-tilt racking is static; no galloping risk; damage mechanism is pure static overload
- FEMP/GSA: Light-gauge C-channel fails via twist at gust levels above 100 mph; tubular fails at higher
- ASCE 7-22 design-compliant fixed mount should survive to design wind speed (140–200 mph in FL)

**Parameters:**
| Parameter | Value | Justification |
|-----------|-------|---------------|
| **L** | 0.70 | Foundation usually survives even if racking fails; some structural elements reusable |
| **k** | 0.042 | Wider spread — quality range is large; some fail at 90 mph, others survive 180 mph |
| **x0** | 140 mph | Midpoint calibrated to "well-built to code" fixed-tilt; lower than design speed acknowledges real-world installation gaps |
| **Confidence** | **LOW** | No dedicated empirical fragility for fixed-mount structures; proxy from building envelope + GSA case |

**Derivation rating:** Proxy-adapted (engineering standard + building fragility analogy)

---

## 4. SUBSTATION × HURRICANE

**Curve ID:** `hurricane/substation_solar`  
**Capex weight:** SUBSTATION = 0.05–0.10 of total solar facility cost  
**Components:** TRANSFORMER_MAIN, TRANSFORMER_AUX, SWITCHGEAR  
**Note:** Solar substation (HV/MV transformer, 33–138 kV; medium voltage switchgear; protection relays; SCADA) differs from large power transformers in utility grid (which are 100–500 kV, 100–1,000+ MVA).

---

### 4.1 Physics of Damage

#### 4.1.1 Compound Hazard Profile

Solar substations face THREE simultaneous hurricane threats, which are distinct from strong wind alone:

1. **Wind mechanical damage** — direct physical force on structures/equipment
2. **Flooding / storm surge** — inundation of control equipment, battery systems, oil-filled transformers
3. **Wind-driven rain + debris projectiles** — penetration of enclosures, bushing damage

#### 4.1.2 Transformer Failure Mechanisms

Solar farm transformers (MV/HV step-up, typically 0.5–20 MVA, 34.5–138 kV) are vulnerable to:

**A. Wind + debris on bushings:**
- Transformer bushings (porcelain or polymer) are the primary external vulnerability
- Bushings protrude from transformer tank; present cross-section to debris
- Bushing failure = dielectric oil path to atmosphere = fire + total transformer loss
- Design standard: IEEE C57.12.00 (distribution) / C57.12.10 (power transformers) — structural wind loading not primary focus
- Large power transformer analysis (DOE, 2024): "Direct transformer damage from wind is not a common occurrence, although there is evidence from Canada and Cyprus showing that a strong storm could cause wind damage to a high-voltage grid"

**B. Flooding + inundation:**
- Oil-filled transformer flooding: water intrusion through gaskets, conduit entries
- Control cabinets: typically NEMA 3R (rain-resistant) at minimum; NEMA 4X preferred for coastal
- Battery systems and relay panels: electronic components destroyed at 1–2 inches of water
- **GSA/FEMP finding:** Underground conduit to inverter/switchgear room floods via gravity; total loss of electrical BoS even when transformers survive

**C. Foundation displacement:**
- Pad-mount transformers: flood buoyancy can shift transformer off anchor bolts
- DOE LPT Resilience Report (2024): "Buoyancy of water can cause transformers to shift or move from their original positions, leading to mechanical damage; debris carried by floodwaters causes additional damage"
- Solar farm substations: typically on concrete pads 0.3–1.0 m above grade; insufficient for 10–15 ft storm surge

**D. Grid destabilization effects:**
- Even undamaged substation equipment may trip offline via protective relay response to:
  - Voltage sags from widespread grid damage
  - Phase imbalance from transmission line failures
  - Overvoltage from loss of reactive compensation
- NERC Harvey report: "Water damage to protective relays, batteries, controls; station service AC power loss led to DC battery depletion, impacting relaying/SCADA"

#### 4.1.3 Switchgear Failure Mechanisms

- Metal-clad switchgear (typical solar substation) in outdoor weatherproof housing: NEMA 3R
- Failure modes: water ingress → tracking paths → arc flash → switchgear destruction
- SF6 circuit breakers: generally more robust to water than air-blast; sealed under positive pressure
- Vacuum CBs at MV: sealed vacuum interrupter bottles survive physical damage; control circuitry does not

---

### 4.2 Engineering Standards and Thresholds

#### 4.2.1 IEEE Standards

- **IEEE C57.12.00-2021:** General requirements for liquid-immersed distribution, power, and regulating transformers — mechanical sealing requirements
- **IEEE C57.12.10-2017:** Requirements for transformers 501 kVA–10,000 kVA — structural requirements
- **IEEE C57.91-2011:** Loading guide — temperature limits, not wind/flood specific
- **IEEE Std 693-2018:** Recommended practice for seismic design; establishes structural qualification testing methodology that is sometimes analogized to wind loading qualification

**Gap:** No specific IEEE standard for hurricane wind loading on transformers. Standards define leak-testing and mechanical integrity but not wind survival envelopes.

#### 4.2.2 NERC Reliability Standards

- **NERC TPL-007-1:** Transmission system planned performance for geomagnetic disturbances
- **NERC FAC-002-2:** Facilities design, connections, and maintenance — general standards
- **No dedicated NERC hurricane hardening standard** exists as of 2026; hurricane preparedness falls under utility practice rather than mandatory NERC standard

**NERC post-event reports (operational data):**

| Hurricane | Substations Affected | Primary Damage Mode |
|-----------|--------------------|--------------------|
| Irma (2017) | 12 BES substations fully/partially | Flooding + transmission line inputs lost |
| Harvey (2017) | >90 substations | Flooding (dominant); wind at >130 mph caused structural damage |
| Sandy (2012) | Multiple | Salt water inundation; direct transformer immersion |
| Maria (2017) | Systemwide PREPA collapse | Wind damage to distribution + transmission; grid reference loss |

**From NERC Hurricane Harvey EAR (2018):**
- "Wind damage to cooling tower housings and fans"
- "Flooding of substations"
- "Damage to substation equipment from wind-blown debris"
- "Water damage to protective relays, batteries, controls"
- 3 × 345/138 kV autotransformers affected; 1 failed (returned to service March 2018 — 6 month lead time)

---

### 4.3 HAZUS Substation Fragility Reference

The HAZUS Hurricane Model (FEMA) contains fragility functions for substations by terrain and wind speed. From Watson & Etemadi (2020, IEEE Trans. Power Systems) as cited in PNNL Fragility Functions Resource Report:

**Functional form (HAZUS-derived, wind version):**
```
P(D ≥ d_j | w_i) = Φ( (ln(w_i) - μ_{j,k}) / σ_{j,k} )
```
Where:
- `w_i` = wind speed (mph)
- `d_j` = damage state (slight, moderate, extensive, complete)
- `k` = terrain type (open/coastal vs. suburban/inland)
- `μ_{j,k}`, `σ_{j,k}` = lognormal parameters by damage state and terrain

**HAZUS substation damage states (hurricane wind, proxied from transmission/distribution infrastructure):**
- **Slight:** Control building roof damage, debris on equipment; 1–5% repair cost
- **Moderate:** Control cabinet water ingress, relay damage; switchgear enclosure breach; 10–30% repair cost
- **Extensive:** Transformer bushing damage, switchgear destruction; 30–60% repair cost  
- **Complete:** Transformer loss, foundation displacement, total replacement; 60–100% repair cost

**Approximate HAZUS wind speed thresholds for substations (transmission-level, open terrain):**
- Slight onset: ~80–90 mph gust
- Moderate onset: ~100–115 mph gust
- Extensive onset: ~120–140 mph gust
- Complete: ~150–180 mph gust

**Important caveat:** HAZUS fragility curves for substations were developed primarily for seismic events; hurricane wind versions are adapted from building/infrastructure analogy, not direct substation wind testing. The PNNL report notes the graphical curves are derived from HAZUS-MH tables, not empirical wind data.

---

### 4.4 Recommended Curve Parameters — SUBSTATION

Solar farm substations (34.5–138 kV step-up) are smaller and differently exposed than large power grid substations. Key differences:
- Typically less structural hardening investment vs. utility transmission substations
- Located within solar farm perimeter (often in areas designed for Exposure C, open terrain)
- Often pad-mount transformer near flood-exposed ground level
- Control building may be temporary or light construction

**Compound hazard adjustment:** The InfraSure curve captures wind-driven mechanical damage as the primary channel. Flooding is treated as a compounding factor that increases damage at a given wind speed (by ~15–25% in coastal zones within storm surge reach) but is captured qualitatively here, not as a separate input dimension. Full compound modeling requires a two-dimensional (wind + surge) surface.

#### Curve 7: `hurricane/substation_solar`

**Parameters:**
| Parameter | Value | Justification |
|-----------|-------|---------------|
| **L** | 0.80 | Not all substations completely destroyed; some components (transformer tank, switchgear cabinets) survive mechanically even if controls flood |
| **k** | 0.040 | Moderate-wide curve; wide range of flood exposure and construction quality |
| **x0** | 120 mph | Midpoint calibrated to HAZUS "extensive" onset (~120 mph) for open terrain substations + flooding compound effect at lower wind speeds than pure wind damage alone |
| **Confidence** | **LOW** | No dedicated solar substation empirical hurricane fragility; proxy from HAZUS transmission + expert judgment |

**Derivation rating:** Proxy-adapted (HAZUS lognormal → logistic; engineering standard basis)

**Damage thresholds:**
- 10% damage (onset): ~78 mph (gust; control equipment / relay damage from wind-driven rain)
- 50% damage: ~120 mph (transformer bushing risk + flooding of controls)
- 90% damage: ~162 mph (transformer tank displacement, total electrical destruction)

**Note on coastal vs. inland:**
- Coastal (within storm surge zone): Shift x0 DOWN by 10–15 mph (flooding dominates at lower winds)
- Inland (>20 miles from coast): Shift x0 UP by 10 mph (wind-only mechanism; flooding less likely)

---

## 5. Recommended Curve Parameters Summary

All curves use: `f(x) = L / (1 + exp(-k × (x - x0)))` where x = 3-second peak gust (mph)

| Curve ID | Component | L | k | x0 (mph) | 10% dmg (mph) | 50% dmg (mph) | 90% dmg (mph) | Confidence | Derivation |
|----------|-----------|---|---|----------|--------------|--------------|--------------|------------|------------|
| `hurricane/pv_array_tracker_stow` | PV modules, tracker in stow | 0.85 | 0.055 | 148 | ~105 | ~148 | ~191 | MEDIUM | Empirical + proxy |
| `hurricane/pv_array_tracker_midtilt` | PV modules, stow failed | 0.95 | 0.065 | 115 | ~79 | ~115 | ~151 | MEDIUM-LOW | Empirical (n=2) + engineering |
| `hurricane/pv_array_fixed_tilt` | PV modules, fixed 20–25° | 0.90 | 0.048 | 130 | ~92 | ~130 | ~168 | MEDIUM | Empirical (Ceferino) |
| `hurricane/pv_array_generic` | PV modules, fleet average | 0.85 | 0.050 | 135 | ~95 | ~135 | ~175 | MEDIUM | Composite/proxy |
| `hurricane/mounting_tracker` | SAT structural system | 0.75 | 0.058 | 120 | ~82 | ~120 | ~158 | LOW-MEDIUM | Engineering standard |
| `hurricane/mounting_fixed` | Fixed racking structure | 0.70 | 0.042 | 140 | ~96 | ~140 | ~184 | LOW | Proxy (building analogy) |
| `hurricane/substation_solar` | Transformer + switchgear | 0.80 | 0.040 | 120 | ~78 | ~120 | ~162 | LOW | Proxy (HAZUS + expert) |

### Visual Description of Curve Relationships

```
Damage Ratio (0–1)
1.0 |                                              ██████ (tracker_midtilt)
    |                                         █████
    |                                    █████
0.8 |                               █████        ████████████ (pv_generic)
    |                          █████         ████
    |                     ████          █████
0.6 |                ████          ████         ████████████ (substation)
    |           ████          ████         ████
    |      ████          ████         ████
0.4 |  ████          ████         ████
    |              ████
    |
0.2 |
    |
0.0 |______|________|________|________|________|________|_____
         60       90      120      150      180      210  mph
         
Onset order: midtilt (79) → substation (78) → tracker_stow (105) → fixed_tilt (92) → generic (95)
Steepest: tracker_midtilt (k=0.065) → most concentrated failure band
Shallowest: substation (k=0.040) → widest uncertainty spread
```

---

### Sensitivity Analysis

**Most sensitive parameters by curve:**

| Curve | Dominant Parameter | Uncertainty Source |
|-------|-------------------|-------------------|
| `tracker_stow` | x0 ± 15 mph | FPL 0.3% vs. Caribbean 130 mph disparity |
| `tracker_midtilt` | k ± 0.02 | Range from near-total (CPP Wind) to survivable (well-designed) |
| `fixed_tilt` | x0 ± 20 mph | Ceferino Caribbean vs. US utility code standards |
| `mounting_tracker` | L ± 0.15 | Unclear if post/foundation or tube fails first |
| `substation` | x0 ± 20 mph; compound flood adjustment | Flooding vs. wind contribution unclear |

---

## 6. Data Gaps & Recommendations

### 6.1 Critical Data Gaps

#### Gap 1 (HIGH PRIORITY): No systematic US utility-scale solar hurricane damage dataset
**Problem:** The only large-scale data point is FPL Hurricane Ian (0.3% of 15M panels). No peer-reviewed study has analyzed utility-scale solar damage systematically across multiple hurricanes with controlled exposure data.
**Recommendation:** NREL, EPRI, or Solar Energy Industries Association (SEIA) should establish a mandatory post-hurricane solar damage reporting protocol, similar to NERC's Event Analysis Report process.

#### Gap 2 (HIGH PRIORITY): Tracker stow failure rate under real hurricane conditions
**Problem:** Curves for `tracker_stow` assume successful stow. Real failure rates of stow systems (power loss, mechanical failure, communications failure) during hurricanes are unknown.
**Recommendation:** Collect power-outage timing data relative to peak wind arrival for major hurricane events; survey tracker operators on stow success rates by hurricane intensity.

#### Gap 3 (MEDIUM PRIORITY): Torsional galloping → module damage quantification
**Problem:** CPP Wind and others show galloping occurs at 50–89 mph. What fraction of galloping events cause structural destruction vs. temporary oscillation with reversible deflection?
**Recommendation:** Full-scale field monitoring of tracker oscillation during wind events above 50 mph; instrument tracker rows in hurricane-zone solar farms with accelerometers.

#### Gap 4 (MEDIUM PRIORITY): Solar substation empirical hurricane fragility
**Problem:** No empirical fragility curve exists specifically for solar farm substations under hurricane wind. HAZUS data is for transmission-level substations, not distribution/medium voltage.
**Recommendation:** Collect damage/restoration records from solar farm operators after each major hurricane; build a database separating wind vs. flood vs. debris damage.

#### Gap 5 (MEDIUM PRIORITY): Pile foundation performance under hurricane soil conditions
**Problem:** Foundation pullout data under saturated, hurricane-surge-affected soils is sparse. Climate-change-driven soil saturation increase has not been incorporated into solar pile design standards.
**Recommendation:** ASTM research program on dynamic lateral pile capacity under rapid loading (hurricane loading rates) in coastal sandy soils.

#### Gap 6 (LOW PRIORITY): Compound wind + flood damage surface
**Problem:** The current curves model wind only. In coastal zones, storm surge interacts with wind to create compound damage mechanisms. A 2D (wind speed, surge height) damage surface would be more accurate.
**Recommendation:** For coastal sites, develop surge depth-damage functions for solar substations and mounting systems separately; combine probabilistically.

#### Gap 7 (LOW PRIORITY): Wind-driven rain penetration model
**Problem:** Water ingress through cracked glass, unsealed junction boxes, and conduit penetrations under wind-driven rain causes electrical failures that persist post-storm. This is captured in L (maximum damage ratio) but not separately modeled.
**Recommendation:** Accelerated wind-driven rain testing protocols for solar BoS components.

### 6.2 Validation Steps to Improve Confidence

1. **Apply curves to post-Ian FPL data:** Back-calculate implied damage ratio from 0.3% panel damage with known wind field → validate x0 for `tracker_stow`
2. **Digitize Ceferino fragility:** Extract figure data from Ceferino et al. (2023) published paper to get full lognormal parameters beyond the PNNL summary (w̄ = 130 mph, β = 0.30)
3. **Monte Carlo sensitivity:** Run ±20% on x0 and ±30% on k; assess impact on expected annual damage estimates for Florida vs. Texas vs. Gulf Coast portfolios
4. **Expert elicitation:** Structured interviews with 5–10 solar EPC engineers who have deployed in FL, TX, PR after major hurricanes; target stow failure rates and non-code-designed system performance

---

## 7. Sources & References

All sources are cited inline above. Full bibliography organized by category:

### 7.1 Engineering Standards

1. **ASCE 7-22** — *Minimum Design Loads and Associated Criteria for Buildings and Other Structures.* American Society of Civil Engineers, 2022. Section 29.4.5 (ground-mount solar, new in ASCE 7-22), Section 29.4.3, 29.4.4. DOI: 10.1061/9780784415788. Available: https://ascelibrary.org/doi/pdf/10.1061/9780784415788.fm

2. **IEC 61215:2021** — *Terrestrial Photovoltaic (PV) Modules — Design Qualification and Type Approval.* International Electrotechnical Commission, 2021. Mechanical load test specifications (2,400 Pa minimum; 5,400 Pa enhanced). https://webstore.iec.ch/en/publication/61203

3. **IEC 62817:2014** — *Photovoltaic Systems — Design Qualification of Solar Trackers.* International Electrotechnical Commission, 2014. Wind stow requirements (40 m/s stow speed example), torsional stiffness limits. Preview: https://cdn.standards.iteh.ai/samples/20144/9e84f3fd5835497f9198f3e661107e41/IEC-62817-2014.pdf

4. **FM Global Data Sheet 7-106** — *Ground-Mounted Solar Photovoltaic Power.* FM Global Property Loss Prevention Data Sheets, 2012 (revised through 2024). Wind thresholds (100 mph small debris; 120 mph large debris), tracker design requirements, safety factor 2.0. https://www.fm.com/-/media/project/publicwebsites/fmglobal/documentum-new/data-sheet-individual/07-hazards/fmds07106.pdf

5. **FM Global Data Sheet 1-15** — *Roof-Mounted Solar Photovoltaic Panels.* FM Global, 2014 (Interim Revision January 2024). FM Approval Standard 4478 reference; wind design for rooftop PV. https://fireprotectionsupport.nl/wp-content/uploads/2024/03/FMDS0115-2024-01.pdf

6. **FM Approval Standard 4478** — *Approval Standard for Roof-Mounted Rigid Photovoltaic Module Systems.* FM Approvals, current edition. Referenced in DS 1-15 and DS 7-106. https://www.kingspan.com/gb/en/knowledge-articles/a-guide-to-the-fm4478-approval-standard/

7. **SEAOC PV2-2017** — *Wind Design for Low-Profile Solar Photovoltaic Arrays on Flat Roofs.* Structural Engineers Association of California, Solar Photovoltaic Systems Subcommittee, 2017. Dynamic loading, resonance analysis, vortex shedding guidance. https://seaoc.org/content.aspx?page_id=586&club_id=32108&item_id=18912

8. **ASCE 49-21** — *Wind Tunnel Testing for Buildings and Other Structures.* American Society of Civil Engineers, 2021. BLWT requirements for solar PV wind load determination. Referenced in FM DS 7-106.

9. **IEEE C57.12.00-2021** — *IEEE Standard for General Requirements for Liquid-Immersed Distribution, Power, and Regulating Transformers.* IEEE, 2021. https://ieeexplore.ieee.org/document/9424879

10. **DSA IR 16-8 (California 2025 CBC)** — *Solar Photovoltaic and Thermal Systems Review and Acceptance.* California Division of the State Architect, 2025. Incorporates ASCE 7, SEAOC PV2. https://www.dgs.ca.gov/-/media/Divisions/DSA/Publications/interpretations_of_regs/IR_16-8_2025-CBC.pdf

### 7.2 Post-Hurricane Event Reports and Empirical Data

11. **NERC** — *Hurricane Irma Event Analysis Report.* North American Electric Reliability Corporation, 2017 (published 2018). 12 BES substations affected; specific wind speeds; no solar damage noted. https://www.nerc.com/globalassets/our-work/reports/event-reports/september-2017-hurricane-irma-event-analysis-report.pdf

12. **NERC** — *Hurricane Harvey Event Analysis Report.* North American Electric Reliability Corporation, 2018. >90 substations damaged; 3 × 345/138 kV transformers affected; no solar generation damage. https://www.nerc.com/globalassets/our-work/reports/event-reports/nerc_hurricane_harvey_ear_20180309.pdf

13. **NERC** — *Hurricane Sandy Event Analysis Report.* North American Electric Reliability Corporation, 2014. Substation flooding; no solar generation damage reported. https://www.nerc.com/globalassets/our-work/reports/event-reports/hurricane_sandy_ear_20140312_final.pdf

14. **NERC** — *2025 State of Reliability Technical Assessment.* North American Electric Reliability Corporation, 2025. Includes Hurricanes Helene and Milton (2024) performance. https://www.nerc.com/globalassets/programs/rapa/pa/nerc_sor_2025_technical_assessment.pdf

15. **Pasch, R.J., Penny, A.B., and Berg, R.** — *Tropical Cyclone Report: Hurricane Maria (AL152017).* National Hurricane Center / NOAA, 2023 (updated). Landfall intensity 135 kt; 90 billion USD damage; 80% utility poles destroyed. https://www.nhc.noaa.gov/data/tcr/AL152017_Maria.pdf

16. **Prevatt, D.O. and Gurley, K.** — *Hurricane Michael Data Enhancement (Phase II): Performance of Buildings and Infrastructure.* University of Florida for Florida Building Commission, June 2020. Cat 5 winds; design speed exceedance; damage patterns. http://www.floridabuilding.org/fbc/publications/Research_2019-2020/UF-Prevatt%20H-Michael2018-Data-Enhancement-Final-Report-v3.pdf

17. **Prevatt, D.O. et al.** — *Survey and Investigation of Buildings Damaged by Hurricane Ian (2022).* University of Florida / Auburn University for Florida Building Commission, Interim Report May 2023. 150 mph sustained; $113 billion loss. https://www.floridabuilding.org/fbc/commission/FBC_0523/Commission/Prevatt_Interim_Report_%20Survey_Hurricane_Ian-2.pdf

18. **WMNF / Politico** — *"Hurricanes Fiona and Ian gave solar power its time to shine."* Politico, October 17, 2022. FPL: 0.3% of ~15 million panels damaged in 38 farms during Hurricane Ian. https://www.politico.com/news/2022/10/17/solar-energy-passed-its-hurricane-test-now-come-the-lobbying-fights-00061964

### 7.3 Solar Hurricane Vulnerability Research

19. **Ceferino, L., Lin, N., and Xi, D.** — *"Bayesian Updating of Solar Panel Fragility Curves and Implications of Higher Panel Strength for Solar Generation Resilience."* Reliability Engineering & System Safety, Vol. 229, January 2023, 108896. Empirical fragility: ground-mount w̄ = 58 m/s (130 mph), β = 0.30; Caribbean data (Irma, Maria, Dorian). DOI: https://doi.org/10.1016/j.ress.2022.108896

20. **Ceferino, L., Lin, N., and Xi, D.** — *"Hurricane Risk of Solar Generation in the United States."* Natural Hazards Review, Vol. 24, No. 4, August 2023. Probabilistic framework; Florida/Louisiana 100-year cloud reduction (32%/65%); permanent damage 80% more acute than cloud. DOI: https://doi.org/10.1061/NHREFO.NHENG-1764

21. **Jacobs Engineering / DOE FEMP / GSA** — *Toward Solar Photovoltaic Storm Resilience: Learning from Hurricane Loss and Rebuilding Better.* U.S. Department of Energy, Office of Energy Efficiency & Renewable Energy, OSTI Technical Report No. 2570301, 2024. St. Croix case study; 104 mph failure on 145 mph-rated array; CFD analysis; SEAOC PV2 recommendations. https://www.osti.gov/servlets/purl/2570301

22. **NREL** — *Puerto Rico Grid and Recovery Post Hurricane Maria.* National Renewable Energy Laboratory, NREL/TP-6A20-82860, 2022. Grid collapse analysis; recovery timeline. https://docs.nrel.gov/docs/fy22osti/82860.pdf

23. **NREL** — *Simulating Impacts of Extreme Events on Grids with High Penetrations of Renewables.* NREL Technical Report NREL/TP-5D00-80639, 2022. Monte Carlo damage scenarios using fragility curves; substation fragility application. https://docs.nrel.gov/docs/fy22osti/80639.pdf

24. **PNNL** — *Fragility Functions Resource Report.* Pacific Northwest National Laboratory, PNNL-33587, 2022. Summarizes solar panel fragility (Ceferino); substation wind fragility (Watson & Etemadi, HAZUS); Figure 25: solar panel wind fragility curve. https://www.pnnl.gov/main/publications/external/technical_reports/PNNL-33587.pdf

25. **Watson, J.D. and Etemadi, A.** — *"Modeling Electrical Grid Resilience Under Hurricane Wind Conditions With Increased Solar and Wind Power Generation."* IEEE Transactions on Power Systems, Vol. 35, No. 2, 2020, pp. 929–937. HAZUS-derived substation fragility curves. DOI: https://doi.org/10.1109/TPWRS.2019.2942279

### 7.4 Aerodynamic and Structural Research

26. **Rohr, C., Bourke, P.A., and Banks, D.** — *"Torsional Instability of Single-Axis Solar Tracking Systems."* 14th International Conference on Wind Engineering, Porto Alegre, Brazil, June 2015. CPP Wind. Critical galloping velocity below 40 m/s; vortex lock-in mechanism; NEXTracker-sponsored. https://cppwind.com/wp-content/uploads/2014/01/Torsional-Instability-of-Single-Axis-Solar-Tracking-Systems-Rohr-Bourke-Banks-2015.pdf

27. **Aly, A.M. and Bitsuamlak, G.** — *"Aerodynamics of Ground-Mounted Solar Panels: Test Model Scale Effects."* Journal of Wind Engineering and Industrial Aerodynamics, Vol. 123, 2013, pp. 250–260. UWO BLWT data; 25° and 40° tilt panels; scale effects. DOI: https://doi.org/10.1016/j.jweia.2013.08.010

28. **University of Western Ontario (Ahmed et al.)** — *"Wind Loading on Full-Scale Solar Panels."* Western Engineering, Scholarship@Western Thesis, 2022. First full-scale (1:1) pressure and force balance tests at WindEEE Dome; dynamic effects exceed pressure-integrated uplift. https://ir.lib.uwo.ca/etd/3529/

29. **International Journal of Wind Engineering (multiple authors)** — *"Experimental Study on the Interference Effects of Torsional Aerodynamic Instability in Single-Axis Solar Tracker Array."* Journal of Wind Engineering and Industrial Aerodynamics, Vol. 242, September 2023. Six-row wind tunnel test; all rows gallop at |β| ≤ 10°; leeward rows affected at larger tilts. DOI: https://doi.org/10.1016/j.jweia.2023.105533

30. **NREL** — *Predicting Instability and the Effect of Wind Loading on Single-Axis Trackers.* NREL Technical Report NREL/TP-5000-89033, 2024. PVade FSI software; dynamic failure mechanisms; design recommendations. https://docs.nrel.gov/docs/fy24osti/89033.pdf

31. **Geleta, T.N. and Bitsuamlak, G.** — *"Aerodynamics of Ground-Mounted, Isolated and Array of Solar Panels."* ICWE15 Conference Paper, 2023. LES validation against UWO BLWT data; full-array pressure distribution. https://web.aimgroupinternational.com/2023/icwe/papers/ICWE2023_AbstractSubmission-414_2023-01-29%2000_38_37.pdf

32. **Zhang, D.** — *"Climate Change Challenges for the Geotechnical Design of Solar Farm Foundations."* ANZGeo Conference Proceedings, 2023. Pile embedment depths 1.5–3.0 m; saturated soil capacity reduction; storm surge cycling. https://www.insitutek.com/wp-content/uploads/2025/01/Climate-change-challenges-for-the-geotechnical-design-of-solar-farms-David-Zhang-ANZGeo2023.pdf

### 7.5 Manufacturer Technical Documents

33. **NEXTracker** — *NX Horizon Product Datasheet.* Configurable up to 240 km/h (150 mph) 3-second gust; UL 2703/3703; automated wind stow. https://info.nextpower.com/hubfs/nxp/nxp-datasheet-nx-horizon-final.pdf

34. **NEXTracker / Ampacity** — *Mitigating Extreme Weather Risk: Part 2.* Technical whitepaper, 2023. NX Navigator stow system; "catastrophic failure at 80 km/h" for unstable tracker designs; dynamic vs. static loading. https://www.ampacity.com/wp-content/uploads/2023/12/Nextracker_Whitepaper_RiskMitigation_Part2_FINAL.pdf

35. **Array Technologies** — *DuraTrack® Product Page and Passive Stow Technology.* Passive mechanical stow; no sensors/electricity required; first row stows at 68 mph; 0.05% annual energy loss. https://arraytechinc.com/array-passive-stow-technology/

36. **FTC Solar** — *"FTC Solar Debuts Solar Tracker Made for High-Wind Regions."* Solar Power World, August 14, 2025. Pioneer+ High Wind; 150 mph (241 km/h) design; wind direction-agnostic stow. https://www.solarpowerworldonline.com/2025/08/ftc-solar-debuts-solar-tracker-made-for-high-wind-regions/

37. **PV Magazine USA** — *"NEXTracker Wind Testing Stands Up to Hurricane Matthew."* October 26, 2016. NX Horizon 100–130 mph range; torsional limiter; in-field validation. https://pv-magazine-usa.com/2016/10/26/nextracker-wind-testing-stands-up-to-hurricane-matthew/

### 7.6 Government and Industry Reports

38. **U.S. Department of Energy** — *Large Power Transformer Resilience Report.* DOE Office of Electricity, July 2024. "Direct transformer damage from wind is not common"; flooding is primary transformer threat; bushing and mechanical damage documentation. https://www.energy.gov/sites/default/files/2024-10/EXEC-2022-001242%20-%20Large%20Power%20Transformer%20Resilience%20Report%20signed%20by%20Secretary%20Granholm%20on%207-10-24.pdf

39. **U.S. Department of Energy / FEMP** — *Severe Weather Resilience in Solar Photovoltaic System Design.* energy.gov, 2025. Design guidance; ASCE 7-22, SEAOC PV2-2017, RMI/CCI references; standard vs. highest-rated module uplift (2,400 Pa vs. ≥3,600 Pa). https://www.energy.gov/cmei/femp/severe-weather-resilience-solar-photovoltaic-system-design

40. **U.S. DOE Better Buildings Solution Center** — *"Solar Photovoltaic Systems in Hurricanes and Other Severe Weather."* FEMP technical brief. Post-storm inspection findings; module front/back rating table (5,400 Pa / back load pull). https://betterbuildingssolutioncenter.energy.gov/sites/default/files/pv_severe_weather.pdf

41. **Silfab Solar** — *"Solar PV and Extreme Weather."* Technical article, August 2022. IEC 61215 mechanical load test context; 2,400 Pa standard vs. 5,400 Pa enhanced; DML (IEC 62782) testing. https://silfabsolar.com/solar-pv-and-extreme-weather/

42. **Solar Permit Solutions** — *"Design Storm-Resistant Solar: ASCE 7-22 Wind Load Standards."* November 2025. ASCE 7-22 Sections 29.4.3, 29.4.4, 29.4.5 overview; γE and γA coefficient explanation. https://www.solarpermitsolutions.com/blog/asce-7-22-solar-wind-load-standards

43. **Synapsun** — *"Mechanical Loads on PV Modules."* July 2025. IEC 61215:2021 static and dynamic tests; 5,400 Pa / 2,400 Pa interpretation; wind speed equivalents. https://synapsun.com/en/blog-news-analyses/understanding-mechanical-loads-on-photovoltaic-modules

44. **Mayfield Renewables** — *"How ASCE 7-22 Updates Will Impact PV Racking Systems."* September 2024. ASCE 7-22 vs. 7-16 comparison; Chapter 29 ground-mount new provisions. https://www.mayfield.energy/technical-articles/asce-7-22-updates-pv-racking-systems/

45. **American Transformer Solutions** — *"Hurricane Impact on Industrial Transformers."* August 2024. Physical failure mechanisms; assessment and recovery protocol; mitigation strategies. https://americantransformersolutions.com/hurricane-impact-on-industrial-transformers/

---

## Appendix A: Logistic Curve Equations for Direct Implementation

```python
import numpy as np

def damage_ratio(v_mph, L, k, x0):
    """
    Hurricane × Solar damage curve.
    v_mph: 3-second peak gust wind speed in mph
    Returns: damage ratio (0.0 to L)
    """
    return L / (1 + np.exp(-k * (v_mph - x0)))

# Curve parameters
curves = {
    'hurricane/pv_array_tracker_stow':    {'L': 0.85, 'k': 0.055, 'x0': 148},
    'hurricane/pv_array_tracker_midtilt': {'L': 0.95, 'k': 0.065, 'x0': 115},
    'hurricane/pv_array_fixed_tilt':      {'L': 0.90, 'k': 0.048, 'x0': 130},
    'hurricane/pv_array_generic':         {'L': 0.85, 'k': 0.050, 'x0': 135},
    'hurricane/mounting_tracker':         {'L': 0.75, 'k': 0.058, 'x0': 120},
    'hurricane/mounting_fixed':           {'L': 0.70, 'k': 0.042, 'x0': 140},
    'hurricane/substation_solar':         {'L': 0.80, 'k': 0.040, 'x0': 120},
}

# Example: damage at Category thresholds (3-sec gusts)
# Category 1: ~90-100 mph gust; Category 2: ~100-115 mph; Category 3: ~115-135 mph
# Category 4: ~135-165 mph; Category 5: 165+ mph

v_points = [74, 90, 110, 130, 150, 170, 190]
for name, p in curves.items():
    print(f"\n{name}:")
    for v in v_points:
        dr = damage_ratio(v, **p)
        print(f"  {v:3d} mph → DR = {dr:.3f}")
```

---

## Appendix B: Hurricane Category vs. Gust Speed Reference

| Saffir-Simpson Category | 1-min Sustained (mph) | Typical 3-sec Gust (mph) | Representative Scenario |
|------------------------|----------------------|--------------------------|------------------------|
| Tropical Storm | 39–73 | 50–90 | Wind onset; minor fastener loosening |
| **Category 1** | 74–95 | 90–115 | Panel edge uplift onset; tracker galloping risk |
| **Category 2** | 96–110 | 110–130 | Significant panel failure begins (fixed-tilt, poor install) |
| **Category 3** | 111–129 | 130–155 | Major damage (fixed-tilt); tracker stow near 50% damage threshold |
| **Category 4** | 130–156 | 155–185 | Widespread panel + mounting damage; substation 50% damage threshold |
| **Category 5** | 157+ | 185+ | Near-total destruction of non-hardened arrays |

*Note: Gust factor (gust/sustained) ≈ 1.2–1.4 at open terrain; varies with storm size and surface roughness.*

---

*Document prepared for InfraSure damage curve library. All curve parameters represent expert judgment anchored to available empirical and engineering-standard evidence. Confidence ratings reflect data quality and source consistency. Recommend annual review as post-hurricane solar damage datasets grow.*
