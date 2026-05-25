document.addEventListener('DOMContentLoaded', () => {
    if (!window.auth.isAdmin()) {
        window.location.href = '/';
        return;
    }

    loadUsers();

    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', handleUserSubmit);
    }
});

function showMessage(msg, isError = false) {
    const container = document.getElementById('messageContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="message ${isError ? 'error' : 'success'}">
            <span>${isError ? '<i class="fa-solid fa-circle-xmark"></i>' : '<i class="fa-solid fa-circle-check"></i>'}</span>

            ${msg}
        </div>
    `;

    // Auto clear after 5 seconds
    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}

async function loadUsers() {
    try {
        const response = await window.auth.fetch('/api/users');
        const data = await response.json();

        if (data.success) {
            renderUsers(data.data);
        } else {
            showMessage(data.message || 'Error loading users', true);
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showMessage('Failed to connect to server', true);
    }
}

function renderUsers(users) {
    const list = document.getElementById('usersList');
    if (!list) return;

    list.innerHTML = users.map(user => `
        <tr>
            <td data-label="Username">
                <div style="font-weight: 600; color: var(--text-main);">${user.username}</div>
            </td>
            <td data-label="Full Name">${user.full_name || '-'}</td>
            <td data-label="Role"><span class="role-badge role-${user.role.toLowerCase()}">${user.role}</span></td>
            <td data-label="Actions" class="actions">
                <button class="btn btn-secondary" onclick='editUser(${JSON.stringify(user).replace(/'/g, "&apos;")})'>Edit</button>
                <button class="btn btn-danger" onclick="deleteUser(${user.id})" ${user.username === 'admin' ? 'disabled' : ''}>Delete</button>
            </td>
        </tr>
    `).join('');
}

function showAddUserModal() {
    const form = document.getElementById('userForm');
    form.reset();
    document.getElementById('modalTitle').textContent = 'Add New User';
    document.getElementById('userId').value = '';
    document.getElementById('pwdLabel').style.display = 'none';
    document.getElementById('password').required = true;
    document.getElementById('password').placeholder = 'Enter password';
    document.getElementById('userModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('userModal').style.display = 'none';
}

function editUser(user) {
    document.getElementById('modalTitle').textContent = 'Edit User';
    document.getElementById('userId').value = user.id;
    document.getElementById('username').value = user.username;
    document.getElementById('fullName').value = user.full_name || '';
    document.getElementById('role').value = user.role;
    document.getElementById('pwdLabel').style.display = 'inline';
    document.getElementById('password').required = false;
    document.getElementById('password').value = '';
    document.getElementById('password').placeholder = 'Leave blank to keep same';
    document.getElementById('userModal').style.display = 'flex';
}

async function handleUserSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('userId').value;
    const userData = {
        username: document.getElementById('username').value,
        fullName: document.getElementById('fullName').value,
        role: document.getElementById('role').value,
        password: document.getElementById('password').value
    };

    // If editing and password is empty, don't send it
    if (id && !userData.password) {
        delete userData.password;
    }

    try {
        const url = id ? `/api/users/${id}` : '/api/users';
        const method = id ? 'PUT' : 'POST';

        const response = await window.auth.fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        if (data.success) {
            closeModal();
            loadUsers();
            showMessage(id ? 'User updated successfully' : 'User created successfully');
        } else {
            showMessage(data.message || 'Error saving user', true);
        }
    } catch (error) {
        console.error('Error saving user:', error);
        showMessage('Failed to save user', true);
    }
}

window.deleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
        const response = await window.auth.fetch(`/api/users/${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.success) {
            loadUsers();
            showMessage('User deleted successfully');
        } else {
            showMessage(data.message || 'Error deleting user', true);
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showMessage('Failed to delete user', true);
    }
};

// Global exports
window.showAddUserModal = showAddUserModal;
window.closeModal = closeModal;
window.editUser = editUser;

