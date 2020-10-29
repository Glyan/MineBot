const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const commands = require('./commands')

const client = new Discord.Client();
var servers = {};
var random = false;

client.once('ready', () => {
    console.log('Ready!')
})

client.on('message', message => {
    
    let args = message.content.substring(prefix.length).split(" ");
    
    switch (args[0]) {
        case 'play': commands.play(servers, message, args, random); break;
        case 'skip': commands.skip(servers, message); break;
        case 'stop': commands.stop(servers, message); break; 
        case 'pop': commands.pop(servers, message); break; 
        case 'playlist': commands.playlist(servers, message, args, random); break;
        case 'view': commands.view(servers, message); break;
        case 'random': commands.random(random); break;
    }
})

client.login(token);

