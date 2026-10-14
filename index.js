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

if (!TOKEN) {
    console.log('[-] LỖI: Chưa cấu hình DISCORD_TOKEN trong Environment của Render!');
}

client.on('ready', async () => {
    console.log(`[+] Đã đăng nhập thành công tài khoản: ${client.user.tag}`);
    
    try {
        const guild = await client.guilds.fetch(GUILD_ID).catch(() => null);
        if (!guild) {
            console.log('[-] Không tìm thấy Server! Kiểm tra lại ID Server.');
            return;
        }

        const channel = await client.channels.fetch(CHANNEL_ID).catch(() => null);
        if (!channel) {
            console.log('[-] Không tìm thấy kênh voice! Kiểm tra lại ID Kênh.');
            return;
        }

        await channel.join();
        console.log(`[+] Đã kết nối vào phòng voice thành công: ${channel.name}`);
    } catch (error) {
        console.log('[-] Lỗi join voice:', error.message);
    }
});

// Bắt lỗi nếu login thất bại
client.login(TOKEN).catch(err => {
    console.log('[-] LỖI ĐĂNG NHẬP (Token sai hoặc bị khóa):', err.message);
});
