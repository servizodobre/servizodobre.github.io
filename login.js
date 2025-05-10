document.getElementById('login-button').addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username && password) {
        // Redirect to the profile page
        window.location.href = 'profile.html';
    } else {
        alert('Please enter both username and password.');
    }
});