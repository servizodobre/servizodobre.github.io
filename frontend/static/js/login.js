// Define the backend URL
const BACKEND_URL = 'http://127.0.0.1:5000'; // Update this to your deployed backend URL when hosting

document.getElementById('login-button').addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username && password) { // Ensure username and password are filled
        fetch(`${BACKEND_URL}/login`, { // Use the backend URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }), // Send username and password
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                if (data.error) {
                    alert(`Error: ${data.error}`);
                } else {
                    const category = data.category; // Fetch category from the server response
                    alert(data.message);

                    // Store username and category in localStorage
                    localStorage.setItem('username', username);
                    localStorage.setItem('category', category);

                    // Redirect based on category
                    if (category === 'admin') {
                        window.location.href = 'frontend/admin.html'; // Redirect to admin page
                    } else {
                        window.location.href = 'frontend/profile.html'; // Redirect to profile page
                    }
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('An error occurred while logging in.');
            });
    } else {
        alert('Please fill in both username and password.');
    }
});