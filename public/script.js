/**
 * Papers, Please - Passport Generator Frontend
 * 
 * This is the client-side application for generating pixel-art style passports
 * inspired by the game "Papers, Please". Handles photo processing, form validation,
 * and passport generation through API calls to the backend server.
 * 
 * @author MOtaMore
 * @license MIT
 */

/**
 * Application state management
 * Stores all current app data including images, processed data, and form fields
 */
const AppState = {
    originalImage: null,
    processedImageData: null,
    processedImageBlob: null,
    fileName: '',
    isPhotoProcessed: false,
    currentCountry: '',
    passportData: null,
    countries: {},
    currentMode: 'auto'
};

/**
 * API endpoints configuration
 * All backend routes for image processing and passport generation
 */
const API = {
    base: window.location.origin,
    processImage: '/api/process-image',
    processPreprocessedImage: '/api/process-preprocessed-image',
    generatePassport: '/api/generate-passport',
    getCountries: '/api/countries',
    checkTemplates: '/api/check-templates',
    health: '/api/health'
};

/**
 * DOM element references
 * Cached references to all interactive elements for better performance
 */
const elements = {
    modeTabs: document.querySelectorAll('.mode-tab'),
    autoMode: document.getElementById('auto-mode'),
    manualMode: document.getElementById('manual-mode'),
    
    imageUpload: document.getElementById('image-upload'),
    uploadZone: document.querySelector('.upload-zone'),
    uploadPrimary: document.querySelector('.upload-primary'),
    thresholdSlider: document.getElementById('threshold'),
    thresholdValue: document.getElementById('threshold-value'),
    processBtn: document.getElementById('process-btn'),
    
    preprocUpload: document.getElementById('preproc-upload'),
    preprocZone: document.querySelector('.preproc-zone'),
    directLoadBtn: document.getElementById('direct-load-btn'),
    
    processStatus: document.getElementById('process-status'),
    originalPreview: document.getElementById('original-preview'),
    originalPlaceholder: document.getElementById('original-placeholder'),
    processedPreview: document.getElementById('processed-preview'),
    pixelatedPlaceholder: document.getElementById('pixelated-placeholder'),
    downloadProcessedBtn: document.getElementById('download-processed-btn'),
    
    countrySelect: document.getElementById('country-select'),
    passportFields: document.getElementById('passport-fields'),
    fieldInputs: {
        name: document.getElementById('field-name'),
        dob: document.getElementById('field-dob'),
        sex: document.getElementById('field-sex'),
        city: document.getElementById('field-city'),
        number: document.getElementById('field-number'),
        expiry: document.getElementById('field-expiry')
    },
    
    generateBtn: document.getElementById('generate-btn'),
    downloadBtn: document.getElementById('download-btn'),
    passportPreview: document.getElementById('passport-preview'),
    passportPreviewSection: document.getElementById('passport-preview-section'),
    closePreviewBtn: document.getElementById('close-preview'),
    
    systemDate: document.getElementById('system-date'),
    loadingOverlay: document.getElementById('loading-overlay')
};

/**
 * Initialize the application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', async () => {
    updateSystemDate();
    await checkServerHealth();
    await loadCountries();
    setupEventListeners();
    addTerminalEffects();
});

/**
 * Check if backend server is running and responding
 * @returns {Promise<void>}
 */
async function checkServerHealth() {
    try {
        const response = await fetch(API.health);
        const data = await response.json();
        console.log('Server connected:', data);
    } catch (error) {
        console.error('Error connecting to server:', error);
        updateStatus('ERROR: SERVER UNAVAILABLE');
    }
}

/**
 * Load available countries and their passport templates from backend
 * @returns {Promise<void>}
 */
async function loadCountries() {
    try {
        const response = await fetch(API.getCountries);
        const data = await response.json();
        
        if (data.success) {
            AppState.countries = data.countries;
            
            for (const [code, country] of Object.entries(data.countries)) {
                const option = document.createElement('option');
                option.value = code;
                option.textContent = country.displayName.toUpperCase();
                elements.countrySelect.appendChild(option);
            }
        }
    } catch (error) {
        console.error('Error loading countries:', error);
    }
}

/**
 * Set up all event listeners for user interactions
 */
function setupEventListeners() {
    elements.modeTabs.forEach(tab => {
        tab.addEventListener('click', handleModeChange);
    });
    
    elements.imageUpload.addEventListener('change', handleImageUpload);
    elements.preprocUpload.addEventListener('change', handlePreprocUpload);
    
    elements.uploadZone.addEventListener('dragover', handleDragOver);
    elements.uploadZone.addEventListener('dragleave', handleDragLeave);
    elements.uploadZone.addEventListener('drop', handleDrop);
    
    if (elements.preprocZone) {
        elements.preprocZone.addEventListener('dragover', handleDragOver);
        elements.preprocZone.addEventListener('dragleave', handleDragLeave);
        elements.preprocZone.addEventListener('drop', handlePreprocDrop);
    }
    
    elements.thresholdSlider.addEventListener('input', handleThresholdChange);
    elements.processBtn.addEventListener('click', handleProcessImage);
    elements.directLoadBtn.addEventListener('click', handleDirectLoad);
    
    elements.downloadProcessedBtn.addEventListener('click', handleDownloadProcessed);
    
    elements.countrySelect.addEventListener('change', handleCountryChange);
    elements.generateBtn.addEventListener('click', handleGeneratePassport);
    elements.downloadBtn.addEventListener('click', handleDownloadPassport);
    elements.closePreviewBtn.addEventListener('click', closePreview);
    
    Object.values(elements.fieldInputs).forEach(input => {
        input.addEventListener('input', validateFields);
    });
    
    elements.fieldInputs.dob.addEventListener('input', formatDateInput);
    elements.fieldInputs.expiry.addEventListener('input', formatDateInput);
    elements.fieldInputs.number.addEventListener('input', formatPassportInput);
}

/**
 * Handle switching between automatic and manual processing modes
 * @param {Event} e - Click event
 */
function handleModeChange(e) {
    const newMode = e.target.dataset.mode;
    if (newMode === AppState.currentMode) return;
    
    AppState.currentMode = newMode;
    
    elements.modeTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.mode === newMode);
    });
    
    elements.autoMode.classList.toggle('hidden', newMode !== 'auto');
    elements.manualMode.classList.toggle('hidden', newMode !== 'manual');
    
    resetProcessingState();
    
    updateStatus(`${newMode.toUpperCase()} MODE ACTIVATED`);
}

/**
 * Reset all processing-related state and UI
 */
function resetProcessingState() {
    AppState.isPhotoProcessed = false;
    AppState.processedImageData = null;
    AppState.processedImageBlob = null;
    
    elements.processedPreview.classList.add('hidden');
    elements.pixelatedPlaceholder.classList.remove('hidden');
    elements.downloadProcessedBtn.classList.add('hidden');
    
    elements.countrySelect.disabled = true;
    Object.values(elements.fieldInputs).forEach(input => {
        input.disabled = true;
    });
    elements.generateBtn.disabled = true;
}

/**
 * Update the system date display in header
 */
function updateSystemDate() {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    elements.systemDate.textContent = `DATE: ${day}/${month}/${year}`;
}

/**
 * Update status message with animation
 * @param {string} message - Status message to display
 */
function updateStatus(message) {
    elements.processStatus.textContent = message;
    elements.processStatus.style.animation = 'pulse 1s ease-in-out';
    setTimeout(() => {
        elements.processStatus.style.animation = '';
    }, 1000);
}

/**
 * Toggle loading overlay visibility
 * @param {boolean} show - Whether to show or hide the loading overlay
 */
function showLoading(show = true) {
    elements.loadingOverlay.classList.toggle('hidden', !show);
}

/**
 * Handle drag over event for file drop zones
 * @param {DragEvent} e - Drag event
 */
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.style.borderColor = 'var(--approved)';
    e.currentTarget.style.background = 'rgba(90, 124, 78, 0.2)';
}

/**
 * Handle drag leave event for file drop zones
 * @param {DragEvent} e - Drag event
 */
function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.style.borderColor = '';
    e.currentTarget.style.background = '';
}

/**
 * Handle file drop for automatic processing
 * @param {DragEvent} e - Drop event
 */
function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.style.borderColor = '';
    e.currentTarget.style.background = '';
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
        loadImageFile(files[0]);
    }
}

/**
 * Handle file drop for pre-processed images
 * @param {DragEvent} e - Drop event
 */
function handlePreprocDrop(e) {
    e.preventDefault();
    e.currentTarget.style.borderColor = '';
    e.currentTarget.style.background = '';
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
        loadPreprocImageFile(files[0]);
    }
}

/**
 * Handle image file selection for automatic processing
 * @param {Event} e - Change event
 */
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        loadImageFile(file);
    }
}

/**
 * Handle pre-processed image file selection
 * @param {Event} e - Change event
 */
function handlePreprocUpload(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        loadPreprocImageFile(file);
    }
}

/**
 * Load image file for automatic processing
 * @param {File} file - Image file to load
 */
function loadImageFile(file) {
    AppState.fileName = file.name;
    AppState.originalImage = file;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        elements.originalPreview.src = event.target.result;
        elements.originalPreview.classList.remove('hidden');
        elements.originalPlaceholder.classList.add('hidden');
        
        elements.uploadPrimary.textContent = AppState.fileName.toUpperCase();
        elements.uploadZone.classList.add('has-file');
        
        elements.processBtn.disabled = false;
        updateStatus('PHOTO LOADED');
    };
    
    reader.readAsDataURL(file);
}

/**
 * Load pre-processed image file (must be exactly 40x48 pixels)
 * @param {File} file - Pre-processed image file
 */
function loadPreprocImageFile(file) {
    AppState.fileName = file.name;
    AppState.originalImage = file;
    
    const img = new Image();
    img.onload = () => {
        if (img.width !== 40 || img.height !== 48) {
            alert(`ERROR: Image must be exactly 40x48 pixels.\nCurrent size: ${img.width}x${img.height}`);
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            elements.originalPreview.src = event.target.result;
            elements.originalPreview.classList.remove('hidden');
            elements.originalPlaceholder.classList.add('hidden');
            
            const preprocPrimary = elements.preprocZone.querySelector('.upload-primary');
            preprocPrimary.textContent = AppState.fileName.toUpperCase();
            elements.preprocZone.classList.add('has-file');
            
            elements.directLoadBtn.disabled = false;
            updateStatus('40x48 IMAGE LOADED');
        };
        
        reader.readAsDataURL(file);
    };
    
    const reader = new FileReader();
    reader.onload = (e) => {
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

/**
 * Handle threshold slider value change
 * @param {Event} e - Input event
 */
function handleThresholdChange(e) {
    elements.thresholdValue.textContent = e.target.value;
}

/**
 * Process image automatically using backend API
 */
async function handleProcessImage() {
    if (!AppState.originalImage) return;
    
    showLoading(true);
    updateStatus('PROCESSING...');
    
    const formData = new FormData();
    formData.append('image', AppState.originalImage);
    formData.append('threshold', elements.thresholdSlider.value);
    
    try {
        const response = await fetch(API.processImage, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            AppState.processedImageData = data.processedImage;
            AppState.processedImageBlob = dataURItoBlob(data.processedImage);
            
            elements.processedPreview.src = data.processedImage;
            elements.processedPreview.classList.remove('hidden');
            elements.pixelatedPlaceholder.classList.add('hidden');
            elements.downloadProcessedBtn.classList.remove('hidden');
            
            AppState.isPhotoProcessed = true;
            elements.countrySelect.disabled = false;
            updateStatus('PROCESSING COMPLETE');
        } else {
            throw new Error(data.error || 'Unknown error');
        }
        
    } catch (error) {
        console.error('Error processing image:', error);
        updateStatus('PROCESSING ERROR');
    } finally {
        showLoading(false);
    }
}

/**
 * Load pre-processed image directly
 */
async function handleDirectLoad() {
    if (!AppState.originalImage) return;
    
    showLoading(true);
    updateStatus('VALIDATING IMAGE...');
    
    const formData = new FormData();
    formData.append('image', AppState.originalImage);
    
    try {
        const response = await fetch(API.processPreprocessedImage, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            AppState.processedImageData = data.processedImage;
            AppState.processedImageBlob = AppState.originalImage;
            
            elements.processedPreview.src = data.processedImage;
            elements.processedPreview.classList.remove('hidden');
            elements.pixelatedPlaceholder.classList.add('hidden');
            elements.downloadProcessedBtn.classList.remove('hidden');
            
            AppState.isPhotoProcessed = true;
            elements.countrySelect.disabled = false;
            updateStatus('PRE-PROCESSED IMAGE VALIDATED');
        } else {
            throw new Error(data.error || 'Unknown error');
        }
        
    } catch (error) {
        console.error('Error validating pre-processed image:', error);
        updateStatus('ERROR: INCORRECT DIMENSIONS');
        alert(`Error: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

/**
 * Download the processed 40x48 pixel image
 */
function handleDownloadProcessed() {
    if (!AppState.processedImageBlob) return;
    
    const link = document.createElement('a');
    
    if (AppState.processedImageBlob instanceof Blob) {
        link.download = `processed_40x48_${Date.now()}.png`;
        link.href = URL.createObjectURL(AppState.processedImageBlob);
    } else {
        link.download = `processed_40x48_${Date.now()}.png`;
        link.href = AppState.processedImageData;
    }
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    if (AppState.processedImageBlob instanceof Blob) {
        URL.revokeObjectURL(link.href);
    }
    
    updateStatus('40x48 IMAGE DOWNLOADED');
}

/**
 * Convert base64 data URI to Blob for file download
 * @param {string} dataURI - Base64 encoded data URI
 * @returns {Blob} - Blob object
 */
function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([ab], { type: mimeString });
}

/**
 * Handle country selection change
 * @param {Event} e - Change event
 */
function handleCountryChange(e) {
    AppState.currentCountry = e.target.value;
    if (AppState.currentCountry) {
        Object.values(elements.fieldInputs).forEach(input => {
            input.disabled = false;
        });
        
        loadCitiesForCountry(AppState.currentCountry);
        
        updateStatus(`${AppState.currentCountry.toUpperCase()} TEMPLATE SELECTED`);
        validateFields();
    }
}

/**
 * Load allowed cities for selected country
 * @param {string} countryCode - Country code
 */
function loadCitiesForCountry(countryCode) {
    const citySelect = elements.fieldInputs.city;
    
    citySelect.innerHTML = '<option value="">-- SELECT --</option>';
    
    const country = AppState.countries[countryCode];
    if (country && country.allowedCities) {
        country.allowedCities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city.toUpperCase();
            citySelect.appendChild(option);
        });
    }
}

/**
 * Validate all form fields and enable/disable generate button
 */
function validateFields() {
    const allFieldsFilled = Object.values(elements.fieldInputs).every(input => {
        return input.value.trim() !== '';
    });
    
    elements.generateBtn.disabled = !(allFieldsFilled && AppState.currentCountry && AppState.isPhotoProcessed);
}

/**
 * Generate passport using backend API
 */
async function handleGeneratePassport() {
    showLoading(true);
    updateStatus('GENERATING DOCUMENT...');
    
    const fields = {
        name: elements.fieldInputs.name.value,
        dob: elements.fieldInputs.dob.value,
        sex: elements.fieldInputs.sex.value,
        city: elements.fieldInputs.city.value,
        number: elements.fieldInputs.number.value,
        expiry: elements.fieldInputs.expiry.value
    };
    
    console.log('Generating passport for country:', AppState.currentCountry);
    console.log('Fields:', fields);
    
    try {
        const response = await fetch(API.generatePassport, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                country: AppState.currentCountry,
                photoData: AppState.processedImageData,
                fields: fields
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            AppState.passportData = data.passportImage;
            
            elements.passportPreview.src = data.passportImage;
            elements.passportPreviewSection.classList.remove('hidden');
            elements.downloadBtn.classList.remove('hidden');
            
            updateStatus('DOCUMENT GENERATED');
        } else {
            throw new Error(data.error || 'Unknown error');
        }
        
    } catch (error) {
        console.error('Error generating passport:', error);
        updateStatus('DOCUMENT GENERATION ERROR');
        alert(`Error: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

/**
 * Handle passport download button click
 * Fades out button and shows support section
 */
function handleDownloadPassport() {
    if (!AppState.passportData) return;
    
    // Add fading class to download button
    elements.downloadBtn.classList.add('fading');
    
    // After fade animation, hide button and show support section
    setTimeout(() => {
        elements.downloadBtn.classList.add('hidden');
        elements.downloadBtn.classList.remove('fading');
        
        // Show support section with smooth expansion
        elements.supportSection.classList.remove('hidden');
    }, 500); // Match the CSS animation duration
}

/**
 * Perform the actual passport download
 * Called from the support section's direct download link
 */
function performDirectDownload() {
    if (!AppState.passportData) return;
    
    const link = document.createElement('a');
    link.download = `passport_${AppState.currentCountry}_${Date.now()}.png`;
    link.href = AppState.passportData;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // After download, you could optionally hide the support section and show the button again
    // Or leave it as is so users can download multiple times
    
    updateStatus('DOCUMENT DOWNLOADED');
}

/**
 * Close passport preview modal
 */
function closePreview() {
    elements.passportPreviewSection.classList.add('hidden');
}

/**
 * Auto-format date input with dots (DD.MM.YYYY)
 * @param {Event} e - Input event
 */
function formatDateInput(e) {
    let value = e.target.value;
    
    value = value.replace(/[^\d]/g, '');
    value = value.substring(0, 8);
    
    if (value.length >= 3) {
        value = value.substring(0, 2) + '.' + value.substring(2);
    }
    if (value.length >= 6) {
        value = value.substring(0, 5) + '.' + value.substring(5);
    }
    
    e.target.value = value;
    validateFields();
}

/**
 * Auto-format passport number input (XXXXX-XXXXX)
 * @param {Event} e - Input event
 */
function formatPassportInput(e) {
    let value = e.target.value;
    
    value = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    value = value.substring(0, 10);
    
    if (value.length > 5) {
        value = value.substring(0, 5) + '-' + value.substring(5);
    }
    
    e.target.value = value;
    validateFields();
}

/**
 * Reset download section to initial state
 */
function resetDownloadSection() {
    elements.supportSection.classList.add('hidden');
    elements.downloadBtn.classList.remove('hidden', 'fading');
}

/**
 * Add retro terminal visual effects
 */
function addTerminalEffects() {
    setInterval(() => {
        const randomElement = document.querySelector('.info-value');
        if (randomElement) {
            randomElement.style.opacity = '0.8';
            setTimeout(() => {
                randomElement.style.opacity = '1';
            }, 100);
        }
    }, 5000);
}