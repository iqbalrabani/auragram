async function createPost(formData) {
    try {
        const response = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        
        loadPosts();
        return data;
    } catch (error) {
        alert(error.message);
    }
}

async function loadPosts() {
    try {
        const response = await fetch(`${API_URL}/posts`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const posts = await response.json();
        displayPosts(posts);
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

function displayPosts(posts) {
    const mainContent = document.getElementById('mainContent');
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    let html = `
        <div class="row mb-4">
            <div class="col">
                <button class="btn btn-primary w-100" data-bs-toggle="modal" data-bs-target="#createPostModal">
                    <i class="fas fa-plus-circle"></i> Create New Post
                </button>
            </div>
        </div>
    `;

    posts.forEach(post => {
        html += `
            <div class="card mb-4 shadow-sm hover-effect">
                <div class="card-header bg-white d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <img src="${API_URL}/uploads/profiles/${post.user.profilePhoto}" 
                             class="profile-photo me-2" alt="Profile">
                        <h6 class="mb-0">${post.user.displayName}</h6>
                    </div>
                    ${post.user._id === currentUser._id ? `
                        <button class="btn btn-outline-danger btn-sm" onclick="deletePost('${post._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
                <img src="${API_URL}/uploads/posts/${post.image}" class="post-image" alt="Post">
                <div class="card-body">
                    <p class="card-text">
                        <strong>${post.user.displayName}</strong> ${post.caption}
                    </p>
                    <div class="comment-section" id="comments-${post._id}">
                        <!-- Comments will be loaded here -->
                    </div>
                    <form onsubmit="event.preventDefault(); addComment('${post._id}')">
                        <div class="input-group">
                            <input type="text" class="form-control" id="comment-input-${post._id}" 
                                   placeholder="Add a comment...">
                            <button class="btn btn-primary">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    });

    mainContent.innerHTML = html;
    posts.forEach(post => loadComments(post._id));
}

async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
        const response = await fetch(`${API_URL}/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error);
        }
        
        loadPosts(); // Refresh the posts list
    } catch (error) {
        alert(error.message);
    }
} 