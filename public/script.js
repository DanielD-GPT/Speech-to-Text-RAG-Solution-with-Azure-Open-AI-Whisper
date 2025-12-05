// Global variables
let currentTranscript = '';
let chatHistory = [];
let fileHistory = [];

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupFileUpload();
    setupChatInput();
    loadFileHistory();
    
    // Enable chat if there are files in history or current transcript
    setTimeout(() => {
        if (currentTranscript || fileHistory.length > 0) {
            enableChat();
        }
    }, 100);
    
    // Test server health on load
    fetch('/api/health')
        .then(response => response.json())
        .then(data => {
            console.log('Server health:', data);
        })
        .catch(error => {
            console.error('Server health check failed:', error);
        });
}

function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadStatus = document.getElementById('uploadStatus');

    // Click to select file
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    });

    // Drag and drop events
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });
}

function handleFile(file) {
    // Validate file type
    const allowedTypes = ['audio/wav', 'audio/mpeg', 'audio/mp3'];
    const isValidType = allowedTypes.includes(file.type) || 
                       file.name.toLowerCase().endsWith('.wav') || 
                       file.name.toLowerCase().endsWith('.mp3');
    
    if (!isValidType) {
        showUploadStatus('Please select a .wav or .mp3 audio file', 'error');
        return;
    }

    // Validate file size (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
        showUploadStatus('File size must be less than 50MB', 'error');
        return;
    }

    // Show audio player, load file, and automatically start transcription
    loadAudioFile(file);
    uploadAndTranscribe(file);
}

function loadAudioFile(file) {
    const audioPlayerSection = document.getElementById('audioPlayerSection');
    const audioPlayer = document.getElementById('audioPlayer');
    const fileName = document.getElementById('fileName');
    const fileDetails = document.getElementById('fileDetails');
    
    // Create URL for the file
    const fileUrl = URL.createObjectURL(file);
    
    // Update audio player
    audioPlayer.src = fileUrl;
    
    // Update file information
    fileName.textContent = file.name;
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
    const fileType = file.type || 'Unknown';
    fileDetails.innerHTML = `
        <div><strong>Size:</strong> ${fileSizeMB} MB</div>
        <div><strong>Type:</strong> ${fileType}</div>
    `;
    
    // Store file reference for transcription
    window.currentAudioFile = file;
    
    showUploadStatus(`Audio file loaded: ${file.name}`, 'success');
}

async function uploadAndTranscribe(file) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const uploadStatus = document.getElementById('uploadStatus');
    
    try {
        // Show loading
        loadingOverlay.style.display = 'flex';
        
        // Prepare form data
        const formData = new FormData();
        formData.append('audio', file);
        
        // Upload to server
        const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            // Success
            currentTranscript = result.transcription;
            displayTranscript(result.transcription, result.filename, result.mock);
            showUploadStatus(`Successfully transcribed: ${result.filename}`, 'success');
            addToFileHistory(result.filename, result.transcription);
            enableChat();
        } else {
            // Error from server
            showUploadStatus(`Error: ${result.error}`, 'error');
        }

    } catch (error) {
        console.error('Upload error:', error);
        showUploadStatus(`Network error: ${error.message}`, 'error');
    } finally {
        // Hide loading
        loadingOverlay.style.display = 'none';
    }
}

function displayTranscript(transcript, filename, isMock = false) {
    const transcriptContent = document.getElementById('transcriptContent');
    const transcriptActions = document.getElementById('transcriptActions');
    
    const mockBadge = isMock ? '<span style="background: #ffc107; color: #856404; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; margin-left: 10px;">DEMO MODE</span>' : '';
    
    transcriptContent.innerHTML = `
        <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #dee2e6;">
            <strong>${filename}</strong>${mockBadge}
        </div>
        <div style="line-height: 1.6;">
            ${transcript}
        </div>
    `;
    
    transcriptActions.style.display = 'flex';
}

function copyTranscript() {
    if (currentTranscript) {
        navigator.clipboard.writeText(currentTranscript).then(() => {
            showUploadStatus('Transcript copied to clipboard', 'success');
            setTimeout(() => {
                document.getElementById('uploadStatus').style.display = 'none';
            }, 2000);
        });
    }
}

function clearTranscript() {
    currentTranscript = '';
    document.getElementById('transcriptContent').innerHTML = `
        <div class="transcript-placeholder">
            Upload an audio file to see the transcription here...
        </div>
    `;
    document.getElementById('transcriptActions').style.display = 'none';
    
    // Also clear audio player
    clearAudioPlayer();
    disableChat();
}

function clearAudioPlayer() {
    const audioPlayer = document.getElementById('audioPlayer');
    const fileName = document.getElementById('fileName');
    const fileDetails = document.getElementById('fileDetails');
    
    // Clear audio source
    audioPlayer.src = '';
    
    // Reset file information display
    fileName.textContent = 'No file loaded';
    fileDetails.textContent = 'Upload an audio file to see details here';
    
    // Clear file reference
    window.currentAudioFile = null;
}

function showUploadStatus(message, type) {
    const uploadStatus = document.getElementById('uploadStatus');
    uploadStatus.textContent = message;
    uploadStatus.className = `upload-status ${type}`;
    uploadStatus.style.display = 'block';
    
    if (type === 'success') {
        setTimeout(() => {
            uploadStatus.style.display = 'none';
        }, 3000);
    }
}

function setupChatInput() {
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');

    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    chatInput.addEventListener('input', () => {
        const hasTranscripts = currentTranscript || fileHistory.length > 0;
        sendButton.disabled = !chatInput.value.trim() || !hasTranscripts;
    });
}

function enableChat() {
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    
    chatInput.disabled = false;
    chatInput.placeholder = 'Ask questions about your transcribed audio...';
    sendButton.disabled = !chatInput.value.trim();
}

function disableChat() {
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    
    chatInput.disabled = true;
    chatInput.value = '';
    chatInput.placeholder = 'Upload and transcribe audio first...';
    sendButton.disabled = true;
}

async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    const hasTranscripts = currentTranscript || fileHistory.length > 0;
    if (!message || !hasTranscripts) return;
    
    // Add user message to chat
    addChatMessage(message, 'user');
    chatInput.value = '';
    document.getElementById('sendButton').disabled = true;
    
    try {
        // Collect all available transcripts for context
        const allTranscripts = fileHistory.map(file => `File: ${file.name}\n${file.transcript}`).join('\n\n');
        const contextToSend = allTranscripts || currentTranscript;
        
        // Send to server
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                context: contextToSend
            })
        });

        const result = await response.json();
        
        if (response.ok) {
            addChatMessage(result.response, 'assistant');
        } else {
            addChatMessage(`Sorry, there was an error: ${result.error || 'Please try again.'}`, 'assistant');
        }
        
    } catch (error) {
        console.error('Chat error:', error);
        addChatMessage('Network error. Please try again.', 'assistant');
    }
}

function addChatMessage(content, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    messageDiv.innerHTML = `
        <div class="message-content">${content}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// File History Management
function loadFileHistory() {
    const stored = localStorage.getItem('audioFileHistory');
    if (stored) {
        fileHistory = JSON.parse(stored);
        updateFileHistoryDisplay();
        setupSearch();
        // Enable chat if there are files in history
        if (fileHistory.length > 0) {
            enableChat();
        }
    }
}

function saveFileHistory() {
    localStorage.setItem('audioFileHistory', JSON.stringify(fileHistory));
}

function addToFileHistory(filename, transcript) {
    const fileItem = {
        id: Date.now(),
        name: filename,
        transcript: transcript,
        timestamp: new Date().toLocaleString()
    };
    
    // Add to beginning of array and limit to 10 items
    fileHistory.unshift(fileItem);
    if (fileHistory.length > 10) {
        fileHistory = fileHistory.slice(0, 10);
    }
    
    saveFileHistory();
    updateFileHistoryDisplay();
}

function updateFileHistoryDisplay() {
    const searchInput = document.getElementById('searchInput');
    const currentSearch = searchInput ? searchInput.value.trim() : '';
    filterFilesBySearch(currentSearch);
}

function selectFileFromHistory(file) {
    // Clear current audio
    const audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.style.display = 'none';
    audioPlayer.src = '';
    
    // Set transcript
    currentTranscript = file.transcript;
    const transcriptContent = document.getElementById('transcriptContent');
    transcriptContent.textContent = currentTranscript;
    
    // Chat history persists - not cleared when switching files
    // Users can continue their conversation across different transcripts
    
    // Update status
    const uploadStatus = document.getElementById('uploadStatus');
    uploadStatus.innerHTML = `<span style="color: #28a745;">Loaded: ${file.name}</span>`;
    
    // Enable chat for the loaded file
    enableChat();
    
    // Highlight selected file
    document.querySelectorAll('.file-item').forEach(item => {
        item.classList.remove('selected');
    });
    event.target.closest('.file-item').classList.add('selected');
    
    // Apply search highlighting to the transcript if there's an active search
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value.trim()) {
        highlightSearchInTranscript(searchInput.value.trim());
    }
}

// Search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearButton = document.getElementById('clearSearch');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim();
        filterFilesBySearch(searchTerm);
        if (currentTranscript) {
            highlightSearchInTranscript(searchTerm);
        }
    });
    
    clearButton.addEventListener('click', () => {
        searchInput.value = '';
        filterFilesBySearch('');
        highlightSearchInTranscript('');
    });
}

function filterFilesBySearch(searchTerm) {
    const fileList = document.querySelector('.file-list');
    fileList.innerHTML = '';
    
    if (fileHistory.length === 0) {
        fileList.innerHTML = '<div class="no-files">No files uploaded yet</div>';
        return;
    }
    
    const filteredFiles = searchTerm ? 
        fileHistory.filter(file => 
            file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            file.transcript.toLowerCase().includes(searchTerm.toLowerCase())
        ) : fileHistory;
    
    if (filteredFiles.length === 0 && searchTerm) {
        fileList.innerHTML = '<div class="no-files">No matches found</div>';
        return;
    }
    
    filteredFiles.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        // Check if this file matches the search
        const isMatch = searchTerm && 
            (file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             file.transcript.toLowerCase().includes(searchTerm.toLowerCase()));
        
        if (isMatch) {
            fileItem.classList.add('search-match');
        }
        
        fileItem.innerHTML = `
            <div class="file-name">${file.name}</div>
        `;
        
        fileItem.addEventListener('click', () => {
            selectFileFromHistory(file);
        });
        
        fileList.appendChild(fileItem);
    });
}

function highlightSearchInTranscript(searchTerm) {
    const transcriptContent = document.getElementById('transcriptContent');
    if (!transcriptContent || !currentTranscript) return;
    
    if (!searchTerm) {
        // No search term, display normal transcript
        transcriptContent.textContent = currentTranscript;
        return;
    }
    
    // Create highlighted version
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const highlightedText = currentTranscript.replace(regex, '<span class="search-highlight">$1</span>');
    transcriptContent.innerHTML = highlightedText;
}