document.getElementById('login-button').addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username && password) {
        fetch('http://127.0.0.1:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    alert(`Error: ${data.error}`);
                } else {
                    alert(data.message);
                    // Store username and category in localStorage
                    localStorage.setItem('username', username);
                    localStorage.setItem('category', data.category);
                    window.location.href = 'profile.html'; // Redirect to profile page
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