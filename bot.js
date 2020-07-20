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

  if (commandName.startsWith("!tts ")) {
    name = context['display-name']
    message = commandName.substring(5)
    messageLength = message.length
    if (messageLength > 255) {
      client.say(target, `${name} message length: ${messageLength} exceeds the character limit!`);
    } else {
      client.say(target, `${name} your message is added to the queue.`);
      username = context.username
      socket.emit('message', {username, message});
    }
  } else if (commandName.startsWith("!help")) {
    client.say(target, "Maximum message length is 255 characters. Example  --  !tts david: Get out of that uh, jabroni outfit. neil: Yeah, smart ass.");
  } else if (commandName.startsWith("!voices")) {
    client.say(target, "Available voices: david, neil, woman. Default voice -> woman.");
  }
}

function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}
