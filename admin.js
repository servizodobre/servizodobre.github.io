document.addEventListener('DOMContentLoaded', () => {
    let currentPage = 1;
    const usersPerPage = 5;

    // Fetch and display users
    const fetchUsers = (page) => {
        fetch(`http://127.0.0.1:5000/users?page=${page}&limit=${usersPerPage}`)
            .then((response) => response.json())
            .then((data) => {
                const userList = document.getElementById('user-list');
                userList.innerHTML = ''; // Clear the current list

                data.users.forEach((user) => {
                    const userDiv = document.createElement('div');
                    userDiv.className = 'user-item';
                    userDiv.innerHTML = `
                        <span>${user.username} (${user.category})</span>
                        <button class="edit-user" data-username="${user.username}">Edit</button>
                        <button class="delete-user" data-username="${user.username}">Delete</button>
                    `;
                    userList.appendChild(userDiv);
                });

                // Update pagination info
                document.getElementById('page-info').textContent = `Page ${data.page} of ${data.totalPages}`;
                document.getElementById('prev-page').disabled = data.page === 1;
                document.getElementById('next-page').disabled = data.page === data.totalPages;
            })
            .catch((error) => {
                console.error('Error fetching users:', error);
            });
    };

    // Add new user
    document.getElementById('add-user-button').addEventListener('click', () => {
        const username = prompt('Enter username:');
        const password = prompt('Enter password:');
        const category = prompt('Enter category (user/admin):', 'user');

        if (username && password && category) {
            fetch('http://127.0.0.1:5000/add_user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, category }),
            })
                .then((response) => response.json())
                .then((data) => {
                    alert(data.message || 'User added successfully!');
                    fetchUsers(currentPage); // Refresh the user list
                })
                .catch((error) => {
                    console.error('Error adding user:', error);
                });
        }
    });

    // Edit user
    document.getElementById('user-list').addEventListener('click', (event) => {
        if (event.target.classList.contains('edit-user')) {
            const username = event.target.dataset.username;
            const newPassword = prompt(`Enter new password for ${username}:`);
            const newCategory = prompt(`Enter new category for ${username} (user/admin):`);

            if (newPassword || newCategory) {
                fetch('http://127.0.0.1:5000/edit_user', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password: newPassword, category: newCategory }),
                })
                    .then((response) => response.json())
                    .then((data) => {
                        alert(data.message || 'User updated successfully!');
                        fetchUsers(currentPage); // Refresh the user list
                    })
                    .catch((error) => {
                        console.error('Error editing user:', error);
                    });
            }
        }
    });

    // Delete user
    document.getElementById('user-list').addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-user')) {
            const username = event.target.dataset.username;

            if (confirm(`Are you sure you want to delete ${username}?`)) {
                fetch('http://127.0.0.1:5000/remove_user', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username }),
                })
                    .then((response) => response.json())
                    .then((data) => {
                        alert(data.message || 'User removed successfully!');
                        fetchUsers(currentPage); // Refresh the user list
                    })
                    .catch((error) => {
                        console.error('Error deleting user:', error);
                    });
            }
        }
    });

    // Pagination
    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchUsers(currentPage);
        }
    });

    document.getElementById('next-page').addEventListener('click', () => {
        currentPage++;
        fetchUsers(currentPage);
    });

    // Initial fetch
    fetchUsers(currentPage);
});