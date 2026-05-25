(function() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const path = window.location.pathname;

    if (!token && path !== '/login.html') {
        window.location.href = '/login.html';
        return;
    }

    // Export common auth functions
    window.auth = {
        getToken: () => localStorage.getItem('token'),
        getUser: () => JSON.parse(localStorage.getItem('user') || '{}'),
        isAdmin: () => {
            const u = JSON.parse(localStorage.getItem('user') || '{}');
            return u.role === 'ADMIN';
        },
        logout: () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login.html';
        },
        // Helper for fetch calls
        fetch: async (url, options = {}) => {
            const token = localStorage.getItem('token');
            const headers = {
                ...options.headers,
                'Authorization': `Bearer ${token}`
            };

            const response = await fetch(url, { ...options, headers });
            
            if (response.status === 401) {
                window.auth.logout();
                throw new Error('Unauthorized');
            }
            
            return response;
        }
    };

    // Update UI based on role and auth status
    document.addEventListener('DOMContentLoaded', () => {
        // Add logout button listener if it exists
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.auth.logout();
            });
        }

        // Show/hide admin elements
        if (!window.auth.isAdmin()) {
            const adminElements = document.querySelectorAll('.admin-only');
            adminElements.forEach(el => el.style.display = 'none');
        }

        // Update user profile info
        const userNameEl = document.getElementById('user-full-name');
        const userRoleEl = document.getElementById('user-role');
        const userAvatarEl = document.getElementById('user-avatar');

        const name = user.fullName || user.full_name;

        if (userNameEl && name) {
            userNameEl.textContent = name;
        }

        if (userRoleEl && user.role) {
            userRoleEl.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase();
        }

        if (userAvatarEl && name) {
            userAvatarEl.textContent = name.charAt(0).toUpperCase();
        }
    });
})();
