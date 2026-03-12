import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  hazardGroups,
  getAllCurves,
  getHazardAssetPairs,
  uncoveredHazards,
  HAZARD_COLORS,
  HAZARD_LABELS,
  ASSET_TYPE_COLORS,
  CONFIDENCE_COLORS,
  CONFIDENCE_ORDER,
  SUBSYSTEM_LABELS,
} from "@/data/curves";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from "recharts";

export default function Overview() {
  const allCurves = getAllCurves();
  const pairs = getHazardAssetPairs();

  // Confidence distribution
  const confDist: Record<string, number> = {};
  allCurves.forEach((c) => {
    confDist[c.confidence] = (confDist[c.confidence] || 0) + 1;
  });
  const confData = CONFIDENCE_ORDER.filter((k) => confDist[k]).map((k) => ({
    name: k,
    value: confDist[k],
    fill: CONFIDENCE_COLORS[k],
  }));

  // Derivation distribution
  const derivDist: Record<string, number> = {};
  allCurves.forEach((c) => {
    const d = c.derivation.split("(")[0].trim();
    derivDist[d] = (derivDist[d] || 0) + 1;
  });
  const derivData = Object.entries(derivDist)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name: name.length > 25 ? name.slice(0, 22) + "..." : name, value, fullName: name }));

  // Curves per hazard
  const hazardCounts: Record<string, number> = {};
  hazardGroups.forEach((g) => {
    const key = `${HAZARD_LABELS[g.hazard_code]} × ${g.asset_type}`;
    hazardCounts[key] = g.curves.length;
  });
  const hazardBarData = Object.entries(hazardCounts).map(([name, count]) => ({
    name,
    count,
    hazard: name.split(" × ")[0],
  }));

  // Coverage matrix data
  const solarSubsystems = ["PV_ARRAY", "MOUNTING", "INVERTER_SYSTEM", "SUBSTATION", "ELECTRICAL", "CIVIL_INFRA"];
  const windSubsystems = ["ROTOR_ASSEMBLY", "TOWER", "NACELLE", "FOUNDATION", "ELECTRICAL"];
  const solarHazards = ["HAIL", "HURRICANE", "WILDFIRE", "RIVERINE_FLOOD"];
  const windHazards = ["HURRICANE", "STRONG_WIND", "WILDFIRE", "WINTER_WEATHER"];

  function getCoverageCell(hazard: string, subsystem: string, assetType: string) {
    const matchingCurves = allCurves.filter(
      (c) => c.hazard_code === hazard && c.subsystem === subsystem && c.asset_type === assetType
    );
    if (matchingCurves.length === 0) return null;
    return matchingCurves;
  }

  const score5Count = allCurves.filter((c) => c.priority_score === 5).length;
  const score4Count = allCurves.filter((c) => c.priority_score === 4).length;

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <div>
        <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">Damage Curve Registry</h1>
        <p className="text-sm text-muted-foreground mt-1">42 subsystem-level logistic fragility curves across 6 hazard types</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="text-2xl font-bold text-primary" data-testid="text-total-curves">42</div>
            <div className="text-xs text-muted-foreground mt-0.5">Total Curves</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="text-2xl font-bold" data-testid="text-hazard-count">6</div>
            <div className="text-xs text-muted-foreground mt-0.5">Hazard Types</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="text-2xl font-bold">{score5Count}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Score 5 Curves</div>
            <div className="text-[10px] text-orange-500 mt-0.5">Critical priority</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="text-2xl font-bold">{score4Count}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Score 4 Curves</div>
            <div className="text-[10px] text-yellow-600 mt-0.5">High priority</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="text-2xl font-bold">10</div>
            <div className="text-xs text-muted-foreground mt-0.5">Subsystems</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">6 solar · 5 wind (shared: Electrical)</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Curves per hazard×asset */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Curves per Hazard × Asset</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={hazardBarData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={130} />
                <Tooltip
                  contentStyle={{ fontSize: 12, background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6 }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {hazardBarData.map((entry, i) => {
                    const hazardKey = Object.keys(HAZARD_LABELS).find((k) => HAZARD_LABELS[k] === entry.hazard);
                    return <Cell key={i} fill={hazardKey ? HAZARD_COLORS[hazardKey] : "#888"} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Confidence distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Confidence Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={confData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {confData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6 }} />
                <Legend
                  formatter={(value: string) => <span className="text-xs">{value}</span>}
                  wrapperStyle={{ fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Coverage Matrices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: ASSET_TYPE_COLORS.solar }} />
              Solar Coverage Matrix
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left py-1.5 px-2 font-medium text-muted-foreground">Subsystem</th>
                  {solarHazards.map((h) => (
                    <th key={h} className="py-1.5 px-2 font-medium text-center" style={{ color: HAZARD_COLORS[h] }}>
                      {HAZARD_LABELS[h]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {solarSubsystems.map((sub) => (
                  <tr key={sub} className="border-t border-border/50">
                    <td className="py-1.5 px-2 font-medium">{SUBSYSTEM_LABELS[sub]}</td>
                    {solarHazards.map((h) => {
                      const curves = getCoverageCell(h, sub, "solar");
                      return (
                        <td key={h} className="py-1.5 px-2 text-center">
                          {curves ? (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0" style={{ borderColor: CONFIDENCE_COLORS[curves[0].confidence] + "60", color: CONFIDENCE_COLORS[curves[0].confidence] }}>
                              {curves.length}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground/30">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: ASSET_TYPE_COLORS.wind }} />
              Wind Coverage Matrix
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left py-1.5 px-2 font-medium text-muted-foreground">Subsystem</th>
                  {windHazards.map((h) => (
                    <th key={h} className="py-1.5 px-2 font-medium text-center" style={{ color: HAZARD_COLORS[h] }}>
                      {HAZARD_LABELS[h]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {windSubsystems.map((sub) => (
                  <tr key={sub} className="border-t border-border/50">
                    <td className="py-1.5 px-2 font-medium">{SUBSYSTEM_LABELS[sub]}</td>
                    {windHazards.map((h) => {
                      const curves = getCoverageCell(h, sub, "wind");
                      return (
                        <td key={h} className="py-1.5 px-2 text-center">
                          {curves ? (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0" style={{ borderColor: CONFIDENCE_COLORS[curves[0].confidence] + "60", color: CONFIDENCE_COLORS[curves[0].confidence] }}>
                              {curves.length}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground/30">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Derivation methods bar */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Derivation Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={derivData} margin={{ left: 10, right: 20 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-card border border-border rounded-md px-3 py-2 text-xs shadow-md">
                      <div className="font-medium">{d.fullName}</div>
                      <div className="text-muted-foreground">{d.value} curves</div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Uncovered hazards */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Not Yet Covered (Score ≤ 3)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {uncoveredHazards.map((h) => (
              <div key={h.code} className="flex items-start gap-2 p-2 rounded bg-muted/50 text-xs">
                <Badge variant="outline" className="text-[10px] shrink-0 mt-0.5">
                  {h.priority_score}
                </Badge>
                <div>
                  <div className="font-medium">{h.code.replace(/_/g, " ")}</div>
                  <div className="text-muted-foreground mt-0.5">{h.reason}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
