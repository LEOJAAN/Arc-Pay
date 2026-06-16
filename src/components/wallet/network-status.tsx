"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, PlugZap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { arcTestnet } from "@/config/arc-testnet";
import { useArcWallet } from "@/components/wallet/use-arc-wallet";

export function NetworkStatus() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    currentNetwork,
    isConnected,
    isArcTestnet,
    isSwitching,
    isUnsupportedNetwork,
    switchToArcTestnet,
  } = useArcWallet();

  if (!mounted) {
    return (
      <Badge variant="secondary">
        <PlugZap className="mr-1 h-3 w-3" />
        Arc Testnet
      </Badge>
    );
  }

  if (!isConnected) {
    return (
      <Badge variant="secondary">
        <PlugZap className="mr-1 h-3 w-3" />
        Arc Testnet
      </Badge>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant={isArcTestnet ? "success" : "warning"}>
        {isArcTestnet ? (
          <PlugZap className="mr-1 h-3 w-3" />
        ) : (
          <AlertTriangle className="mr-1 h-3 w-3" />
        )}
        {currentNetwork?.name ?? "Unknown network"}
      </Badge>
      {isUnsupportedNetwork ? (
        <Button
          size="sm"
          variant="outline"
          disabled={isSwitching}
          onClick={switchToArcTestnet}
        >
          {isSwitching ? "Switching" : `Switch To ${arcTestnet.name}`}
        </Button>
      ) : null}
    </div>
  );
}
