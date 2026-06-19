"use client";

import { useState, useEffect } from "react";
import { HelpCircle } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBridgeBalance } from "@/hooks/use-bridge-balance";
import { useBridge } from "@/hooks/use-bridge";
import { useArcWallet } from "@/components/wallet/use-arc-wallet";
import { BalanceCard } from "@/components/bridge/balance-card";
import { BridgeForm } from "@/components/bridge/bridge-form";
import { TransferHistory, BridgeTransfer } from "@/components/bridge/transfer-history";

export default function BridgePage() {
  const [sourceChain, setSourceChain] = useState<string>("Arc Testnet");
  const [destinationChain, setDestinationChain] = useState<string>("Base Sepolia");
  const [transfers, setTransfers] = useState<BridgeTransfer[]>([]);

  const { address, isConnected } = useArcWallet();
  const { balance, symbol, isLoading, refreshBalance } = useBridgeBalance(sourceChain, address);

  const {
    status,
    sourceTxHash,
    destTxHash,
    error,
    bridgeUSDC,
    resetStatus,
  } = useBridge();

  useEffect(() => {
    const saved = localStorage.getItem("bridge_transfers");
    if (saved) {
      try {
        setTransfers(JSON.parse(saved));
      } catch (err) {
        console.error("Error parsing saved transfers:", err);
      }
    }
  }, []);

  const handleBridge = async (amount: string) => {
    try {
      const result = await bridgeUSDC(amount, sourceChain, destinationChain);
      if (result) {
        interface BridgeStep {
          name: string;
          txHash?: string;
        }
        const burnStep = result.steps?.find((s: BridgeStep) => s.name === "burn" || s.name === "execute");
        const mintStep = result.steps?.find((s: BridgeStep) => s.name === "mint" || s.name === "claim");

        const newTransfer: BridgeTransfer = {
          id: Math.random().toString(36).substring(2, 9),
          fromChain: sourceChain,
          toChain: destinationChain,
          amount: amount,
          status: "Completed",
          date: new Date().toLocaleString(),
          sourceTx: burnStep?.txHash || sourceTxHash,
          destTx: mintStep?.txHash || destTxHash,
        };

        const updated = [newTransfer, ...transfers];
        setTransfers(updated);
        localStorage.setItem("bridge_transfers", JSON.stringify(updated));

        // Refresh balance automatically after successful bridge completion
        refreshBalance();
      }
    } catch (err) {
      console.error("Bridge handler error:", err);
    }
  };

  // Reset status when user changes chains to prevent old transaction info from lingering
  const handleSourceChainChange = (chain: string) => {
    setSourceChain(chain);
    resetStatus();
  };

  const handleDestinationChainChange = (chain: string) => {
    setDestinationChain(chain);
    resetStatus();
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Bridge"
        title="Bridge USDC"
        description="Transfer stablecoins securely between the Arc Testnet and other major Layer-2 testnets."
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Left: Main Widget Form */}
        <div className="space-y-6">
          <BridgeForm
            balance={balance}
            symbol={symbol}
            isLoadingBalance={isLoading}
            sourceChain={sourceChain}
            destinationChain={destinationChain}
            onSourceChainChange={handleSourceChainChange}
            onDestinationChainChange={handleDestinationChainChange}
            status={status}
            sourceTxHash={sourceTxHash}
            destTxHash={destTxHash}
            error={error}
            onBridge={handleBridge}
            isConnected={isConnected}
          />
        </div>

        {/* Right: Balance & Policy Information */}
        <div className="space-y-6">
          <BalanceCard
            chain={sourceChain}
            balance={balance}
            symbol={symbol}
            isLoading={isLoading}
            onRefresh={refreshBalance}
          />

          <Card className="border border-white/10 bg-[#060f24]/50 backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary" />
                How Bridging Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs text-slate-400 leading-5">
              <div className="flex gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-2" />
                <p>
                  USDC transfers use the Circle Cross-Chain Transfer Protocol (CCTP) to safely burn on the source network and mint on the destination network.
                </p>
              </div>
              <div className="flex gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-2" />
                <p>
                  No slippage or exchange pools: all transfers are minted 1:1, meaning you receive exactly the amount of USDC you sent.
                </p>
              </div>
              <div className="flex gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-2" />
                <p>
                  Wallet balances update automatically upon block confirmation. Keep an eye on network status icons for real-time congestion warnings.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom: Transfer History */}
      <div className="mt-6">
        <TransferHistory transfers={transfers} />
      </div>
    </AppShell>
  );
}

