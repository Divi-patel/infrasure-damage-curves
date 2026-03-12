# Confidence Framework

> How InfraSure assigns and uses confidence levels for damage curves

---

## Overview

Every damage curve in the library is assigned a **confidence level** that communicates how much trust should be placed in its parameters. This isn't a statistical confidence interval — it's a structured expert assessment of evidence quality, validated against a transparent rubric.

InfraSure's philosophy: **honest uncertainty is more valuable than false precision.** Users should know which curves are well-supported and which are educated guesses.

---

## The 6-Tier Scale

| Level | Score | Meaning |
|-------|:-----:|---------|
| **Medium-High** | 5 | Strong empirical data + engineering standard validation; parameters cross-checked against multiple independent sources |
| **Medium** | 4 | Multiple sources agree; at least one empirical anchor point; engineering standards provide boundary checks |
| **Low-Medium** | 3 | Some empirical support but limited sample size; engineering standards provide the primary basis; proxy adaptation from analogous structures |
| **Medium-Low** | 3 | Similar to low-medium but with more reliance on proxy adaptation than direct evidence |
| **Low** | 2 | Primarily expert judgment; limited direct evidence; parameters based on physical first principles without empirical calibration |
| **Very-Low** | 1 | Near-zero risk scenarios with no empirical data; placeholder curves based entirely on engineering reasoning |

**Note:** "Low-Medium" and "Medium-Low" are distinguished by the direction of evidence. Low-Medium has some empirical support trending upward; Medium-Low has reasonable proxy adaptation but trending toward expert judgment.

---

## What Drives Each Level

### Medium-High (1 curve)

**Example:** `hail/pv_module_generic`

Requirements met:
- ✅ Empirical data from post-event assessments (IBHS hail chamber, field damage surveys)
- ✅ Validated against engineering test standard (IEC 61215 hail test protocol)
- ✅ Parameters cross-checked against independent sources (Brody et al. radar-hail model, NOAA storm reports)
- ✅ x₀ calibrated to observed damage median, not just estimated
- ✅ k fitted to observed cumulative damage distribution

Why not "High":
- No asset-specific insurance claims dataset with exact intensity measurements
- Hail size estimation from radar has uncertainty (MESH vs. actual stone size)
- Sample sizes from controlled tests are limited (typically n < 100)

### Medium (11 curves)

**Examples:** `hurricane/blade_generic`, `flood/pv_array_fixed_tilt`, `flood/inverter_system_generic`

Requirements met:
- ✅ At least one empirical anchor (e.g., Rose et al. 2012 for hurricane/wind, Thailand flood data for flood/solar)
- ✅ Engineering standards define design thresholds (IEC 61400-1, IEEE C57)
- ✅ Multiple independent sources agree on parameter range
- ❌ Limited sample sizes or geographic coverage
- ❌ Some proxy adaptation involved

### Low-Medium / Medium-Low (14 curves)

**Examples:** `hurricane/mounting_tracker_solar`, `wildfire/pv_array_generic`, `flood/electrical_cables_generic`

Requirements met:
- ✅ Engineering standards provide boundary estimates
- ✅ Proxy curves from analogous structures (HAZUS building curves adapted for RE)
- ❌ No direct empirical data for this specific subsystem × hazard
- ❌ Physical reasoning is sound but unvalidated
- ❌ Parameters estimated from component thresholds, not observed damage

### Low (11 curves)

**Examples:** `hurricane/foundation_generic`, `strong_wind/foundation_generic`, `wildfire/mounting_tracker_generic`

Requirements met:
- ✅ Physical first principles are clear (we understand the failure mechanism)
- ❌ No empirical data
- ❌ No published curves for this exact combination
- ❌ Engineering standards may not cover this specific exposure
- ❌ Primarily expert judgment

### Very-Low (2 curves)

**Examples:** `wildfire/rotor_assembly_wind_generic`, `wildfire/nacelle_wind_generic`

These represent near-zero risk scenarios:
- Wind turbine elevated components (80-120m above ground) are essentially immune to ground-level wildfire
- No documented case of external wildfire damaging elevated turbine components
- Curves exist as placeholders with extreme x₀ values (75,000–80,000 kW/m) to formally represent "near-zero risk" rather than leaving the entry blank

---

## Current Distribution

```
Medium-High  ████                                           1 ( 2.4%)
Medium       ████████████████████████████                  11 (26.2%)
Low-Medium   ██████████████████████████████                14 (33.3%)  ← combined
Low          ████████████████████████████                  11 (26.2%)
Very-Low     ████                                           2 ( 4.8%)
                                                           ──
                                                           42 curves
```

**Interpretation:** The library is intentionally transparent about its current state. Most curves are in the "low-medium" to "medium" range, meaning they have engineering basis but limited empirical validation. This is consistent with the state of the field — very few RE-specific fragility functions exist in published literature.

---

## How Confidence Levels Are Used

### 1. In Damage Calculations

Confidence levels do NOT directly modify the curve output. A low-confidence curve produces the same damage ratio as a high-confidence curve for the same parameters. The confidence rating is metadata, not a scaling factor.

**Rationale:** Mixing confidence with damage estimates creates opaque adjustments. Users should see the raw model output and apply their own judgment about uncertainty.

### 2. In Reporting

Confidence levels appear in:
- The dashboard (color-coded badges on each curve)
- API responses (as metadata on damage estimates)
- Portfolio-level summaries (aggregate confidence profile)

Example portfolio report output:
```
Portfolio Hail Risk Assessment
├── 45 assets analyzed
├── Weighted average damage ratio: 0.12
├── Confidence profile:
│   ├── 30 assets used medium-high confidence curves (PV_ARRAY)
│   ├── 15 assets used low confidence curves (MOUNTING)
│   └── Recommended: Improve MOUNTING specs for better curve resolution
```

### 3. In Prioritizing Research

Confidence levels drive the research roadmap. Low-confidence curves with high capex-weight subsystems get priority for empirical validation:

```
Research Priority Score = (1 - confidence_score/5) × capex_weight × hazard_frequency

Highest priority combinations:
1. Hurricane × MOUNTING (solar)  — low-medium confidence, 0.10 weight, high frequency in FL/TX
2. Wildfire × PV_ARRAY (solar)   — low-medium confidence, 0.32 weight, growing frequency in CA
3. Flood × ELECTRICAL (solar)    — low-medium confidence, 0.10 weight, moderate frequency
```

### 4. In User Communications

When presenting results to stakeholders:
- **Medium-High / Medium curves:** Present as "modeled estimates with reasonable empirical support"
- **Low-Medium / Medium-Low curves:** Present as "engineering estimates based on standards and proxy data"
- **Low / Very-Low curves:** Present as "preliminary estimates based on expert judgment; additional validation recommended"

---

## Upgrading Confidence

A curve's confidence level can be upgraded when new evidence becomes available:

| Current Level | What's Needed to Upgrade | Example |
|--------------|--------------------------|---------|
| Very-Low → Low | Physical reasoning documented; component thresholds identified | Document steel thermal limits for tower base |
| Low → Low-Medium | Engineering standard covers the loading scenario | Find ASCE or IEC standard for this hazard × structure combination |
| Low-Medium → Medium | At least one independent empirical data point | Post-event assessment data matching our intensity range |
| Medium → Medium-High | Multiple empirical sources; cross-validation | Insurance claims dataset correlated with hazard intensity |
| Medium-High → High | Large empirical dataset (n > 50); statistical fitting; peer-reviewed | Dedicated fragility study published in peer-reviewed journal |

---

## Derivation Method → Typical Confidence Mapping

| Derivation Method | Count | Typical Confidence | Description |
|-------------------|:-----:|:------------------:|-------------|
| Empirical | 3 | Medium–Medium-High | Direct observation of damage at known intensity |
| Empirical + Engineering | 5 | Medium | Observed data anchored by standards |
| Engineering-Standard | 10 | Low-Medium–Medium | Standards define thresholds; curve shape estimated |
| Engineering + Expert | 6 | Low–Low-Medium | Standards plus judgment for gaps |
| Proxy-Adapted | 8 | Low–Low-Medium | Analogous structure curves adjusted |
| Expert-Judgment | 5 | Low–Very-Low | Physical reasoning without empirical validation |
| Component-Weighted | 2 | Medium | Aggregated from component-level evidence |
| Composite/Proxy | 3 | Medium–Low-Medium | Blended from multiple proxy sources |

---

## Comparison to Industry Practices

| Provider | Confidence Reporting | InfraSure Advantage |
|----------|---------------------|---------------------|
| RMS | Proprietary; confidence not disclosed | Fully transparent 6-tier scale |
| AIR | "Uncertainty range" but parameters hidden | Open parameters + derivation chain |
| HAZUS | Ratings for building stock only; no RE | RE-specific subsystem curves |
| CLIMADA | Open source but limited RE coverage | 42 RE-specific curves with subsystem granularity |
| JBA | Flood-focused; limited multi-hazard | 6 hazard types with consistent methodology |

InfraSure's transparency allows users to make informed decisions about where to invest in better data collection and which results to treat with appropriate caution.
