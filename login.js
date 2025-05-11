document.getElementById('login-button').addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const category = document.getElementById('category')?.value; // Optional chaining to avoid errors if category is missing

    if (username && password && category) { // Ensure all fields are filled
        fetch('http://127.0.0.1:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, category }), // Include category in the request body
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    alert(`Error: ${data.error}`);
                } else {
                    alert(data.message);
                    // Store username and category in localStorage
                    localStorage.setItem('username', username);
                    localStorage.setItem('category', category);

                    // Redirect to profile page
                    if (category === 'admin') {
                        window.location.href = 'profile.html';
                    } else {
                        alert('Access restricted to admin users.');
                    }
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('An error occurred while logging in.');
            });
    } else {
        alert('Please fill in username, password, and category.');
    }
});