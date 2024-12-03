import { useState, useEffect } from 'react';
import { Box, Card, CardHeader, CardMedia, CardContent, Typography, IconButton, Avatar } from '@mui/material';
import { Delete, ChatBubbleOutline, Edit } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import config from '../config';
import EditPostModal from '../components/EditPostModal';

function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/posts`);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      // Get the post data first to get the image URL
      const post = posts.find(p => p._id === postId);
      if (!post) return;

      // Delete the post from the backend (which will also delete from Cloud Storage)
      await axios.delete(`${config.API_URL}/api/posts/${postId}`);
      
      // Update local state
      setPosts(posts.filter(post => post._id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const handleEditClick = (post) => {
    setSelectedPost(post);
    setIsEditModalOpen(true);
  };

  const handleEditComplete = (success) => {
    setIsEditModalOpen(false);
    setSelectedPost(null);
    if (success) {
      fetchPosts(); // Refresh posts after edit
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      {posts.map(post => (
        <Card key={post._id} sx={{ mb: 2 }}>
          <CardHeader
            avatar={
              <Avatar src={post.user.profilePhoto} />
            }
            action={
              <Box>
                <IconButton onClick={() => handleEditClick(post)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(post._id)}>
                  <Delete />
                </IconButton>
              </Box>
            }
            title={post.user._id === user._id ? post.user.displayName + " (You)" : post.user.displayName}
            subheader={new Date(post.createdAt).toLocaleDateString()}
          />
          <CardMedia
            component="img"
            image={post.image}
            alt={post.caption}
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate(`/posts/${post._id}`)}
          />
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
              <Typography 
                variant="body1"
                sx={{ 
                  fontSize: '1rem',
                  fontWeight: 500
                }}
              >
                {post.caption}
              </Typography>
            </Box>
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
              <ChatBubbleOutline sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">
                {post.commentCount} comments
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ))}

      <EditPostModal
        open={isEditModalOpen}
        onClose={handleEditComplete}
        post={selectedPost}
      />
    </Box>
  );
}

export default Dashboard; 