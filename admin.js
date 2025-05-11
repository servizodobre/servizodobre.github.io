document.addEventListener('DOMContentLoaded', () => {
    // Fetch and display users
    const fetchUsers = () => {
        fetch('http://127.0.0.1:5000/users')
            .then((response) => response.json())
            .then((data) => {
                const userList = document.getElementById('user-list');
                userList.innerHTML = ''; // Clear the current list

                data.users.forEach((user) => {
                    const userDiv = document.createElement('div');
                    userDiv.className = 'user-item';
                    userDiv.innerHTML = `
                        <span>${user.username} (${user.category})</span>
                        <button class="edit-user" data-username="${user.username}">
                            <img src="images/edit-button.png" alt="Edit" class="icon">
                        </button>
                        <button class="delete-user" data-username="${user.username}">
                            <img src="images/delete-button.png" alt="Delete" class="icon">
                        </button>
                    `;
                    userList.appendChild(userDiv);
                });
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
                    fetchUsers(); // Refresh the user list
                })
                .catch((error) => {
                    console.error('Error adding user:', error);
                });
        }
    });

    // Edit user
    document.getElementById('user-list').addEventListener('click', (event) => {
        if (event.target.closest('.edit-user')) {
            const username = event.target.closest('.edit-user').dataset.username;
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
                        fetchUsers(); // Refresh the user list
                    })
                    .catch((error) => {
                        console.error('Error editing user:', error);
                    });
            }
        }
    });

    // Delete user
    document.getElementById('user-list').addEventListener('click', (event) => {
        if (event.target.closest('.delete-user')) {
            const username = event.target.closest('.delete-user').dataset.username;

            if (confirm(`Are you sure you want to delete ${username}?`)) {
                fetch('http://127.0.0.1:5000/delete_user', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username }),
                })
                    .then((response) => response.json())
                    .then((data) => {
                        alert(data.message || 'User deleted successfully!');
                        fetchUsers(); // Refresh the user list
                    })
                    .catch((error) => {
                        console.error('Error deleting user:', error);
                    });
            }
        }
    });

    // Fetch and display stores
    const fetchStores = () => {
        fetch('http://127.0.0.1:5000/stores')
            .then((response) => response.json())
            .then((data) => {
                const storeList = document.getElementById('store-list');
                storeList.innerHTML = ''; // Clear the current list

                data.stores.forEach((store) => {
                    const storeDiv = document.createElement('div');
                    storeDiv.className = 'store-item';
                    storeDiv.innerHTML = `
                        <span>${store.name}</span>
                        <button class="edit-store" data-id="${store.id}">
                            <img src="images/edit-button.png" alt="Edit" class="icon">
                        </button>
                        <button class="delete-store" data-id="${store.id}">
                            <img src="images/delete-button.png" alt="Delete" class="icon">
                        </button>
                    `;
                    storeList.appendChild(storeDiv);
                });
            })
            .catch((error) => {
                console.error('Error fetching stores:', error);
            });
    };

    // Add new store
    document.getElementById('add-store-button').addEventListener('click', () => {
        const name = prompt('Enter store name:');

        if (name) {
            fetch('http://127.0.0.1:5000/add_store', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name }),
            })
                .then((response) => response.json())
                .then((data) => {
                    alert(data.message || 'Store added successfully!');
                    fetchStores(); // Refresh the store list
                })
                .catch((error) => {
                    console.error('Error adding store:', error);
                });
        }
    });

    // Edit store
    document.getElementById('store-list').addEventListener('click', (event) => {
        if (event.target.closest('.edit-store')) {
            const storeId = event.target.closest('.edit-store').dataset.id;
            const newName = prompt('Enter new store name:');

            if (newName) {
                fetch('http://127.0.0.1:5000/edit_store', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id: storeId, name: newName }),
                })
                    .then((response) => response.json())
                    .then((data) => {
                        alert(data.message || 'Store updated successfully!');
                        fetchStores(); // Refresh the store list
                    })
                    .catch((error) => {
                        console.error('Error editing store:', error);
                    });
            }
        }
    });

    // Delete store
    document.getElementById('store-list').addEventListener('click', (event) => {
        if (event.target.closest('.delete-store')) {
            const storeId = event.target.closest('.delete-store').dataset.id;

            if (confirm('Are you sure you want to delete this store?')) {
                fetch('http://127.0.0.1:5000/delete_store', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id: storeId }),
                })
                    .then((response) => response.json())
                    .then((data) => {
                        alert(data.message || 'Store deleted successfully!');
                        fetchStores(); // Refresh the store list
                    })
                    .catch((error) => {
                        console.error('Error deleting store:', error);
                    });
            }
        }
    });

    // Initial fetch
    fetchUsers();
    fetchStores();
});