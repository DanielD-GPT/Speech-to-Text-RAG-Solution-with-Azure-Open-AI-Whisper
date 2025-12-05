# OpenAI Whisper App

A modern JavaScript web application with Express backend for audio transcription and AI chat functionality using Azure OpenAI services.

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm
- Azure OpenAI account with Whisper and GPT deployments

### Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   - Copy `.env.example` to `.env`
   - Update the following variables with your Azure OpenAI credentials:
     ```bash
     AZURE_WHISPER_ENDPOINT=https://YOUR_RESOURCE_NAME.openai.azure.com/openai/deployments/whisper/audio/translations?api-version=2024-06-01
     AZURE_WHISPER_API_KEY=your_azure_whisper_api_key_here
     AZURE_CHAT_ENDPOINT=https://YOUR_RESOURCE_NAME.openai.azure.com/openai/deployments/gpt-4o-mini/chat/completions?api-version=2025-01-01-preview
     AZURE_CHAT_API_KEY=your_azure_chat_api_key_here
     ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   
   Or for production:
   ```bash
   npm start
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
PJM Whisper App/
├── src/
│   └── server.js          # Express server
├── public/
│   ├── index.html         # Main HTML file
│   ├── styles.css         # CSS styles
│   └── script.js          # Frontend JavaScript
├── package.json           # Dependencies & scripts
└── README.md             # This file
```

## 🛠️ Features

- **Audio Transcription**: Upload and transcribe audio files using Azure OpenAI Whisper
- **AI Chat**: Chat with AI about transcribed content using GPT-4o-mini
- **File History**: Keep track of uploaded files and search through transcripts
- **Real-time Audio Player**: Play back uploaded audio files
- **Express Server**: RESTful API with file upload support
- **Modern Frontend**: Responsive design with drag-and-drop functionality
- **Environment Configuration**: Secure API key management with dotenv

## 📡 API Endpoints

- `GET /api/health` - Server health check
- `POST /api/transcribe` - Upload and transcribe audio files
- `POST /api/chat` - Chat with AI about transcribed content

## 🔐 Security Note

This application requires Azure OpenAI API keys. Never commit your actual API keys to version control. Always use environment variables and the `.env` file for sensitive configuration.

## 🔧 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Run tests (placeholder)

## 🎨 Customization

Feel free to modify:
- Server routes in `src/server.js`
- Frontend styling in `public/styles.css`
- Client-side logic in `public/script.js`
- HTML structure in `public/index.html`

## 📝 Configuration Changes Made

This repository has been sanitized for sharing:
- ✅ Removed all API keys and endpoints
- ✅ Replaced with environment variables and placeholders
- ✅ Added `.gitignore` to prevent accidental commits of sensitive data
- ✅ Updated `.env.example` with proper variable names
- ✅ Added setup instructions for Azure OpenAI configuration

---

Happy coding! 🎉