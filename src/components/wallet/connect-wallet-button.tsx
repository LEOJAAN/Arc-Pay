"use client";

import { useState, useEffect } from "react";

import { Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useArcWallet } from "@/components/wallet/use-arc-wallet";

export function ConnectWalletButton() {
  const { availableConnector, connect, isConnecting } = useArcWallet();
  const [hasInjected, setHasInjected] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const win = typeof window !== "undefined" ? (window as { ethereum?: unknown; web3?: unknown }) : undefined;
    setHasInjected(!!win && (!!win.ethereum || !!win.web3));
  }, []);

  if (!mounted) {
    return (
      <Button className="gap-2" size="sm">
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  if (!hasInjected) {
    return (
      <Button
        className="gap-2 bg-slate-800/50 text-slate-500 border border-slate-800/80 cursor-not-allowed hover:bg-slate-800/50"
        size="sm"
        disabled
        title="No browser wallet detected. Please install MetaMask."
      >
        <Wallet className="h-4 w-4" />
        No injected wallet found
      </Button>
    );
  }

  return (
    <Button
      className="gap-2"
      disabled={isConnecting}
      size="sm"
      onClick={() => {
        if (availableConnector) {
          connect({ connector: availableConnector });
        } else {
          alert("Wallet connector is initializing. Please try clicking again in a moment.");
        }
      }}
    >
      <Wallet className="h-4 w-4" />
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}



