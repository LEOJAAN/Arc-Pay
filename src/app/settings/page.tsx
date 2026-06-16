import { Database, ExternalLink, Network, Shield } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/supabase";

const settings = [
  { label: "Chain name", value: "Arc Testnet", icon: Network },
  { label: "Chain ID", value: "5042002", icon: Shield },
  { label: "RPC URL", value: "https://rpc.testnet.arc.network", icon: ExternalLink },
  { label: "Explorer", value: "https://testnet.arcscan.app", icon: ExternalLink },
];

export default function SettingsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Settings"
        title="Workspace configuration"
        description="Project-level configuration for Arc Testnet, Supabase, and wallet infrastructure."
      />
      <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Arc network</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {settings.map((setting) => (
              <div key={setting.label} className="grid gap-3 rounded-md border p-3 sm:grid-cols-[180px_1fr]">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <setting.icon className="h-4 w-4" />
                  {setting.label}
                </div>
                <p className="break-words text-sm font-medium">{setting.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Supabase</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Client configuration</p>
                  <p className="text-xs text-muted-foreground">Uses public URL and anon key env vars</p>
                </div>
              </div>
              <Badge variant={isSupabaseConfigured ? "success" : "warning"}>
                {isSupabaseConfigured ? "Ready" : "Missing env"}
              </Badge>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              Data tables, auth flows, and payroll logic are intentionally left for the next phase.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
