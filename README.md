# Papers, Please - Passport Maker 🛂

[![Version](https://img.shields.io/badge/version-1.0-green.svg)](https://github.com/MOtaMore/pppmaker)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Support](https://img.shields.io/badge/support-Ko--fi-ff5e5b.svg)](https://ko-fi.com/motamore)

A web-based passport generator inspired by the indie game "Papers, Please" by Lucas Pope. Create authentic-looking pixelated passport documents with retro terminal aesthetics.

## 🎮 Live Demo

Try it out: [Papers Please Passport Maker](https://pppmaker.com)

## ✨ Features

### 🖼️ Image Processing
- **Automatic Photo Processing**: Upload any photo and watch it transform into a 40x48 pixel art style
- **Manual Mode**: Support for pre-processed 40x48 pixel images
- **Adjustable Contrast**: Fine-tune the pixelation threshold for optimal results
- **Drag & Drop Support**: Easy file upload with visual feedback

### 📄 Passport Generation
- **7 Fictional Countries**: Each with unique designs and color schemes
  - Arstotzka
  - Antegria
  - Impor
  - Kolechia
  - Obristan
  - Republia
  - United Federation
- **Authentic Templates**: Pixel-perfect recreations of the game's passport designs
- **Custom Fields**: Name, date of birth, sex, city of issue, passport number, and expiry date
- **City Validation**: Each country has its own set of valid issuing cities

### 🎨 Design & UX
- **Retro Terminal Interface**: Complete with CRT effects and scan lines
- **Government Bureaucracy Theme**: Authentic Eastern Bloc aesthetic
- **Responsive Design**: Works on desktop and mobile devices
- **Pixelated Rendering**: All graphics maintain the crisp pixel art style

### 💾 Technical Features
- **Client-Side Processing**: Photos are processed in your browser for privacy
- **High-Quality Export**: Passports are generated at 6x scale (780x972 pixels)
- **Multiple Download Options**: 
  - Processed 40x48 photo
  - Complete passport document
- **No Data Storage**: All processing happens locally, no images are uploaded to servers

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/MOtaMore/pppmaker.git
cd pppmaker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## 🛠️ Tech Stack

### Frontend
- **HTML5**: Semantic markup with accessibility in mind
- **CSS3**: Custom properties, animations, and retro terminal effects
- **Vanilla JavaScript**: No framework dependencies for maximum performance

### Backend
- **Node.js**: Server runtime
- **Express.js**: Web application framework
- **Sharp**: High-performance image processing
- **Jimp**: Canvas manipulation and text rendering
- **Multer**: File upload handling

## 📁 Project Structure

```
pppmaker/
├── public/              # Static files
│   ├── index.html      # Main application
│   ├── styles.css      # Terminal UI styles
│   ├── script.js       # Frontend logic
│   └── imgs/           # Passport templates
├── backend/            # Server modules
│   ├── config.js       # Configuration
│   ├── imageProcessor.js
│   ├── passportGenerator.js
│   └── pixelFont.js    # Custom bitmap font
├── server.js           # Express server
├── package.json
└── README.md
```

## 🎯 Usage Guide

### Creating a Passport

1. **Upload a Photo**
   - Click the upload area or drag & drop an image
   - Best results with portraits in 3:4 aspect ratio
   
2. **Adjust Processing** (Automatic mode)
   - Use the contrast slider to fine-tune pixelation
   - Click "PROCESS PHOTO" to generate pixel art
   
3. **Select Country**
   - Choose from 7 available countries
   - Each has unique design and allowed cities
   
4. **Fill in Details**
   - Enter passport holder information
   - Dates use DD.MM.YYYY format
   - Passport numbers use XXXXX-XXXXX format
   
5. **Generate & Download**
   - Click "GENERATE PASSPORT" to create the document
   - Download your passport as a PNG file

### Pre-processed Images

If you already have a 40x48 pixel image:
1. Switch to "PRE-PROCESSED IMAGE" mode
2. Upload your 40x48 pixel image
3. Continue from step 3 above

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 Legal Disclaimer

This is a fan-made project and is not affiliated with, endorsed by, or connected to Lucas Pope, 3909 LLC, or the Papers, Please franchise. All rights to Papers, Please belong to their respective owners.

This project is created for educational and entertainment purposes only.

## 💖 Support

If you enjoy this project, consider supporting the development:

[![Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/motamore)

Your support helps maintain and improve this project!

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Lucas Pope** - Creator of Papers, Please
- **Papers, Please Community** - For keeping the spirit alive
- **Contributors** - Everyone who has helped improve this project

## 🐛 Known Issues

- Some older browsers may not support all CSS effects
- Very large images may take longer to process
- Mobile devices may have limited processing capabilities

## 🚧 Roadmap

- [ ] Additional countries from the Papers, Please universe
- [ ] More customization options
- [ ] Batch processing capability
- [ ] Additional document types (ID cards, work permits)
- [ ] Sound effects and music
- [ ] Multi-language support

---

**Glory to Arstotzka!** 🎖️

Made with ❤️ by [MOtaMore](https://github.com/MOtaMore)