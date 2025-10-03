'use client';

import { defaultWagmiConfig } from '@web3modal/wagmi';
import { cookieStorage, createStorage } from 'wagmi';
import { mainnet, sepolia, polygon, arbitrum } from 'wagmi/chains';

// Get projectId from environment variables
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

if (!projectId) {
  console.warn('Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID');
}

// Define metadata
const metadata = {
  name: 'DeadGrid',
  description: 'Self-Evolving Post-Apocalyptic Zombie Survival Game',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://deadgrid.com',
  icons: ['/logo.png']
};

// Define supported chains
export const chains = [mainnet, sepolia, polygon, arbitrum] as const;

// Create wagmi config
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage
  }),
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true,
});
