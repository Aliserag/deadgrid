import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Box, 
  LinearProgress,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import { Faction, NPC } from '../hooks/useGameData';

interface FactionDisplayProps {
  faction: Faction;
  npcs: NPC[];
  reputation: number;
  onFactionClick?: (faction: Faction) => void;
}

export default function FactionDisplay({ 
  faction, 
  npcs, 
  reputation, 
  onFactionClick 
}: FactionDisplayProps) {
  const factionNPCs = npcs.filter(npc => npc.faction_id === faction.id);
  
  const getReputationColor = (rep: number) => {
    if (rep >= 50) return '#4caf50'; // Green - Friendly
    if (rep >= 25) return '#8bc34a'; // Light Green - Positive
    if (rep >= 0) return '#ffc107'; // Yellow - Neutral
    if (rep >= -25) return '#ff9800'; // Orange - Suspicious
    if (rep >= -50) return '#f44336'; // Red - Hostile
    return '#d32f2f'; // Dark Red - Enemy
  };

  const getReputationLabel = (rep: number) => {
    if (rep >= 75) return 'Trusted Ally';
    if (rep >= 50) return 'Friendly';
    if (rep >= 25) return 'Positive';
    if (rep >= 0) return 'Neutral';
    if (rep >= -25) return 'Suspicious';
    if (rep >= -50) return 'Hostile';
    return 'Enemy';
  };

  const getHostilityColor = (hostility: number) => {
    if (hostility <= 20) return '#4caf50'; // Green - Peaceful
    if (hostility <= 40) return '#8bc34a'; // Light Green - Cautious
    if (hostility <= 60) return '#ffc107'; // Yellow - Wary
    if (hostility <= 80) return '#ff9800'; // Orange - Aggressive
    return '#f44336'; // Red - Very Hostile
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        sx={{ 
          mb: 2, 
          cursor: onFactionClick ? 'pointer' : 'default',
          '&:hover': onFactionClick ? { 
            boxShadow: 4,
            transform: 'translateY(-2px)'
          } : {}
        }}
        onClick={() => onFactionClick?.(faction)}
      >
        <CardContent>
          {/* Header */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h4" component="span">
                {faction.emoji}
              </Typography>
              <Typography variant="h6" component="h3">
                {faction.name}
              </Typography>
            </Box>
            <Chip 
              label={`Day ${faction.discovered_day}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>

          {/* Reputation */}
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Reputation
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ color: getReputationColor(reputation), fontWeight: 'bold' }}
              >
                {getReputationLabel(reputation)} ({reputation > 0 ? '+' : ''}{reputation})
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={Math.abs(reputation)} 
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getReputationColor(reputation),
                  borderRadius: 3
                }
              }}
            />
          </Box>

          {/* Hostility Level */}
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Hostility Level
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ color: getHostilityColor(faction.hostility), fontWeight: 'bold' }}
              >
                {faction.hostility}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={faction.hostility} 
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getHostilityColor(faction.hostility),
                  borderRadius: 3
                }
              }}
            />
          </Box>

          {/* Description */}
          <Typography variant="body2" color="text.secondary" mb={2}>
            {faction.description}
          </Typography>

          {/* Ideology */}
          <Box mb={2}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Ideology
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {faction.ideology}
            </Typography>
          </Box>

          {/* Territory */}
          <Box mb={2}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Territory
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {faction.territory}
            </Typography>
          </Box>

          {/* Resources */}
          <Box mb={2}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Resources
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={0.5}>
              {faction.resources.map((resource, index) => (
                <Chip 
                  key={index}
                  label={resource}
                  size="small"
                  variant="outlined"
                  color="secondary"
                />
              ))}
            </Box>
          </Box>

          {/* Members */}
          {factionNPCs.length > 0 && (
            <Box mb={2}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Known Members ({factionNPCs.length})
              </Typography>
              <List dense>
                {factionNPCs.slice(0, 3).map((npc) => (
                  <ListItem key={npc.id} sx={{ py: 0.5 }}>
                    <ListItemText 
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" component="span">
                            {npc.emoji}
                          </Typography>
                          <Typography variant="body2" component="span">
                            {npc.name}
                          </Typography>
                        </Box>
                      }
                      secondary={npc.background}
                    />
                  </ListItem>
                ))}
                {factionNPCs.length > 3 && (
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemText 
                      primary={
                        <Typography variant="body2" color="text.secondary" fontStyle="italic">
                          +{factionNPCs.length - 3} more members...
                        </Typography>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Perks and Weaknesses */}
          <Box display="flex" gap={2}>
            <Box flex={1}>
              <Typography variant="subtitle2" color="success.main" gutterBottom>
                Strengths
              </Typography>
              {faction.perks.map((perk, index) => (
                <Typography key={index} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  • {perk}
                </Typography>
              ))}
            </Box>
            <Box flex={1}>
              <Typography variant="subtitle2" color="error.main" gutterBottom>
                Weaknesses
              </Typography>
              {faction.weaknesses.map((weakness, index) => (
                <Typography key={index} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  • {weakness}
                </Typography>
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
} 