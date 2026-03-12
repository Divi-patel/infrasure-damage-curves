# WILDFIRE × WIND: Deep Research for Damage Curve Derivation

**InfraSure Damage Curve Library — Research Document**  
**Hazard:** Wildfire (Physical Damage Channel)  
**Asset Class:** Utility-Scale Onshore Wind Turbines  
**Version:** 1.0 | March 2026  
**Methodology:** Physics-Based Threshold Analysis → Expert-Judgment Logistic Sigmoid  
**Intensity Variable:** Fireline Intensity I (kW/m, Byram 1959)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Key Difference from Solar: The Elevation Advantage](#2-key-difference-from-solar-the-elevation-advantage)
3. [Hazard Physics & Dual-Channel Loss Framework](#3-hazard-physics--dual-channel-loss-framework)
4. [Intensity Variable Selection & Heat Flux at Height](#4-intensity-variable-selection--heat-flux-at-height)
5. [ROTOR_ASSEMBLY × WILDFIRE (BLADE, HUB)](#5-rotor_assembly--wildfire-blade-hub)
6. [NACELLE × WILDFIRE (GEARBOX, GENERATOR, YAW_SYSTEM, COOLING_SYSTEM)](#6-nacelle--wildfire-gearbox-generator-yaw_system-cooling_system)
7. [TOWER × WILDFIRE (TOWER_SECTION)](#7-tower--wildfire-tower_section)
8. [Recommended Curve Parameters — Master Table](#8-recommended-curve-parameters--master-table)
9. [Real-World Wildfire Events: Calibration Anchors](#9-real-world-wildfire-events-calibration-anchors)
10. [Data Gaps & Recommendations](#10-data-gaps--recommendations)
11. [Sources & References](#11-sources--references)

---

## 1. Executive Summary

Wildfire is a **dual-channel loss hazard** for utility-scale onshore wind farms:
1. **Physical damage** (primary): Direct thermal effects on tower base, ground-level electrical, paint/coatings, and in rare extreme cases, elevated components
2. **PSPS grid shutoff** (secondary): Revenue loss from utility-initiated de-energization — **not modeled in the damage curve**

**The critical distinguishing feature of wind turbines vs. solar farms:** Wind turbines are elevated structures. The nacelle and blades sit at **80–120 m above ground level** — well above the reach of virtually any ground fire's flame zone and beyond the effective range of radiant heat flux from surface fires. This elevation advantage makes wind turbines **substantially less vulnerable to wildfire physical damage than solar farms**, where panels sit 1–3 m above the ground.

**Key intensity variable:** Byram's fireline intensity *I* (kW/m), consistent with the WILDFIRE_x_SOLAR approach. The same conversion formula *q = 0.35 × I / d* applies at ground level; however, a **height-attenuation factor** must be applied to estimate heat flux at nacelle height — which proves to be negligible for all but catastrophic crown fire scenarios.

**Derivation approach:** Expert-judgment proxy adaptation with physics-based bounding. Very limited empirical data exists for wildfire-specific damage to wind farms. The primary peer-reviewed literature covers *internal* nacelle fires (different cause, related outcome). Damage curves are derived by: (a) computing realistic heat flux at hub height as a function of fireline intensity, (b) comparing to thermal thresholds of materials, and (c) bounding the result with the small number of documented real-world incidents.

**Core finding:** Under any realistic surface fire scenario (I < 10,000 kW/m), the heat flux at nacelle height (~100 m) is negligible — typically < 0.5 kW/m². The primary wildfire damage pathways for wind turbines are:
- **Tower base** heat exposure → paint/coating damage, potential steel softening in extreme cases
- **Ground-level electrical** (cable entry conduits, junction boxes at tower base) → most vulnerable component
- **Ember landing** on blade surfaces → ignition of blade composite only if blade coating is flammable and ember exposure is sustained
- **Tower-initiated internal fire spread** (indirect) — ground-level fire entry can potentially propagate upward

**Confidence:** Very Low across all subsystems. No published empirical wildfire damage functions for wind turbines were identified. All curves are expert-judgment proxies.

---

## 2. Key Difference from Solar: The Elevation Advantage

### 2.1 Hub Height Context

Modern utility-scale wind turbines operate at hub heights that have increased dramatically:

| Era | Typical Hub Height | Typical Rotor Diameter | Turbine Class |
|-----|-------------------|----------------------|---------------|
| 1990s | 40–60 m | 30–50 m | Small |
| 2000s | 60–80 m | 60–90 m | Mid |
| 2010s | 80–100 m | 80–120 m | Utility |
| 2020s | 100–130 m | 120–175 m | Large utility |

Per the [U.S. Department of Energy (2024)](https://www.energy.gov/cmei/articles/wind-turbines-bigger-better), the average hub height for land-based utility-scale turbines in the U.S. reached **103.4 m (~339 ft) in 2023**, with rotor diameters averaging 175 m. Per [NREL ATB 2021](https://atb.nrel.gov/electricity/2021/land-based_wind), representative turbines now use 120 m hub heights with 175 m rotor diameter.

**Practical implication:** The nacelle floor sits at ~103 m above ground. The lowest blade tip passes at approximately 103 m − (175/2) m = ~16 m above ground at its lowest point for large modern turbines. On smaller 80 m hub / 100 m rotor turbines, the lowest blade tip is at ~30 m above ground.

### 2.2 Flame Height vs. Hub Height

The relationship between fireline intensity and flame height follows [Byram's (1959)](https://pubs.cif-ifc.org/doi/pdf/10.5558/tfc2012-035) empirical formula:

```
L = 0.0775 × I^0.46
```

Where L = flame length (m) and I = fireline intensity (kW/m).

For surface fires, flame height ≈ flame length (upright flames under windless conditions). Under wind, flame height < flame length (flames tilt):

| Fire Type | Fireline Intensity (kW/m) | Flame Length (m) | Flame Height (vertical, m) |
|-----------|--------------------------|------------------|---------------------------|
| Low grass fire | 100 | 2.3 | ~2 |
| Moderate shrub fire | 1,000 | 6.9 | 4–5 |
| High-intensity chaparral | 5,000 | 14.9 | 8–12 |
| Extreme crown fire | 20,000 | 27.9 | 15–25 |
| Maximum recorded surface fire | 100,000 | 57.6 | 30–50 |

**Critical observation:** Even the most extreme wildfire flame heights documented in scientific literature (~30–60 m for catastrophic crown fires) fall far short of modern wind turbine hub heights (80–130 m). The lowest blade tip on a modern 80 m hub / 100 m rotor turbine is at ~30 m — overlapping with only the absolute extreme tail of the flame height distribution.

Crown fires in dense timber can generate flame heights of 30–60 m per [NWCG fire behavior publications](http://www.nwcg.gov/publications/pms437/crown-fire/spotting-fire-behavior). The transition from surface fire to crown fire (towering 30–60 m flames) requires [fireline intensities typically above 10,000–50,000 kW/m](https://www.sciencedirect.com/science/article/pii/S0379711225002097).

### 2.3 No Smoke/Production Loss Channel

Unlike solar farms, wind turbines are unaffected by wildfire smoke in terms of energy production. Solar panels lose output when smoke attenuates irradiance; wind turbines operate on kinetic energy of air movement. Smoke particulates may potentially contaminate nacelle electrical systems if drawn through ventilation, but this is a secondary/speculative pathway, not a direct production loss channel analogous to solar smoke soiling.

**PSPS shutoff** does affect wind farm revenue. During California PSPS events, wind farms connected to de-energized circuits cannot export power. This is modeled separately as grid unavailability, not physical damage.

---

## 3. Hazard Physics & Dual-Channel Loss Framework

### 3.1 Physical Damage Mechanism (Channel 1)

A wildfire approaching a wind turbine transfers energy through three mechanisms — with drastically different effects depending on the component's elevation:

**Ground-level components (0–5 m):** Tower base, cable entry conduits, SCADA enclosures, lubricant storage, and site infrastructure face the same heat flux conditions as solar ground-level components. The canonical q = 0.35 × I / d formula applies directly.

**Tower mid-section (5–80 m):** Heat flux decays rapidly with distance from the fire front. For a fire at d = 10 m from the tower base, the view factor geometry limits heat flux to the tower section above flame height to the radiative contribution only — not the direct flame impingement regime.

**Nacelle and blades (80–130 m):** At hub height, for any surface fire, the thermal exposure is dominated by the convective plume temperature at height, not radiant flux from the fire front. Plume temperatures decay steeply with height above the flame zone.

**The causal chain for wildfire × wind:**

```
Fireline Intensity I (kW/m)
    ↓  [q_ground = 0.35 × I / d at z=0; d=10m]
Radiant Heat Flux at Tower Base q (kW/m²)
    ↓  [height attenuation — see Section 4.3]
Heat Flux at Hub Height q_hub (kW/m²)  ← typically <0.5 kW/m² 
    ↓                                     for I < 10,000 kW/m
Material Response by Component
    ↓  [cost-weighted aggregation]
Subsystem Damage Ratio DR (0.0–1.0)
```

### 3.2 Internal Nacelle Fire — The More Relevant Context

The published literature reveals an important inversion: while external wildfire exposure to wind turbines is rarely documented, *internal* nacelle fires are well-studied and serve as critical context for understanding nacelle thermal vulnerability.

Key statistics from the literature:
- **90% of wind turbine fires originate in the nacelle**, per [Exponent (2025)](https://www.exponent.com/article/fire-suppression-systems-wind-turbines)
- **~117 fires per year globally** (estimated true total, accounting for underreporting) based on [Imperial College London / IAFSS analysis cited in Carbon Brief (2014)](https://www.carbonbrief.org/factcheck-how-often-do-wind-turbines-catch-fire-and-does-it-matter/) and [Firetrace International (2019)](https://www.firetrace.com/fire-protection-blog/wind-turbine-fire-statistics)
- **1 in 2,000 turbines** catch fire annually per [DNV GL, cited in DTN Progressive Farmer (2023)](https://www.dtnpf.com/agriculture/web/ag/equipment/article/2023/10/20/common-wind-turbine-fires)
- **90% of nacelle fires result in total turbine loss** — the combination of height, flammable materials, and firefighting inaccessibility makes nacelle fires almost always catastrophic per [Firetrace (2019)](https://www.firetrace.com/fire-protection-blog/wind-turbine-fire-statistics)
- **A database of 478 fire incidents (2000–2024)** was compiled by [Jiménez-Portaz et al., CET Journal 2025](https://www.cetjournal.it/cet/25/116/120.pdf), with ~20 reported fires/year — actual numbers far higher due to ~90% underreporting

This data is used *not* to model external fire damage to wind turbines, but to understand: (1) the thermal conditions that develop once fire enters the nacelle, and (2) the flammability of nacelle materials when exposed to ignition sources.

### 3.3 PSPS Grid Shutoff Channel (Channel 2) — Note Only

Wind farms in California PSPS-affected areas face the same grid de-energization risk as solar farms. This channel is **not modeled in the damage curve** — it is handled as a separate revenue loss/business interruption model.

---

## 4. Intensity Variable Selection & Heat Flux at Height

### 4.1 Intensity Variable: Byram's Fireline Intensity

Consistent with the WILDFIRE_x_SOLAR methodology, all damage curves use **Byram's fireline intensity I (kW/m)** as the Level 2 intensity variable. See the WILDFIRE_x_SOLAR document (Section 3) for full justification. The same causal hierarchy applies.

**Fireline Intensity Reference Range:**

| Fire Type | Typical I (kW/m) | Fire Behavior Context |
|-----------|-----------------|----------------------|
| Low-intensity grass | 10–500 | Zone fires, mowing fire |
| Moderate shrubland | 500–2,000 | Active shrub fire |
| High chaparral/timber | 2,000–10,000 | High-intensity fire |
| Extreme crown fire | 10,000–50,000 | Catastrophic crown/torch |
| Near-maximum observed | 50,000–100,000+ | Rare extreme events |

### 4.2 Ground-Level Heat Flux (Canonical at d = 10 m)

Per the WILDFIRE_x_SOLAR framework, the line source formula:

```
q = 0.35 × I / d   [kW/m²]
```

At d = 10 m canonical distance:

| I (kW/m) | q at z=0, d=10m (kW/m²) | Fire Behavior Context |
|----------|-------------------------|-----------------------|
| 200 | 7 | Very low-intensity grass |
| 500 | 18 | Low-intensity grass/weed |
| 1,000 | 35 | Moderate shrub |
| 2,000 | 70 | High chaparral |
| 5,000 | 175 | Extreme chaparral/timber |
| 10,000 | 350 | Crown fire |
| 50,000 | 1,750 | Extreme/catastrophic |

### 4.3 Height Attenuation — The Critical Wind Turbine Physics

The critical calculation for wind turbine damage modeling is how heat flux (and flame contact potential) changes with height above the ground fire.

**Mechanism 1 — Flame height limit:** The fire cannot directly contact components above its flame height. As shown in Section 2.2, surface fire flame heights rarely exceed 30 m (extreme crown fire), far below the 80–130 m hub height.

**Mechanism 2 — Radiant flux geometric decay:** Radiant heat flux from a finite-height fire front to a target above flame height decays as a function of the view factor geometry. Per [NFPA fire plume analysis and SFPE Handbook](https://nvlpubs.nist.gov/nistpubs/Legacy/IR/nistir6546.pdf), for a target elevated above the flame tip:
- The view factor to the flame drops sharply as target height increases
- At target height = 2× flame height, the view factor is reduced by ~60–70% compared to ground level
- At target height = 5× flame height, the view factor is reduced by >95%
- At target height > flame height, convective heat transfer from the flame is essentially zero

**Mechanism 3 — Plume temperature decay:** Hot combustion gases rising above the flame zone cool rapidly through entrainment of ambient air. Plume temperature at height h above the flame tip follows approximately:

```
ΔT_plume(h) ≈ ΔT_flame × (h_flame / h)^(5/3)   [for buoyant plume above flame tip]
```

This -5/3 power law decay means plume temperatures at 100 m above a 20 m flame are reduced by approximately 99% relative to flame-tip temperatures. The plume thermal exposure at hub height in all but apocalyptic fire scenarios is essentially ambient temperature.

**Summary — Heat flux at hub height vs. ground-level heat flux:**

| I (kW/m) | Flame Height (m) | q at ground (kW/m²) | q at 100 m hub (kW/m²) | Exposure relative to ground |
|----------|-----------------|--------------------|-----------------------|----------------------------|
| 1,000 | ~5–7 | 35 | < 0.1 | < 0.3% |
| 5,000 | ~12–15 | 175 | < 0.5 | < 0.3% |
| 10,000 | ~20–25 | 350 | ~0.5–2 | < 0.6% |
| 50,000 | ~35–50 | 1,750 | ~2–10 | ~0.5% |
| 100,000 | ~50–60 | 3,500 | ~10–30 | ~0.5–1% |

*Note: At I > 50,000 kW/m (extreme crown fire in dense forest), flame height may approach the lowest blade tip of small turbines (tip at ~30 m) but still falls far short of modern hub heights (100+ m). Heat flux estimates at hub height are order-of-magnitude approximations based on view factor geometry and plume temperature decay.*

**Practical conclusion:** For all realistic surface fire scenarios (I < 10,000 kW/m), the thermal exposure at nacelle/blade height is negligible — well below any material ignition threshold. The *only* plausible wildfire damage pathways to elevated components are:
1. **Ember (firebrand) deposition** — hot burning embers lofted by fire plumes can travel >1 km and land on blade surfaces
2. **Catastrophic crown fire engulfment** — I > 50,000 kW/m in dense timber, rare and site-specific
3. **Tower base fire propagating internally upward** — a ground-level fire that enters the tower base and propagates up the internal ladder/cable route to the nacelle

---

## 5. ROTOR_ASSEMBLY × WILDFIRE (BLADE, HUB)

**Subsystem weight in wind capex:** 0.25–0.30  
**Components:** BLADE, HUB, PITCH_SYSTEM  
**Derivation approach:** Expert judgment proxy — physics-based upper bound  
**Confidence:** Very Low  
**Curve ID:** `wildfire/rotor_assembly_wind_proxy`

### 5.1 Physics of Damage

Wind turbine blades at 80–130 m hub height are effectively shielded from the thermal effects of ground fires by elevation. The following analysis examines each potential damage pathway.

**Pathway 1: Direct radiant heat flux from fire front**

As established in Section 4.3, the radiant heat flux at hub height from any realistic surface fire is < 2 kW/m². This is far below the critical heat flux thresholds for composite blade materials:

- **GFRP (glass fiber reinforced polymer) — epoxy/polyester matrix:** Critical heat flux for ignition: 25–50 kW/m² (confirmed for fiberglass composites in cone calorimeter tests per [Polymers, 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC9823742/))
- **CFRP (carbon fiber reinforced polymer):** Glass transition temperature of epoxy matrix ~70–80°C; ignition temperature ~450°C; significant mechanical strength loss at ~300°C (per [Nature Scientific Reports, 2024](https://www.nature.com/articles/s41598-024-74306-7))
- **Blade matrix resins** (epoxy, unsaturated polyester): Pyrolysis onset at 200–300°C; first-stage degradation at 200–300°C with full breakdown above 300°C per [Chen et al., 2025, Wiley Applied Polymer Journal](https://onlinelibrary.wiley.com/doi/10.1002/apj.2938)
- **Glass fiber reinforcement:** Excellent thermal stability; glass fibers cannot be ignited if heat flux < 100–125 kW/m² per [Polymers, 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC9823742/) — this threshold is never approached at hub height from external wildfire

**Conclusion on direct radiant heat:** Zero damage to blades from direct wildfire radiant flux for I < 50,000 kW/m. Damage approaching ~5–10% conceivable for I > 100,000 kW/m catastrophic crown fire scenarios where flame contact with the lowest blade tip is theoretically possible on older small turbines.

**Pathway 2: Ember (firebrand) deposition on blade surfaces**

This is the primary credible wildfire damage pathway for blades. Wild fires generate firebrands (burning embers) that can be lofted by convective plumes and travel 1–5+ km ahead of the fire front.

- Firebrands can land on blade surfaces during fire approach or post-frontal passage
- Blade surfaces are rotating (during operation) or parked (shutdown triggered by emergency conditions)
- Modern blade surface materials: fiberglass/epoxy laminate, gelcoat/topcoat, leading edge protection (LEP) polyurethane tape or epoxy coatings
- The blade leading edge erosion protection coatings are polyurethane-based per [Covestro (2023)](https://solutions.covestro.com/en/highlights/articles/stories/2023/extend-wind-turbine-blade-durability-with-leading-edge-protection) — polyurethane is combustible (ignition temp ~400°C) but requires sustained flame or hot ember contact, not momentary deposition
- Blade gelcoat (polyester or polyurethane-based) is also combustible but requires sustained heat to ignite
- **The PINFA study (2024)** on [blade fire testing](https://www.pinfa.eu/news/study-on-fire-risks-of-wind-turbine-blades/) found commercial GFRP blades tested as UL 94 NR (non-rated, meaning not fire-resistant), and could deform and disintegrate in fires — but this was from intense close-proximity fire scenarios, not ember deposition
- Ember deposition on a rotating blade: brief contact, then ember falls off or is extinguished by aerodynamic forces — very low ignition probability for sustained fire
- Ember deposition on a parked blade: potential for sustained smoldering contact with blade surface coatings, especially on upper (sun-heated) surfaces

**Pathway 3: Tower base fire propagating internally to hub/blades**

If a ground-level fire enters the tower base and propagates upward through the internal cable routing, it could potentially reach the hub and pitch system electrical connections. This pathway is discussed more fully in Section 7 (TOWER) and Section 6 (NACELLE).

**Pathway 4: Lightning during convective fire weather**

Wildfire weather (high wind, low humidity, thunderstorms) co-occurs with lightning conditions. However, lightning strike fire in blades is categorized as a separate hazard, not wildfire. It is noted here as a compound hazard risk.

### 5.2 Blade Material Thermal Properties

| Material | Composition | Damage Onset Temp | Significant Damage Temp | Failure Temp |
|----------|-------------|------------------|-----------------------|-------------|
| GFRP blade shell | Glass fiber + epoxy/polyester | 200–250°C (matrix) | 300°C | 400–500°C |
| CFRP spar cap | Carbon fiber + epoxy | 70–80°C (Tg, lose strength) | 200–300°C | 450°C (ignition) |
| Blade gelcoat | Polyester/polyurethane | 100–150°C | 200–250°C | 300–400°C |
| Polyurethane LEP coating | Polyurethane | 150–200°C | 250–300°C | ~350–400°C |
| Polyester foam core | PET/PVC foam | 150–200°C | 200–250°C | 300°C |
| Glass fiber reinforcement | E-glass/S-glass | 600°C (softening) | 800°C | 1050°C (melting) |

*Source: [Polymers (2023)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9823742/); [PINFA (2024)](https://www.pinfa.eu/news/study-on-fire-risks-of-wind-turbine-blades/); [ESci. & Technology (2025)](https://pmc.ncbi.nlm.nih.gov/articles/PMC12529953/)*

**Key insight:** Glass fibers themselves are thermally stable to 1,050°C — they do not ignite. The vulnerable component is the **polymer matrix** (epoxy, polyester, polyurethane). However, matrix degradation requires sustained thermal exposure at 200–400°C, achievable only by direct flame contact or very high radiant flux — conditions that do not exist at hub height from surface fires.

### 5.3 Fire Incidents Involving Blades

Documented cases of blade involvement in wind turbine fires are almost exclusively from **internal fire propagation** (nacelle fire spreading to blades) or **lightning-initiated blade fires**, not external wildfire exposure:

- **West Union, NY (2023):** Lightning strike ignited the blade's lightning protection system connection. Burning pieces fell into nacelle, causing total loss. Duration: 150-day outage, ~€2M loss. Per [You et al., Heliyon (2023)](https://pmc.ncbi.nlm.nih.gov/articles/PMC10558912/)
- **Netherlands (2013):** Vestas V66 nacelle fire from electrical short circuit spread to blades. Per [Morgan Legal Group (2025)](https://themorganlegalgroup.com/2025/12/03/wind-turbine-fire-understanding-the-hidden-dangers-and-tragic-consequences/)
- **Klickitat County, WA (2019):** Wind turbine internal malfunction caused nacelle fire, which dropped burning debris into dry grass, igniting a ~500-acre wildfire. This is the inverse of the scenario being modeled — the turbine *caused* a wildfire, not the other way around. Per [KPIC/Seattle Times (2019)](https://kpic.com/news/local/crews-work-to-contain-500-acre-juniper-fire-in-southern-washington)
- **Nolan County, TX (2026):** Wind turbine fire sparked multiple agency wildfire response in Nolan and Taylor counties. Again: turbine → wildfire, not wildfire → turbine damage.
- **East County, CA (2012):** Wind turbine fire caused 367-acre brush fire in Riverside County. Per [East County Magazine](http://www.eastcountymagazine.org/fire-destroyed-4-million-wind-turbine-raises-serious-questions-over-lack-reporting-requirements).

**No documented case was found in the literature of an external approaching wildfire causing blade damage through radiant heat or direct flame contact.** This absence itself is an important data point supporting the "very low damage" curve for ROTOR_ASSEMBLY.

### 5.4 Component Cost Weights Within ROTOR_ASSEMBLY

| Component | Capex Share within Subsystem | Primary Wildfire Exposure |
|-----------|------------------------------|--------------------------|
| Blades (×3) | ~55–65% | Ember ignition (very low prob), tower-base internal fire (very low) |
| Hub | ~15–20% | None from external fire; minor from tower-base internal fire |
| Pitch system (hydraulic) | ~15–25% | None from external fire; flammable hydraulic fluid if internal fire reaches |

### 5.5 Proposed Damage Curve: ROTOR_ASSEMBLY × WILDFIRE

Given the physics analysis, the following characterization is proposed:

**Damage mechanism at each intensity regime:**

| I (kW/m) | Damage Mechanism | Expected DR |
|----------|-----------------|-------------|
| < 5,000 | No direct exposure to blades; zero blade damage | ~0.00 |
| 5,000–20,000 | Extreme fire; possible ember spotting; slight blade surface coating scorching if parked and exposed | 0.00–0.02 |
| 20,000–50,000 | Very extreme/crown fire; flame height may approach lowest blade tip on old turbines; ember density very high; surface coating damage possible | 0.01–0.05 |
| > 50,000 | Catastrophic crown fire; potential direct flame contact with lowest blade tip; possible blade surface ignition with ~10–20% probability, but even then, full blade loss is not certain | 0.02–0.15 |

**Logistic sigmoid parameters (ROTOR_ASSEMBLY × WILDFIRE):**

```
f(I) = L / (1 + exp(-k × (I - x0)))
```

| Parameter | Value | Justification |
|-----------|-------|---------------|
| L | 0.10 | Maximum damage ratio: even in extreme crown fire scenarios, ROTOR_ASSEMBLY loss is capped — turbine will be taken offline, most blade damage is cosmetic unless flame directly engulfs blade |
| k | 0.00008 | Very gentle slope — damage onset begins only at very high intensities |
| x0 | 75,000 | Midpoint: damage reaches L/2 (5%) at catastrophic I=75,000 kW/m (extreme crown fire) |

**10th, 50th, 90th percentile thresholds:**

| Damage Level | DR | Required I (kW/m) |
|-------------|-----|------------------|
| 1% damage | 0.01 | ~20,000 |
| 5% damage (50% of L) | 0.05 | ~75,000 |
| 9% damage (90% of L) | 0.09 | ~130,000 |

**Derivation approach:** Expert judgment proxy. Extremely low confidence. Primarily anchored on physics of heat flux attenuation at height and absence of any documented external wildfire blade damage cases.

**Sensitivity:** L is the dominant parameter. If L = 0.20 (assuming some proportion of catastrophic events could ignite a full blade), the curve would still produce near-zero damage for I < 20,000 kW/m. The choice of L = 0.10 reflects the judgment that complete blade loss from external wildfire requires an extraordinary sequence of events (crown fire + ember ignition + failure of fire detection shutdown system).

---

## 6. NACELLE × WILDFIRE (GEARBOX, GENERATOR, YAW_SYSTEM, COOLING_SYSTEM)

**Subsystem weight in wind capex:** 0.20–0.25  
**Components:** GEARBOX, GENERATOR, YAW_SYSTEM, COOLING_SYSTEM  
**Derivation approach:** Expert judgment proxy — physics-based with internal fire analogy  
**Confidence:** Very Low  
**Curve ID:** `wildfire/nacelle_wind_proxy`

### 6.1 Physics of Damage

The nacelle sits at hub height (80–130 m), exposed to the same negligible thermal flux from ground fires as the blades. However, the nacelle has two additional vulnerabilities not shared by the blades:

**Vulnerability 1: Nacelle ventilation system**

Modern wind turbine nacelles require active ventilation to cool gearbox oil, generator windings, power electronics, and transformer components. This ventilation draws in ambient air — and during a wildfire, this air contains:
- **Hot gases** from the fire plume (however, at hub height, plume temperatures are only mildly elevated above ambient — typically < 50°C above ambient at 100 m height for surface fires)
- **Smoke particulates** (fine carbonaceous aerosols)
- **Flying embers (firebrands)**

The ember ingestion pathway is the most credible. A firebrand entering a nacelle's ventilation system encounters: gearbox oil vapors (~150°C operating temperature), electrical arc-prone switchgear, and polymer insulation. If an ember ignites any of these materials, the result is an internal nacelle fire — with the 90% total loss rate documented for all nacelle fires.

**Vulnerability 2: The tower chimney effect**

Hot air from a ground fire rises convectively up the tower exterior, creating elevated air temperatures at the nacelle air intake. However, as analyzed in Section 4.3, the temperature elevation at 100 m above a ground fire is modest. More concerning is if the tower base fire enters the internal tower structure — the tower's internal ladder-and-cable routing then functions as a **chimney**, drawing hot gases and potentially fire upward toward the nacelle.

The thermodynamics of this effect: if the tower base (0–5 m) is engulfed in fire, the tower interior temperature can rise significantly. Towers are steel tubes — good thermal conductors but with some insulating effect from the enclosed air column. The cable harnesses running up the tower interior become the primary fire propagation pathway if the tower base fire is sustained.

**Vulnerability 3: Nacelle flammable material inventory**

The nacelle is not merely an equipment enclosure — it contains substantial fuel load:

| Material | Quantity (typical 2 MW turbine) | Flash Point | Auto-ignition |
|----------|---------------------------------|-------------|--------------|
| Gearbox oil (mineral) | 200–400 L | 150–200°C | 320–400°C |
| Hydraulic fluid (mineral) | 30–100 L | 150°C | 320°C |
| Transformer oil | 150–400 L | 135–160°C | 320°C |
| Lubricating greases | 20–50 kg | 200°C+ | 250–300°C |
| Composite nacelle housing | GFRP | — | ~300–400°C |

Per [Firetrace International (2020)](https://www.firetrace.com/fire-protection-blog/wind-turbine-fire-protection), an estimated **235 gallons (~890 L) of lubricating oil and other highly combustible liquids** are held within a nacelle. Once any component reaches ignition temperature (achievable at relatively low heat flux with sustained exposure), the nacelle becomes essentially a fuel tank at height.

**Critical insight for wildfire modeling:** The nacelle's internal fire physics are well-documented — the problem is that virtually all nacelle fires are *internally initiated* (electrical fault, lightning, mechanical overheating), not externally initiated by wildfire. The wildfire pathway requires: (1) ember entering ventilation OR (2) tower-base fire propagating up internally. Both require sustained fire at the tower base, not merely elevated heat flux at hub height.

### 6.2 Internal Fire Analogy for Damage Characterization

Since external wildfire → nacelle damage requires an intermediate step (ember ingestion or internal propagation), the damage to the nacelle is **conditional**:

- P(nacelle exposed to external wildfire) × P(ember/propagation ignites nacelle | wildfire at base) × P(total loss | nacelle ignited)

From the literature:
- P(nacelle fire → total loss) ≈ 0.90, per [Firetrace (2019)](https://www.firetrace.com/fire-protection-blog/wind-turbine-fire-statistics)
- P(ember ignites nacelle | extreme fire nearby): estimated very low, ~1–5% — requires ember to enter ventilation AND find ignitable material with no early detection/suppression

If a nacelle ignition occurs (regardless of cause), the damage to NACELLE components is characterized by component vulnerability data from internal fire cases:

| Component | Nacelle Fire Damage | Notes |
|-----------|--------------------|-|
| GEARBOX | Total loss — oil ignition, gear metal distortion | Oil is primary fuel; gear box fails from oil fire |
| GENERATOR | Total loss — winding insulation burns | Polymer windings; high-temperature wire insulation |
| YAW_SYSTEM | 50–80% loss — proximity to fire, but structural steel less vulnerable | Yaw ring bearings and drives degrade; structure survives longer |
| COOLING_SYSTEM | Total loss — polymer cooling channels, fans, heat exchanger | Aluminum fins survive; polymer components fail |

However, this characterization applies to **full nacelle fire scenarios** — the outcome IF external wildfire triggers nacelle ignition. The damage curve for the wildfire hazard must incorporate the low probability of that ignition pathway.

### 6.3 Fire Suppression Systems

Modern nacelles increasingly include fire suppression systems, though these are not universally mandated:

**Detection systems (common):**
- Smoke detectors (ionization/photoelectric) in nacelle interior
- Heat detectors in gearbox and transformer zones
- Arc flash detectors for high-voltage switchgear
- Linear heat detection cables along cable trays

**Suppression systems (optional; some manufacturers standard on larger turbines):**
Per [Vestas Fire Prevention Systems brochure](https://www.vestas.com/content/dam/vestas-com/global/en/brochures/turbine-options/Fire_Prevention_Systems.pdf.coredownload.inline.pdf), Vestas offers:
- Smoke and Heat Detection System (standard, across 2 MW and 4 MW platforms)
- Arc Detection System (high-voltage zones)
- Fire Suppression System (FSS) — available for 4 MW platform and 2 MW in North America — uses electrically activated suppression agent

Per [Exponent (2025)](https://www.exponent.com/article/fire-suppression-systems-wind-turbines): retrofit fire suppression costs $10,000–$30,000 vs. $5M+ replacement cost, making the business case compelling — yet fire suppression systems remain **optional** per NFPA 850.

**Standards landscape:**
- **NFPA 850** (Recommended Practice for Fire Protection for Electric Generating Plants): Recommends (does not mandate) automatic fire protection in nacelle per risk assessment
- **IEC 61400-24** (Wind energy — Lightning protection)
- **EN 50308** (Wind Turbines — Protection): Health and safety requirements
- **CFPA-E Guideline No. 22**: European fire protection recommendation for wind turbines — recommends automatic stationary extinguishing systems
- **Proposed IEC 61400-34** (Fire prevention, protection and evacuation — in development as of 2026 per [LinkedIn/Renewable Safety, 2026](https://www.linkedin.com/posts/renewable_safety_windturbinemanufacturing-operationsandmaintenance-activity-7414998907920752640-S3Tk))

Per [BSEE (2023)](https://www.bsee.gov/sites/bsee.gov/files/2023-08/799aa.pdf) analysis of fire protection for offshore wind, no minimum performance-based design criteria currently exist for wind turbine fire suppression — the framework is performance-based design at the operator's discretion.

### 6.4 Proposed Damage Curve: NACELLE × WILDFIRE

The damage curve captures the probability-weighted outcome: mostly zero damage (fire does not reach nacelle), with a long tail for extreme scenarios where ember ignition or internal propagation occurs.

**Key threshold analysis:**
- Below I = 3,000 kW/m: fire approaches but ground-level fire is insufficient to drive embers at density/temperature to ignite nacelle ventilation intake at 100 m height → DR ≈ 0.000–0.002
- I = 3,000–10,000 kW/m: moderate-to-high fire; elevated ember production; small probability (~1%) of ember-induced nacelle ignition → DR ≈ 0.00–0.01
- I = 10,000–50,000 kW/m: high fire intensity; significant ember density; tower base exposure intense; risk of tower-base-initiated internal propagation increases; probability of nacelle ignition rises to ~2–5% → DR ≈ 0.01–0.05
- I > 50,000 kW/m: catastrophic crown fire; extreme ember storms; tower base structural exposure; fire-detection system may be overwhelmed; probability of nacelle ignition could reach ~5–15% → DR ≈ 0.05–0.20 (reflecting 10–15% ignition probability × 90% total loss)

**Logistic sigmoid parameters (NACELLE × WILDFIRE):**

| Parameter | Value | Justification |
|-----------|-------|---------------|
| L | 0.15 | Maximum damage ratio: even in catastrophic fire, nacelle ignition probability is bounded by detection/suppression and elevation shielding |
| k | 0.00006 | Very gentle slope — damage is near-zero across realistic fire intensities |
| x0 | 80,000 | Midpoint: damage reaches L/2 (7.5%) only at extreme I = 80,000 kW/m |

**10th, 50th, 90th percentile thresholds:**

| Damage Level | DR | Required I (kW/m) |
|-------------|-----|------------------|
| 1% damage | 0.01 | ~25,000 |
| 7.5% damage (50% of L) | 0.075 | ~80,000 |
| 13.5% damage (90% of L) | 0.135 | ~135,000 |

**Sensitivity note:** L is again the key parameter. If we interpret the problem as "if the nacelle is ignited by wildfire, the damage is total" and multiply L = 1.0 by the probability of ignition, the shape changes but the expected damage at typical intensities remains very low.

---

## 7. TOWER × WILDFIRE (TOWER_SECTION)

**Subsystem weight in wind capex:** 0.12–0.15  
**Components:** TOWER_SECTION (steel tubular sections, internal cables, ladder, platforms)  
**Derivation approach:** Engineering-standard-based + expert judgment  
**Confidence:** Low (slightly better than ROTOR/NACELLE due to structural steel fire performance standards)  
**Curve ID:** `wildfire/tower_wind_proxy`

### 7.1 Physics of Damage — Tower Structure

The wind turbine tower is a tubular steel structure, typically 3–5 m in diameter at the base, tapering to 2–3 m at the nacelle connection. It is the component most directly exposed to wildfire heat flux at ground level.

**Steel thermal performance (Eurocode 3 / EN 1993-1-2):**

Structural steel strength reduction as a function of temperature follows the [EC3 standard reduction factor table](https://www.phd.eng.br/wp-content/uploads/2015/12/en.1993.1.2.2005.pdf):

| Steel Temperature | ky,θ (Yield Strength Reduction Factor) | Notes |
|------------------|----------------------------------------|-------|
| 20°C (ambient) | 1.00 | Full strength |
| 200°C | 1.00 | No reduction |
| 300°C | 1.00 | Onset of reduction (some codes) |
| 400°C | 1.00 (mild steels); ~0.94 (high-strength) | Very minor |
| 500°C | 0.78 | ~22% strength loss |
| 600°C | 0.47 | ~53% strength loss — **critical threshold** |
| 700°C | 0.23 | ~77% strength loss |
| 800°C | 0.11 | ~89% strength loss |
| 900°C | 0.06 | Near collapse |

Per [NIST Technical Note 1681](https://nvlpubs.nist.gov/nistpubs/technicalnotes/nist.tn.1681.pdf): "Structural steel begins to lose its strength and stiffness at temperatures above 300°C and eventually melts at about 1500°C."

**Fire-resistant steel:** Nippon Steel developed fire-resistant structural steel where yield strength at 600°C remains ≥ 2/3 of room-temperature yield strength per [Nippon Steel Technical Report, 2004](https://www.nipponsteel.com/en/tech/report/nsc/pdf/n9010.pdf). Wind turbine towers typically use standard S355 or similar structural steel — not fire-resistant grade.

**Tower base heat flux during wildfire:**

The tower base (z = 0–5 m) is exposed to the full ground-level heat flux. For a fire at d = 10 m from the tower base:

| I (kW/m) | q at z=0 (kW/m²) | Tower Base Steel Temp (5-min exposure) | Structural Impact |
|----------|-----------------|---------------------------------------|------------------|
| 500 | 18 | ~150–200°C | None |
| 1,000 | 35 | ~250–350°C | Minor coating damage |
| 2,000 | 70 | ~400–500°C | Significant coating damage; 0–20% strength loss |
| 5,000 | 175 | ~600–800°C | 50–90% strength loss — **structural risk** |
| 10,000 | 350 | ~800–1,000°C+ | Severe structural damage — risk of tower base failure |

*Temperature estimates based on standard fire heating calculations for unprotected steel sections with typical section factor (Hp/A ≈ 100 m⁻¹ for tubular tower base). References: [Steel Construction Institute SCI P375](https://www.steelconstruction.info/images/5/5e/SCI_P375.pdf); EC3 EN 1993-1-2.*

**Critical observation:** At I ≈ 5,000–10,000 kW/m (high-intensity fire with fire front at d = 10 m from tower), the tower base steel can reach temperatures that cause meaningful structural strength reduction. However:
1. Fire residence time at a single location is typically 30–120 seconds for a fast-moving front — less than the minutes required to heat a massive steel section
2. The tower wall is 20–60 mm thick at the base — a thermal mass that significantly delays heating
3. The operating load on the tower (primarily compressive from turbine weight + bending from wind) is a fraction of design capacity — substantial strength reserve exists

**Tower paint and protective coatings:**

Wind turbine towers receive multiple layers of protective coatings:
- Primer (zinc-rich epoxy, ~75 μm)
- Mid-coat (epoxy, ~75–125 μm)
- Topcoat (polyurethane or epoxy, ~50–75 μm)

These coatings fail at 200–300°C, exposing bare steel to subsequent corrosion. Coating loss is likely the most common form of tower damage from wildfire heat exposure — cosmetically significant and requiring remediation, but not structurally critical in the short term.

**Internal tower fire propagation:**

If the tower base is engulfed in fire for a sustained period (> 5 minutes at q > 50 kW/m²), the following internal components are at risk:
- **Power cables** running vertically inside the tower: cable insulation (XLPE, PVC) degrade at 90–105°C rated operating temperature; sustained fire exposure can melt and ignite cable insulation at 200–400°C
- **Tower base grounding/lightning protection** connections: copper conductors survive, but insulating materials fail
- **Internal ladder and platforms:** steel ladder survives, but composite safety line rails and polymer walkway gratings can melt

The most damaging scenario: ground fire enters the tower base door or cable entry gland, ignites internal cable insulation, and a cable fire propagates upward through the tower to the nacelle — the "chimney effect." This scenario requires a sustained, intense fire at the exact tower base location with access through a poorly sealed penetration.

### 7.2 Tower Geometry and Exposure

**Tower base exposure area:** The tower base diameter is 4–5 m. In a wildfire with a 10 m radiant distance, the entire base perimeter is potentially exposed to heat flux.

**Tower height and heat flux profile:**

Heat flux decreases with height above the ground fire due to:
1. Increasing distance from fire front (assuming fire is at ground level, the geometry changes with height)
2. Above flame height: pure radiative exchange with reduced view factor

Approximate heat flux at tower height z for a fire at d = 10 m:

| Tower Height z | q/q_ground (relative heat flux) | Notes |
|---------------|--------------------------------|-------|
| 0–5 m | 1.00 | Full ground-level exposure |
| 5–10 m | 0.80 | Still within flame zone for moderate fires |
| 10–20 m | 0.40–0.60 | Reduced view factor |
| 20–50 m | 0.05–0.20 | Primarily radiative; plume-dominated |
| 50–100 m | < 0.05 | Essentially negligible |
| > 100 m (hub) | < 0.01 | Thermally isolated from ground fire |

### 7.3 Foundation Concrete

Wind turbine foundations are massive concrete structures (typically 15–25 m diameter, 3–5 m deep). The foundation is mostly underground and thus shielded from direct heat exposure. The only exposed portion is the concrete pedestal above grade (0–2 m height).

**Concrete thermal damage thresholds:**

Per [Materials (2019)](https://pmc.ncbi.nlm.nih.gov/articles/PMC6926545/) and [Structure Magazine (2019)](https://www.structuremag.org/article/engineering-evaluation-of-fire-damage-to-concrete-foundations/):

| Temperature | Concrete Condition | Structural Impact |
|-------------|-------------------|------------------|
| < 260°C (500°F) | No significant damage | Intact |
| 260–300°C | Pore water vaporization; surface spalling risk | Minor |
| 300–350°C | Spalling onset (especially high-strength concrete); first thermal cracking | Moderate surface damage |
| 300–570°F (150–300°C) | No color change | — |
| 300–570°C | Color change to pink; chemical change in aggregates | Moderate damage |
| 570–750°C | Pink/red coloration; significant strength loss | Severe damage |
| > 750°C | Light gray/yellowish; approaching 50%+ strength loss | Critical |

**Real-world case:** [Barr Engineering (2025)](https://www.barr.com/project/evaluation-of-wind-turbine-foundation-following-fire-damage/) documented evaluation of a wind turbine foundation at a New Mexico wind farm after a **transformer fire** (ground-level): 
- Outer surface suffered thermal cracking
- Petrographic analysis found no chemical change to the concrete
- Steel anchor rods could be reused with no reduced performance expected
- Recommendation: cosmetic repairs only

This real-world case (from an internal transformer fire, a far more intense and localized heat source than an approaching wildfire) suggests foundation damage from wildfire is likely cosmetic unless the fire is extremely intense and prolonged.

### 7.4 Cable Entry Points — Most Vulnerable Ground-Level Component

The **cable entry points at the tower base** are the most vulnerable structural component in a wildfire:

- High-voltage power cables (XLPE insulation) and low-voltage control/data cables enter the tower base through sealed conduit penetrations
- Penetration seals are typically PVC/polyurethane foam or intumescent compounds
- External cable runs (from tower to collection system cable trench) are covered in UV-resistant XLPE, which has a critical heat flux for ignition of ~20–30 kW/m²
- At I = 500 kW/m (low-intensity fire at d = 10 m), q = 18 kW/m² — just below ignition threshold for XLPE
- At I = 1,000 kW/m (moderate fire at d = 10 m), q = 35 kW/m² — exceeds ignition threshold for XLPE cable jacketing

Cable damage at the tower base entry can cause:
- Ground fault → turbine shutdown (no permanent damage)
- Cable insulation fire → internal propagation risk
- Cable replacement required (repair, not full tower replacement)

**Cost impact of cable damage alone:** Cable replacement at tower base is typically a minor repair — perhaps 0.5–2% of tower replacement cost.

### 7.5 Proposed Damage Curve: TOWER × WILDFIRE

**Damage mechanism analysis:**

| I (kW/m) | Primary Mechanism | Expected DR |
|----------|------------------|-------------|
| < 300 | No significant exposure | 0.000 |
| 300–1,000 | Paint/coating heat discoloration; cable jacket at threshold | 0.001–0.010 |
| 1,000–3,000 | Coating burn-off; cable insulation damage; minor concrete surface charring | 0.010–0.040 |
| 3,000–7,000 | Steel base section at 400–600°C; significant strength reduction; coating total loss; concrete pedestal surface damage; risk of cable-conduit fire | 0.040–0.120 |
| 7,000–15,000 | Steel base potential permanent deformation; concrete spalling; cable fires possible; tower base may require major repair | 0.120–0.250 |
| > 15,000 | Structural failure risk for tower base section; catastrophic if sustained; potential tower collapse at extended high-intensity exposure | 0.250–0.500 |

**Logistic sigmoid parameters (TOWER × WILDFIRE):**

| Parameter | Value | Justification |
|-----------|-------|---------------|
| L | 0.50 | Maximum damage: even at extreme intensity, a standing steel tower that has not collapsed is partially repairable; L=0.5 represents severe structural damage requiring major repair/partial replacement |
| k | 0.00045 | Moderate slope — damage builds more steeply with intensity than ROTOR/NACELLE because tower base is directly exposed |
| x0 | 6,000 | Midpoint: 25% damage (L/2) at I = 6,000 kW/m — high-intensity fire; at this level, tower base paint total loss, significant steel heating, cable damage |

**10th, 50th, 90th percentile thresholds:**

| Damage Level | DR | Required I (kW/m) |
|-------------|-----|------------------|
| 5% damage | 0.05 | ~2,500 |
| 25% damage (50% of L) | 0.25 | ~6,000 |
| 45% damage (90% of L) | 0.45 | ~9,500 |

**Sensitivity:**
- Distance assumption (d = 10 m canonical) is the dominant uncertainty. At d = 5 m (fire burning directly at tower base), all intensities effectively double, shifting x0 to ~3,000 kW/m
- Fire residence time is a major unknown — fast-moving fire fronts (30–60 second exposure) cause far less damage than slow-moving or stationary burning at the tower base
- Tower section factor (Hp/A): thin-walled sections at the tower top heat faster than the thick-walled base section

---

## 8. Recommended Curve Parameters — Master Table

### 8.1 Summary Curve Parameters

| Subsystem | Curve ID | L | k | x0 | Derivation | Confidence |
|-----------|----------|---|---|-----|-----------|-----------|
| ROTOR_ASSEMBLY × WILDFIRE | `wildfire/rotor_assembly_wind_proxy` | 0.10 | 0.00008 | 75,000 | Expert judgment proxy | Very Low |
| NACELLE × WILDFIRE | `wildfire/nacelle_wind_proxy` | 0.15 | 0.00006 | 80,000 | Expert judgment proxy | Very Low |
| TOWER × WILDFIRE | `wildfire/tower_wind_proxy` | 0.50 | 0.00045 | 6,000 | Physics-based + EJ | Low |

### 8.2 Implied Damage at Reference Fire Intensities

All values are damage ratios (DR) using `f(I) = L / (1 + exp(-k × (I - x0)))`:

| Intensity I (kW/m) | Fire Context | ROTOR_ASSEMBLY DR | NACELLE DR | TOWER DR |
|-------------------|-------------|------------------|-----------|---------|
| 200 | Very low grass | 0.000 | 0.000 | 0.001 |
| 500 | Low grass/weed | 0.000 | 0.000 | 0.002 |
| 1,000 | Moderate shrub | 0.000 | 0.000 | 0.005 |
| 2,000 | High chaparral | 0.000 | 0.000 | 0.013 |
| 5,000 | Extreme chaparral | 0.000 | 0.000 | 0.064 |
| 10,000 | High crown fire | 0.001 | 0.001 | 0.157 |
| 20,000 | Extreme crown fire | 0.002 | 0.001 | 0.310 |
| 50,000 | Catastrophic fire | 0.007 | 0.005 | 0.453 |
| 100,000 | Near-maximum | 0.019 | 0.016 | 0.492 |

### 8.3 Comparison: Wind Turbine vs. Solar Farm Wildfire Vulnerability

| Subsystem | Solar Analog | Solar DR at I=5,000 | Wind DR at I=5,000 | Wind/Solar Ratio |
|-----------|-------------|--------------------|--------------------|-----------------|
| Panel/Rotor | PV_ARRAY | ~0.65–0.75 | ~0.000 | ~0% |
| Electronics/Nacelle | INVERTER_SYSTEM | ~0.55–0.65 | ~0.000 | ~0% |
| Structure/Tower | MOUNTING | ~0.45–0.55 | ~0.064 | ~10% |
| Substation/Infra | SUBSTATION | ~0.30–0.40 | (same as solar) | ~100% |

**The elevation advantage is dramatic.** Wind turbines are approximately 10–50× less vulnerable to wildfire physical damage than solar farms at typical fire intensities. The primary remaining vulnerability is the tower base and ground-level electrical infrastructure — structurally analogous to the solar substation/inverter/cable ground-level exposure.

### 8.4 Comparison to Internal Nacelle Fire Risk

It is worth contextualizing the wildfire damage curve against the internal fire risk that dominates actual turbine losses:

| Fire Type | Annual Rate per Turbine | Expected Damage (if fire) | Annual Expected Loss per Turbine |
|-----------|------------------------|--------------------------|--------------------------------|
| Internal nacelle fire (all causes) | 1 in 2,000 = 0.05% | ~100% of turbine cost | 0.05% of turbine value/year |
| External wildfire damage | Site-specific; <0.01% in most US locations | Very low (< 1% of subsystem cost) | < 0.001% of turbine value/year |

**For most wind farm sites, internal fire risk (from lightning, electrical fault, mechanical failure) is at least 10–50× greater than the wildfire damage risk to the physical turbine.**

---

## 9. Real-World Wildfire Events: Calibration Anchors

### 9.1 Documented Cases Involving Wind Turbines and Wildfires

**Case 1: Klickitat County, Washington (July 2019)**
- A wind turbine malfunction and nacelle fire at the Willow Creek Wind Project area near Bickleton sent burning debris into dry grass below, igniting a ~500-acre wildfire (the "Juniper Fire") per [KPIC/Seattle Times (2019)](https://kpic.com/news/local/crews-work-to-contain-500-acre-juniper-fire-in-southern-washington)
- Approximately 120 firefighters needed to contain the blaze
- **Direction:** Turbine → Wildfire (not Wildfire → Turbine damage)
- **Calibration value:** Confirms that burning debris from elevated nacelles can ignite ground-level vegetation — the reverse direction of the modeled hazard

**Case 2: Riverside County, California (July 2012)**
- Two turbine fires at a California wind farm caused brush fires; one burned 367 acres per [East County Magazine](http://www.eastcountymagazine.org/fire-destroyed-4-million-wind-turbine-raises-serious-questions-over-lack-reporting-requirements)
- **Direction:** Turbine → Wildfire

**Case 3: Cullerin Range Wind Farm, Australia (January 2023)**
- During a heat wave with temperatures >40°C, a Senvion MM82 turbine nacelle caught fire from an electrical fault during maintenance
- The entire 112-turbine, 278.5 MW wind farm was de-energized
- Turbine replacement cost > €2.2M per [You et al., Heliyon 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10558912/)
- **This is an internal fire during extreme heat conditions, not external wildfire** — but illustrates how extreme heat conditions (co-incident with wildfire risk periods) can increase internal fire probability

**Case 4: Nolan County, Texas (February 2026)**
- Wind turbine fire sparked multi-agency wildfire response in Nolan and Taylor counties, based on [social media reports](https://www.facebook.com/NEPANewsLive/posts/photo-of-monday-s-wind-turbine-fire)
- **Direction:** Turbine → Wildfire

**Case 5: West Union, NY (March 2023)**
- Lightning strike ignited blade lightning protection connection; burning pieces fell into nacelle → total turbine loss; 150-day outage; ~€2M loss. Per [You et al., 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10558912/)
- **Direction:** Lightning → Blade fire → Nacelle loss

**Case 6: Piet de Wit Wind Farm, Netherlands (2013)**
- Four technicians inside a Vestas V66 nacelle were caught in nacelle fire from electrical short circuit; two died
- Total turbine loss — 67 m height made firefighting impossible with standard equipment
- **Direction:** Internal electrical fault → Nacelle fire

**Case 7: New Mexico Wind Farm — Foundation Fire Damage**
- Transformer fire at wind turbine base damaged the concrete pedestal
- Barr Engineering evaluation found: outer surface thermal cracking; no chemical change; anchor rods reusable; recommendation: cosmetic repairs and grout replacement. Per [Barr Engineering (2025)](https://www.barr.com/project/evaluation-of-wind-turbine-foundation-following-fire-damage/)
- **Direction:** Internal transformer fire (ground level) → Foundation/tower base exposure
- **Key calibration:** Even a direct, sustained transformer fire at the tower base produced only cosmetic concrete damage with no structural compromise — strongly supporting the low damage curve for tower-base exposure from external wildfire

### 9.2 Absence of Evidence: External Wildfire → Wind Turbine Damage

**A systematic review of the wind turbine incident literature found zero documented cases of an approaching external wildfire directly damaging a turbine's elevated components (nacelle, blades) through heat flux.** This absence of evidence — across a global database of 478+ confirmed fire incidents and thousands of wind turbine operating years in wildfire-prone regions — strongly supports the physics-based finding that elevation effectively shields elevated components from ground fire thermal damage.

The [Caithness Windfarm Information Forum (CWIF)](https://budsoffshoreenergy.com/wp-content/uploads/2026/01/turbine-accident-summary-to-31-december-2025.pdf) database through December 2025 shows 514 fire incidents — and while some occurred in fire-prone geographies, none are attributed to incoming wildfire heat flux.

### 9.3 Calibration Implications

The real-world evidence is entirely consistent with the physics analysis:
- **Wind turbines → wildfires** (turbine internal fire ignites ground vegetation): 5+ documented cases
- **Wildfires → wind turbine damage** (external fire damages turbine): **0 documented cases in published literature**

This asymmetry strongly validates the proposed very-low damage curves for ROTOR_ASSEMBLY and NACELLE, and supports moderately-low damage for TOWER (anchored by the ground-level exposure physics).

---

## 10. Data Gaps & Recommendations

### 10.1 Critical Data Gaps

**Gap 1: No empirical wildfire damage functions for wind turbines exist**
The entire damage curve library for wildfire × wind must be built on proxy adaptation and expert judgment. No peer-reviewed paper, insurance industry report, or government study was identified that provides empirically calibrated damage functions for wind turbines in wildfire exposure. This is the foundational data gap.

**Gap 2: No data on ember (firebrand) ignition probability for blade surfaces**
The ember ignition pathway is theoretically the most credible wildfire damage route for blades. Yet no quantitative data exists on: (a) the density of firebrands reaching 80–130 m height as a function of fireline intensity; (b) the probability that a firebrand landing on a blade ignites the blade composite; (c) the time-to-spread if ignition occurs. All are necessary for a credible probabilistic damage model.

**Gap 3: Thermal mass of wind turbine tower has not been modeled for wildfire exposure**
The tower section factor (Hp/A), fire residence time, and resulting steel temperature rise during a wildfire are not calculated in the published literature. Standard structural fire engineering tools (EC3 thermal analysis) could be applied here but have not been published for the wildfire exposure scenario.

**Gap 4: No quantification of PSPS exposure for wind versus solar**
Wind farms and solar farms in the same region may have different PSPS exposure profiles depending on interconnection voltage level and circuit de-energization patterns.

**Gap 5: No data on tower-base fire propagation pathways**
The "chimney effect" (tower-base fire propagating internally to nacelle) is a credible scenario that appears not to have been studied systematically. The probability and damage consequence of this pathway is unknown.

**Gap 6: Wildfire co-occurrence with extreme heat → internal fire rate increase**
Case 3 (Cullerin Range) suggests that extreme heat conditions co-occurring with wildfire risk periods may increase *internal* nacelle fire rates. No quantitative relationship between ambient temperature, wildfire risk, and internal turbine fire rate has been published.

### 10.2 Recommended Research to Reduce Uncertainty

**Priority 1 (High, near-term):** Contact major wind farm operators (Vestas, Siemens-Gamesa, GE Vernova, Orsted, NextEra) to determine if any proprietary loss event data exists for wildfire-adjacent wind farm events. Even absence of losses is useful calibration data.

**Priority 2 (High, near-term):** Commission laboratory firebrand experiments on turbine blade composite coupons to determine: (a) smoldering ignition probability as function of firebrand mass, temperature, and residence time; (b) flame spread rate if ignition occurs.

**Priority 3 (Medium, 6–12 months):** Apply EC3 thermal analysis to wind turbine tower sections with realistic wildfire exposure time-histories to compute expected steel temperatures and strength reduction as a function of I and fire residence time.

**Priority 4 (Medium):** Survey wind farm insurers (Allianz, Munich Re, Swiss Re, GCube) for any aggregated wildfire-related loss experience data from wind farms. GCube Insurance's "Towering Inferno" report (2018) covers fire risks broadly; a wildfire-specific breakdown would be valuable.

**Priority 5 (Low, long-term):** Field monitoring of tower base temperature during wildfire events passing near turbines — attaching thermocouples to tower bases in fire-prone regions and connecting to SCADA would generate first empirical data.

---

## 11. Sources & References

All sources are categorized by quality tier: **[Peer-reviewed]**, **[Government standard/report]**, **[Industry report]**, **[Expert judgment]**, **[News/incident report]**.

### Primary Sources Cited

1. **Byram, G.M. (1959).** "Combustion of forest fuels." In K.P. Davis (Ed.), *Forest Fire: Control and Use*. McGraw-Hill. Fundamental fireline intensity formula. Cited via: [Pubs CIF-IFC — Graphical Aids for Byram's Fireline Intensity](https://pubs.cif-ifc.org/doi/pdf/10.5558/tfc2012-035). **[Peer-reviewed]**

2. **Jiménez-Portaz et al. (2025).** "Historical Analysis of Wind Turbine Fire Incidents." *CET Journal*, Vol. 116. [https://www.cetjournal.it/cet/25/116/120.pdf](https://www.cetjournal.it/cet/25/116/120.pdf) — 478 incidents 2000–2024. **[Peer-reviewed]**

3. **You, F., Shaik, S., Rokonuzzaman, M., Rahman, K.S., Tan, W.-S. (2023).** "Fire risk assessments and fire protection measures for wind turbines." *Heliyon*, 9(9), e19505. PMC10558912. [https://pmc.ncbi.nlm.nih.gov/articles/PMC10558912/](https://pmc.ncbi.nlm.nih.gov/articles/PMC10558912/) — Comprehensive review of fire causes, case studies, and prevention measures. **[Peer-reviewed]**

4. **PINFA (Phosphorus, Inorganic and Nitrogen Flame Retardants Association) (2024).** "Study on fire risks of wind turbine blades." [https://www.pinfa.eu/news/study-on-fire-risks-of-wind-turbine-blades/](https://www.pinfa.eu/news/study-on-fire-risks-of-wind-turbine-blades/) — Blade fire testing; UL 94 NR rating; flame spread and debris risk. **[Industry report]**

5. **Ngo, T.T. et al. (2023).** "Improvement of Fire Resistance and Mechanical Properties of Glass Fiber Reinforced Polymer Composites." *Polymers*, 15(1). PMC9823742. [https://pmc.ncbi.nlm.nih.gov/articles/PMC9823742/](https://pmc.ncbi.nlm.nih.gov/articles/PMC9823742/) — GFRP thermal and fire properties; critical heat flux data. **[Peer-reviewed]**

6. **Science Direct (2024).** "Temperature-dependent mechanical behaviors of pultruded carbon fiber-reinforced polymer (CFRP) composites for wind turbines." [https://www.sciencedirect.com/science/article/pii/S1359835X26001132](https://www.sciencedirect.com/science/article/pii/S1359835X26001132) — CFRP glass transition temperature and fire performance. **[Peer-reviewed]**

7. **Wu, B. et al. (2017).** "Fire stability of carbon fiber reinforced polymer shells." *Composite Structures*. [https://www.sciencedirect.com/science/article/abs/pii/S0263822317301320](https://www.sciencedirect.com/science/article/abs/pii/S0263822317301320) — FRP rapid strength loss after glass transition temperature. **[Peer-reviewed]**

8. **Zhang, R. et al. (2025).** "Thermal Transformations During Thermal Recovery of End-of-Life Wind Turbine Blades." *Journal of Analytical and Applied Pyrolysis*. [https://www.sciencedirect.com/science/article/abs/pii/S0165237024005345](https://www.sciencedirect.com/science/article/abs/pii/S0165237024005345) — Blade composite pyrolysis temperatures 300–800°C for resin. **[Peer-reviewed]**

9. **Environmental Science & Technology (2025).** "Life Cycle Assessment: Wind Turbine Blades." PMC12529953. [https://pmc.ncbi.nlm.nih.gov/articles/PMC12529953/](https://pmc.ncbi.nlm.nih.gov/articles/PMC12529953/) — Blade composition (85% FRPC; 65–90% glass fiber in industry). **[Peer-reviewed]**

10. **EN 1993-1-2:2005 (Eurocode 3 — Design of Steel Structures, Part 1-2: Fire).** European Committee for Standardization. Full text: [https://www.phd.eng.br/wp-content/uploads/2015/12/en.1993.1.2.2005.pdf](https://www.phd.eng.br/wp-content/uploads/2015/12/en.1993.1.2.2005.pdf) — Steel yield strength reduction factors at elevated temperature (Table 3.1). **[Government standard]**

11. **NIST Technical Note 1681 (2011).** "Best Practice Guidelines for Structural Fire Resistance Design of Concrete and Steel Structures." [https://nvlpubs.nist.gov/nistpubs/technicalnotes/nist.tn.1681.pdf](https://nvlpubs.nist.gov/nistpubs/technicalnotes/nist.tn.1681.pdf) — Steel thermal properties and strength reduction as a function of temperature. **[Government report]**

12. **NIST Technical Note 1907.** "Temperature-Dependent Material Modeling for Structural Steels." [https://nvlpubs.nist.gov/nistpubs/TechnicalNotes/NIST.TN.1907.pdf](https://nvlpubs.nist.gov/nistpubs/TechnicalNotes/NIST.TN.1907.pdf) — EC3 yield strength data; fire-resistive vs. ordinary steel comparison. **[Government report]**

13. **Park, J.H. et al. (2019).** "Estimation of Heating Temperature for Fire-Damaged Concrete." *Materials*, 12(24). PMC6926545. [https://pmc.ncbi.nlm.nih.gov/articles/PMC6926545/](https://pmc.ncbi.nlm.nih.gov/articles/PMC6926545/) — Concrete spalling at 250–350°C; discoloration table for damage assessment. **[Peer-reviewed]**

14. **EDT Engineers (2019).** "Fire Effects on Concrete." [https://www.edtengineers.com/blog-post/fire-effects-concrete](https://www.edtengineers.com/blog-post/fire-effects-concrete) — Rebar brittleness at 260°C; strength loss thresholds. **[Industry report]**

15. **Structure Magazine (2019).** "Engineering Evaluation of Fire Damage to Concrete Foundations." [https://www.structuremag.org/article/engineering-evaluation-of-fire-damage-to-concrete-foundations/](https://www.structuremag.org/article/engineering-evaluation-of-fire-damage-to-concrete-foundations/) — Colorado wildfire foundation damage: 30–50% strength loss in fire-exposed areas; practical evaluation methodology. **[Industry report]**

16. **Barr Engineering (2025).** "Evaluation of wind-turbine foundation following fire damage." [https://www.barr.com/project/evaluation-of-wind-turbine-foundation-following-fire-damage/](https://www.barr.com/project/evaluation-of-wind-turbine-foundation-following-fire-damage/) — Real-world case: transformer fire at wind farm, minimal foundation damage. **[Industry report]**

17. **Firetrace International (2019).** "The Wind Turbine Fire Problem, By the Numbers." [https://www.firetrace.com/fire-protection-blog/wind-turbine-fire-statistics](https://www.firetrace.com/fire-protection-blog/wind-turbine-fire-statistics) — Fire rate: 1 in 1,710–2,000 turbines/year; 91% underreporting; 90% total loss rate for nacelle fires. **[Industry report]**

18. **Firetrace International (2020).** "Understanding Wind Turbine Fire Protection Options." [https://www.firetrace.com/fire-protection-blog/wind-turbine-fire-protection](https://www.firetrace.com/fire-protection-blog/wind-turbine-fire-protection) — ~235 gallons (~890 L) of combustible liquids in nacelle; suppression system options. **[Industry report]**

19. **Firetrace International (2021).** "Consequences of a Turbine Fire Spreading into the Environment." [https://www.firetrace.com/fire-protection-blog/consequences-of-a-turbine-fire-spreading-into-the-environment](https://www.firetrace.com/fire-protection-blog/consequences-of-a-turbine-fire-spreading-into-the-environment) — July 2020 turbine fire spread 300 acres; 2019 incident; secondary wildfire risk. **[Industry report]**

20. **Carbon Brief (2014).** "Factcheck: How often do wind turbines catch fire? And does it matter?" [https://www.carbonbrief.org/factcheck-how-often-do-wind-turbines-catch-fire-and-does-it-matter/](https://www.carbonbrief.org/factcheck-how-often-do-wind-turbines-catch-fire-and-does-it-matter/) — 11.7 reported fires/year vs. 117 estimated true fires; CWIF data analysis. **[News]**

21. **Caithness Windfarm Information Forum (CWIF) / BudS Offshore Energy (2026).** "Summary of Wind Turbine Accident Data to 31st December 2025." [https://budsoffshoreenergy.com/wp-content/uploads/2026/01/turbine-accident-summary-to-31-december-2025.pdf](https://budsoffshoreenergy.com/wp-content/uploads/2026/01/turbine-accident-summary-to-31-december-2025.pdf) — Comprehensive accident database: 6,579 total accidents; 514 fire incidents. **[Industry report]**

22. **Exponent (2025).** "Fire Suppression Systems in Wind Turbines." Timothy Morse, Ph.D., P.E., CFEI. [https://www.exponent.com/article/fire-suppression-systems-wind-turbines](https://www.exponent.com/article/fire-suppression-systems-wind-turbines) — 90% of fires start in nacelle; retrofit cost $10K–$30K; NFPA 850 guidance. **[Industry report]**

23. **Vestas Wind Systems (2017).** "Fire Prevention Systems" brochure. [https://www.vestas.com/content/dam/vestas-com/global/en/brochures/turbine-options/Fire_Prevention_Systems.pdf](https://www.vestas.com/content/dam/vestas-com/global/en/brochures/turbine-options/Fire_Prevention_Systems.pdf) — OEM fire detection and suppression systems for 2 MW and 4 MW platforms. **[Industry report]**

24. **BSEE — Bureau of Safety and Environmental Enforcement (2023).** "Renewable Energy Fire Protection Systems." [https://www.bsee.gov/sites/bsee.gov/files/2023-08/799aa.pdf](https://www.bsee.gov/sites/bsee.gov/files/2023-08/799aa.pdf) — NFPA 850 guidance; CFPA-E No. 22; performance-based design framework. **[Government report]**

25. **Morgan Legal Group (2025).** "Wind Turbine Fire: Understanding the Hidden Dangers." [https://themorganlegalgroup.com/2025/12/03/wind-turbine-fire-understanding-the-hidden-dangers-and-tragic-consequences/](https://themorganlegalgroup.com/2025/12/03/wind-turbine-fire-understanding-the-hidden-dangers-and-tragic-consequences/) — Fire statistics summary; total loss rates; the 2013 Netherlands fatality case. **[News/legal]**

26. **KPIC / Seattle Times (2019).** "500-acre Juniper Fire in S. Washington sparked by wind turbine." [https://kpic.com/news/local/crews-work-to-contain-500-acre-juniper-fire-in-southern-washington](https://kpic.com/news/local/crews-work-to-contain-500-acre-juniper-fire-in-southern-washington) — Klickitat County turbine-started wildfire. **[News]**

27. **DTN Progressive Farmer (2023).** "How Common Are Wind Turbine Fires?" [https://www.dtnpf.com/agriculture/web/ag/equipment/article/2023/10/20/common-wind-turbine-fires](https://www.dtnpf.com/agriculture/web/ag/equipment/article/2023/10/20/common-wind-turbine-fires) — DNV GL estimate: 1 in 2,000 turbines/year; typical wind farm with 150 turbines: 1–2 fires in 20 years. **[News/industry]**

28. **U.S. Department of Energy (2024).** "Wind Turbines: The Bigger, the Better." [https://www.energy.gov/cmei/articles/wind-turbines-bigger-better](https://www.energy.gov/cmei/articles/wind-turbines-bigger-better) — Hub height: average 103.4 m in 2023; 83% increase since 1998–1999. **[Government report]**

29. **NREL Annual Technology Baseline (ATB) 2021.** "Land-Based Wind." [https://atb.nrel.gov/electricity/2021/land-based_wind](https://atb.nrel.gov/electricity/2021/land-based_wind) — Representative turbine: 175 m rotor, 120 m hub height. **[Government report]**

30. **Nippon Steel (2004).** "590 MPa Class Fire-Resistant Steel for Building Structural Use." Technical Report No. 90. [https://www.nipponsteel.com/en/tech/report/nsc/pdf/n9010.pdf](https://www.nipponsteel.com/en/tech/report/nsc/pdf/n9010.pdf) — Yield strength at 600°C ≥ 2/3 of room-temperature for fire-resistant steel. **[Industry report]**

31. **NWCG (National Wildfire Coordinating Group).** "Crown Fire: Spotting Fire Behavior." [http://www.nwcg.gov/publications/pms437/crown-fire/spotting-fire-behavior](http://www.nwcg.gov/publications/pms437/crown-fire/spotting-fire-behavior) — Crown fire flame heights; firebrand production. **[Government report]**

32. **Science Direct (2025).** "Thresholds of surface fire transition to crown fire: Effects of wind." *Fire Safety Journal*. [https://www.sciencedirect.com/science/article/pii/S0379711225002097](https://www.sciencedirect.com/science/article/pii/S0379711225002097) — Crown fire flame heights 30–60 m; I > 10,000–50,000 kW/m for crown fire transition. **[Peer-reviewed]**

33. **Zhang, Q. et al. (2024).** "Applicability analysis of flame height estimation based on Byram's fireline intensity model." *Nature Scientific Reports*, 14, 4504. [https://www.nature.com/articles/s41598-024-55132-3](https://www.nature.com/articles/s41598-024-55132-3) — Flame height equations; L = 0.0775 × I^0.46 validation. **[Peer-reviewed]**

34. **Li, A. et al. (2022).** "Plume ceiling height scaling analysis." *Journal of Geophysical Research: Atmospheres*. [https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2020JD033085](https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2020JD033085) — Plume rise and injection height data; scaling with fire intensity. **[Peer-reviewed]**

35. **NIST IR 6546 (2000).** "Thermal Radiation from Large Pool Fires." [https://nvlpubs.nist.gov/nistpubs/Legacy/IR/nistir6546.pdf](https://nvlpubs.nist.gov/nistpubs/Legacy/IR/nistir6546.pdf) — View factor calculations for fires; radiant heat flux at elevation. **[Government report]**

36. **PDH Online — "Estimating Fire Flame Height and Radiant Heat Flux"** (CE PDH Course). [https://pdhonline.com/courses/m312/Radiant%20Flux.pdf](https://pdhonline.com/courses/m312/Radiant%20Flux.pdf) — Solid flame radiation model; view factor for targets at elevation. **[Industry training material]**

37. **East County Magazine (2012).** "Fire That Destroyed $4 Million Wind Turbine Raises Serious Questions." [http://www.eastcountymagazine.org/fire-destroyed-4-million-wind-turbine-raises-serious-questions-over-lack-reporting-requirements](http://www.eastcountymagazine.org/fire-destroyed-4-million-wind-turbine-raises-serious-questions-over-lack-reporting-requirements) — 2012 California turbine fires igniting brush fires; reporting deficiencies. **[News]**

38. **Covestro (2023).** "Extend Wind Turbine Blade Durability with Leading Edge Protection." [https://solutions.covestro.com/en/highlights/articles/stories/2023/extend-wind-turbine-blade-durability-with-leading-edge-protection](https://solutions.covestro.com/en/highlights/articles/stories/2023/extend-wind-turbine-blade-durability-with-leading-edge-protection) — Polyurethane LEP coatings; thermal stability properties. **[Industry report]**

39. **LinkedIn/Renewable Safety (2026).** "IEC Proposes New Fire Safety Standard for Wind Turbines." [https://www.linkedin.com/posts/renewable_safety_windturbinemanufacturing-operationsandmaintenance-activity-7414998907920752640-S3Tk](https://www.linkedin.com/posts/renewable_safety_windturbinemanufacturing-operationsandmaintenance-activity-7414998907920752640-S3Tk) — Proposed IEC 61400-34 (Part 34: Fire prevention, protection and evacuation). **[Industry news]**

---

*Document prepared for InfraSure Damage Curve Library, March 2026. All damage curves carry **Very Low to Low confidence** ratings and should be treated as engineering judgment proxies until validated against empirical loss data. Peer review by a structural fire engineer and a wildland fire behavior specialist is recommended before production deployment.*
