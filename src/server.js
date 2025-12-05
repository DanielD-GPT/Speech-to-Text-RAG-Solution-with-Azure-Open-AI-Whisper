const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['audio/wav', 'audio/mpeg', 'audio/mp3'];
    if (allowedTypes.includes(file.mimetype) || 
        file.originalname.toLowerCase().endsWith('.wav') || 
        file.originalname.toLowerCase().endsWith('.mp3')) {
        cb(null, true);
    } else {
        cb(new Error('Only .wav and .mp3 files are allowed'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running!' });
});

// Audio transcription endpoint
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file uploaded' });
        }

        const audioFilePath = req.file.path;
        
        // Azure OpenAI configuration
        const azureEndpoint = process.env.AZURE_WHISPER_ENDPOINT || 'https://YOUR_RESOURCE_NAME.openai.azure.com/openai/deployments/whisper/audio/translations?api-version=2024-06-01';
        const azureApiKey = process.env.AZURE_WHISPER_API_KEY || 'YOUR_AZURE_WHISPER_API_KEY_HERE';

        // Prepare form data for Azure OpenAI
        const formData = new FormData();
        formData.append('file', fs.createReadStream(audioFilePath));
        formData.append('response_format', 'text');

        // Call Azure OpenAI Whisper API
        const response = await axios.post(
            azureEndpoint,
            formData,
            {
                headers: {
                    'api-key': azureApiKey,
                    ...formData.getHeaders()
                },
                timeout: 30000 // 30 second timeout
            }
        );

        // Clean up uploaded file
        fs.unlinkSync(audioFilePath);

        res.json({ 
            transcription: response.data,
            filename: req.file.originalname,
            mock: false
        });

    } catch (error) {
        console.error('Transcription error:', error.message);
        
        // Clean up uploaded file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        if (error.code === 'ECONNABORTED') {
            res.status(408).json({ error: 'Request timeout. Please try with a smaller file.' });
        } else if (error.response) {
            res.status(error.response.status).json({ 
                error: error.response.data?.error?.message || 'Transcription failed'
            });
        } else {
            res.status(500).json({ error: 'Internal server error during transcription' });
        }
    }
});

// Chat endpoint with Azure OpenAI GPT-4o-mini
app.post('/api/chat', async (req, res) => {
    try {
        const { message, context } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'No message provided' });
        }

        // Azure OpenAI Chat configuration
        const chatEndpoint = process.env.AZURE_CHAT_ENDPOINT || 'https://YOUR_RESOURCE_NAME.openai.azure.com/openai/deployments/gpt-4o-mini/chat/completions?api-version=2025-01-01-preview';
        const chatApiKey = process.env.AZURE_CHAT_API_KEY || 'YOUR_AZURE_CHAT_API_KEY_HERE';

        // Prepare the system prompt with context
        const systemPrompt = context 
            ? `You are a helpful AI assistant. The user has provided an audio transcription, and you should answer questions about it. Here is the transcribed content:\n\n"${context}"\n\nPlease answer the user's questions based on this transcribed content. If the question is not related to the transcription, politely mention that you're designed to help with questions about the transcribed audio content.`
            : 'You are a helpful AI assistant. The user has not provided any transcribed audio content yet. Please ask them to upload and transcribe an audio file first before asking questions.';

        // Prepare the chat completion request
        const chatData = {
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: message
                }
            ],
            max_tokens: 1000,
            temperature: 0.7
        };

        // Call Azure OpenAI Chat API
        const response = await axios.post(
            chatEndpoint,
            chatData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': chatApiKey
                },
                timeout: 30000 // 30 second timeout
            }
        );

        // Extract the response
        const chatResponse = response.data.choices[0].message.content;

        res.json({
            response: chatResponse,
            mock: false
        });

    } catch (error) {
        console.error('Chat error:', error.message);
        
        if (error.code === 'ECONNABORTED') {
            res.status(408).json({ error: 'Chat request timeout. Please try again.' });
        } else if (error.response) {
            console.error('Azure OpenAI Error:', error.response.data);
            res.status(error.response.status).json({ 
                error: error.response.data?.error?.message || 'Chat service error'
            });
        } else {
            res.status(500).json({ error: 'Internal server error during chat' });
        }
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
        }
    }
    res.status(500).json({ error: error.message });
});

// Serve the frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Upload directory created');
    console.log('Azure OpenAI Whisper API configured and ready');
    console.log('Azure OpenAI Chat API configured and ready');
});