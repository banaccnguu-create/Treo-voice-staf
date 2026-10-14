const { Client } = require('discord.js-selfbot-v13');
const http = require('http');

// Tạo web server ảo cho Render để không bị sleep
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Acc 2 Voice Active!\n');
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server online port ${PORT}`));

const client = new Client({ checkUpdate: false });

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = '1537507317459718289';
const CHANNEL_ID = '1559861570539102308';

client.on('ready', async () => {
    console.log(`[+] Đã đăng nhập thành công: ${client.user.tag}`);
    
    try {
        const guild = await client.guilds.fetch(GUILD_ID).catch(() => null);
        if (!guild) {
            console.log('[-] Không tìm thấy Server!');
            return;
        }

        const channel = await client.channels.fetch(CHANNEL_ID).catch(() => null);
        if (!channel || channel.type !== 'GUILD_STAGE_VOICE' && channel.type !== 'GUILD_VOICE') {
            console.log('[-] Không tìm thấy kênh voice!');
            return;
        }

        await channel.join();
        console.log(`[+] Đã kết nối vào phòng voice thành công!`);
    } catch (error) {
        console.log('[-] Lỗi kết nối voice:', error.message);
    }
});

client.login(TOKEN);
