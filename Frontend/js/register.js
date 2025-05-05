document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const errorMessage = document.getElementById('errorMessage');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    // Password validation
    function validatePassword(password) {
        const minLength = 6;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return {
            isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
            requirements: {
                minLength: password.length >= minLength,
                hasUpperCase,
                hasLowerCase,
                hasNumbers,
                hasSpecialChar
            }
        };
    }

    // Update password requirements display
    function updatePasswordRequirements(password) {
        const requirements = document.getElementById('passwordRequirements');
        if (requirements) {
            const validation = validatePassword(password);
            let html = '<ul>';
            html += `<li class="${validation.requirements.minLength ? 'valid' : 'invalid'}">At least 6 characters long</li>`;
            html += `<li class="${validation.requirements.hasUpperCase ? 'valid' : 'invalid'}">Contains uppercase letter</li>`;
            html += `<li class="${validation.requirements.hasLowerCase ? 'valid' : 'invalid'}">Contains lowercase letter</li>`;
            html += `<li class="${validation.requirements.hasNumbers ? 'valid' : 'invalid'}">Contains number</li>`;
            html += `<li class="${validation.requirements.hasSpecialChar ? 'valid' : 'invalid'}">Contains special character</li>`;
            html += '</ul>';
            requirements.innerHTML = html;
        }
    }

    if (passwordInput) {
        passwordInput.addEventListener('input', (e) => {
            updatePasswordRequirements(e.target.value);
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            // Frontend validation
            if (username.length < 3) {
                if (errorMessage) {
                    errorMessage.textContent = 'Username must be at least 3 characters long';
                    errorMessage.style.display = 'block';
                }
                return;
            }

            const passwordValidation = validatePassword(password);
            if (!passwordValidation.isValid) {
                if (errorMessage) {
                    errorMessage.textContent = 'Password does not meet requirements';
                    errorMessage.style.display = 'block';
                }
                return;
            }

            if (password !== confirmPassword) {
                if (errorMessage) {
                    errorMessage.textContent = 'Passwords do not match';
                    errorMessage.style.display = 'block';
                }
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                if (errorMessage) {
                    errorMessage.textContent = 'Please enter a valid email address';
                    errorMessage.style.display = 'block';
                }
                return;
            }

            try {
                const response = await fetch('https://bus-scheduler-backend.onrender.com/api/auth/register', {
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
                    window.location.href = './login.html';
                } else {
                    if (errorMessage) {
                        if (data.errors) {
                            const errorMessageText = data.errors.map(error => error.msg).join('\n');
                            errorMessage.textContent = errorMessageText;
                        } else {
                            errorMessage.textContent = data.message || 'Registration failed';
                        }
                        errorMessage.style.display = 'block';
                    } else {
                        alert(data.message || 'Registration failed');
                    }
                }
            } catch (error) {
                console.error('Registration error:', error);
                if (errorMessage) {
                    errorMessage.textContent = 'An error occurred during registration';
                    errorMessage.style.display = 'block';
                } else {
                    alert('An error occurred during registration');
                }
            }
        });
    }
}); 