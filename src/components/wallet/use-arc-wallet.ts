"use client";

import { useMemo } from "react";
import {
  useAccount,
  useChainId,
  useChains,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from "wagmi";

import { arcTestnet } from "@/config/arc-testnet";

export function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function useArcWallet() {
  const chainId = useChainId();
  const chains = useChains();
  const { address, connector, isConnected, isConnecting, isReconnecting } = useAccount();
  const { connectors, connect, error: connectError, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, switchChainAsync, isPending: isSwitching } = useSwitchChain();

  const availableConnector = connectors[0];
  
  const currentNetwork = useMemo(() => {
    if (!isConnected) {
      return null;
    }

    return chains.find((chain) => chain.id === chainId) ?? {
      id: chainId,
      name: `Unsupported network (${chainId})`,
    };
  }, [chainId, chains, isConnected]);

  const isArcTestnet = isConnected && chainId === arcTestnet.id;
  const isUnsupportedNetwork = isConnected && !isArcTestnet;

  return {
    address,
    availableConnector,
    chainId,
    connect,
    connectError,
    connector,
    currentNetwork,
    disconnect,
    isArcTestnet,
    isConnected,
    isConnecting: isPending || isConnecting || isReconnecting,
    isSwitching,
    isUnsupportedNetwork,
    switchToArcTestnet: () => switchChain({ chainId: arcTestnet.id }),
    switchToArcTestnetAsync: () => switchChainAsync({ chainId: arcTestnet.id }),
    switchChainAsync,
  };
}


