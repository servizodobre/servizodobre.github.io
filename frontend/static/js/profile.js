document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed'); // Debugging log

    const username = localStorage.getItem('username');
    const category = localStorage.getItem('category');

    // Redirect to login if user is not valid
    if (!username || category !== 'user') {
        window.location.href = 'login.html';
    } else {
        // Display welcome message
        const welcomeMessage = document.getElementById('welcome-message');
        welcomeMessage.textContent = `Welcome, ${username}!`;

        // Fetch and display expenses
        fetchExpenses();
    }

    const fetchStores = () => {
        console.log('Fetching stores...'); // Debugging log
        fetch('http://127.0.0.1:5000/stores')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch stores');
                }
                return response.json();
            })
            .then((data) => {
                console.log('Stores fetched:', data); // Debugging log
                const storeDropdown = document.getElementById('expense-store');
                storeDropdown.innerHTML = ''; // Clear existing options

                // Add a default "Select a store" option
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Select a store from list';
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
        const expenseList = document.getElementById('expense-list');
        expenseList.innerHTML = '<p>Loading expenses...</p>'; // Show loading message

        fetch('http://127.0.0.1:5000/expenses') // Replace with your backend endpoint
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                expenseList.innerHTML = ''; // Clear loading message

                if (data.expenses && data.expenses.length > 0) {
                    data.expenses.forEach((expense) => {
                        const expenseItem = document.createElement('div');
                        expenseItem.className = 'expense-item';
                        expenseItem.innerHTML = `
                            <p><strong>Date:</strong> ${expense.date}</p>
                            <p><strong>Store:</strong> ${expense.store}</p>
                            <p><strong>Item:</strong> ${expense.item}</p>
                            <p><strong>Quantity:</strong> ${expense.quantity}</p>
                            <p><strong>Price:</strong> CAD ${expense.price.toFixed(2)}</p>
                            <p><strong>Bucket:</strong> ${expense.bucket}</p>
                        `;
                        expenseList.appendChild(expenseItem);
                    });
                } else {
                    expenseList.innerHTML = '<p>No expenses added yet.</p>';
                }
            })
            .catch((error) => {
                console.error('Error fetching expenses:', error);
                expenseList.innerHTML = '<p>Error loading expenses. Please try again later.</p>';
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
    fetchStores();
    fetchItems();
});