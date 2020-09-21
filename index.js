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

            function play (connection, message) {
                var server = servers[message.guild.id];
                server.dispatcher = connection.play(ytdl(server.queue[0], {filter: "audioonly"}))
                server.queue.shift();

                server.dispatcher.on("finish", function(){
                    if (server.queue[0]) {
                        play(connection, message);
                    } else {
                        connection.disconnect();
                    }
                });
            }

            if (!args[1]) {
                message.channel.send("There is no link!");
                return;
            }

            if (!message.member.voice.channel) {
                message.channel.send("You must be in a channel to play the bot!");
                return;
            }

            if (!servers[message.guild.id]) servers[message.guild.id] = {
                queue: []
            }

            var server = servers[message.guild.id];
            server.queue.push(args[1]);

            if ((message.guild.voice === undefined)  || (!message.guild.voice.connection))
                message.member.voice.channel.join().then(function(connection) {
                    play(connection, message);
                })
            
        break;

        case 'skip':
            var server = servers[message.guild.id];
            if (server.dispatcher)
                server.dispatcher.end();

            message.channel.send("Going!");

        break;

        case 'stop':
            var server = servers[message.guild.id];
            if (message.guild.voice.connection) {
                for (var i = server.queue.length-1; i >= 0; i--) 
                    server.queue.splice(i, 1);

                server.dispatcher.end();
                message.channel.send("Stopped!");
            }

            if (message.guild.voice.connection)
                message.guild.voice.connection.disconnect();
        break;
    }
})

client.login(token);

