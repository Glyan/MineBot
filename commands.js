const utils = require('./utils.js');

function play(servers, message, args) {
    let search = utils.remainingArgs(args, 1);

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

    var expression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
    var regex = new RegExp(expression);

    if (search.match(regex)) {
        utils.pushSong(servers, message, search);
    } else {
        utils.searchYT(message, search).then((url) => {
            utils.pushSong(servers, message, url);
        }).catch((err) => {
            message.channel.send("Failed to search!");
        });
    }
}

function skip(servers, message) {
    var server = servers[message.guild.id];
    message.channel.send("Going next...")
    if (server.dispatcher)
        server.dispatcher.end();
}

function stop(servers, message) {
    var server = servers[message.guild.id];
    if (message.guild.voice.connection) {
        for (var i = server.queue.length - 1; i >= 0; i--)
            server.queue.splice(i, 1);

        server.dispatcher.end();
        message.channel.send("Stopped!");
    }

    if (message.guild.voice.connection)
        message.guild.voice.connection.disconnect();
}

function pop(servers, message) {
    var server = servers[message.guild.id];
    if (message.guild.voice.connection) {
        server.queue.splice(server.queue.length - 1, 1);
        message.channel.send("Pop!");
    }
}

function playlist(servers, message, args) {
    let urlPlaylist = utils.remainingArgs(args, 1);

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

    utils.searchPlaylist(servers, message, urlPlaylist);
}

function view(servers, message) {
    var server = servers[message.guild.id];
    if (server.queue.length == 0)
        message.channel.send("Empty queue :(");
    else
        for (var i = 0; i < server.queue.length; i++)
            message.channel.send(server.queue[i]);
}

exports.play = play;
exports.skip = skip;
exports.stop = stop;
exports.pop = pop;
exports.playlist = playlist;
exports.view = view;