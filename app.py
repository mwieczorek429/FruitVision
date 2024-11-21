from flask import Flask, request, render_template, send_from_directory, jsonify
import os
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array, load_img

app = Flask(__name__)

MODEL_PATH = 'top_model.keras'
model = load_model(MODEL_PATH)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Wymiary obrazu zgodne z modelem
IMG_SIZE = (224, 224)  
class_labels = ['Apple', 'Banana', 'Orange']  

def predict_fruits(img_path):
    img = load_img(img_path, target_size=IMG_SIZE)
    img_array = img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    predictions = model.predict(img_array)[0]
    return {class_labels[i]: float(predictions[i]) for i in range(len(class_labels))}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files or request.files['file'].filename == '':
        return jsonify({'error': 'Nie wybrano pliku.'}), 400

    file = request.files['file']
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    prediction = predict_fruits(file_path)
    return jsonify({'prediction': prediction, 'filename': file.filename})

@app.route('/uploads/<filename>')
def serve_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

if __name__ == '__main__':
    app.run(debug=True)
