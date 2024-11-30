import { useState } from 'react';
import { 
  Box, 
  Card,
  TextField, 
  Button, 
  Typography, 
  Link,
  Container,
  Avatar,
  Alert,
  IconButton
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { validatePassword, validateUsername } from '../utils/validation';
import config from '../config';
import { Visibility, VisibilityOff } from '@mui/icons-material';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    password: '',
    confirmPassword: '',
    bio: '',
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [preview, setPreview] = useState('');
  const [formErrors, setFormErrors] = useState({
    username: [],
    password: [],
    displayName: [],
    general: []
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfilePhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const validateForm = () => {
    const errors = {
      username: validateUsername(formData.username),
      password: validatePassword(formData.password),
      confirmPassword: formData.password !== formData.confirmPassword 
        ? ['Passwords do not match'] 
        : [],
      displayName: formData.displayName.length < 2 ? ['Display name must be at least 2 characters long'] : [],
      general: []
    };
    
    setFormErrors(errors);
    
    return !Object.values(errors).some(errorArray => errorArray.length > 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });
    if (profilePhoto) {
      submitData.append('profilePhoto', profilePhoto);
    }

    try {
      const response = await axios.post(`${config.API_URL}/api/auth/register`, submitData);
      login(response.data.token, response.data.user);
      navigate('/');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'An error occurred during registration';
      setFormErrors(prev => ({
        ...prev,
        general: [errorMessage]
      }));
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
          mb: 4
        }}
      >
        <Typography component="h1" variant="h4" sx={{ mb: 4 }}>
          Auragram
        </Typography>
        <Card sx={{ p: 4, width: '100%' }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              <input
                accept="image/*"
                type="file"
                id="profile-photo"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
              <label htmlFor="profile-photo">
                <Avatar
                  src={preview}
                  sx={{ width: 80, height: 80, cursor: 'pointer', mb: 1 }}
                />
              </label>
              <Typography variant="body2" color="textSecondary">
                Click to upload profile photo
              </Typography>
            </Box>
            
            <TextField
              margin="normal"
              required
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              error={!!formErrors.username.length}
              helperText={formErrors.username.join(', ')}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Display Name"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              error={!!formErrors.displayName.length}
              helperText={formErrors.displayName.join(', ')}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password.length}
              helperText={formErrors.password.join(', ')}
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
            <TextField
              margin="normal"
              required
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!formErrors.confirmPassword?.length}
              helperText={formErrors.confirmPassword?.join(', ')}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Bio"
              name="bio"
              multiline
              rows={3}
              value={formData.bio}
              onChange={handleChange}
            />
            {formErrors.general.map((error, index) => (
              <Alert key={index} severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            ))}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                Already have an account? Sign In
              </Link>
            </Box>
          </Box>
        </Card>
      </Box>
    </Container>
  );
}

export default Register; 