"use client";

import { useState, useCallback } from "react";

export type BridgeStatus =
  | "idle"
  | "preparing"
  | "waiting-wallet"
  | "bridging"
  | "completed"
  | "failed";

export function useBridge() {
  const [status, setStatus] = useState<BridgeStatus>("idle");
  const [sourceTxHash, setSourceTxHash] = useState<string>("");
  const [destTxHash, setDestTxHash] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const bridgeUSDC = useCallback(async (amount: string, fromChain: string, toChain: string) => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    setError(null);
    setStatus("preparing");
    
    // In the future, this is where the Circle SDK / Arc App Kit logic will go:
    // 1. Approve USDC token transfer on source chain.
    // 2. Execute bridge transfer transaction.
    // 3. Monitor destination chain for transfer fulfillment.
    console.log("Mock bridging", amount, "USDC from", fromChain, "to", toChain);
    
    try {
      // Mock execution sequence for UI testing (can be triggered later when SDK is integrated)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStatus("waiting-wallet");
      
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStatus("bridging");
      setSourceTxHash("0x8c6d482c3c1e2a0f8b1a8d11c828e1d5e3c8c2b7d6a5f78c9d0e1f2a3b4c5d6e");
      
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStatus("completed");
      setDestTxHash("0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "An unexpected bridging error occurred";
      setError(errMsg);
      setStatus("failed");
    }
  }, []);

  const resetStatus = useCallback(() => {
    setStatus("idle");
    setSourceTxHash("");
    setDestTxHash("");
    setError(null);
  }, []);

  return {
    status,
    sourceTxHash,
    destTxHash,
    error,
    bridgeUSDC,
    resetStatus,
  };
}
