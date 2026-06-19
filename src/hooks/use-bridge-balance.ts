"use client";

import { useState, useEffect, useCallback } from "react";

const MOCK_BALANCES: Record<string, string> = {
  "Arc Testnet": "250.00",
  "Base Sepolia": "1250.00",
  "Arbitrum Sepolia": "5000.00",
};

export function useBridgeBalance(chain: string) {
  const [balance, setBalance] = useState<string>("0.00");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const symbol = "USDC";

  const refreshBalance = useCallback(async () => {
    setIsLoading(true);
    // Simulate RPC call delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    setBalance(MOCK_BALANCES[chain] || "0.00");
    setIsLoading(false);
  }, [chain]);

  useEffect(() => {
    refreshBalance();
  }, [chain, refreshBalance]);

  return {
    balance,
    symbol,
    isLoading,
    refreshBalance,
  };
}
