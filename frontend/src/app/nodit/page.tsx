'use client';

import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import NoditIntegration from '../../components/NoditIntegration';

export default function NoditPage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            🧟‍♂️ DeadGrid x Nodit
          </Typography>
          <Typography variant="h6" color="text.secondary" align="center" paragraph>
            Multi-Chain Zombie Survival Powered by Nodit Infrastructure
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary">
            Experience DeadGrid on Ethereum with cross-chain capabilities, NFT survivors, and decentralized resource trading.
          </Typography>
        </Paper>
        
        <NoditIntegration />
      </Box>
    </Container>
  );
} 