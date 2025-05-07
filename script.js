// Import Tesseract.js (ensure you include it in your project)
//import Tesseract from 'tesseract.js';

// Handle receipt image upload and OCR
document.getElementById('extract-button').addEventListener('click', () => {
    const fileInput = document.getElementById('invoice-image');
    const output = document.getElementById('data-output');

    if (fileInput.files.length === 0) {
        output.textContent = 'Please upload an image file.';
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function () {
        const imageData = reader.result;

        // Use Tesseract.js for OCR
        Tesseract.recognize(
            imageData, // Image data
            'eng', // Language
            {
                logger: (info) => console.log(info), // Log progress
            }
        ).then(({ data: { text } }) => {
            output.textContent = text || 'No text found in the image.';
        }).catch((error) => {
            console.error(error);
            output.textContent = 'An error occurred while extracting text.';
        });
    };

    reader.readAsDataURL(file);
});

// Generate invoice functionality
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
