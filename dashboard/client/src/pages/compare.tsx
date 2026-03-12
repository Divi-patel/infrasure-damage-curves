import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  hazardGroups,
  logistic,
  getAllCurves,
  HAZARD_COLORS,
  HAZARD_LABELS,
  SUBSYSTEM_LABELS,
  CONFIDENCE_COLORS,
} from "@/data/curves";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";

const LINE_COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6",
  "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#14b8a6",
];

type CompareMode = "same_hazard" | "same_subsystem" | "custom";

export default function Compare() {
  const allCurves = getAllCurves();
  const [mode, setMode] = useState<CompareMode>("same_hazard");
  const [selectedHazard, setSelectedHazard] = useState("HAIL");
  const [selectedSubsystem, setSelectedSubsystem] = useState("PV_ARRAY");
  const [selectedCurveIds, setSelectedCurveIds] = useState<Set<string>>(new Set());

  const uniqueHazards = Array.from(new Set(hazardGroups.map((g) => g.hazard_code)));
  const uniqueSubsystems = Array.from(new Set(allCurves.map((c) => c.subsystem)));

  const curvesToCompare = useMemo(() => {
    if (mode === "same_hazard") {
      return allCurves.filter((c) => c.hazard_code === selectedHazard);
    } else if (mode === "same_subsystem") {
      return allCurves.filter((c) => c.subsystem === selectedSubsystem);
    } else {
      return allCurves.filter((c) => selectedCurveIds.has(c.curve_id));
    }
  }, [mode, selectedHazard, selectedSubsystem, selectedCurveIds, allCurves]);

  // Determine if we can plot (need same intensity unit)
  const intensityUnits = Array.from(new Set(curvesToCompare.map((c) => c.intensity_unit)));
  const canPlot = intensityUnits.length === 1;
  const unit = intensityUnits[0] || "";

  // Chart data
  const chartData = useMemo(() => {
    if (!canPlot || curvesToCompare.length === 0) return [];

    const allX0 = curvesToCompare.map((c) => c.x0);
    const allK = curvesToCompare.map((c) => c.k);
    const minX0 = Math.min(...allX0);
    const maxX0 = Math.max(...allX0);
    const avgK = allK.reduce((a, b) => a + b, 0) / allK.length;
    const margin = Math.max(5 / avgK, maxX0 * 0.3);
    const start = Math.max(0, minX0 - margin);
    const end = maxX0 + margin;
    const steps = 200;
    const step = (end - start) / steps;

    const data: Record<string, number | string>[] = [];
    for (let i = 0; i <= steps; i++) {
      const x = start + i * step;
      const point: Record<string, number | string> = { x: Math.round(x * 100) / 100 };
      curvesToCompare.forEach((c) => {
        point[c.curve_id] = Math.round(logistic(x, c.L, c.k, c.x0) * 10000) / 10000;
      });
      data.push(point);
    }
    return data;
  }, [curvesToCompare, canPlot]);

  const toggleCurve = (curveId: string) => {
    setSelectedCurveIds((prev) => {
      const next = new Set(prev);
      if (next.has(curveId)) next.delete(curveId);
      else next.add(curveId);
      return next;
    });
  };

  return (
    <div className="p-6 space-y-4 overflow-y-auto h-full">
      <div>
        <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">Compare Curves</h1>
        <p className="text-sm text-muted-foreground mt-1">Overlay multiple curves to compare fragility across subsystems or hazards</p>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Compare By</Label>
          <Select value={mode} onValueChange={(v) => setMode(v as CompareMode)}>
            <SelectTrigger className="w-[200px]" data-testid="select-compare-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="same_hazard">Same Hazard</SelectItem>
              <SelectItem value="same_subsystem">Same Subsystem</SelectItem>
              <SelectItem value="custom">Custom Selection</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {mode === "same_hazard" && (
          <div className="space-y-1.5">
            <Label className="text-xs">Hazard</Label>
            <Select value={selectedHazard} onValueChange={setSelectedHazard}>
              <SelectTrigger className="w-[200px]" data-testid="select-hazard">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {uniqueHazards.map((h) => (
                  <SelectItem key={h} value={h}>
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: HAZARD_COLORS[h] }} />
                    {HAZARD_LABELS[h]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {mode === "same_subsystem" && (
          <div className="space-y-1.5">
            <Label className="text-xs">Subsystem</Label>
            <Select value={selectedSubsystem} onValueChange={setSelectedSubsystem}>
              <SelectTrigger className="w-[200px]" data-testid="select-subsystem">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {uniqueSubsystems.map((s) => (
                  <SelectItem key={s} value={s}>{SUBSYSTEM_LABELS[s] || s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {mode === "custom" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Select Curves ({selectedCurveIds.size} selected)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5 max-h-[200px] overflow-y-auto">
              {allCurves.map((c) => (
                <label key={c.curve_id} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/50 cursor-pointer text-xs">
                  <Checkbox
                    checked={selectedCurveIds.has(c.curve_id)}
                    onCheckedChange={() => toggleCurve(c.curve_id)}
                    data-testid={`checkbox-${c.curve_id}`}
                  />
                  <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: HAZARD_COLORS[c.hazard_code] }} />
                  <span className="truncate font-mono">{c.curve_id}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            {curvesToCompare.length} curves
            {!canPlot && curvesToCompare.length > 0 && (
              <span className="text-destructive ml-2 font-normal">
                Cannot overlay — mixed intensity units ({intensityUnits.join(", ")})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {canPlot && curvesToCompare.length > 0 ? (
            <ResponsiveContainer width="100%" height={420}>
              <LineChart data={chartData} margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis
                  dataKey="x"
                  tick={{ fontSize: 11 }}
                  label={{ value: `Intensity (${unit})`, position: "insideBottom", offset: -5, fontSize: 11 }}
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
                      <div className="bg-card border border-border rounded-md px-3 py-2 text-xs shadow-lg max-w-[300px]">
                        <div className="font-medium mb-1">Intensity: {label} {unit}</div>
                        {payload.map((p: any, i: number) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: p.stroke }} />
                            <span className="text-muted-foreground truncate">{p.dataKey.split("/")[1]}</span>
                            <span className="font-medium ml-auto shrink-0">{(p.value * 100).toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
                {curvesToCompare.map((c, idx) => (
                  <Line
                    key={c.curve_id}
                    type="monotone"
                    dataKey={c.curve_id}
                    stroke={LINE_COLORS[idx % LINE_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 3 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[420px] flex items-center justify-center text-sm text-muted-foreground">
              {curvesToCompare.length === 0 ? "Select curves to compare" : "Cannot plot curves with different intensity units on the same axis"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parameter Table */}
      {curvesToCompare.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Parameter Comparison</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">Curve ID</th>
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">Subsystem</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">L</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">k</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">x₀</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Confidence</th>
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">Derivation</th>
                </tr>
              </thead>
              <tbody>
                {curvesToCompare.map((c, idx) => (
                  <tr key={c.curve_id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-1.5 px-2">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: LINE_COLORS[idx % LINE_COLORS.length] }} />
                        <span className="font-mono">{c.curve_id}</span>
                      </div>
                    </td>
                    <td className="py-1.5 px-2">{SUBSYSTEM_LABELS[c.subsystem] || c.subsystem}</td>
                    <td className="py-1.5 px-2 text-center font-mono">{c.L}</td>
                    <td className="py-1.5 px-2 text-center font-mono">{c.k}</td>
                    <td className="py-1.5 px-2 text-center font-mono">{c.x0}</td>
                    <td className="py-1.5 px-2 text-center">
                      <Badge variant="outline" className="text-[10px] px-1.5" style={{ borderColor: CONFIDENCE_COLORS[c.confidence] + "60", color: CONFIDENCE_COLORS[c.confidence] }}>
                        {c.confidence}
                      </Badge>
                    </td>
                    <td className="py-1.5 px-2 text-muted-foreground">{c.derivation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
