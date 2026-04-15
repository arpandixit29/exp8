import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Container,
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  Switch,
  Select,
  MenuItem,
  FormControlLabel,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
} from '@mui/material';
import { ArrowBack, Settings as SettingsIcon } from '@mui/icons-material';
import '../styles/Settings.css';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState({
    language: 'en',
    theme: 'light',
    notifications: true,
    emailUpdates: true,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get('/api/user/settings');
        setSettings(response.data.settings);
      } catch (err) {
        console.error('Failed to load settings:', err);
        setMessage('Failed to load settings');
        setMessageType('error');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSettingChange = (key, value) => {
    setSettings({
      ...settings,
      [key]: value,
    });
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await axios.put('/api/user/settings', settings);
      
      if (response.data.success) {
        setMessage('Settings saved successfully!');
        setMessageType('success');
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      setMessage('Failed to save settings');
      setMessageType('error');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <Box className="loading-page">
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading settings...
        </Typography>
      </Box>
    );
  }

  // Block guest users from accessing settings
  if (user?.role === 'guest') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#fff',
          padding: 3,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            marginBottom: 2,
            color: '#d32f2f',
          }}
        >
          ❌ Access Denied
        </Typography>
        <Typography
          variant="body1"
          sx={{
            marginBottom: 2,
            textAlign: 'center',
            color: '#666',
          }}
        >
          Guest users don't have access to settings.
        </Typography>
        <Typography variant="body2" sx={{ color: '#999', marginBottom: 3 }}>
          Settings management is available for registered users only.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box className="settings-container">
      {/* Header */}
      <AppBar position="static" className="settings-header">
        <Toolbar>
          <Button
            color="inherit"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </Button>
          <SettingsIcon sx={{ mx: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Settings
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="md" sx={{ py: 4 }}>
        {message && (
          <Alert severity={messageType} sx={{ mb: 3 }}>
            {message}
          </Alert>
        )}

        {/* User Profile Card */}
        <Card elevation={3} sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              👤 User Profile
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Name
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {user?.name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Email
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {user?.email}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Role
                </Typography>
                <Box
                  sx={{
                    display: 'inline-block',
                    backgroundColor: user?.role === 'admin' ? '#d32f2f' : user?.role === 'moderator' ? '#f57c00' : '#1976d2',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                  }}
                >
                  {user?.role}
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Preferences Card */}
        <Card elevation={3} sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>
              ⚙️ Preferences
            </Typography>

            {/* Language Setting */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                Language
              </Typography>
              <Select
                value={settings.language}
                onChange={(e) =>
                  handleSettingChange('language', e.target.value)
                }
                fullWidth
                size="small"
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="fr">French</MenuItem>
                <MenuItem value="de">German</MenuItem>
              </Select>
            </Box>

            {/* Theme Setting */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                Theme
              </Typography>
              <Select
                value={settings.theme}
                onChange={(e) =>
                  handleSettingChange('theme', e.target.value)
                }
                fullWidth
                size="small"
              >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
                <MenuItem value="auto">Auto</MenuItem>
              </Select>
            </Box>
          </CardContent>
        </Card>

        {/* Notifications Card */}
        <Card elevation={3} sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>
              🔔 Notifications
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications}
                  onChange={(e) =>
                    handleSettingChange('notifications', e.target.checked)
                  }
                />
              }
              label="Push Notifications"
              sx={{ display: 'block', mb: 2 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailUpdates}
                  onChange={(e) =>
                    handleSettingChange('emailUpdates', e.target.checked)
                  }
                />
              }
              label="Email Updates"
              sx={{ display: 'block' }}
            />
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card elevation={3} sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              🔒 Security
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Two-Factor Authentication: <strong>Disabled</strong>
            </Typography>
            <Button variant="outlined" disabled>
              Enable 2FA
            </Button>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveSettings}
            disabled={saving}
            sx={{ flex: 1 }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={handleLogout}
            sx={{ flex: 1 }}
          >
            Logout
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Settings;
