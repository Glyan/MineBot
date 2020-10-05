const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const ytdl = require("ytdl-core");
const ytsr = require("ytsr");
const ytpl = require("ytpl");

const client = new Discord.Client();
var servers = {};

function remainingArgs(args, index) {
    let slice = args.slice(index);
    if (slice.length === 0)
        return null;
    return slice.join(" ");
}

function play (connection, message) {
    var server = servers[message.guild.id];
    server.dispatcher = connection.play(ytdl(server.queue[0], {filter: "audioonly"}))
    server.queue.shift();
    console.log("play");
    server.dispatcher.on("finish", function(){
        if (server.queue[0]) {
            play(connection, message);
        } else {
            connection.disconnect();
        }
    });
}

async function searchYT (searchTerm, message) {
    const res = await ytsr(searchTerm).catch(e => {
        return message.channel.send("No search results!");
    })

    const video = res.items.filter(i => i.type === "video")[0];
    if (!video)
        return message.channel.send("No search results!");
    
    message.channel.send(video.link);
    return video.link;
}

async function searchPlaylist (searchTerm, message) {
    const res = await ytpl(searchTerm).catch(e => {
        return message.channel.send("No search results!");
    })

    var server = servers[message.guild.id];
    
    res.items.forEach(video => {
        server.queue.push(video.url);
        console.log(video.title);
    });

    if ((message.guild.voice === undefined)  || (!message.guild.voice.connection))
            message.member.voice.channel.join().then(function(connection) {
            play(connection, message);
    })
}

client.once('ready', () => {
    console.log('Ready!')
})

client.on('message', message => {
    
    let args = message.content.substring(prefix.length).split(" ");

    switch (args[0]) {
        case 'play':
            let search = remainingArgs(args, 1); 

            if (!search) {
                message.channel.send("There is no search term!");
                return;
            }

            if (!message.member.voice.channel) {
                message.channel.send("You must be in a channel to play the bot!");
                return;
            }

            if (!servers[message.guild.id]) servers[message.guild.id] = {
                queue: []
            }

            searchYT(search, message).then((url) => {
                var server = servers[message.guild.id];
                server.queue.push(url);

                if ((message.guild.voice === undefined)  || (!message.guild.voice.connection))
                    message.member.voice.channel.join().then(function(connection) {
                    play(connection, message);
                })
            }).catch((err) => {
                message.channel.send("Failed to search!");
            });
        break;

        case 'skip':
            var server = servers[message.guild.id];
            if (server.dispatcher)
                server.dispatcher.end();

            message.channel.send("Going next!");

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

        case 'pop':
            var server = servers[message.guild.id];
            if (message.guild.voice.connection) {
                server.queue.splice(server.queue.length-1, 1);
                message.channel.send("Pop!");
            }
        break;

        case 'playlist':

            let urlPlaylist = remainingArgs(args, 1); 

            if (!urlPlaylist) {
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

            searchPlaylist(urlPlaylist, message);
        break;
    }
})

client.login(token);

