import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  hazardGroups,
  logistic,
  HAZARD_COLORS,
  HAZARD_LABELS,
  SUBSYSTEM_LABELS,
  CONFIDENCE_COLORS,
  type HazardGroup,
  type CurveParams,
} from "@/data/curves";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid, Area, AreaChart,
} from "recharts";

const CURVE_LINE_COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#06b6d4", "#ec4899",
];

const REF_TYPE_COLORS: Record<string, string> = {
  empirical: "#22c55e",
  standard: "#3b82f6",
  proxy: "#f59e0b",
  expert: "#8b5cf6",
  model: "#06b6d4",
};

const PARAM_LABELS: Record<string, string> = {
  L: "L (max DR)",
  k: "k (steepness)",
  x0: "x₀ (midpoint)",
  general: "General",
};

export default function Explorer() {
  const [selectedGroupIdx, setSelectedGroupIdx] = useState(0);
  const [selectedCurveIdx, setSelectedCurveIdx] = useState<number | null>(null);
  const [showAllInGroup, setShowAllInGroup] = useState(true);
  const [customL, setCustomL] = useState<number | null>(null);
  const [customK, setCustomK] = useState<number | null>(null);
  const [customX0, setCustomX0] = useState<number | null>(null);
  const [showParameterTuning, setShowParameterTuning] = useState(false);
  const [probeIntensity, setProbeIntensity] = useState<number | null>(null);

  const group = hazardGroups[selectedGroupIdx];
  const activeCurve = selectedCurveIdx !== null ? group.curves[selectedCurveIdx] : group.curves[0];

  // Compute intensity range based on the group's curves
  const intensityRange = useMemo(() => {
    const allX0 = group.curves.map((c) => c.x0);
    const allK = group.curves.map((c) => c.k);
    const minX0 = Math.min(...allX0);
    const maxX0 = Math.max(...allX0);
    const avgK = allK.reduce((a, b) => a + b, 0) / allK.length;
    const margin = Math.max(5 / avgK, maxX0 * 0.3);
    const start = Math.max(0, minX0 - margin);
    const end = maxX0 + margin;
    return { start: Math.floor(start), end: Math.ceil(end) };
  }, [group]);

  // Generate chart data
  const chartData = useMemo(() => {
    const { start, end } = intensityRange;
    const steps = 200;
    const step = (end - start) / steps;
    const data: Record<string, number | string>[] = [];

    for (let i = 0; i <= steps; i++) {
      const x = start + i * step;
      const point: Record<string, number | string> = { x: Math.round(x * 100) / 100 };

      if (showAllInGroup) {
        group.curves.forEach((c, idx) => {
          point[`curve_${idx}`] = Math.round(logistic(x, c.L, c.k, c.x0) * 10000) / 10000;
        });
      } else {
        const c = activeCurve;
        const effL = customL ?? c.L;
        const effK = customK ?? c.k;
        const effX0 = customX0 ?? c.x0;
        point.damage_ratio = Math.round(logistic(x, effL, effK, effX0) * 10000) / 10000;
      }
      data.push(point);
    }
    return data;
  }, [group, activeCurve, showAllInGroup, customL, customK, customX0, intensityRange]);

  const handleGroupChange = (val: string) => {
    setSelectedGroupIdx(parseInt(val));
    setSelectedCurveIdx(null);
    setCustomL(null);
    setCustomK(null);
    setCustomX0(null);
    setProbeIntensity(null);
  };

  const handleCurveChange = (val: string) => {
    const idx = parseInt(val);
    setSelectedCurveIdx(idx);
    setCustomL(null);
    setCustomK(null);
    setCustomX0(null);
  };

  const effL = customL ?? activeCurve.L;
  const effK = customK ?? activeCurve.k;
  const effX0 = customX0 ?? activeCurve.x0;

  // Live calculation at probe intensity
  const probeX = probeIntensity ?? effX0;
  const probeDR = logistic(probeX, effL, effK, effX0);
  const probeExpTerm = Math.exp(-effK * (probeX - effX0));

  return (
    <div className="p-6 space-y-4 overflow-y-auto h-full">
      <div>
        <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">Curve Explorer</h1>
        <p className="text-sm text-muted-foreground mt-1">Interactive logistic fragility curves with derivation math, references, and parameter tuning</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Hazard × Asset</Label>
          <Select value={String(selectedGroupIdx)} onValueChange={handleGroupChange}>
            <SelectTrigger className="w-[260px]" data-testid="select-hazard-group">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {hazardGroups.map((g, i) => (
                <SelectItem key={i} value={String(i)}>
                  <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: HAZARD_COLORS[g.hazard_code] }} />
                  {HAZARD_LABELS[g.hazard_code]} × {g.asset_type} (P{g.priority_score})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Curve</Label>
          <Select value={String(selectedCurveIdx ?? 0)} onValueChange={handleCurveChange}>
            <SelectTrigger className="w-[280px]" data-testid="select-curve">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {group.curves.map((c, i) => (
                <SelectItem key={i} value={String(i)}>
                  {c.curve_id.split("/")[1]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Switch checked={showAllInGroup} onCheckedChange={setShowAllInGroup} data-testid="switch-show-all" />
          <Label className="text-xs">Show all in group</Label>
        </div>

        <div className="flex items-center gap-2">
          <Switch checked={showParameterTuning} onCheckedChange={setShowParameterTuning} data-testid="switch-parameter-tuning" />
          <Label className="text-xs">Parameter tuning</Label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: HAZARD_COLORS[group.hazard_code] }} />
              {HAZARD_LABELS[group.hazard_code]} × {group.asset_type.charAt(0).toUpperCase() + group.asset_type.slice(1)}
              <Badge variant="outline" className="text-[10px] ml-auto">
                {group.intensity_variable} ({group.intensity_unit})
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={380}>
              <AreaChart data={chartData} margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis
                  dataKey="x"
                  tick={{ fontSize: 11 }}
                  label={{ value: `${group.intensity_variable} (${group.intensity_unit})`, position: "insideBottom", offset: -5, fontSize: 11 }}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  domain={[0, 1]}
                  tickFormatter={(v: number) => `${Math.round(v * 100)}%`}
                  label={{ value: "Damage Ratio", angle: -90, position: "insideLeft", offset: 10, fontSize: 11 }}
                />
                <Tooltip
                  content={({ payload, label }) => {
                    if (!payload?.length) return null;
                    return (
                      <div className="bg-card border border-border rounded-md px-3 py-2 text-xs shadow-lg">
                        <div className="font-medium mb-1">{group.intensity_variable}: {label} {group.intensity_unit}</div>
                        {payload.map((p: any, i: number) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full" style={{ background: p.stroke || p.color }} />
                            <span className="text-muted-foreground">{showAllInGroup ? group.curves[parseInt(p.dataKey.split("_")[1])]?.curve_id.split("/")[1] || p.dataKey : "DR"}</span>
                            <span className="font-medium ml-auto">{(p.value * 100).toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
                {showAllInGroup ? (
                  group.curves.map((c, idx) => (
                    <Area
                      key={idx}
                      type="monotone"
                      dataKey={`curve_${idx}`}
                      stroke={CURVE_LINE_COLORS[idx % CURVE_LINE_COLORS.length]}
                      fill={CURVE_LINE_COLORS[idx % CURVE_LINE_COLORS.length]}
                      fillOpacity={0.05}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  ))
                ) : (
                  <Area
                    type="monotone"
                    dataKey="damage_ratio"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.1}
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                )}
                {!showAllInGroup && (
                  <>
                    <ReferenceLine x={effX0} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" label={{ value: `x₀=${effX0}`, position: "top", fontSize: 10 }} />
                    <ReferenceLine y={effL / 2} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" opacity={0.4} />
                    {probeIntensity !== null && (
                      <ReferenceLine x={probeIntensity} stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={1.5} />
                    )}
                  </>
                )}
              </AreaChart>
            </ResponsiveContainer>
            {showAllInGroup && (
              <div className="flex flex-wrap gap-3 mt-3">
                {group.curves.map((c, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xs">
                    <span className="inline-block w-3 h-0.5 rounded" style={{ background: CURVE_LINE_COLORS[idx % CURVE_LINE_COLORS.length] }} />
                    <span className="text-muted-foreground">{c.curve_id.split("/")[1]}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right panel: params + details */}
        <div className="space-y-4">
          {/* Curve Parameters */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2 rounded bg-muted/50">
                  <div className="text-lg font-bold">{effL}</div>
                  <div className="text-[10px] text-muted-foreground">L (max DR)</div>
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <div className="text-lg font-bold">{effK}</div>
                  <div className="text-[10px] text-muted-foreground">k (slope)</div>
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <div className="text-lg font-bold">{effX0}</div>
                  <div className="text-[10px] text-muted-foreground">x₀ ({group.intensity_unit})</div>
                </div>
              </div>

              {/* Functional form display */}
              <div className="p-2.5 rounded bg-muted/30 border border-border/50">
                <div className="text-[10px] text-muted-foreground mb-1 font-medium">Functional Form</div>
                <div className="font-mono text-xs leading-relaxed">
                  DR(x) = {effL} / (1 + e<sup>-{effK}×(x - {effX0})</sup>)
                </div>
              </div>

              {showParameterTuning && !showAllInGroup && (
                <div className="space-y-3 pt-2 border-t">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>L (max DR)</span>
                      <span className="font-mono">{(customL ?? activeCurve.L).toFixed(2)}</span>
                    </div>
                    <Slider
                      value={[customL ?? activeCurve.L]}
                      onValueChange={([v]) => setCustomL(Math.round(v * 100) / 100)}
                      min={0.05}
                      max={1.0}
                      step={0.05}
                      data-testid="slider-L"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>k (slope)</span>
                      <span className="font-mono">{(customK ?? activeCurve.k).toFixed(4)}</span>
                    </div>
                    <Slider
                      value={[customK ?? activeCurve.k]}
                      onValueChange={([v]) => setCustomK(Math.round(v * 10000) / 10000)}
                      min={Math.max(0.0001, activeCurve.k * 0.1)}
                      max={activeCurve.k * 5}
                      step={activeCurve.k * 0.05}
                      data-testid="slider-k"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>x₀ (midpoint)</span>
                      <span className="font-mono">{(customX0 ?? activeCurve.x0).toFixed(1)}</span>
                    </div>
                    <Slider
                      value={[customX0 ?? activeCurve.x0]}
                      onValueChange={([v]) => setCustomX0(Math.round(v * 10) / 10)}
                      min={Math.max(0, activeCurve.x0 * 0.3)}
                      max={activeCurve.x0 * 2}
                      step={activeCurve.x0 * 0.02}
                      data-testid="slider-x0"
                    />
                  </div>
                  <button
                    className="text-xs text-primary hover:underline"
                    onClick={() => { setCustomL(null); setCustomK(null); setCustomX0(null); }}
                    data-testid="button-reset-params"
                  >
                    Reset to researched values
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Curve Details */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Curve Identity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div>
                <span className="text-muted-foreground">ID: </span>
                <span className="font-mono font-medium" data-testid="text-curve-id">{activeCurve.curve_id}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Subsystem: </span>
                <span>{SUBSYSTEM_LABELS[activeCurve.subsystem] || activeCurve.subsystem}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Component: </span>
                <span>{activeCurve.component}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Specificity: </span>
                <Badge variant="outline" className="text-[10px] px-1.5">{activeCurve.specificity}</Badge>
              </div>
              {activeCurve.description && (
                <div>
                  <span className="text-muted-foreground">Description: </span>
                  <span>{activeCurve.description}</span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Confidence: </span>
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5"
                  style={{ borderColor: CONFIDENCE_COLORS[activeCurve.confidence] + "60", color: CONFIDENCE_COLORS[activeCurve.confidence] }}
                >
                  {activeCurve.confidence}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Derivation: </span>
                <span>{activeCurve.derivation}</span>
              </div>
              {activeCurve.match_criteria && (
                <div>
                  <span className="text-muted-foreground">Match Criteria: </span>
                  <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded break-all">
                    {JSON.stringify(activeCurve.match_criteria)}
                  </code>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Section: Derivation, Math, References */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Live Calculation */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              Live Calculation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Intensity (x)</span>
                <span className="font-mono font-medium">{probeX.toFixed(1)} {group.intensity_unit}</span>
              </div>
              <Slider
                value={[probeX]}
                onValueChange={([v]) => setProbeIntensity(Math.round(v * 10) / 10)}
                min={intensityRange.start}
                max={intensityRange.end}
                step={(intensityRange.end - intensityRange.start) / 200}
                data-testid="slider-probe"
              />
            </div>

            <div className="p-3 rounded bg-muted/30 border border-border/50 space-y-2">
              <div className="text-[10px] text-muted-foreground font-medium">Step-by-step</div>
              <div className="font-mono text-[11px] leading-relaxed space-y-1.5">
                <div className="text-muted-foreground">
                  DR(x) = L / (1 + e<sup>-k(x - x₀)</sup>)
                </div>
                <div className="border-t border-border/30 pt-1.5">
                  <span className="text-muted-foreground">exponent = </span>
                  -{effK} × ({probeX.toFixed(1)} - {effX0})
                </div>
                <div>
                  <span className="text-muted-foreground">= </span>
                  {(-effK * (probeX - effX0)).toFixed(4)}
                </div>
                <div className="border-t border-border/30 pt-1.5">
                  <span className="text-muted-foreground">e<sup>exponent</sup> = </span>
                  {probeExpTerm.toFixed(4)}
                </div>
                <div className="border-t border-border/30 pt-1.5">
                  <span className="text-muted-foreground">DR = </span>
                  {effL} / (1 + {probeExpTerm.toFixed(4)})
                </div>
                <div>
                  <span className="text-muted-foreground">= </span>
                  {effL} / {(1 + probeExpTerm).toFixed(4)}
                </div>
              </div>
              <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                <span className="text-xs font-medium">Damage Ratio</span>
                <span className="text-lg font-bold font-mono" style={{ color: probeDR > 0.5 ? "#ef4444" : probeDR > 0.2 ? "#f59e0b" : "#22c55e" }}>
                  {(probeDR * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Derivation Notes + Physics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              Derivation Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {/* Physics summary */}
            {activeCurve.physics_summary && (
              <div className="p-2.5 rounded bg-muted/30 border border-border/50">
                <div className="text-[10px] text-muted-foreground font-medium mb-1">Physics of Damage</div>
                <div className="leading-relaxed">{activeCurve.physics_summary}</div>
              </div>
            )}

            {/* Derivation notes per parameter */}
            {activeCurve.derivation_notes && activeCurve.derivation_notes.length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] text-muted-foreground font-medium">Parameter Justification</div>
                {activeCurve.derivation_notes.map((note, i) => (
                  <div key={i} className="p-2 rounded bg-muted/20 border-l-2" style={{ borderLeftColor: note.parameter === "L" ? "#3b82f6" : note.parameter === "k" ? "#22c55e" : note.parameter === "x0" ? "#f59e0b" : "#8b5cf6" }}>
                    <div className="text-[10px] font-medium mb-0.5" style={{ color: note.parameter === "L" ? "#3b82f6" : note.parameter === "k" ? "#22c55e" : note.parameter === "x0" ? "#f59e0b" : "#8b5cf6" }}>
                      {PARAM_LABELS[note.parameter] || note.parameter}
                    </div>
                    <div className="leading-relaxed text-muted-foreground">{note.text}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Engineering thresholds */}
            {activeCurve.engineering_thresholds && activeCurve.engineering_thresholds.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[10px] text-muted-foreground font-medium">Engineering Thresholds</div>
                {activeCurve.engineering_thresholds.map((t, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span className="text-muted-foreground mt-0.5 shrink-0">▸</span>
                    <span className="text-muted-foreground leading-relaxed">{t}</span>
                  </div>
                ))}
              </div>
            )}

            {!activeCurve.physics_summary && !activeCurve.derivation_notes?.length && (
              <div className="text-muted-foreground italic">No detailed derivation notes available for this curve.</div>
            )}
          </CardContent>
        </Card>

        {/* References */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              Curve References
              {activeCurve.references && (
                <Badge variant="outline" className="text-[10px] ml-auto">{activeCurve.references.length} sources</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {activeCurve.references && activeCurve.references.length > 0 ? (
              <>
                {activeCurve.references.map((ref, i) => (
                  <div key={i} className="p-2.5 rounded bg-muted/20 border border-border/40 space-y-1">
                    <div className="flex items-start gap-2">
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1.5 shrink-0 mt-0.5"
                        style={{ borderColor: REF_TYPE_COLORS[ref.type] + "60", color: REF_TYPE_COLORS[ref.type] }}
                      >
                        {ref.type}
                      </Badge>
                      <span className="leading-relaxed">{ref.label}</span>
                    </div>
                    {ref.url && (
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-primary hover:underline block truncate pl-[52px]"
                      >
                        {ref.url}
                      </a>
                    )}
                  </div>
                ))}

                {/* Source type legend */}
                <div className="pt-2 border-t border-border/30">
                  <div className="text-[10px] text-muted-foreground mb-1.5">Source Type Legend</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(REF_TYPE_COLORS).map(([type, color]) => (
                      <div key={type} className="flex items-center gap-1">
                        <span className="inline-block w-2 h-2 rounded-full" style={{ background: color }} />
                        <span className="text-[10px] text-muted-foreground capitalize">{type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-muted-foreground italic">No specific references linked to this curve.</div>
            )}

            {/* Research file link */}
            <div className="pt-2 border-t border-border/30">
              <span className="text-[10px] text-muted-foreground">Full research: </span>
              <span className="font-mono text-[10px] text-primary">{group.research_file}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
