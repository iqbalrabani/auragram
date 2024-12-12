import { Box, AppBar, Toolbar, Typography, IconButton, Avatar } from '@mui/material';
import { Home, AddBox, Logout } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CreatePostModal from './CreatePostModal';
import { useState, useEffect } from 'react';

function Layout({ children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed">
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            Auragram
          </Typography>
          <IconButton color="inherit" onClick={() => navigate('/')}>
            <Home />
          </IconButton>
          <IconButton color="inherit" onClick={() => setCreateModalOpen(true)}>
            <AddBox />
          </IconButton>
          <IconButton color="inherit" onClick={logout}>
            <Logout />
          </IconButton>
          <Avatar 
            src={currentUser?.profilePhoto}
            sx={{ width: 32, height: 32, ml: 1, cursor: 'pointer' }}
            onClick={() => navigate(`/profile/${currentUser.username}`)}
          />
        </Toolbar>
      </AppBar>
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          pt: { xs: 8, sm: 9 },
          px: { xs: 2, sm: 4 },
          backgroundColor: '#fafafa'
        }}
      >
        {children}
      </Box>
      <CreatePostModal 
        open={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </Box>
  );
}

export default Layout; 