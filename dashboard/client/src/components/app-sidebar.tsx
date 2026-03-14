import { BarChart3, Activity, GitCompare, Server, BookOpen, LayoutDashboard } from "lucide-react";
import { useLocation, Link } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";

const navItems = [
  { title: "Curve Explorer", url: "/", icon: Activity },
  { title: "Overview", url: "/overview", icon: LayoutDashboard },
  { title: "Compare Curves", url: "/compare", icon: GitCompare },
  { title: "Backend View", url: "/backend", icon: Server },
  { title: "Sources", url: "/sources", icon: BookOpen },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4 pb-2">
        <Link href="/">
          <div className="flex items-center gap-2.5 cursor-pointer" data-testid="link-home">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-label="InfraSure">
              <rect x="2" y="2" width="28" height="28" rx="6" stroke="currentColor" strokeWidth="2" className="text-primary" />
              <path d="M8 22 L12 10 L16 18 L20 8 L24 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary" fill="none" />
              <circle cx="12" cy="10" r="2" fill="currentColor" className="text-primary" />
              <circle cx="20" cy="8" r="2" fill="currentColor" className="text-primary" />
            </svg>
            <div>
              <span className="font-semibold text-sm tracking-tight">InfraSure</span>
              <span className="block text-[10px] text-muted-foreground leading-tight">Damage Curve Explorer</span>
            </div>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location === item.url || (item.url !== "/" && item.url !== "/overview" && location.startsWith(item.url)) || (item.url === "/" && location === "/explorer");
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Curve Registry</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total Curves</span>
                <span className="font-medium">42</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Hazard Types</span>
                <span className="font-medium">6</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Subsystems</span>
                <span className="font-medium">10</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Research Files</span>
                <span className="font-medium">8</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Cited Sources</span>
                <span className="font-medium">280+</span>
              </div>
              <div className="mt-3 pt-2 border-t">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Functional Form</span>
                <div className="mt-1 px-2 py-1.5 bg-muted rounded text-xs font-mono">
                  DR(x) = L / (1 + e<sup>-k(x-x₀)</sup>)
                </div>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3">
        <div className="text-[10px] text-muted-foreground">
          <span>v1.0 · Score 4-5 Priority</span>
        </div>
        <PerplexityAttribution />
      </SidebarFooter>
    </Sidebar>
  );
}
