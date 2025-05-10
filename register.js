document.getElementById('register-button').addEventListener('click', () => {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;

    if (username && password) {
        // Simulate user registration (you can replace this with a backend API call)
        alert(`User ${username} registered successfully!`);
        window.location.href = 'login.html'; // Redirect to login page
    } else {
        alert('Please fill in both username and password.');
    }
});