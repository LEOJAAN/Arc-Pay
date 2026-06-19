"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUpDown,
  AlertTriangle,
  Coins,
  Clock,
  ExternalLink,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useArcWallet } from "@/components/wallet/use-arc-wallet";

const CHAINS = ["Arc Testnet", "Base Sepolia", "Arbitrum Sepolia"];

const EXPLORER_URLS: Record<string, string> = {
  "Arc Testnet": "https://testnet.arcscan.app",
  "Base Sepolia": "https://sepolia.basescan.org",
  "Arbitrum Sepolia": "https://sepolia.arbiscan.io",
};

export function getExplorerUrl(chain: string): string {
  return EXPLORER_URLS[chain] || "https://testnet.arcscan.app";
}

interface BridgeFormProps {
  balance: string;
  symbol: string;
  isLoadingBalance: boolean;
  sourceChain: string;
  destinationChain: string;
  onSourceChainChange: (chain: string) => void;
  onDestinationChainChange: (chain: string) => void;
  status: string;
  sourceTxHash: string;
  destTxHash: string;
  error: string | null;
  onBridge: (amount: string) => void;
  isConnected: boolean;
}

export function BridgeForm({
  balance,
  symbol,
  isLoadingBalance,
  sourceChain,
  destinationChain,
  onSourceChainChange,
  onDestinationChainChange,
  status,
  sourceTxHash,
  destTxHash,
  error,
  onBridge,
  isConnected,
}: BridgeFormProps) {
  const [amount, setAmount] = useState<string>("");
  const { availableConnector, connect } = useArcWallet();

  const isSameChain = sourceChain === destinationChain;
  const isOverBalance = parseFloat(amount) > parseFloat(balance);
  const isValidAmount = amount !== "" && parseFloat(amount) > 0;
  const isFormInvalid = isSameChain || isOverBalance || !isValidAmount;

  const handleSwapChains = () => {
    const temp = sourceChain;
    onSourceChainChange(destinationChain);
    onDestinationChainChange(temp);
  };

  const handleMaxClick = () => {
    setAmount(balance);
  };

  return (
    <div className="space-y-6">
      <Card className="border border-white/10 bg-[#060f24]/50 backdrop-blur-md relative overflow-hidden">
        {/* Shimmer top line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-[#d65dfc]" />

        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary animate-pulse" />
            Bridge USDC
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Transfer USDC tokens across testnets instantly.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 1. Source Chain Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400">Source Chain</label>
            <div className="relative">
              <select
                value={sourceChain}
                onChange={(e) => onSourceChainChange(e.target.value)}
                className="w-full appearance-none rounded-xl bg-white/5 border border-white/8 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
              >
                {CHAINS.map((c) => (
                  <option key={c} value={c} className="bg-[#060f24] text-white">
                    {c}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <ArrowDown className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Swap Button (Visual connector) */}
          <div className="flex justify-center -my-2 relative z-10">
            <button
              onClick={handleSwapChains}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white hover:border-primary hover:shadow-[0_0_12px_rgba(109,93,252,0.3)] transition-all cursor-pointer active:scale-95"
              title="Swap chains"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>

          {/* 2. Destination Chain Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400">Destination Chain</label>
            <div className="relative">
              <select
                value={destinationChain}
                onChange={(e) => onDestinationChainChange(e.target.value)}
                className="w-full appearance-none rounded-xl bg-white/5 border border-white/8 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
              >
                {CHAINS.map((c) => (
                  <option key={c} value={c} className="bg-[#060f24] text-white">
                    {c}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <ArrowDown className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="flex justify-center -my-1">
            <ArrowDown className="h-4 w-4 text-slate-600" />
          </div>

          {/* 3. Amount Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold text-slate-400">Amount</label>
              <button
                onClick={handleMaxClick}
                disabled={isLoadingBalance || parseFloat(balance) <= 0}
                className="text-[10px] font-bold text-primary hover:text-white hover:bg-primary/10 border border-primary/20 px-2 py-0.5 rounded transition-all disabled:opacity-40"
              >
                MAX
              </button>
            </div>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full rounded-xl bg-white/5 border px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition-all font-mono ${
                  isOverBalance
                    ? "border-rose-500/50 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    : "border-white/8 focus:border-primary focus:ring-1 focus:ring-primary"
                }`}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <span className="text-xs font-bold text-[#4f8cff] font-mono">{symbol}</span>
              </div>
            </div>
          </div>

          {/* Validation Warnings */}
          {isSameChain && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-400">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Source and destination chains cannot be the same. Select a different destination network.</span>
            </div>
          )}

          {isOverBalance && (
            <div className="flex items-start gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Insufficient balance. Enter an amount lower than or equal to {balance} USDC.</span>
            </div>
          )}

          <div className="flex justify-center -my-1">
            <ArrowDown className="h-4 w-4 text-slate-600" />
          </div>

          {/* 4. Estimated Receive Card */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs font-medium text-slate-400">Estimated Receive</span>
              <Badge variant="success" className="text-[10px] py-0 px-2 flex gap-1 items-center">
                <Activity className="h-2.5 w-2.5" /> Operational
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-y-2 text-xs font-mono">
              <div className="text-slate-400">You Send:</div>
              <div className="text-right text-white font-semibold">
                {amount ? parseFloat(amount).toLocaleString() : "0.00"} USDC
              </div>

              <div className="text-slate-400">You Receive:</div>
              <div className="text-right text-white font-semibold">
                {amount ? parseFloat(amount).toLocaleString() : "0.00"} USDC
              </div>

              <div className="text-slate-400">Fee:</div>
              <div className="text-right text-emerald-400">0.00 USDC</div>

              <div className="col-span-2 text-slate-400 flex items-start gap-1.5 pt-1.5 border-t border-white/5 mt-1 font-sans">
                <Clock className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <span className="text-[10px] leading-4 text-slate-400">
                  Estimated time: ~2–10 minutes. Finality time may vary by testnet network conditions.
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-center -my-1">
            <ArrowDown className="h-4 w-4 text-slate-600" />
          </div>

          {/* 5. Bridge Button */}
          <Button
            type="button"
            disabled={(isFormInvalid && isConnected) || status === "preparing" || status === "waiting-wallet" || status === "bridging"}
            variant="default"
            className="w-full text-sm font-bold animate-transition"
            onClick={() => {
              if (!isConnected) {
                if (availableConnector) {
                  connect({ connector: availableConnector });
                } else {
                  alert("Please connect your wallet using the button in the top header.");
                }
              } else {
                onBridge(amount);
              }
            }}
          >
            {!isConnected
              ? "Connect Wallet"
              : status === "preparing"
              ? "Preparing..."
              : status === "waiting-wallet"
              ? "Waiting for Wallet..."
              : status === "bridging"
              ? "Bridging..."
              : "Bridge USDC"}
          </Button>

          {/* 6. Bridge Status Area */}
          {status !== "idle" && (
            <div className="border-t border-white/5 pt-4 mt-2 space-y-3">
              <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center justify-between">
                <span>Bridge Status</span>
                {status === "failed" && (
                  <Badge variant="secondary" className="text-[10px] py-0 px-2 bg-rose-500/10 border border-rose-500/20 text-rose-400">Failed</Badge>
                )}
                {status === "completed" && (
                  <Badge variant="success" className="text-[10px] py-0 px-2">Completed</Badge>
                )}
              </div>
              <div className="space-y-2">
                {/* Step 1: Preparing */}
                <div className={cn("flex items-center gap-2 text-xs", 
                  ["preparing", "waiting-wallet", "bridging", "completed"].includes(status) ? "text-slate-300" : "text-slate-500 opacity-50"
                )}>
                  <div className={cn("h-2 w-2 rounded-full", 
                    status === "preparing" ? "bg-primary animate-pulse" : 
                    ["waiting-wallet", "bridging", "completed"].includes(status) ? "bg-emerald-500" : "bg-slate-600"
                  )} />
                  <span>Preparing transaction</span>
                </div>

                {/* Step 2: Waiting Wallet */}
                <div className={cn("flex items-center gap-2 text-xs", 
                  ["waiting-wallet", "bridging", "completed"].includes(status) ? "text-slate-300" : "text-slate-500 opacity-50"
                )}>
                  <div className={cn("h-2 w-2 rounded-full", 
                    status === "waiting-wallet" ? "bg-primary animate-pulse" : 
                    ["bridging", "completed"].includes(status) ? "bg-emerald-500" : "bg-slate-600"
                  )} />
                  <span>Waiting for wallet confirmation</span>
                </div>

                {/* Step 3: Transaction Submitted */}
                <div className={cn("flex items-center gap-2 text-xs", 
                  (sourceTxHash || status === "completed") ? "text-slate-300" : "text-slate-500 opacity-50"
                )}>
                  <div className={cn("h-2 w-2 rounded-full", 
                    (sourceTxHash || status === "completed") ? "bg-emerald-500" : "bg-slate-600"
                  )} />
                  <span>Transaction submitted</span>
                </div>

                {/* Step 4: Bridging In Progress */}
                <div className={cn("flex items-center gap-2 text-xs", 
                  ["bridging", "completed"].includes(status) ? "text-slate-300" : "text-slate-500 opacity-50"
                )}>
                  <div className={cn("h-2 w-2 rounded-full", 
                    status === "bridging" ? "bg-primary animate-pulse" : 
                    status === "completed" ? "bg-emerald-500" : "bg-slate-600"
                  )} />
                  <span>Bridging in progress</span>
                </div>

                {/* Step 5: Bridge Completed */}
                <div className={cn("flex items-center gap-2 text-xs", 
                  status === "completed" ? "text-slate-300" : "text-slate-500 opacity-50"
                )}>
                  <div className={cn("h-2 w-2 rounded-full", 
                    status === "completed" ? "bg-emerald-500" : "bg-slate-600"
                  )} />
                  <span>Bridge completed</span>
                </div>
              </div>

              {error && (
                <div className="text-xs text-rose-400 mt-2 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2.5 font-sans leading-normal">
                  Error: {error}
                </div>
              )}
            </div>
          )}

          {/* 7. Explorer Links */}
          {(sourceTxHash || destTxHash) && (
            <div className="border-t border-white/5 pt-3 flex flex-col gap-1.5 text-[11px] text-slate-400">
              {sourceTxHash && (
                <div className="flex justify-between items-center">
                  <span>Source TX Hash:</span>
                  <a
                    href={`${getExplorerUrl(sourceChain)}/tx/${sourceTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-white flex items-center gap-1 transition-all font-mono"
                  >
                    {sourceTxHash.slice(0, 10)}...{sourceTxHash.slice(-8)}{" "}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {destTxHash && (
                <div className="flex justify-between items-center">
                  <span>Destination TX Hash:</span>
                  <a
                    href={`${getExplorerUrl(destinationChain)}/tx/${destTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-white flex items-center gap-1 transition-all font-mono"
                  >
                    {destTxHash.slice(0, 10)}...{destTxHash.slice(-8)}{" "}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}

