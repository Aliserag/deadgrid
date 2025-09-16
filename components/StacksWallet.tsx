'use client';

import React, { useState, useEffect } from 'react';
import StacksServiceSimple from '@/lib/stacks/StacksServiceSimple';

interface StacksWalletProps {
  className?: string;
}

const StacksWallet: React.FC<StacksWalletProps> = ({ className = '' }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [userSurvivors, setUserSurvivors] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const stacksService = StacksServiceSimple.getInstance();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = () => {
    const connected = stacksService.isUserSignedIn();
    setIsConnected(connected);
    if (connected) {
      const address = stacksService.getUserAddress();
      setUserAddress(address);
      if (address) {
        loadUserSurvivors();
      }
    }
  };

  const loadUserSurvivors = async () => {
    try {
      const survivors = await stacksService.getUserSurvivors();
      setUserSurvivors(survivors);
    } catch (error) {
      console.error('Error loading survivors:', error);
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await stacksService.connectWallet();
      checkConnection();
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    stacksService.disconnectWallet();
    setIsConnected(false);
    setUserAddress(null);
    setUserSurvivors([]);
    setShowMenu(false);
  };

  const handleMintSurvivor = async () => {
    if (!isConnected) return;
    
    const names = ['John', 'Sarah', 'Mike', 'Emma', 'Alex', 'Lisa'];
    const factions = ['Survivors', 'Raiders', 'Traders', 'Military'];
    
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomFaction = factions[Math.floor(Math.random() * factions.length)];
    
    try {
      await stacksService.mintSurvivor(
        `${randomName} the ${randomFaction}`,
        randomFaction
      );
      // Reload survivors after minting
      setTimeout(loadUserSurvivors, 5000);
    } catch (error) {
      console.error('Minting failed:', error);
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (!isConnected) {
    return (
      <button
        onClick={handleConnect}
        disabled={isLoading}
        className={`
          bg-orange-600 hover:bg-orange-700 
          text-white font-bold py-2 px-4 rounded
          border-2 border-orange-800
          shadow-lg hover:shadow-orange-900/50
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
      >
        {isLoading ? 'Connecting...' : 'Connect Stacks Wallet'}
      </button>
    );
  }

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
        <span>{formatAddress(userAddress || '')}</span>
        <span className="text-xs opacity-75">
          ({userSurvivors.length} NFTs)
        </span>
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
            <p className="text-sm text-gray-400">Connected to Stacks</p>
            <p className="text-xs text-gray-500 mt-1">{userAddress}</p>
          </div>

          <div className="p-4 space-y-3">
            <div className="text-sm">
              <p className="text-gray-400">Your Survivors</p>
              <p className="text-2xl font-bold text-white">{userSurvivors.length}</p>
            </div>

            <button
              onClick={handleMintSurvivor}
              className="
                w-full bg-blue-600 hover:bg-blue-700
                text-white font-bold py-2 px-3 rounded
                text-sm transition-colors duration-200
              "
            >
              Mint New Survivor (100 STX)
            </button>

            {userSurvivors.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-gray-400">Your NFT IDs:</p>
                <div className="flex flex-wrap gap-1">
                  {userSurvivors.map(id => (
                    <span 
                      key={id}
                      className="
                        text-xs bg-gray-800 px-2 py-1 rounded
                        text-gray-300
                      "
                    >
                      #{id}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleDisconnect}
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
};

export default StacksWallet;