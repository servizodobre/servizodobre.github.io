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

    const storeDropdown = document.getElementById('expense-store');

    // Fetch stores when the dropdown is clicked
    storeDropdown.addEventListener('click', () => {
        console.log('Dropdown clicked, fetching stores...');
        fetchStores();
    });

    // Fetch and populate stores
    const fetchStores = () => {
        fetch('http://127.0.0.1:5000/stores')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch stores');
                }
                return response.json();
            })
            .then((data) => {
                console.log('Stores fetched:', data); // Debugging log
                storeDropdown.innerHTML = ''; // Clear existing options

                // Add a default "Select a store" option
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Select a store';
                defaultOption.disabled = true;
                defaultOption.selected = true;
                storeDropdown.appendChild(defaultOption);

                // Populate the dropdown with store names
                data.stores.forEach((store) => {
                    const option = document.createElement('option');
                    option.value = store.id; // Use the store ID as the value
                    option.textContent = store.name; // Display the store name
                    storeDropdown.appendChild(option);
                });
            })
            .catch((error) => {
                console.error('Error fetching stores:', error);
            });
    };

    // Fetch and populate items
    const fetchItems = () => {
        fetch('http://127.0.0.1:5000/items')
            .then((response) => response.json())
            .then((data) => {
                console.log('Items fetched:', data); // Debugging log
                const itemDropdown = document.getElementById('expense-item');
                itemDropdown.innerHTML = ''; // Clear existing options

                // Add a default "Select an item" option
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Select an item';
                defaultOption.disabled = true;
                defaultOption.selected = true;
                itemDropdown.appendChild(defaultOption);

                // Populate the dropdown with item names
                data.items.forEach((item) => {
                    const option = document.createElement('option');
                    option.value = item.id; // Use the item ID as the value
                    option.textContent = item.name; // Display the item name
                    itemDropdown.appendChild(option);
                });
            })
            .catch((error) => {
                console.error('Error fetching items:', error);
            });
    };

    // Fetch and display expenses
    const fetchExpenses = () => {
        fetch('http://127.0.0.1:5000/expenses')
            .then((response) => response.json())
            .then((data) => {
                const expenseList = document.getElementById('expense-list');
                expenseList.innerHTML = '<h3>Expenses</h3>'; // Reset the list

                data.expenses.forEach((expense) => {
                    const expenseDiv = document.createElement('div');
                    expenseDiv.className = 'expense-item';
                    expenseDiv.innerHTML = `
                        <span>${expense.date} - ${expense.store} - ${expense.item} - ${expense.quantity} x $${expense.price.toFixed(2)} CAD (${expense.bucket})</span>
                    `;
                    expenseList.appendChild(expenseDiv);
                });
            })
            .catch((error) => {
                console.error('Error fetching expenses:', error);
            });
    };

    // Add new expense
    document.getElementById('add-expense-button').addEventListener('click', () => {
        const date = document.getElementById('expense-date').value;
        const store = document.getElementById('expense-store').value;
        const item = document.getElementById('expense-item').value;
        const quantity = parseInt(document.getElementById('expense-quantity').value, 10);
        const price = parseFloat(document.getElementById('expense-price').value).toFixed(2);
        const bucket = document.getElementById('expense-bucket').value;

        if (date && store && item && quantity && price && bucket) {
            fetch('http://127.0.0.1:5000/add_expense', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ date, store, item, quantity, price, bucket }),
            })
                .then((response) => response.json())
                .then((data) => {
                    alert(data.message || 'Expense added successfully!');
                    fetchExpenses(); // Refresh the expense list
                })
                .catch((error) => {
                    console.error('Error adding expense:', error);
                });
        } else {
            alert('All fields are required to add an expense.');
        }
    });

    // Initial fetches
    fetchItems();
    fetchExpenses();
});