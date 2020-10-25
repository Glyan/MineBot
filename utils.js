const ytdl = require("ytdl-core");
const ytsr = require("ytsr");
const ytpl = require("ytpl");

function remainingArgs(args, index) {
    let slice = args.slice(index);
    if (slice.length === 0)
        return null;
    return slice.join(" ");
}

function pushSong(servers, message, url) {
    var server = servers[message.guild.id];
    server.queue.push(url);

    if ((message.guild.voice === undefined) || (!message.guild.voice.connection))
        message.member.voice.channel.join().then(function (connection) {
            playSong(servers, message, connection);
        })
}

function playSong (servers, message, connection) {
    var server = servers[message.guild.id];
    server.dispatcher = connection.play(ytdl(server.queue[0], {filter: "audioonly"}))
    message.channel.send("Now playing " + server.queue[0]);
    server.queue.shift();
    server.dispatcher.on("finish", function(){
        if (server.queue[0])
            playSong(servers, message, connection);
        else {
            message.channel.send("No more songs");
            connection.disconnect();
        }
    });
}

async function searchYT (message, searchTerm) {
    const res = await ytsr(searchTerm).catch(e => {
        console.log(e);
        return message.channel.send("No search results!");
    })

    const video = res.items.filter(i => i.type === "video")[0];
    if (!video)
        return message.channel.send("No search results!");
    
    message.channel.send(video.link);
    return video.link;
}

async function searchPlaylist (servers, message, searchTerm) {
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
            playSong(servers, message, connection);
    })
}

exports.remainingArgs = remainingArgs;
exports.pushSong = pushSong; 
exports.searchYT = searchYT;
exports.searchPlaylist = searchPlaylist;