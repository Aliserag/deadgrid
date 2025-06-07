'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Contract ABI (simplified for key functions)
const DEADGRID_ABI = [
  "function createSurvivor(string memory _name, string memory _faction) external payable returns (uint256)",
  "function getSurvivorsByPlayer(address _player) external view returns (uint256[] memory)",
  "function survivors(uint256) external view returns (uint256 id, string name, uint256 health, uint256 stamina, uint256 intelligence, uint256 strength, uint256 experience, uint256 level, string faction, string location, uint256 lastActionTime, bool isAlive, string aiPersonality)",
  "function getCurrentGameState() external view returns (uint256 day, uint256 zombieCount, string weatherCondition, uint256 resourceScarcity, string aiNarrative)",
  "function getPlayerRewards(address _player) external view returns (uint256)",
  "function completeMission(uint256 _survivorId, uint256 _missionId) external",
  "function getMissionDetails(uint256 _missionId) external view returns (uint256 id, string title, string description, uint256 difficulty, uint256 reward, uint256 deadline, bool isActive, string aiGeneratedContent)",
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)"
];

const CONTRACT_ADDRESS = "0x26E9f28c7c3eB5425003959AC4F4279eF373A1c2";
const BASE_SEPOLIA_CHAIN_ID = 84532;

interface Survivor {
  id: number;
  name: string;
  health: number;
  stamina: number;
  intelligence: number;
  strength: number;
  experience: number;
  level: number;
  faction: string;
  location: string;
  isAlive: boolean;
  aiPersonality: string;
}

interface GameState {
  day: number;
  zombieCount: number;
  weatherCondition: string;
  resourceScarcity: number;
  aiNarrative: string;
}

const NoditIntegration: React.FC = () => {
  const [account, setAccount] = useState<string>('');
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [survivors, setSurvivors] = useState<Survivor[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerRewards, setPlayerRewards] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  // Create Survivor Form
  const [createSurvivorOpen, setCreateSurvivorOpen] = useState<boolean>(false);
  const [survivorName, setSurvivorName] = useState<string>('');
  const [survivorFaction, setSurvivorFaction] = useState<string>('');

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          setAccount(accounts[0].address);
          setProvider(provider);
          await setupContract(provider);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // Check if we're on Base Sepolia
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== BASE_SEPOLIA_CHAIN_ID) {
        await switchToBaseSepolia();
      }

      setAccount(address);
      setProvider(provider);
      await setupContract(provider);
      setSuccess('Wallet connected successfully!');
    } catch (error: any) {
      setError(`Failed to connect wallet: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const switchToBaseSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${BASE_SEPOLIA_CHAIN_ID.toString(16)}` }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${BASE_SEPOLIA_CHAIN_ID.toString(16)}`,
                chainName: 'Base Sepolia',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://sepolia.base.org'],
                blockExplorerUrls: ['https://sepolia.basescan.org/'],
              },
            ],
          });
        } catch (addError) {
          throw new Error('Failed to add Base Sepolia network');
        }
      } else {
        throw switchError;
      }
    }
  };

  const setupContract = async (provider: ethers.BrowserProvider) => {
    try {
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, DEADGRID_ABI, signer);
      setContract(contractInstance);
      
      // Load initial data
      await loadGameData(contractInstance, await signer.getAddress());
    } catch (error) {
      console.error('Error setting up contract:', error);
      setError('Failed to setup contract connection');
    }
  };

  const loadGameData = async (contractInstance: ethers.Contract, playerAddress: string) => {
    try {
      setLoading(true);

      // Load game state
      const gameStateData = await contractInstance.getCurrentGameState();
      setGameState({
        day: Number(gameStateData[0]),
        zombieCount: Number(gameStateData[1]),
        weatherCondition: gameStateData[2],
        resourceScarcity: Number(gameStateData[3]),
        aiNarrative: gameStateData[4]
      });

      // Load player rewards
      const rewards = await contractInstance.getPlayerRewards(playerAddress);
      setPlayerRewards(Number(rewards));

      // Load player survivors
      const survivorIds = await contractInstance.getSurvivorsByPlayer(playerAddress);
      const survivorData: Survivor[] = [];

      for (const id of survivorIds) {
        const survivor = await contractInstance.survivors(id);
        survivorData.push({
          id: Number(survivor[0]),
          name: survivor[1],
          health: Number(survivor[2]),
          stamina: Number(survivor[3]),
          intelligence: Number(survivor[4]),
          strength: Number(survivor[5]),
          experience: Number(survivor[6]),
          level: Number(survivor[7]),
          faction: survivor[8],
          location: survivor[9],
          isAlive: survivor[11],
          aiPersonality: survivor[12]
        });
      }

      setSurvivors(survivorData);
    } catch (error) {
      console.error('Error loading game data:', error);
      setError('Failed to load game data');
    } finally {
      setLoading(false);
    }
  };

  const createSurvivor = async () => {
    if (!contract || !survivorName || !survivorFaction) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const tx = await contract.createSurvivor(survivorName, survivorFaction, {
        value: ethers.parseEther('0.001') // 0.001 ETH fee
      });

      setSuccess('Creating survivor... Please wait for transaction confirmation.');
      await tx.wait();

      setSuccess('Survivor created successfully!');
      setSurvivorName('');
      setSurvivorFaction('');
      setCreateSurvivorOpen(false);

      // Reload data
      if (provider) {
        const signer = await provider.getSigner();
        await loadGameData(contract, await signer.getAddress());
      }
    } catch (error: any) {
      setError(`Failed to create survivor: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (health: number) => {
    if (health > 70) return 'success';
    if (health > 30) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        🧟 DeadGrid: AI-Powered Survival on Base
      </Typography>
      
      <Typography variant="h6" align="center" color="text.secondary" gutterBottom>
        Powered by Nodit Infrastructure
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {!account ? (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Connect Your Wallet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Connect to Base Sepolia testnet to start your zombie apocalypse survival journey
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={connectWallet}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Account Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Typography variant="h6">Connected Account</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {account}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label="Base Sepolia" color="primary" />
                    <Chip label={`${playerRewards} Rewards`} color="secondary" />
                    <Chip label={`${survivors.length} Survivors`} color="info" />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Game State */}
          {gameState && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🌍 Current Game State - Day {gameState.day}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>Weather:</strong> {gameState.weatherCondition}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Zombie Count:</strong> {gameState.zombieCount.toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Resource Scarcity:</strong> {gameState.resourceScarcity}%
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>AI Narrative:</strong> {gameState.aiNarrative}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎮 Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  onClick={() => setCreateSurvivorOpen(true)}
                  disabled={loading}
                >
                  Create Survivor (0.001 ETH)
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => provider && loadGameData(contract!, account)}
                  disabled={loading}
                >
                  Refresh Data
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Survivors */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                👥 Your Survivors ({survivors.length})
              </Typography>
              {survivors.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No survivors yet. Create your first survivor to begin your journey!
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {survivors.map((survivor) => (
                    <Grid item xs={12} md={6} lg={4} key={survivor.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {survivor.name}
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                            <Chip
                              label={survivor.isAlive ? 'Alive' : 'Dead'}
                              color={survivor.isAlive ? 'success' : 'error'}
                              size="small"
                              sx={{ mr: 1 }}
                            />
                            <Chip
                              label={`Level ${survivor.level}`}
                              color="primary"
                              size="small"
                            />
                          </Box>
                          <Typography variant="body2" gutterBottom>
                            <strong>Faction:</strong> {survivor.faction}
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Location:</strong> {survivor.location}
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Personality:</strong> {survivor.aiPersonality}
                          </Typography>
                          <Divider sx={{ my: 1 }} />
                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <Typography variant="caption">
                                Health: {survivor.health}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption">
                                Stamina: {survivor.stamina}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption">
                                Intelligence: {survivor.intelligence}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption">
                                Strength: {survivor.strength}
                              </Typography>
                            </Grid>
                          </Grid>
                          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            Experience: {survivor.experience}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Create Survivor Dialog */}
      <Dialog open={createSurvivorOpen} onClose={() => setCreateSurvivorOpen(false)}>
        <DialogTitle>Create New Survivor</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Survivor Name"
            fullWidth
            variant="outlined"
            value={survivorName}
            onChange={(e) => setSurvivorName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Faction"
            fullWidth
            variant="outlined"
            value={survivorFaction}
            onChange={(e) => setSurvivorFaction(e.target.value)}
            placeholder="e.g., Scavengers, Military, Scientists"
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Cost: 0.001 ETH + gas fees
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateSurvivorOpen(false)}>Cancel</Button>
          <Button
            onClick={createSurvivor}
            variant="contained"
            disabled={loading || !survivorName || !survivorFaction}
          >
            {loading ? 'Creating...' : 'Create Survivor'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NoditIntegration; 