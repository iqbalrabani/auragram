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
        if (!response.ok) throw new Error(data.error);

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/';
    } catch (error) {
        alert(error.message);
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
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (token) {
        authButtons.innerHTML = `
            <div class="d-flex align-items-center">
                <img src="${API_URL}/uploads/profiles/${user.profilePhoto}" 
                     class="profile-photo me-2" alt="Profile">
                <span class="text-light me-3">${user.displayName}</span>
                <button class="btn btn-outline-light" onclick="logout()">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>
        `;
    } else {
        authButtons.innerHTML = `
            <button class="btn btn-outline-light me-2" onclick="location.href='/login.html'">Login</button>
            <button class="btn btn-light" onclick="location.href='/register.html'">Register</button>
        `;
    }
} 