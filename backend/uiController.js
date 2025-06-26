/**
 * Papers, Please - UI Controller Module
 * 
 * Manages all DOM interactions and UI state for the passport generator.
 * Provides a clean interface between the application logic and the HTML elements.
 * 
 * @module UIController
 * @author MOtaMore
 * @license MIT
 */

const UIController = {
    /**
     * DOM element references
     * @type {Object|null}
     */
    elements: null,
    
    /**
     * Initialize DOM element references
     * Should be called after DOM is loaded
     */
    init: function() {
        this.elements = {
            // Upload and processing elements
            imageUpload: document.getElementById('image-upload'),
            uploadZone: document.querySelector('.upload-zone'),
            uploadPrimary: document.querySelector('.upload-primary'),
            thresholdSlider: document.getElementById('threshold'),
            thresholdValue: document.getElementById('threshold-value'),
            processBtn: document.getElementById('process-btn'),
            processStatus: document.getElementById('process-status'),
            
            // Preview elements
            originalPreview: document.getElementById('original-preview'),
            originalPlaceholder: document.getElementById('original-placeholder'),
            pixelatedCanvas: document.getElementById('pixelated-canvas'),
            displayCanvas: document.getElementById('display-canvas'),
            pixelatedPlaceholder: document.getElementById('pixelated-placeholder'),
            
            // Passport form elements
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
            
            // Buttons and final canvas
            generateBtn: document.getElementById('generate-btn'),
            downloadBtn: document.getElementById('download-btn'),
            passportCanvas: document.getElementById('passport-canvas'),
            passportPreviewSection: document.getElementById('passport-preview-section'),
            closePreviewBtn: document.getElementById('close-preview'),
            
            // System elements
            systemDate: document.getElementById('system-date')
        };
    },
    
    /**
     * Update system date display in header
     */
    updateSystemDate: function() {
        const date = new Date();
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        this.elements.systemDate.textContent = `DATE: ${day}/${month}/${year}`;
    },
    
    /**
     * Update system status with animation
     * @param {string} message - Status message to display
     */
    updateStatus: function(message) {
        this.elements.processStatus.textContent = message;
        this.elements.processStatus.style.animation = 'pulse 1s ease-in-out';
        setTimeout(() => {
            this.elements.processStatus.style.animation = '';
        }, 1000);
    },
    
    /**
     * Update threshold slider display value
     * @param {string} value - Threshold value
     */
    updateThresholdValue: function(value) {
        this.elements.thresholdValue.textContent = value;
    },
    
    /**
     * Display original uploaded image
     * @param {string} imageSrc - Image source (data URL)
     * @param {string} fileName - Original file name
     */
    displayOriginalImage: function(imageSrc, fileName) {
        this.elements.originalPreview.src = imageSrc;
        this.elements.originalPreview.classList.remove('hidden');
        this.elements.originalPlaceholder.classList.add('hidden');
        
        // Update upload zone
        this.elements.uploadPrimary.textContent = fileName.toUpperCase();
        this.elements.uploadZone.classList.add('has-file');
    },
    
    /**
     * Display processed pixelated image
     * @param {HTMLCanvasElement} processedCanvas - Canvas with processed image
     */
    displayProcessedImage: function(processedCanvas) {
        // Update small canvas
        const ctx = this.elements.pixelatedCanvas.getContext('2d');
        ctx.clearRect(0, 0, CONFIG.photo.width, CONFIG.photo.height);
        ctx.drawImage(processedCanvas, 0, 0);
        this.elements.pixelatedCanvas.classList.remove('hidden');
        
        // Update display canvas
        const displayCtx = this.elements.displayCanvas.getContext('2d');
        displayCtx.imageSmoothingEnabled = false;
        displayCtx.clearRect(0, 0, this.elements.displayCanvas.width, this.elements.displayCanvas.height);
        displayCtx.drawImage(
            processedCanvas,
            0, 0,
            CONFIG.photo.width,
            CONFIG.photo.height,
            0, 0,
            this.elements.displayCanvas.width,
            this.elements.displayCanvas.height
        );
        
        this.elements.displayCanvas.classList.remove('hidden');
        this.elements.pixelatedPlaceholder.classList.add('hidden');
    },
    
    /**
     * Display generated passport
     * @param {HTMLCanvasElement} passportCanvas - Canvas with passport image
     */
    displayPassport: function(passportCanvas) {
        const ctx = this.elements.passportCanvas.getContext('2d');
        ctx.clearRect(0, 0, this.elements.passportCanvas.width, this.elements.passportCanvas.height);
        ctx.drawImage(passportCanvas, 0, 0);
        
        this.elements.passportPreviewSection.classList.remove('hidden');
        this.elements.downloadBtn.classList.remove('hidden');
    },
    
    /**
     * Close passport preview modal
     */
    closePreview: function() {
        this.elements.passportPreviewSection.classList.add('hidden');
    },
    
    /**
     * Enable or disable process button
     * @param {boolean} enabled - Whether to enable the button
     */
    enableProcessButton: function(enabled) {
        this.elements.processBtn.disabled = !enabled;
    },
    
    /**
     * Enable or disable country selector
     * @param {boolean} enabled - Whether to enable the selector
     */
    enableCountrySelect: function(enabled) {
        this.elements.countrySelect.disabled = !enabled;
    },
    
    /**
     * Enable or disable all form fields
     * @param {boolean} enabled - Whether to enable the fields
     */
    enableFields: function(enabled) {
        Object.values(this.elements.fieldInputs).forEach(input => {
            input.disabled = !enabled;
        });
    },
    
    /**
     * Enable or disable generate button
     * @param {boolean} enabled - Whether to enable the button
     */
    enableGenerateButton: function(enabled) {
        this.elements.generateBtn.disabled = !enabled;
    },
    
    /**
     * Get all field data values
     * @returns {Object} Field values
     */
    getFieldData: function() {
        return {
            name: this.elements.fieldInputs.name.value,
            dob: this.elements.fieldInputs.dob.value,
            sex: this.elements.fieldInputs.sex.value,
            city: this.elements.fieldInputs.city.value,
            number: this.elements.fieldInputs.number.value,
            expiry: this.elements.fieldInputs.expiry.value
        };
    },
    
    /**
     * Check if all fields are filled
     * @returns {boolean} True if all fields have values
     */
    areFieldsValid: function() {
        return Object.values(this.elements.fieldInputs).every(input => {
            return input.value.trim() !== '';
        });
    },
    
    /**
     * Get selected country code
     * @returns {string} Selected country code
     */
    getSelectedCountry: function() {
        return this.elements.countrySelect.value;
    },
    
    /**
     * Add retro terminal visual effects
     * Creates random flicker effect on info values
     */
    addTerminalEffects: function() {
        // Random flicker effect
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
};