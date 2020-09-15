const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const ytdl = require("ytdl-core");

const client = new Discord.Client();
var servers = {};

client.once('ready', () => {
    console.log('Ready!')
})

client.on('message', message => {
    
    let args = message.content.substring(prefix.length).split(" ");

    switch (args[0]) {
        case 'play':
            if (!args[1]) {
                message.channel.send("There is no link!");
                return;
            }

            if (!message.member.voiceChannel) {
                message.channel.send("You must be in a channel to play the bot!")
                return;
            }

            if (!servers[message.guild.id]) servers[message.guild.id] = {
                queue: []
            }
            
        break;
    }
})

client.login(token);

