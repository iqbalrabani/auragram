import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  Card, 
  CardHeader, 
  CardMedia, 
  CardContent, 
  Typography, 
  Avatar, 
  TextField, 
  Button,
  IconButton,
  Divider
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/posts/${id}`);
      setPost(response.data);
    } catch (error) {
      console.error('Error fetching post:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/comments/${id}`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://localhost:5000/api/comments/${id}`, {
        content: newComment
      });
      setComments([response.data, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/comments/${commentId}`);
      setComments(comments.filter(comment => comment._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  if (!post) return null;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      <Card>
        <Box sx={{ 
          display: { sm: 'flex' },
          height: { sm: '90vh' },
          maxHeight: { sm: 800 }
        }}>
          <Box sx={{ 
            width: { sm: '65%' },
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'transparent',
            position: 'relative',
            p: 2
          }}>
            <CardMedia
              component="img"
              image={`http://localhost:5000${post.image}`}
              alt={post.caption}
              sx={{ 
                width: '100%',
                height: 'auto',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
            />
          </Box>
          <Box sx={{ 
            width: { sm: '35%' },
            display: 'flex', 
            flexDirection: 'column',
            maxHeight: { sm: '100%' },
            borderLeft: '1px solid',
            borderColor: 'divider'
          }}>
            <CardHeader
              avatar={
                <Avatar src={`http://localhost:5000${post.user.profilePhoto}`} />
              }
              title={post.user.displayName}
              subheader={new Date(post.createdAt).toLocaleDateString()}
              sx={{ px: 3, py: 2 }}
            />
            <Divider />
            <CardContent sx={{ px: 3, py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography 
                    variant="body1"
                    sx={{ 
                      fontSize: '1rem',
                      fontWeight: 500,
                      color: 'text.primary'
                    }}
                  >
                    {post.caption}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
            <Divider />
            <Box sx={{ 
              px: 3,
              py: 2,
              flexGrow: 1, 
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Typography 
                variant="subtitle2" 
                sx={{ mb: 2, color: 'text.secondary' }}
              >
                Comments
              </Typography>
              {comments.map(comment => (
                <Box key={comment._id} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Avatar
                      src={`http://localhost:5000${comment.user.profilePhoto}`}
                      sx={{ width: 32, height: 32, mr: 1 }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ fontSize: '0.875rem' }}
                      >
                        {comment.user.displayName}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontSize: '0.875rem' }}
                      >
                        {comment.content}
                      </Typography>
                    </Box>
                    {comment.user._id === user._id && (
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteComment(comment._id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
            <Divider />
            <Box sx={{ p: 3 }}>
              <form onSubmit={handleAddComment}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  sx={{ mb: 1 }}
                />
                <Button 
                  fullWidth 
                  variant="contained" 
                  type="submit"
                  disabled={!newComment.trim()}
                >
                  Post
                </Button>
              </form>
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}

export default PostDetail;