# InfraSure Damage Curve Library

> **Transparent, subsystem-level fragility functions for renewable energy natural hazard risk modeling**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## What Is This?

This repository contains InfraSure's open damage curve library — a collection of **42 logistic fragility functions** that model physical damage to solar and wind farm subsystems under 6 natural hazard types. Every curve, parameter, derivation method, and source citation is fully documented and auditable.

### Why Open Curves?

Most commercial catastrophe models treat damage functions as proprietary black boxes. InfraSure takes the opposite approach:

- **Every parameter is justified** — L, k, x₀ values are traceable to engineering standards, empirical studies, or documented expert judgment
- **Every source is cited** — 280+ references across all research files with URLs/DOIs
- **Confidence is honest** — each curve is rated from "very-low" to "medium-high" with clear reasoning
- **Derivation methods are explicit** — empirical, engineering-standard, proxy-adapted, or expert-judgment

---

## Coverage

### Hazard × Asset Matrix

| Hazard | Solar | Wind | Priority |
|--------|:-----:|:----:|:--------:|
| **Hail** | ✅ 6 curves | — | 5 |
| **Hurricane** | ✅ 7 curves | ✅ 5 curves | 5 / 4 |
| **Wildfire** | ✅ 6 curves | ✅ 3 curves | 5 / 4 |
| **Flood (Riverine)** | ✅ 7 curves | — | 4 |
| **Strong Wind** | — | ✅ 4 curves | 4 |
| **Winter Weather** | — | ✅ 4 curves | 4 |

**Total: 42 curves across 10 subsystems and 8 hazard × asset combinations**

### Subsystems Covered

**Solar:** PV Array, Mounting, Inverter System, Substation, Electrical, Civil Infra

**Wind:** Rotor Assembly, Tower, Nacelle, Foundation, Electrical

---

## Functional Form

All curves use the **logistic (sigmoid) function**:

```
DR(x) = L / (1 + exp(-k × (x - x₀)))
```

Where:
- **DR(x)** — Damage Ratio at intensity x (0.0 to 1.0)
- **L** — Maximum damage ratio (asymptotic cap); reflects that even extreme events may not destroy 100% of a subsystem
- **k** — Steepness parameter; controls how rapidly damage ramps up around x₀
- **x₀** — Midpoint intensity; the hazard level at which damage reaches L/2
- **x** — Hazard intensity in native units (mm, mph, kW/m, ft, in)

---

## Repository Structure

```
infrasure-damage-curves/
│
├── README.md                          ← You are here
├── LICENSE
│
├── data/
│   └── master_curve_index.json        ← Machine-readable index of all 42 curves
│
├── research/                          ← Deep research files (one per hazard × asset type)
│   ├── HAIL_x_SOLAR.md               ← Hail damage to solar subsystems
│   ├── HURRICANE_x_WIND.md           ← Hurricane damage to wind turbine subsystems
│   ├── HURRICANE_x_SOLAR.md          ← Hurricane damage to solar subsystems
│   ├── WILDFIRE_x_SOLAR.md           ← Wildfire damage to solar subsystems
│   ├── WILDFIRE_x_WIND.md            ← Wildfire damage to wind turbine subsystems
│   ├── FLOOD_x_SOLAR.md              ← Riverine flood damage to solar subsystems
│   ├── STRONG_WIND_x_WIND.md         ← Strong wind damage to wind turbine subsystems
│   ├── WINTER_WEATHER_x_WIND.md      ← Winter weather damage to wind turbine subsystems
│   └── research_context.md           ← Shared research context and requirements
│
├── docs/                              ← Technical documentation
│   ├── matching-engine.md             ← How the 3-tier curve resolution engine works
│   ├── aggregation-model.md           ← Company → Asset → Subsystem → Component hierarchy
│   ├── curve-derivation-methodology.md← How curves are derived from first principles
│   ├── data-model.md                  ← Two-table schema design (asset_subsystem + asset_component)
│   ├── confidence-framework.md        ← How confidence levels are assigned and used
│   └── hazard-intensity-variables.md  ← Intensity variable selection per hazard type
│
└── dashboard/                         ← Interactive curve explorer (React + Vite + Tailwind)
    ├── client/                        ← Frontend source code
    │   └── src/
    │       ├── pages/                 ← 5 pages: Overview, Explorer, Compare, Backend, Sources
    │       ├── data/curves.ts         ← All 42 curves as TypeScript data
    │       └── components/
    ├── server/                        ← Express server
    ├── package.json
    └── ...
```

---

## Documentation Guide

| Document | What It Covers |
|----------|----------------|
| [Matching Engine](docs/matching-engine.md) | How InfraSure resolves which damage curve to apply: model-match → specs-match → generic fallback |
| [Aggregation Model](docs/aggregation-model.md) | How damage rolls up from components → subsystems → assets → portfolios |
| [Curve Derivation](docs/curve-derivation-methodology.md) | The methodology for deriving logistic curve parameters from literature, standards, and expert judgment |
| [Data Model](docs/data-model.md) | The two-table schema (`asset_subsystem` + `asset_component`), `hazard_curve_map`, and `specs` JSON |
| [Confidence Framework](docs/confidence-framework.md) | The 6-tier confidence scale and what drives each rating |
| [Hazard Intensity Variables](docs/hazard-intensity-variables.md) | Why each hazard uses its specific intensity metric and how to source the data |

---

## Interactive Dashboard

The dashboard provides 5 views for exploring the curve library:

1. **Overview** — KPIs, coverage matrices, confidence distribution, and curve count charts
2. **Curve Explorer** — Interactive logistic curve visualization with L, k, x₀ sliders for parameter tuning
3. **Compare Curves** — Overlay multiple curves on a single chart to compare subsystem vulnerability
4. **Backend View** — Shows how the matching engine resolves curves, computes weighted damage, and generates JSON/SQL output
5. **Sources** — Full citation browser for all 280+ references

**Live Demo:** [InfraSure Damage Curve Explorer](https://www.perplexity.ai/computer/a/infrasure-damage-curve-explore-Q3EaKR0ASj.BqXmw66CCtw)

### Running the Dashboard Locally

```bash
cd dashboard
npm install
npm run dev
```

The app starts at `http://localhost:5000`.

---

## Quick Start: Using a Curve

### 1. Look Up the Curve

Find your hazard × subsystem pair in `data/master_curve_index.json`:

```json
{
  "curve_id": "hail/pv_module_generic",
  "subsystem": "PV_ARRAY",
  "component": "PV_MODULE",
  "specificity": "generic",
  "L": 0.95,
  "k": 0.1064,
  "x0": 59.2,
  "confidence": "medium-high",
  "derivation": "empirical + engineering-standard"
}
```

### 2. Compute Damage Ratio

```python
import math

def damage_ratio(x, L, k, x0):
    """Logistic damage function."""
    return L / (1 + math.exp(-k * (x - x0)))

# Example: 50mm hail hitting a standard PV module
dr = damage_ratio(50, L=0.95, k=0.1064, x0=59.2)
print(f"Damage Ratio: {dr:.3f}")  # → 0.276
```

### 3. Aggregate to Asset Level

```python
# Subsystem capex weights (example solar plant)
subsystems = {
    "PV_ARRAY":        {"weight": 0.32, "curve": "hail/pv_module_generic"},
    "MOUNTING":         {"weight": 0.10, "curve": "hail/tracker_generic"},
    "INVERTER_SYSTEM":  {"weight": 0.08, "curve": None},  # No hail curve needed
    "SUBSTATION":       {"weight": 0.07, "curve": None},
    "ELECTRICAL":       {"weight": 0.10, "curve": None},
    "CIVIL_INFRA":      {"weight": 0.08, "curve": None},
}

intensity = 50  # mm hail
asset_dr = sum(
    s["weight"] * damage_ratio(intensity, **curves[s["curve"]])
    for s in subsystems.values()
    if s["curve"] is not None
)
print(f"Asset-level DR: {asset_dr:.3f}")
```

---

## Curve ID Convention

```
{hazard_type}/{target}_{specificity}
```

- **hazard_type** — lowercase hazard code: `hail`, `hurricane`, `wildfire`, `strong_wind`, `flood`, `winter_weather`
- **target** — subsystem or component: `pv_module`, `blade`, `rotor_assembly`, `tower_section`
- **specificity** — resolution tier: `generic`, `specs` (spec-matched), `model` (model-matched)

Examples:
- `hail/pv_module_generic` — standard PV module, any manufacturer
- `hail/pv_module_thick_glass` — thick glass (4.0mm) module variant
- `hurricane/blade_generic` — wind turbine blade, generic fragility
- `flood/inverter_system_generic` — pad-mounted inverter, generic flood depth function

---

## Confidence Distribution

| Level | Count | Description |
|-------|:-----:|-------------|
| Medium-High | 1 | Strong empirical basis with test standard validation |
| Medium | 11 | Multiple independent sources; reasonable cross-validation |
| Low-Medium / Medium-Low | 14 | Limited empirical data; relies on engineering standards + proxy adaptation |
| Low | 11 | Primarily expert judgment; limited direct evidence |
| Very-Low | 2 | Near-zero risk scenarios; placeholder curves based on expert judgment |

---

## Contributing

This is an active research project. If you have:
- **Empirical damage data** from post-event assessments of RE assets
- **Engineering studies** on component fragility under natural hazards
- **Corrections or improvements** to existing curves

Please open an issue or submit a pull request with sources.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## About InfraSure

InfraSure builds transparent risk models for renewable energy infrastructure. We believe the RE industry deserves risk analytics that are auditable, not opaque. This damage curve library is one piece of that mission.
