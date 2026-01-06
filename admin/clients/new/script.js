// Check authentication
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/login.html';
}

document.getElementById('registerClientForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
    errorMessage.textContent = '';
    successMessage.textContent = '';

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Frontend Validation
    if (data.password !== data.confirm_password) {
        errorMessage.textContent = 'Passwords do not match';
        errorMessage.style.display = 'block';
        return;
    }

    if (data.password.length < 8) {
        errorMessage.textContent = 'Password must be at least 8 characters long';
        errorMessage.style.display = 'block';
        return;
    }

    try {
        const response = await fetch('/api/admin/clients', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            successMessage.textContent = result.message || 'Client created successfully!';
            successMessage.style.display = 'block';
            e.target.reset();
        } else {
            errorMessage.textContent = result.message || 'Failed to create client';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Error:', error);
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.style.display = 'block';
    }
});
