import { useState } from 'react';
import { Modal, Box, TextField, Button, Typography } from '@mui/material';
import axios from 'axios';

function CreatePostModal({ open, onClose }) {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [preview, setPreview] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('image', image);
    formData.append('caption', caption);

    try {
      await axios.post('http://localhost:5000/api/posts', formData);
      onClose();
      window.location.reload(); // Refresh to see new post
    } catch (error) {
      console.error('Error creating post:', error);
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
        <form onSubmit={handleSubmit}>
          <input
            accept="image/*"
            type="file"
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
            disabled={!image || !caption}
          >
            Post
          </Button>
        </form>
      </Box>
    </Modal>
  );
}

export default CreatePostModal; 