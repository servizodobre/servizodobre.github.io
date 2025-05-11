document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    const category = localStorage.getItem('category');
    const welcomeMessage = document.getElementById('welcome-message');

    if (username && category) {
        if (category === 'admin') {
            welcomeMessage.textContent = `Welcome, Admin ${username}!`;
        } else {
            welcomeMessage.textContent = `Welcome, ${username}!`;
        }
    } else {
        // Redirect to login page if no user is logged in
        window.location.href = 'login.html';
    }
});