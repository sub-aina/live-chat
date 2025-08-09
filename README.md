# Talky - Real-time Chat Application

## Features

- Real-time messaging with WebSocket connections
- Public and private chat functionality
- AI-powered chat summarization using BART model
- User management with online status
- Responsive design for desktop and mobile

## Live Demo

**Demo**: https://talky-chat-eight.vercel.app/

**Note**: The summarization feature is disabled on the live demo due to memory limitations. Run locally for full functionality.

## Tech Stack

- **Frontend**: React, WebSockets, CSS3
- **Backend**: Node.js, WebSocket Server
- **AI Service**: FastAPI, Transformers, BART model

## Local Setup

### Installation

1. **Clone repository**
```bash
git clone https://github.com/sub-aina/live-chat.git
cd talky-chat
```

2. **Frontend setup**
```bash
cd client
npm install
```

3. **Server setup**
```bash
cd server
npm install uuid ws node-fetch
```

4. **AI service setup**
```bash
cd summarize
pip install fastapi uvicorn transformers torch pydantic
```

### Running the Application

Run these commands in separate terminals:

1. **Start AI service**
```bash
cd summarize
python summarizer_api.py
```

2. **Start WebSocket server**
```bash
cd server
node index.js
```

3. **Start frontend**
```bash
cd client
npm run dev
```

Access the application at `http://localhost:5173`

## Usage

1. Enter a username to join the chat
2. Send messages in the public chat room
3. Click on usernames to start private conversations
4. Use "Summarize Chat" button to generate AI summaries

## Configuration

### Environment Variables
- `PORT`: Server port (default: 8001 for WebSocket, 8000 for API)
- `SUMMARIZER_API_URL`: Summarization API endpoint

### Frontend Configuration
Update WebSocket URL in `client/src/components/Home.jsx`:
```javascript
const WS_URL = `ws://127.0.0.1:8001`;
```

