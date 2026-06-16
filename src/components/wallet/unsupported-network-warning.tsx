"use client";

import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { arcTestnet } from "@/config/arc-testnet";
import { useArcWallet } from "@/components/wallet/use-arc-wallet";

export function UnsupportedNetworkWarning() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { currentNetwork, isSwitching, isUnsupportedNetwork, switchToArcTestnet } = useArcWallet();

  if (!mounted || !isUnsupportedNetwork) {
    return null;
  }


  return (
    <Card className="mb-6 border-amber-200 bg-amber-50 text-amber-950">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Unsupported network connected</p>
            <p className="mt-1 text-sm leading-6">
              Current network: {currentNetwork?.name ?? "Unknown network"}. Arc Payroll only
              supports {arcTestnet.name}. Payroll features are disabled until you switch.
            </p>
          </div>
        </div>
        <Button variant="outline" disabled={isSwitching} onClick={switchToArcTestnet}>
          {isSwitching ? "Switching" : `Switch To ${arcTestnet.name}`}
        </Button>
      </CardContent>
    </Card>
  );
}
