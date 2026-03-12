# Curve Derivation Methodology

> How InfraSure derives logistic damage curve parameters from first principles, literature, and expert judgment

---

## Overview

Every damage curve in this library was derived using a structured methodology that prioritizes transparency over false precision. This document explains the derivation process, the hierarchy of evidence sources, and how parameters (L, k, x₀) are determined for each subsystem × hazard pair.

---

## The Derivation Hierarchy

Sources are ranked by reliability. Each curve's `derivation` field records which levels were used:

```
EVIDENCE QUALITY HIERARCHY
═══════════════════════════════════════════════════════════════

TIER 1: Empirical Data (Highest)
├── Post-event damage assessments with intensity measurements
├── Insurance claims databases with hazard correlation
├── Laboratory testing under controlled conditions
└── Examples: IBHS hail chamber tests, Rose et al. 2012 wind turbine damage

TIER 2: Engineering Standards
├── IEC, ASCE, UL, ASTM design load specifications
├── Component test requirements (e.g., IEC 61215 hail test)
├── Material property specifications (glass breakage thresholds)
└── Examples: IEC 61400-1 turbine design classes, ASCE 7-22 wind loads

TIER 3: Proxy Adaptation
├── Curves from analogous structures (buildings → solar farms)
├── HAZUS functions adapted for RE-specific geometry/materials
├── CLIMADA impact functions with RE calibration
└── Examples: HAZUS commercial building flood curves → solar substation

TIER 4: Expert Judgment (Lowest)
├── Engineering reasoning from physical first principles
├── Boundary estimates (damage certainly < X at intensity Y)
├── Panel consensus from domain experts
└── Examples: Wildfire × wind turbine (no empirical data exists)
```

---

## The 3-Parameter Derivation Process

For each curve, we derive three parameters:

### Parameter L — Maximum Damage Ratio (Cap)

**What it represents:** The maximum proportion of the subsystem's replacement cost that can be damaged, even at extreme hazard intensities.

**Why L < 1.0 in most cases:**
- Some components within a subsystem are inherently protected (underground cables during wind events)
- Complete destruction is rare — some components survive even extreme events
- Recovery/salvage value means not 100% of replacement cost is lost

**How we derive L:**

1. **Identify vulnerable components** within the subsystem and their cost shares
2. **Determine maximum damage** for each component at extreme intensity
3. **Weight by cost share:** `L = Σ(component_cost_share × max_component_damage)`

*Example — ROTOR_ASSEMBLY under Hurricane:*
```
Component        Cost Share   Max Damage   Contribution
BLADE            0.55         0.95         0.5225
HUB              0.25         0.80         0.2000
PITCH_SYSTEM     0.20         0.75         0.1500
                                     L  =  0.8725 ≈ 0.88
```

### Parameter x₀ — Midpoint Intensity

**What it represents:** The hazard intensity at which the subsystem reaches 50% of its maximum damage ratio (L/2).

**Derivation approaches (in order of preference):**

1. **Empirical median** — If post-event data exists, x₀ is the intensity at which ~50% of observed samples show significant damage
   - *Source:* Rose et al. 2012 PNAS dataset for wind turbine destruction thresholds
   
2. **Design standard exceedance** — x₀ is set near the design load limit specified by engineering standards
   - *Example:* IEC 61400-1 Class II turbine: design wind speed = 59.5 m/s (133 mph). Setting x₀ slightly below at 118 mph reflects that damage begins before the design limit and reaches 50% at moderate exceedance
   
3. **Component threshold integration** — Average the onset thresholds of individual components, weighted by vulnerability
   - *Example:* For hail × PV module, IEC 61215 test ice ball = 25mm at 23 m/s → threshold at ~38mm real hail. Field observations show cracking onset at 40-50mm, catastrophic at 75+ mm → x₀ ≈ 59mm

4. **Expert elicitation** — Ask: "At what intensity would you expect roughly half the subsystem cost to be damaged?"

### Parameter k — Steepness (Rate of Damage Ramp)

**What it represents:** How quickly damage transitions from minimal to maximal around x₀. Higher k = sharper transition (more binary); lower k = gradual ramp.

**Derivation approaches:**

1. **From D10/D90 spread** — If we can estimate the 10% and 90% damage intensities:
   ```
   k = ln(9) / (x_90 - x_50) ≈ 2.197 / (x_90 - x_50)
   ```
   Or equivalently: `k ≈ 4.394 / (x_90 - x_10)`

2. **Physical reasoning about failure mode:**
   - **Brittle failure** (glass breakage, structural collapse) → high k (sharp transition)
   - **Progressive degradation** (corrosion, fatigue, water intrusion) → low k (gradual ramp)
   - **Mixed failure modes** → intermediate k

3. **Calibration to known data points** — If we have 2+ (intensity, damage_ratio) observations, fit the logistic curve

**Physical interpretation:**

| k value (per unit intensity) | Transition Width (10%→90% L) | Failure Type |
|:---:|:---:|---|
| > 0.15 | Very narrow | Near-binary (e.g., flood depth exceeding equipment height) |
| 0.05–0.15 | Moderate | Mixed mechanisms (e.g., hail → progressive glass breakage) |
| 0.01–0.05 | Wide | Gradual (e.g., wind → progressive structural overload) |
| < 0.01 | Very wide | Slow onset (e.g., wildfire → thermal gradient damage) |

---

## Derivation Methods by Hazard Type

### Hail × Solar

**Primary evidence:** IEC 61215 hail impact tests, IBHS hail chamber studies, radar-observed damage correlations

**x₀ derivation for PV modules:**
1. IEC 61215 requires modules survive 25mm ice ball at 23 m/s → kinetic energy threshold ≈ 4.6 J
2. Field data shows damage onset at 38-45mm (IBHS chamber studies)
3. Catastrophic panel loss at 75+ mm (post-storm satellite assessments)
4. x₀ = 59.2mm calibrated to match observed 50% damage threshold
5. Cross-validated against Brody et al. (2023) radar-based hail damage model

**L derivation:**
- L = 0.95 (not 1.0) because junction boxes and some wiring survive even when glass is destroyed
- CdTe/thin-film: L = 0.90 due to more resilient substrate construction

### Hurricane × Wind Turbines

**Primary evidence:** Rose et al. 2012 PNAS — the only large-scale empirical dataset of wind turbine damage in hurricanes

**Key data points from Rose et al.:**
- 0% damage at < 93 mph (no turbines damaged below this threshold)
- 50% damage probability at ~118-120 mph
- Near-total destruction (tower collapse or blade loss) at > 150 mph
- Sample: post-event assessment of turbines across Gulf Coast hurricanes

**x₀ derivation for blades:**
- x₀ = 118 mph directly from the empirical median destruction threshold
- k = 0.0669 fitted to the Rose et al. cumulative distribution
- L = 0.90 because some blade sections may be salvageable

### Wildfire × Solar

**Primary evidence:** Component thermal thresholds from material science literature, USFS fire behavior models

**Challenge:** No empirical dataset of wildfire damage to solar farms exists. Derivation is entirely from engineering first principles.

**Approach:**
1. Identify thermal failure thresholds for each material in the subsystem:
   - EVA encapsulant: melting at 150-170°C, degradation at 120°C sustained
   - Tempered glass: thermal shock cracking at ΔT > 200°C
   - Backsheet polymer: ignition at 350-400°C
   - Aluminum frame: softening at 250°C, structural failure at 400°C
   
2. Model radiative heat flux as a function of fireline intensity and distance:
   ```
   q(I, d) = I / (4π × d²)    [simplified point-source]
   ```
   
3. Map heat flux to surface temperature using convective heat transfer models
4. Identify the intensity at which each component reaches its failure temperature
5. Weight by cost share to get subsystem-level x₀

**Result:** Inverter system (x₀ = 1,300 kW/m) is most vulnerable because electronics have the lowest thermal tolerance. PV array (x₀ = 2,100 kW/m) is moderately vulnerable. Civil infrastructure (x₀ = 2,100 kW/m) is comparable.

### Flood × Solar

**Primary evidence:** HAZUS flood damage functions + empirical solar flood studies (Thailand 2011, Hurricane Harvey 2017)

**Key insight:** Flood damage is driven by **component elevation above ground**, not just flood depth. The matching engine uses specs like `tracking_type` to determine panel height:

| Configuration | Leading Edge Height | x₀ (flood depth) |
|--------------|:-------------------:|:-----------------:|
| Fixed tilt 20-25° | ~2.0 ft | 2.0 ft |
| SAT horizontal stow | ~2.5 ft | 2.5 ft |
| SAT flood stow (75-85°) | ~7.0 ft | 7.0 ft |

**k is high (1.8–3.5)** because flood damage is near-binary: once water reaches the component, damage is rapid and severe. This is physically correct — electronics hit by floodwater are almost certainly destroyed.

### Winter Weather × Wind

**Primary evidence:** IEC 61400-1 Annex L (ice loading), ISO 12494 (ice actions on structures), PNNL transmission line fragility

**Intensity variable:** Radial ice accretion (inches) on a standard conductor, which correlates with atmospheric icing severity.

**Key physical mechanisms:**
- Blade ice loading → mass imbalance → bearing stress → pitch system failure
- Tower ice + wind → combined loading → exceeds design envelope
- Conductor icing → galloping → transmission line failure

### Strong Wind × Wind Turbines

**Similar to Hurricane × Wind** but calibrated for non-tropical events (derechos, downbursts). Key difference: strong wind events are shorter duration and may not trigger cut-out protection, so turbines can be hit while spinning. x₀ values are slightly higher than hurricane equivalents because operational turbines have some aerodynamic resilience.

---

## Validation Approach

### Cross-Validation Checks

For each curve, we verify:

1. **Boundary sanity** — DR approaches 0 at low intensity, approaches L at extreme intensity
2. **Threshold consistency** — Damage onset matches engineering standard test levels
3. **Comparative ordering** — More vulnerable subsystems have lower x₀ (e.g., inverters fail before foundations in floods)
4. **Literature concordance** — Where published curves exist (HAZUS, CLIMADA), our curves fall within reasonable range
5. **Physical plausibility** — k values match expected failure mode (brittle vs. gradual)

### Sensitivity Analysis

For each curve, we identify which parameter has the most impact on loss estimates:

| Parameter | High Sensitivity When | Implication |
|-----------|----------------------|-------------|
| **L** | Subsystem has high capex weight | Investing in better L estimates pays off for high-value subsystems |
| **x₀** | Most events cluster near x₀ | x₀ errors cause large swings in loss when events hit the "ramp" zone |
| **k** | Events are near x₀ | k matters most in the transition zone; less important at extremes |

---

## Known Limitations

1. **Single-hazard assumption** — Each curve models one hazard in isolation. Compound events (hurricane wind + storm surge + debris) are not yet modeled
2. **Time-invariant** — Curves don't account for asset age, degradation, or prior damage
3. **Intensity homogeneity** — Single intensity value per asset; no within-site spatial variation
4. **Limited empirical calibration** — Only 3 of 42 curves have strong empirical backing; most rely on engineering standards and expert judgment
5. **No aleatory uncertainty** — Curves produce point estimates; no probabilistic damage distribution yet

---

## Improving Confidence Over Time

The curve library is designed to evolve as new evidence becomes available:

```
CONFIDENCE IMPROVEMENT PATHWAY
═══════════════════════════════════════════════════════════════

Phase 1 (Current): Expert Judgment + Standards
├── 42 curves, mostly low-to-medium confidence
├── 280+ cited sources
└── Transparent derivation chain

Phase 2 (Next): Post-Event Calibration
├── Partner with insurers for claims data
├── Satellite-based damage detection validation
├── Update x₀ and k from observed damage distributions

Phase 3 (Future): Continuous Learning
├── Bayesian updating: prior (current curves) + new data → posterior
├── Model-match curves from manufacturer test data
├── Ensemble approach: multiple curve variants with uncertainty bounds
```
