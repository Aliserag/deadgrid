'use client';

import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';

interface GameState {
  day: number;
  phase: 'day' | 'night';
  survivors: number;
  zombies: number;
  resources: {
    food: number;
    water: number;
    medicine: number;
    ammo: number;
  };
  cityGrid: CityCell[];
  log: string[];
  weather: {
    condition: string;
    temperature: number;
    effects: string[];
  };
}

interface CityCell {
  type: 'empty' | 'building' | 'barricade' | 'resource' | 'zombie' | 'survivor';
  health?: number;
  resources?: number;
}

interface NightEvent {
  title: string;
  description: string;
  options: {
    label: string;
    effect: (state: GameState) => GameState;
  }[];
}

const gridSize = 10;
const cellSize = 36;

const cellGraphics: Record<CityCell['type'], { emoji: string; label: string; color: string }> = {
  empty: { emoji: '⬛', label: 'Empty Space', color: '#2a2a2a' },
  building: { emoji: '🏢', label: 'Building', color: '#4a4a4a' },
  barricade: { emoji: '🪵', label: 'Barricade', color: '#8b4513' },
  resource: { emoji: '🎒', label: 'Resource Cache', color: '#ffd700' },
  zombie: { emoji: '🧟', label: 'Zombie', color: '#ff4d4d' },
  survivor: { emoji: '🧑', label: 'Survivor', color: '#4caf50' },
};

async function generateNightEvent(gameState: GameState): Promise<NightEvent> {
  try {
    const response = await fetch('/api/game', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'generateNightEvent',
        gameState,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate night event');
    }

    const data = await response.json();
    return {
      title: data.event.title,
      description: data.event.description,
      options: data.event.options.map((opt: any) => ({
        label: opt.label,
        effect: (state: GameState) => {
          const newState = { ...state };
          // Apply resource changes
          if (opt.resources) {
            Object.entries(opt.resources).forEach(([key, value]) => {
              newState.resources[key as keyof typeof newState.resources] += value as number;
            });
          }
          // Apply survivor/zombie changes
          if (opt.survivors) newState.survivors += opt.survivors;
          if (opt.zombies) newState.zombies += opt.zombies;
          return newState;
        },
      })),
    };
  } catch (error) {
    console.error('Error generating night event:', error);
    // Fallback to a simple event if generation fails
    return {
      title: 'Quiet Night',
      description: 'The night passes without incident.',
      options: [
        {
          label: 'Continue',
          effect: (state: GameState) => state,
        },
      ],
    };
  }
}

async function updateMap(gameState: GameState): Promise<CityCell[]> {
  try {
    const response = await fetch('/api/game', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'updateMap',
        gameState,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update map');
    }

    const data = await response.json();
    return data.mapUpdate.cells;
  } catch (error) {
    console.error('Error updating map:', error);
    return gameState.cityGrid;
  }
}

function generateInitialGrid(): CityCell[] {
  const cells: CityCell[] = Array(gridSize * gridSize).fill({ type: 'empty' });
  for (let i = 0; i < 3; i++) cells[i] = { type: 'survivor' };
  for (let i = 3; i < 8; i++) cells[i] = { type: 'zombie' };
  for (let i = 8; i < 13; i++) cells[i] = { type: 'building', health: 100 };
  for (let i = 13; i < 16; i++) cells[i] = { type: 'resource', resources: 50 };
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return cells;
}

export default function Game() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>({
    day: 1,
    phase: 'day',
    survivors: 10,
    zombies: 100,
    resources: {
      food: 50,
      water: 50,
      medicine: 20,
      ammo: 100,
    },
    cityGrid: generateInitialGrid(),
    log: ['Day 1: The survivors begin their struggle.'],
    weather: {
      condition: 'Clear',
      temperature: 20,
      effects: [],
    },
  });
  const [nightEvent, setNightEvent] = useState<NightEvent | null>(null);
  const [showNightModal, setShowNightModal] = useState(false);

  const handleEndDay = async () => {
    try {
      // Generate night event
      const event = await generateNightEvent(gameState);
      setNightEvent(event);
      setShowNightModal(true);
      setGameState((prev) => ({ ...prev, phase: 'night' }));

      // Update map
      const newGrid = await updateMap(gameState);
      setGameState((prev) => ({ ...prev, cityGrid: newGrid }));

      // Add to log
      setGameState((prev) => ({
        ...prev,
        log: [
          ...prev.log,
          `Night ${prev.day}: ${event.description}`,
        ],
      }));
    } catch (error) {
      console.error('Error ending day:', error);
      setGameState((prev) => ({
        ...prev,
        log: [
          ...prev.log,
          `Error: Failed to generate night event`,
        ],
      }));
    }
  };

  const handleNightDecision = (effect: (state: GameState) => GameState) => {
    setGameState((prev) => {
      const newState = effect(prev);
      const decisionLog = nightEvent?.options.find(opt => opt.effect === effect)?.label || 'Continue';
      return {
        ...newState,
        day: prev.day + 1,
        phase: 'day',
        log: [
          ...prev.log,
          `Decision: ${decisionLog}`,
          `Day ${prev.day + 1}: A new day begins.`,
        ],
      };
    });
    setShowNightModal(false);
    setNightEvent(null);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#121212',
        p: 2,
      }}
    >
      {/* Top Bar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <IconButton onClick={() => router.push('/')} sx={{ color: '#ff4d4d' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ color: '#ff4d4d' }}>
          Day {gameState.day} {gameState.phase === 'night' && '(Night)'}
        </Typography>
        <Typography variant="body2" sx={{ color: '#4fc3f7' }}>
          Weather: {gameState.weather.condition} ({gameState.weather.temperature}°C)
        </Typography>
      </Box>

      {/* Main Game Grid */}
      <Grid container spacing={2}>
        {/* Game Grid */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 2,
              background: '#1e1e1e',
              height: 'calc(100vh - 200px)',
              overflow: 'auto',
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
                gap: '1px',
                background: '#333',
                p: 1,
              }}
            >
              {gameState.cityGrid.map((cell, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.001 }}
                >
                  <Tooltip 
                    title={`${cellGraphics[cell.type].label}${
                      cell.health !== undefined ? ` (Health: ${cell.health}%)` : ''
                    }${
                      cell.resources !== undefined ? ` (Resources: ${cell.resources})` : ''
                    }`}
                    arrow
                  >
                    <Box
                      sx={{
                        width: cellSize,
                        height: cellSize,
                        background: cellGraphics[cell.type].color,
                        border: '1px solid #333',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 22,
                        cursor: 'pointer',
                        position: 'relative',
                        '&:hover': {
                          background: `${cellGraphics[cell.type].color}dd`,
                          transform: 'scale(1.1)',
                          zIndex: 1,
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {cellGraphics[cell.type].emoji}
                      {cell.health !== undefined && (
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: 2,
                            background: `linear-gradient(to right, #4caf50 ${cell.health}%, #ff4d4d ${cell.health}%)`,
                          }}
                        />
                      )}
                    </Box>
                  </Tooltip>
                </motion.div>
              ))}
            </Box>
            {gameState.phase === 'day' && (
              <Button
                variant="contained"
                color="secondary"
                sx={{ mt: 3, width: '100%' }}
                onClick={handleEndDay}
              >
                End Day
              </Button>
            )}
          </Paper>
        </Grid>

        {/* Game Stats */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              background: '#1e1e1e',
              height: 'calc(100vh - 200px)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, color: '#ff4d4d' }}>
              Game Stats
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ color: '#4caf50' }}>
                Survivors: {gameState.survivors}
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#ff4d4d' }}>
                Zombies: {gameState.zombies}
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ mb: 2, color: '#ff4d4d' }}>
              Resources
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
              <Typography variant="body2" sx={{ color: '#ffd700' }}>
                Food: {gameState.resources.food}
              </Typography>
              <Typography variant="body2" sx={{ color: '#4fc3f7' }}>
                Water: {gameState.resources.water}
              </Typography>
              <Typography variant="body2" sx={{ color: '#81c784' }}>
                Medicine: {gameState.resources.medicine}
              </Typography>
              <Typography variant="body2" sx={{ color: '#ff8a65' }}>
                Ammo: {gameState.resources.ammo}
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ color: '#ff4d4d' }}>
              Event Log
            </Typography>
            <Box 
              sx={{ 
                flex: 1,
                overflow: 'auto',
                mt: 1,
                p: 1,
                background: 'rgba(0,0,0,0.2)',
                borderRadius: 1,
              }}
            >
              {gameState.log.map((entry, idx) => (
                <Typography 
                  key={idx} 
                  variant="body2" 
                  sx={{ 
                    color: '#fff',
                    mb: 1,
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    pb: 1,
                  }}
                >
                  {entry}
                </Typography>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Night Event Modal */}
      <Dialog 
        open={showNightModal} 
        onClose={() => {}}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: '#ff4d4d' }}>
          {nightEvent?.title}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#fff', my: 2 }}>
            {nightEvent?.description}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          {nightEvent?.options.map((opt, idx) => (
            <Button 
              key={idx} 
              onClick={() => handleNightDecision(opt.effect)}
              variant="contained"
              color="primary"
              sx={{ mr: 1 }}
            >
              {opt.label}
            </Button>
          ))}
        </DialogActions>
      </Dialog>
    </Box>
  );
} 