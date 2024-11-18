document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();

    // Initialize image preview for post creation
    const postImage = document.getElementById('postImage');
    if (postImage) {
        postImage.addEventListener('change', function() {
            const preview = document.getElementById('imagePreview');
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.innerHTML = `
                        <img src="${e.target.result}" class="img-fluid mt-2" style="max-height: 200px;">
                    `;
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // Handle post creation
    const createPostForm = document.getElementById('createPostForm');
    if (createPostForm) {
        createPostForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData();
            formData.append('image', document.getElementById('postImage').files[0]);
            formData.append('caption', document.getElementById('postCaption').value);
            
            await createPost(formData);
            const modal = bootstrap.Modal.getInstance(document.getElementById('createPostModal'));
            modal.hide();
            createPostForm.reset();
            document.getElementById('imagePreview').innerHTML = '';
        });
    }

    // Load posts if on main page
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        loadPosts();
    }
}); 