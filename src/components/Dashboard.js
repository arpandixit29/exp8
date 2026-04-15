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
  Grid,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import { Logout as LogOut, Settings, Home } from '@mui/icons-material';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/api/user/dashboard');
        setDashboardData(response.data.data);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavigateSettings = () => {
    handleMenuClose();
    navigate('/settings');
  };

  if (loading) {
    return (
      <Box className="loading-page">
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="dashboard-container">
      {/* Header */}
      <AppBar position="static" className="dashboard-header">
        <Toolbar>
          <Home sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: '#667eea',
                cursor: 'pointer',
              }}
              onClick={handleMenuOpen}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem disabled>
                <Typography variant="body2">
                  {user?.email}
                </Typography>
              </MenuItem>
              <MenuItem disabled>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    textTransform: 'capitalize',
                    color: '#667eea',
                    fontWeight: 'bold'
                  }}
                >
                  Role: {user?.role}
                </Typography>
              </MenuItem>
              {user?.role === 'admin' && (
                <MenuItem onClick={() => { navigate('/admin'); handleMenuClose(); }}>
                  <Typography sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                    👑 Admin Panel
                  </Typography>
                </MenuItem>
              )}
              <MenuItem onClick={handleNavigateSettings}>
                <Settings sx={{ mr: 1 }} />
                Settings
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogOut sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* ADMIN DASHBOARD */}
        {user?.role === 'admin' && (
          <>
            {/* Welcome Card */}
            <Card elevation={3} className="welcome-card" sx={{ mb: 4, background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h5" sx={{ mb: 1, color: 'white' }}>
                      Welcome back, <strong>{user?.name}</strong>! 👑
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      {user?.email}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1, fontWeight: 'bold' }}>
                      System Administrator - Full Access Granted
                    </Typography>
                  </Box>
                  <Box sx={{ background: 'rgba(255,255,255,0.3)', color: 'white', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '12px' }}>
                    👑 Admin
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Admin Stats */}
            {dashboardData && (
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <CardContent>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Users</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                        {dashboardData.permissions?.length || 5}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                    <CardContent>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>Active Sessions</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>3</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                    <CardContent>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>System Health</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>100%</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
                    <CardContent>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>API Uptime</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>99.9%</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Admin Actions */}
            <Card elevation={2} sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  🔧 Admin Actions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button fullWidth variant="contained" sx={{ background: '#d32f2f' }} onClick={() => navigate('/admin')}>
                      👑 Admin Panel
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button fullWidth variant="contained" sx={{ background: '#667eea' }}>
                      📊 View Analytics
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button fullWidth variant="contained" sx={{ background: '#f57c00' }}>
                      ⚙️ System Settings
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button fullWidth variant="contained" sx={{ background: '#1976d2' }}>
                      📋 Audit Logs
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </>
        )}

        {/* MODERATOR DASHBOARD */}
        {user?.role === 'moderator' && (
          <>
            {/* Welcome Card */}
            <Card elevation={3} className="welcome-card" sx={{ mb: 4, background: 'linear-gradient(135deg, #f57c00 0%, #e64a19 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h5" sx={{ mb: 1, color: 'white' }}>
                      Welcome back, <strong>{user?.name}</strong>! 🔨
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      {user?.email}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1, fontWeight: 'bold' }}>
                      Content Moderator - Limited Admin Access
                    </Typography>
                  </Box>
                  <Box sx={{ background: 'rgba(255,255,255,0.3)', color: 'white', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '12px' }}>
                    🔨 Moderator
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Moderator Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Users to Review</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>5</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Content Analytics</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>Active</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Moderator Actions */}
            <Card elevation={2} sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  🔧 Available Actions
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  ⚠️ Admin Panel access is restricted for your role
                </Typography>
                <Button fullWidth variant="contained" sx={{ background: '#667eea' }} onClick={() => navigate('/settings')}>
                  📊 View Analytics & Settings
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {/* REGULAR USER DASHBOARD */}
        {user?.role === 'user' && (
          <>
            {/* Welcome Card */}
            <Card elevation={3} className="welcome-card" sx={{ mb: 4, background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h5" sx={{ mb: 1, color: 'white' }}>
                      Welcome back, <strong>{user?.name}</strong>! 👤
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      {user?.email}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1, fontWeight: 'bold' }}>
                      Standard User - Personal Access Only
                    </Typography>
                  </Box>
                  <Box sx={{ background: 'rgba(255,255,255,0.3)', color: 'white', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '12px' }}>
                    👤 User
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* User Info */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Account Status
                    </Typography>
                    <Typography variant="h6">Active ✅</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Member Since
                    </Typography>
                    <Typography variant="h6">Jan 15, 2024</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Last Login
                    </Typography>
                    <Typography variant="h6">Today</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* User Actions */}
            <Card elevation={2} sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  ⚙️ Available Actions
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  ℹ️ You don't have admin privileges. Only personal features are available.
                </Alert>
                <Button fullWidth variant="contained" sx={{ background: '#1976d2' }} onClick={() => navigate('/settings')}>
                  ⚙️ Manage Settings
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {/* GUEST DASHBOARD */}
        {user?.role === 'guest' && (
          <>
            {/* Welcome Card */}
            <Card elevation={3} className="welcome-card" sx={{ mb: 4, background: 'linear-gradient(135deg, #757575 0%, #424242 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h5" sx={{ mb: 1, color: 'white' }}>
                      Welcome, <strong>{user?.name}</strong>! 👻
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      {user?.email}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1, fontWeight: 'bold' }}>
                      Guest User - Read-Only Access
                    </Typography>
                  </Box>
                  <Box sx={{ background: 'rgba(255,255,255,0.3)', color: 'white', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '12px' }}>
                    👻 Guest
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Guest Limited Access Info */}
            <Card elevation={2}>
              <CardContent>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  ⚠️ Limited Access: Your account has read-only access to the platform.
                </Alert>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  📋 Available Features
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  ✅ View Dashboard (Read-Only)
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, color: 'textSecondary' }}>
                  ❌ Settings<br/>
                  ❌ User Management<br/>
                  ❌ Admin Features<br/>
                  ❌ Content Modification
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  If you need additional access, please contact your administrator.
                </Typography>
              </CardContent>
            </Card>
          </>
        )}
      </Container>
    </Box>
  );
};

export default Dashboard;
