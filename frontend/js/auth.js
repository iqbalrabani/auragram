const API_URL = 'http://localhost:5000/api';

async function register(formData) {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/';
    } catch (error) {
        alert(error.message);
    }
}

async function login(username, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Login failed. Please check your credentials.');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/';
    } catch (error) {
        alert(error.message);
        console.error('Login error:', error);
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}

function updateAuthUI() {
    const authButtons = document.getElementById('authButtons');
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (token && user) {
        authButtons.innerHTML = `
            <div class="d-flex align-items-center">
                <img src="http://localhost:5000/uploads/profiles/${user.profilePhoto}" 
                     class="profile-photo me-2" alt="Profile">
                <span class="text-light me-3">${user.displayName}</span>
                <button class="btn btn-outline-light" onclick="logout()">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>
        `;
    } else {
        authButtons.innerHTML = `
            <a href="login.html" class="btn btn-outline-light me-2">Login</a>
            <a href="register.html" class="btn btn-light">Register</a>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            await login(username, password);
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData();
            formData.append('username', document.getElementById('username').value);
            formData.append('displayName', document.getElementById('displayName').value);
            formData.append('password', document.getElementById('password').value);
            formData.append('bio', document.getElementById('bio').value);
            
            const profilePhoto = document.getElementById('profilePhoto').files[0];
            if (profilePhoto) {
                formData.append('profilePhoto', profilePhoto);
            }
            
            await register(formData);
        });
    }

    // Profile photo preview for registration
    const profilePhoto = document.getElementById('profilePhoto');
    if (profilePhoto) {
        profilePhoto.addEventListener('change', function() {
            const preview = document.getElementById('profilePreview');
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.innerHTML = `
                        <img src="${e.target.result}" class="img-fluid mt-2" 
                             style="max-height: 200px; border-radius: 50%;">
                    `;
                }
                reader.readAsDataURL(file);
            }
        });
    }
}); 