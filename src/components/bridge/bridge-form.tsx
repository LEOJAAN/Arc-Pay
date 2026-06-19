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

const CHAINS = ["Arc Testnet", "Base Sepolia", "Arbitrum Sepolia"];

interface BridgeFormProps {
  balance: string;
  symbol: string;
  isLoadingBalance: boolean;
  sourceChain: string;
  destinationChain: string;
  onSourceChainChange: (chain: string) => void;
  onDestinationChainChange: (chain: string) => void;
}

export function BridgeForm({
  balance,
  symbol,
  isLoadingBalance,
  sourceChain,
  destinationChain,
  onSourceChainChange,
  onDestinationChainChange,
}: BridgeFormProps) {
  const [amount, setAmount] = useState<string>("");

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

              <div className="text-slate-400 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Time:
              </div>
              <div className="text-right text-[#4f8cff]">2-3 minutes</div>
            </div>
          </div>

          <div className="flex justify-center -my-1">
            <ArrowDown className="h-4 w-4 text-slate-600" />
          </div>

          {/* 5. Bridge Button (Disabled) */}
          <Button
            type="button"
            disabled={isFormInvalid || true}
            variant="default"
            className="w-full text-sm font-bold"
          >
            Bridge USDC
          </Button>

          {/* 6. Bridge Status Area (Hidden - future SDK integration) */}
          <div className="hidden border-t border-white/5 pt-4 mt-2 space-y-3">
            <div className="text-xs font-semibold text-slate-400 mb-1">Bridge Progress</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-slate-300">Preparing transaction...</span>
              </div>
              <div className="flex items-center gap-2 text-xs opacity-50">
                <div className="h-2 w-2 rounded-full bg-slate-600" />
                <span className="text-slate-400">Waiting for wallet confirmation...</span>
              </div>
              <div className="flex items-center gap-2 text-xs opacity-50">
                <div className="h-2 w-2 rounded-full bg-slate-600 animate-pulse" />
                <span className="text-slate-400">Bridging...</span>
              </div>
              <div className="flex items-center gap-2 text-xs opacity-50">
                <div className="h-2 w-2 rounded-full bg-slate-600" />
                <span className="text-slate-400">Completed</span>
              </div>
            </div>
          </div>

          {/* 7. Explorer Links Placeholder (Hidden - SDK integration) */}
          <div className="hidden border-t border-white/5 pt-3 flex flex-col gap-1.5 text-[11px] text-slate-400">
            <div className="flex justify-between items-center">
              <span>Source TX Hash:</span>
              <a
                href="#"
                className="text-primary hover:text-white flex items-center gap-1 transition-all"
              >
                0x8c6d482c... <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="flex justify-between items-center">
              <span>Destination TX Hash:</span>
              <a
                href="#"
                className="text-primary hover:text-white flex items-center gap-1 transition-all"
              >
                0x9a8b7c6d... <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
