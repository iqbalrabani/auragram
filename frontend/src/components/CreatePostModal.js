import { useState } from 'react';
import { Modal, Box, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';
import config from '../config';

function CreatePostModal({ open, onClose }) {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setError('');
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('image', image);
    formData.append('caption', caption);

    try {
      await axios.post(`${config.API_URL}/api/posts`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      onClose();
      window.location.reload();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
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
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Create New Post
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <input
            accept="image/*"
            type="file"
            name="image"
            onChange={handleImageChange}
            style={{ marginBottom: 16 }}
          />
          {preview && (
            <img 
              src={preview} 
              alt="Preview" 
              style={{ width: '100%', marginBottom: 16 }} 
            />
          )}
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            label="Caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button 
            fullWidth 
            variant="contained" 
            type="submit"
            disabled={!image || !caption || isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Post'}
          </Button>
        </form>
      </Box>
    </Modal>
  );
}

export default CreatePostModal; 