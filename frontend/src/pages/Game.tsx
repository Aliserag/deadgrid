import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

interface GameState {
  day: number;
  survivors: number;
  zombies: number;
  resources: {
    food: number;
    water: number;
    medicine: number;
    ammo: number;
  };
}

const Game: React.FC = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>({
    day: 1,
    survivors: 10,
    zombies: 100,
    resources: {
      food: 50,
      water: 50,
      medicine: 20,
      ammo: 100,
    },
  });

  // Grid dimensions
  const gridSize = 20;
  const cellSize = 30;

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
        <IconButton
          onClick={() => navigate('/')}
          sx={{ color: '#ff4d4d' }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ color: '#ff4d4d' }}>
          Day {gameState.day}
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
              {Array.from({ length: gridSize * gridSize }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.001 }}
                >
                  <Box
                    sx={{
                      width: cellSize,
                      height: cellSize,
                      background: '#2a2a2a',
                      border: '1px solid #333',
                      '&:hover': {
                        background: '#3a3a3a',
                      },
                    }}
                  />
                </motion.div>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Game Stats */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              background: '#1e1e1e',
              height: 'calc(100vh - 200px)',
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Game; 