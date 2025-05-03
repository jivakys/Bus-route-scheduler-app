document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
        try {
            // Decode the token to get user info
            const payload = JSON.parse(atob(token.split('.')[1]));
            const username = payload.username;
            const role = payload.role;
            
            // Show user profile and hide login buttons
            const userProfile = document.getElementById('userProfile');
            const loginButtons = document.getElementById('loginButtons');
            const userName = document.getElementById('userName');
            
            if (userProfile && loginButtons && userName) {
                userProfile.style.display = 'flex';
                loginButtons.style.display = 'none';
                userName.textContent = username;
            }

            // If user is admin, redirect to admin panel
            if (role === 'admin' && !window.location.pathname.includes('admin')) {
                window.location.href = '/html/admin.html';
            }
        } catch (error) {
            console.error('Error decoding token:', error);
            localStorage.removeItem('token');
        }
    }

    // Handle logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = '/';
        });
    }

    // Handle login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('http://localhost:3000/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    // Check if user is admin
                    const payload = JSON.parse(atob(data.token.split('.')[1]));
                    if (payload.role === 'admin') {
                        window.location.href = '/html/admin.html';
                    } else {
                        window.location.href = '/';
                    }
                } else {
                    alert(data.message || 'Login failed');
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('An error occurred during login');
            }
        });
    }

    // Handle register form submission
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // Frontend validation
            if (username.length < 3) {
                alert('Username must be at least 3 characters long');
                return;
            }

            if (password.length < 6) {
                alert('Password must be at least 6 characters long');
                return;
            }

            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username,
                        email,
                        password,
                        role: 'operator'
                    })
                });

                const data = await response.json();
                if (response.ok) {
                    alert('Registration successful! Please login.');
                    window.location.href = 'login.html';
                } else {
                    // Display validation errors from the server
                    if (data.errors) {
                        const errorMessage = data.errors.map(error => error.msg).join('\n');
                        alert(errorMessage);
                    } else {
                        alert(data.message || 'Registration failed');
                    }
                }
            } catch (error) {
                console.error('Registration error:', error);
                alert('An error occurred during registration');
            }
        });
    }
}); 