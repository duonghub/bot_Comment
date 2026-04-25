import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';
import gTTS from 'gtts';
import sound from 'sound-play'; // Dùng thư viện mới này
import fs from 'fs';
import path from 'path';

const tiktokUsername = 'gamedchoi'; // Xóa dấu @ đi nhé
const connection = new TikTokLiveConnection(tiktokUsername);

let isReading = false;
const queue = [];

async function processQueue() {
    if (isReading || queue.length === 0) return;
    
    isReading = true;
    const currentComment = queue.shift();
    
    const fileName = `temp_${Date.now()}.mp3`;
    const fullPath = path.join(process.cwd(), fileName);
    const gtts = new gTTS(currentComment, 'vi');
    
    gtts.save(fileName, async (err, result) => {
        if (!err) {
            try {
                // Phát nhạc bằng thư viện mới
                await sound.play(fullPath);
                
                // Sau khi phát xong thì xóa
                fs.unlink(fileName, () => {});
                isReading = false;
                processQueue();
            } catch (e) {
                console.error("Lỗi phát âm thanh:", e);
                isReading = false;
                processQueue();
            }
        } else {
            isReading = false;
            processQueue();
        }
    });
}

// --- KẾT NỐI ---
connection.connect().then(state => {
    console.log(`Đã kết nối tới live: ${state.roomId}`);
}).catch(err => {
    console.error('Lỗi kết nối:', err);
});

// --- NHẬN COMMENT ---
connection.on(WebcastEvent.CHAT, data => {
    if (!data.comment) return;
    console.log(`${data.user.uniqueId} nói: ${data.comment}`);
    queue.push(data.comment);
    processQueue();
});

// --- ĐOẠN CODE TEST (ĐẶT Ở NGOÀI) ---
setTimeout(() => {
    console.log("--- ĐANG TEST TTS ---");
    queue.push("Chào bạn, bot đã hoạt động thành công!");
    processQueue();
}, 5000);