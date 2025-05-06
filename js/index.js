const { jsPDF } = window.jspdf;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imageInput = document.getElementById('imageInput');
const dateInput = document.getElementById('dateInput');
const updateButton = document.getElementById('updateButton');
const downloadJpgButton = document.getElementById('downloadJpgButton');
const downloadPdfButton = document.getElementById('downloadPdfButton');
const coordinatesDiv = document.getElementById('coordinates');

// Генерация уникального ID для QR-кода
const uniqueId = `doc_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
let img = null;
let datePositions = [];

// Конфигурация
const config = {
    maxDatePositions: 6,
    qrCodeSize: 80,
    qrCodeMargin: 10,
    dateFont: '20px Arial',
    dateColor: 'black',
    pdfMaxWidth: 190,
    pdfMaxHeight: 277
};

// Инициализация приложения
function init() {
    setupEventListeners();
}

// Настройка обработчиков событий
function setupEventListeners() {
    imageInput.addEventListener('change', handleImageUpload);
    updateButton.addEventListener('click', updateImage);
    downloadJpgButton.addEventListener('click', downloadAsJPG);
    downloadPdfButton.addEventListener('click', downloadAsPDF);
}

// Обработка загрузки изображения
function handleImageUpload() {
    const file = this.files[0];
    
    if (!file || !file.type.match('image/jpeg')) {
        showAlert('Пожалуйста, выберите файл формата JPG!');
        return;
    }

    img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = function() {
        resetCanvas();
        canvas.addEventListener('click', handleCanvasClick);
    };
}

// Сброс canvas и подготовка к новому изображению
function resetCanvas() {
    canvas.width = img.width;
    canvas.height = img.height + 100; // Место для QR-кода
    canvas.style.display = 'block';
    ctx.drawImage(img, 0, 0);
    datePositions = [];
    coordinatesDiv.textContent = 'Координаты для даты: (кликните на изображение до 6 раз)';
    hideDownloadButtons();
}

// Обработка кликов по canvas для установки координат даты
function handleCanvasClick(event) {
    if (datePositions.length >= config.maxDatePositions) {
        showAlert(`Достигнуто максимум ${config.maxDatePositions} мест для даты!`);
        canvas.removeEventListener('click', handleCanvasClick);
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    datePositions.push({ x, y });

    updateCoordinatesDisplay();
    
    if (datePositions.length === config.maxDatePositions) {
        canvas.removeEventListener('click', handleCanvasClick);
    }
}

// Обновление отображения координат
function updateCoordinatesDisplay() {
    const formattedPositions = datePositions.map(pos => 
        `(${Math.round(pos.x)}, ${Math.round(pos.y)})`
    );
    coordinatesDiv.textContent = `Координаты для даты: ${formattedPositions.join(', ')}`;
}

// Обновление изображения с датой и QR-кодом
function updateImage() {
    if (!validateInputs()) return;

    redrawBaseImage();
    addDatesToImage();
    generateQRCode();
}

// Валидация введенных данных
function validateInputs() {
    if (!img) {
        showAlert('Пожалуйста, загрузите изображение!');
        return false;
    }

    const userDate = dateInput.value.trim();
    if (!userDate) {
        showAlert('Пожалуйста, введите дату!');
        return false;
    }

    if (datePositions.length === 0) {
        showAlert('Пожалуйста, отметьте хотя бы одно место для даты!');
        return false;
    }

    return true;
}

// Перерисовка базового изображения
function redrawBaseImage() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
}

// Добавление дат на изображение
function addDatesToImage() {
    const userDate = dateInput.value.trim();
    ctx.font = config.dateFont;
    ctx.fillStyle = config.dateColor;
    
    datePositions.forEach(pos => {
        ctx.fillText(userDate, pos.x, pos.y);
    });
}

// Генерация QR-кода
function generateQRCode() {
	try {
			// Очищаем предыдущий QR-код
			const qrContainer = document.getElementById('qr-container');
			qrContainer.innerHTML = '';
			
			// Создаем новый QR-код
			const qr = new QRCode(qrContainer, {
				text: uniqueId,
				width: 300,  // Ширина 100px
				height: 300,  // Высота 100px
				colorDark: "#000000",
				colorLight: "#ffffff",
				correctLevel: QRCode.CorrectLevel.H
		});
			
			// Даем время на генерацию QR-кода
			setTimeout(() => {
					const qrImg = qrContainer.querySelector('img');
					if (!qrImg) {
							throw new Error('QR-код не был сгенерирован');
					}
					
					const qrPosition = { 
						x: 600,       // 300px от левого края
						y: img.height - 400  // На 100px выше нижнего края изображения
				};
					
					// Рисуем QR-код на canvas
					ctx.drawImage(qrImg, qrPosition.x, qrPosition.y);
					
					// Показываем кнопки скачивания
					showDownloadButtons();
			}, 100);
	} catch (error) {
			console.error('Ошибка при генерации QR-кода:', error);
			showAlert('Произошла ошибка при генерации QR-кода. Проверьте консоль.');
	}
}

// Скачивание как JPG
function downloadAsJPG() {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/jpeg', 0.9);
    link.download = `document_${Date.now()}.jpg`;
    link.click();
}

// Скачивание как PDF
function downloadAsPDF() {
    const doc = new jsPDF();
    const imgData = canvas.toDataURL('image/jpeg', 0.9);
    const imgProps = doc.getImageProperties(imgData);
    
    // Конвертация пикселей в мм (1px = 0.264583mm)
    let width = imgProps.width * 0.264583;
    let height = imgProps.height * 0.264583;
    
    // Масштабирование под максимальные размеры
    const scaleFactor = Math.min(
        config.pdfMaxWidth / width,
        config.pdfMaxHeight / height,
        1
    );
    
    width *= scaleFactor;
    height *= scaleFactor;
    
    doc.addImage(imgData, 'JPEG', 0, 0, width, height);
    
    // Сохранение данных сканирования
    saveScanData(uniqueId, new Date().toISOString());
    
    doc.save(`document_${Date.now()}.pdf`);
}

// Сохранение данных сканирования
async function saveScanData(qrId, scanDate) {
    try {
        const response = await fetch('php/save_scan.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: qrId,
                date: scanDate
            })
        });
        
        const result = await response.json();
        if (!result.success) {
            console.error('Ошибка сохранения данных:', result.error);
        }
    } catch (error) {
        console.error('Ошибка при отправке данных:', error);
    }
}

// Вспомогательные функции
function showAlert(message) {
    alert(message);
}

function showDownloadButtons() {
	document.getElementById('downloadJpgButton').style.display = 'inline-block';
	document.getElementById('downloadPdfButton').style.display = 'inline-block';
	console.log('Кнопки скачивания должны быть видны');
}

function hideDownloadButtons() {
	document.getElementById('downloadJpgButton').style.display = 'none';
	document.getElementById('downloadPdfButton').style.display = 'none';
}

// Инициализация приложения
init();

async function saveImageToMySQL(imageData, filename) {
    try {
        // Конвертируем DataURL в Blob
        const blob = await fetch(imageData).then(res => res.blob());
        
        // Создаем FormData для отправки
        const formData = new FormData();
        formData.append('image', blob, filename);
        formData.append('action', 'save_jpg');
        
        const response = await fetch('php/save_image.php', {
            method: 'POST',
            body: formData
        });
        
        return await response.json();
    } catch (error) {
        console.error('Ошибка сохранения в MySQL:', error);
        return { success: false, error: error.message };
    }
}

async function downloadAsJPG() {
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    const filename = `document_${Date.now()}.jpg`;
    
    // Создаем ссылку для скачивания
    const link = document.createElement('a');
    link.href = imageData;
    link.download = filename;
    link.click();
    
    // Сохраняем в MySQL
    try {
        const result = await saveImageToMySQL(imageData, filename);
        if (!result.success) {
            console.error('Ошибка сохранения в БД:', result.error);
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}