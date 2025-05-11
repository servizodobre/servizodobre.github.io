document.getElementById('register-button').addEventListener('click', () => {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    let category = document.getElementById('reg-category').value;

    // Set category to 'user' by default if not provided
    if (!category) {
        category = 'user';
    }

    if (username && password) { // Ensure username and password are filled
        fetch('http://127.0.0.1:5000/register', {
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
                    window.location.href = 'login.html'; // Redirect to login page
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('An error occurred while registering the user.');
            });
    } else {
        alert('Please fill in username and password.');
    }
});