/* Authentication Logic */

async function simulateLogin() {
    try {
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');

        if (!emailInput?.value || !passwordInput?.value) {
            alert('Please enter both email and password.');
            return;
        }

        const formData = new URLSearchParams();
        formData.append('username', emailInput.value);
        formData.append('password', passwordInput.value);

        const response = await fetch("https://carhive.onrender.com/api/v1/auth/login", {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('isLoggedIn', 'true');

            // Fetch user info safely
            try {
                const meRes = await fetch("https://carhive.onrender.com/api/v1/auth/me", {
                    headers: { 'Authorization': 'Bearer ' + data.access_token }
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

            checkAuthState();
            renderDiscoveryCars();

            emailInput.value = '';
            passwordInput.value = '';
            alert('Logged in successfully!');
            closeModal?.();
        } else {
            alert(data.detail || 'Login failed. Please check your credentials.');
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

    if (loginItem) loginItem.style.display = isLoggedIn ? 'none' : 'block';
    if (addCarItem) addCarItem.style.display = isLoggedIn ? 'block' : 'none';
    if (profileDivider) profileDivider.style.display = isLoggedIn ? 'block' : 'none';
    if (profileItem) profileItem.style.display = isLoggedIn ? 'block' : 'none';
}
