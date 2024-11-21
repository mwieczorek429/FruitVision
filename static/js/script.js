const dropZone = document.getElementById('dropZone');
const uploadLink = document.getElementById('uploadLink');
const uploadSection = document.getElementById('uploadSection');
const resultDiv = document.getElementById('result');
const resultImage = document.getElementById('resultImage');
const fruitPrediction = document.getElementById('fruitPrediction');
const detailsDiv = document.getElementById('details');
let selectedFile = null;

dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropZone.classList.remove('dragover');

    const files = event.dataTransfer.files;
    if (files.length === 0) {
        alert('Nie wybrano pliku.');
        return;
    }

    const file = files[0];
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        alert('Tylko pliki graficzne są dozwolone.');
        return;
    }

    selectedFile = file;
    alert('Plik został załadowany. Kliknij "Prześlij obraz", aby przesłać.');
    uploadLink.classList.remove('disabled');
});

uploadLink.addEventListener('click', async (event) => {
    event.preventDefault();
    if (!selectedFile || uploadLink.classList.contains('disabled')) {
        alert('Nie wybrano pliku do przesłania.');
        return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Błąd przesyłania pliku');
        }

        const data = await response.json();
        displayResult(data);
    } catch (error) {
        alert(error.message);
    }
});

function displayResult(data) {
if (data.error) {
    fruitPrediction.innerHTML = `<p style="color: red;">${data.error}</p>`;
    return;
}

uploadSection.style.display = 'none';

resultDiv.style.display = 'block';
resultImage.src = `/uploads/${data.filename}`;
resultImage.style.display = 'block';

// Filtruj owoce 
const highConfidenceFruits = Object.entries(data.prediction)
    .filter(([label, prob]) => prob > 0.5)
    .map(([label]) => label);

if (highConfidenceFruits.length > 0) {
    fruitPrediction.innerHTML = `
        <p>Na przesłanym obrazie znajduje się:<strong> ${highConfidenceFruits.join(', ')}</strong>.</p>
    `;
} else {
    fruitPrediction.innerHTML = `
        <p>Nie wykryto owoców z pewnością większą niż 50%.</p>
    `;
}
const roundedPredictions = Object.fromEntries(
Object.entries(data.prediction).map(([label, prob]) => [label, prob.toFixed(2)])
);

detailsDiv.textContent = JSON.stringify(roundedPredictions, null, 2);

const toggleDetailsButton = document.getElementById('toggleDetails');
toggleDetailsButton.textContent = 'Pokaż szczegóły';
toggleDetailsButton.addEventListener('click', () => {
    if (detailsDiv.style.display === 'none') {
        detailsDiv.style.display = 'block';
        toggleDetailsButton.textContent = 'Ukryj szczegóły';
    } else {
        detailsDiv.style.display = 'none';
        toggleDetailsButton.textContent = 'Pokaż szczegóły';
    }
});
}