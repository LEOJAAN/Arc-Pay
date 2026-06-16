"use client";

import { ReactNode, useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { useArcWallet } from "@/components/wallet/use-arc-wallet";

type ArcNetworkGateProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

export function ArcNetworkGate({ children, fallback }: ArcNetworkGateProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { isConnected, isArcTestnet, isSwitching, isUnsupportedNetwork, switchToArcTestnet } =
    useArcWallet();

  if (!mounted) {
    return <>{children}</>;
  }

  if (!isConnected || isArcTestnet) {
    return <>{children}</>;
  }


  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Button disabled={!isUnsupportedNetwork || isSwitching} onClick={switchToArcTestnet}>
      {isSwitching ? "Switching" : "Switch To Arc Testnet"}
    </Button>
  );
}
