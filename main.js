const URL = "https://teachablemachine.withgoogle.com/models/5vOlsSOB5/";

let model, labelContainer, maxPredictions;

const imageUpload = document.getElementById('image-upload');
const uploadBtn = document.getElementById('upload-btn');
const imagePreview = document.getElementById('image-preview');
const resultSection = document.getElementById('result-section');
const resultMessage = document.getElementById('result-message');
const loading = document.getElementById('loading');
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Load the image model
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    labelContainer = document.getElementById("label-container");
}

uploadBtn.addEventListener('click', () => imageUpload.click());

imageUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        imagePreview.src = event.target.result;
        imagePreview.style.display = 'block';
        
        loading.style.display = 'block';
        resultSection.style.display = 'none';

        if (!model) await init();
        
        predict();
    };
    reader.readAsDataURL(file);
});

async function predict() {
    const prediction = await model.predict(imagePreview);
    loading.style.display = 'none';
    resultSection.style.display = 'block';
    
    prediction.sort((a, b) => b.probability - a.probability);
    
    // 클래스 이름 한글 매핑
    const classMapping = {
        "Dog": "강아지",
        "Cat": "고양이"
    };
    
    const topResult = prediction[0];
    const koreanClassName = classMapping[topResult.className] || topResult.className;
    resultMessage.innerText = `당신은 ${koreanClassName}상입니다!`;

    labelContainer.innerHTML = '';
    for (let i = 0; i < maxPredictions; i++) {
        const className = prediction[i].className;
        const koreanName = classMapping[className] || className;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'label-wrapper';
        wrapper.innerHTML = `
            <div style="margin-top: 10px;">${koreanName} (${(prediction[i].probability * 100).toFixed(0)}%)</div>
            <div class="bar-container" style="height: 20px; background: #eee; border-radius: 10px; overflow: hidden; margin-top: 5px;">
                <div class="bar" style="height: 100%; background: var(--btn-bg); width: ${prediction[i].probability * 100}%"></div>
            </div>
        `;
        labelContainer.appendChild(wrapper);
    }
}

// Theme Toggle Logic
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
    if(themeToggle) themeToggle.textContent = '라이트 모드';
}

if(themeToggle) {
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDarkMode = body.classList.contains('dark-mode');
        themeToggle.textContent = isDarkMode ? '라이트 모드' : '다크 모드';
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    });
}

init();
