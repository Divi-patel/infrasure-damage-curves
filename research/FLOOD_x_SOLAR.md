# RIVERINE FLOOD × Solar Subsystems: Deep Research for Damage Curve Derivation

**InfraSure Damage Curve Library — Research Memorandum**
**Hazard:** RIVERINE_FLOOD
**Technology:** Solar PV (Ground-Mounted, Utility-Scale)
**Intensity Variable:** Flood depth (ft) above ground level at asset centroid
**Curve Form:** Logistic sigmoid — `f(x) = L / (1 + exp(-k * (x − x0)))`
**Date:** March 2026
**Status:** Gen-1 Research Draft

---

## Table of Contents

1. [Critical Framework: Depth-Above-Ground vs. Depth-Above-Component](#1-critical-framework)
2. [PV_ARRAY × RIVERINE_FLOOD](#2-pv_array--riverine_flood)
3. [INVERTER_SYSTEM × RIVERINE_FLOOD](#3-inverter_system--riverine_flood)
4. [SUBSTATION × RIVERINE_FLOOD](#4-substation--riverine_flood)
5. [ELECTRICAL × RIVERINE_FLOOD](#5-electrical--riverine_flood)
6. [CIVIL_INFRA × RIVERINE_FLOOD](#6-civil_infra--riverine_flood)
7. [Cross-Cutting: Depth-vs-Duration Problem](#7-depth-vs-duration-problem)
8. [Recommended Curve Parameters Summary](#8-recommended-curve-parameters-summary)
9. [Data Gaps and Recommendations](#9-data-gaps-and-recommendations)
10. [Full Bibliography](#10-full-bibliography)

---

## 1. Critical Framework: Depth-Above-Ground vs. Depth-Above-Component

### 1.1 The Core Problem

The most important conceptual issue in riverine flood × solar damage modeling is that the **x-axis of all damage curves (flood depth above ground level)** is not the same as the **effective flood depth experienced by any given component**. Components within a solar farm are installed at widely varying heights above grade, creating a systematic mismatch between the site-level hazard metric and the component-level stress.

This is analogous to the HAZUS flood model's treatment of **first floor elevation (FFE)** and **damage initiation point (DIP)** for buildings — the damage does not begin when water reaches grade; it begins when water reaches the bottom of the component. For solar assets, this translates directly to component elevation above grade.

### 1.2 Component Elevation Inventory

| Component | Typical Height Above Grade | Range | Notes |
|---|---|---|---|
| PV module (fixed-tilt, lowest edge) | 18 in (1.5 ft) | 12–36 in (1–3 ft) | Set by vegetation control + snow clearance |
| PV module (fixed-tilt, center/pivot) | 24–36 in (2–3 ft) | 18–48 in (1.5–4 ft) | Depends on tilt angle |
| PV module (tracker, horizontal stow) | 24–36 in (2–3 ft) | 18–48 in (1.5–4 ft) | Horizontal = lowest position |
| PV module (tracker, flood/wind stow) | 72–120 in (6–10 ft) | 60–144 in (5–12 ft) | Rotated vertical = maximum height |
| String inverter (pad-mounted) | 0–6 in (0–0.5 ft) | 0–12 in (0–1 ft) | Directly on concrete pad at grade |
| Central/utility inverter (in enclosure) | 6–18 in (0.5–1.5 ft) | 3–24 in (0.25–2 ft) | Often elevated on concrete housekeeping pad |
| Combiner box (field) | 18–48 in (1.5–4 ft) | 12–60 in (1–5 ft) | Post-mounted or wall-mounted |
| Substation switchgear (outdoor) | 36 in (3 ft) | 24–48 in (2–4 ft) | FEMA assumes 3 ft above grade as standard |
| Substation transformer (oil-filled) | 0–6 in (0–0.5 ft) | 0–12 in (0–1 ft) | Essentially at grade on pads |
| Underground cable (collection) | −12 to −36 in (−1 to −3 ft) | −6 to −60 in | Below grade by NEC/IEC requirement |
| Above-grade cable tray | +18 to +48 in (+1.5 to +4 ft) | +12 to +96 in | Varies by tray support design |
| O&M Building (first floor slab) | 0–12 in (0–1 ft) | 0–24 in (0–2 ft) | Typically slab-on-grade |
| Site access road (surface) | 0–6 in above surrounding grade | — | Variable; often at grade |

*Sources: DoD UFGS 26 31 00 specifies 3 ft (1 m) minimum under-array clearance; FEMA HAZUS assumes switchgear at 3 ft (0.91 m) above grade; HeatSpring/Solar Builder industry practice surveys.*

### 1.3 Proposed Methodology: Effective Depth Transform

**For Gen-1 modeling**, we recommend a **component elevation offset** approach, transforming flood depth above ground (the hazard metric `h_ground`) to effective depth at the component (`h_eff`):

```
h_eff = h_ground − z_component
```

Where `z_component` is the height of the component's critical sensitive elements above grade (in same units).

**Damage is zero for all h_eff ≤ 0** (flood has not reached the component).
**Damage begins when h_eff > 0** (flood water touches the component).

This transform means:
- A 2 ft flood (`h_ground = 2 ft`) causes **zero damage to panels at 3 ft elevation** (h_eff = 2 − 3 = −1 ft < 0)
- The same 2 ft flood causes **significant damage to a pad-mounted inverter at 0.5 ft** (h_eff = 2 − 0.5 = +1.5 ft)
- The same flood causes **full submersion damage to underground cables** (h_eff = 2 − (−1.5) = +3.5 ft below cable, meaning cables are fully within saturated zone)

**Implementation in logistic curve:** The x0 parameter (midpoint) of each subsystem's curve should be set equal to `z_component + (midpoint depth above component)`. Alternatively, the curve can be stated with x-axis = `h_eff` (depth above component) and a pre-processing step converts `h_ground` to `h_eff` for each component using site-specific or default elevation offsets.

**Recommendation:** Express all curves with **x-axis = flood depth above grade** and **embed the elevation offset into x0**. This allows direct hazard map application while transparently encoding the physics.

### 1.4 Tracker Stow Position: The Flood-Protection Dimension

Single-axis trackers (SAT) can actively mitigate flood exposure. When stowed in a near-vertical "flood stow" position (typically 75–85° from horizontal), the lowest module edge rises from ~2 ft to potentially 6–10 ft above grade, depending on post height.

| Tracker State | Lowest Module Edge (typical, ft) | Flood Depth for Module Contact |
|---|---|---|
| Horizontal (tracking) | 1.5–2 ft | >1.5 ft flood reaches panels |
| Standard stow (45°) | 2.5–3.5 ft | >2.5 ft flood reaches panels |
| Flood/wind stow (75–85°) | 5–9 ft | >5 ft flood required to reach panels |

**Key implication:** At sites with SAT and automated flood stow protocols (triggered by USGS gage alerts or on-site flood sensors), the effective damage threshold for PV modules can be raised by 3–6 ft relative to fixed-tilt or horizontal-stow conditions. This is not captured in standard depth-damage functions and represents a **significant source of heterogeneity** in portfolio modeling.

---

## 2. PV_ARRAY × RIVERINE_FLOOD

**Target Component:** PV_MODULE
**Curve ID:** `riverine_flood/pv_module_generic`
**Intensity Variable:** Flood depth, ft above grade (convert to effective depth via elevation offset)

### 2.1 Physics of Damage

#### 2.1.1 Primary Failure Pathway: Water Ingress and Electrical Isolation Failure

When flood water rises above the bottom edge of PV modules, the dominant failure mechanism is **moisture ingress through the junction box and cable entry points**, leading to insulation resistance (IR) degradation:

1. **Hydrostatic pressure on seals:** IP-rated junction boxes (typically IP67 or IP68) are designed to resist temporary immersion. However, IP67 certification only guarantees protection to 1 meter depth for 30 minutes. IP68 certification extends this to manufacturer-specified depths/durations (often stated as 1–3 m for extended periods). Riverine flooding can easily exceed these parameters in both depth and duration.

2. **Insulation resistance degradation:** Water diffuses through the encapsulant/backsheet/junction box seals into the module laminate. Moisture contact with the cell metallization and interconnects creates conductive paths, reducing insulation resistance from typical new-module values of ≥150 MΩ to below the IEC 61646 minimum of 40 MΩ.

3. **Ground fault formation:** Once IR drops below the inverter's ground fault detection threshold (typically 10–40 kΩ for string inverters), the inverter trips. This is a **functional loss** (revenue loss) even without physical damage.

4. **Long-term corrosion:** Post-flood, residual moisture within the module laminate accelerates electrochemical corrosion of cell metallization (silver fingers, busbars), solder joints, and frame-to-glass seals. This creates a continuing degradation trajectory even after apparent recovery.

5. **Saltwater amplification:** Saltwater is dramatically more damaging than freshwater due to:
   - Higher ionic conductivity creating stronger galvanic cells
   - Chloride ion attack on aluminum frames and steel fasteners
   - Salt crystallization within module laminates after water evaporates, creating stress cracks
   - IEC 61701 (salt mist corrosion) resistance is NOT equivalent to flood immersion resistance

#### 2.1.2 Secondary Failure Pathways

- **Debris impact:** Flowing flood water carries debris (logs, equipment, vegetation) that can physically break glass and fracture cells
- **Structural scour at pile foundations:** Foundation erosion undermines support structures, causing array collapse (covered in Section 6)
- **Arc fault risk:** Ground faults in wet conditions can escalate to arc faults, creating fire risk during or after flood
- **Freeze-thaw post-flood:** In cold climates, moisture retained within modules after flood exposure undergoes freeze-thaw cycling, accelerating delamination

#### 2.1.3 Empirical Evidence from Field Events

The [Thailand PV Flood Case Study (Ketjoy et al., 2022)](https://doi.org/10.1371/journal.pone.0274839) provides the most quantitative field evidence to date:
- **Plant:** 15,792 thin-film modules (165 Wp each) in central Thailand; flooded during monsoon season
- **Result:** 66% of sampled modules (716 tested) showed moisture ingress sufficient to fail IEC 61646 wet insulation resistance minimum (40 MΩ)
- **IR degradation:** Average drop to ~39 MΩ (wet) from new-module baseline of >150 MΩ — approximately 74% IR reduction
- **No visual damage** was apparent on flooded modules; failure was entirely electrical/performance-based
- **Implication:** After submersion, ~2/3 of panels had insulation resistance low enough to trigger inverter trips, effectively causing complete system shutdown even though panels appeared physically intact

The [PV Magazine / pv-magazine-usa.com flood risk analysis (2023)](https://pv-magazine-usa.com/2023/06/22/climate-change-and-solar-project-flood-risk/) notes that "partial or full submersion of modules or electrical equipment likely results in total loss" — consistent with DOE FEMP guidance.

[DOE FEMP (2025)](https://www.energy.gov/femp/preventing-and-mitigating-flood-damage-solar-photovoltaic-systems) states explicitly: **"If the modules and electrical equipment become submerged (even if only partially) then the system is likely a total loss."**

### 2.2 Intensity Variable and Measurement

**Primary variable:** Flood depth above grade (ft), measured at array field centroid.

**Effective depth at panel:** `h_eff_panel = h_ground − z_panel_bottom`

Where `z_panel_bottom` is the height of the lowest panel edge above grade (default: 1.5 ft for fixed-tilt; 2.0 ft for horizontal SAT; configurable).

**Rationale:** The causal relationship is: flood water contacts panel → moisture ingress → IR degradation → damage. Contact requires `h_ground > z_panel_bottom`. Damage intensity is governed by the depth and duration of submersion above the panel, not above grade.

**Units:** Feet (consistent with HAZUS convention for US applications; convert to meters for international use: 1 ft = 0.305 m)

### 2.3 Engineering Standards and Thresholds

| Standard | Relevance | Key Parameter |
|---|---|---|
| IEC 60529 (IP rating) | IP67: 1 m depth, 30 min. IP68: manufacturer-specified deeper/longer | Seal failure threshold |
| IEC 61215:2021 | Damp heat test: 85°C/85%RH for 1,000 hrs; Humidity Freeze test | Accelerated moisture aging, NOT submersion test |
| IEC 61646 | Wet insulation resistance minimum: 40 MΩ·m² | Field failure threshold for thin-film |
| IEC 61701 | Salt mist corrosion; 6 categories of severity | Saltwater flood proxy |
| DoD UFGS 26 31 00 | Minimum 1 m (3 ft) ground clearance under arrays | Elevation specification |
| FEMA/FEMP guidance | Elevate arrays above 100-yr Base Flood Elevation (BFE) | Design recommendation |

**Critical note on IEC 61215 damp heat:** The 1,000-hour test at 85°C/85% RH simulates long-term humidity aging but is NOT equivalent to panel submersion. [Ketjoy et al. (2022)](https://doi.org/10.1371/journal.pone.0274839) and [simulation work by Schubert et al. (Science Direct, 2015)](https://www.sciencedirect.com/science/article/abs/pii/S0038092X1500122X) confirm that actual submersion causes moisture ingress at rates far exceeding damp heat test conditions.

### 2.4 Component-Level Breakdown

| Component | Flood Vulnerability | Failure Threshold | Cost Weight (within PV_ARRAY) |
|---|---|---|---|
| Glass/anti-reflective coating | Very Low | Requires physical impact from debris | ~10% |
| PV cells (silicon) | Low-Moderate (indirect) | Damaged through moisture reaching metallization | ~30% |
| Cell metallization/interconnects | High | Electrochemical corrosion from moisture contact | ~15% |
| EVA/POE encapsulant | Moderate | Hydrolysis over extended exposure; moisture pathway | ~10% |
| Backsheet | Moderate | Hydrolysis reduces dielectric strength; seam failure | ~10% |
| Junction box and MC4 connectors | High | Primary moisture entry point; seal degradation under hydrostatic pressure | ~10% |
| Aluminum frame/mounting hardware | Moderate (saltwater: High) | Galvanic corrosion with steel mounting | ~15% |

**Aggregated PV_ARRAY damage** is thus dominated by electrical failure (insulation resistance) with physical damage being secondary except in high-velocity flows with significant debris.

### 2.5 Existing Damage Functions in Literature

**HAZUS (FEMA):** No PV-specific curves exist. The closest proxies are:
- Commercial/industrial building contents damage functions (reaching ~90% damage at 5 ft above first floor elevation)
- Utility facility functions, which are largely judgmental

**JRC Global Flood Depth-Damage Functions (Huizinga et al., 2017):** The "Industry" category is the most relevant proxy:
- North America: 0.31 at 0.5 m; 0.48 at 1 m; 0.71 at 2 m; 0.84 at 3 m; 0.93 at 4 m; 1.0 at 6 m
- These represent mixed industrial buildings — solar panels are far more electrically sensitive, suggesting the real PV function should be **steeper** (damage onset more rapid once water contacts the panel)

**Indonesia Solar Plant Climate Risk Stress Test (Pasha et al., 2025):** Applied Huizinga et al. (2017) "Industry" function to solar panels as proxy (treating solar farm as industrial), but explicitly notes this as a simplification.

**Shiradkar et al. (Semantic Scholar):** Referenced in the Thailand flooding context regarding reliability and safety issues in flood-affected PV plants; confirms the operational-shutdown-before-physical-damage dynamic.

**PV Systems Under Weather Extremes (Science Direct, 2024):** Documents monsoon/flood impacts on Asian PV farms; shows systems near waterways experience disproportionate damage.

**No RE-specific, empirically calibrated depth-damage curve for PV modules has been published as of early 2026.** All available functions are proxies or qualitative descriptions.

### 2.6 Depth-Above-Component Behavior and Proposed Curve Zones

Based on physics and field evidence, three damage zones emerge:

| Zone | h_ground relative to z_panel_bottom | h_eff_panel | Damage Level | Mechanism |
|---|---|---|---|---|
| **Zone 0: No contact** | h_ground < z_panel_bottom | < 0 ft | 0% | Flood has not reached panels |
| **Zone 1: Partial contact** | z_panel_bottom ≤ h_ground ≤ z_panel_bottom + 0.5 ft | 0–0.5 ft | 5–30% | Junction box seal stress; lower module edge wetted; connector degradation |
| **Zone 2: Full panel submersion** | h_ground > z_panel_bottom + panel_height | > ~6 ft (for typical panel height) | 50–95% | Full submersion; IR degradation; structural potential |
| **Zone 3: Extended submersion** | Days to weeks submerged | — | 75–100% | Corrosion, delamination; practical total loss |

### 2.7 Recommended Logistic Curve Parameters

**Curve x-axis:** h_eff_panel = flood depth above panel bottom edge (ft)
**Transform from h_ground:** h_eff_panel = h_ground − z_panel_bottom (default z = 1.5 ft fixed-tilt, 2.0 ft SAT horizontal)

| Parameter | Value | Justification |
|---|---|---|
| **L** (max damage ratio) | **0.90** | Not 1.0: after flooding, approximately 10% of panels recover IR after thorough drying; reflects ~10% residual value in otherwise-degraded array. Some fraction of panels in any event may remain above water. |
| **k** (steepness) | **1.8** | Steep curve reflecting rapid damage onset once water contacts panels; reflects near-binary behavior from Thailand empirical data (66% failure rate after any submersion) but with some gradation |
| **x0** (midpoint, in h_eff terms) | **0.5 ft** | Midpoint at 6 inches above panel bottom edge: by this depth, panels are substantially submerged and IR degradation is widespread |

**Logistic equation (with h_eff as x-axis):**
```
DR_pv_module(h_eff) = 0.90 / (1 + exp(-1.8 * (h_eff − 0.5)))
```

**Translated to h_ground (fixed-tilt default, z = 1.5 ft):**
```
DR_pv_module(h_ground) = 0.90 / (1 + exp(-1.8 * ((h_ground − 1.5) − 0.5)))
                        = 0.90 / (1 + exp(-1.8 * (h_ground − 2.0)))
```

**Damage profile (fixed-tilt, h_ground):**

| h_ground (ft) | h_eff (ft) | Damage Ratio | Interpretation |
|---|---|---|---|
| 0.5 | −1.0 | ~0.01 | No panel contact; essentially zero |
| 1.0 | −0.5 | ~0.04 | Below panel; zero physical contact |
| 1.5 | 0 | 0.06 | Water just reaching panel bottom edge |
| 2.0 | 0.5 | 0.45 | Panel lower 6 in submerged; IR degradation beginning |
| 2.5 | 1.0 | 0.82 | Panels substantially wetted; inverter shutdown likely |
| 3.0 | 1.5 | 0.88 | Most modules in string with low IR |
| 4.0 | 2.5 | 0.90 | Maximum damage; full submersion |

**Sensitivity:** x0 is the most sensitive parameter. A site with fixed-tilt panels elevated to 2.5 ft (versus 1.5 ft) shifts the entire curve right by 1 ft — cutting the damage at a 2 ft flood from ~45% to nearly zero.

**Confidence Level:** **Low-Medium.** The endpoint (L = 0.90) is grounded in empirical data from Thailand. The steepness (k = 1.8) and midpoint (x0 = 0.5 ft above panel) are based on engineering judgment of IP67/68 seal behavior and the Thailand data showing rapid failure onset. No depth-controlled laboratory or field dataset with quantitative depth measurements and corresponding damage ratios exists for this pair.

**Derivation Rating:** Proxy-adapted (JRC Industry curve as proxy) + empirical anchor (Thailand IR data) + engineering-standard-based (IP ratings, IEC 61215/61646)

---

## 3. INVERTER_SYSTEM × RIVERINE_FLOOD

**Target Components:** INVERTER, COMBINER_BOX
**Curve IDs:** `riverine_flood/inverter_generic`, `riverine_flood/combiner_box_generic`
**Intensity Variable:** Flood depth, ft above grade

### 3.1 Physics of Damage

#### 3.1.1 Inverter Flood Failure Mechanisms

Central inverters at utility-scale solar plants are typically installed as pad-mounted units, either directly on concrete pads at or near grade, or inside prefabricated enclosures with limited elevation. Key failure mechanisms:

1. **Water ingress to power electronics:** High-voltage DC and AC power conversion electronics (IGBTs, capacitors, gate drivers, control boards) have near-zero tolerance for direct water contact. Once water penetrates the enclosure, short-circuits occur immediately if the unit is energized.

2. **Energized vs. de-energized distinction:** Electronics exposed to water while **de-energized** can sometimes be recovered via thorough cleaning and drying (per NEMA water damage guidelines). Electronics energized during water intrusion are nearly always total loss due to electrolytic corrosion and dielectric breakdown.

3. **NEMA enclosure performance:** 
   - NEMA 3R (gasketed, drains): Protects against falling water and ice formation; NOT designed for flood submersion
   - NEMA 4/4X (sealed, gasketed): Protects against hose-directed water and splashing; limited flood resistance; water can enter if ponded above gasket elevation per NEMA installation guidance
   - Neither rating confers submersion resistance — the DOE FEMP documented a case where stormwater entered NEMA-4X enclosures via conduits
   - IP67/IP68 equivalents provide better submersion resistance but most utility inverters are not IP68 rated

4. **Conduit pathway:** Even if the inverter enclosure itself is above the water line, water can enter the conduit system at below-grade access points and drain into the inverter housing — documented in DOE FEMP guidance (a frog was washed through the conduit into an inverter). This creates a damage pathway at flood depths well below the inverter housing itself.

5. **Contaminant deposition:** Flood water carries silt, sediment, chemical contaminants, and biological material. Even after water recedes, contaminants deposited on internal components cause corrosion and tracking failures that may not manifest for weeks or months.

#### 3.1.2 Near-Binary Behavior

Inverter flood damage is closer to **step-function** than smooth sigmoid behavior:
- If water does **not** reach the inverter's critical internal components: no damage (0%)
- If water does reach internal components: typically 80–100% damage (full replacement required)

Per [NEMA Water-Damaged Electrical Equipment Guidelines](https://www.nema.org/docs/default-source/products-document-library/guidelines-handling-water-damaged-elect-equip.pdf): Solid-state/electronic devices (inverter-equivalent) are generally **total loss** unless the manufacturer specifically offers remanufacturing. Field repair by non-OEM personnel is not recommended.

The one meaningful gradation is between **partial water entry** (condensation, minor seepage — 20–40% damage from corrosion over subsequent weeks) and **full submersion** (80–100% replacement).

#### 3.1.3 Combiner Box Flood Damage

DC combiner boxes (containing string fuses, surge protection devices, disconnect switches, and monitoring electronics) are:
- Post-mounted in the field, typically 18–48 in above grade
- Generally rated NEMA 4 or better
- Contain both fuses (total loss when wet per NEMA) and electronic monitoring (total loss when wet)
- The fuses and protection devices within are specifically listed as **total loss** by NEMA after flood exposure

Combiner box damage is also near-binary but with a **higher ground clearance threshold** (typically 2–4 ft) before water contact.

### 3.2 Intensity Variable and Component Elevation

**Inverter elevation above grade:**
- Pad-mounted central inverter: 0–6 in (critical components at bottom of unit)
- Inverter with housekeeping pad: 6–12 in
- Inverter in elevated enclosure (flood-prone site): 12–36 in (with site-specific engineering)

**Default assumption for Gen-1:** Central inverter critical components at 0.5 ft (6 in) above grade. This conservative assumption reflects that many utility solar inverters are installed at grade with minimal elevation.

**Combiner box critical components:** 18–36 in (1.5–3 ft) above grade (post-mounted).

### 3.3 Engineering Standards and Thresholds

| Standard | Relevance |
|---|---|
| NEMA Publication (Water-Damaged Electrical Equipment Guidelines) | Defines replacement criteria; electronic solid-state = total loss |
| UL 1741 (Inverters, Converters, Controllers for PV) | Safety standard; does not address flood resistance |
| NEMA Enclosure Type 4/4X | Splashing/spraying protection; NOT submersion |
| IEEE C62.11 (Surge protection) | Surge arresters (in combiners) require replacement after flooding |
| NEC 690 (Solar PV Systems) | Requires appropriate NEMA ratings for outdoor equipment |
| DOE FEMP Flood Guidance (2025) | Recommends NEMA 4/4R minimum; NEMA 3R in low-risk areas |

### 3.4 Existing Damage Functions in Literature

HAZUS does not have inverter-specific curves. The closest analogue is the **"contents damage"** function for industrial/commercial buildings, which reaches ~90% at 5 ft. However, inverter damage behavior is fundamentally different:
- The HAZUS building function models gradual inundation of space
- Inverters are point assets with near-binary damage at the elevation threshold

No published RE-specific depth-damage curve exists for solar inverters. The [Advances in Geosciences (2023)](https://adgeo.copernicus.org/articles/61/1/2023/adgeo-61-1-2023.html) paper on power grid flood damage conceptual model identifies inverter-equivalent equipment as "immediately impaired when water reaches equipment elevation" — effectively a threshold model.

### 3.5 Recommended Logistic Curve Parameters

**For INVERTER (Central):**

The step-function nature is modeled with a very steep sigmoid:

| Parameter | Value | Justification |
|---|---|---|
| **L** | **0.95** | Practical total loss; 5% residual accounts for enclosure and frame salvage value |
| **k** | **3.5** | Very steep — approximates threshold behavior |
| **x0** | **0.75 ft** | Central inverter pad at ~0.5 ft; x0 set to 0.25 ft above that = 0.75 ft; once 1 ft of flooding occurs, damage is near-total |

```
DR_inverter(h_ground) = 0.95 / (1 + exp(-3.5 * (h_ground − 0.75)))
```

**Damage Profile:**

| h_ground (ft) | Damage Ratio | Interpretation |
|---|---|---|
| 0.25 | 0.02 | Flood below pad level |
| 0.50 | 0.09 | Water just reaching pad edge |
| 0.75 | 0.48 | Water at inverter base; partial entry likely |
| 1.00 | 0.87 | Internal components wetted; likely total loss |
| 1.25 | 0.94 | Full submersion |
| 1.50+ | 0.95 | Maximum damage (plateau) |

**For COMBINER_BOX:**

| Parameter | Value | Justification |
|---|---|---|
| **L** | **0.80** | Post-mounted, higher clearance; some combiners survive minor splash events; fuses and electronics replaced (majority of cost), structural enclosure survives |
| **k** | **2.5** | Steep but less so than central inverter |
| **x0** | **2.0 ft** | Post-mounted at ~18–36 in; damage midpoint at 24 in above grade |

```
DR_combiner(h_ground) = 0.80 / (1 + exp(-2.5 * (h_ground − 2.0)))
```

**Confidence Level:** **Medium** for inverter (physics-based with NEMA/DOE/NREL supporting evidence; well-grounded in observed total-loss behavior); **Low** for combiner (fewer field reports; elevation uncertainty).

**Derivation Rating:** Engineering-standard-based (NEMA, UL, DOE FEMP) + expert judgment

---

## 4. SUBSTATION × RIVERINE_FLOOD

**Target Components:** TRANSFORMER_MAIN, SWITCHGEAR
**Curve IDs:** `riverine_flood/transformer_main_generic`, `riverine_flood/switchgear_generic`
**Intensity Variable:** Flood depth, ft above grade

### 4.1 Physics of Damage

#### 4.1.1 Transformer Flood Failure Mechanisms

Transformers at utility-scale solar plant substations are large, oil-filled, ground-level units. Flood damage proceeds through multiple pathways:

1. **Dielectric oil contamination:** Transformer insulating oil (mineral oil or less-flammable alternatives) is extremely sensitive to moisture. Per IEEE C57 transformer standards, oil moisture content must remain below 35 ppm for in-service units. Floodwater intrusion through gaskets, bushings, or tap changer mechanisms introduces water directly into the oil, causing:
   - Dielectric breakdown voltage reduction (oil breakdown from ~30 kV/cm to <10 kV/cm with moisture)
   - Accelerated paper insulation degradation (thermal aging rate roughly doubles per 8°C of excess temperature, further accelerated by moisture)
   - Sludge formation from oil oxidation

2. **Bushing failure:** High-voltage bushings penetrate the transformer tank above oil level. Flood water reaching bushing skirt levels can introduce contamination and cause dielectric failure.

3. **Tap changer damage:** Load tap changers (LTCs) are a known weak point — water in the tap changer compartment causes insulation and contact damage requiring LTC replacement or major refurbishment.

4. **Control and protection panel damage:** Transformer protection relays (differential, overcurrent, buchholz) are housed in marshaling kiosks typically at grade level. These are highly sensitive electronics susceptible to water entry.

5. **Mechanical foundation issues:** Large oil-filled transformers require solid concrete pads. Flood scour around transformer pads can undermine the foundation, creating a settling/tilting risk that causes terminal and bushing stress.

**Per NEMA Water-Damaged Electrical Equipment Guidelines:** 
- **Dry-type transformers: Total loss** (replace regardless of size)
- **Liquid-filled transformers: May be recoverable** with dielectric oil analysis and purification, but requires manufacturer consultation and extensive testing

6. **Post-flood contamination persistence:** Per the [JRC Climate Change and Critical Infrastructure (Karagiannis et al., 2017)](https://publications.jrc.ec.europa.eu/repository/bitstream/JRC109015/floods_ci_eur28855en_new_edition_final.pdf): Even after water recedes, salt and sediment contamination requires extensive cleaning. Dry-type transformers at solar substations are particularly at risk because salt/silt in the windings cannot be adequately cleaned without factory refurbishment.

#### 4.1.2 Switchgear Flood Failure Mechanisms

Outdoor switchgear (medium-voltage, 15–35 kV at solar substations):

1. **Air-insulated switchgear:** Open-bus or minimal-enclosure designs are directly exposed to floodwater. Water on bus work causes immediate flashover risk.
2. **Metal-clad switchgear:** More protected but seals are not designed for submersion
3. **Control wiring and protection:** Low-voltage control cables, relays, and communication equipment within switchgear panels are highly vulnerable

**FEMA's standard assumption:** [FEMA/HAZUS assumes switchgear is located at 3 ft (0.91 m) above grade](https://nrc-publications.canada.ca/fra/voir/td/?id=9e48ed4c-ef70-4d04-a8ed-a58e48e8c5f3), with damage occurring once water reaches that height. This is a judgmental assumption but widely used.

The [NERC Substation Flooding Lesson Learned (2022)](https://www.nerc.com/globalassets/programs/event-analysis/lessons-learned/ll20220404_substation_flooding_events_highlight_potential_design_deficiencies.pdf) documents a case where **8 inches of water in a basement relay room** was sufficient to cause false protection operations, removing 495 MW of generation capacity. This demonstrates that even shallow flooding of below-grade control rooms can cause catastrophic operational failures.

#### 4.1.3 NERC and IEEE Standards Context

- **IEEE C57.12.00:** General requirements for liquid-immersed distribution, power, and regulating transformers; defines moisture limits
- **IEEE C57.93-2019:** Guide for installation of liquid-immersed power transformers — recommends flood protection measures
- **NERC Reliability Standard FAC-001:** Siting and design standards; substations in flood zones require special considerations
- **NERC Hurricane Sandy Event Analysis (2014):** Post-Sandy assessment found substation flooding was the dominant failure mode for grid recovery delays; flooded substations had much longer restoration times than other damage types

### 4.2 Component Elevation Profile

| Component | Height Above Grade | Notes |
|---|---|---|
| Transformer main tank (bottom) | 0–3 in | Essentially at grade on concrete pad |
| Transformer oil level | 12–18 in | Depends on tank size |
| Transformer bushings (bottom) | 24–48 in | Primary electrical entry/exit |
| Switchgear bus (bottom) | 12–36 in | Depends on design |
| Control/relay panels | 0–12 in if in substation control building at grade | Major vulnerability |
| Marshaling kiosks | 0–6 in above grade or pad | Often at grade |

**The practical damage initiation point for substation total loss:** Water reaching the transformer terminal box (typically 12–18 in above grade) creates severe risk of immediate dielectric failure if transformer is energized.

### 4.3 HAZUS Fragility Curves for Substations

From [Sánchez-Muñoz et al. (2020) via PNNL Fragility Functions Report](https://www.pnnl.gov/main/publications/external/technical_reports/PNNL-33587.pdf): Flood fragility curves exist for HV, MV, and LV substations but are expressed as probability of failure vs. water depth (Weibull/lognormal distributions), not as smooth damage ratio curves. The shapes show:
- **Low voltage substations:** Begin failing at ~0.5 m (1.6 ft) water depth; most fail by 2 m (6.6 ft)
- **High voltage substations:** Begin failing at ~1 m (3.3 ft); reach high failure probability by 3–4 m (10–13 ft)

For solar plant substations (typically medium voltage, 34.5 kV collector to 115 kV transmission): behavior intermediate between LV and HV curves.

[Karagiannis et al. (2017)](https://publications.jrc.ec.europa.eu/repository/bitstream/JRC109015/floods_ci_eur28855en_new_edition_final.pdf): The HAZUS approach assigns binary failure states for substations based on whether water depth exceeds a functionality threshold (the height of critical electrical equipment). The JRC authors note this is less refined than a full fragility curve but is operationally pragmatic.

### 4.4 Long-Tail Risk: Post-Flood Recovery Times

A critical feature of substation flood damage not captured by damage ratio alone is **recovery time**:
- Inverter flood: Replace unit — 2–6 weeks typical
- Transformer flood (repairable): Oil analysis, purification, drying, re-testing — 2–6 months minimum
- Transformer flood (total loss): Procure new unit — 9–18 months wait for large power transformers (long lead times)
- Switchgear flood: Extensive cleaning, testing, possible replacement — 1–4 months

This means substation flood damage causes **disproportionate business interruption loss** relative to the physical asset damage ratio, especially for transformers. Risk modelers should apply a **business interruption multiplier** to substation flood events.

### 4.5 Recommended Logistic Curve Parameters

**For TRANSFORMER_MAIN:**

The transformer sits essentially at grade. Damage is near-binary once oil is contaminated. The smooth sigmoid captures uncertainty in whether the unit can be salvaged (oil analysis dependent) versus replaced.

| Parameter | Value | Justification |
|---|---|---|
| **L** | **0.85** | 85% max damage ratio; ~15% residual reflects recoverable liquid-filled units where oil can be successfully purified |
| **k** | **2.0** | Moderately steep — reflects uncertainty in whether specific event causes recoverable vs. total loss |
| **x0** | **1.0 ft** | Transformer terminal/oil vulnerability at ~12 in above grade; midpoint of damage sigmoid at 1 ft |

```
DR_transformer(h_ground) = 0.85 / (1 + exp(-2.0 * (h_ground − 1.0)))
```

**For SWITCHGEAR:**

FEMA assumes switchgear at 3 ft above grade. Damage is high once water reaches the bus level (~1–2 ft above grade in typical horizontal outdoor gear), but the 3 ft FEMA assumption for control functions creates a distinct kink.

| Parameter | Value | Justification |
|---|---|---|
| **L** | **0.90** | Very high damage — control electronics essentially total loss; bus work potentially recoverable with cleaning |
| **k** | **2.5** | Steep curve reflecting threshold behavior |
| **x0** | **2.0 ft** | Compromise between transformer oil at 1 ft and FEMA's 3 ft switchgear assumption; bus contact at ~1 ft, control functions at ~2–3 ft |

```
DR_switchgear(h_ground) = 0.90 / (1 + exp(-2.5 * (h_ground − 2.0)))
```

**Substation Combined Damage (weighted aggregate):**
Approximate weighting: TRANSFORMER_MAIN ~60% of substation cost, SWITCHGEAR ~40%.

```
DR_substation(h_ground) = 0.60 × DR_transformer + 0.40 × DR_switchgear
```

**Damage Profiles:**

| h_ground (ft) | DR_transformer | DR_switchgear | DR_substation |
|---|---|---|---|
| 0.5 | 0.18 | 0.04 | 0.12 |
| 1.0 | 0.43 | 0.08 | 0.29 |
| 1.5 | 0.70 | 0.17 | 0.49 |
| 2.0 | 0.83 | 0.45 | 0.68 |
| 2.5 | 0.84 | 0.74 | 0.80 |
| 3.0 | 0.85 | 0.88 | 0.86 |
| 4.0+ | 0.85 | 0.90 | 0.87 |

**Confidence Level:** **Medium.** FEMA's 3 ft assumption and NEMA total-loss criteria provide solid grounding. The midpoint parameters involve judgment. Large uncertainty in whether a given transformer can be recovered via oil treatment.

**Derivation Rating:** Engineering-standard-based (IEEE C57, NEMA) + proxy-adapted (HAZUS/JRC utility curves) + expert judgment

---

## 5. ELECTRICAL × RIVERINE_FLOOD

**Target Component:** CABLE_COLLECTION
**Curve ID:** `riverine_flood/cable_collection_generic`
**Intensity Variable:** Flood depth, ft above grade

### 5.1 Physics of Damage

#### 5.1.1 Underground Cable (Primary Case)

Utility-scale solar DC collection cables are predominantly installed underground, typically at:
- 12–18 in (0.3–0.45 m) depth in conduit (metal or PVC)
- 18–24 in (0.45–0.6 m) depth direct-buried (NEC-compliant depths for PV wire)
- Occasionally deeper (24–36 in) in areas with high foot/vehicle traffic risk

**Key finding from [Thorne & Derrick / Power and Cables (2021)](https://www.powerandcables.com/flooding-underground-cables/):** *"Medium and high voltage cables are designed to be direct buried, often in areas where they will be below the water table and permanently in a wet environment. Cables are rarely at fault for failures related to flooding."*

The critical vulnerability is **not the cable itself** but rather:

1. **Terminations and splices at grade level:** Where underground cables emerge from the ground to connect to junction boxes, combiner boxes, or inverters, the termination points are at or above grade. These are not designed for submersion and are the primary failure point.

2. **Junction boxes (pull boxes) in the field:** These are typically installed at or near grade, not elevated, and are rated NEMA 3 or 4 at best. They are **not** submersion-rated. Water intrusion through junction boxes can then travel through conduits downhill to connected equipment (inverters, switchgear).

3. **Cable joint/splice boxes:** Any mid-span splices or tap-off points in the underground cable run have splice housings that may not tolerate sustained flooding.

4. **Long-term degradation from wet conditions:**
   - Standard XLPE cables (YJV type) in **permanently waterlogged conditions** experience hydrolysis of the PVC outer sheath within 3–5 years
   - Armored XLPE cables (XLPE/SWA) tolerate moderate moisture but not permanent submersion of inferior types
   - Specially-designed waterproof XLPE cables (YJVQ, JHS types) can tolerate permanent submersion

5. **Conduit fills with water:** PVC conduit with water entry allows water to travel through the conduit system, effectively bypassing even elevated enclosures if conduits are not sealed with duct sealant at equipment entries.

#### 5.1.2 AC Collection Cables (Above-Ground Cable Trays)

Some utility solar plants route AC cables in above-grade cable trays between inverter stations and the substation. These are:
- Directly exposed to flood water
- Cable construction typically suitable for wet locations but not submersion
- Tray supports may be undermined by scour
- Generally more vulnerable than underground cables but less than enclosure equipment

#### 5.1.3 Above-Ground Wiring Harness (Between Panels)

Inter-row wiring above grade is typically MC4 connectors on UV-stabilized cable. Key risks:
- MC4 connectors rated IP67 or IP68 — provide good but not indefinite flood resistance
- Physical damage from floating debris
- Stress on connections as panels move (if on tracker) during flood

### 5.2 Damage Assessment

**Underground collection cables** are the lowest-vulnerability component in a solar farm under flood conditions. However, the **system** (cable + terminations + junction boxes + conduit network) has higher vulnerability than the cable alone.

**Functional damage from cable subsystem flooding:**
- Termination replacement only: 10–25% of cable subsystem cost
- Full cable replacement (permanent waterlogging): 50–80% of cable subsystem cost
- Junction box replacement (typical flood scenario): 20–40% of cable subsystem cost

### 5.3 Recommended Logistic Curve Parameters

**For CABLE_COLLECTION (combined underground cable + terminations + junction boxes):**

| Parameter | Value | Justification |
|---|---|---|
| **L** | **0.55** | Maximum damage capped at 55%: underground cables themselves rarely require replacement; damage is concentrated in terminations, junction boxes, and above-grade conduit; full cable replacement is rare in single flood event |
| **k** | **0.8** | Shallow/gradual slope reflecting that deeper floods cause proportionally more above-grade damage (more junction boxes submerged, more termination points reached) rather than a sharp threshold |
| **x0** | **1.5 ft** | Midpoint at 1.5 ft: by this depth, most field junction boxes are submerged and terminations at grade are flooded; damage increases gradually with depth as more of the cable network perimeter is affected |

```
DR_cable_collection(h_ground) = 0.55 / (1 + exp(-0.8 * (h_ground − 1.5)))
```

**Damage Profile:**

| h_ground (ft) | Damage Ratio | Interpretation |
|---|---|---|
| 0.5 | 0.07 | Minor splash damage to grade-level junction boxes |
| 1.0 | 0.13 | Some junction boxes flooded |
| 1.5 | 0.28 | 50% of field junction boxes and terminations flooded |
| 2.0 | 0.42 | Most above-grade terminations affected; conduits filling |
| 3.0 | 0.50 | Near-maximum; cable trays and all above-grade components affected |
| 4.0+ | 0.54 | Plateau — underground cable itself intact; damage bounded |

**Confidence Level:** **Low.** Cables are the least studied component in RE flood literature. The cap of 0.55 is based on engineering judgment about what fraction of cable system cost is in above-grade/vulnerable elements vs. protected underground cable. No empirical depth-damage data specific to solar cable systems exists.

**Derivation Rating:** Engineering-standard-based (XLPE standards, NEC 690) + expert judgment

---

## 6. CIVIL_INFRA × RIVERINE_FLOOD

**Target Components:** ROAD, FENCING, BUILDING
**Curve IDs:** `riverine_flood/road_solar_generic`, `riverine_flood/fencing_solar_generic`, `riverine_flood/building_solar_generic`
**Intensity Variable:** Flood depth, ft above grade

### 6.1 Physics of Damage

#### 6.1.1 Access Roads

Solar farm access roads are typically gravel or compacted dirt/gravel roads with limited or no paving. They are particularly vulnerable to flood damage through:

1. **Scour and washout:** Water flowing over or adjacent to road surface removes gravel/soil, creating ruts, washouts, and loss of road base
2. **Pavement (where present) weakening:** Flooding saturates subgrade soils, reducing their resilient modulus; subsequent traffic loads after flooding cause accelerated pavement deterioration per [NSF Research (Zhang et al., 2022)](https://par.nsf.gov/servlets/purl/10357501) on time-depth-damage functions for pavements — **flood duration is more important than depth alone** for pavement damage
3. **Culvert/drainage structure failure:** Road crossings over drainage channels can fail if flow rates exceed design capacity; culvert headwater buildup causes road overtopping and rapid scour

**From [pv-magazine-usa.com (2023)](https://pv-magazine-usa.com/2023/06/22/climate-change-and-solar-project-flood-risk/):** "Even minor flooding can erode or block off access roads at a solar site, preventing operations personnel from working on equipment that needs attention which can result in increased downtime."

**JRC Global Flood Depth-Damage Functions (roads category):** Global generic: 22% at 0.5 m; 43% at 1 m; 67% at 2 m; 79% at 3 m; 89% at 4 m; 100% at 6 m. These represent road replacement value, not the operational impact of inaccessibility.

#### 6.1.2 Fencing

Perimeter and security fencing at solar farms is low-cost relative to the overall project but serves critical functions (security, wildlife management, liability). Flood damage includes:
- Post pullout from saturated/eroded soil
- Wire/mesh damage from debris
- Gate and hardware corrosion (especially saltwater)

Fencing damage is generally minor and repairable; rarely constitutes large fraction of overall project damage.

#### 6.1.3 O&M Buildings

Solar plant O&M buildings (typically 1-story, slab-on-grade construction) follow residential/commercial flood damage curves closely. Key reference:
- **HAZUS residential (1-story, no basement, slab-on-grade):** DIP at grade (0 ft); damage rises from ~10% at 1 ft to ~55% at 5 ft
- **HAZUS commercial 1-story:** Similar profile, reaches ~50–60% at 3–4 ft

O&M building flooding damage is well-characterized by existing HAZUS curves — this is the strongest empirical foundation available for any solar civil infrastructure component.

#### 6.1.4 Foundation Pile Erosion (Panel Mounting Structures)

**This is the most consequential civil infrastructure risk for panel arrays:**

The [ANZGeo 2023 geotechnical study (Zhang, Australian Foundation Piles)](https://www.insitutek.com/wp-content/uploads/2025/01/Climate-change-challenges-for-the-geotechnical-design-of-solar-farms-David-Zhang-ANZGeo2023.pdf) documents:
- Solar tracker pile failures in western New South Wales, Australia following major flooding events
- Inadequate backfill compaction led to settlement and additional downdrag forces on piles
- Flooding of expansive soils around pile foundations causes swelling-induced upward movement (frost jacking equivalent in wet climates)

From [pv-magazine-usa.com (2023)](https://pv-magazine-usa.com/2023/06/22/climate-change-and-solar-project-flood-risk/): "Flowing water at the pile to soil interface can cause scour of the soil at the base of racking piles, effectively reducing the pile's embedment and load carrying capacity."

**Foundation scour risk is captured in CIVIL_INFRA rather than MOUNTING** because the damage pathway is soil-water interaction at the pile-ground interface, which is a civil/geotechnical failure mode rather than a mechanical racking failure.

Foundation erosion is a **high-velocity flow** risk more than a standing water depth risk. However, depth serves as a reasonable proxy for event severity in riverine flood contexts.

### 6.2 Recommended Logistic Curve Parameters

**ROAD:**

| Parameter | Value | Justification |
|---|---|---|
| **L** | **0.90** | Gravel/dirt roads can be fully destroyed by significant flooding; 10% residual = road subgrade remains |
| **k** | **0.9** | Moderate slope — road damage is gradual with depth but accelerates significantly at higher depths |
| **x0** | **1.5 ft** | Midpoint at 1.5 ft above road surface: at 1 ft of flood depth, access roads begin erosion; by 2 ft, washout is likely |

```
DR_road(h_ground) = 0.90 / (1 + exp(-0.9 * (h_ground − 1.5)))
```

**FENCING:**

| Parameter | Value | Justification |
|---|---|---|
| **L** | **0.50** | Limited max damage — fencing is low-cost and can often be re-used or repaired after debris removal |
| **k** | **0.7** | Gradual — deeper/faster water causes more post pullout and damage |
| **x0** | **2.0 ft** | Fencing posts need significant water depth to undermine soil grip; midpoint at 2 ft |

```
DR_fencing(h_ground) = 0.50 / (1 + exp(-0.7 * (h_ground − 2.0)))
```

**BUILDING (O&M):**

Calibrated to match HAZUS 1-story commercial, slab-on-grade (DIP = 0 ft):

| Parameter | Value | Justification |
|---|---|---|
| **L** | **0.75** | HAZUS commercial 1-story caps near 60–75% at high depths; solar O&M buildings have simple contents |
| **k** | **0.6** | Gentle slope matching HAZUS gradual increase |
| **x0** | **2.5 ft** | Midpoint at 2.5 ft above first floor slab per HAZUS calibration |

```
DR_building(h_ground) = 0.75 / (1 + exp(-0.6 * (h_ground − 2.5)))
```

**Note on BUILDING:** This curve is for the O&M structure only. Contents (SCADA equipment, spare parts) may follow the higher-damage NEMA electronics curve.

**CIVIL_INFRA Combined (Weighted Aggregate):**
Approximate weighting: ROAD ~35%, FENCING ~20%, BUILDING ~45% of CIVIL_INFRA replacement cost.

**Damage Profiles:**

| h_ground (ft) | DR_road | DR_fencing | DR_building | DR_civil_weighted |
|---|---|---|---|---|
| 0.5 | 0.14 | 0.04 | 0.04 | 0.07 |
| 1.0 | 0.27 | 0.07 | 0.07 | 0.12 |
| 1.5 | 0.45 | 0.11 | 0.12 | 0.21 |
| 2.0 | 0.63 | 0.25 | 0.20 | 0.34 |
| 2.5 | 0.78 | 0.45 | 0.38 | 0.52 |
| 3.0 | 0.86 | 0.50 | 0.56 | 0.65 |
| 4.0 | 0.89 | 0.50 | 0.71 | 0.73 |
| 5.0+ | 0.90 | 0.50 | 0.74 | 0.75 |

**Confidence Level — ROAD:** Medium. JRC road damage functions provide empirical grounding. **FENCING:** Low. No published depth-damage data; pure expert judgment. **BUILDING:** Medium-High. HAZUS curves are the best-validated source in the dataset; this is the highest-confidence curve in CIVIL_INFRA.

**Derivation Rating:** ROAD — proxy-adapted (JRC transport/roads); BUILDING — proxy-adapted (HAZUS commercial); FENCING — expert judgment

---

## 7. Depth-vs-Duration Problem

### 7.1 The Core Issue

All curves above express damage as a function of **flood depth only**, yet the physics of damage for most solar components is materially sensitive to **flood duration** (how long water remains at a given depth). This is a fundamental limitation of the depth-damage function paradigm.

### 7.2 Duration Effects by Component

| Component | Duration Sensitivity | Mechanism | Gen-1 Treatment |
|---|---|---|---|
| **PV modules** | **High** | IP67 seals hold for ~30 min at 1 m; extended submersion (hours–days) dramatically increases moisture ingress. Thailand flooding was multi-day. | Gen-1: Use standard depth curve, calibrate L and x0 to multi-hour (>24 hr) flood scenario as baseline |
| **Inverters** | **Moderate** | Electronics: damage is effectively immediate on water contact. Duration matters for corrosion extent. | Gen-1: Treated as effectively instantaneous threshold; duration not material for asset damage |
| **Transformers** | **High** | Oil contamination progresses over time; brief flooding may leave transformer recoverable; prolonged flooding guarantees oil contamination | Gen-1: Accept mid-L value (0.85) as representing a mix of brief and extended exposures |
| **Underground cables** | **Very High** | Brief flooding (<24 hr): minimal damage. Extended flooding (days–weeks): PVC sheath degradation begins. Permanent inundation: requires waterproof-rated cable | Gen-1: Low L value (0.55) reflects that most events are not long enough to cause full cable failure |
| **Roads** | **High** | Duration drives pavement weakening through subgrade saturation [NSF, 2022] | Gen-1: Moderate slope captures the progressive nature |
| **Buildings** | **Moderate** | HAZUS curves implicitly based on typical flood durations (hours–days); explicit duration not modeled | Gen-1: Use HAZUS proxy directly |

### 7.3 Proposed Gen-1 Duration Convention

**For Gen-1, all curves are calibrated to a "moderate riverine flood event" duration assumption of 12–72 hours of inundation at the stated depth.** This represents the typical peak duration of a riverine flood event above a given depth contour.

Events with significantly different duration characteristics should be flagged for Gen-2 treatment:
- **Flash floods (<6 hours):** Reduce L by ~20% for PV modules and cables; inverter/substation damage unchanged
- **Extended inundation (>7 days, e.g., levee failure scenarios):** Increase L toward 1.0 for all components; cable damage reaches full replacement

### 7.4 Proposed Gen-2 Enhancement: Time-Depth-Damage Functions (TDDF)

Following the framework of [Zhang et al. (2022) for pavements](https://par.nsf.gov/servlets/purl/10357501), a Gen-2 model should develop **time-depth-damage functions** that add a duration dimension:

```
DR(h, t) = L(t) / (1 + exp(-k * (h − x0)))
```

Where `L(t)` is a duration-dependent maximum damage ratio, for example:
```
L(t) = L_max × (1 − exp(-λ * t))
```

With `λ` being a component-specific decay constant governing how rapidly maximum damage saturates with time. For inverters, L(t) → L_max almost immediately (small λ, near-instantaneous). For underground cables, L(t) rises slowly over days to weeks (large λ).

---

## 8. Recommended Curve Parameters Summary

### 8.1 Master Parameter Table

| Subsystem | Component | Curve ID | L | k | x0 (ft) | h_eff Offset (ft) | Confidence | Derivation |
|---|---|---|---|---|---|---|---|---|
| PV_ARRAY | PV_MODULE (fixed-tilt) | `riverine_flood/pv_module_fixed` | 0.90 | 1.8 | 2.0 | z=1.5 absorbed in x0 | Low-Med | Proxy-adapted + empirical anchor |
| PV_ARRAY | PV_MODULE (SAT horizontal) | `riverine_flood/pv_module_sat_horiz` | 0.90 | 1.8 | 2.5 | z=2.0 absorbed in x0 | Low | Expert judgment + empirical anchor |
| PV_ARRAY | PV_MODULE (SAT flood stow) | `riverine_flood/pv_module_sat_stow` | 0.90 | 1.8 | 7.0 | z=6.0 absorbed in x0 | Low | Expert judgment |
| INVERTER_SYSTEM | INVERTER (central) | `riverine_flood/inverter_central` | 0.95 | 3.5 | 0.75 | z=0.5 absorbed in x0 | Medium | Eng. standard + expert judgment |
| INVERTER_SYSTEM | COMBINER_BOX | `riverine_flood/combiner_box` | 0.80 | 2.5 | 2.0 | z=1.5 absorbed in x0 | Low | Expert judgment |
| SUBSTATION | TRANSFORMER_MAIN | `riverine_flood/transformer_main` | 0.85 | 2.0 | 1.0 | z=0.25 absorbed in x0 | Medium | Eng. standard + proxy-adapted |
| SUBSTATION | SWITCHGEAR | `riverine_flood/switchgear` | 0.90 | 2.5 | 2.0 | z=0.75 absorbed in x0 | Medium | Eng. standard (FEMA 3 ft) |
| ELECTRICAL | CABLE_COLLECTION | `riverine_flood/cable_collection` | 0.55 | 0.8 | 1.5 | Underground offset N/A | Low | Eng. standard + expert judgment |
| CIVIL_INFRA | ROAD | `riverine_flood/road_solar` | 0.90 | 0.9 | 1.5 | — | Medium | Proxy-adapted (JRC) |
| CIVIL_INFRA | FENCING | `riverine_flood/fencing_solar` | 0.50 | 0.7 | 2.0 | — | Low | Expert judgment |
| CIVIL_INFRA | BUILDING (O&M) | `riverine_flood/building_om` | 0.75 | 0.6 | 2.5 | — | Med-High | Proxy-adapted (HAZUS) |

### 8.2 Key Damage Thresholds (10/50/90% Damage)

For logistic curve f(x) = L / (1 + exp(-k*(x-x0))):
- 10% damage depth: x = x0 - ln(L/0.1 - 1)/k
- 50% damage depth: x = x0 (by definition, when L ≠ 1.0: x at L/2)
- 90% damage depth: x = x0 + ln(L/0.1 - 1)/k

| Component | 10% Damage (ft) | 50% Damage (ft) | 90% Damage (ft) |
|---|---|---|---|
| PV_MODULE (fixed-tilt) | 0.82 | 2.0 | 3.18 |
| INVERTER (central) | 0.37 | 0.75 | 1.13 |
| COMBINER_BOX | 0.90 | 2.0 | 3.10 |
| TRANSFORMER_MAIN | 0.18 | 1.0 | 1.82 |
| SWITCHGEAR | 0.56 | 2.0 | 3.44 |
| CABLE_COLLECTION | 0.07 | 1.5 | 2.93 |
| ROAD | 0.51 | 1.5 | 2.49 |
| FENCING | 0.60 | 2.0 | 3.40 |
| BUILDING (O&M) | 0.40 | 2.5 | 4.60 |

### 8.3 Flood Depth × Subsystem Damage Matrix

The following table shows damage ratios for each subsystem at standard flood depths, using the component-level curves weighted to subsystem level:

| Flood Depth (ft) | PV_ARRAY | INVERTER_SYS | SUBSTATION | ELECTRICAL | CIVIL_INFRA |
|---|---|---|---|---|---|
| 0 | 0.01 | 0.02 | 0.04 | 0.04 | 0.01 |
| 0.5 | 0.03 | 0.09 | 0.12 | 0.07 | 0.07 |
| 1.0 | 0.06 | 0.87 | 0.29 | 0.13 | 0.12 |
| 1.5 | 0.25 | 0.94 | 0.49 | 0.28 | 0.21 |
| 2.0 | 0.45 | 0.95 | 0.68 | 0.42 | 0.34 |
| 2.5 | 0.82 | 0.95 | 0.80 | 0.46 | 0.52 |
| 3.0 | 0.88 | 0.95 | 0.86 | 0.50 | 0.65 |
| 4.0 | 0.90 | 0.95 | 0.87 | 0.54 | 0.73 |
| 5.0 | 0.90 | 0.95 | 0.87 | 0.55 | 0.75 |

*PV_ARRAY = PV_MODULE (fixed-tilt); INVERTER_SYS = 0.60×INVERTER + 0.40×COMBINER_BOX; SUBSTATION = 0.60×TRANSFORMER + 0.40×SWITCHGEAR*

---

## 9. Data Gaps and Recommendations

### 9.1 Critical Data Gaps

#### Gap 1: No Empirically Calibrated RE-Specific PV Module Flood Depth-Damage Function
**Nature:** The Thailand study (Ketjoy et al., 2022) provides valuable insulation resistance data but does not report flood depth. No study in the current literature links measured flood depth above panel to quantitative damage ratio for crystalline silicon modules (the dominant global technology).
**Impact:** High — the most capital-intensive subsystem in a solar plant has the weakest empirical depth-damage basis.
**Recommendation:** Partner with utility-scale owners in flood-prone regions (US Southeast, Midwest, Southeast Asia) to deploy flood depth sensors in array fields during flood events and conduct post-event IR testing and damage assessment.

#### Gap 2: No RE-Specific Inverter Flood Depth-Duration Data
**Nature:** Inverter damage is observed as binary (replace/don't replace) in flood aftermath reports, but no controlled depth-duration experiments have been performed with utility-scale solar inverters.
**Impact:** Medium — inverter damage behavior is relatively well-described as threshold/binary, so the gap mainly affects the k parameter (steepness) and the duration dependence.
**Recommendation:** OEM testing program: expose inverter enclosures of varying NEMA ratings to controlled depth (0.25, 0.5, 1.0, 2.0 ft) for controlled durations (1, 6, 24, 72 hours); assess internal component survival.

#### Gap 3: Transformer Flood Recovery Rate Data
**Nature:** NEMA guidance states liquid-filled transformers "may be" recoverable, but no statistical data exists on the fraction of flooded utility transformers that are successfully recovered vs. replaced, as a function of flood depth or duration.
**Impact:** High for business interruption modeling — drives the long-tail recovery time distribution.
**Recommendation:** IEEE/NERC post-event surveys should systematically capture transformer recovery rates in flood events.

#### Gap 4: Duration-Conditioned Damage Data for Underground Cables
**Nature:** Laboratory and field evidence confirms cables tolerate brief flooding well and fail under prolonged flooding, but no quantitative time-depth-damage function exists.
**Impact:** Medium — affects modeling of extended riverine flood scenarios (levee failures, slow-draining floodplains).
**Recommendation:** Instrument cable test sections in flooded conduit environments; monitor insulation resistance over time vs. controlled flooding depth.

#### Gap 5: Foundation Pile Scour Depth-Damage Relationships
**Nature:** The ANZGeo (2023) paper describes pile failure mechanisms from flooding/erosion but does not provide a quantitative depth-scour-damage function. Scour depth is a function of velocity (not just depth), which is not captured in the standard depth-damage framework.
**Impact:** Medium for CIVIL_INFRA; potentially High if array mounting failures cascade to panel damage.
**Recommendation:** Combine FHWA scour estimation methods (HEC-18) with solar pile design specifications to develop velocity-scour-damage functions as a supplement to depth-based modeling.

#### Gap 6: Tracker Stow Protocol Effectiveness Data
**Nature:** No empirical data exists comparing damage ratios for SAT farms with vs. without active flood stow protocols.
**Impact:** High — this is a potentially major risk mitigation factor (3–6 ft elevation increase for panels) that cannot currently be quantified.
**Recommendation:** Retrospective analysis of flood events at SAT vs. fixed-tilt farms in similar flood scenarios.

#### Gap 7: Saltwater Multiplier for Riverine Flood
**Nature:** Saltwater floods (coastal or tidally influenced rivers) are documented to cause dramatically worse long-term panel corrosion, but no quantitative multiplier (e.g., DR_saltwater = α × DR_freshwater) has been established.
**Impact:** High for coastal solar projects within tidal reach.
**Recommendation:** IEC 61701 salt mist test data + controlled submersion experiments comparing fresh vs. salt water damage rates.

### 9.2 Prioritized Validation Recommendations

| Priority | Action | Expected Confidence Improvement |
|---|---|---|
| 1 | Post-flood field campaign: depth measurement + IR testing at flooded utility solar plant | PV_MODULE curve: Low-Med → High |
| 2 | Systematic post-event survey of transformer recovery rates at substations | TRANSFORMER curve: Med → Med-High |
| 3 | SAT stow protocol effectiveness study | New curve variant: Fixed-tilt vs. SAT-stowed |
| 4 | Inverter NEMA rating flood test | INVERTER curve: steepness parameter calibration |
| 5 | Saltwater vs. freshwater comparison experiment | Enable saltwater multiplier curve |

---

## 10. Full Bibliography

All sources are classified by evidence type:
- **[E]** = Empirical (field observations, insurance data, post-event surveys)
- **[S]** = Engineering standard or regulatory document
- **[P]** = Peer-reviewed academic publication
- **[G]** = Government guidance, technical manual
- **[I]** = Industry report, manufacturer specification

---

### Standards and Regulatory Documents

1. **[S]** International Electrotechnical Commission. *IEC 60529: Degrees of Protection Provided by Enclosures (IP Code).* Geneva: IEC, 2013. https://www.iec.ch/standards/iec-60529

2. **[S]** International Electrotechnical Commission. *IEC 61215-1:2021: Terrestrial Photovoltaic (PV) Modules — Design Qualification and Type Approval.* Geneva: IEC, 2021.

3. **[S]** International Electrotechnical Commission. *IEC 61646: Thin-Film Terrestrial PV Modules — Design Qualification and Type Approval.* Geneva: IEC. (Superceded by IEC 61215 for thin-film; insulation resistance requirements retained.)

4. **[S]** International Electrotechnical Commission. *IEC 61701: Salt Mist Corrosion Testing of Photovoltaic (PV) Modules.* Geneva: IEC, 2011.

5. **[S]** IEEE. *C57.12.00: General Requirements for Liquid-Immersed Distribution, Power, and Regulating Transformers.* IEEE, 2021. https://ieeexplore.ieee.org/document/9537617

6. **[S]** IEEE. *C57.93-2019: Guide for Installation and Maintenance of Liquid-Immersed Power Transformers.* IEEE, 2019. https://16557801101891546621.googlegroups.com/attach/34edf5e2071f1/IEEE%20Std%20C57.93-2019.pdf

7. **[S]** NEMA. *Handling of Water-Damaged Electrical Equipment.* Rosslyn, VA: National Electrical Manufacturers Association, n.d. https://www.nema.org/docs/default-source/products-document-library/guidelines-handling-water-damaged-elect-equip.pdf

8. **[S]** U.S. Department of Defense. *UFGS 26 31 00: Facility-Scale Solar Photovoltaic (PV) Systems.* Unified Facilities Guide Specification. https://www.wbdg.org/FFC/DOD/UFGS/UFGS%2026%2031%2000.pdf — specifies minimum 1 m (3 ft) ground clearance under arrays.

9. **[S]** U.S. Army Corps of Engineers / NEC 690. *National Electrical Code Article 690: Solar Photovoltaic Systems.* NFPA 70. Quincy, MA: NFPA, 2023.

---

### FEMA and HAZUS Documents

10. **[G]** Federal Emergency Management Agency. *HAZUS-MH Flood Model Technical Manual.* Chapter 5: Direct Physical Damage — General Building Stock. Washington, DC: FEMA, 2003/2013 revision. http://drm.cenn.org/Trainings/Multi%20Hazard%20Risk%20Assessment/Lectures_ENG/Session%2006%20Risk%20Analysis/Background/HAZUS%20Flood%2005-Damage%20Buildings.pdf — defines depth-damage function approach; FEMA assumes switchgear at 3 ft (0.91 m) above grade.

11. **[G]** Federal Emergency Management Agency. *Multi-hazard Loss Estimation Methodology: Flood Model, Hazus Technical Manual.* Washington, DC: FEMA, 2013. Full documentation of utility systems flood depth-damage functions including substations.

12. **[G]** U.S. Department of Energy / FEMP. *Preventing and Mitigating Flood Damage to Solar Photovoltaic Systems.* Washington, DC: DOE, updated April 2025. https://www.energy.gov/femp/preventing-and-mitigating-flood-damage-solar-photovoltaic-systems — primary guidance document; states partial submersion = likely total loss.

13. **[G]** Federal Emergency Management Agency. *FEMA P-936: Floodproofing Non-Residential Buildings.* Washington, DC: FEMA, 2013. https://www.wbdg.org/FFC/DHS/femap936.pdf — documents real-world electrical equipment flooding at Columbus Junction, IA (2008) and Cedar Rapids, IA (2008).

14. **[G]** U.S. Army Corps of Engineers, New York District (NACCS). *Physical Depth Damage Function Summary Report.* North Atlantic Coast Comprehensive Study. January 2015. https://www.nad.usace.army.mil/Portals/40/docs/NACCS/10A_PhysicalDepthDmgFxSummary_26Jan2015.pdf

15. **[G]** Galloway, G. et al. *HAZUS-MH Flood Loss Estimation Methodology. II: Damage and Loss Estimation.* ASCE Natural Hazards Review 7(2):72–81, 2006. https://ascelibrary.org/doi/10.1061/(ASCE)1527-6988(2006)7:2(72) — comprehensive summary of 900+ HAZUS flood damage curves.

---

### JRC / European Union Sources

16. **[G/P]** Huizinga, J., Moel, H. de, Szewczyk, W. *Global Flood Depth-Damage Functions: Methodology and the Database with Guidelines.* EUR 28552 EN. Luxembourg: Publications Office of the European Union, 2017. https://publications.jrc.ec.europa.eu/repository/bitstream/JRC105688/global_flood_depth-damage_functions__10042017.pdf — **primary source** for North America industry damage functions used as PV proxy. North America industry: 0.31/0.48/0.71/0.84/0.93 at 0.5/1/2/3/4 m.

17. **[P]** Karagiannis, G.M. et al. *Climate Change and Critical Infrastructure — Floods.* EUR 28855 EN. Luxembourg: JRC, 2017. https://publications.jrc.ec.europa.eu/repository/bitstream/JRC109015/floods_ci_eur28855en_new_edition_final.pdf — power grid flood damage functions; substations treated with binary threshold approach.

---

### NERC and Grid Reliability Sources

18. **[G/E]** North American Electric Reliability Corporation. *Substation Flooding Events Highlight Potential Design Deficiencies.* Lessons Learned LL20220404. April 2022. https://www.nerc.com/globalassets/programs/event-analysis/lessons-learned/ll20220404_substation_flooding_events_highlight_potential_design_deficiencies.pdf — documents 8 inches of water causing 495 MW forced outage.

19. **[G/E]** North American Electric Reliability Corporation. *Hurricane Harvey Event Analysis Report.* March 2018. https://www.nerc.com/globalassets/our-work/reports/event-reports/nerc_hurricane_harvey_ear_20180309.pdf — documents 6 substations flooded in ERCOT area.

20. **[G/E]** North American Electric Reliability Corporation. *Hurricane Sandy Event Analysis Report.* March 2014. https://www.nerc.com/globalassets/our-work/reports/event-reports/hurricane_sandy_ear_20140312_final.pdf — documents substation flooding as dominant grid recovery constraint.

---

### Academic Literature

21. **[P]** Ketjoy, N., Mensin, P., Chamsa-ard, W. "Impacts on insulation resistance of thin film modules: A case study of a flooding of a photovoltaic power plant in Thailand." *PLOS ONE* 17(9): e0274839, 2022. https://doi.org/10.1371/journal.pone.0274839 — **primary empirical source** for PV module flood damage; 66% of modules failed IEC 61646 IR test post-flood; IR dropped ~74% on average.

22. **[P]** Schubert, M. et al. "Simulation of water ingress into PV-modules: IEC-testing versus outdoor exposure." *Solar Energy* 115, 2015. https://www.sciencedirect.com/science/article/abs/pii/S0038092X1500122X — confirms damp heat test does not replicate submersion.

23. **[P]** Global Challenges Journal. "From Lab to Field: Damp Heat Testing and its Implications for PV Modules." PMC Article 12003212, March 2025. https://pmc.ncbi.nlm.nih.gov/articles/PMC12003212/ — damp heat 85°C/85% RH for 1000 hrs; maps to 30-year equivalent by climate zone.

24. **[P]** Sánchez-Muñoz, D. et al. "Flooding fragility curves for high voltage, medium voltage and low voltage substations and distribution centers." *Sustainability* 12(4): 1527, 2020. https://doi.org/10.3390/su12041527 — **LV substations fail at ~0.5 m, HV at ~1 m water depth**; used in PNNL Fragility Functions Resource Report.

25. **[P]** Zhang, J. et al. "Development of Time-Depth-Damage Functions for Flooded Flexible Pavements." *Journal of Infrastructure Systems*, 2022. https://par.nsf.gov/servlets/purl/10357501 — TDDF framework; flood duration critical for pavement damage.

26. **[P]** Pasha, M.D.S. et al. "Flood Damages in an Infrastructure Climate Risk Stress Test: A Case Study of a Solar Power Plant Project." *Journal of Indonesian Project Management* (JIPM), 2025. https://jipm.iigf.co.id/index.php/jipm/article/download/137/53/633 — applies Huizinga et al. (2017) Industry function as solar proxy; 100-yr flood depth 0.387 m at Indonesian site.

27. **[P]** Chen, Y. (2020). Fragility curves for electric components (distribution grid) vs. flood depth. Cited in PNNL Fragility Functions Resource Report (Figure 38). — shows damage increasing steeply at shallow flood depths for distribution-level electrical components.

28. **[P]** Zhang, D. "Climate Change Challenges for the Geotechnical Design of Solar Farms." *ANZGeo 2023 Proceedings.* Australian New Zealand Geomechanics Society, 2023. https://www.insitutek.com/wp-content/uploads/2025/01/Climate-change-challenges-for-the-geotechnical-design-of-solar-farms-David-Zhang-ANZGeo2023.pdf — Australian pile failure case study; flooding-induced swelling and inadequate compaction.

29. **[P]** Shiradkar, N. et al. "Reliability and Safety Issues Observed in Flood Affected PV Power Plants and Strategies to Mitigate the Damage in Future." Conference paper, cited via Semantic Scholar. https://www.semanticscholar.org/paper/Reliability-and-Safety-Issues-Observed-in-Flood-PV-Shiradkar/6663724addf6aa9abbb8e23b81ac8c09aeb4d4c5 — identifies flood as major RE reliability risk.

30. **[P]** Brunner, P.H. et al. "Physical vulnerability database for critical infrastructure." *Natural Hazards and Earth System Sciences* 24: 4341–4367, 2024. https://nhess.copernicus.org/articles/24/4341/2024/nhess-24-4341-2024.pdf — comprehensive review; switchgear at 0.91 m (3 ft) a.g.l.; control room damage starts at flood onset, maximized at 2.13 m.

31. **[P]** Giugni, M. et al. "A Conceptual Model for the Estimation of Flood Damage to Power Grids." *Advances in Geosciences* 61: 1–11, 2023. https://adgeo.copernicus.org/articles/61/1/2023/adgeo-61-1-2023.html — comprehensive power grid flood damage model; solar farms flagged as vulnerable due to structural damage from foundation erosion.

32. **[P]** Mensin, P. "Solar PV systems under weather extremes: Case studies from Asia." *Energy Reports* 2024. https://www.sciencedirect.com/science/article/pii/S2352484724008813 — documents monsoon/flood damage to PV systems.

33. **[P]** Zanuttigh, B. et al. "Effects of damage initiation points of depth-damage function on flood risk assessment." *npj Natural Hazards* 2024. https://pmc.ncbi.nlm.nih.gov/articles/PMC11078111/ — DIP methodology; freeboard effects on AAL.

---

### Industry and Technical Guidance Sources

34. **[I]** Pacific Northwest National Laboratory (PNNL). *Fragility Functions Resource Report.* PNNL-33587. Richland, WA: PNNL, 2022. https://www.pnnl.gov/main/publications/external/technical_reports/PNNL-33587.pdf — compilation of flood fragility curves for HV/MV/LV substations.

35. **[I]** Natural Resources Canada. *Flood Damage to Critical Infrastructure.* Ottawa: NRC, 2021. (Referenced in National Research Council Canada publication.) https://nrc-publications.canada.ca/fra/voir/td/?id=9e48ed4c-ef70-4d04-a8ed-a58e48e8c5f3 — FEMA (2013) assumption: switchgear at 3 ft above grade = immediate short damage; no numerical depth tables for utility components.

36. **[I]** PV Magazine USA. "Climate Change and Solar Project Flood Risk." June 2023. https://pv-magazine-usa.com/2023/06/22/climate-change-and-solar-project-flood-risk/ — comprehensive review of flood risk at solar farms; structural, electrical, and access road damage pathways.

37. **[I]** Jackery Corporation. "IP68 Rating: Compares to IP65, IP66, IP67 Ratings for Solar Panels." January 2026. https://www.jackery.com/blogs/knowledge/ip68-rating-compares-to-ip65-ip66-ip67 — IP rating definitions.

38. **[I]** Index Enclosures. "IP67 vs IP68: What's the Best Choice for Industrial Use?" September 2025. https://indexenclosures.com/ip67-vs-ip68/ — confirms IP67: 1 m/30 min; IP68: manufacturer-specified deeper/longer.

39. **[I]** Thorne & Derrick / Power and Cables. "Flooding and Underground Cables: Myth or Reality?" September 2021. https://www.powerandcables.com/flooding-underground-cables/ — **key source**: underground MV cables rarely fail from flooding; terminations are primary risk.

40. **[I]** CB Cables. "Can XLPE Power Cables Be Used in Wet Locations?" September 2025. https://www.cbcables.com/blog/can-xlpe-power-cables-be-used-in-wet-locations.html — standard XLPE (YJV) PVC sheath degrades in 3–5 years of permanent submersion; armored XLPE better; waterproof XLPE (YJVQ) suitable for permanent immersion.

41. **[I]** MT Solar. "The Importance of Ground Clearance in Ground-Mount Solar Installations." July 2025. https://www.mtsolar.us/the-importance-of-ground-clearance-in-ground-mount-solar-installations/ — flood-prone areas: panels must be well above potential water levels.

42. **[I]** HeatSpring Magazine / Brit Heller. "Understanding Height and Clearance: Critical Design Parameters for Utility-Scale Solar Racking." February 2025. https://blog.heatspring.com/understanding-height-and-clearance-critical-design-parameters-for-utility-scale-solar-racking/ — tracker rotation angles 45–75°; minimum clearance determined by project specs and snow depths.

43. **[I]** GreenLancer. "Erosion Control in Solar Farms: Do Solar Farms Damage the Soil." December 2025. https://www.greenlancer.com/post/erosion-control-solar-farms — water erosion of solar farm soils; pile undermining from concentrated runoff.

44. **[I]** NREL. "Cost Considerations for Storm Hardening PV Systems for Resilience." NREL/TP-7A40-75804. Golden, CO: NREL, June 2020. https://docs.nrel.gov/docs/fy20osti/75804.pdf — storm hardening cost estimates.

45. **[I]** Fronius International. "Installation Considerations Regarding NEMA 4X Snap-INverters." Technical Article. https://www.fronius.com/~/downloads/Solar%20Energy/Technical%20Articles/SE_TEA_Fronius_SnapINverters_NEMA4X_Considerations_EN_US.pdf — NEMA 4X inverter installation guidance; drain holes void rating.

46. **[I]** IEA-PVPS Task 13. *Degradation and Failure Modes in New PV Modules.* IEA-PVPS T13-30, February 2025. https://iea-pvps.org/wp-content/uploads/2025/02/IEA-PVPS-T13-30-2025-REPORT-Degradation-and-Failure.pdf — degradation mechanisms including moisture; IEC testing limitations.

47. **[E]** Risk and Resilience Hub. "What Now? Assessing Damage Due to Floods." March 2022. https://www.riskandresiliencehub.com/what-now-assessing-damage-due-to-floods/ — Phase I corrosion inhibiting protocol; motors: disassemble, clean, bake; small relays: replace.

---

*End of RIVERINE FLOOD × Solar Subsystems Research Memorandum*
*Version: Gen-1 Research Draft | March 2026 | InfraSure Damage Curve Library*
