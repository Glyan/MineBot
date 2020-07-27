const Discord = require('discord.js');
const { prefix, token } = require('./config.json')

const client = new Discord.Client();

client.once('ready', () => {
    console.log('Ready!')
})

client.on('message', message => {
    if (message.content.startsWith(`${prefix}random`))
        message.channel.send("Random playing");
})

client.login(token);

