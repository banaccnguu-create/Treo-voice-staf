const { Client } = require('discord.js-selfbot-v13');
const http = require('http');

// Tạo web server ảo cho Render để không bị sleep
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Acc 2 Voice Active!\n');
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server online port ${PORT}`));

// Khởi tạo selfbot client
const client = new Client({ checkUpdate: false });

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = '1537507317459718289';
const CHANNEL_ID = '1559861570539102308';

async function connectToVoice() {
    try {
        const guild = await client.guilds.fetch(GUILD_ID).catch(() => null);
        if (!guild) {
            console.log('[-]: Tài khoản chưa tham gia Server này!');
            return;
        }

        const channel = await client.channels.fetch(CHANNEL_ID).catch(() => null);
        if (!channel) {
            console.log('[-]: Không tìm thấy kênh voice (kiểm tra lại ID hoặc quyền xem kênh)!');
            return;
        }

        console.log(`[*]: Đang thử kết nối vào phòng voice: ${channel.name}...`);
        
        await client.user.voice.joinChannel(channel, {
            selfMute: false,
            selfDeaf: false,
            selfVideo: false,
            maxHandshakeRequests: 10
        });

        console.log(`[+]: Đã kết nối thành công vào phòng: ${channel.name}`);
    } catch (error) {
        console.error('[-]: Lỗi kết nối:', error.message);
        setTimeout(connectToVoice, 5000);
    }
}

client.on('ready', async () => {
    console.log(`[+]: Đã đăng nhập: ${client.user.tag}`);
    await connectToVoice();
});

// Tự động vào lại nếu bị rớt voice
client.on('voiceStateUpdate', (oldState, newState) => {
    if (newState.id === client.user.id && !newState.channelId) {
        console.log('[-]: Rớt voice, đang kết nối lại...');
        setTimeout(connectToVoice, 2000);
    }
});

// Giữ ping kết nối mạng
setInterval(() => {
    if (client.ws) client.ws.ping;
}, 25000);

client.login(TOKEN);
