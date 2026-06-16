"use client";

import { useState, useEffect } from "react";

import { Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button";
import { DisconnectWalletButton } from "@/components/wallet/disconnect-wallet-button";
import { NetworkStatus } from "@/components/wallet/network-status";
import { UnsupportedNetworkWarning } from "@/components/wallet/unsupported-network-warning";
import { WalletAddress } from "@/components/wallet/wallet-address";
import { useArcWallet } from "@/components/wallet/use-arc-wallet";

export function WalletPanel() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { isConnected } = useArcWallet();

  if (!mounted) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <ConnectWalletButton />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <NetworkStatus />
      
      <a
        href="https://faucet.circle.com/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 h-8 rounded-lg text-[#93c5fd] border-[#4f8cff]/25 hover:border-[#4f8cff]/55 hover:bg-[#2563ff]/15 hover:text-white transition-all duration-200"
        >
          <Droplet className="h-3.5 w-3.5 text-[#4f8cff]" />
          Faucet
        </Button>
      </a>

      {isConnected ? (
        <>
          <WalletAddress />
          <DisconnectWalletButton />
        </>
      ) : (
        <ConnectWalletButton />
      )}
    </div>
  );
}



export { UnsupportedNetworkWarning };
