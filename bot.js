const tmi = require('tmi.js');
const dotenv = require('dotenv');
dotenv.config();

const opts = {
  server: {
    host: process.env.SERVER_HOST,
    port: process.env.SERVER_PORT
  },
  identity: {
    username: process.env.BOT_USERNAME,
    password: process.env.BOT_TOKEN
  },
  channels: [
    process.env.CHANNEL_NAME
  ],
  tts: {
    admin: process.env.ADMIN_NAME,
    timeout: process.env.TTS_TIMEOUT_SECONDS,
    voices: ['carolla:', 'daria:', 'david:', 'fergy:', 'gandalf:', 'glados:', 'hal:', 'hudson:', 'keanu:', 'mlpab:', 'mlpaj:', 'mlpbm:', 'mlpca:', 'mlpfy:', 'mlppp:', 'mlprd:', 'mlpry:', 'mlpsb:', 'mlpse:', 'mlpso:', 'mlpte:', 'mlpts:', 'mlpza:', 'msdavid:', 'mszira:', 'nameless:', 'neil:', 'samuel:', 'satan:', 'stephen:', 'trump:', 'vader:', 'vmail:', 'woman:']
  },
  advertisement: {
    message: 'Attention Twitch chat. Did you know that you can use text to speech on this channel? Type exclamation mark test to play a test message, or use a command exclamation mark tts to check it yourself!',
    timeout: process.env.AD_TIMEOUT_MINUTES
  }
};

var io = require('socket.io-client')
var socket = io.connect(`${opts.server.host}:${opts.server.port}`);
const client = new tmi.client(opts);

client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);
client.connect();

var userTimestampMap = new Map();
var ttsTimeout = opts.tts.timeout * 1000;
const adminName = opts.tts.admin;

function onMessageHandler(target, context, msg, self) {
  if (self) { return; }

  messageTime = new Date();
  timestamp = messageTime.getTime();
  const commandName = msg.trim();
  displayName = context['display-name'];

  if (commandName.startsWith('!tts')) {
    if (displayName) {
      lastUserTimestamp = userTimestampMap.get(displayName);
      timeDifference = timestamp - lastUserTimestamp;

      if (displayName !== adminName && lastUserTimestamp && timeDifference < ttsTimeout) {
        client.say(target, `${displayName} you have to wait ${Math.round((ttsTimeout - timeDifference) / 1000)} seconds to send next TTS message!`);
      } else {
        if (commandName.length < 6) {
          client.say(target, `${displayName} wrong command usage! Check instructions on a panel below the stream window.`);
        } else {
          message = commandName.substring(5);
          messageLength = message.length;
          if (messageLength > 255) {
            client.say(target, `${displayName} message length: ${messageLength} exceeds the character limit!`);
          } else {
            sendTTSMessage(context.id, context.username, message, messageTime.toLocaleTimeString());
            userTimestampMap.set(displayName, timestamp);
            client.say(target, `${displayName} your message is added to the queue.`);
          }
        }
      }
    }
  } else if (commandName.startsWith('!set ttstimeout') && displayName === adminName) {
    newTimeout = commandName.substring(16);
    ttsTimeout = parseInt(newTimeout) * 1000;
    client.say(target, 'New TTS timeout: ' + newTimeout + ' seconds.');
  } else if (commandName === '!help') {
    client.say(target, `${displayName} TTS instructions are available on the panel below the stream. You can also use command !test to generate a test message using random voice.`);
  } else if (commandName === '!test') {
    lastUserTimestamp = userTimestampMap.get(displayName);
    timeDifference = timestamp - lastUserTimestamp;

    if (displayName !== adminName && lastUserTimestamp && timeDifference < ttsTimeout) {
      client.say(target, `${displayName} just let me rest for ${Math.round((ttsTimeout - timeDifference) / 1000)} seconds...`);
    } else {
      var randomVoice = opts.tts.voices[Math.floor(Math.random() * opts.tts.voices.length)];
      message = `${randomVoice} This is a test. 1, 2 and 3.`;
      sendTTSMessage(context.id, opts.identity.username, message, messageTime.toLocaleTimeString());
      userTimestampMap.set(displayName, timestamp);
      client.say(target, '!tts ' + message);
      client.say(target, `I added this message to the queue.`);
    }
  }
}

function sendTTSMessage(messageId, username, message, messageTime) {
  socket.emit('message', { messageId, username, message, messageTime });
}

function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

function sendTTSAlert() {
  var randomVoice = opts.tts.voices[Math.floor(Math.random() * opts.tts.voices.length)];
  message = `${randomVoice} ${opts.advertisement.message}`;
  messageTime = new Date().toLocaleTimeString();
  sendTTSMessage(messageTime, opts.identity.username, message, messageTime);
}

setInterval(sendTTSAlert, opts.advertisement.timeout * 60 * 1000);
