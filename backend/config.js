/**
 * Papers, Please - Passport Generator Configuration
 * 
 * Central configuration file for the passport generation system.
 * Contains color schemes, dimensions, country data, and processing settings.
 * 
 * @module config
 * @author MOtaMore
 * @license MIT
 */

module.exports = {
    /**
     * System color palette
     * Based on the original Papers, Please game aesthetic
     */
    colors: {
        light: '#ac9f9b',  // Light pixel color for photos
        dark: '#625252'    // Dark pixel color for photos and text
    },
    
    /**
     * Passport document specifications
     */
    passport: {
        // Base template dimensions (pixels)
        template: {
            width: 130,
            height: 162
        },
        
        // Photo dimensions for processing
        photo: {
            width: 40,
            height: 48
        },
        
        // Export scale factor (600% for high quality output)
        exportScale: 6,
        
        // File naming conventions
        templatePrefix: 'passport_',
        templateExtension: '.png'
    },
    
    /**
     * Country configurations
     * Each country has unique colors, positions, and allowed cities
     */
    countries: {
        antegria: {
            name: 'ANTEGRIA',
            displayName: 'Antegria',
            color: '#483d8b',
            seal: '●',
            textColor: '#2c2e2a',
            // Absolute photo position (x, y from top-left corner)
            photoPosition: {
                x: 83,
                y: 88
            },
            fields: {
                name: { x: 8, y: 146, maxLength: 20 },
                dob: { x: 25, y: 108, maxLength: 10 },
                sex: { x: 25, y: 117, maxLength: 1 },
                city: { x: 25, y: 126, maxLength: 15 },
                number: { x: 121, y: 155, maxLength: 10, align: 'right' },
                expiry: { x: 25, y: 135, maxLength: 10 }
            },
            allowedCities: ['St. Marmero', 'Glorian', 'Outer Grouse']
        },
        arstotzka: {
            name: 'ARSTOTZKA',
            displayName: 'Arstotzka',
            color: '#8b2635',
            seal: '★',
            textColor: '#2c2e2a',
            photoPosition: {
                x: 8,
                y: 98
            },
            fields: {
                name: { x: 8, y: 95, maxLength: 20 },
                dob: { x: 66, y: 105, maxLength: 10 },
                sex: { x: 66, y: 113, maxLength: 1 },
                city: { x: 66, y: 121, maxLength: 15 },
                number: { x: 8, y: 155, maxLength: 9 },
                expiry: { x: 66, y: 129, maxLength: 10 }
            },
            allowedCities: ['Orvech Vonor', 'East Grestin', 'Paradizna']
        },
        impor: {
            name: 'IMPOR',
            displayName: 'Impor',
            color: '#8b4513',
            seal: '■',
            textColor: '#2c2e2a',
            photoPosition: {
                x: 9,
                y: 96
            },
            fields: {
                name: { x: 8, y: 93, maxLength: 20 },
                dob: { x: 70, y: 103, maxLength: 10 },
                sex: { x: 70, y: 111, maxLength: 1 },
                city: { x: 70, y: 119, maxLength: 15 },
                number: { x: 66, y: 153, maxLength: 9 },
                expiry: { x: 70, y: 127, maxLength: 10 }
            },
            allowedCities: ['Enkyo', 'Haihan', 'Tsunkeido']
        },
        kolechia: {
            name: 'KOLECHIA',
            displayName: 'Kolechia',
            color: '#2c5aa0',
            seal: '▲',
            textColor: '#2c2e2a',
            photoPosition: {
                x: 8,
                y: 106
            },
            fields: {
                name: { x: 8, y: 105, maxLength: 20 },
                dob: { x: 69, y: 114, maxLength: 10 },
                sex: { x: 69, y: 122, maxLength: 1 },
                city: { x: 69, y: 130, maxLength: 15 },
                number: { x: 68, y: 155, maxLength: 9 },
                expiry: { x: 69, y: 138 , maxLength: 10 }
            },
            allowedCities: ['Yurko City', 'Vedor', 'West Grestin']
        },
        obristan: {
            name: 'OBRISTAN',
            displayName: 'Obristan',
            color: '#efe4dd',
            seal: '◆',
            textColor: '#2c2e2a',
            photoPosition: {
                x: 84,
                y: 107
            },
            fields: {
                name: { x: 8, y: 106, maxLength: 20 },
                dob: { x: 27, y: 118, maxLength: 10 },
                sex: { x: 27, y: 126, maxLength: 1 },
                city: { x: 27, y: 134, maxLength: 15 },
                number: { x: 10, y: 155, maxLength: 9 },
                expiry: { x: 27, y: 142, maxLength: 10 }
            },
            allowedCities: ['Skal', 'Lorndaz', 'Mergerous']
        },
        republia: {
            name: 'REPUBLIA',
            displayName: 'Republia',
            color: '#b8860b',
            seal: '▼',
            textColor: '#2c2e2a',
            photoPosition: {
                x: 85,
                y: 96
            },
            fields: {
                name: { x: 8, y: 94, maxLength: 20 },
                dob: { x: 27, y: 105, maxLength: 10 },
                sex: { x: 27, y: 113, maxLength: 1 },
                city: { x: 27, y: 121, maxLength: 15 },
                number: { x: 67, y: 155, maxLength: 9 },
                expiry: { x: 27, y: 129, maxLength: 10 }
            },
            allowedCities: ['True Glorian', 'Lesrenadi', 'Bostan']
        },
        united_federation: {
            name: 'UNITED FEDERATION',
            displayName: 'United Federation',
            color: '#2f4f4f',
            seal: '✦',
            textColor: '#2c2e2a',
            photoPosition: {
                x: 8,
                y: 106
            },
            fields: {
                name: { x: 8, y: 105, maxLength: 20 },
                dob: { x: 69, y: 113, maxLength: 10 },
                sex: { x: 69, y: 121, maxLength: 1 },
                city: { x: 69, y: 129, maxLength: 15 },
                number: { x: 68, y: 155, maxLength: 9 },
                expiry: { x: 69, y: 137, maxLength: 10 }
            },
            allowedCities: ['Great Rapid', 'Shingleton', 'Korista City']
        }
    },
    
    /**
     * Image processing settings
     */
    processing: {
        // PNG compression level (0-9, higher = better quality)
        pngCompressionLevel: 9,
        
        // Maximum file size in MB
        maxFileSize: 10,
        
        // Allowed image formats
        allowedFormats: ['jpeg', 'jpg', 'png', 'gif']
    }
};