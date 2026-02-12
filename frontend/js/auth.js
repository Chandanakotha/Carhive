/* auth.js - Authentication Logic */

async function loginUser() {
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');

    if (!emailInput.value || !passwordInput.value) {
        alert('Please enter both email and password.');
        return;
    }

    const formData = new URLSearchParams();
    formData.append('username', emailInput.value);
    formData.append('password', passwordInput.value);

    try {
        const response = await fetch("https://carhive.onrender.com/api/v1/auth/login", {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            const token = data.access_token;
            localStorage.setItem('token', token);
            localStorage.setItem('isLoggedIn', 'true');

            // Fetch user profile
            try {
                const meRes = await fetch("https://carhive.onrender.com/api/v1/auth/me", {
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                if (meRes.ok) {
                    const meData = await meRes.json();
                    localStorage.setItem('turo_user', JSON.stringify({
                        name: meData.full_name,
                        email: meData.email,
                        phone: meData.phone || "",
                        place: meData.location || ""
                    }));
                }
            } catch (e) {
                console.error("Could not fetch user profile", e);
            }

            if (typeof checkAuthState === 'function') checkAuthState();
            if (typeof renderDiscoveryCars === 'function') renderDiscoveryCars();

            emailInput.value = '';
            passwordInput.value = '';

            alert('Logged in successfully!');
            if (typeof closeModal === 'function') closeModal();
        } else {
            alert(data.detail || 'Login failed. Check your credentials.');
        }
    } catch (err) {
        console.error("Login error:", err);
        alert('Connection error. Is the backend running at https://carhive.onrender.com/api/v1?');
    }
}

function checkAuthState() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    const loginItem = document.getElementById('login-item');
    const addCarItem = document.getElementById('add-car-item');
    const profileDivider = document.getElementById('profile-divider');
    const profileItem = document.getElementById('profile-item');

    if (isLoggedIn) {
        if (loginItem) loginItem.style.display = 'none';
        if (addCarItem) addCarItem.style.display = 'block';
        if (profileDivider) profileDivider.style.display = 'block';
        if (profileItem) profileItem.style.display = 'block';
    } else {
        if (loginItem) loginItem.style.display = 'block';
        if (addCarItem) addCarItem.style.display = 'none';
        if (profileDivider) profileDivider.style.display = 'none';
        if (profileItem) profileItem.style.display = 'none';
    }
}
