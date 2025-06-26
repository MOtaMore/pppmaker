/**
 * Papers, Please - Passport Generator Server
 * 
 * Express.js backend server that handles image processing and passport generation.
 * Provides REST API endpoints for the frontend application.
 * 
 * @author MOtaMore
 * @license MIT
 */

const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Import backend modules
 */
const imageProcessor = require('./backend/imageProcessor');
const passportGenerator = require('./backend/passportGenerator');
const config = require('./backend/config');

/**
 * Middleware configuration
 */
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

/**
 * Configure multer for image uploads
 * Stores images in memory with size and type restrictions
 */
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB maximum
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

/**
 * API Routes
 */

/**
 * POST /api/process-image
 * Process an image using automatic pixelation
 * @param {File} image - Image file to process
 * @param {number} threshold - Brightness threshold (0.1-0.9)
 * @returns {Object} Processed image in base64 format
 */
app.post('/api/process-image', upload.single('image'), async (req, res) => {
    try {
        console.log('=== AUTOMATIC PROCESSING ===');
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No image received'
            });
        }

        console.log('File received:', {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });

        // Validate image
        await imageProcessor.validateImage(req.file.buffer);

        // Get threshold from request
        const threshold = parseFloat(req.body.threshold) || 0.5;
        console.log('Processing threshold:', threshold);
        
        // Process image using imageProcessor module
        const processedImage = await imageProcessor.processImage(req.file.buffer, threshold);
        
        // Convert to base64 for frontend
        const base64Image = `data:image/png;base64,${processedImage.toString('base64')}`;
        
        res.json({ 
            success: true, 
            processedImage: base64Image,
            originalName: req.file.originalname,
            processedSize: processedImage.length,
            mode: 'automatic'
        });
        
    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).json({ 
            success: false,
            error: error.message || 'Error processing image'
        });
    }
});

/**
 * POST /api/process-preprocessed-image
 * Process a pre-processed image (validate dimensions and format)
 * @param {File} image - Pre-processed 40x48 image
 * @returns {Object} Validated image in base64 format
 */
app.post('/api/process-preprocessed-image', upload.single('image'), async (req, res) => {
    try {
        console.log('=== PRE-PROCESSED IMAGE PROCESSING ===');
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No image received'
            });
        }

        console.log('Pre-processed file received:', {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });

        // Validate pre-processed image (exact dimensions)
        await imageProcessor.validatePreprocessedImage(req.file.buffer);

        // Process pre-processed image (validate and convert to PNG)
        const processedImage = await imageProcessor.processPreprocessedImage(req.file.buffer);

        // Convert to base64
        const base64Image = `data:image/png;base64,${processedImage.toString('base64')}`;

        res.json({
            success: true,
            processedImage: base64Image,
            originalName: req.file.originalname,
            processedSize: processedImage.length,
            mode: 'preprocessed'
        });

    } catch (error) {
        console.error('Error processing pre-processed image:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error processing pre-processed image'
        });
    }
});

/**
 * POST /api/generate-passport
 * Generate a complete passport document
 * @param {string} country - Country code
 * @param {string} photoData - Base64 encoded photo
 * @param {Object} fields - Passport field values
 * @returns {Object} Generated passport image in base64 format
 */
app.post('/api/generate-passport', async (req, res) => {
    try {
        console.log('=== PASSPORT GENERATION ===');
        
        const { country, photoData, fields } = req.body;
        
        if (!country || !photoData || !fields) {
            return res.status(400).json({ 
                success: false,
                error: 'Missing required data (country, photoData, fields)'
            });
        }

        console.log('Generating passport:', {
            country: country,
            fieldsReceived: Object.keys(fields)
        });
        
        // Generate passport
        const passportImage = await passportGenerator.generatePassport(
            country,
            photoData,
            fields
        );
        
        // Convert to base64
        const base64Passport = `data:image/png;base64,${passportImage.toString('base64')}`;
        
        res.json({ 
            success: true, 
            passportImage: base64Passport,
            country: country,
            generatedAt: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error generating passport:', error);
        res.status(500).json({ 
            success: false,
            error: error.message || 'Error generating passport'
        });
    }
});

/**
 * GET /api/countries
 * Get available countries and their configurations
 * @returns {Object} Country configurations
 */
app.get('/api/countries', (req, res) => {
    res.json({
        success: true,
        countries: config.countries
    });
});

/**
 * GET /api/check-templates
 * Check which passport templates are available
 * @returns {Object} List of available template files
 */
app.get('/api/check-templates', async (req, res) => {
    try {
        const templatesDir = path.join(__dirname, 'public', 'imgs');
        const files = await fs.readdir(templatesDir);
        
        const templates = files
            .filter(file => file.startsWith('passport_') && file.endsWith('.png'))
            .map(file => file.replace('passport_', '').replace('.png', ''));
        
        res.json({
            success: true,
            availableTemplates: templates
        });
    } catch (error) {
        console.error('Error checking templates:', error);
        res.json({
            success: true,
            availableTemplates: []
        });
    }
});

/**
 * GET /api/health
 * Health check endpoint
 * @returns {Object} Server status information
 */
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true,
        status: 'OK', 
        service: 'Papers Please Passport Generator',
        version: '2.3',
        features: ['automatic-processing', 'preprocessed-images'],
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/debug/image-info
 * Debug endpoint for image metadata (optional - remove in production)
 * @param {File} image - Image to analyze
 * @returns {Object} Image metadata
 */
app.get('/api/debug/image-info', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image received' });
        }
        
        const metadata = await imageProcessor.debugImageInfo(req.file.buffer);
        res.json({
            success: true,
            metadata: metadata
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Global error handler
 * Catches multer errors and other unhandled errors
 */
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                success: false,
                error: 'File is too large (maximum 10MB)' 
            });
        }
        return res.status(400).json({
            success: false,
            error: `Upload error: ${error.message}`
        });
    }
    
    res.status(500).json({ 
        success: false,
        error: error.message || 'Internal server error'
    });
});

/**
 * GET /
 * Serve the main application
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * Start the server
 */
app.listen(PORT, async () => {
    // Initialize font system for passports
    await passportGenerator.initializeFont();
    
    console.log(`
╔════════════════════════════════════════════╗
║   MINISTRY OF ADMISSION - ARSTOTZKA        ║
║   Passport System v2.3                     ║
║   Server running on port ${PORT}              ║
║   http://localhost:${PORT}                    ║
║                                            ║
║   Features:                                ║
║   ✓ Automatic processing                   ║
║   ✓ Pre-processed images (40x48)           ║
║   ✓ Processed image download               ║
║   ✓ Passport generation                    ║
╚════════════════════════════════════════════╝
    `);
});