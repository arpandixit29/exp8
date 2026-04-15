import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import '../styles/LoginForm.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-input': {
            color: '#1a1a1a',
            backgroundColor: '#ffffff',
          },
          '& .MuiOutlinedInput-input::placeholder': {
            color: '#999',
            opacity: 1,
          },
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#ffffff',
          },
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-input': {
            color: '#1a1a1a',
          },
        },
      },
    },
  },
});

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [feedbackType, setFeedbackType] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const { login, register, loading } = useAuth();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      name: isSignUp ? '' : undefined,
    },
    mode: 'onBlur',
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const onSubmit = async (data) => {
    setFeedbackMessage(null);

    try {
      let result;
      if (isSignUp) {
        result = await register(data.email, data.password, data.name);
      } else {
        result = await login(data.email, data.password);
      }

      if (result.success) {
        setFeedbackType('success');
        setFeedbackMessage(
          isSignUp
            ? '✓ Registration successful! Redirecting...'
            : '✓ Login successful! Redirecting...'
        );
        reset();
        
        // Redirect to dashboard after 1.5 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setFeedbackType('error');
        setFeedbackMessage(`✗ ${result.message}`);
      }
    } catch (err) {
      setFeedbackType('error');
      setFeedbackMessage('✗ An error occurred. Please try again.');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm">
        <Box className="login-container">
          <Card elevation={6} className="login-card">
            <CardContent>
              {/* Header */}
              <Box className="header">
                <Typography variant="h4" component="h1" className="title">
                  {isSignUp ? 'Create Account' : 'Secure Login'}
                </Typography>
                <Typography variant="body2" className="subtitle">
                  {isSignUp
                    ? 'Join us to get started'
                    : 'Enter your credentials to continue'}
                </Typography>
              </Box>

              {/* Feedback Messages */}
              {feedbackMessage && (
                <Alert
                  severity={feedbackType}
                  icon={
                    feedbackType === 'success' ? (
                      <CheckCircle />
                    ) : (
                      <ErrorIcon />
                    )
                  }
                  className="feedback-alert"
                >
                  {feedbackMessage}
                </Alert>
              )}

              {/* Demo Info */}
              {!isSignUp && (
                <Alert severity="info" className="demo-info">
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Demo Credentials (RBAC Roles):
                  </Typography>
                  <Box sx={{ fontSize: '0.85rem' }}>
                    <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                      <strong style={{ color: '#d32f2f' }}>👑 Admin:</strong> admin@example.com / admin123
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                      <strong style={{ color: '#f57c00' }}>🔨 Moderator:</strong> moderator@example.com / mod123
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                      <strong style={{ color: '#1976d2' }}>👤 User:</strong> demo@example.com / password123
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block' }}>
                      <strong style={{ color: '#757575' }}>👻 Guest:</strong> guest@example.com / guest123
                    </Typography>
                  </Box>
                </Alert>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="form">
                {/* Name Field (Sign Up Only) */}
                {isSignUp && (
                  <Box className="form-field">
                    <Controller
                      name="name"
                      control={control}
                      rules={{
                        required: 'Name is required',
                        minLength: {
                          value: 2,
                          message: 'Name must be at least 2 characters',
                        },
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Full Name"
                          fullWidth
                          variant="outlined"
                          error={!!errors.name}
                          helperText={errors.name?.message}
                          disabled={loading}
                          placeholder="John Doe"
                          autoComplete="name"
                        />
                      )}
                    />
                  </Box>
                )}

                {/* Email Field */}
                <Box className="form-field">
                  <Controller
                    name="email"
                    control={control}
                    rules={{
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Invalid email format',
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Email Address"
                        type="email"
                        fullWidth
                        variant="outlined"
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        disabled={loading}
                        placeholder="example@gmail.com"
                        autoComplete="email"
                      />
                    )}
                  />
                </Box>

                {/* Password Field */}
                <Box className="form-field">
                  <Controller
                    name="password"
                    control={control}
                    rules={{
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        fullWidth
                        variant="outlined"
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        disabled={loading}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                edge="end"
                                disabled={loading}
                                aria-label="toggle password visibility"
                              >
                                {showPassword ? (
                                  <VisibilityOff />
                                ) : (
                                  <Visibility />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Box>

                {/* Submit Button */}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  className="submit-button"
                >
                  {loading ? (
                    <Box className="loading-container">
                      <CircularProgress size={24} color="inherit" />
                      <span className="loading-text">
                        {isSignUp ? 'Registering...' : 'Authenticating...'}
                      </span>
                    </Box>
                  ) : isSignUp ? (
                    'Sign Up'
                  ) : (
                    'Login'
                  )}
                </Button>
              </form>

              {/* Toggle Sign Up / Login */}
              <Box className="footer">
                <Typography variant="caption" className="footer-text">
                  {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                  <button
                    className="toggle-button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      reset();
                      setFeedbackMessage(null);
                    }}
                  >
                    {isSignUp ? 'Sign in here' : 'Sign up here'}
                  </button>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default LoginForm;
