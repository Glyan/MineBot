const ytdl = require("ytdl-core");
const ytsr = require("ytsr");
const ytpl = require("ytpl");
const yts = require( 'yt-search' );

var random = false;

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
    var index = 0;
    if (random)
        index = getRandomInt(0, server.queue.length-1);
        
    console.log(random + "-" + index + "/" + server.queue.length);
    server.dispatcher = connection.play(ytdl(server.queue[index], {filter: "audioonly"}))
    message.channel.send("Now playing " + server.queue[index]);
    server.queue.splice(index, 1);
    server.dispatcher.on("finish", function(){
        if (server.queue[0])
            playSong(servers, message, connection);
        else {
            message.channel.send("No more songs");
            connection.disconnect();
        }
    });
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

async function searchYT (message, searchTerm) {
    const r = await yts(searchTerm).catch(e => {
        return message.channel.send("No search results!");
    })

    const video = r.videos[0];
    if (!video)
        return message.channel.send("No videos found!");
    
    message.channel.send("Found " + video.url);
    return video.url;
}

async function searchPlaylist (servers, message, searchTerm) {
    console.log(searchTerm);
    const res = await ytpl(searchTerm).catch(e => {
        console.log(e);
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

function setRandom (message) {
    random = !random;
    var mode =  (random)? "ON":"OFF";
    message.channel.send("Random mode: " + mode);
}

exports.remainingArgs = remainingArgs;
exports.pushSong = pushSong; 
exports.searchYT = searchYT;
exports.searchPlaylist = searchPlaylist;
exports.setRandom = setRandom;