import { ArrowLeftRight } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BridgePage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Bridge"
        title="Bridge USDC"
        description="Transfer stablecoins to and from the Arc Testnet."
      />
      <div className="max-w-md mx-auto mt-8">
        <Card className="border-dashed border-2">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ArrowLeftRight className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl">Bridge USDC</CardTitle>
          </CardHeader>
          <CardContent className="text-center pt-2 pb-6">
            <p className="text-muted-foreground text-sm">
              Bridge feature coming soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
