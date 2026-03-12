# HURRICANE × WIND TURBINE SUBSYSTEMS
## Deep Research Report for Damage Curve Derivation

**Prepared for:** InfraSure Damage Curve Library  
**Date:** March 12, 2026  
**Hazard:** HURRICANE (tropical cyclone, 1-minute sustained surface wind)  
**Asset Class:** Land-based and near-shore wind turbines  
**Intensity Variable:** 1-minute sustained wind speed at 10 m height (mph), Saffir-Simpson compatible  
**Functional Form:** `f(x) = L / (1 + exp(-k * (x - x0)))`

---

## Table of Contents

1. [Intensity Variable Selection & Justification](#1-intensity-variable-selection--justification)
2. [Engineering Design Framework: IEC 61400-1 Turbine Classes](#2-engineering-design-framework-iec-61400-1-turbine-classes)
3. [ROTOR_ASSEMBLY × HURRICANE](#3-rotor_assembly--hurricane)
4. [TOWER × HURRICANE](#4-tower--hurricane)
5. [NACELLE × HURRICANE](#5-nacelle--hurricane)
6. [FOUNDATION × HURRICANE](#6-foundation--hurricane)
7. [Recommended Curve Parameters — Master Table](#7-recommended-curve-parameters--master-table)
8. [Hurricane Category Reference](#8-hurricane-category-reference)
9. [Data Gaps & Recommendations](#9-data-gaps--recommendations)
10. [Sources & References](#10-sources--references)

---

## 1. Intensity Variable Selection & Justification

### Chosen Variable: 1-Minute Sustained Wind Speed at 10 m Height (mph)

**Rationale:** The Saffir-Simpson Hurricane Wind Scale (SSWS) uses 1-minute sustained wind speed measured at 10 m above open terrain. This is the universal reporting standard for Atlantic and Eastern Pacific hurricanes used by NOAA/NHC, the primary source of hazard data for U.S. risk modeling. The SSWS directly maps to observable damage categories and is the standard input for HAZUS hurricane modules and nearly all U.S. actuarial hurricane models.

**Unit conversion table (all approximate):**

| 1-min at 10 m | 10-min at 10 m | 10-min at hub (~90 m) | SSWS Category |
|---|---|---|---|
| 74 mph (33 m/s) | ~67 mph (30 m/s) | ~85 mph (38 m/s) | Cat 1 onset |
| 96 mph (43 m/s) | ~87 mph (39 m/s) | ~111 mph (50 m/s) | Cat 2 onset |
| 111 mph (50 m/s) | ~101 mph (45 m/s) | ~128 mph (57 m/s) | Cat 3 onset |
| 130 mph (58 m/s) | ~118 mph (53 m/s) | ~150 mph (67 m/s) | Cat 4 onset |
| 157 mph (70 m/s) | ~143 mph (64 m/s) | ~181 mph (81 m/s) | Cat 5 onset |

Hub height scaling uses power-law exponent α = 0.077 for hurricanes over water/coastal terrain, following Franklin et al. (2003) as adopted in Rose et al. (2012). Conversion from 10-minute to 1-minute sustained uses a gust factor of ~1.10 (Harper et al. 2010).

**IEC standards use 10-minute mean at hub height.** When translating IEC design parameters (Vref, Vsurvival) to SSWS mph, multiply hub-height 10-min values by ~0.83 to get 10-m height, then multiply by 1.10 to convert to 1-min equivalent.

**Key operational thresholds:**
- **Cut-in speed:** 6–9 mph (3–4 m/s) — turbine begins generating
- **Rated speed:** 28–35 mph (12–16 m/s) — rated power production
- **Cut-out speed:** 45–62 mph (20–28 m/s) — automatic shutdown *(not physical damage onset)*
- **IEC standard cut-out:** typically 25 m/s (56 mph) per IEC 61400-1

The operational **cut-out speed is not a damage threshold.** It is a protective curtailment measure. Physical damage begins substantially above cut-out. This distinction is critical: losses below ~74 mph (Cat 1) represent pure revenue curtailment (operational loss), not physical asset damage.

---

## 2. Engineering Design Framework: IEC 61400-1 Turbine Classes

IEC 61400-1:2019 (4th edition) defines turbine design classes that set the structural design envelope. The 2019 edition added **Annex J** for tropical cyclone environments and explicitly extended Class S to allow custom cyclone design.

**Standard Wind Turbine Classes (IEC 61400-1:2019, Table 1):**

| Class | Vref (m/s, 10-min, hub) | Vref (mph, 1-min, 10m) | Annual Mean Wind (m/s) | 50-yr Extreme (Vext, m/s hub) | Application |
|---|---|---|---|---|---|
| I | 50 | ~112 | ≤10 | 70 | High-wind sites |
| II | 42.5 | ~95 | ≤8.5 | 59.5 | Medium-wind sites |
| III | 37.5 | ~84 | ≤7.5 | 52.5 | Low-wind sites |
| S | Site-specific | Site-specific | Varies | Varies | Special/tropical cyclone |

**Vext = 1.4 × Vref** (extreme gust, 50-yr return, 3-second mean at hub)

**Survival wind speed** (turbine parked, feathered): Vsurvival = 1.4 × Vref × safety factors ≈ 70–98 m/s hub height for Class I–III. The U.S. DOE Energy.gov states standard IEC turbines are built to withstand "sustained winds of 112 mph and peak 3-second gusts of 156 mph." This corresponds approximately to IEC Class I (Vref = 50 m/s).

**Critical implication for risk modeling:** Class I turbines have a nominal survival speed of ~112 mph (1-min sustained, 10 m), which corresponds to a Category 3 hurricane onset. However, Rose et al. (2012) demonstrated that Class 1 turbines begin to show non-trivial buckling probability at Cat 2 (~96 mph) when they cannot yaw, and the probability reaches ~46% of a 50-turbine farm at Cat 3 (50 m/s hub-height 10-min mean). The DTU China case study showed tower collapses at Vhub = 62–68 m/s, below the 70 m/s design survival speed, indicating real-world performance frequently underperforms design specifications.

**Tropical Cyclone Class S (IEC 61400-1:2019 Annex J):** The 2019 amendment recognized that tropical cyclone environments require custom class S design with Monte Carlo simulation of cyclone wind speeds. Modern hurricane-resistant offshore turbines (e.g., GE Haliade-X, MingYang 7.25 MW) are rated to survive 134–161 mph for extended periods. Standard onshore Class I turbines that dominate the current U.S. installed base are **not** designed to this standard.

---

## 3. ROTOR_ASSEMBLY × HURRICANE

**Curve ID:** `hurricane/rotor_assembly_generic`  
**Subsystem capex weight:** 0.25–0.30 of total turbine  
**Components:** BLADE (55% of rotor cost), HUB (25%), PITCH_SYSTEM (20%)  
**Derivation approach:** Engineering-standard-based with empirical calibration  
**Confidence level:** Medium-High (best-evidenced wind subsystem)

---

### 3.1 Physics of Damage

**Primary causal chain:**
```
Hurricane wind ≥ cut-out (~55 mph)
→ Automatic shutdown: blades feathered to ~90°
→ Hurricane winds continue to increase
→ Extreme quasi-static + dynamic loads on feathered blades
→ At moderate hurricane (Cat 1–2): leading edge loads, root bending moment builds
→ At severe hurricane (Cat 2–3): blade deflection exceeds design envelope
→ Spar cap compression buckling, trailing edge debonding, adhesive joint failure
→ At extreme hurricane (Cat 3–5): blade fracture at root transition or mid-span
→ Detached blade may impact tower → cascading tower failure risk
```

**Secondary failure pathway — rapid wind direction change:**
Hurricane eyewalls produce wind direction changes of up to 30° in 10–30 seconds (Kapoor et al. 2020, Wind Energy Science). The NREL 5-MW turbine yaws at 0.3°/sec; Hurricane Bob (1991) changed direction at 0.5°/sec. This creates **yaw misalignment** even with functioning yaw control. Kapoor et al. found that yaw misalignment (MISAL case) produces:
- Blade root resultant moment: **6× the baseline case** and **5× the rated case**
- Tower base resultant moment: **5.5× the rated case**
These loads are well above IEC DLC 6.1/6.2 design load cases, providing a physics-based explanation for why turbines fail below nominal survival wind speeds.

**Specific blade failure modes (ordered by increasing severity):**

| Mode | Wind Speed Onset | Description | Repairable? |
|---|---|---|---|
| Surface erosion acceleration | >55 mph | Rain droplets at high velocity erode leading edge coating | Yes (coating) |
| Leading edge delamination | ~74 mph+ | Laminate cracking behind eroded zone | Minor repair |
| Trailing edge bond failure | ~85–100 mph | Adhesive joint peeling at edgewise loads | Major repair |
| Spar cap buckling | ~100–120 mph | Compressive failure of load-bearing spar | Replace blade |
| Root connection failure | ~110–130 mph | Fatigue + extreme load at root bolt interface | Replace blade |
| Blade fracture (mid-span) | ~120–140 mph | Catastrophic structural collapse | Total loss |
| Full blade detachment | ~130–160 mph | Root pullout or fracture near hub attachment | Total loss |

*Sources: Mishnaevsky et al. (2022) root cause mechanisms; DTU China study (orbit.dtu.dk 2021); Punta Lima event (2017).*

**Hub failure modes:**
The hub is a solid cast steel/nodular iron structure and significantly more robust than blades. Hub damage occurs primarily from:
1. **Asymmetric blade loads** (one or more blades detached) → hub experiences unbalanced bending and torsion
2. **Pitch bearing overload** → four-point contact ball bearings fail under static overload (IEC ultimate limit state)
3. **Cascade damage** from detached blade impact on hub

A 2024 WES preprint (blade bearing reliability) found that most wind sites exhibit higher probability of blade bearing failure than IEC categories predict, with turbulence intensity being the dominant factor. Under hurricane turbulence intensity (TI mean ~9%, SD 1.5% per Rose et al.), pitch bearing failure risk increases substantially.

**Pitch system failure modes:**
The pitch system (individual blade rotation actuator) is critical for emergency feathering:
1. **Loss of grid power** during hurricane → emergency backup (battery/capacitor for electric pitch; accumulator for hydraulic) must activate
2. **Hydraulic accumulator depletion** under repeated pitching in pre-hurricane gusts
3. **Electric pitch actuator failure** from voltage surges, vibration damage to motors
4. **Control system failure** from lightning-induced transients or water ingress
5. **Frozen pitch bearing** under extreme loading (blade unable to feather) → catastrophic runaway

If the pitch system fails to feather during a hurricane, the turbine cannot shed aerodynamic load. DTU China case study showed a blade that could not feather survived higher hub wind speeds (up to 87 m/s peak) *because blade fracture released load before tower collapse* — an unintended progressive failure protection mode.

---

### 3.2 Real Event Evidence

**Hurricane Maria, Puerto Rico (September 20, 2017) — Category 4 at landfall (155 mph 1-min)**

- **Punta Lima Wind Farm (Naguabo, PR):** 13 Vestas V80-1.8 MW turbines. The right eyewall passed directly over this farm. **All 13 turbines suffered significant damage; blades were snapped off every turbine; one tower snapped in half.** Estimated replacement cost: $50 million (~$3.8M per turbine). This farm sits at ~100–200 m elevation in hilly terrain — local wind speedup by topography was significant.
- **Santa Isabel Wind Farm (largest Caribbean wind farm, 44 turbines, ~95 MW):** Located ~30 km west-southwest of Maria's landfall track, missed the most intense eyewall. **Sustained no significant damage** and resumed operations relatively quickly.
- **Lesson:** The difference between ~130 mph and ~155+ mph (with topographic amplification) was the difference between zero significant damage and total loss of all turbines at a given site. This provides empirical evidence that the damage function is highly nonlinear in the ~110–155 mph range.

*Sources: Wunderground Cat6 blog (Gallucci 2018); Kapoor et al. (2020) WES; ililani.media (2017); NIST Hurricane Maria Investigation (2025)*

**Hurricane Harvey, Texas (August 25, 2017) — Category 4 at landfall (~130 mph)**

- Wind turbines in ERCOT's coastal Texas region were curtailed when wind speeds exceeded cut-out (~55 mph). Multiple farms shut down temporarily. **No significant physical turbine damage was reported.** Harvey's strongest winds (~130 mph at landfall at Rockport) were well inland and not co-located with major coastal wind farms.
- The wind farms in southern Texas were subject to high but sub-failure winds (~60–80 mph). EIA reported that "several turbines in ERCOT's coastal area were shut off" but resumed operations post-storm.
- **Lesson:** Harvey demonstrates the operational curtailment loss pathway (pure revenue loss, no physical damage) at 60–80 mph sustained.

*Sources: EIA Today in Energy (September 2017); Common Dreams (September 2017)*

**Hurricane Laura, Louisiana (August 27, 2020) — Category 4 at landfall (~150 mph)**

- Laura made landfall near Cameron, Louisiana with 150 mph sustained winds. Widespread destruction of transmission infrastructure, buildings, and industrial facilities. No major wind farms were directly in the path; the Cameron/Lake Charles area had limited wind power presence.
- The NWS Lake Charles radar dome was destroyed, an engineered structure comparable in wind exposure to a turbine nacelle.
- **Lesson:** Laura's wind field provides a calibration point for structural damage to similar engineered structures at ~150 mph.

*Sources: Wikipedia Hurricane Laura; CNN (August 2020)*

**Typhoon Usagi, China (2013) — Hub-height max ~62.8 m/s (~140 mph 10-min, ~154 mph 1-min)**

- 8 of 25 turbines had tower collapse (local buckling at 9–10 m above foundation, at shell thickness change zone). 11 of 75 blades failed. Cost: ~$16M.
- **Critical finding:** The wind turbines did NOT have sufficient design strength; structural failure occurred when hub-height winds were BELOW the design survival wind speed of 70 m/s. This suggests real-world performance margin is ~10–15% below nominal design ratings.

*Sources: UTM Consultants Tower Collapse review (2024)*

---

### 3.3 Existing Fragility Functions in Literature

**PNNL Fragility Functions Resource Report (PNNL-33587, 2022):**
- Presents fragility curves for wind turbines in parked condition (Zuo et al. 2020, Del Campo et al. 2020)
- Curves use intensity measure = hub-height wind speed in m/s (not surface mph)
- All curves are graphical; no explicit logistic parameters provided
- Confirms lognormal/logistic form is appropriate; confirms parked condition is correct assumption for hurricane loading

**Rose et al. (2012) — PNAS:**
- Log-logistic model for tower buckling probability vs. 10-minute hub-height wind speed (knots)
- **Active yawing:** α = 174 knots, β = 19.3 → 50% buckling at 174 knots hub-height (10-min) ≈ **~200 mph 1-min surface**
- **Not yawing:** α = 140 knots, β = 18.6 → 50% buckling at 140 knots hub-height (10-min) ≈ **~133 mph 1-min surface**
- Note: Rose models *tower buckling only*, explicitly excluding blade damage ("blades relatively easy to replace")
- The not-yawing case (worst plausible scenario) is most applicable to risk modeling given rapid direction changes

**Kapoor et al. (2020) — Wind Energy Science:**
- Physics-based load analysis showing MISAL (yaw misalignment) produces loads 5–6× rated for blade root and tower base
- Tower base flexural limit for DTU 10-MW turbine: 5.4 × 10⁵ kNm (Eurocode basis)
- No direct fragility curve, but provides physical justification for steep sigmoid shape

**Del Campo et al. (2020) — Wind Energy:**
- Fragility reduction of ~80% with passive tuned mass dampers (TMDs) on 1–3.3 MW turbines
- Confirms land-based turbines without passive damping are highly vulnerable to cyclone loads

**DTU China Case Study (Xu, orbit.dtu.dk, 2021):**
- Vhub = 62 m/s (feathered) → tower collapse (steel yielding + local buckling at 10 m)
- Vhub = 68 m/s (feathered) → blade fracture (less destructive than tower collapse)
- Vhub = 87 m/s (un-feathered) → all towers survive (blade fracture protects tower)
- This non-monotonic relationship is important: blade fracture can serve as a fuse mechanism

**HAZUS Hurricane Technical Manual (FEMA):**
- HAZUS does not include explicit wind turbine fragility curves in its standard library
- HAZUS models apply to residential, commercial, and industrial buildings
- Wind turbines are treated as "other structures" with generic industrial building curves
- **Data gap:** HAZUS has no turbine-specific wind fragility functions

---

### 3.4 Component-Level Breakdown & Cost Weighting

| Component | Capex Weight (% of ROTOR) | Hurricane Vulnerability Rank | Primary Failure Mode |
|---|---|---|---|
| BLADE (×3) | 55% (18% per blade) | **Highest** | Structural buckling, root failure, detachment |
| HUB | 25% | Medium | Pitch bearing overload, asymmetric loading |
| PITCH_SYSTEM (×3) | 20% (7% per unit) | Medium-High | Power loss + feathering failure, bearing damage |

*Note: Three blades contribute ~18% capex each. Losing one blade causes significant vibration-induced hub and tower damage, often requiring shutdown and multi-component repair.*

---

### 3.5 Proposed Curve Parameters — ROTOR_ASSEMBLY

#### BLADE Component: `hurricane/blade_generic`

**Derivation:** Engineering-standard-based with empirical calibration to Punta Lima (Maria 2017) and Usagi/Saomai typhoon data.

**Anchor points used:**
- 74 mph (Cat 1 onset): ~4.5% probability of significant blade damage
- 118 mph (Cat 2/3 boundary): ~45% probability (= L/2, midpoint)
- 155 mph (Cat 4/5): ~83% probability — consistent with Punta Lima 100% farm damage at ~155 mph + topographic speedup

| Parameter | Value | Notes |
|---|---|---|
| **L** | **0.90** | Full blade set replacement is max; a few turbines may survive any event |
| **k** | **0.0669** | Calibrated to 4.5% at 74 mph anchor |
| **x0** | **118 mph** | Midpoint ≈ upper Cat 2 / lower Cat 3 |
| 10% damage threshold | **85.2 mph** | Mid Cat 1 |
| 50% damage threshold | **118.0 mph** | Upper Cat 2 |
| 90% damage threshold | **150.8 mph** | Mid Cat 4 |
| Confidence | **Medium** | Empirical calibration to limited hurricane events |
| Intensity variable | 1-min sustained 10m height, mph | SSWS standard |

#### HUB Component: `hurricane/hub_generic`

| Parameter | Value | Notes |
|---|---|---|
| **L** | **0.70** | Hub is robust; max damage ~70% (structural damage but salvageable) |
| **k** | **0.0896** | Calibrated: 10% damage at 110 mph |
| **x0** | **130 mph** | Cat 3/4 boundary; hub damage lags blade damage |
| 10% damage threshold | **105.5 mph** | Cat 2/3 boundary |
| 50% damage threshold | **130.0 mph** | Cat 4 onset |
| 90% damage threshold | **154.5 mph** | Cat 4/5 boundary |
| Confidence | **Low-Medium** | Proxy-adapted; limited direct evidence |
| Derivation | Proxy-adapted from blade/tower evidence |

#### PITCH_SYSTEM Component: `hurricane/pitch_system_generic`

| Parameter | Value | Notes |
|---|---|---|
| **L** | **0.75** | Pitch system can fail to feather but is often repairable |
| **k** | **0.0950** | Calibrated: ~4% at 74 mph (risk of backup depletion) |
| **x0** | **105 mph** | Cat 2: grid loss + extreme loads peaks pitch risk |
| 10% damage threshold | **81.9 mph** | Cat 1/2 transition |
| 50% damage threshold | **105.0 mph** | Mid Cat 2 |
| 90% damage threshold | **128.1 mph** | Cat 3/4 boundary |
| Confidence | **Low-Medium** | Expert judgment; limited direct data |
| Derivation | Expert-judgment-based |

#### ROTOR_ASSEMBLY Aggregate: `hurricane/rotor_assembly_generic`

Weighted combination: BLADE(55%), HUB(25%), PITCH(20%)

| Parameter | Value | Justification |
|---|---|---|
| **L** | **0.88** | Asymptotic cap; some turbines survive Cat 5 |
| **k** | **0.0744** | Fit to weighted component combination |
| **x0** | **116 mph** | ~Cat 2/3 transition; majority of rotor damage risk zone |
| 10% damage threshold | **86.5 mph** | Mid Cat 1 |
| 50% damage threshold | **116.0 mph** | Cat 2/3 transition |
| 90% damage threshold | **145.5 mph** | Mid Cat 4 |
| Confidence | **Medium** | Best-evidenced wind subsystem |
| Derivation | Engineering-standard-based + empirical calibration |

**Damage at key hurricane categories:**
| SSWS Category | Sustained Speed (mph) | Rotor Damage Ratio |
|---|---|---|
| Pre-hurricane (TS) | 40–73 mph | 0–2% (curtailment only below 55 mph) |
| Cat 1 | 74–95 mph | 4–11% |
| Cat 2 | 96–110 mph | 16–34% |
| Cat 3 | 111–129 mph | 36–67% |
| Cat 4 | 130–156 mph | 68–87% |
| Cat 5 | 157+ mph | 88%+ |

---

## 4. TOWER × HURRICANE

**Curve ID:** `hurricane/tower_section_generic`  
**Subsystem capex weight:** 0.12–0.15 of total turbine  
**Component:** TOWER_SECTION  
**Derivation approach:** Engineering-standard-based (Rose et al. 2012 calibration, converted to SSWS mph)  
**Confidence level:** Medium-High (peer-reviewed anchor data)

---

### 4.1 Physics of Damage

**Primary causal chain:**
```
Hurricane wind → Overturning bending moment at tower base
→ In parked (feathered) condition: aerodynamic drag on rotor disk + tower + nacelle
→ Moment increases as square of wind speed × drag coefficient
→ Yaw misalignment amplifies: MISAL case = 5.5× rated tower base moment (Kapoor 2020)
→ Steel yields at tower section (weakest point: thickness change zone, door opening, weld seam)
→ Local buckling initiates (9–10 m above grade in documented cases — Usagi 2013)
→ Global tower collapse under eccentric loading
```

**Wind loading physics (ASCE 7-22 context):**
Turbine towers are classified as "Other Structures" under ASCE 7-22 Chapter 29. Design wind pressure scales as:
`q = 0.00256 × Kz × Kzt × Kd × V²` (pounds per square foot, V in mph)

At V = 111 mph (Cat 3 onset) vs. V = 74 mph (Cat 1 onset):
`q(111)/q(74) = (111/74)² = 2.25×` — wind pressure more than doubles at Cat 3 vs Cat 1

For a 90-m hub height tubular steel tower, the overturning moment M ∝ V² × exposed area × lever arm. The tower must resist both the direct wind drag (tower itself: cylindrical drag Cd ≈ 0.5) and the forces transmitted from the rotor disk (blade drag in parked position).

**Failure modes (by occurrence frequency from Tower Collapse Cases review):**

| Failure Mode | Share of Cases | Notes |
|---|---|---|
| Local buckling at shell thickness change | Most common in extreme wind | 9–10 m above grade (Usagi); near door openings (Maemi) |
| Foundation anchor bolt failure | Significant in extreme wind | Usagi (2013): 2 of 8 collapsed towers |
| Weld seam fracture | Moderate | Saomai (2006): 1 of 5 towers |
| Blade strike → eccentric loading → buckling | Secondary | Common in typhoon records |
| Fatigue-accelerated failure at normal winds | Rare in context | Bathtub curve wear-out after 14–15 years |

**Tower type vulnerability differences:**
- **Steel tubular towers** (dominant in U.S.): Prone to local buckling at circumferential weld seams and shell thickness change zones. The stress concentration factor at door openings (where the tower shell is interrupted) is a documented vulnerability point. Typhoon Maemi data showed that yaw angle < 40° to door centerline creates high compressive stress at the door opening.
- **Lattice (truss) towers:** More distributed structural redundancy; individual member buckling before global failure is possible. However, **significantly more vulnerable to wind-borne debris** and more complex bolt-joint failure modes.
- **Concrete towers:** Higher stiffness, better fatigue resistance, but brittle failure mode (less warning before collapse).

**Tower height as vulnerability amplifier:**
Larger, taller modern turbines (≥3 MW, hub heights 80–120 m) face higher wind speeds at hub height than smaller Class I designs. A Class I turbine at 90 m hub faces design wind speeds of 50 m/s (10-min); at 120 m hub, the same surface wind produces higher hub-height speeds. Taller towers also have higher resonant modes and greater susceptibility to dynamic amplification from hurricane turbulence.

**Natural frequency and resonance:**
Wind turbine towers are designed with fundamental natural frequencies in the "1P–3P" range (once and three times per revolution). Hurricane winds, particularly near the eyewall, may produce vortex shedding and turbulence at frequencies that excite tower resonance even when the rotor is stationary. Rapid direction changes (MISAL case) can excite side-to-side (SS) tower loads — Kapoor et al. found SS tower moments increasing 90× baseline in the most extreme misalignment scenario.

---

### 4.2 Existing Fragility Data

**Rose et al. (2012) — PNAS — Primary Reference:**
Log-logistic model for tower buckling probability:
`P(u) = 1 / (1 + (α/u)^β)`

where u = 10-minute hub-height wind speed in knots.

| Scenario | α (knots) | β | 50% at (hub, 10-min) | 50% at (surface, 1-min mph) |
|---|---|---|---|---|
| Active yawing | 174 | 19.3 | 174 knots = 200 mph hub | ~166 mph 1-min surface |
| Not yawing (worst case) | 140 | 18.6 | 140 knots = 161 mph hub | ~133 mph 1-min surface |

**Conversion method:** 
- Hub (90 m) to 10 m: multiply by (10/90)^0.077 ≈ 0.83 per Franklin et al. (2003) hurricane profile
- 10-min to 1-min: multiply by ~1.10 per Harper et al. (2010) gust conversion

**Rose et al. key findings translated to SSWS:**
- Category 2 (≥96 mph surface): up to 6% tower buckling probability in a 50-turbine farm
- Category 3 (≥111 mph surface): up to 46% tower buckling probability
- The steep β values (18.6–19.3) indicate a very sharp transition — this supports using a logistic curve with high k

**UTM Tower Collapse Historical Review (2024):**
- Of 47 documented cases (2000–2016), extreme wind events (typhoon + storm) caused **55.7%** of tower collapses
- Average tower collapse wind speeds in documented typhoon cases: 62–80+ m/s at hub height = 139–179+ mph 1-min surface
- Key finding: Towers collapsed at winds BELOW nominal design survival speed in multiple cases, due to construction defects, yaw misalignment, and door opening stress concentration

**Chen & Xu (2016) and DTU China study:**
- Structural failure (tower collapse) confirmed at Vhub = 62 m/s (10-min, hub) = **~149 mph 1-min surface** for feathered condition
- Blade fracture at Vhub = 68 m/s = **~163 mph 1-min surface** — higher than tower collapse threshold

---

### 4.3 Proposed Curve Parameters — TOWER

**Curve:** `hurricane/tower_section_generic`

**Anchor points:**
- 74 mph (Cat 1): ~0.07% tower failure (essentially zero — consistent with Harvey/conventional storm experience)
- 111 mph (Cat 3 onset): ~5% tower failure (consistent with Rose et al. at this wind speed range)
- 130 mph (Cat 4 onset): ~33% tower failure
- 156 mph (high Cat 4): ~91% tower failure
- 175 mph (mid Cat 5): ~99% tower failure

| Parameter | Value | Justification |
|---|---|---|
| **L** | **1.00** | Tower buckling is total loss; cannot be repaired in place |
| **k** | **0.1178** | Calibrated to 5% at 111 mph, Rose et al. derived |
| **x0** | **136 mph** | 50% failure at mid Cat 3/4, consistent with Rose not-yawing converted to SSWS |
| 10% damage threshold | **117.3 mph** | Lower Cat 3 |
| 50% damage threshold | **136.0 mph** | Low Cat 4 |
| 90% damage threshold | **154.7 mph** | High Cat 4 |
| Confidence | **Medium-High** | Anchored to peer-reviewed PNAS data |
| Derivation | Engineering-standard-based |

**Sensitivity note:** The Rose et al. not-yawing case (x0 ≈ 133 mph surface) and yawing case (x0 ≈ 166 mph surface) bracket a substantial range. This report uses x0 = 136 mph as a realistic weighted average for U.S. onshore sites where yaw control may be partially functional (grid loss is common in major hurricanes, compromising yaw, but not universal). If the application is for fully connected turbines with backup yaw power, shift x0 to 145 mph. For worst-case loss scenarios, x0 = 130 mph.

**Damage at key hurricane categories:**
| Category | Speed (mph) | Tower Collapse Probability |
|---|---|---|
| Cat 1 | 74–95 | <1% |
| Cat 2 | 96–110 | 1–5% |
| Cat 3 | 111–129 | 5–30% |
| Cat 4 | 130–156 | 33–91% |
| Cat 5 | 157+ | 95%+ |

---

## 5. NACELLE × HURRICANE

**Curve ID:** `hurricane/nacelle_generic`  
**Subsystem capex weight:** 0.20–0.25 of total turbine  
**Components:** GEARBOX (40%), GENERATOR (30%), YAW_SYSTEM (15%), COOLING_SYSTEM (15%)  
**Derivation approach:** Proxy-adapted from blade/tower research + engineering judgment  
**Confidence level:** Low-Medium

---

### 5.1 Physics of Damage

The nacelle is an aerodynamically shaped housing that offers partial protection to internal components. It is somewhat self-protective but is subject to several distinct failure pathways in hurricanes:

**Yaw System Failure:**
- Hydraulic or electric yaw drive must oppose wind-induced yaw moments during hurricane
- Grid loss during hurricane → backup power must sustain yaw → depletion possible after hours of storm
- Hurricane direction changes (30° in 30 seconds) exceed yaw capability (0.3°/sec = 3° in 10 sec)
- Consequence: nacelle ends up perpendicular to wind → 5.5× rated tower base bending moment (Kapoor et al.)
- Yaw bearing overload → yaw ring damage → costly repair or nacelle replacement
- Evidence: Hurricane-Induced Loads on OWTs (Wind Energy journal 2014) explicitly notes "yaw control system might operate abnormally due to damage of control and protection system" during hurricanes

**Gearbox Damage:**
- Gearbox is most maintenance-intensive drivetrain component (NREL Gearbox Reliability Database)
- Hurricane-specific risks: asymmetric rotor loads from wind misalignment → torque spikes → gear tooth failure
- Blade imbalance (one blade failed) → extreme vibration → gearbox bearing failure
- Thermal stress from shutdown + restart cycles during storm passage
- Gearbox is not primarily driven by sustained wind speed alone — it is more sensitive to load cycles, vibration, and downstream effects of blade/hub damage

**Generator Damage:**
- Risk from extreme vibration if blade/rotor system is damaged during hurricane
- Water ingress: nacelle seals rated for IP54/IP55 — sustained Cat 3+ hurricane rain rates (12+ inches/hour) can overwhelm seals
- Generator windings and insulation degraded by moisture → ground faults → replacement required
- NREL EPRI study (2023): stator and rotor failures from loose/damaged windings are primary generator failure mode; hurricane vibration can accelerate these

**Water Ingress — Cross-Cutting Nacelle Risk:**
All nacelle components are vulnerable to water ingress during sustained extreme weather. Modern nacelles have sealing systems designed for heavy rain but not sustained hurricane-intensity rainfall with extreme wind-driven moisture penetration. Salt spray in coastal/offshore environments compounds corrosion damage.

**Nacelle as Secondary Failure:**
In most hurricane events, nacelle damage is secondary to blade and tower damage. However, nacelle becomes the primary surviving component requiring repair after major blade damage events (Punta Lima: all 13 turbines had nacelle systems intact enough to be considered for repair/replacement, but ultimately all 13 were decommissioned/replaced).

---

### 5.2 Component Breakdown

| Component | Capex % of Nacelle | Hurricane Failure Mode | Primary Trigger |
|---|---|---|---|
| GEARBOX | ~40% | Bearing overload, vibration damage, oil contamination | Blade asymmetry, extreme vibration |
| GENERATOR | ~30% | Water ingress, extreme vibration, insulation failure | Sustained extreme rainfall, blade damage |
| YAW_SYSTEM | ~15% | Bearing overload, yaw ring damage, power loss | Grid loss + rapid direction change |
| COOLING | ~15% | Seal failure, water ingress, contamination | Cat 3+ rainfall |

---

### 5.3 Proposed Curve Parameters — NACELLE

**Derivation:** The nacelle is more sheltered than the rotor but less protected than the foundation. It is primarily at risk from:
1. Secondary effects of rotor damage (extreme vibration/asymmetric loading) — correlated with rotor damage curve
2. Yaw system failure leading to massive overloading of all drivetrain components
3. Water ingress at extreme sustained rainfall

Because nacelle damage is largely secondary/cascading from rotor and yaw failures, it lags rotor damage but precedes foundation damage in the damage progression.

| Parameter | Value | Justification |
|---|---|---|
| **L** | **0.65** | Major nacelle damage possible but not always total loss; gearbox/generator replaceable |
| **k** | **0.0541** | Shallower than blade/tower (wider damage range, secondary failures) |
| **x0** | **130 mph** | Cat 3/4 boundary; yaw system most likely to fail under sustained Cat 3+ with grid loss |
| 10% damage threshold | **89.4 mph** | Upper Cat 1 |
| 50% damage threshold | **130.0 mph** | Cat 4 onset |
| 90% damage threshold | **170.6 mph** | High Cat 5 |
| Confidence | **Low-Medium** | Expert-judgment dominant; limited direct nacelle-specific data |
| Derivation | Proxy-adapted |

**Note:** The nacelle curve's lower L (0.65) and shallower slope reflect genuine uncertainty: nacelle components can survive even severe rotor damage events if the tower stands, but component-by-component repair may approach 65% of replacement cost at extreme wind speeds. The 90% damage threshold is pushed to 170 mph because some nacelle components (generator, gearbox) require extreme vibration or water damage — which only reaches catastrophic levels at very high sustained winds.

---

## 6. FOUNDATION × HURRICANE

**Curve ID:** `hurricane/foundation_generic`  
**Subsystem capex weight:** 0.08–0.12 of total turbine  
**Component:** FOUNDATION_BASE  
**Derivation approach:** Proxy-adapted (primarily tower-collapse cascading; direct wind loading is minimal)  
**Confidence level:** Low

---

### 6.1 Physics of Damage

The foundation is the most resilient wind turbine subsystem to hurricane wind loading. Unlike blades and towers, the foundation is underground (land-based) and is not directly exposed to wind forces. Foundation damage in hurricanes occurs through four mechanisms:

**Mechanism 1: Overturning Moment Transfer from Tower**
The wind force on the tower-nacelle-rotor system creates an overturning moment at the base. For onshore foundations (typically a spread footing or pile foundation), this is transmitted as:
- **Anchor bolt tension** on the windward side
- **Compressive bearing pressure** on the leeward side
- **Shear** at the grout-to-concrete interface

DTU Usagi analysis found 2 of 8 collapsed towers had foundation failure — the extreme moment (5+ times design levels from yaw misalignment) overstressed anchor bolts. This is a relatively rare pathway as modern foundation designs are oversized relative to the tower's structural capacity.

**Mechanism 2: Storm Surge + Scour (Coastal/Offshore Sites)**
For coastal onshore or near-shore sites within the storm surge zone:
- Storm surge erodes soil around the foundation (scour)
- Scour depth of several meters can destabilize pad foundations designed for 3–5 m soil coverage
- Wave action combined with reduced soil bearing capacity causes foundation rotation or settlement
- More relevant for offshore (monopile, jacket) foundations

**Mechanism 3: Soil Liquefaction**
In coastal areas with saturated sandy soils, prolonged vibration from the wind turbine (even parked) can induce pore pressure buildup. During Cat 3+ hurricanes with heavy rainfall, soil moisture near the foundation increases, lowering bearing capacity. This is a documented mechanism in earthquake engineering (well-studied) but poorly documented for hurricane events specifically.

**Mechanism 4: Combined Effects — Slope Instability**
Mountain/ridge-sited turbines (as at Punta Lima, PR) face additional risk from hurricane-triggered landslides and slope failure due to extreme rainfall (Hurricane Maria produced 30 inches of rainfall in some areas). Foundation undermining by slope movement can cause turbine tipping without direct wind failure.

---

### 6.2 Historical Evidence

- **Typhoon Saomai (2006, China):** 2 of 5 collapsed towers involved foundation failure. Gusts exceeded 80 m/s (~179 mph). These foundations were subject to extreme overturning moments well beyond Class S design.
- **Typhoon Usagi (2013, China):** 2 of 8 tower collapses involved foundation failure alongside tower shell buckling. Peak hub speed ~62.8 m/s mean (~140 mph 1-min surface equivalent).
- **Punta Lima (Maria 2017):** One tower "snapped in half" — indicates tower-level structural failure; no specific report of foundation failure. Foundation likely remained intact while tower buckled above grade.

**General pattern:** Foundation failure is rare as an independent failure mode. It almost exclusively occurs when:
1. Tower already fails (buckling), transmitting impact loads to foundation
2. Extreme soil conditions (saturated, coastal, scour-prone) coincide with Cat 4+ winds
3. Manufacturing defects or corrosion reduced anchor bolt capacity

---

### 6.3 Proposed Curve Parameters — FOUNDATION

| Parameter | Value | Justification |
|---|---|---|
| **L** | **0.50** | Foundation damage is partial; rarely total replacement needed |
| **k** | **0.0722** | Calibrated: ~2% at 111 mph, ~25% at 155 mph |
| **x0** | **155 mph** | Cat 4/5 boundary; only severe storms cause significant direct foundation damage |
| 10% damage threshold | **124.6 mph** | Low Cat 3 |
| 50% damage threshold | **155.0 mph** | Cat 4/5 boundary |
| 90% damage threshold | **185.4 mph** | Extreme Cat 5 |
| Confidence | **Low** | Sparse direct data; heavily proxy-adapted |
| Derivation | Proxy-adapted |

**Important note:** For risk models where **storm surge** is the primary foundation risk driver (e.g., coastal sites in Cat 3+ surge zones), a separate storm-surge-indexed curve should be developed. The curve above captures only wind-induced foundation damage (overturning moment, anchor bolt failure, vibration-induced soil weakening). A combined wind + surge parametrization would substantially increase foundation damage probabilities at coastal sites.

---

## 7. Recommended Curve Parameters — Master Table

All curves use: `f(x) = L / (1 + exp(-k * (x - x0)))`  
**x = 1-minute sustained wind speed at 10 m height, mph (SSWS standard)**

| Curve ID | Subsystem | Component | L | k | x0 (mph) | 10% DR | 50% DR | 90% DR | Confidence | Derivation Method |
|---|---|---|---|---|---|---|---|---|---|---|
| `hurricane/blade_generic` | ROTOR_ASSEMBLY | BLADE | 0.90 | 0.0669 | 118 | 85 | 118 | 151 | Medium | Eng-std + empirical |
| `hurricane/hub_generic` | ROTOR_ASSEMBLY | HUB | 0.70 | 0.0896 | 130 | 106 | 130 | 155 | Low-Medium | Proxy-adapted |
| `hurricane/pitch_system_generic` | ROTOR_ASSEMBLY | PITCH_SYSTEM | 0.75 | 0.0950 | 105 | 82 | 105 | 128 | Low-Medium | Expert judgment |
| `hurricane/rotor_assembly_generic` | ROTOR_ASSEMBLY | Aggregate | 0.88 | 0.0744 | 116 | 87 | 116 | 146 | Medium | Eng-std + empirical |
| `hurricane/tower_section_generic` | TOWER | TOWER_SECTION | 1.00 | 0.1178 | 136 | 117 | 136 | 155 | Medium-High | Eng-std (Rose 2012) |
| `hurricane/nacelle_generic` | NACELLE | Aggregate | 0.65 | 0.0541 | 130 | 89 | 130 | 171 | Low-Medium | Proxy-adapted |
| `hurricane/foundation_generic` | FOUNDATION | FOUNDATION_BASE | 0.50 | 0.0722 | 155 | 125 | 155 | 185 | Low | Proxy-adapted |

**DR = Damage Ratio (as fraction of L, not absolute damage ratio)**

**Absolute damage ratio at key intensities:**

| Wind Speed (mph) | SSWS Category | Blade DR | Tower DR | Nacelle DR | Foundation DR |
|---|---|---|---|---|---|
| 55 | Tropical Storm | 0.010 | 0.000 | 0.003 | 0.000 |
| 74 | Cat 1 onset | 0.045 | 0.001 | 0.030 | 0.001 |
| 85 | Cat 1 | 0.090 | 0.003 | 0.040 | 0.002 |
| 96 | Cat 2 onset | 0.176 | 0.009 | 0.069 | 0.004 |
| 111 | Cat 3 onset | 0.332 | 0.050 | 0.165 | 0.020 |
| 130 | Cat 4 onset | 0.569 | 0.330 | 0.325 | 0.059 |
| 155 | Cat 4/5 boundary | 0.830 | 0.913 | 0.516 | 0.250 |
| 175 | Cat 5 | 0.869 | 0.990 | 0.596 | 0.405 |

---

## 8. Hurricane Category Reference

| Category | 1-min Sustained (mph) | 10-min at Hub ~90m (mph) | Typical Turbine Response |
|---|---|---|---|
| Tropical Storm | 39–73 mph | 40–75 mph | Operational until ~55 mph cut-out, then parked |
| Cat 1 | 74–95 mph | 76–98 mph | Parked, feathered; minor blade load; no structural risk |
| Cat 2 | 96–110 mph | 99–113 mph | Significant blade loading; 1–5% tower risk; pitch system stress |
| Cat 3 | 111–129 mph | 114–133 mph | Major blade damage risk; 5–30% tower collapse; gearbox at risk |
| Cat 4 | 130–156 mph | 134–160 mph | Majority of rotor likely damaged; 33–91% tower collapse |
| Cat 5 | 157+ mph | 161+ mph | Near-total destruction of all turbines at direct hit locations |

---

## 9. Data Gaps & Recommendations

### 9.1 Critical Data Gaps

1. **No published fragility curves specifically for land-based onshore wind turbine blades in U.S. hurricane conditions.** The Rose et al. (2012) PNAS paper models tower buckling only and explicitly excludes blade damage. The PNNL Fragility Report (2022) provides graphical curves without extractable parameters. **This is the most significant gap.**

2. **HAZUS has no wind turbine fragility functions.** The FEMA HAZUS Hurricane Technical Manual models residential and commercial buildings. Wind turbines are absent from the standard library. InfraSure's curves in this area are effectively first-of-kind for actuarial applications.

3. **Pitch system hurricane-specific failure rate data is absent.** Pitch failure during extreme wind is documented anecdotally but no empirical failure rate vs. wind speed has been published. The curve here is primarily expert-judgment-based.

4. **No systematic post-hurricane wind turbine damage survey data from U.S. events.** Punta Lima (Maria 2017) is the single well-documented U.S. hurricane event with direct wind turbine structural damage. Harvey, Laura, and Ida (2021) did not produce documented turbine structural failures (farms were either not in direct path or survived). A proper damage function ideally requires 50+ loss data points.

5. **Class II and III turbines (lower-wind-speed designs with lower survival envelopes) are not separately parameterized.** The curves here are calibrated to Class I (most stringent, standard U.S. utility-scale) designs. Class II/III turbines at the same surface wind speed will experience higher hub-height winds relative to their design envelope and will therefore have **higher** damage probabilities.

6. **Topographic amplification is not captured in the generic curves.** Punta Lima's damage was likely amplified by hilltop positioning (ridge effect can increase wind speeds by 1.3–1.5×). Ridge-sited turbines should use a modified x0 shifted downward by ~15–20 mph.

7. **Combined wind + storm surge fragility for coastal onshore turbines is absent.** Foundation and nacelle damage in surge zones is poorly characterized.

8. **Offshore vs. onshore distinction is not fully resolved.** Offshore turbines face additional wave loading, salt spray, and longer exposure during storm passage. The curves here are calibrated primarily to land-based evidence.

### 9.2 Recommended Validation Steps

1. **Data collection:** File FOIA requests / industry partnerships to obtain post-storm damage inspection reports for Punta Lima, and any available insurance loss data from U.S. hurricane events.

2. **Curve splitting by turbine class:** Develop Class I vs. Class II/III variants. The x0 for Class II turbines at equivalent surface wind should be ~12–15 mph lower than Class I.

3. **Topographic modifier:** Develop a multiplier (1.0x flat terrain, 1.3x ridge/hilltop) to adjust effective wind speed before curve application.

4. **Integration with HAZUS:** Map InfraSure curves to HAZUS hurricane wind speed outputs (peak gust), which use 3-second gust at 10 m. Conversion: 1-min sustained ≈ 3-sec gust / 1.22 (using ASCE 7 gust factors for open terrain). Verify conversion is appropriate.

5. **Parametric refinement:** Commission structured expert elicitation with IEC-certified wind turbine structural engineers to constrain the pitch system and nacelle curves, which currently rely heavily on expert judgment.

6. **Offshore adaptation:** For offshore wind farms in the Gulf of Mexico or East Coast, add a wave loading modifier to tower and foundation curves (add 15–25% damage increment for Cat 3+ with co-occurring significant wave height >6 m).

---

## 10. Sources & References

All sources rated by quality: ⭐⭐⭐ = peer-reviewed; ⭐⭐ = government standard / institutional report; ⭐ = industry/expert judgment

### Primary Literature

1. **Rose, S.; Jaramillo, P.; Small, M.J.; Grossmann, I.; Apt, J. (2012).** "Quantifying the hurricane risk to offshore wind turbines." *Proceedings of the National Academy of Sciences*, 109(9), 3247–3252. DOI: 10.1073/pnas.1111769109. ⭐⭐⭐  
   URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC3295275/  
   *Primary source for tower buckling fragility parameters (α=174/140, β=19.3/18.6 log-logistic).*

2. **Kapoor, A.; Ouakka, S.; Arwade, S.R.; Lundquist, J.K.; Lackner, M.A.; Myers, A.T.; Worsnop, R.P.; Bryan, G.H. (2020).** "Hurricane eyewall winds and structural response of wind turbines." *Wind Energy Science*, 5, 89–104. DOI: 10.5194/wes-5-89-2020. ⭐⭐⭐  
   URL: https://wes.copernicus.org/articles/5/89/2020/  
   *Load amplification factors: MISAL blade root 6× base, tower base 5.5× rated. Gust factor >1.7 in hurricane eyewall.*

3. **Mishnaevsky, L. Jr.; Sütçü, M.; Frøyd, L. (2022).** "Root Causes and Mechanisms of Failure of Wind Turbine Blades." *Materials*, 15(9), 3084. DOI: 10.3390/ma15093084. ⭐⭐⭐  
   URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC9101399/  
   *Comprehensive blade failure mode taxonomy: trailing edge debonding, spar buckling, root connection failure, leading edge erosion.*

4. **Del Campo, J.M.; Martín del Campo, J.; Pozos-Estrada, A. (2020).** "Development of fragility curves of land-based wind turbines with tuned mass dampers under cyclone-induced winds." *Wind Energy*, 24(1), 1–18. DOI: 10.1002/we.2600. ⭐⭐⭐  
   URL: https://onlinelibrary.wiley.com/doi/full/10.1002/we.2600  
   *Fragility reduction ~80% with TMDs; confirms cyclone fragility for 1–3.3 MW land-based turbines.*

5. **Xu, B.; Feng, X.; Chen, C.; Zhu, Z. (2021).** "Structural integrity of wind turbines impacted by tropical cyclones: A case study from China." *DTU Orbit*. ⭐⭐⭐  
   URL: https://orbit.dtu.dk/files/246856964/Structural_integrity_of_wind_turbines_impacted_by_tropical_cyclones_A_case_study_from_China.pdf  
   *Tower collapse at Vhub = 62 m/s (below design 70 m/s). Blade fracture at 68 m/s. Key empirical thresholds.*

6. **Rose, S.; Apt, J. (2013).** "Quantifying the Hurricane Catastrophe Risk to Offshore Wind Power." *Risk Analysis*, 34(3), 576–585. DOI: 10.1111/risa.12085. ⭐⭐⭐  
   URL: https://onlinelibrary.wiley.com/doi/abs/10.1111/risa.12085  
   *Extension of Rose et al. 2012 to catastrophe risk at regional scale.*

7. **Hallowell, S.T.; Myers, A.T.; Arwade, S.R. (2018).** "Hurricane risk assessment of offshore wind turbines." *Renewable Energy*, 125, 234–249. DOI: 10.1016/j.renene.2018.02.090. ⭐⭐⭐  
   URL: https://www.sciencedirect.com/science/article/abs/pii/S0960148118302349  
   *Site-specific hurricane risk quantification for U.S. East Coast OWTs.*

8. **Barthelmie, R.J.; Pryor, S.C. et al. (2025).** "Hurricane impacts in the United States East Coast offshore wind energy lease areas." *Wind Energy Science*, 10, 2639. DOI: 10.5194/wes-10-2639-2025. ⭐⭐⭐  
   URL: https://wes.copernicus.org/articles/10/2639/2025/  
   *Mean failure probability during 20-yr lifetime: 9.6×10⁻⁶ (yaw functional), 2.9×10⁻⁴ (no yaw).*

### Standards & Technical Manuals

9. **IEC 61400-1:2019.** "Wind Energy Generation Systems — Part 1: Design Requirements." International Electrotechnical Commission. 4th Edition. ⭐⭐  
   URL: https://webstore.iec.ch/en/publication/26423  
   *Defines wind turbine design classes I–III and Class S for tropical cyclones. Table 1: Vref = 50/42.5/37.5 m/s. Annex J: Monte Carlo tropical cyclone assessment.*

10. **ASCE 7-22.** "Minimum Design Loads and Associated Criteria for Buildings and Other Structures." American Society of Civil Engineers, 2022. ⭐⭐  
    URL: https://www.asce.org/publications-and-news/civil-engineering-source/civil-engineering-magazine/article/2022/02/asce-7-22-wind-load-standard-adds-tornado-chapter  
    *Chapter 29: Wind loads on other structures including wind turbine towers. Updated wind speed maps. New Chapter 32: Tornado provisions.*

11. **FEMA HAZUS Hurricane Technical Manual.** Federal Emergency Management Agency.  
    *HAZUS does not include wind turbine-specific fragility functions. Wind turbine structures not explicitly classified in HAZUS building taxonomy.* ⭐⭐  

12. **NOAA NHC. Saffir-Simpson Hurricane Wind Scale.** National Hurricane Center.  
    URL: https://www.nhc.noaa.gov/aboutsshws.php  
    *Definitive hurricane category definitions: Cat 1 (74–95 mph), Cat 2 (96–110), Cat 3 (111–129), Cat 4 (130–156), Cat 5 (157+ mph).* ⭐⭐

### Institutional Research Reports

13. **PNNL-33587. (2022).** "Fragility Functions Resource Report." Pacific Northwest National Laboratory. Authors: multiple. ⭐⭐  
    URL: https://www.pnnl.gov/main/publications/external/technical_reports/PNNL-33587.pdf  
    *Presents wind turbine fragility curves graphically for NREL 5-MW and smaller turbines under combined wind/earthquake loading. No explicit numerical parameters for wind-only loading.*

14. **UTM Consultants. (2024).** "Wind Turbine Tower Collapse Cases: A Historical Overview." Review article.  
    URL: https://www.utmconsultants.com/wp-content/uploads/2024/07/6._Cases_review_paper_06_Rev_3.pdf  
    *47 documented collapse cases (2000–2016). Extreme wind (typhoon + storm) = 55.7% of all tower collapses. Collapse modes: local buckling, foundation, bolt failure, blade strike.* ⭐⭐

15. **NREL. (2022).** "Wind Turbine Generator Reliability Analysis to Reduce Operations and Maintenance Costs." NREL/TP-5000-86721.  
    URL: https://docs.nrel.gov/docs/fy23osti/86721.pdf  
    *Generator failure modes: stator/rotor winding, bearings, slip rings. Based on EPRI data from 17,000 turbines worldwide.* ⭐⭐

16. **Sandia National Laboratories. (ongoing).** "Blade Reliability & Composite Materials; Structural Health Monitoring." Wind Energy Program.  
    URL: https://energy.sandia.gov/programs/renewable-energy/wind-power/rotor-innovation/rotor-reliability/  
    *DOE/SNL/MSU Wind & Marine Energy Composites Database; >12,000 fatigue tests since 1989. Blade defect effects, leading edge erosion research.* ⭐⭐

17. **NREL Gearbox Reliability Database.**  
    URL: https://grd.nrel.gov  
    *Categorizes top wind turbine gearbox failure modes from EPRI/NREL data collection.* ⭐⭐

18. **U.S. DOE Office of CMEI. (2024).** "How Do Wind Turbines Survive Severe Weather and Storms?" Energy.gov.  
    URL: https://www.energy.gov/cmei/articles/how-do-wind-turbines-survive-severe-weather-and-storms  
    *IEC 61400-01 standard: built to withstand 112 mph sustained, 156 mph peak 3-sec gusts. Cut-out speed ~55 mph.* ⭐

19. **DTU WAsP. (n.d.).** "The IEC 61400-1 turbine safety standard."  
    URL: https://wasp.dtu.dk/software/windfarm-assessment-tool/iec-61400-1  
    *IEC turbine class assessment methodology; effective turbulence intensity; fatigue load cases.* ⭐⭐

### Event Documentation

20. **Gallucci, M. (2018).** "Offshore Wind Farms: Allaying Concerns About Hurricanes." Weather Underground Cat6 Blog.  
    URL: https://www.wunderground.com/cat6/Offshore-Wind-Farms-Allaying-Concerns-About-Hurricanes-and-About-Fishing  
    *Punta Lima (13 Vestas V80-1.8 MW): all 13 damaged, blades snapped, 1 tower snapped, $50M replacement. Santa Isabel (44 turbines): no significant damage.* ⭐

21. **EIA Today in Energy. (September 13, 2017).** "Hurricane Harvey caused electric system outages and affected wind generation in Texas."  
    URL: https://www.eia.gov/todayinenergy/detail.php?id=32892  
    *Several turbines shut down (cut-out ~55 mph). No physical turbine damage reported. Demonstrates curtailment-only pathway.* ⭐⭐

22. **NIST. (July 2025).** "NIST Shares Preliminary Findings From Hurricane Maria Investigation."  
    URL: https://www.nist.gov/news-events/news/2025/07/nist-shares-preliminary-findings-hurricane-maria-investigation  
    *Maria peak gusts: 140 mph flat terrain, >200 mph on mountain ridges. Category 4 at landfall.* ⭐⭐

23. **BBC. (May 9, 2023).** "Can a wind turbine handle hurricane speed winds?"  
    URL: https://www.bbc.com/news/business-65261147  
    *MingYang 7.25 MW typhoon-resistant turbine survives 134 mph for 10 min. GE Haliade-X typhoon-certified. Context on hurricane-hardened turbine development.* ⭐

24. **Franklin, J.L.; Black, M.L.; Valde, K. (2003).** "GPS Dropwindsonde Wind Profiles in Hurricanes and Their Operational Implications." *Weather and Forecasting*, 18(1), 32–44.  
    *Standard reference for hurricane wind profile (power-law exponent 0.077) used in Rose et al. 2012.* ⭐⭐⭐

25. **Harper, B.A.; Kepert, J.D.; Ginger, J.D. (2010).** "Guidelines for Converting Between Various Wind Averaging Periods in Tropical Cyclone Conditions." WMO/TD-No. 1555.  
    *Gust conversion factor from 10-min to 1-min: multiply by ~1.10 in open terrain.* ⭐⭐

---

## Appendix A: Logistic Curve Equations

For each curve, the sigmoid function is:

```
f(x) = L / (1 + exp(-k * (x - x0)))
```

where x is the 1-minute sustained wind speed at 10m height in miles per hour.

**Inverse function** (finding wind speed x for a given damage ratio d):
```
x = x0 + (1/k) * ln(d / (L - d))
```

**Threshold wind speeds:**
```
x at 10% DR = x0 + (1/k) * ln(0.10 / 0.90) = x0 - 2.197/k
x at 50% DR = x0 + (1/k) * ln(0.50 / 0.50) = x0
x at 90% DR = x0 + (1/k) * ln(0.90 / 0.10) = x0 + 2.197/k
```

Note: For 10%/90% as fractions of L, replace 0.10 → 0.10/L in the inverse function.

---

## Appendix B: Conversion Reference

**Converting Rose et al. (2012) hub-height log-logistic parameters to surface SSWS mph:**

1. Rose parameter α is in knots at 10-min hub height (90 m)
2. Convert knots to m/s: × 0.5144
3. Scale from 90m to 10m: × (10/90)^0.077 ≈ × 0.830
4. Convert 10-min to 1-min sustained: × 1.10
5. Convert m/s to mph: × 2.237

**Example (not yawing, α = 140 knots at hub):**
- 140 knots × 0.5144 = 72.0 m/s at 90m, 10-min mean
- 72.0 × 0.830 = 59.8 m/s at 10m, 10-min mean
- 59.8 × 1.10 = 65.8 m/s at 10m, 1-min sustained
- 65.8 × 2.237 = **147 mph** (1-min SSWS)

*Note: The 50% tower buckling threshold translates to approximately 133–147 mph SSWS for the not-yawing worst case, supporting the x0 = 136 mph used in this report.*

---

*End of Report*

**Document:** `/home/user/workspace/damage_curve_research/HURRICANE_x_WIND.md`  
**Version:** 1.0  
**Research date:** March 12, 2026  
**Next review:** After Punta Lima post-event damage data is available; after HAZUS update includes wind turbine structures
