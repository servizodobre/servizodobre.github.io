// Define the backend URL
const BACKEND_URL = 'http://127.0.0.1:5000';


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
        //welcomeMessage.textContent = `Welcome, ${username}!`;
        welcomeMessage.innerHTML = `${username}'s dashboard`;

        // Set default date to today
        const dateField = document.getElementById('expense-date');
        const today = new Date().toISOString().split('T')[0];
        dateField.value = today;

        // Fetch stores and items for dropdowns
        fetchStores();
        fetchItems();

        // Add event listeners for quantity and price fields
        const quantityField = document.getElementById('expense-quantity');
        const priceField = document.getElementById('expense-price');
        const totalField = document.getElementById('expense-total');

        quantityField.addEventListener('input', () => updateTotal(quantityField, priceField, totalField));
        priceField.addEventListener('input', () => updateTotal(quantityField, priceField, totalField));
    }
});

function fetchStores() {
    const storeDropdown = document.getElementById('expense-store');
    fetch('http://127.0.0.1:5000/expense/stores')
        .then((response) => response.json())
        .then((data) => {
            storeDropdown.innerHTML = '<option value="" disabled selected>Select a store</option>';
            data.stores.forEach((store) => {
                const option = document.createElement('option');
                option.value = store.name;
                option.textContent = store.name;
                storeDropdown.appendChild(option);
            });
        })
        .catch((error) => console.error('Error fetching stores:', error));
}

function fetchItems() {
    const itemDropdown = document.getElementById('expense-item');
    fetch('http://127.0.0.1:5000/expense/items')
        .then((response) => response.json())
        .then((data) => {
            itemDropdown.innerHTML = '<option value="" disabled selected>Select an item</option>';
            data.items.forEach((item) => {
                const option = document.createElement('option');
                option.value = item.name;
                option.textContent = item.name;
                itemDropdown.appendChild(option);
            });
        })
        .catch((error) => console.error('Error fetching items:', error));
}

// Fetch and display expenses
const fetchExpenses = () => {
    const expenseList = document.getElementById('expense-list');
    expenseList.innerHTML = '<p>Loading expenses...</p>';
    const username = localStorage.getItem('username');
    fetch(`http://127.0.0.1:5000/expense/expenses?user=${encodeURIComponent(username)}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            expenseList.innerHTML = ''; // Clear loading message

            if (data.expenses && data.expenses.length > 0) {
                // Create table
                const table = document.createElement('table');
                table.className = 'expense-summary-table';
                table.innerHTML = `
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Store</th>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Price (CAD)</th>
                            <th>Total (CAD)</th>
                            <th>Bucket</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.expenses.map(expense => `
                            <tr>
                                <td>${expense.date}</td>
                                <td>${expense.store_name}</td>
                                <td>${expense.item_name}</td>
                                <td>${expense.quantity}</td>
                                <td>${parseFloat(expense.price).toFixed(2)}</td>
                                <td>${parseFloat(expense.total).toFixed(2)}</td>
                                <td>${expense.bucket}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                `;
                expenseList.appendChild(table);
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
    const total = document.getElementById('expense-total').value;
    // Get username from welcome section or localStorage
    let username = localStorage.getItem('username');
    if (!username) {
        // Try to get from welcome message if not in localStorage
        const welcomeMessage = document.getElementById('welcome-message');
        if (welcomeMessage && welcomeMessage.textContent) {
            username = welcomeMessage.textContent.split("'s dashboard")[0];
        }
    }

    if (date && store && item && quantity && price && bucket && total && username) {
        fetch('http://127.0.0.1:5000/expense/add_expense', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ date, store, item, quantity, price, bucket, total, user: username }),
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

function updateTotal(quantityField, priceField, totalField) {
    const quantity = parseFloat(quantityField.value) || 0;
    const price = parseFloat(priceField.value) || 0;
    totalField.value = (quantity * price).toFixed(2);
}