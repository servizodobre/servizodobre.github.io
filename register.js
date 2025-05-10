document.getElementById('register-button').addEventListener('click', () => {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;

    if (username && password) {
        fetch('http://127.0.0.1:5000/register', {
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
                    window.location.href = 'login.html'; // Redirect to login page
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('An error occurred while registering the user.');
            });
    } else {
        alert('Please fill in both username and password.');
    }
});