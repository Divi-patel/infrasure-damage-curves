# Data Model: Two-Table Schema

> The database architecture behind InfraSure's subsystem-level damage modeling

---

## Overview

InfraSure uses a **two-table model** that separates functional groups (subsystems) from physical equipment (components). This design emerged from iterative learning — an earlier single-table approach with self-referencing `parent_component_id` was confusing and conflated two distinct concepts.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                             asset                                │
│  asset_id (PK), asset_name, asset_type, latitude, longitude,    │
│  asset_exposure (total replacement cost USD), template_id, ...   │
└───────────────────────────────┬─────────────────────────────────┘
                                │ 1:N
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        asset_subsystem                           │
│  subsystem_id (PK), asset_id (FK), subsystem_code (FK),         │
│  capex_weight, hazard_curve_map (JSON), specs (JSON), notes      │
└───────────────────────────────┬─────────────────────────────────┘
                                │ 1:N
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        asset_component                           │
│  component_id (PK), subsystem_id (FK), component_code (FK),     │
│  manufacturer, model, serial_number, specs (JSON), notes         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Table Definitions

### `asset_subsystem`

The core table for damage modeling. Each row represents a functional group within an asset.

```sql
CREATE TABLE asset_subsystem (
    subsystem_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id          UUID NOT NULL REFERENCES asset(asset_id) ON DELETE CASCADE,
    subsystem_code    TEXT NOT NULL REFERENCES subsystem_code_lookup(code),
    capex_weight      NUMERIC(4,3) NOT NULL CHECK (capex_weight BETWEEN 0 AND 1),
    hazard_curve_map  JSONB DEFAULT '{}',
    specs             JSONB DEFAULT '{}',
    notes             TEXT,
    created_at        TIMESTAMPTZ DEFAULT now(),
    updated_at        TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE (asset_id, subsystem_code)  -- one subsystem per code per asset
);
```

**Key fields:**

| Field | Purpose | Example |
|-------|---------|---------|
| `capex_weight` | Fraction of asset replacement cost (0.0–1.0) | `0.32` for PV_ARRAY |
| `hazard_curve_map` | Resolved curve IDs per hazard (JSON) | See below |
| `specs` | Technical specifications driving curve matching | See below |

### `asset_component`

Physical equipment records. Used for asset management, not directly for damage modeling.

```sql
CREATE TABLE asset_component (
    component_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subsystem_id    UUID NOT NULL REFERENCES asset_subsystem(subsystem_id) ON DELETE CASCADE,
    component_code  TEXT NOT NULL REFERENCES component_code_lookup(code),
    manufacturer    TEXT,
    model           TEXT,
    serial_number   TEXT,
    specs           JSONB DEFAULT '{}',
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);
```

---

## The `hazard_curve_map` JSON

This JSONB field on `asset_subsystem` stores the resolved damage curve for each relevant hazard. It's populated by the matching engine at asset onboarding and updated when specs change or new curves are added.

### Structure

```json
{
  "HAIL": {
    "curve_id": "hail/pv_module_thick_glass",
    "resolution_tier": "specs-match",
    "match_details": {
      "matched_on": ["glass_thickness_mm"],
      "criteria": { "glass_thickness_mm": { "min": 3.8, "max": 4.5 } },
      "spec_value": { "glass_thickness_mm": 4.0 }
    },
    "resolved_at": "2026-03-12T14:30:00Z"
  },
  "HURRICANE": {
    "curve_id": "hurricane/pv_array_generic",
    "resolution_tier": "generic-fallback",
    "match_details": null,
    "resolved_at": "2026-03-12T14:30:00Z"
  },
  "WILDFIRE": {
    "curve_id": "wildfire/pv_array_generic",
    "resolution_tier": "generic-fallback",
    "match_details": null,
    "resolved_at": "2026-03-12T14:30:00Z"
  }
}
```

### Why Store Resolution Results?

1. **Performance** — Curve resolution happens once (at onboarding), not on every damage calculation
2. **Auditability** — Users can see exactly which curve was selected and why
3. **Reproducibility** — Re-running a historical damage calculation uses the same curve, even if the library has been updated since
4. **Diagnostics** — Easy to query how many assets use generic-fallback vs. specs-match:
   ```sql
   SELECT 
     hazard_curve_map->'HAIL'->>'resolution_tier' as tier,
     COUNT(*)
   FROM asset_subsystem
   WHERE subsystem_code = 'PV_ARRAY'
   GROUP BY 1;
   ```

---

## The `specs` JSON

Technical specifications for each subsystem, stored as flexible JSONB. The matching engine evaluates these against curve `match_criteria` to find the best curve.

### Solar — PV_ARRAY Specs

```json
{
  "cell_type": "mono_si",           // mono_si | poly_si | thin_film | hjt | topcon
  "glass_thickness_mm": 3.2,        // front glass thickness
  "bifacial": false,                // true | false
  "module_wattage_w": 545,          // nameplate wattage
  "manufacturer": "LONGi",
  "model": "Hi-MO 5m"
}
```

### Solar — MOUNTING Specs

```json
{
  "tracking_type": "single_axis",   // fixed | single_axis | dual_axis
  "stow_angle_deg": 0,             // hurricane stow angle
  "flood_stow_capable": true,       // can tilt to 75-85° in floods
  "max_wind_speed_mph": 110,       // rated wind survival speed
  "manufacturer": "Nextracker",
  "model": "NX Horizon"
}
```

### Solar — INVERTER_SYSTEM Specs

```json
{
  "inverter_type": "central",       // central | string | micro
  "power_rating_kw": 4400,
  "mounting_height_ft": 0.75,       // height above ground (critical for flood curves)
  "nema_rating": "4X",
  "manufacturer": "SMA",
  "model": "Sunny Central 4400-UP"
}
```

### Wind — ROTOR_ASSEMBLY Specs

```json
{
  "blade_length_m": 77,
  "blade_material": "glass_fiber_reinforced_epoxy",
  "rotor_diameter_m": 158,
  "hub_height_m": 90,
  "iec_class": "II",               // I | II | III | S
  "manufacturer": "GE",
  "model": "GE Cypress 5.5-158"
}
```

### Wind — TOWER Specs

```json
{
  "tower_type": "tubular_steel",    // tubular_steel | lattice | concrete_hybrid
  "hub_height_m": 90,
  "base_diameter_m": 5.2,
  "wall_thickness_mm": 35,
  "design_wind_speed_ms": 59.5
}
```

---

## Subsystem Code Lookup

Controlled vocabulary for subsystem types:

```sql
CREATE TABLE subsystem_code_lookup (
    code          TEXT PRIMARY KEY,
    asset_type    TEXT NOT NULL,      -- 'solar' | 'wind' | 'shared'
    display_name  TEXT NOT NULL,
    description   TEXT,
    sort_order    INTEGER
);
```

| Code | Asset Type | Display Name |
|------|-----------|-------------|
| PV_ARRAY | solar | PV Array |
| MOUNTING | solar | Mounting Structure |
| INVERTER_SYSTEM | solar | Inverter System |
| SUBSTATION | shared | Substation |
| ELECTRICAL | shared | Electrical Collection |
| CIVIL_INFRA | shared | Civil Infrastructure |
| SCADA | shared | SCADA & Monitoring |
| ROTOR_ASSEMBLY | wind | Rotor Assembly |
| NACELLE | wind | Nacelle & Drivetrain |
| TOWER | wind | Tower |
| FOUNDATION | wind | Foundation |
| POWER_ELECTRONICS | wind | Power Electronics |

"Shared" subsystems (Substation, Electrical, Civil Infra, SCADA) are common to both solar and wind assets but may have different default capex weights.

---

## Component Code Lookup

```sql
CREATE TABLE component_code_lookup (
    code            TEXT PRIMARY KEY,
    subsystem_code  TEXT NOT NULL REFERENCES subsystem_code_lookup(code),
    display_name    TEXT NOT NULL,
    description     TEXT,
    sort_order      INTEGER
);
```

Selected entries:

| Component Code | Subsystem | Display Name |
|---------------|-----------|-------------|
| PV_MODULE | PV_ARRAY | PV Module |
| TRACKER | MOUNTING | Single-Axis Tracker |
| FIXED_MOUNT | MOUNTING | Fixed-Tilt Racking |
| INVERTER | INVERTER_SYSTEM | Inverter |
| COMBINER_BOX | INVERTER_SYSTEM | Combiner Box |
| TRANSFORMER_MAIN | SUBSTATION | Main Power Transformer |
| BLADE | ROTOR_ASSEMBLY | Turbine Blade |
| HUB | ROTOR_ASSEMBLY | Rotor Hub |
| PITCH_SYSTEM | ROTOR_ASSEMBLY | Pitch System |
| GEARBOX | NACELLE | Gearbox |
| GENERATOR | NACELLE | Generator |
| YAW_SYSTEM | NACELLE | Yaw System |
| TOWER_SECTION | TOWER | Tower Section |
| FOUNDATION_BASE | FOUNDATION | Foundation Base |

---

## Template Integration

Templates pre-fill default subsystems and components when creating a new asset:

```
Template: "Utility-Scale Solar (SAT)"
├── PV_ARRAY (0.32) → PV_MODULE
├── MOUNTING (0.10)  → TRACKER
├── INVERTER_SYSTEM (0.08) → INVERTER, COMBINER_BOX
├── SUBSTATION (0.07) → TRANSFORMER_MAIN, SWITCHGEAR
├── ELECTRICAL (0.10) → CABLE_COLLECTION, CABLE_AC
├── CIVIL_INFRA (0.08) → ROAD, FENCING, BUILDING
└── SCADA (0.03) → MONITORING_SYSTEM, MET_STATION

Template: "Onshore Wind"
├── ROTOR_ASSEMBLY (0.27) → BLADE, HUB, PITCH_SYSTEM
├── NACELLE (0.22) → GEARBOX, GENERATOR, YAW_SYSTEM, COOLING_SYSTEM
├── TOWER (0.13) → TOWER_SECTION
├── FOUNDATION (0.10) → FOUNDATION_BASE
├── ELECTRICAL (0.10) → CABLE_COLLECTION
├── SUBSTATION (0.07) → TRANSFORMER_MAIN
└── CIVIL_INFRA (0.08) → ROAD, BUILDING
```

Users can modify defaults: add/remove subsystems, adjust capex weights, override specs.

---

## Design Decisions

### Why Two Tables Instead of One?

The previous single-table design (`asset_component` with `parent_component_id`) mixed:
- "How much of the asset cost is this group?" (subsystem question)
- "What equipment is in this group?" (component question)

Separating them gives:
1. **Clean queries** — `asset_subsystem` drives all damage calculations; `asset_component` drives asset management
2. **Clear ownership** — `capex_weight` and `hazard_curve_map` live on subsystem; `serial_number` and `manufacturer` live on component
3. **Simpler validation** — capex_weights on subsystems must sum to ≤ 1.0; no confusing parent/child math

### Why JSON `specs` Instead of Typed Columns?

Different subsystem types need different specifications:
- PV_ARRAY needs `glass_thickness_mm`, `cell_type`, `bifacial`
- TOWER needs `hub_height_m`, `wall_thickness_mm`, `tower_type`

Using JSON avoids:
- Hundreds of nullable columns on a single table
- Schema migrations every time a new spec is needed
- Separate tables per subsystem type (table sprawl)

**Governance:** Spec keys follow a controlled naming convention (`snake_case`, suffixed with unit: `_mm`, `_m`, `_ft`, `_mph`, `_kw`). New keys require review against the `specs_governance` document.

### Why `hazard_curve_map` on Subsystem?

Alternative: Store curve assignments in a separate junction table. This was rejected because:
1. JSONB keeps the resolution context (tier, criteria, timestamp) co-located with the subsystem
2. Reduces joins in the damage calculation hot path
3. The number of hazards per subsystem is small (3-6), so JSONB is efficient
4. PostgreSQL JSONB indexing allows efficient queries on curve IDs

---

## Migration Path

### From v0.2 (Single Table) → v0.3 (Two-Table)

```sql
-- 1. Create new tables
CREATE TABLE asset_subsystem ( ... );
CREATE TABLE asset_component_new ( ... );

-- 2. Migrate data
INSERT INTO asset_subsystem (asset_id, subsystem_code, capex_weight, specs)
SELECT DISTINCT 
    asset_id,
    component_code,  -- old parent codes become subsystem codes
    capital_pct,
    specs
FROM asset_component
WHERE parent_component_id IS NULL;

-- 3. Re-run matching engine to populate hazard_curve_map
-- (automated via curve_resolution_service)

-- 4. Drop old table after validation
DROP TABLE asset_component;
ALTER TABLE asset_component_new RENAME TO asset_component;
```

---

## Query Examples

### Get all subsystem damage ratios for a hazard event

```sql
WITH event AS (
    SELECT 'HURRICANE' as hazard, 140 as intensity
)
SELECT 
    a.asset_name,
    s.subsystem_code,
    s.capex_weight,
    s.hazard_curve_map->e.hazard->>'curve_id' as curve_id,
    s.hazard_curve_map->e.hazard->>'resolution_tier' as tier
FROM asset a
JOIN asset_subsystem s ON s.asset_id = a.asset_id
CROSS JOIN event e
WHERE s.hazard_curve_map ? e.hazard;
```

### Find assets using only generic curves

```sql
SELECT 
    a.asset_name,
    COUNT(*) as generic_count,
    COUNT(*) FILTER (
        WHERE s.hazard_curve_map->'HAIL'->>'resolution_tier' != 'generic-fallback'
    ) as specific_count
FROM asset a
JOIN asset_subsystem s ON s.asset_id = a.asset_id
WHERE a.asset_type = 'solar'
GROUP BY a.asset_name;
```

### Audit specs completeness

```sql
SELECT 
    a.asset_name,
    s.subsystem_code,
    jsonb_object_keys(s.specs) as spec_key,
    s.specs->>jsonb_object_keys(s.specs) as spec_value
FROM asset a
JOIN asset_subsystem s ON s.asset_id = a.asset_id
WHERE a.asset_type = 'solar'
ORDER BY a.asset_name, s.subsystem_code;
```
