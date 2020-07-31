var io = require("socket.io-client")
var socket = io.connect("http://localhost:3000");

const tmi = require('tmi.js');

const opts = {
  identity: {
    username: 'bart3sbot',
    password: 'oauth:lm3ffflgrzrhibyf8zlmkixzip0ink'
  },
  channels: [
    'bart3s'
  ]
};

const client = new tmi.client(opts);

client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);
client.connect();

function onMessageHandler (target, context, msg, self) {
  if (self) { return; }

  const commandName = msg.trim();

  if (commandName.startsWith("!tts")) {
    name = context['display-name']
    message = commandName.substring(5)
    messageLength = message.length
    if (commandName.length < 6) {
      client.say(target, `${name} wrong command usage! Type !help to get instructions.`);
    } else {
      if (messageLength > 255) {
        client.say(target, `${name} message length: ${messageLength} exceeds the character limit!`);
      } else {
        client.say(target, `${name} your message is added to the queue.`);
        username = context.username
        socket.emit('message', {username, message});
      }
    } 
  } else if (commandName === "!help") {
    client.say(target, "Maximum message length is 255 characters. Example  ->  !tts stephen: Fuck you! david: Ah, fuck you leather man.");
  } else if (commandName === "!voices") {
    client.say(target, "Available voices: david, neil, stephen, woman. Default voice  ->  woman.");
  } else if (commandName === "!emotes") {
    client.say(target, "BTTV emotes: GachiPls Clap WAYTOODANK gachiBASS gachiHYPER TeaTime EZ PepegaAim DonaldPls pepeD catJAM SkeletonPls ppOverheat ModTime billyReady");
    client.say(target, "FFZ emotes: 5Head AYAYA FeelsDankMan FeelsOkayMan FeelsStrongMan HYPERDANSGAME HandsUp KKonaW LULW MEGALUL MaN OMEGALUL PagChomp PepeHands PepeLaugh Pepega Pepepains REEeee Sadge VaN WeirdChamp gachiGASM monkaOMEGA monkaW monkaHmm");
  }
}

function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

function sendFollowAlert() {
  client.say("bart3s", 'If you like the channel, remember to follow <3');
}

function sendCommandsAlert() {
  client.say("bart3s", "Available commands: !tts !help !voices !emotes");
}

setInterval(sendCommandsAlert, 1.5 * 60 * 1000);
setInterval(sendFollowAlert, 2 * 60 * 1001);
