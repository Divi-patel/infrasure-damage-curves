# Aggregation Model: Company → Asset → Subsystem → Component

> How InfraSure rolls up damage from individual components to portfolio-level loss

---

## Overview

InfraSure's aggregation model defines how physical damage to individual components propagates upward through a hierarchy to produce a single **Asset Damage Ratio (DR)** and ultimately a **Portfolio Loss** estimate. This is the core mechanism that translates fragility curves into financial impact.

---

## The Hierarchy

```
                    ┌──────────────────────────────────────┐
                    │           PORTFOLIO / COMPANY         │
                    │  Total exposure: Σ asset_exposure     │
                    │  Portfolio_Loss = Σ Asset_Loss        │
                    └──────────────────┬───────────────────┘
                                       │ 1:N
                    ┌──────────────────▼───────────────────┐
                    │              ASSET                    │
                    │  asset_exposure (total replacement $) │
                    │  Asset_DR = Σ(w_i × DR_i(intensity)) │
                    │  Asset_Loss = Asset_DR × asset_exposure│
                    └──────────────────┬───────────────────┘
                                       │ 1:N
                    ┌──────────────────▼───────────────────┐
                    │           SUBSYSTEM                   │
                    │  capex_weight (w_i, 0.0-1.0)         │
                    │  hazard_curve_map → curve_id          │
                    │  DR_i = curve(intensity)              │
                    └──────────────────┬───────────────────┘
                                       │ 1:N
                    ┌──────────────────▼───────────────────┐
                    │           COMPONENT                   │
                    │  Physical equipment within subsystem  │
                    │  e.g., PV_MODULE, BLADE, INVERTER     │
                    │  (damage modeled at subsystem level)  │
                    └──────────────────────────────────────┘
```

---

## Level-by-Level Breakdown

### Level 1: Component

The lowest level represents individual physical equipment:

| Asset Type | Subsystem | Components |
|-----------|-----------|------------|
| Solar | PV_ARRAY | PV_MODULE |
| Solar | MOUNTING | TRACKER, FIXED_MOUNT |
| Solar | INVERTER_SYSTEM | INVERTER, COMBINER_BOX |
| Solar | SUBSTATION | TRANSFORMER_MAIN, TRANSFORMER_AUX, SWITCHGEAR |
| Solar | ELECTRICAL | CABLE_COLLECTION, CABLE_AC |
| Solar | CIVIL_INFRA | ROAD, FENCING, BUILDING |
| Wind | ROTOR_ASSEMBLY | BLADE, HUB, PITCH_SYSTEM |
| Wind | NACELLE | GEARBOX, GENERATOR, YAW_SYSTEM, COOLING_SYSTEM |
| Wind | TOWER | TOWER_SECTION |
| Wind | FOUNDATION | FOUNDATION_BASE |

**Key design decision:** Damage curves are defined at the **subsystem level**, not individual component level. A "PV_ARRAY" damage curve models the combined vulnerability of modules + wiring + connectors within that functional group. Component-level detail exists in the schema for asset management (tracking serial numbers, warranty info, maintenance records) but the damage model operates at the subsystem grain.

### Level 2: Subsystem

Each subsystem has:
- A **capex weight** (`w_i`) — its share of total asset replacement cost
- A **hazard_curve_map** — resolved curve IDs for each applicable hazard
- A **specs JSON** — technical specifications that drive curve matching

**Damage Ratio calculation:**

```
DR_i(intensity) = L_i / (1 + exp(-k_i × (intensity - x0_i)))
```

Where L_i, k_i, x0_i come from the resolved curve for subsystem i × hazard.

### Level 3: Asset

The **Asset Damage Ratio** is a capex-weighted sum of subsystem damage ratios:

```
Asset_DR(intensity) = Σ(w_i × DR_i(intensity))
```

Where:
- `w_i` = `capex_weight` for subsystem i
- `DR_i(intensity)` = damage ratio for subsystem i at the given hazard intensity
- Sum is over all subsystems that have a curve for this hazard

**Asset Loss** converts the damage ratio to dollars:

```
Asset_Loss = Asset_DR × asset_exposure
```

Where `asset_exposure` is the total replacement cost of the asset in USD.

### Level 4: Portfolio / Company

Portfolio loss is simply the sum of individual asset losses:

```
Portfolio_Loss = Σ Asset_Loss_j
```

Where j ranges over all assets in the portfolio affected by the event.

---

## Capex Weights

Capex weights determine how much each subsystem contributes to the asset-level damage ratio. They must sum to ≤ 1.0 (typically 0.75–0.85, since not all subsystems have damage curves).

### Default Weights — Solar

| Subsystem | Typical Weight | Range | Source |
|-----------|:-----------:|-------|--------|
| PV_ARRAY | 0.32 | 0.28–0.35 | NREL ATB 2024 + LBNL Utility-Scale Solar |
| MOUNTING | 0.10 | 0.08–0.12 | NREL SAM cost model |
| INVERTER_SYSTEM | 0.08 | 0.06–0.10 | NREL SAM cost model |
| SUBSTATION | 0.07 | 0.05–0.10 | EPC contractor data |
| ELECTRICAL | 0.10 | 0.08–0.12 | EPC contractor data |
| CIVIL_INFRA | 0.08 | 0.05–0.10 | EPC contractor data |
| SCADA | 0.03 | 0.02–0.05 | System integrator estimates |

### Default Weights — Wind

| Subsystem | Typical Weight | Range | Source |
|-----------|:-----------:|-------|--------|
| ROTOR_ASSEMBLY | 0.27 | 0.25–0.30 | NREL Wind Turbine Design Cost & Scaling |
| NACELLE | 0.22 | 0.20–0.25 | NREL + OEM data |
| TOWER | 0.13 | 0.12–0.15 | NREL + OEM data |
| FOUNDATION | 0.10 | 0.08–0.12 | EPC contractor data |
| ELECTRICAL | 0.10 | 0.08–0.12 | Balance of plant |
| SUBSTATION | 0.07 | 0.05–0.10 | Balance of plant |
| CIVIL_INFRA | 0.08 | 0.05–0.10 | Balance of plant |

**Important:** These are defaults. Users can override capex weights per asset when they have actual cost breakdowns from EPC contracts or financial models.

---

## Worked Example: Hurricane Hitting a Solar Farm

### Setup

- **Asset:** 50 MW single-axis tracker solar farm in South Florida
- **Exposure:** $55,000,000 total replacement cost
- **Event:** Hurricane with 140 mph peak gust at asset centroid

### Step 1: Resolve Curves

| Subsystem | Weight | Resolved Curve | Resolution |
|-----------|:------:|---------------|------------|
| PV_ARRAY | 0.32 | `hurricane/pv_array_tracker_stow` | specs-match (tracking_type: single_axis) |
| MOUNTING | 0.10 | `hurricane/mounting_tracker_solar` | generic |
| INVERTER_SYSTEM | 0.08 | — | no curve |
| SUBSTATION | 0.07 | `hurricane/substation_solar` | generic |
| ELECTRICAL | 0.10 | — | no curve |
| CIVIL_INFRA | 0.08 | — | no curve |

### Step 2: Compute Subsystem Damage Ratios

At intensity = 140 mph:

| Subsystem | L | k | x₀ | DR(140) |
|-----------|-----|------|------|---------|
| PV_ARRAY | 0.85 | 0.055 | 148 | 0.366 |
| MOUNTING | 0.80 | 0.055 | 120 | 0.650 |
| SUBSTATION | 0.80 | 0.040 | 120 | 0.565 |

*Calculation for PV_ARRAY:*
```
DR = 0.85 / (1 + exp(-0.055 × (140 - 148)))
   = 0.85 / (1 + exp(0.44))
   = 0.85 / (1 + 1.553)
   = 0.85 / 2.553
   = 0.333
```

### Step 3: Compute Asset-Level Damage

```
Asset_DR = (0.32 × 0.333) + (0.10 × 0.650) + (0.07 × 0.565)
         = 0.107 + 0.065 + 0.040
         = 0.211
```

### Step 4: Compute Financial Loss

```
Asset_Loss = 0.211 × $55,000,000 = $11,628,500
```

### Step 5: Interpret

- **21.1% damage ratio** — consistent with Cat 4 hurricane damage to well-stowed solar farms
- **$11.6M estimated loss** — primarily driven by PV array (module replacement) and mounting system (tracker repair/replacement)
- **Conservative estimate** — does not include revenue loss from downtime, debris removal, or potential cascading failures

---

## Aggregation Edge Cases

### Missing Curves

When a subsystem has no curve for a given hazard, it contributes zero to the weighted sum. The denominator is NOT adjusted — this means uncovered subsystems implicitly assume zero damage, which is appropriate (e.g., hail doesn't damage underground cables).

### Subsystem Without Specs

If specs are empty or unavailable, the matching engine falls to generic-fallback. Generic curves are calibrated conservatively, so missing specs → slightly higher damage estimates.

### Correlated vs. Independent Damage

**Current model assumption:** Subsystem damage ratios are independent given the same hazard intensity. In reality, correlations exist (e.g., if wind destroys the tracker, modules likely also fail). This is a known Gen-1 simplification. Gen-2 plans include:
- Conditional damage modeling (if MOUNTING fails, PV_ARRAY damage jumps)
- Cascading failure chains
- Debris generation models (failed modules become projectiles)

### Spatial Variation Within an Asset

For large solar farms (>100 MW), hazard intensity may vary across the site. Current model uses a single intensity at the asset centroid. Gen-2 plans include:
- Block-level intensity mapping
- Spatial correlation of damage within the array
- Terrain and shielding effects

---

## Why Capex-Weighted Aggregation?

### Alternatives Considered

| Approach | Pros | Cons | Decision |
|----------|------|------|----------|
| **Capex-weighted** | Simple, transparent, directly maps to financial loss | Ignores functional dependencies | ✅ Selected for Gen-1 |
| **Functional dependency graph** | Captures cascading failures (e.g., substation down → whole plant offline) | Complex, hard to validate, data-hungry | Deferred to Gen-2 |
| **Revenue-weighted** | Captures production impact | Requires energy model coupling, varies by season/time | Deferred to Gen-2 |
| **Repair-cost weighted** | More accurate loss estimate | Repair costs ≠ replacement costs; data scarce | Not selected |

Capex weighting was chosen because:
1. Replacement cost is the standard insurance metric for property damage
2. NREL provides well-documented cost breakdowns for solar and wind
3. It's transparent and easily auditable by users
4. It gracefully handles missing curves (zero contribution, not NaN)

---

## Output Formats

### JSON Output

```json
{
  "asset_id": "asset_0042",
  "hazard": "HURRICANE",
  "intensity": 140,
  "intensity_unit": "mph",
  "asset_damage_ratio": 0.211,
  "asset_loss_usd": 11628500,
  "subsystem_breakdown": [
    {
      "subsystem": "PV_ARRAY",
      "capex_weight": 0.32,
      "curve_id": "hurricane/pv_array_tracker_stow",
      "resolution_tier": "specs-match",
      "damage_ratio": 0.333,
      "weighted_contribution": 0.107
    },
    {
      "subsystem": "MOUNTING",
      "capex_weight": 0.10,
      "curve_id": "hurricane/mounting_tracker_solar",
      "resolution_tier": "generic-fallback",
      "damage_ratio": 0.650,
      "weighted_contribution": 0.065
    },
    {
      "subsystem": "SUBSTATION",
      "capex_weight": 0.07,
      "curve_id": "hurricane/substation_solar",
      "resolution_tier": "generic-fallback",
      "damage_ratio": 0.565,
      "weighted_contribution": 0.040
    }
  ]
}
```

### SQL Schema (Damage Event Table)

```sql
CREATE TABLE damage_event (
    event_id          UUID PRIMARY KEY,
    asset_id          UUID REFERENCES asset(asset_id),
    hazard_code       TEXT NOT NULL,
    intensity         NUMERIC NOT NULL,
    intensity_unit    TEXT NOT NULL,
    asset_dr          NUMERIC NOT NULL,
    asset_loss_usd    NUMERIC,
    computed_at       TIMESTAMPTZ DEFAULT now(),
    curve_library_version TEXT,
    subsystem_details JSONB  -- full breakdown per subsystem
);
```
