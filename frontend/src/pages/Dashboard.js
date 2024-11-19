import { useState, useEffect } from 'react';
import { Box, Card, CardHeader, CardMedia, CardContent, Typography, IconButton, Avatar } from '@mui/material';
import { Delete, ChatBubbleOutline } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function Dashboard() {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/posts/${postId}`);
      setPosts(posts.filter(post => post._id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      {posts.map(post => (
        <Card key={post._id} sx={{ mb: 2 }}>
          <CardHeader
            avatar={
              <Avatar src={`http://localhost:5000${post.user.profilePhoto}`} />
            }
            action={
              post.user._id === user._id && (
                <IconButton onClick={() => handleDelete(post._id)}>
                  <Delete />
                </IconButton>
              )
            }
            title={post.user.displayName}
            subheader={new Date(post.createdAt).toLocaleDateString()}
          />
          <CardMedia
            component="img"
            image={`http://localhost:5000${post.image}`}
            alt={post.caption}
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate(`/posts/${post._id}`)}
          />
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              {post.caption}
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
              <ChatBubbleOutline sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">
                {post.commentCount} comments
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

export default Dashboard; 