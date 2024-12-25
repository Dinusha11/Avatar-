const { default: makeWASocket, useSingleFileAuthState, fetchLatestBaileysVersion } = require('@adiwajshing/baileys');
const fs = require('fs');
const axios = require('axios');

// Authentication for WhatsApp Web
const { state, saveState } = useSingleFileAuthState('auth_info.json');

// Initialize WhatsApp socket
async function startBot() {
  const { version, isLatest } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    printQRInTerminal: true,
    auth: state,
  });

  sock.ev.on('creds.update', saveState); // save credentials

  sock.ev.on('messages.upsert', async (message) => {
    const msg = message.messages[0];
    if (!msg.key.fromMe && msg.message.conversation) {
      const text = msg.message.conversation.toLowerCase();
      const from = msg.key.remoteJid;

      // Command to check if bot is alive
      if (text === '.alive') {
        await sock.sendMessage(from, { text: 'Hi Avatar is online Now 🔥☘️🩵' });
      }

      // Command to search and send movie file link
      if (text.startsWith('.search')) {
        const movieName = text.replace('.search', '').trim();
        const movieLink = await searchMovie(movieName);
        if (movieLink) {
          await sock.sendMessage(from, { text: `Here is your movie link: ${movieLink}` });
        } else {
          await sock.sendMessage(from, { text: 'Sorry, movie not found!' });
        }
      }

      // Command to download movie
      if (text.startsWith('.download')) {
        const movieName = text.replace('.download', '').trim();
        const movieFile = await downloadMovie(movieName);
        if (movieFile) {
          await sock.sendMessage(from, { 
            document: fs.readFileSync(movieFile), 
            fileName: movieName + '.mp4',
            mimetype: 'video/mp4' 
          });
        } else {
          await sock.sendMessage(from, { text: 'Sorry, unable to download the movie!' });
        }
      }
    }
  });
}

// Function to search movie link from the website
async function searchMovie(movieName) {
  // Simulate searching by returning a dummy link (You can implement actual web scraping here)
  return `https://cinesubz.co/search/${movieName}`;
}

// Function to download movie file
async function downloadMovie(movieName) {
  // Simulate downloading by providing a dummy path (You can implement real download logic)
  const movieFilePath = `./movies/${movieName}.mp4`;
  if (!fs.existsSync(movieFilePath)) {
    // If file doesn't exist, return null (you can implement download logic here)
    return null;
  }
  return movieFilePath;
}

// Start the bot
startBot();
