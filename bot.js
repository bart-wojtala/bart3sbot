var io = require("socket.io-client")
var socket = io.connect("http://localhost:3000");

const tmi = require('tmi.js');
const dotenv = require('dotenv');
dotenv.config();

const opts = {
  identity: {
    username: process.env.BOT_USERNAME,
    password: process.env.BOT_TOKEN
  },
  channels: [
    process.env.CHANNEL_NAME
  ]
};

const client = new tmi.client(opts);

client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);
client.connect();

var userTimestampMap = new Map()
const ttsTimeout = 20000

function onMessageHandler(target, context, msg, self) {
  if (self) { return; }

  messageTime = new Date();
  timestamp = messageTime.getTime();
  const commandName = msg.trim();

  if (commandName.startsWith("!tts")) {
    name = context['display-name']
    lastUserTimestamp = userTimestampMap.get(name);
    timeDifference = timestamp - lastUserTimestamp;

    if (lastUserTimestamp && timeDifference < ttsTimeout) {
      client.say(target, `${name} you have to wait ${Math.round((ttsTimeout - timeDifference) / 1000)} seconds to send next TTS message!`);
    } else {
      userTimestampMap.set(name, timestamp);
      if (commandName.length < 6) {
        client.say(target, `${name} wrong command usage! Type !help to get instructions.`);
      } else {
        message = commandName.substring(5)
        messageLength = message.length
        if (messageLength > 255) {
          client.say(target, `${name} message length: ${messageLength} exceeds the character limit!`);
        } else {
          client.say(target, `${name} your message is added to the queue.`);
          username = context.username
          messageTime = messageTime.toLocaleTimeString();
          messageId = context.id
          socket.emit('message', { messageId, username, message, messageTime });
        }
      }
    }
  } else if (commandName === "!bttv") {
    client.say(target, "BTTV emotes: GachiPls Clap WAYTOODANK gachiBASS gachiHYPER TeaTime EZ PepegaAim DonaldPls pepeD catJAM SkeletonPls ppOverheat ModTime billyReady");
  } else if (commandName === "!ffz") {
    client.say(target, "FFZ emotes: 5Head AYAYA FeelsDankMan FeelsOkayMan FeelsStrongMan HYPERDANSGAME HandsUp KKonaW LULW MEGALUL MaN OMEGALUL PagChomp PepeHands PepeLaugh Pepega pOg REEeee Sadge VaN WeirdChamp gachiGASM monkaOMEGA monkaW monkaHmm");
  }
}

function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

function sendFollowAlert() {
  client.say(opts.channels[0], 'If you like the channel, remember to follow <3');
}

function sendCommandsAlert() {
  client.say(opts.channels[0], "Available commands: !tts !bttv !ffz");
}

setInterval(sendCommandsAlert, 2 * 60 * 1000);
setInterval(sendFollowAlert, 5 * 60 * 1000);
