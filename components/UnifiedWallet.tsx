'use client';

import React, { useState, useEffect } from 'react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount, useDisconnect } from 'wagmi';
import StacksWallet from './StacksWallet';

interface UnifiedWalletProps {
  className?: string;
}

const UnifiedWallet: React.FC<UnifiedWalletProps> = ({ className = '' }) => {
  const [activeWallet, setActiveWallet] = useState<'stacks' | 'evm' | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  // WalletConnect/EVM hooks
  const { open } = useWeb3Modal();
  const { address: evmAddress, isConnected: evmConnected } = useAccount();
  const { disconnect: disconnectEvm } = useDisconnect();

  useEffect(() => {
    if (evmConnected) {
      setActiveWallet('evm');
    }
  }, [evmConnected]);

  const handleEvmConnect = () => {
    open();
    setShowMenu(false);
  };

  const handleDisconnectEvm = () => {
    disconnectEvm();
    setActiveWallet(null);
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // If no wallet connected, show connection menu
  if (!evmConnected && activeWallet !== 'stacks') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="
            bg-orange-600 hover:bg-orange-700
            text-white font-bold py-2 px-4 rounded
            border-2 border-orange-800
            shadow-lg hover:shadow-orange-900/50
            transition-all duration-200
          "
        >
          Connect Wallet
        </button>

        {showMenu && (
          <div className="
            absolute top-full right-0 mt-2
            bg-gray-900 border-2 border-gray-700
            rounded-lg shadow-xl
            min-w-[250px]
            z-50
          ">
            <div className="p-4 border-b border-gray-700">
              <p className="text-sm text-gray-400 font-semibold">Choose Network</p>
            </div>

            <div className="p-4 space-y-3">
              {/* Stacks Wallet Option */}
              <button
                onClick={() => {
                  setActiveWallet('stacks');
                  setShowMenu(false);
                }}
                className="
                  w-full bg-purple-600 hover:bg-purple-700
                  text-white font-bold py-3 px-4 rounded
                  text-left transition-colors duration-200
                  flex items-center gap-3
                "
              >
                <div className="w-8 h-8 bg-purple-800 rounded-full flex items-center justify-center">
                  <span className="text-xs">STX</span>
                </div>
                <div>
                  <div className="font-semibold">Stacks Network</div>
                  <div className="text-xs opacity-75">NFT Survivors on Bitcoin L2</div>
                </div>
              </button>

              {/* EVM/WalletConnect Option */}
              <button
                onClick={handleEvmConnect}
                className="
                  w-full bg-blue-600 hover:bg-blue-700
                  text-white font-bold py-3 px-4 rounded
                  text-left transition-colors duration-200
                  flex items-center gap-3
                "
              >
                <div className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center">
                  <span className="text-xs">EVM</span>
                </div>
                <div>
                  <div className="font-semibold">Ethereum Networks</div>
                  <div className="text-xs opacity-75">WalletConnect, MetaMask, etc.</div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Stacks wallet is active
  if (activeWallet === 'stacks') {
    return (
      <div className="flex items-center gap-2">
        <StacksWallet className={className} />
        <button
          onClick={() => setActiveWallet(null)}
          className="
            text-gray-400 hover:text-white
            text-sm underline
          "
        >
          Switch Network
        </button>
      </div>
    );
  }

  // EVM wallet is connected
  if (evmConnected && evmAddress) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="
            bg-green-800 hover:bg-green-700
            text-white font-bold py-2 px-4 rounded
            border-2 border-green-900
            shadow-lg hover:shadow-green-900/50
            transition-all duration-200
            flex items-center gap-2
          "
        >
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span>{formatAddress(evmAddress)}</span>
          <span className="text-xs opacity-75">(EVM)</span>
        </button>

        {showMenu && (
          <div className="
            absolute top-full right-0 mt-2
            bg-gray-900 border-2 border-gray-700
            rounded-lg shadow-xl
            min-w-[250px]
            z-50
          ">
            <div className="p-4 border-b border-gray-700">
              <p className="text-sm text-gray-400">Connected to EVM Network</p>
              <p className="text-xs text-gray-500 mt-1 font-mono">{evmAddress}</p>
            </div>

            <div className="p-4 space-y-3">
              <button
                onClick={() => open()}
                className="
                  w-full bg-blue-600 hover:bg-blue-700
                  text-white font-bold py-2 px-3 rounded
                  text-sm transition-colors duration-200
                "
              >
                Manage Account
              </button>

              <button
                onClick={handleDisconnectEvm}
                className="
                  w-full bg-red-600 hover:bg-red-700
                  text-white font-bold py-2 px-3 rounded
                  text-sm transition-colors duration-200
                "
              >
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default UnifiedWallet;
