import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  hazardGroups,
  logistic,
  getAllCurves,
  HAZARD_COLORS,
  HAZARD_LABELS,
  SUBSYSTEM_LABELS,
  CONFIDENCE_COLORS,
} from "@/data/curves";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

interface SimulatedAsset {
  name: string;
  type: "solar" | "wind";
  capacity_mw: number;
  replacement_cost: number;
  subsystems: {
    subsystem: string;
    capex_weight: number;
    component_model?: string;
    specs?: Record<string, any>;
  }[];
}

const EXAMPLE_ASSETS: SimulatedAsset[] = [
  {
    name: "Sunflower Solar Farm",
    type: "solar",
    capacity_mw: 150,
    replacement_cost: 180_000_000,
    subsystems: [
      { subsystem: "PV_ARRAY", capex_weight: 0.35, component_model: "LONGi Hi-MO 6 (Mono)", specs: { glass_thickness_mm: 3.2, cell_type: "mono_si", bifacial: false } },
      { subsystem: "MOUNTING", capex_weight: 0.12, component_model: "NEXTracker NX Horizon", specs: { tracking_type: "single_axis" } },
      { subsystem: "INVERTER_SYSTEM", capex_weight: 0.08, component_model: "SMA Sunny Central 4600UP" },
      { subsystem: "SUBSTATION", capex_weight: 0.10 },
      { subsystem: "ELECTRICAL", capex_weight: 0.15 },
      { subsystem: "CIVIL_INFRA", capex_weight: 0.20 },
    ],
  },
  {
    name: "Ridge Wind Project",
    type: "wind",
    capacity_mw: 200,
    replacement_cost: 320_000_000,
    subsystems: [
      { subsystem: "ROTOR_ASSEMBLY", capex_weight: 0.25 },
      { subsystem: "TOWER", capex_weight: 0.20 },
      { subsystem: "NACELLE", capex_weight: 0.30 },
      { subsystem: "FOUNDATION", capex_weight: 0.15 },
      { subsystem: "ELECTRICAL", capex_weight: 0.10 },
    ],
  },
  {
    name: "Desert Thin-Film Plant",
    type: "solar",
    capacity_mw: 300,
    replacement_cost: 270_000_000,
    subsystems: [
      { subsystem: "PV_ARRAY", capex_weight: 0.30, component_model: "First Solar Series 7", specs: { glass_thickness_mm: 4.0, cell_type: "thin_film", bifacial: false } },
      { subsystem: "MOUNTING", capex_weight: 0.10, component_model: "Fixed Tilt 25°", specs: { tracking_type: "fixed" } },
      { subsystem: "INVERTER_SYSTEM", capex_weight: 0.09 },
      { subsystem: "SUBSTATION", capex_weight: 0.12 },
      { subsystem: "ELECTRICAL", capex_weight: 0.16 },
      { subsystem: "CIVIL_INFRA", capex_weight: 0.23 },
    ],
  },
];

function resolveMatchingCurve(
  hazardCode: string,
  assetType: string,
  subsystem: string,
  specs?: Record<string, any>
): { curve: ReturnType<typeof getAllCurves>[0] | null; matchType: string; steps: string[] } {
  const allCurves = getAllCurves();
  const candidates = allCurves.filter(
    (c) => c.hazard_code === hazardCode && c.asset_type === assetType && c.subsystem === subsystem
  );

  const steps: string[] = [];
  steps.push(`[SEARCH] hazard=${hazardCode}, asset=${assetType}, subsystem=${subsystem}`);
  steps.push(`[CANDIDATES] Found ${candidates.length} curve(s)`);

  if (candidates.length === 0) {
    steps.push("[RESULT] No curve available for this subsystem × hazard pair");
    return { curve: null, matchType: "none", steps };
  }

  // Try specs-match first
  if (specs) {
    const specsMatch = candidates.find((c) => {
      if (!c.match_criteria) return false;
      return Object.entries(c.match_criteria).every(([key, val]) => {
        const specVal = specs[key];
        if (specVal === undefined) return false;
        if (typeof val === "object" && val !== null) {
          if ("min" in val && specVal < val.min) return false;
          if ("max" in val && specVal > val.max) return false;
          return true;
        }
        return specVal === val;
      });
    });

    if (specsMatch) {
      steps.push(`[SPECS MATCH] Checking specs: ${JSON.stringify(specs)}`);
      steps.push(`[MATCH] → ${specsMatch.curve_id} (criteria: ${JSON.stringify(specsMatch.match_criteria)})`);
      return { curve: specsMatch, matchType: "specs", steps };
    } else {
      steps.push(`[SPECS] No specs-match found, trying generic fallback`);
    }
  }

  // Generic fallback
  const generic = candidates.find((c) => c.specificity === "generic");
  if (generic) {
    steps.push(`[GENERIC FALLBACK] → ${generic.curve_id}`);
    return { curve: generic, matchType: "generic", steps };
  }

  // Use first available
  steps.push(`[FIRST AVAILABLE] → ${candidates[0].curve_id}`);
  return { curve: candidates[0], matchType: "fallback", steps };
}

export default function Backend() {
  const [selectedAssetIdx, setSelectedAssetIdx] = useState(0);
  const [intensityInput, setIntensityInput] = useState("");

  const asset = EXAMPLE_ASSETS[selectedAssetIdx];

  // Get applicable hazards for this asset type
  const applicableGroups = hazardGroups.filter((g) => g.asset_type === asset.type);
  const [selectedHazard, setSelectedHazard] = useState(applicableGroups[0]?.hazard_code || "HAIL");
  const selectedGroup = applicableGroups.find((g) => g.hazard_code === selectedHazard) || applicableGroups[0];

  // Resolve curves for all subsystems
  const resolutions = useMemo(() => {
    return asset.subsystems.map((sub) => {
      const result = resolveMatchingCurve(selectedHazard, asset.type, sub.subsystem, sub.specs);
      return { ...sub, ...result };
    });
  }, [asset, selectedHazard]);

  // Compute weighted damage
  const intensityVal = parseFloat(intensityInput) || 0;
  const weightedDamage = useMemo(() => {
    if (!intensityVal) return null;
    let totalWeightedDR = 0;
    let totalWeight = 0;
    resolutions.forEach((r) => {
      if (r.curve) {
        const dr = logistic(intensityVal, r.curve.L, r.curve.k, r.curve.x0);
        totalWeightedDR += dr * r.capex_weight;
        totalWeight += r.capex_weight;
      }
    });
    if (totalWeight === 0) return null;
    const assetDR = totalWeightedDR;
    const dollarLoss = assetDR * asset.replacement_cost;
    return { assetDR, dollarLoss, details: resolutions.map((r) => ({
      subsystem: r.subsystem,
      curve_id: r.curve?.curve_id || "—",
      dr: r.curve ? logistic(intensityVal, r.curve.L, r.curve.k, r.curve.x0) : 0,
      weight: r.capex_weight,
      weightedDR: r.curve ? logistic(intensityVal, r.curve.L, r.curve.k, r.curve.x0) * r.capex_weight : 0,
      dollarLoss: r.curve ? logistic(intensityVal, r.curve.L, r.curve.k, r.curve.x0) * r.capex_weight * asset.replacement_cost : 0,
    }))};
  }, [intensityVal, resolutions, asset]);

  // Generate JSON output
  const hazardCurveMapJSON = useMemo(() => {
    const map: Record<string, any> = {};
    resolutions.forEach((r) => {
      if (r.curve) {
        map[r.subsystem] = {
          curve_id: r.curve.curve_id,
          match_type: r.matchType,
          confidence: r.curve.confidence,
          params: { L: r.curve.L, k: r.curve.k, x0: r.curve.x0 },
        };
      }
    });
    return map;
  }, [resolutions]);

  // SQL for UPDATE
  const sqlStatement = useMemo(() => {
    const json = JSON.stringify(hazardCurveMapJSON, null, 2);
    return `-- Matching Engine Output: ${selectedHazard} hazard_curve_map\nUPDATE asset_subsystem\nSET hazard_curve_map = jsonb_set(\n  COALESCE(hazard_curve_map, '{}'::jsonb),\n  '{${selectedHazard}}',\n  '${json}'::jsonb\n)\nWHERE asset_id = '${asset.name.toLowerCase().replace(/\s+/g, "_")}';\n\n-- Per-subsystem curve assignments:\n${resolutions.map(r => `-- ${r.subsystem}: ${r.curve?.curve_id || 'NO CURVE'} [${r.matchType}]`).join("\n")}`;
  }, [hazardCurveMapJSON, selectedHazard, asset, resolutions]);

  return (
    <div className="p-6 space-y-4 overflow-y-auto h-full">
      <div>
        <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">Backend View</h1>
        <p className="text-sm text-muted-foreground mt-1">How the matching engine resolves curves and computes damage estimates</p>
      </div>

      {/* Asset + Hazard Selection */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Example Asset</Label>
          <Select value={String(selectedAssetIdx)} onValueChange={(v) => { setSelectedAssetIdx(parseInt(v)); setIntensityInput(""); }}>
            <SelectTrigger className="w-[260px]" data-testid="select-asset">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXAMPLE_ASSETS.map((a, i) => (
                <SelectItem key={i} value={String(i)}>
                  {a.name} ({a.type}, {a.capacity_mw} MW)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Hazard</Label>
          <Select value={selectedHazard} onValueChange={setSelectedHazard}>
            <SelectTrigger className="w-[200px]" data-testid="select-hazard-backend">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {applicableGroups.map((g) => (
                <SelectItem key={`${g.hazard_code}_${g.research_file}`} value={g.hazard_code}>
                  <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: HAZARD_COLORS[g.hazard_code] }} />
                  {HAZARD_LABELS[g.hazard_code]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Intensity ({selectedGroup?.intensity_unit})</Label>
          <Input
            type="number"
            placeholder={`Enter ${selectedGroup?.intensity_variable || "intensity"}`}
            value={intensityInput}
            onChange={(e) => setIntensityInput(e.target.value)}
            className="w-[180px]"
            data-testid="input-intensity"
          />
        </div>
      </div>

      <Tabs defaultValue="resolution" className="space-y-4">
        <TabsList>
          <TabsTrigger value="resolution" data-testid="tab-resolution">Curve Resolution</TabsTrigger>
          <TabsTrigger value="damage" data-testid="tab-damage">Damage Estimation</TabsTrigger>
          <TabsTrigger value="output" data-testid="tab-output">JSON / SQL Output</TabsTrigger>
        </TabsList>

        {/* Resolution Tab */}
        <TabsContent value="resolution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: Asset Configuration */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Asset Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded bg-muted/50">
                    <div className="text-muted-foreground">Name</div>
                    <div className="font-medium">{asset.name}</div>
                  </div>
                  <div className="p-2 rounded bg-muted/50">
                    <div className="text-muted-foreground">Type</div>
                    <div className="font-medium capitalize">{asset.type}</div>
                  </div>
                  <div className="p-2 rounded bg-muted/50">
                    <div className="text-muted-foreground">Capacity</div>
                    <div className="font-medium">{asset.capacity_mw} MW</div>
                  </div>
                  <div className="p-2 rounded bg-muted/50">
                    <div className="text-muted-foreground">Replacement Cost</div>
                    <div className="font-medium">${(asset.replacement_cost / 1e6).toFixed(0)}M</div>
                  </div>
                </div>
                <div className="border-t pt-2">
                  <div className="text-muted-foreground mb-1 font-medium">Subsystem Composition</div>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-1 font-medium text-muted-foreground">Subsystem</th>
                        <th className="text-right py-1 font-medium text-muted-foreground">Weight</th>
                        <th className="text-left py-1 font-medium text-muted-foreground pl-2">Model / Specs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {asset.subsystems.map((s) => (
                        <tr key={s.subsystem} className="border-b border-border/30">
                          <td className="py-1 font-medium">{SUBSYSTEM_LABELS[s.subsystem]}</td>
                          <td className="py-1 text-right font-mono">{(s.capex_weight * 100).toFixed(0)}%</td>
                          <td className="py-1 pl-2 text-muted-foreground truncate max-w-[200px]">
                            {s.component_model || "Generic"}
                            {s.specs && <span className="text-orange-500 ml-1">*</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="text-[10px] text-orange-500 mt-1">* Has specs that affect curve resolution</div>
                </div>
              </CardContent>
            </Card>

            {/* Right: Resolution Steps */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  Matching Engine Resolution
                  <Badge variant="outline" className="text-[10px]" style={{ color: HAZARD_COLORS[selectedHazard] }}>
                    {HAZARD_LABELS[selectedHazard]}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs max-h-[400px] overflow-y-auto">
                {resolutions.map((r, idx) => (
                  <div key={idx} className="p-2 rounded border border-border/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{SUBSYSTEM_LABELS[r.subsystem]}</span>
                      <Badge
                        variant={r.matchType === "specs" ? "default" : r.matchType === "generic" ? "secondary" : "outline"}
                        className="text-[10px] px-1.5"
                      >
                        {r.matchType === "none" ? "NO MATCH" : r.matchType.toUpperCase()}
                      </Badge>
                    </div>
                    {r.steps.map((step, si) => (
                      <div key={si} className="font-mono text-[10px] text-muted-foreground pl-2">
                        {step}
                      </div>
                    ))}
                    {r.curve && (
                      <div className="flex items-center gap-2 pt-1 border-t border-border/30">
                        <span className="font-mono text-primary">{r.curve.curve_id}</span>
                        <Badge variant="outline" className="text-[10px]" style={{ color: CONFIDENCE_COLORS[r.curve.confidence] }}>
                          {r.curve.confidence}
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Damage Estimation Tab */}
        <TabsContent value="damage" className="space-y-4">
          {intensityVal > 0 && weightedDamage ? (
            <>
              {/* KPI Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4 pb-3 px-4">
                    <div className="text-2xl font-bold" style={{ color: HAZARD_COLORS[selectedHazard] }}>
                      {intensityVal} {selectedGroup?.intensity_unit}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">Hazard Intensity</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-3 px-4">
                    <div className="text-2xl font-bold">{(weightedDamage.assetDR * 100).toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Asset-Level DR</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-3 px-4">
                    <div className="text-2xl font-bold text-destructive">
                      ${(weightedDamage.dollarLoss / 1e6).toFixed(1)}M
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">Estimated Loss</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-3 px-4">
                    <div className="text-2xl font-bold">${(asset.replacement_cost / 1e6).toFixed(0)}M</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Replacement Cost</div>
                  </CardContent>
                </Card>
              </div>

              {/* Breakdown Table */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Subsystem Loss Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2 font-medium text-muted-foreground">Subsystem</th>
                        <th className="text-left py-2 px-2 font-medium text-muted-foreground">Curve</th>
                        <th className="text-center py-2 px-2 font-medium text-muted-foreground">DR</th>
                        <th className="text-center py-2 px-2 font-medium text-muted-foreground">Weight</th>
                        <th className="text-center py-2 px-2 font-medium text-muted-foreground">Weighted DR</th>
                        <th className="text-right py-2 px-2 font-medium text-muted-foreground">$ Loss</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weightedDamage.details.map((d, i) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-1.5 px-2 font-medium">{SUBSYSTEM_LABELS[d.subsystem]}</td>
                          <td className="py-1.5 px-2 font-mono text-primary">{d.curve_id}</td>
                          <td className="py-1.5 px-2 text-center font-mono">{(d.dr * 100).toFixed(1)}%</td>
                          <td className="py-1.5 px-2 text-center font-mono">{(d.weight * 100).toFixed(0)}%</td>
                          <td className="py-1.5 px-2 text-center font-mono">{(d.weightedDR * 100).toFixed(2)}%</td>
                          <td className="py-1.5 px-2 text-right font-mono">${(d.dollarLoss / 1e6).toFixed(2)}M</td>
                        </tr>
                      ))}
                      <tr className="font-medium bg-muted/30">
                        <td className="py-1.5 px-2" colSpan={4}>Total Asset-Level</td>
                        <td className="py-1.5 px-2 text-center font-mono">{(weightedDamage.assetDR * 100).toFixed(2)}%</td>
                        <td className="py-1.5 px-2 text-right font-mono">${(weightedDamage.dollarLoss / 1e6).toFixed(2)}M</td>
                      </tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Weighted DR Formula</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-mono text-xs bg-muted p-3 rounded overflow-x-auto whitespace-pre">
{`Asset_DR = Σ (capex_weight_i × DR_i(intensity))

${weightedDamage.details.map(d => `  ${SUBSYSTEM_LABELS[d.subsystem].padEnd(16)} : ${(d.weight).toFixed(2)} × ${(d.dr * 100).toFixed(1).padStart(5)}% = ${(d.weightedDR * 100).toFixed(2)}%`).join("\n")}
${"─".repeat(50)}
  Asset-Level DR${" ".repeat(2)} :                       ${(weightedDamage.assetDR * 100).toFixed(2)}%
  Dollar Loss${" ".repeat(5)} : ${(weightedDamage.assetDR * 100).toFixed(2)}% × $${(asset.replacement_cost / 1e6).toFixed(0)}M = $${(weightedDamage.dollarLoss / 1e6).toFixed(2)}M`}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
              Enter a hazard intensity value above to see the damage estimation
            </div>
          )}
        </TabsContent>

        {/* JSON / SQL Tab */}
        <TabsContent value="output" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">hazard_curve_map JSON</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-[10px] font-mono bg-muted p-3 rounded overflow-x-auto max-h-[500px] overflow-y-auto whitespace-pre">
                  {JSON.stringify({ [selectedHazard]: hazardCurveMapJSON }, null, 2)}
                </pre>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">SQL Statement</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-[10px] font-mono bg-muted p-3 rounded overflow-x-auto max-h-[500px] overflow-y-auto whitespace-pre text-primary">
                  {sqlStatement}
                </pre>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">GCS Registry catalog.json Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-[10px] font-mono bg-muted p-3 rounded overflow-x-auto max-h-[300px] overflow-y-auto whitespace-pre">
{JSON.stringify({
  catalog_version: "1.0",
  hazard: selectedHazard,
  asset_type: asset.type,
  curves: resolutions.filter(r => r.curve).map(r => ({
    curve_id: r.curve!.curve_id,
    subsystem: r.subsystem,
    gcs_path: `gs://infrasure-curves/v1/${r.curve!.curve_id}.json`,
    params: { L: r.curve!.L, k: r.curve!.k, x0: r.curve!.x0 },
    confidence: r.curve!.confidence,
    match_type: r.matchType,
  })),
}, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
