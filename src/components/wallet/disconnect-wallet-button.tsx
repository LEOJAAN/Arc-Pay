"use client";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useArcWallet } from "@/components/wallet/use-arc-wallet";

export function DisconnectWalletButton() {
  const { disconnect, isConnected } = useArcWallet();

  return (
    <Button
      className="gap-2"
      disabled={!isConnected}
      size="sm"
      variant="outline"
      onClick={() => disconnect()}
    >
      <LogOut className="h-4 w-4" />
      Disconnect
    </Button>
  );
}
