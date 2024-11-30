import { useState } from 'react';
import { 
  Box, 
  Card, 
  TextField, 
  Button, 
  Typography, 
  Link,
  Container,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import config from '../config';
import { Visibility, VisibilityOff } from '@mui/icons-material';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // VULNERABLE: No input validation
    const loginData = {
      username: username,
      password: password
    };

    // VULNERABLE: Logging sensitive data
    console.log('Login attempt:', loginData);
    
    try {
      // VULNERABLE: Sending credentials in URL
      const response = await axios.get(
        `${config.API_URL}/api/auth/login?username=${username}&password=${password}`
      );
      
      // VULNERABLE: Storing sensitive data
      localStorage.setItem('credentials', JSON.stringify(loginData));
      
      login(response.data.token, response.data.user);
      navigate('/');
    } catch (error) {
      // VULNERABLE: Detailed error messages
      console.error('Full error:', error);
      setError(`Login failed: ${error.message} - ${error.response?.data?.stack}`);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4" sx={{ mb: 4 }}>
          Auragram
        </Typography>
        <Card sx={{ p: 4, width: '100%' }}>
          <Box component="form" onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              error={!!error}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!error}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/register" variant="body2">
                Don't have an account? Sign Up
              </Link>
            </Box>
          </Box>
        </Card>
      </Box>
    </Container>
  );
}

export default Login; 