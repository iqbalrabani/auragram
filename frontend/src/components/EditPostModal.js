import { useState, useEffect } from 'react';
import { 
  Modal, 
  Box, 
  TextField, 
  Button, 
  Typography,
  Alert,
  CircularProgress,
  CardMedia 
} from '@mui/material';
import axios from 'axios';
import config from '../config';

function EditPostModal({ open, onClose, post }) {
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (post && open) {
      setCaption(post.caption);
    }
  }, [post, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await axios.put(`${config.API_URL}/api/posts/${post._id}`, {
        caption
      });
      onClose(true);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={() => onClose(false)}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        p: 4,
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Edit Post
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {post?.image && (
          <CardMedia
            component="img"
            image={post.image}
            alt="Post image"
            sx={{ 
              width: '100%', 
              height: 'auto',
              maxHeight: '300px',
              objectFit: 'contain',
              mb: 2,
              borderRadius: 1
            }}
          />
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </form>
      </Box>
    </Modal>
  );
}

export default EditPostModal; 