import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * RoleGuard Component
 * Protects routes based on user role
 * Shows loading spinner while authenticating
 * Redirects to login if not authenticated
 * Redirects to unauthorized page if role not allowed
 */
const RoleGuard = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while verifying authentication
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
        }}
      >
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading...</Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no roles specified, just protect the route (allow any authenticated user)
  if (!allowedRoles || allowedRoles.length === 0) {
    return children;
  }

  // Check if user's role is in allowed roles
  if (!allowedRoles.includes(user?.role)) {
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
          You don't have permission to access this page.
        </Typography>
        <Typography variant="body2" sx={{ color: '#999' }}>
          Required role(s): {allowedRoles.join(', ')}
        </Typography>
        <Typography variant="body2" sx={{ color: '#999' }}>
          Your role: {user?.role}
        </Typography>
      </Box>
    );
  }

  return children;
};

export default RoleGuard;
