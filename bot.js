import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;

// Phục vụ trang web để OBS/Live Studio kết nối vào
app.use(express.static(path.join(__dirname, 'public')));

// --- KẾT NỐI TIKTOK ---
const tiktokUsername = 'gamedchoi'; 
const connection = new TikTokLiveConnection(tiktokUsername);

connection.connect().then(state => {
    console.log(`Đã kết nối tới live: ${state.roomId}`);
}).catch(err => console.error('Lỗi kết nối:', err));

// Khi có comment, bắn tin nhắn qua Socket.io
connection.on(WebcastEvent.CHAT, data => {
    if (!data.comment) return;
    console.log(`${data.user.uniqueId} nói: ${data.comment}`);
    
    // Gửi comment đến tất cả các trình duyệt đang kết nối
    io.emit('new_comment', data.comment);
});

server.listen(port, () => {
    console.log(`Server đang lắng nghe cổng ${port}`);
});