import { useState } from 'react';
import { Card, CardHeader, CardMedia, CardContent, Typography, IconButton, Box, Avatar } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import EditPostModal from './EditPostModal';

function Post({ post, onDelete }) {
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditComplete = (success) => {
    setIsEditModalOpen(false);
    if (success) {
      window.location.reload();
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardHeader
        avatar={<Avatar src={post.user.profilePhoto} />}
        action={
          user._id === post.user._id && (
            <Box>
              <IconButton onClick={() => setIsEditModalOpen(true)}>
                <Edit />
              </IconButton>
              <IconButton onClick={() => onDelete(post._id)}>
                <Delete />
              </IconButton>
            </Box>
          )
        }
        title={post.user.displayName}
        subheader={new Date(post.createdAt).toLocaleDateString()}
      />
      <CardMedia
        component="img"
        image={post.image}
        alt={post.caption}
      />
      <CardContent>
        <Typography variant="body1">
          {post.caption}
        </Typography>
      </CardContent>

      <EditPostModal
        open={isEditModalOpen}
        onClose={handleEditComplete}
        post={post}
      />
    </Card>
  );
}

export default Post; 