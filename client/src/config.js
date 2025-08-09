// Production configuration
export const config = {
  WS_URL: process.env.NODE_ENV === 'production' 
    ? 'https://live-chat-websocket.onrender.com' 
    : 'ws://127.0.0.1:8001',
  
//   API_URL: process.env.NODE_ENV === 'production'
//     ? 'https://talky-summarizer.onrender.com'  
//     : 'http://127.0.0.1:8000'
};