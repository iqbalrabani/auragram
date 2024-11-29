import { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Avatar, 
  Typography, 
  Button, 
  TextField,
  Modal,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import config from '../config';
import ChangePasswordModal from '../components/ChangePasswordModal';

function Profile() {
  const { username } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    displayName: '',
    bio: '',
    profilePhoto: null,
    imagePreview: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [deletePhoto, setDeletePhoto] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isChangePasswordOpen, setChangePasswordOpen] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/users/${username}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Profile data:', response.data);
      setUser(response.data);
      setEditForm({
        username: response.data.username,
        displayName: response.data.displayName,
        bio: response.data.bio || '',
        profilePhoto: null,
        imagePreview: response.data.profilePhoto
      });
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError('Failed to load profile');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append('username', editForm.username);
    formDataToSend.append('displayName', editForm.displayName);
    formDataToSend.append('bio', editForm.bio);
    formDataToSend.append('deletePhoto', deletePhoto);
    
    if (editForm.profilePhoto) {
      formDataToSend.append('image', editForm.profilePhoto);
    }

    try {
      const response = await axios.put(
        `${config.API_URL}/api/users/update`, 
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setUser(response.data);
      updateUser(response.data);
      setIsEditing(false);
      setDeletePhoto(false);
      
      if (response.data.username !== username) {
        window.location.href = `/profile/${response.data.username}`;
      } else {
        await fetchUserProfile();
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Container>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography>{error || 'Loading profile...'}</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              src={user.profilePhoto}
              sx={{ width: 150, height: 150, mb: 2 }}
            />
            <Typography variant="h4" gutterBottom>
              {user.displayName}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              @{user.username}
            </Typography>
            <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
              {user.bio || "No bio yet"}
            </Typography>
            
            {currentUser && currentUser.username === username && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant="contained" 
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
                <Button 
                  variant="outlined"
                  onClick={() => setChangePasswordOpen(true)}
                >
                  Change Password
                </Button>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      <Modal
        open={isEditing}
        onClose={() => setIsEditing(false)}
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          width: 400,
          maxWidth: '90%',
        }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleEditSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar
                src={editForm.imagePreview}
                sx={{ width: 100, height: 100, mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <input
                  type="file"
                  accept="image/*"
                  id="profile-photo-upload"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setEditForm(prev => ({
                        ...prev,
                        profilePhoto: file,
                        imagePreview: URL.createObjectURL(file)
                      }));
                    }
                  }}
                />
                <label htmlFor="profile-photo-upload">
                  <Button variant="contained" component="span" size="small">
                    Upload New Photo
                  </Button>
                </label>
                {editForm.imagePreview && (
                  <Button 
                    variant="outlined" 
                    color="error" 
                    size="small"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    Remove Photo
                  </Button>
                )}
              </Box>
            </Box>
            <TextField
              fullWidth
              label="Username"
              value={editForm.username}
              onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Display Name"
              value={editForm.displayName}
              onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Bio"
              multiline
              rows={3}
              value={editForm.bio}
              onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <Button
              fullWidth
              variant="contained"
              type="submit"
              color="primary"
              disabled={isLoading}
              sx={{ mt: 2 }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </form>
        </Box>
      </Modal>

      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>Remove Profile Photo?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove your profile photo? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            color="error"
            onClick={() => {
              setEditForm(prev => ({
                ...prev,
                profilePhoto: null,
                imagePreview: null
              }));
              setDeletePhoto(true);
              setIsDeleteDialogOpen(false);
            }}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      <ChangePasswordModal
        open={isChangePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </Container>
  );
}

export default Profile; 