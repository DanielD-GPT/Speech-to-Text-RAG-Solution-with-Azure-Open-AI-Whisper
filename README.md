# Speech-to-Text RAG Solution with Azure OpenAI Whisper

A modern web application for transcribing audio files and performing intelligent Q&A on the transcribed content using Azure OpenAI Whisper and GPT. Features a clean two-pane UI with audio playback, transcription display, and AI-powered chat capabilities.

## Features

- 🎤 **Audio File Upload**: Upload .wav and .mp3 files for transcription (up to 50MB)
- 🔊 **Audio Playback**: Built-in audio player to review uploaded files
- 📝 **Speech-to-Text**: Automatically transcribe audio using Azure OpenAI Whisper
- 🤖 **AI-Powered Q&A**: Ask questions about your transcribed content using Azure OpenAI GPT
- 📚 **File History**: Keep track of previously transcribed files with local storage
- 🔍 **Search Functionality**: Search through transcripts and file history
- 📋 **Copy & Export**: Easily copy transcription text to clipboard

## Architecture

- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Backend**: Node.js with Express
- **Azure Services**:
  - Azure OpenAI Whisper (audio transcription)
  - Azure OpenAI GPT-4o-mini (chat/Q&A)

## Prerequisites

- Node.js 16+ and npm
- Azure subscription with:
  - Azure OpenAI resource with Whisper model deployed
  - Azure OpenAI resource with GPT model deployed (e.g., gpt-4o-mini)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/DanielD-GPT/Speech-to-Text-RAG-Solution-with-Azure-Open-AI-Whisper.git
cd Speech-to-Text-RAG-Solution-with-Azure-Open-AI-Whisper
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Azure Credentials

Create a `.env` file in the root directory by copying `.env.example`:

```bash
copy .env.example .env
```

Edit `.env` and add your Azure credentials:

```env
# Azure OpenAI Whisper Configuration
AZURE_WHISPER_ENDPOINT=https://your-resource.openai.azure.com/openai/deployments/whisper/audio/translations?api-version=2024-06-01
AZURE_WHISPER_API_KEY=your_whisper_api_key_here

# Azure OpenAI Chat Configuration
AZURE_CHAT_ENDPOINT=https://your-resource.openai.azure.com/openai/deployments/gpt-4o-mini/chat/completions?api-version=2025-01-01-preview
AZURE_CHAT_API_KEY=your_chat_api_key_here

# Server Configuration
PORT=3000
```

#### How to Get Azure Credentials:

**Azure OpenAI (Whisper & GPT)**:
1. Go to [Azure Portal](https://portal.azure.com)
2. Create or navigate to your Azure OpenAI resource
3. Go to "Keys and Endpoint" section
4. Copy the endpoint URL and one of the keys
5. Deploy models in Azure OpenAI Studio:
   - Deploy a Whisper model for transcription
   - Deploy a GPT model (e.g., gpt-4o-mini) for chat
6. Use the deployment names in your endpoint URLs

### 4. Run the Application

Use the VS Code task or run manually:

```bash
npm start
```

Or for development with auto-restart:

```bash
npm run dev
```

The server will start on http://localhost:3000

### 5. Open in Browser

Navigate to:

```
http://localhost:3000
```

## Usage

1. **Upload Audio**: Drag and drop or click to upload a .wav or .mp3 file
2. **Automatic Transcription**: The file is automatically transcribed using Azure OpenAI Whisper
3. **Review Content**: View the transcription in the left pane, play back audio as needed
4. **Ask Questions**: Use the chat interface on the right to ask AI-powered questions about your transcribed content
5. **Search & History**: Search through transcripts and access previously transcribed files

## Project Structure

```
Speech-to-Text-RAG-Solution/
├── .github/
│   └── copilot-instructions.md
├── public/
│   ├── index.html          # Main HTML file with two-pane layout
│   ├── styles.css          # Application styling
│   └── script.js           # Frontend JavaScript logic
├── src/
│   └── server.js           # Express server with Azure integration
├── uploads/                # Temporary storage for uploaded audio files
├── package.json            # Node.js dependencies
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## API Endpoints

### POST /api/transcribe

Upload and transcribe an audio file.

**Request**: `multipart/form-data` with `audio` field (WAV or MP3 file)

**Response**:
```json
{
  "transcription": "The transcribed text content...",
  "filename": "audio-file.mp3",
  "mock": false
}
```

### POST /api/chat

Ask a question about the transcribed content.

**Request**:
```json
{
  "message": "What are the main topics discussed?",
  "context": "The transcribed text content..."
}
```

**Response**:
```json
{
  "response": "Based on the transcription, the main topics are...",
  "mock": false
}
```

### GET /api/health

Server health check endpoint.

**Response**:
```json
{
  "status": "OK",
  "message": "Server is running!"
}
```

## Development

To run in development mode with auto-restart:

```bash
npm run dev
```

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express
- **Azure AI Services**:
  - Azure OpenAI Whisper - Speech-to-text transcription
  - Azure OpenAI GPT - Chat and Q&A capabilities
- **Other Libraries**:
  - `multer` - File upload handling
  - `axios` - HTTP client for Azure API calls
  - `form-data` - Multipart form data handling
  - `dotenv` - Environment variable management

## Security Notes

- Never commit `.env` file to version control
- Keep your Azure API keys secure
- Uploaded files are stored temporarily in the `uploads/` directory and cleaned up after processing
- Consider implementing file cleanup and size limits for production use

## Troubleshooting

**Issue: Server won't start**
- Check that port 3000 is not in use
- Verify `.env` file exists and has correct values

**Issue: Transcription fails**
- Verify Azure OpenAI Whisper credentials and endpoint
- Check that the audio file is valid (.wav or .mp3)
- Ensure your Azure resource has sufficient quota
- Verify file size is under 50MB

**Issue: Chat/Q&A not working**
- Verify Azure OpenAI GPT credentials
- Ensure your deployment name is correct in the endpoint URL
- Check that you've transcribed audio first

## License

MIT

## Support

For issues or questions, please check the Azure documentation:

- [Azure OpenAI Service](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
- [Azure OpenAI Whisper](https://learn.microsoft.com/en-us/azure/ai-services/openai/whisper-quickstart)

---

## ⚠️ DISCLAIMER

**This application is a prototype intended for proof of concept and demonstration purposes only.** It is not designed, tested, or supported for production use. Use at your own risk. Microsoft makes no warranties, express or implied, regarding the functionality, reliability, or suitability of this code for any purpose. For production scenarios, please consult official Microsoft documentation and implement appropriate security, scalability, and compliance measures.