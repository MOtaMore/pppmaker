/**
 * Papers, Please - Image Processing Module
 * 
 * Handles the conversion of regular photos into pixelated Papers, Please style images.
 * Supports both automatic processing and validation of pre-processed images.
 * 
 * @module imageProcessor
 * @author MOtaMore
 * @license MIT
 */

const sharp = require('sharp');
const config = require('./config');

module.exports = {
    /**
     * Process an image to Papers, Please pixelated format
     * @param {Buffer} imageBuffer - Input image buffer
     * @param {number} threshold - Brightness threshold for pixel conversion (0-1)
     * @returns {Promise<Buffer>} Processed image buffer in PNG format
     */
    processImage: async function(imageBuffer, threshold = 0.5) {
        try {
            console.log('Starting image processing...');
            console.log('Buffer size:', imageBuffer.length);
            
            const photoWidth = config.passport.photo.width;
            const photoHeight = config.passport.photo.height;
            
            console.log(`Resizing to: ${photoWidth}x${photoHeight}`);
            
            // Resize image to 40x48 pixels
            const resizedImage = await sharp(imageBuffer)
                .resize(photoWidth, photoHeight, {
                    fit: 'cover',
                    position: 'center'
                })
                .raw()
                .toBuffer({ resolveWithObject: true });
            
            console.log('Image resized, applying palette...');
            
            // Apply Papers Please color palette
            const processedPixels = this.applyPapersPleasePalette(
                resizedImage.data,
                resizedImage.info,
                threshold
            );
            
            console.log('Palette applied, generating final image...');
            
            // Create final PNG image
            const finalImage = await sharp(processedPixels, {
                raw: {
                    width: photoWidth,
                    height: photoHeight,
                    channels: 4
                }
            })
            .png({
                compressionLevel: config.processing.pngCompressionLevel
            })
            .toBuffer();
            
            console.log('Image processed successfully');
            return finalImage;
            
        } catch (error) {
            console.error('Detailed error in processImage:', error);
            console.error('Stack trace:', error.stack);
            throw new Error(`Error processing image: ${error.message}`);
        }
    },

    /**
     * Process a pre-processed image (validate dimensions and convert to PNG)
     * @param {Buffer} imageBuffer - Pre-processed image buffer
     * @returns {Promise<Buffer>} Validated image buffer in PNG format
     */
    processPreprocessedImage: async function(imageBuffer) {
        try {
            console.log('Processing pre-processed image...');
            console.log('Buffer size:', imageBuffer.length);
            
            const photoWidth = config.passport.photo.width;
            const photoHeight = config.passport.photo.height;
            
            // Check image metadata
            const metadata = await sharp(imageBuffer).metadata();
            console.log('Pre-processed image metadata:', metadata);
            
            // Validate exact dimensions
            if (metadata.width !== photoWidth || metadata.height !== photoHeight) {
                throw new Error(`Image must be exactly ${photoWidth}x${photoHeight} pixels. Current size: ${metadata.width}x${metadata.height}`);
            }
            
            // Convert to PNG with configured compression
            const finalImage = await sharp(imageBuffer)
                .png({
                    compressionLevel: config.processing.pngCompressionLevel
                })
                .toBuffer();
            
            console.log('Pre-processed image validated and converted successfully');
            return finalImage;
            
        } catch (error) {
            console.error('Error in processPreprocessedImage:', error);
            throw new Error(`Error processing pre-processed image: ${error.message}`);
        }
    },
    
    /**
     * Apply Papers Please two-color palette to image pixels
     * @param {Buffer} pixelData - Raw pixel data
     * @param {Object} imageInfo - Image metadata (width, height, channels)
     * @param {number} threshold - Brightness threshold for color selection
     * @returns {Buffer} Processed pixel data in RGBA format
     */
    applyPapersPleasePalette: function(pixelData, imageInfo, threshold) {
        try {
            console.log('Applying Papers Please palette...');
            console.log('Image info:', imageInfo);
            
            const { width, height, channels } = imageInfo;
            const lightColor = this.hexToRGB(config.colors.light);
            const darkColor = this.hexToRGB(config.colors.dark);
            
            console.log('Colors:', { lightColor, darkColor });
            console.log(`Processing ${width}x${height} with ${channels} channels`);
            
            // Create new buffer for processed pixels
            const processedData = Buffer.alloc(width * height * 4); // RGBA
            
            // Process each pixel
            for (let i = 0; i < pixelData.length; i += channels) {
                // Calculate brightness (luminance)
                const r = pixelData[i];
                const g = pixelData[i + 1];
                const b = pixelData[i + 2];
                const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                
                // Output buffer index (always RGBA)
                const outputIndex = (i / channels) * 4;
                
                if (brightness > threshold) {
                    // Use light color
                    processedData[outputIndex] = lightColor.r;
                    processedData[outputIndex + 1] = lightColor.g;
                    processedData[outputIndex + 2] = lightColor.b;
                } else {
                    // Use dark color
                    processedData[outputIndex] = darkColor.r;
                    processedData[outputIndex + 1] = darkColor.g;
                    processedData[outputIndex + 2] = darkColor.b;
                }
                
                // Alpha channel
                processedData[outputIndex + 3] = channels === 4 ? pixelData[i + 3] : 255;
            }
            
            console.log('Palette applied successfully');
            return processedData;
            
        } catch (error) {
            console.error('Error in applyPapersPleasePalette:', error);
            throw error;
        }
    },
    
    /**
     * Convert hex color to RGB object
     * @param {string} hex - Hex color code (e.g., "#625252")
     * @returns {Object} RGB values { r, g, b }
     */
    hexToRGB: function(hex) {
        try {
            // Validate hex format
            if (!hex || typeof hex !== 'string' || !hex.startsWith('#') || hex.length !== 7) {
                throw new Error(`Invalid hex format: ${hex}`);
            }
            
            return {
                r: parseInt(hex.slice(1, 3), 16),
                g: parseInt(hex.slice(3, 5), 16),
                b: parseInt(hex.slice(5, 7), 16)
            };
        } catch (error) {
            console.error('Error converting hex to RGB:', error);
            throw error;
        }
    },
    
    /**
     * Validate image format and size
     * @param {Buffer} imageBuffer - Image buffer to validate
     * @returns {Promise<boolean>} True if valid
     * @throws {Error} If validation fails
     */
    validateImage: async function(imageBuffer) {
        try {
            console.log('Validating image...');
            
            // Check buffer is not empty
            if (!imageBuffer || imageBuffer.length === 0) {
                throw new Error('Empty image buffer');
            }
            
            const metadata = await sharp(imageBuffer).metadata();
            console.log('Image metadata:', metadata);
            
            // Check format
            if (!config.processing.allowedFormats.includes(metadata.format)) {
                throw new Error(`Image format not allowed: ${metadata.format}. Allowed formats: ${config.processing.allowedFormats.join(', ')}`);
            }
            
            // Check file size
            const sizeInMB = imageBuffer.length / (1024 * 1024);
            if (sizeInMB > config.processing.maxFileSize) {
                throw new Error(`Image exceeds maximum size of ${config.processing.maxFileSize}MB (current: ${sizeInMB.toFixed(2)}MB)`);
            }
            
            console.log('Image validated successfully');
            return true;
        } catch (error) {
            console.error('Validation error:', error);
            throw error;
        }
    },

    /**
     * Validate pre-processed image (check exact dimensions)
     * @param {Buffer} imageBuffer - Pre-processed image buffer
     * @returns {Promise<boolean>} True if valid
     * @throws {Error} If validation fails
     */
    validatePreprocessedImage: async function(imageBuffer) {
        try {
            console.log('Validating pre-processed image...');
            
            // Basic validation
            await this.validateImage(imageBuffer);
            
            const metadata = await sharp(imageBuffer).metadata();
            const photoWidth = config.passport.photo.width;
            const photoHeight = config.passport.photo.height;
            
            // Check exact dimensions
            if (metadata.width !== photoWidth || metadata.height !== photoHeight) {
                throw new Error(`Pre-processed image must be exactly ${photoWidth}x${photoHeight} pixels. Current size: ${metadata.width}x${metadata.height}`);
            }
            
            console.log('Pre-processed image validated successfully');
            return true;
        } catch (error) {
            console.error('Pre-processed image validation error:', error);
            throw error;
        }
    },
    
    /**
     * Debug helper to log image information
     * @param {Buffer} imageBuffer - Image buffer to analyze
     * @returns {Promise<Object>} Image metadata
     */
    debugImageInfo: async function(imageBuffer) {
        try {
            const metadata = await sharp(imageBuffer).metadata();
            console.log('=== DEBUG IMAGE INFO ===');
            console.log('Format:', metadata.format);
            console.log('Dimensions:', metadata.width, 'x', metadata.height);
            console.log('Channels:', metadata.channels);
            console.log('Buffer size:', imageBuffer.length, 'bytes');
            console.log('========================');
            return metadata;
        } catch (error) {
            console.error('Error getting image info:', error);
            throw error;
        }
    }
};