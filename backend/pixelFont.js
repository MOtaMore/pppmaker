/**
 * Papers, Please - Custom Pixel Font Renderer
 * 
 * Implements a bitmap font system based on the BM Mini font style.
 * Creates authentic-looking pixelated text for passport documents.
 * 
 * @module pixelFont
 * @author MOtaMore
 * @license MIT
 */

const Jimp = require('jimp');

module.exports = {
    /**
     * Character bitmap definitions
     * Each character is defined as an array of strings where:
     * - '1' represents a filled pixel
     * - '0' represents an empty pixel
     * - Characters are 5x5 pixels with padding for 8px height
     */
    characters: {
        'A': [
            '0000',
            '0111',
            '1001',
            '1001',
            '1111',
            '1001',
            '1001',
            '0000'
        ],
        'B': [
            '0000',
            '1110',
            '1001',
            '1110',
            '1001',
            '1001',
            '1110',
            '0000'
        ],
        'C': [
            '0000',
            '0111',
            '1000',
            '1000',
            '1000',
            '1000',
            '0111',
            '0000'
        ],
        'D': [
            '0000',
            '1110',
            '1001',
            '1001',
            '1001',
            '1001',
            '1110',
            '0000'
        ],
        'E': [
            '0000',
            '0111',
            '1000',
            '1110',
            '1000',
            '1000',
            '1111',
            '0000'
        ],
        'F': [
            '0000',
            '0111',
            '1000',
            '1110',
            '1000',
            '1000',
            '1000',
            '0000'
        ],
        'G': [
            '0000',
            '0111',
            '1000',
            '1011',
            '1001',
            '1001',
            '0111',
            '0000'
        ],
        'H': [
            '0000',
            '1001',
            '1001',
            '1111',
            '1001',
            '1001',
            '1001',
            '0000'
        ],
        'I': [
            '000',
            '111',
            '010',
            '010',
            '010',
            '010',
            '111',
            '000'
        ],
        'J': [
            '0000',
            '0011',
            '0001',
            '0001',
            '0001',
            '0001',
            '1110',
            '0000'
        ],
        'K': [
            '0000',
            '1001',
            '1001',
            '1110',
            '1001',
            '1001',
            '1001',
            '0000'
        ],
        'L': [
            '0000',
            '1000',
            '1000',
            '1000',
            '1000',
            '1000',
            '0111',
            '0000'
        ],
        'M': [
            '00000',
            '10001',
            '11011',
            '10101',
            '10001',
            '10001',
            '10001',
            '00000'
        ],
        'N': [
            '0000',
            '1001',
            '1101',
            '1011',
            '1001',
            '1001',
            '1001',
            '0000'
        ],
        'O': [
            '0000',
            '0110',
            '1001',
            '1001',
            '1001',
            '1001',
            '0110',
            '0000'
        ],
        'P': [
            '0000',
            '1110',
            '1001',
            '1001',
            '1110',
            '1000',
            '1000',
            '0000'
        ],
        'Q': [
            '0000',
            '0110',
            '1001',
            '1001',
            '1101',
            '1011',
            '0111',
            '0000'
        ],
        'R': [
            '0000',
            '1110',
            '1001',
            '1001',
            '1111',
            '1001',
            '1001',
            '0000'
        ],
        'S': [
            '0000',
            '0111',
            '1000',
            '0100',
            '0010',
            '0001',
            '1110',
            '0000'
        ],
        'T': [
            '00000',
            '11111',
            '00100',
            '00100',
            '00100',
            '00100',
            '00100',
            '00000'
        ],
        'U': [
            '0000',
            '1001',
            '1001',
            '1001',
            '1001',
            '1001',
            '0110',
            '0000'
        ],
        'V': [
            '0000',
            '1001',
            '1001',
            '1001',
            '1010',
            '1100',
            '1000',
            '0000'
        ],
        'W': [
            '00000',
            '10001',
            '10001',
            '10001',
            '10101',
            '10101',
            '01010',
            '00000'
        ],
        'X': [
            '0000',
            '1001',
            '1000',
            '0110',
            '0110',
            '1001',
            '1001',
            '0000'
        ],
        'Y': [
            '0000',
            '1001',
            '1001',
            '0111',
            '0001',
            '0001',
            '0110',
            '0000'
        ],
        'Z': [
            '0000',
            '1111',
            '0001',
            '0010',
            '0100',
            '1000',
            '1111',
            '0000'
        ],
        'a': [
            '0000',
            '0000',
            '0000',
            '0111',
            '1001',
            '1001',
            '0111',
            '0000'
        ],
        'b': [
            '0000',
            '1000',
            '1000',
            '1110',
            '1001',
            '1001',
            '0110',
            '0000'
        ],
        'c': [
            '0000',
            '0000',
            '0000',
            '0111',
            '1000',
            '1000',
            '0111',
            '0000'
        ],
        'd': [
            '0000',
            '0001',
            '0001',
            '0111',
            '1001',
            '1001',
            '0111',
            '0000'
        ],
        'e': [
            '0000',
            '0000',
            '0000',
            '0110',
            '1011',
            '1100',
            '0110',
            '0000'
        ],
        'f': [
            '000',
            '011',
            '100',
            '110',
            '100',
            '100',
            '100',
            '000'
        ],
        'g': [
            '0000',
            '0000',
            '0111',
            '1001',
            '0111',
            '0001',
            '0110',
            '0000'
        ],
        'h': [
            '0000',
            '0000',
            '1000',
            '1000',
            '1110',
            '1001',
            '1001',
            '0000'
        ],
        'i': [
            '0',
            '1',
            '0',
            '1',
            '1',
            '1',
            '1',
            '0'
        ],
        'j': [
            '00',
            '01',
            '00',
            '01',
            '01',
            '01',
            '10',
            '00'
        ],
        'k': [
            '0000',
            '1000',
            '1000',
            '1001',
            '1110',
            '1001',
            '1001',
            '0000'
        ],
        'l': [
            '0',
            '1',
            '1',
            '1',
            '1',
            '1',
            '1',
            '0'
        ],
        'm': [
            '00000',
            '00000',
            '00000',
            '11110',
            '10101',
            '10101',
            '10101',
            '00000'
        ],
        'n': [
            '0000',
            '0000',
            '0000',
            '1110',
            '1001',
            '1001',
            '1001',
            '0000'
        ],
        'o': [
            '0000',
            '0000',
            '0000',
            '0110',
            '1001',
            '1001',
            '0110',
            '0000'
        ],
        'p': [
            '0000',
            '0000',
            '1110',
            '1001',
            '1001',
            '1110',
            '1000',
            '1000'
        ],
        'q': [
            '0000',
            '0111',
            '1001',
            '1001',
            '0111',
            '0001',
            '0001',
            '0000'
        ],
        'r': [
            '0000',
            '0000',
            '0000',
            '1011',
            '1100',
            '1000',
            '1000',
            '0000'
        ],
        's': [
            '0000',
            '0000',
            '0000',
            '0111',
            '1100',
            '0011',
            '1110',
            '0000'
        ],
        't': [
            '0000',
            '0000',
            '0100',
            '0111',
            '0100',
            '0100',
            '0011',
            '0000'
        ],
        'u': [
            '0000',
            '0000',
            '0000',
            '1001',
            '1001',
            '1001',
            '0111',
            '0000'
        ],
        'v': [
            '0000',
            '0000',
            '0000',
            '1001',
            '1001',
            '0110',
            '0110',
            '0000'
        ],
        'w': [
            '00000',
            '00000',
            '00000',
            '10101',
            '10101',
            '10101',
            '01111',
            '00000'
        ],
        'x': [
            '0000',
            '0000',
            '0000',
            '1001',
            '0110',
            '0110',
            '1001',
            '0000'
        ],
        'y': [
            '0000',
            '0000',
            '0000',
            '1001',
            '1001',
            '0111',
            '0001',
            '0110'
        ],
        'z': [
            '0000',
            '0000',
            '0000',
            '1111',
            '0010',
            '0100',
            '1111',
            '0000'
        ],
        '0': [
            '0000',
            '0110',
            '1001',
            '1011',
            '1101',
            '1001',
            '0110',
            '0000'
        ],
        '1': [
            '00',
            '01',
            '11',
            '01',
            '01',
            '01',
            '01',
            '00'
        ],
        '2': [
            '0000',
            '0110',
            '1001',
            '0010',
            '0100',
            '1000',
            '1111',
            '0000'
        ],
        '3': [
            '0000',
            '0110',
            '1001',
            '0010',
            '0001',
            '1001',
            '0110',
            '0000'
        ],
        '4': [
            '00000',
            '00010',
            '00110',
            '01010',
            '11111',
            '00010',
            '00010',
            '00000'
        ],
        '5': [
            '0000',
            '1111',
            '1000',
            '1110',
            '0001',
            '0001',
            '1110',
            '0000'
        ],
        '6': [
            '0000',
            '0110',
            '1000',
            '1110',
            '1001',
            '1001',
            '0110',
            '0000'
        ],
        '7': [
            '0000',
            '1111',
            '1001',
            '0010',
            '0010',
            '0100',
            '0100',
            '0000'
        ],
        '8': [
            '0000',
            '0110',
            '1001',
            '0110',
            '1001',
            '1001',
            '0110',
            '0000'
        ],
        '9': [
            '0000',
            '0110',
            '1001',
            '1001',
            '0111',
            '0001',
            '0110',
            '0000'
        ],
        '.': [
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '1',
            '0'
        ],
        ',': [
            '00',
            '00',
            '00',
            '00',
            '00',
            '00',
            '01',
            '10'
        ],
        ' ': [
            '000',
            '000',
            '000',
            '000',
            '000',
            '000',
            '000',
            '000'
        ],
        '-': [
            '000',
            '000',
            '000',
            '111',
            '000',
            '000',
            '000',
            '000'
        ],
        ':': [
            '000',
            '000',
            '000',
            '010',
            '000',
            '010',
            '000',
            '000'
        ]
    },
    
    /**
     * Get the actual visible width of a character
     * @param {Array<string>} charData - Character bitmap data
     * @returns {number} Width in pixels
     */
    getCharacterWidth: function(charData) {
        if (!charData) return 0;
        
        let minX = 5;
        let maxX = 0;
        
        // Find left and right bounds of the character
        for (let y = 0; y < charData.length; y++) {
            const row = charData[y];
            for (let x = 0; x < row.length; x++) {
                if (row[x] === '1') {
                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x);
                }
            }
        }
        
        // If no pixels, return 0
        if (maxX < minX) return 0;
        
        // Return actual width (from first to last pixel)
        return maxX - minX + 1;
    },
    
    /**
     * Get the left offset of the first visible pixel
     * @param {Array<string>} charData - Character bitmap data
     * @returns {number} Offset in pixels
     */
    getCharacterOffset: function(charData) {
        if (!charData) return 0;
        
        for (let x = 0; x < 5; x++) {
            for (let y = 0; y < charData.length; y++) {
                if (charData[y][x] === '1') {
                    return x;
                }
            }
        }
        
        return 0;
    },
    
    /**
     * Render text using the pixel font
     * @param {string} text - Text to render
     * @param {number} color - Color value for Jimp
     * @returns {Object} Jimp image object containing rendered text
     */
    renderText: function(text, color) {
        const charSpacing = 1; // Space between visible characters
        const charHeight = 8;  // Height of 8 pixels
        
        // First, calculate total width needed
        let totalWidth = 0;
        const charInfos = [];
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const charData = this.characters[char];
            
            if (charData) {
                const width = this.getCharacterWidth(charData);
                const offset = this.getCharacterOffset(charData);
                
                charInfos.push({
                    char: char,
                    data: charData,
                    width: width,
                    offset: offset
                });
                
                totalWidth += width;
                if (i < text.length - 1) {
                    totalWidth += charSpacing;
                }
            } else {
                // Character not found, use space
                charInfos.push({
                    char: ' ',
                    data: this.characters[' '],
                    width: 3, // Space width
                    offset: 0
                });
                totalWidth += 3;
                if (i < text.length - 1) {
                    totalWidth += charSpacing;
                }
            }
        }
        
        // Create image for the text
        const image = new Jimp(totalWidth || 1, charHeight, 0x00000000);
        
        // Draw each character
        let xPosition = 0;
        for (let i = 0; i < charInfos.length; i++) {
            const info = charInfos[i];
            
            if (info.data) {
                // Draw character pixel by pixel
                for (let y = 0; y < info.data.length; y++) {
                    const row = info.data[y];
                    for (let x = 0; x < row.length; x++) {
                        if (row[x] === '1') {
                            // Adjust x to compensate for offset
                            const actualX = xPosition + x - info.offset;
                            image.setPixelColor(color, actualX, y);
                        }
                    }
                }
            }
            
            // Advance position (visible width + spacing)
            xPosition += info.width;
            if (i < charInfos.length - 1) {
                xPosition += charSpacing;
            }
        }
        
        return image;
    }
};