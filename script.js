// Import Tesseract.js (ensure you include it in your project)
//import Tesseract from 'tesseract.js';

// Handle receipt image upload and OCR
document.getElementById('extract-data').addEventListener('click', function () {
    const fileInput = document.getElementById('receipt-image');
    const file = fileInput.files[0];

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

                // Display the extracted text on the web page
                const extractedDataDiv = document.getElementById('extracted-data');
                extractedDataDiv.innerHTML = `<pre>${text}</pre>`;
            }).catch(error => {
                console.error('OCR Error:', error);
                alert('Failed to extract text from the image.');
            });
        };
        reader.readAsDataURL(file);
    } else {
        alert('Please upload a receipt image first.');
    }
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
