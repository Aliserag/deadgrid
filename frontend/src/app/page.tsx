'use client';

import React, { useState } from 'react';
import { Box, Button, Typography, Container, Collapse, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import BlockchainAnalytics from '../components/BlockchainAnalytics';

export default function Home() {
  const router = useRouter();
  const [showAnalytics, setShowAnalytics] = useState(false);

  const menuItems = [
    { text: 'New Game', path: '/game' },
    { text: 'Settings', path: '/settings' },
    { text: 'Exit', action: () => window.close() },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(45deg, #1a1a1a 0%, #2d1a1a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("/grid-pattern.png")',
          opacity: 0.1,
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <Typography
            variant="h1"
            component="h1"
            align="center"
            sx={{
              mb: 6,
              textShadow: '0 0 10px rgba(255, 77, 77, 0.5)',
              color: '#ff4d4d',
            }}
          >
            DEADGRID
          </Typography>
        </motion.div>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            alignItems: 'center',
          }}
        >
          {menuItems.map((item, index) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={() => item.action ? item.action() : router.push(item.path)}
                sx={{
                  minWidth: 200,
                  background: 'rgba(255, 77, 77, 0.1)',
                  border: '1px solid rgba(255, 77, 77, 0.3)',
                  '&:hover': {
                    background: 'rgba(255, 77, 77, 0.2)',
                    border: '1px solid rgba(255, 77, 77, 0.5)',
                  },
                  py: 1,
                }}
              >
                {item.text}
              </Button>
            </motion.div>
          ))}
          
          {/* Blockchain Analytics Toggle */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Button
              variant="contained"
              color="secondary"
              size="large"
              fullWidth
              onClick={() => setShowAnalytics(!showAnalytics)}
              sx={{
                minWidth: 200,
                background: 'rgba(156, 39, 176, 0.1)',
                border: '1px solid rgba(156, 39, 176, 0.3)',
                '&:hover': {
                  background: 'rgba(156, 39, 176, 0.2)',
                  border: '1px solid rgba(156, 39, 176, 0.5)',
                },
                flexDirection: 'column',
                py: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Blockchain Analytics
                {showAnalytics ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </Box>
              <Typography variant="caption" sx={{ mt: 0.5, opacity: 0.8 }}>
                🚀 Live Base Network Stats
              </Typography>
            </Button>
          </motion.div>
        </Box>

        {/* Blockchain Analytics Section */}
        <Collapse in={showAnalytics}>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: showAnalytics ? 1 : 0, height: showAnalytics ? 'auto' : 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ mt: 4, mb: 2 }}>
              <BlockchainAnalytics />
            </Box>
          </motion.div>
        </Collapse>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <Typography
            variant="body2"
            align="center"
            sx={{
              mt: 4,
              color: 'rgba(255, 255, 255, 0.5)',
              fontStyle: 'italic',
            }}
          >
            "In a world overrun by the undead, every decision matters..."
          </Typography>
        </motion.div>
      </Container>
    </Box>
  );
} 