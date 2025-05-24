import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Divider,
  Alert
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { ExplorationEvent, FactionEvent } from '../hooks/useGameData';

interface EventDialogProps {
  open: boolean;
  event: ExplorationEvent | FactionEvent | null;
  onClose: () => void;
  onChoiceSelected: (choiceId: string, outcome: any) => void;
  gameState?: any; // Current game state for requirement checking
}

export default function EventDialog({
  open,
  event,
  onClose,
  onChoiceSelected,
  gameState
}: EventDialogProps) {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<any | null>(null);
  const [showOutcome, setShowOutcome] = useState(false);

  if (!event) return null;

  const handleChoiceClick = (choice: any) => {
    // Check if player meets requirements
    const meetsRequirements = checkRequirements(choice.requirements, gameState);
    if (!meetsRequirements) {
      return; // Don't allow selection if requirements not met
    }

    setSelectedChoice(choice.id);
    
    // Calculate outcome based on probabilities
    const selectedOutcome = calculateOutcome(choice.outcomes);
    setOutcome(selectedOutcome);
    setShowOutcome(true);
  };

  const handleConfirmChoice = () => {
    if (selectedChoice && outcome) {
      onChoiceSelected(selectedChoice, outcome);
      onClose();
      // Reset state
      setSelectedChoice(null);
      setOutcome(null);
      setShowOutcome(false);
    }
  };

  const handleCancel = () => {
    onClose();
    setSelectedChoice(null);
    setOutcome(null);
    setShowOutcome(false);
  };

  const checkRequirements = (requirements: any, gameState: any): boolean => {
    if (!requirements || !gameState) return true;

    // Check stamina cost
    if (requirements.stamina_cost && gameState.stamina < requirements.stamina_cost) {
      return false;
    }

    // Check required tools
    if (requirements.tools && requirements.tools.length > 0) {
      const hasTools = requirements.tools.some((tool: string) => 
        gameState.inventory?.some((item: any) => 
          item.name.toLowerCase().includes(tool.toLowerCase())
        )
      );
      if (!hasTools) return false;
    }

    // Check required items
    if (requirements.items && requirements.items.length > 0) {
      const hasItems = requirements.items.every((item: string) =>
        gameState.inventory?.some((invItem: any) =>
          invItem.name.toLowerCase().includes(item.toLowerCase())
        )
      );
      if (!hasItems) return false;
    }

    // Check required skills
    if (requirements.skills && requirements.skills.length > 0) {
      const hasSkills = requirements.skills.some((skill: string) =>
        gameState.skills?.includes(skill)
      );
      if (!hasSkills) return false;
    }

    // Check faction relations
    if (requirements.faction_relations) {
      for (const [faction, requiredRep] of Object.entries(requirements.faction_relations)) {
        const currentRep = gameState.factionReputations?.[faction] || 0;
        if (typeof requiredRep === 'string') {
          if (requiredRep === 'positive' && currentRep <= 0) return false;
          if (requiredRep === 'negative' && currentRep >= 0) return false;
        } else if (typeof requiredRep === 'number' && currentRep < requiredRep) {
          return false;
        }
      }
    }

    return true;
  };

  const calculateOutcome = (outcomes: any[]): any => {
    const random = Math.random() * 100;
    let cumulative = 0;

    for (const outcome of outcomes) {
      cumulative += outcome.probability;
      if (random <= cumulative) {
        return outcome;
      }
    }

    return outcomes[outcomes.length - 1]; // Fallback to last outcome
  };

  const getRequirementText = (requirements: any): string[] => {
    const reqTexts: string[] = [];

    if (requirements.stamina_cost) {
      reqTexts.push(`Stamina: ${requirements.stamina_cost}`);
    }

    if (requirements.tools && requirements.tools.length > 0) {
      reqTexts.push(`Tools: ${requirements.tools.join(' or ')}`);
    }

    if (requirements.items && requirements.items.length > 0) {
      reqTexts.push(`Items: ${requirements.items.join(', ')}`);
    }

    if (requirements.skills && requirements.skills.length > 0) {
      reqTexts.push(`Skills: ${requirements.skills.join(' or ')}`);
    }

    return reqTexts;
  };

  const getOutcomeColor = (type: string): string => {
    switch (type) {
      case 'success': return '#4caf50';
      case 'failure': return '#f44336';
      case 'partial_success': return '#ff9800';
      case 'discovery': return '#2196f3';
      case 'danger': return '#d32f2f';
      case 'treasure_trove': return '#ffd700';
      default: return '#757575';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h4" component="span">
            {event.emoji}
          </Typography>
          <Typography variant="h6">
            {event.name}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <AnimatePresence mode="wait">
          {!showOutcome ? (
            <motion.div
              key="choices"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Event Description */}
              <Typography variant="body1" paragraph>
                {event.description}
              </Typography>

              <Divider sx={{ my: 2 }} />

              {/* Choices */}
              <Typography variant="h6" gutterBottom>
                Choose your action:
              </Typography>

              {event.choices.map((choice) => {
                const meetsRequirements = checkRequirements(choice.requirements, gameState);
                const requirements = getRequirementText(choice.requirements);

                return (
                  <Card
                    key={choice.id}
                    sx={{
                      mb: 2,
                      cursor: meetsRequirements ? 'pointer' : 'not-allowed',
                      opacity: meetsRequirements ? 1 : 0.6,
                      border: selectedChoice === choice.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                      '&:hover': meetsRequirements ? {
                        boxShadow: 2,
                        transform: 'translateY(-1px)'
                      } : {}
                    }}
                    onClick={() => meetsRequirements && handleChoiceClick(choice)}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="h6" component="span">
                          {choice.emoji}
                        </Typography>
                        <Typography variant="subtitle1">
                          {choice.text}
                        </Typography>
                      </Box>

                      {requirements.length > 0 && (
                        <Box mb={1}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Requirements:
                          </Typography>
                          <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {requirements.map((req, index) => (
                              <Chip
                                key={index}
                                label={req}
                                size="small"
                                color={meetsRequirements ? "success" : "error"}
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </Box>
                      )}

                      {!meetsRequirements && (
                        <Alert severity="warning" sx={{ mt: 1 }}>
                          You don't meet the requirements for this choice.
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="outcome"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Outcome Display */}
              <Box textAlign="center" mb={3}>
                <Typography variant="h4" component="div" gutterBottom>
                  {outcome.type === 'success' ? '✅' : 
                   outcome.type === 'failure' ? '❌' : 
                   outcome.type === 'discovery' ? '🔍' : 
                   outcome.type === 'danger' ? '⚠️' : '📋'}
                </Typography>
                <Chip
                  label={outcome.type.replace('_', ' ').toUpperCase()}
                  sx={{
                    backgroundColor: getOutcomeColor(outcome.type),
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              </Box>

              <Typography variant="body1" paragraph textAlign="center">
                {outcome.description}
              </Typography>

              {/* Rewards */}
              {outcome.rewards && (
                <Box mb={2}>
                  <Typography variant="h6" color="success.main" gutterBottom>
                    Rewards:
                  </Typography>
                  {outcome.rewards.items && (
                    <Typography variant="body2" gutterBottom>
                      Items: {outcome.rewards.items.join(', ')}
                    </Typography>
                  )}
                  {outcome.rewards.experience && (
                    <Typography variant="body2" gutterBottom>
                      Experience: +{outcome.rewards.experience}
                    </Typography>
                  )}
                  {outcome.rewards.faction_reputation && (
                    <Typography variant="body2" gutterBottom>
                      Faction Relations: {Object.entries(outcome.rewards.faction_reputation)
                        .map(([faction, rep]) => `${faction}: ${(rep as number) > 0 ? '+' : ''}${rep}`)
                        .join(', ')}
                    </Typography>
                  )}
                </Box>
              )}

              {/* Consequences */}
              {outcome.consequences && (
                <Box mb={2}>
                  <Typography variant="h6" color="warning.main" gutterBottom>
                    Consequences:
                  </Typography>
                  {outcome.consequences.health_loss && (
                    <Typography variant="body2" gutterBottom>
                      Health Lost: -{outcome.consequences.health_loss}
                    </Typography>
                  )}
                  {outcome.consequences.stamina_loss && (
                    <Typography variant="body2" gutterBottom>
                      Stamina Lost: -{outcome.consequences.stamina_loss}
                    </Typography>
                  )}
                  {outcome.consequences.zombie_attraction && (
                    <Typography variant="body2" gutterBottom>
                      Zombie Attraction: {outcome.consequences.zombie_attraction}%
                    </Typography>
                  )}
                  {outcome.consequences.trigger_event && (
                    <Typography variant="body2" gutterBottom>
                      Triggers: {outcome.consequences.trigger_event}
                    </Typography>
                  )}
                </Box>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>

      <DialogActions>
        {!showOutcome ? (
          <Button onClick={handleCancel}>
            Cancel
          </Button>
        ) : (
          <>
            <Button onClick={handleCancel}>
              Close
            </Button>
            <Button 
              variant="contained" 
              onClick={handleConfirmChoice}
              color="primary"
            >
              Continue
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
} 