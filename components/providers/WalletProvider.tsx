'use client';

import React, { ReactNode } from 'react';
import { createWeb3Modal } from '@web3modal/wagmi';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config, projectId, chains } from '@/lib/wallet/wagmi-config';

// Setup queryClient
const queryClient = new QueryClient();

// Create modal
if (projectId) {
  createWeb3Modal({
    wagmiConfig: config,
    projectId,
    enableAnalytics: true,
    themeMode: 'dark',
    themeVariables: {
      '--w3m-accent': '#ff6b35',
      '--w3m-border-radius-master': '4px',
    },
  });
}

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
