/**
 * Papers, Please - Passport Document Generator
 * 
 * Generates pixel-perfect passport documents in the style of Papers, Please.
 * Combines passport templates, processed photos, and text fields to create
 * authentic-looking travel documents.
 * 
 * @module passportGenerator
 * @author MOtaMore
 * @license MIT
 */

const sharp = require('sharp');
const Jimp = require('jimp');
const path = require('path');
const fs = require('fs').promises;
const config = require('./config');
const pixelFont = require('./pixelFont');

module.exports = {
    /**
     * Template cache to avoid reloading images
     * @type {Map}
     */
    templateCache: new Map(),
    
    /**
     * Initialize the font system
     * @returns {Promise<void>}
     */
    async initializeFont() {
        console.log('Pixel font system initialized');
    },
    
    /**
     * Generate a complete passport document
     * @param {string} countryCode - Country code (e.g., 'arstotzka')
     * @param {string} photoBase64 - Base64 encoded photo data
     * @param {Object} fieldData - Passport field values
     * @returns {Promise<Buffer>} Generated passport image buffer
     */
    generatePassport: async function(countryCode, photoBase64, fieldData) {
        try {
            console.log('Generating passport for country:', countryCode);
            
            const scale = config.passport.exportScale;
            const baseWidth = config.passport.template.width;
            const baseHeight = config.passport.template.height;
            
            // Convert base64 photo to buffer
            const photoBuffer = Buffer.from(
                photoBase64.replace(/^data:image\/\w+;base64,/, ''), 
                'base64'
            );
            
            // Load country template at BASE SIZE
            let templateImage;
            const templatePath = path.join(
                __dirname, 
                '..', 
                'public', 
                'imgs',
                `${config.passport.templatePrefix}${countryCode}${config.passport.templateExtension}`
            );
            
            try {
                // Load template at original size
                templateImage = await Jimp.read(templatePath);
            } catch (error) {
                console.log(`Template not found for ${countryCode}, generating generic template`);
                templateImage = await this.generateGenericTemplate(countryCode);
            }
            
            // Ensure template is at base size
            if (templateImage.bitmap.width !== baseWidth || templateImage.bitmap.height !== baseHeight) {
                templateImage.resize(baseWidth, baseHeight, Jimp.RESIZE_NEAREST_NEIGHBOR);
            }
            
            // Load and process photo at correct size (40x48)
            const photoImage = await Jimp.read(photoBuffer);
            
            // Resize photo to exact size from config
            photoImage.resize(
                config.passport.photo.width, 
                config.passport.photo.height,
                Jimp.RESIZE_BILINEAR_INTERPOLATION
            );
            
            // Calculate photo position at BASE SIZE with country code
            const photoPosition = this.calculatePhotoPosition(1, countryCode); // scale = 1 for base size
            
            console.log(`Positioning photo at: x=${photoPosition.x}, y=${photoPosition.y} for ${countryCode}`);
            
            // Composite photo onto template
            templateImage.composite(photoImage, photoPosition.x, photoPosition.y);
            
            // Add text at BASE SIZE
            await this.drawPassportText(templateImage, countryCode, fieldData);
            
            // NOW scale the complete image to final size
            templateImage.resize(
                baseWidth * scale, 
                baseHeight * scale,
                Jimp.RESIZE_NEAREST_NEIGHBOR
            );
            
            // Convert to PNG buffer
            const finalBuffer = await templateImage.getBufferAsync(Jimp.MIME_PNG);
            
            return finalBuffer;
            
        } catch (error) {
            console.error('Error in generatePassport:', error);
            throw new Error('Error generating passport');
        }
    },
    
    /**
     * Calculate photo position for specific country
     * @param {number} scale - Scale factor
     * @param {string} countryCode - Country code
     * @returns {Object} Position coordinates { x, y }
     */
    calculatePhotoPosition: function(scale, countryCode) {
        // Get country-specific configuration
        const country = config.countries[countryCode];
        
        // Validate country exists
        if (!country || !country.photoPosition) {
            console.error(`Country not found or missing photo position: ${countryCode}`);
            // Use default values (approximate center)
            return {
                x: Math.round(45 * scale),
                y: Math.round(57 * scale)
            };
        }
        
        // Use absolute coordinates (x, y from top-left corner)
        const position = {
            x: Math.round(country.photoPosition.x * scale),
            y: Math.round(country.photoPosition.y * scale)
        };
        
        console.log(`Calculated position for ${countryCode}: x=${position.x}, y=${position.y} (scale=${scale})`);
        
        return position;
    },
    
    /**
     * Draw text fields on passport
     * @param {Object} image - Jimp image object
     * @param {string} countryCode - Country code
     * @param {Object} fieldData - Field values to draw
     * @returns {Promise<void>}
     */
    drawPassportText: async function(image, countryCode, fieldData) {
        const country = config.countries[countryCode];
        if (!country || !country.fields) return;
        
        const fields = country.fields;
        // Normal text color (used for name)
        const normalTextColor = this.hexToInt(config.colors.dark);
        
        // Special color for certain Obristan fields
        let specialFieldsColor;
        if (countryCode === 'obristan') {
            specialFieldsColor = this.hexToInt('#efe4dd'); // Light color for specific Obristan fields
            console.log('Using special color for Obristan fields:', '#efe4dd');
        } else {
            specialFieldsColor = normalTextColor; // Normal color for other countries
        }
        
        console.log('Drawing passport text for:', countryCode);
        console.log('Field data:', fieldData);
        
        // Name (ALWAYS with normal color)
        if (fields.name && fieldData.name) {
            const formattedName = this.formatName(fieldData.name);
            console.log('Formatted name:', formattedName);
            this.drawPixelText(
                image,
                fields.name.x,
                fields.name.y - 8,
                formattedName.substring(0, fields.name.maxLength),
                normalTextColor // ALWAYS normal color for name
            );
        }
        
        // Date of birth (WITH special color for Obristan)
        if (fields.dob && fieldData.dob) {
            const dob = this.formatDate(fieldData.dob);
            console.log('Formatted DOB:', dob);
            this.drawPixelText(
                image,
                fields.dob.x,
                fields.dob.y - 8,
                dob.substring(0, fields.dob.maxLength),
                specialFieldsColor
            );
        }
        
        // Sex (WITH special color for Obristan)
        if (fields.sex && fieldData.sex) {
            this.drawPixelText(
                image,
                fields.sex.x,
                fields.sex.y - 8,
                fieldData.sex.toUpperCase(),
                specialFieldsColor
            );
        }
        
        // City (WITH special color for Obristan)
        if (fields.city && fieldData.city) {
            this.drawPixelText(
                image,
                fields.city.x,
                fields.city.y - 8,
                fieldData.city.substring(0, fields.city.maxLength),
                specialFieldsColor
            );
        }
        
        // ID Number (WITH special color for Obristan)
        if (fields.number && fieldData.number) {
            const formattedNumber = this.formatPassportNumber(fieldData.number);
            console.log('Formatted number:', formattedNumber);
            
            // Check if right-aligned
            if (fields.number.align === 'right') {
                // Calculate text width for right alignment
                const tempText = pixelFont.renderText(formattedNumber, specialFieldsColor);
                const textWidth = tempText.bitmap.width;
                const xPosition = fields.number.x - textWidth;
                
                this.drawPixelText(
                    image,
                    xPosition,
                    fields.number.y - 8,
                    formattedNumber,
                    specialFieldsColor
                );
            } else {
                this.drawPixelText(
                    image,
                    fields.number.x,
                    fields.number.y - 8,
                    formattedNumber,
                    specialFieldsColor
                );
            }
        }
        
        // Expiry date (WITH special color for Obristan)
        if (fields.expiry && fieldData.expiry) {
            const expiry = this.formatDate(fieldData.expiry);
            console.log('Formatted expiry:', expiry);
            this.drawPixelText(
                image,
                fields.expiry.x,
                fields.expiry.y - 8,
                expiry.substring(0, fields.expiry.maxLength),
                specialFieldsColor
            );
        }
    },
    
    /**
     * Draw text using custom pixel font
     * @param {Object} image - Jimp image object
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {string} text - Text to draw
     * @param {number} color - Color value for Jimp
     */
    drawPixelText: function(image, x, y, text, color) {
        // Render text using our pixel font
        const textImage = pixelFont.renderText(text, color);
        
        // Composite onto main image
        image.composite(textImage, Math.round(x), Math.round(y));
    },
    
    /**
     * Convert hex color to Jimp integer format
     * @param {string} hex - Hex color (e.g., "#625252")
     * @returns {number} Jimp color integer
     */
    hexToInt: function(hex) {
        // Convert #625252 to 0xRRGGBBFF format
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return Jimp.rgbaToInt(r, g, b, 255);
    },
    
    /**
     * Format name to SURNAME, FIRSTNAME format
     * @param {string} nameInput - Input name
     * @returns {string} Formatted name
     */
    formatName: function(nameInput) {
        // If already has comma, assume correct format
        if (nameInput.includes(',')) {
            return nameInput;
        }
        
        // If no comma, try to split by last space
        const parts = nameInput.trim().split(' ');
        if (parts.length >= 2) {
            const lastName = parts[parts.length - 1];
            const firstName = parts.slice(0, -1).join(' ');
            return `${lastName}, ${firstName}`;
        }
        
        // If only one word, return as is
        return nameInput;
    },
    
    /**
     * Format passport number to XXXXX-XXXXX format
     * @param {string} numberInput - Input passport number
     * @returns {string} Formatted number
     */
    formatPassportNumber: function(numberInput) {
        // Remove non-alphanumeric characters
        const cleaned = numberInput.toUpperCase().replace(/[^A-Z0-9]/g, '');
        
        // Ensure minimum length
        if (cleaned.length < 8) {
            console.warn('Passport number too short:', cleaned);
        }
        
        // Take maximum 10 characters
        const truncated = cleaned.substring(0, 10);
        
        // Insert hyphen after 5th character
        if (truncated.length > 5) {
            return truncated.substring(0, 5) + '-' + truncated.substring(5);
        }
        
        return truncated;
    },
    
    /**
     * Format date to DD.MM.YYYY format
     * @param {string} dateInput - Input date
     * @returns {string} Formatted date
     */
    formatDate: function(dateInput) {
        // If already in correct format with dots, return it
        if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateInput)) {
            return dateInput;
        }
        
        // If has other separators, try to convert
        const parts = dateInput.split(/[-\/\.]/);
        if (parts.length === 3) {
            const day = parts[0].padStart(2, '0');
            const month = parts[1].padStart(2, '0');
            const year = parts[2];
            return `${day}.${month}.${year}`;
        }
        
        // If just numbers, try to format
        const numbers = dateInput.replace(/\D/g, '');
        if (numbers.length >= 8) {
            return `${numbers.substr(0,2)}.${numbers.substr(2,2)}.${numbers.substr(4,4)}`;
        }
        
        // Return as is if cannot format
        return dateInput;
    },
    
    /**
     * Generate a generic passport template if file doesn't exist
     * @param {string} countryCode - Country code
     * @returns {Promise<Object>} Jimp image object
     */
    generateGenericTemplate: async function(countryCode) {
        const country = config.countries[countryCode];
        if (!country) {
            throw new Error(`Country not configured: ${countryCode}`);
        }
        
        const width = config.passport.template.width;
        const height = config.passport.template.height;
        
        // Create base image with paper color
        const paperColor = this.hexToInt('#d4c8be');
        const image = new Jimp(width, height, paperColor);
        
        // Country color
        const countryColor = this.hexToInt(country.color);
        
        // Draw border (2px)
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                if (x < 2 || x >= width - 2 || y < 2 || y >= height - 2) {
                    image.setPixelColor(countryColor, x, y);
                }
            }
        }
        
        // Decorative line
        for (let x = 10; x < width - 10; x++) {
            image.setPixelColor(countryColor, x, 20);
        }
        
        // Add country title
        const titleText = pixelFont.renderText(country.name, countryColor);
        image.composite(
            titleText,
            Math.floor((width - country.name.length * 6) / 2),
            5
        );
        
        // Add field labels with country-specific colors
        const fields = country.fields;
        
        // Special label color for Obristan
        let labelColor;
        if (countryCode === 'obristan') {
            labelColor = this.hexToInt('#efe4dd'); // Light color for Obristan
        } else {
            labelColor = this.hexToInt('#2c2e2a'); // Dark color for all others
        }
        
        this.drawPixelText(image, 5, fields.dob.y - 8, 'DOB:', labelColor);
        this.drawPixelText(image, 5, fields.sex.y - 8, 'SEX:', labelColor);
        this.drawPixelText(image, 5, fields.city.y - 8, 'ISS:', labelColor);
        this.drawPixelText(image, 5, fields.expiry.y - 8, 'EXP:', labelColor);
        
        // Add simple seal as rectangle
        const sealSize = 15;
        const sealX = width - 25;
        const sealY = height - 25;
        
        for (let x = sealX; x < sealX + sealSize && x < width; x++) {
            for (let y = sealY; y < sealY + sealSize && y < height; y++) {
                if (x >= 0 && y >= 0) {
                    image.setPixelColor(countryColor, x, y);
                }
            }
        }
        
        return image;
    },
    
    /**
     * Clear template cache
     */
    clearCache: function() {
        this.templateCache.clear();
    }
};