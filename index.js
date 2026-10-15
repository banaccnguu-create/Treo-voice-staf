const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const http = require('http');

// Server giả lập trên Render để giữ Web Service hoạt động 24/7
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Acc Treo Voice Active\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server online port ${PORT}`));

const client = new Client({ checkUpdate: false });

const TOKEN = process.env.DISCORD_TOKEN;

// ID Server & Kênh Tạo Voice từ link bạn gửi
const GUILD_ID = process.env.GUILD_ID || "1537507317459718289";
const CREATE_VOICE_CHANNEL_ID = process.env.CHANNEL_ID || "1542377214367244369";

let currentVoiceChannelId = null; 
let isReconnecting = false;

async function joinCreateVoiceChannel() {
    if (isReconnecting) return;
    isReconnecting = true;

    try {
        const guild = await client.guilds.fetch(GUILD_ID).catch(() => null);
        if (!guild) {
            console.log('[-] Không tìm thấy Server!');
            isReconnecting = false;
            return;
        }

        // Hủy kết nối voice cũ nếu có
        const existingConnection = getVoiceConnection(GUILD_ID);
        if (existingConnection) {
            existingConnection.destroy();
        }

        console.log(`[+] Đang vào kênh tạo phòng (${CREATE_VOICE_CHANNEL_ID})...`);

        // Join vào kênh tạo phòng ban đầu
        joinVoiceChannel({
            channelId: CREATE_VOICE_CHANNEL_ID,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfMute: false,
            selfDeaf: false,
            selfVideo: false,
        });

    } catch (error) {
        console.error('[-] Lỗi khi vào kênh tạo voice:', error.message);
        isReconnecting = false;
    }
}

client.on('ready', async () => {
    console.log(`[+] Đã đăng nhập tài khoản: ${client.user.tag}`);
    await joinCreateVoiceChannel();
});

// Lắng nghe sự kiện chuyển phòng
client.on('voiceStateUpdate', (oldState, newState) => {
    if (newState.id !== client.user.id) return;

    // Khi bot bấm vào kênh tạo phòng và được chuyển sang Voice mới
    if (newState.channelId && newState.channelId !== CREATE_VOICE_CHANNEL_ID) {
        currentVoiceChannelId = newState.channelId;
        isReconnecting = false;
        console.log(`[✔] Đã tự động chuyển sang Voice mới [ID: ${currentVoiceChannelId}] và đang đứng yên tại đây!`);
        return;
    }

    // Khi bị ngắt kết nối voice hoàn toàn
    if (!newState.channelId) {
        console.log('[-] Bị ngắt kết nối Voice! Sẽ tự động bấm lại kênh tạo phòng sau 5 giây...');
        currentVoiceChannelId = null;
        isReconnecting = false;

        setTimeout(() => {
            joinCreateVoiceChannel();
        }, 5000);
    }
});

// Giữ kết nối (Check ping an toàn không gây crash code)
setInterval(() => {
    if (client.ws && client.ws.ping) {
        console.log(`[Ping] WebSocket Ping: ${client.ws.ping}ms`);
    }
}, 30000);

client.login(TOKEN);
