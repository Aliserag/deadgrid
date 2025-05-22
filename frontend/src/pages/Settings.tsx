import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Slider,
  Switch,
  FormControlLabel,
  IconButton,
  Container,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { motion } from 'framer-motion';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = React.useState({
    musicVolume: 70,
    sfxVolume: 80,
    difficulty: 50,
    autoSave: true,
    showTutorial: true,
    darkMode: true,
  });

  const handleChange = (setting: string) => (event: any) => {
    setSettings({
      ...settings,
      [setting]: event.target.type === 'checkbox' ? event.target.checked : event.target.value,
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(45deg, #1a1a1a 0%, #2d1a1a 100%)',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton
            onClick={() => navigate('/')}
            sx={{ color: '#ff4d4d', mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ color: '#ff4d4d' }}>
            Settings
          </Typography>
        </Box>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            sx={{
              p: 3,
              background: 'rgba(30, 30, 30, 0.9)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ color: '#ff4d4d', mb: 2 }}>
                Audio
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: '#fff', mb: 1 }}>
                  Music Volume
                </Typography>
                <Slider
                  value={settings.musicVolume}
                  onChange={handleChange('musicVolume')}
                  aria-labelledby="music-volume-slider"
                  sx={{ color: '#ff4d4d' }}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: '#fff', mb: 1 }}>
                  SFX Volume
                </Typography>
                <Slider
                  value={settings.sfxVolume}
                  onChange={handleChange('sfxVolume')}
                  aria-labelledby="sfx-volume-slider"
                  sx={{ color: '#ff4d4d' }}
                />
              </Box>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ color: '#ff4d4d', mb: 2 }}>
                Gameplay
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: '#fff', mb: 1 }}>
                  Difficulty
                </Typography>
                <Slider
                  value={settings.difficulty}
                  onChange={handleChange('difficulty')}
                  aria-labelledby="difficulty-slider"
                  sx={{ color: '#ff4d4d' }}
                />
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoSave}
                    onChange={handleChange('autoSave')}
                    color="primary"
                  />
                }
                label="Auto Save"
                sx={{ color: '#fff' }}
              />
            </Box>

            <Box>
              <Typography variant="h6" sx={{ color: '#ff4d4d', mb: 2 }}>
                Interface
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.showTutorial}
                    onChange={handleChange('showTutorial')}
                    color="primary"
                  />
                }
                label="Show Tutorial"
                sx={{ color: '#fff', mb: 1 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.darkMode}
                    onChange={handleChange('darkMode')}
                    color="primary"
                  />
                }
                label="Dark Mode"
                sx={{ color: '#fff' }}
              />
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Settings; 