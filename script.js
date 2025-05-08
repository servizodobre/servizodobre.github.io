document.getElementById('extract-button').addEventListener('click', () => {
    const fileInput = document.getElementById('invoice-image');
    const output = document.getElementById('data-output');

    if (fileInput.files.length === 0) {
        output.textContent = 'Please upload an image file.';
        return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData,
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                output.textContent = `Error: ${data.error}`;
            } else {
                output.textContent = data.text || 'No text found in the image.';
            }
        })
        .catch((error) => {
            console.error(error);
            output.textContent = 'An error occurred while extracting text.';
        });
});