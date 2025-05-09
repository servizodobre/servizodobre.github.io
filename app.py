from flask import Flask, request, jsonify
from flask_cors import CORS  # Import Flask-CORS
from paddleocr import PaddleOCR
import os

app = Flask(__name__)
CORS(app, resources={r"/upload": {"origins": "https://servizodobre.com"}})  # Allow only your domain

ocr = PaddleOCR(use_angle_cls=True, lang='en')  # Initialize PaddleOCR

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(file_path)

    # Perform OCR
    result = ocr.ocr(file_path, cls=True)
    extracted_text = '\n'.join([line[1][0] for line in result[0]])

    # Clean up uploaded file
    os.remove(file_path)

    return jsonify({'text': extracted_text})

if __name__ == '__main__':
    app.run(debug=True)