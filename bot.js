var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = 3000;

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  socket.on('new message', (data) => {
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });
});

const tmi = require('tmi.js');

const opts = {
  identity: {
    username: 'bart3s',
    password: 'oauth:bf2i9nu8h1jae3eehziqvl7bja8kxv'
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
    if (message.startsWith('david: ') || message.startsWith('neil: ')) {
      client.say(target, `${name} your message is added to the queue.`);
    } else {
      client.say(target, `${name} wrong message format!`);
    }
  }
}

function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}
