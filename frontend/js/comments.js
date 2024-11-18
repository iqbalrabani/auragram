async function addComment(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    const content = input.value.trim();
    if (!content) return;

    try {
        const response = await fetch(`${API_URL}/comments/${postId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ content })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        
        input.value = '';
        loadComments(postId);
    } catch (error) {
        alert(error.message);
    }
}

async function loadComments(postId) {
    try {
        const response = await fetch(`${API_URL}/comments/${postId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const comments = await response.json();
        displayComments(postId, comments);
    } catch (error) {
        console.error('Error loading comments:', error);
    }
}

function displayComments(postId, comments) {
    const commentsContainer = document.getElementById(`comments-${postId}`);
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    const html = comments.map(comment => `
        <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
                <strong>${comment.user.displayName}</strong> ${comment.content}
            </div>
            ${comment.user._id === currentUser._id ? `
                <button class="btn btn-outline-danger btn-sm" onclick="deleteComment('${comment._id}')">
                    <i class="fas fa-times"></i>
                </button>
            ` : ''}
        </div>
    `).join('');

    commentsContainer.innerHTML = html;
} 