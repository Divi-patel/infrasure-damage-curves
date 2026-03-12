import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { keySources, HAZARD_COLORS, HAZARD_LABELS, hazardGroups } from "@/data/curves";
import { ExternalLink, Search, BookOpen, FileText, Shield } from "lucide-react";

export default function Sources() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSources = keySources.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.author.toLowerCase().includes(q) ||
      s.title.toLowerCase().includes(q) ||
      s.journal.toLowerCase().includes(q) ||
      s.hazards.some((h) => HAZARD_LABELS[h]?.toLowerCase().includes(q))
    );
  });

  // Group by journal type
  const journals = Array.from(new Set(keySources.map((s) => s.journal)));

  return (
    <div className="p-6 space-y-4 overflow-y-auto h-full">
      <div>
        <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">Research Sources</h1>
        <p className="text-sm text-muted-foreground mt-1">280+ cited sources across 8 research files — key references below</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by author, title, hazard..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          data-testid="input-search-sources"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3 px-4 flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-primary shrink-0" />
            <div>
              <div className="text-lg font-bold">280+</div>
              <div className="text-xs text-muted-foreground">Total Citations</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4 flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary shrink-0" />
            <div>
              <div className="text-lg font-bold">8</div>
              <div className="text-xs text-muted-foreground">Research Files</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4 flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary shrink-0" />
            <div>
              <div className="text-lg font-bold">{keySources.filter(s => s.journal.includes("Standard")).length}</div>
              <div className="text-xs text-muted-foreground">Engineering Standards</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4 flex items-center gap-3">
            <ExternalLink className="h-5 w-5 text-primary shrink-0" />
            <div>
              <div className="text-lg font-bold">{keySources.filter(s => s.doi).length}</div>
              <div className="text-xs text-muted-foreground">With DOI</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Source List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Key References ({filteredSources.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {filteredSources.map((s) => (
            <div key={s.id} className="flex items-start gap-3 p-3 rounded border border-border/50 hover:bg-muted/30 transition-colors">
              <div className="text-lg font-bold text-muted-foreground/30 w-6 text-center shrink-0">{s.id}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{s.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {s.author} ({s.year}) · {s.journal}
                      {s.doi && <span className="ml-1">· DOI: {s.doi}</span>}
                    </div>
                  </div>
                  {s.url && (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 shrink-0 mt-0.5"
                      data-testid={`link-source-${s.id}`}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  {s.hazards.map((h) => (
                    <Badge
                      key={h}
                      variant="outline"
                      className="text-[10px] px-1.5 py-0"
                      style={{ borderColor: HAZARD_COLORS[h] + "60", color: HAZARD_COLORS[h] }}
                    >
                      {HAZARD_LABELS[h]}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Research File Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Research File Index</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {hazardGroups.map((g, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded bg-muted/30 text-xs">
                <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ background: HAZARD_COLORS[g.hazard_code] }} />
                <div className="flex-1 min-w-0">
                  <div className="font-mono font-medium truncate">{g.research_file}</div>
                  <div className="text-muted-foreground">
                    {HAZARD_LABELS[g.hazard_code]} × {g.asset_type} · {g.curves.length} curves · P{g.priority_score}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
