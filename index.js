const { Client, GatewayIntentBits } = require('discord.js');
const ytDlp = require('yt-dlp-exec');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const os = require('os');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
    console.log('Bot is online!');
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const url = message.content.trim();
    if (url.startsWith('https://www.youtube.com/') || url.startsWith('https://youtu.be/')) {
        message.channel.send('Downloading your audio, please wait...');

        const outputDir = path.join(os.homedir(), 'Downloads');
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

        const proxy = 'socks5://ogaayzjt:kpsc1lrrk1b3@64.64.118.149:6732'; // SOCKS5 proxy with authentication

        try {
            // Fetch video information to get the title
            const info = await ytDlp(url, { dumpJson: true, proxy });
            const videoTitle = info.title;
            const sanitizedTitle = videoTitle.replace(/[<>:"/\\|?*\x00-\x1F]/g, ''); // Sanitize filename

            const outputFilePath = path.join(outputDir, `${sanitizedTitle}.m4a`);

            // Download the audio
            await ytDlp(url, {
                format: '140', // Use format ID for m4a audio format
                output: outputFilePath,
                proxy,
            });

            // Send the audio file as an attachment
            await message.channel.send({
                content: `Audio downloaded successfully:`,
                files: [outputFilePath]
            });

            // Optionally, delete the local file after sending
            fs.unlinkSync(outputFilePath);
        } catch (error) {
            console.error('Error during download:', error);
            message.channel.send('Failed to download the audio. Please try again.');
        }
    }
});

client.login(process.env.AUDIO_TOKEN);
