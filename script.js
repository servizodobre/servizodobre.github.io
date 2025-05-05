// Import Tesseract.js (ensure you include it in your project)
import Tesseract from 'tesseract.js';

document.getElementById('generate-invoice').addEventListener('click', function () {
    // Get form values
    const clientName = document.getElementById('client-name').value;
    const clientEmail = document.getElementById('client-email').value;
    const itemDescription = document.getElementById('item-description').value;
    const itemQuantity = parseInt(document.getElementById('item-quantity').value, 10);
    const itemPrice = parseFloat(document.getElementById('item-price').value);

    // Calculate total price
    const totalPrice = itemQuantity * itemPrice;

    // Generate invoice HTML
    const invoiceHTML = `
        <h3>Invoice</h3>
        <p><strong>Client Name:</strong> ${clientName}</p>
        <p><strong>Client Email:</strong> ${clientEmail}</p>
        <p><strong>Item Description:</strong> ${itemDescription}</p>
        <p><strong>Quantity:</strong> ${itemQuantity}</p>
        <p><strong>Price per Item:</strong> $${itemPrice.toFixed(2)}</p>
        <p><strong>Total Price:</strong> $${totalPrice.toFixed(2)}</p>
    `;

    // Display the invoice
    const invoiceOutput = document.getElementById('invoice-output');
    invoiceOutput.innerHTML = invoiceHTML;
});

// Handle receipt image upload and OCR
document.getElementById('receipt-image').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function () {
            Tesseract.recognize(
                reader.result, // Image data
                'eng', // Language
                {
                    logger: info => console.log(info) // Log progress
                }
            ).then(({ data: { text } }) => {
                console.log('Extracted Text:', text);
                alert('Extracted Text: ' + text); // Display extracted text
                // You can parse the text and populate the form fields here
            }).catch(error => {
                console.error('OCR Error:', error);
            });
        };
        reader.readAsDataURL(file);
    }
});