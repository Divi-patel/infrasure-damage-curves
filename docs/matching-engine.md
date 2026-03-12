# Matching Engine: 3-Tier Curve Resolution

> How InfraSure determines which damage curve to apply for a given subsystem × hazard pair

---

## Overview

When a hazard event strikes an asset, the matching engine must answer: **which specific damage curve should be used for each subsystem?** Not all PV modules are the same — a bifacial glass-glass panel with 2mm glass is far more vulnerable to hail than a standard 3.2mm tempered glass module. The matching engine resolves the most specific applicable curve.

---

## The 3-Tier Resolution Hierarchy

The engine uses a **specificity cascade** — it tries the most precise match first and falls back progressively:

```
┌─────────────────────────────────────────────────────────────┐
│  TIER 1: Model Match                                        │
│  Match on manufacturer + model number                       │
│  e.g., "First Solar Series 7" → CdTe-specific hail curve   │
│  Highest precision · Requires model-level curve library      │
├─────────────────────────────────────────────────────────────┤
│  TIER 2: Specs Match                                        │
│  Match on technical specifications from asset_subsystem.specs│
│  e.g., glass_thickness_mm: 4.0 → thick-glass hail curve    │
│  Medium precision · Uses spec ranges defined in match_criteria│
├─────────────────────────────────────────────────────────────┤
│  TIER 3: Generic Fallback                                   │
│  Default curve for that subsystem × hazard combination      │
│  e.g., "PV_MODULE" + "HAIL" → pv_module_generic            │
│  Lowest precision · Always available                         │
└─────────────────────────────────────────────────────────────┘
```

---

## How Each Tier Works

### Tier 1: Model Match

The engine looks for a curve with `specificity: "model"` that matches the exact `manufacturer` and `model` fields in the subsystem's `specs` JSON.

```json
// asset_subsystem.specs
{
  "manufacturer": "First Solar",
  "model": "FS-7445A",
  "cell_type": "thin_film"
}

// Matching curve
{
  "curve_id": "hail/pv_module_fs7445a",
  "specificity": "model",
  "match_criteria": {
    "manufacturer": "First Solar",
    "model_prefix": "FS-74"
  }
}
```

**Current state:** No model-level curves exist yet in Gen-1. This tier is designed for future expansion as empirical data becomes available for specific equipment models.

### Tier 2: Specs Match

The engine evaluates `match_criteria` against the subsystem's `specs` JSON. Match criteria can include:

| Criteria Type | Example | Logic |
|---------------|---------|-------|
| Exact match | `"cell_type": "thin_film"` | `specs.cell_type === "thin_film"` |
| Range match | `"glass_thickness_mm": {"min": 3.8, "max": 4.5}` | `3.8 <= specs.glass_thickness_mm <= 4.5` |
| Boolean match | `"bifacial": true` | `specs.bifacial === true` |
| Combined | Multiple criteria | All must match (AND logic) |

**Example — Hail × PV Module with specs resolution:**

```
Input: subsystem_code = "PV_ARRAY", hazard = "HAIL"
       specs = { "glass_thickness_mm": 4.0, "bifacial": false }

Step 1: Filter curves → subsystem = "PV_ARRAY", hazard_code = "HAIL"
        Found: 4 candidates (generic, thick_glass, cdte_thin_film, bifacial_2mm)

Step 2: Try specs-match candidates:
        ├── hail/pv_module_thick_glass
        │   match_criteria: { "glass_thickness_mm": {"min": 3.8, "max": 4.5} }
        │   Check: 3.8 ≤ 4.0 ≤ 4.5 → ✅ MATCH
        │
        ├── hail/pv_module_cdte_thin_film
        │   match_criteria: { "cell_type": "thin_film" }
        │   Check: specs has no cell_type "thin_film" → ❌ NO MATCH
        │
        └── hail/pv_module_bifacial_2mm
            match_criteria: { "bifacial": true, "glass_thickness_mm": {"max": 2.5} }
            Check: bifacial = false → ❌ NO MATCH

Step 3: Best match = hail/pv_module_thick_glass
        Result: L=0.95, k=0.1145, x0=72.5
```

### Tier 3: Generic Fallback

If no model or specs match is found, the engine uses the `specificity: "generic"` curve for that subsystem × hazard pair. Every subsystem × hazard combination in the library has exactly one generic curve.

```
Input: subsystem_code = "PV_ARRAY", hazard = "HAIL"
       specs = {}  ← no spec data available

Result: hail/pv_module_generic (L=0.95, k=0.1064, x0=59.2)
```

**Design decision:** Generic curves are intentionally conservative (lower x₀, meaning damage onset at lower intensity) to avoid underestimating risk when equipment specifics are unknown.

---

## Resolution Algorithm (Pseudocode)

```python
def resolve_curve(subsystem_code: str, hazard_code: str, specs: dict) -> Curve:
    """
    Resolve the best-matching damage curve for a subsystem × hazard pair.
    Returns: (curve, resolution_tier)
    """
    # Get all candidate curves for this subsystem × hazard
    candidates = curve_library.filter(
        subsystem=subsystem_code,
        hazard=hazard_code
    )
    
    # TIER 1: Model match
    model_curves = [c for c in candidates if c.specificity == "model"]
    for curve in model_curves:
        if matches_criteria(specs, curve.match_criteria):
            return curve, "model-match"
    
    # TIER 2: Specs match
    specs_curves = [c for c in candidates if c.specificity == "specs"]
    matches = []
    for curve in specs_curves:
        if matches_criteria(specs, curve.match_criteria):
            matches.append(curve)
    
    if matches:
        # If multiple specs-match, pick the one with the most criteria matched
        best = max(matches, key=lambda c: len(c.match_criteria))
        return best, "specs-match"
    
    # TIER 3: Generic fallback
    generic = [c for c in candidates if c.specificity == "generic"]
    if generic:
        return generic[0], "generic-fallback"
    
    # No curve available for this combination
    return None, "no-curve"


def matches_criteria(specs: dict, criteria: dict) -> bool:
    """Check if asset specs satisfy all match criteria."""
    for key, requirement in criteria.items():
        value = specs.get(key)
        if value is None:
            return False
        
        if isinstance(requirement, dict):
            # Range match
            if "min" in requirement and value < requirement["min"]:
                return False
            if "max" in requirement and value > requirement["max"]:
                return False
        else:
            # Exact match
            if value != requirement:
                return False
    
    return True
```

---

## Resolution in the `hazard_curve_map`

Each `asset_subsystem` row stores a `hazard_curve_map` JSON field that records which curve was resolved for each hazard:

```json
// asset_subsystem row for a specific PV Array
{
  "subsystem_code": "PV_ARRAY",
  "capex_weight": 0.32,
  "specs": {
    "glass_thickness_mm": 4.0,
    "cell_type": "mono_si",
    "bifacial": false
  },
  "hazard_curve_map": {
    "HAIL": {
      "curve_id": "hail/pv_module_thick_glass",
      "resolution_tier": "specs-match",
      "resolved_at": "2026-03-12T14:30:00Z"
    },
    "HURRICANE": {
      "curve_id": "hurricane/pv_array_generic",
      "resolution_tier": "generic-fallback",
      "resolved_at": "2026-03-12T14:30:00Z"
    },
    "WILDFIRE": {
      "curve_id": "wildfire/pv_array_generic",
      "resolution_tier": "generic-fallback",
      "resolved_at": "2026-03-12T14:30:00Z"
    }
  }
}
```

This means curve resolution happens **at asset onboarding time** (when specs are provided) and is cached. Re-resolution occurs when:
- Specs are updated (e.g., user provides more detailed equipment data)
- New curves are added to the library (e.g., a model-match curve becomes available)
- A curve is updated (e.g., confidence upgrade from new empirical data)

---

## Current Curve Inventory by Specificity

| Specificity | Count | Description |
|-------------|:-----:|-------------|
| **generic** | 30 | Default fallback for each subsystem × hazard pair |
| **specs** | 12 | Spec-matched variants (glass thickness, tracking type, stow mode, etc.) |
| **model** | 0 | Not yet available; designed for future manufacturer-specific curves |

---

## Worked Example: Full Resolution for a Solar Farm

**Asset:** 100 MW fixed-tilt solar farm in Texas

**Specs provided:**
```json
{
  "PV_ARRAY": { "glass_thickness_mm": 3.2, "cell_type": "mono_si", "tracking_type": "fixed" },
  "MOUNTING": { "tracking_type": "fixed" },
  "INVERTER_SYSTEM": {},
  "SUBSTATION": {},
  "ELECTRICAL": {},
  "CIVIL_INFRA": {}
}
```

**Hail resolution results:**

| Subsystem | Resolved Curve | Tier | x₀ |
|-----------|---------------|------|----|
| PV_ARRAY | `hail/pv_module_generic` | generic-fallback | 59.2 mm |
| MOUNTING | `hail/fixed_mount_generic` | generic-fallback | 100 mm |
| INVERTER_SYSTEM | — | no-curve | — |
| SUBSTATION | — | no-curve | — |
| ELECTRICAL | — | no-curve | — |
| CIVIL_INFRA | — | no-curve | — |

**Hurricane resolution results:**

| Subsystem | Resolved Curve | Tier | x₀ |
|-----------|---------------|------|----|
| PV_ARRAY | `hurricane/pv_array_fixed_tilt` | specs-match | 130 mph |
| MOUNTING | `hurricane/mounting_fixed_solar` | generic-fallback | 140 mph |
| SUBSTATION | `hurricane/substation_solar` | generic-fallback | 120 mph |
| INVERTER_SYSTEM | — | no-curve | — |
| ELECTRICAL | — | no-curve | — |
| CIVIL_INFRA | — | no-curve | — |

The specs-match on PV_ARRAY for hurricane uses `tracking_type: "fixed"` to select the fixed-tilt-specific curve (x₀ = 130 mph) instead of the generic fleet-average (x₀ = 135 mph).

---

## Design Principles

1. **Conservative fallbacks** — Generic curves err on the side of higher vulnerability to avoid under-reporting risk
2. **Monotonic specificity** — More specific matches should never produce higher damage estimates than less specific ones for the same intensity (validated during curve design)
3. **Explicit resolution logging** — Every resolution step is traceable: which curve, which tier, which criteria matched
4. **Deterministic** — Same specs + same library version = same resolution every time
5. **Extensible** — Adding model-match curves requires no schema changes, only new entries in the curve library

---

## Future: Tier 0 — Empirical Override

A planned future tier allows project-specific empirical curves derived from post-event assessments:

```
TIER 0: Empirical Override
├── Source: Post-event damage assessment for this specific asset
├── Specificity: This exact site was damaged; we have ground truth
└── Usage: Overrides all library curves for that asset × hazard pair
```

This would integrate with InfraSure's claims data pipeline when available.
