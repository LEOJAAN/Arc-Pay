"use client";

import { Wallet, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BalanceCardProps {
  chain: string;
  balance: string;
  symbol: string;
  isLoading: boolean;
  onRefresh: () => void;
}

export function BalanceCard({
  chain,
  balance,
  symbol,
  isLoading,
  onRefresh,
}: BalanceCardProps) {
  return (
    <Card className="relative overflow-hidden border border-white/10 bg-[#060f24]/50 backdrop-blur-md">
      {/* Decorative accent gradient background */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 h-36 w-36 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Available Balance</p>
              <p className="text-xs text-slate-500 font-semibold">{chain}</p>
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-all disabled:opacity-40"
            title="Refresh balance"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </button>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          {isLoading ? (
            <div className="h-9 w-32 animate-pulse rounded-md bg-white/10" />
          ) : (
            <span className="text-3xl font-bold tracking-tight text-white">
              {parseFloat(balance).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          )}
          <span className="text-sm font-semibold text-[#4f8cff]">{symbol}</span>
        </div>
      </CardContent>
    </Card>
  );
}
