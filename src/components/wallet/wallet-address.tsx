"use client";

import { Copy, WalletCards } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { shortenAddress, useArcWallet } from "@/components/wallet/use-arc-wallet";

export function WalletAddress() {
  const { address, isConnected } = useArcWallet();

  if (!isConnected || !address) {
    return (
      <Badge variant="outline">
        <WalletCards className="mr-1 h-3 w-3" />
        No wallet
      </Badge>
    );
  }

  return (
    <Badge variant="outline" title={address}>
      <Copy className="mr-1 h-3 w-3" />
      {shortenAddress(address)}
    </Badge>
  );
}
