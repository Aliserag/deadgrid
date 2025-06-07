'use client';

import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress, Alert, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';

interface SurvivorMinterProps {
  onMintSuccess?: (tokenId: string, txHash: string) => void;
  onMintError?: (error: string) => void;
}

export default function SurvivorMinter({ onMintSuccess, onMintError }: SurvivorMinterProps) {
  const [isMinting, setIsMinting] = useState(false);
  const [lastMintedId, setLastMintedId] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const contractAddress = '0x26E9f28c7c3eB5425003959AC4F4279eF373A1c2';
  const contractABI = [
    "function createSurvivor() payable returns (uint256)",
    "function totalSupply() view returns (uint256)",
    "function getSurvivor(uint256 tokenId) view returns (tuple(uint256 health, uint256 stamina, uint256 intelligence, uint256 strength, uint256 points, bool isAlive))"
  ];

  const mintSurvivor = async () => {
    setIsMinting(true);
    setError(null);
    
    try {
      // Check if MetaMask is available
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask not detected. Please install MetaMask to mint survivors.');
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Check network
      const network = await provider.getNetwork();
      if (network.chainId !== BigInt(84532)) {
        // Try to switch to Base Sepolia
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x14a34' }], // 84532 in hex
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            // Network not added, add it
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x14a34',
                chainName: 'Base Sepolia',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['https://sepolia.base.org'],
                blockExplorerUrls: ['https://sepolia.basescan.org']
              }]
            });
          } else {
            throw switchError;
          }
        }
      }
      
      setIsConnected(true);
      
      // Create contract instance
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      
      // Mint survivor (0.001 ETH fee)
      const tx = await contract.createSurvivor({
        value: ethers.parseEther('0.001')
      });
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      // Get the token ID from the transaction logs
      const tokenId = await contract.totalSupply();
      
      setLastMintedId(tokenId.toString());
      setLastTxHash(receipt.hash);
      
      if (onMintSuccess) {
        onMintSuccess(tokenId.toString(), receipt.hash);
      }
      
    } catch (err: any) {
      console.error('Minting error:', err);
      const errorMessage = err.reason || err.message || 'Failed to mint survivor';
      setError(errorMessage);
      
      if (onMintError) {
        onMintError(errorMessage);
      }
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ 
          p: 3, 
          background: 'rgba(156, 39, 176, 0.1)', 
          border: '1px solid rgba(156, 39, 176, 0.3)',
          borderRadius: '8px',
          mb: 2
        }}>
          <Typography variant="h6" sx={{ color: '#9c27b0', mb: 2, display: 'flex', alignItems: 'center' }}>
            🔗 Mint Survivor NFT
            <Chip 
              label="Base Sepolia" 
              size="small" 
              sx={{ 
                ml: 2, 
                backgroundColor: '#0052ff',
                color: 'white',
                fontSize: '0.7rem'
              }} 
            />
          </Typography>
          
          <Typography variant="body2" sx={{ color: '#ccc', mb: 3 }}>
            Mint your survivor as an NFT on Base blockchain. Each survivor has unique stats and can earn points through gameplay.
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: '#fff' }}>
                Minting Fee:
              </Typography>
              <Typography variant="body2" sx={{ color: '#9c27b0', fontWeight: 'bold' }}>
                0.001 ETH
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: '#fff' }}>
                Network:
              </Typography>
              <Typography variant="body2" sx={{ color: '#0052ff', fontWeight: 'bold' }}>
                Base Sepolia Testnet
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              fullWidth
              onClick={mintSurvivor}
              disabled={isMinting}
              sx={{
                mt: 2,
                background: 'linear-gradient(45deg, #9c27b0 30%, #e91e63 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #7b1fa2 30%, #c2185b 90%)',
                },
                '&:disabled': {
                  background: 'rgba(156, 39, 176, 0.3)',
                }
              }}
            >
              {isMinting ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} sx={{ color: 'white' }} />
                  Minting Survivor...
                </Box>
              ) : (
                'Mint Survivor NFT'
              )}
            </Button>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2, backgroundColor: 'rgba(244, 67, 54, 0.1)' }}>
              {error}
            </Alert>
          )}
          
          {lastMintedId && lastTxHash && (
            <Alert severity="success" sx={{ mt: 2, backgroundColor: 'rgba(76, 175, 80, 0.1)' }}>
              <Typography variant="body2" sx={{ color: '#4caf50' }}>
                🎉 Survivor #{lastMintedId} minted successfully!
              </Typography>
              <Typography variant="caption" sx={{ color: '#ccc', display: 'block', mt: 1 }}>
                Transaction: 
                <a 
                  href={`https://sepolia.basescan.org/tx/${lastTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#9c27b0', marginLeft: '4px' }}
                >
                  {lastTxHash.slice(0, 10)}...{lastTxHash.slice(-8)}
                </a>
              </Typography>
            </Alert>
          )}
          
          <Typography variant="caption" sx={{ color: '#aaa', display: 'block', mt: 2 }}>
            💡 Your minted survivor will have randomized stats and can be used across different DeadGrid sessions.
          </Typography>
        </Box>
      </motion.div>
    </Box>
  );
} 