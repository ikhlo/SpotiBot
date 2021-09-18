const Discord = require("discord.js");
const ytb = require("ytdl-core");
const ytblink = require('./ytblink');
const prefix = "!";
const Client = new Discord.Client;
const queue = new Map();
const spotify = require('./spotify');
const recommender = require('./recommender');
const witai = require('./witai');

Client.on("ready", () => {
  console.log("Spoti is connected !");
});

Client.on("message", async msg => {
  if (msg.author.bot) return;
  if(msg.channel.type == "dm") return;
  const serverQueue = queue.get(msg.guild.id);

  if (msg.content.startsWith(`${prefix}sten`)) {
    msg.channel.send("cool calme zen **" + msg.author.username + "** ?");
    return;
  } else if (msg.content.startsWith(`${prefix}hello`)) {
      instructions(msg);
      return;
  } else if (msg.content.startsWith(`${prefix}infos`)) {
      infos(msg);
      return;
  } else if (msg.content.startsWith(`${prefix}play`)) {
      execute(msg, serverQueue);
      return;
  } else if (msg.content.startsWith(`${prefix}skip`)) {
      skip(msg, serverQueue);
      return;
  } else if (msg.content.startsWith(`${prefix}pause`)) {
      pause(msg, serverQueue);
      return;
  } else if (msg.content.startsWith(`${prefix}resume`)) {
      resume(msg, serverQueue);
      return;
  } else if (msg.content.startsWith(`${prefix}stop`)) {
      stop(msg, serverQueue);
      return;
  } else if (msg.content.startsWith(`${prefix}recommend`)) {
      msg.channel.send(":thinking: Please wait I'm thinking...\n");
      recommend(msg);
      return;
  } else {
      witAI(msg, serverQueue);
      return;
  }
});

function instructions(msg) {
  const infos = new Discord.MessageEmbed()
	.setColor('#1DB954')
	.setTitle(":grin: Hello, I'm SpotiBot !")
	.setURL('https://github.com/kevinnclas/SpotiBot')
	.setDescription("for the **!infos**, **!play** and **!recommend** commands, you have to indicate both **artist** and **song title** this way : \n" +
  "!cmd _**artist name / song title**_")
	.setThumbnail('https://i.imgur.com/5FxBDdQ.png')
	.addFields(
    { name: '**Commands**', value: 'Check the list below :'},
		{ name: '**!infos**', value: 'Informations about a song', inline: true },
		{ name: '**!play**', value: 'Play a song or add one to the queue', inline: true },
    { name: '**!pause**', value: 'Pause the playing song', inline: true },
    { name: '**!resume**', value: 'Resume the song', inline: true },
    { name: '**!skip**', value: 'Skip to the next song in the queue', inline: true },
    { name: '**!stop**', value: 'Stop everything', inline: true },
    { name: '**!recommend**', value: 'Recommend you a song based on the features of a song', inline: true },
    { name: "**'Spoti, who sang...?'** or **'who has sung...?'**", value: "If you forgot the artist of your song, don't worry ! Give your song title and SpotiBot will try to help you."},
    { name: "**'Spoti, can you play... by...?'**", value: "You can also ask me directly to play a song."},
	)
	.setTimestamp()
	.setFooter('OeTeamo', 'https://i.imgur.com/5FxBDdQ.png');

  return msg.channel.send(infos);
}

async function witAI(msg, serverQueue) {
  let response = await witai(msg.content);
  console.log(response);
  
  if (typeof response === 'string') {
    let args = response.split(" / ");
    const voiceChannel = msg.member.voice.channel;
    if (voiceChannel) {
      let rm_cmd = args[0];
      rm_cmd = rm_cmd.split("!play ");
      let artist = rm_cmd[1];
      let title = args[1];
      var video_link = await ytblink(artist, title);
      let uselink = video_link.url_link;
      let completelink = `https://www.youtube.com/watch?v=${uselink}`;
      let testspotify = await spotify(artist + " " + title);
      artist = testspotify.artist;
      title = testspotify.title;
      console.log("artist : " + artist);
      console.log("title : " + title);
      console.log(completelink);
      console.log(testspotify);

      const song = {
        artiste: artist,
        titre: title,
        url: completelink
      };

      if (!serverQueue) {
        const queueConstruct = {
          textChannel: msg.channel,
          voiceChannel: voiceChannel,
          connection: null,
          songs: [],
          volume: 5,
          playing: true
        }

        queue.set(msg.guild.id, queueConstruct);
        queueConstruct.songs.push(song);
        try {
          var connection = await voiceChannel.join();
          queueConstruct.connection = connection;
          play(msg.guild, queueConstruct.songs[0]);
        } catch(err) {
          console.log(err);
          queue.delete(msg.guild.id);
          return msg.channel.send(err);
        }
      }
      else {
        serverQueue.songs.push(song);
        return msg.channel.send(`:hourglass: **${song.artiste} - ${song.titre}** has been added to the queue !`);
      }
    } 
    else {
      msg.reply(":no_entry: Please join a vocal channel first !");
    }
  }
  if (Array.isArray(response)) {
    msg.channel.send(`:bulb: Hey **${msg.author.username}** ! \nI found 3 artists that you might be looking for your song :\n`);
    for (let i = 0; i < response.length; i++) {
      msg.channel.send(`**${response[i].artist}**`);
    }
    msg.channel.send(`\nNow you can try them with the **!play** command and you can see how it's working with the **!hello** command if you never used it !`);
  }
  else {
    return;
  }
}

async function infos(msg) {
  if (msg.content.includes("/") == false) {
    return msg.channel.send(":no_entry: Wrong use of the command, please see the **!hello** command to help you build a valid one.");
  } else {
    let args = msg.content.split(" / ");
    let rm_cmd = args[0];
    rm_cmd = rm_cmd.split("!infos ");
    let artist = rm_cmd[1];
    let title = args[1];
    let infosSpotify = await spotify(artist + " " + title);
    if (infosSpotify === 'error') {
      msg.channel.send(`:interrobang: Sorry I can't find anything... Please try again with another song.`);
      return;
    }
    artist = infosSpotify.artist;
    title = infosSpotify.title;
    let album = infosSpotify.album;
    let release_date = infosSpotify.release_date;
    const song_infos = `:bulb: Here are some general informations about this song : \n
    - **artist :** ${artist}
    - **song title :** ${title}
    - **release date :** ${release_date}
    - **album :** ${album}`;
    console.log(msg.content);
    console.log(infosSpotify);
    return msg.channel.send(song_infos);
  }
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }
  const dispatcher = serverQueue.connection.play(ytb(song.url, { quality: "highestaudio" }));

  dispatcher.on("finish", () => {
    serverQueue.songs.shift();
    play(guild, serverQueue.songs[0]);
  });

  dispatcher.on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume/5);
  serverQueue.textChannel.send(`:white_check_mark: I'm playing : **${song.artiste} - ${song.titre}**`);
}

async function execute(msg, serverQueue) {
  if (msg.content.includes("/") == false) {
    return msg.channel.send(":no_entry: Wrong use of the command, please see the **!hello** command to help you build a valid one.");
  } else {
    let args = msg.content.split(" / ");
    const voiceChannel = msg.member.voice.channel;
    if (voiceChannel) {
      let rm_cmd = args[0];
      rm_cmd = rm_cmd.split("!play ");
      let artist = rm_cmd[1];
      let title = args[1];
      var video_link = await ytblink(artist, title);
      if (video_link === 'error') {
        msg.channel.send(`:interrobang: Sorry I can't find anything... Please try again with another song.`);
        return;
      }
      let uselink = video_link.url_link;
      let completelink = `https://www.youtube.com/watch?v=${uselink}`;
      let testspotify = await spotify(artist + " " + title);
      artist = testspotify.artist;
      title = testspotify.title;
      console.log("artist : " + artist);
      console.log("title : " + title);
      console.log(completelink);
      console.log(msg.content);
      console.log(testspotify);

      const song = {
        artiste: artist,
        titre: title,
        url: completelink
      };

      if (!serverQueue) {
        const queueConstruct = {
          textChannel: msg.channel,
          voiceChannel: voiceChannel,
          connection: null,
          songs: [],
          volume: 5,
          playing: true
        }

        queue.set(msg.guild.id, queueConstruct);
        queueConstruct.songs.push(song);
        try {
          var connection = await voiceChannel.join();
          queueConstruct.connection = connection;
          play(msg.guild, queueConstruct.songs[0]);
        } catch(err) {
          console.log(err);
          queue.delete(msg.guild.id);
          return msg.channel.send(err);
        }
      }
      else {
        serverQueue.songs.push(song);
        return msg.channel.send(`:hourglass: **${song.artiste} - ${song.titre}** has been added to the queue !`);
      }
    } 
    else {
      msg.reply(":no_entry: Please join a vocal channel first !");
    }
  }
}

function skip(msg, serverQueue) {
  if (!msg.member.voice.channel) {
    return msg.channel.send(":no_entry: You have to be in a voice channel to change the music !");
  }
  if (!serverQueue) {
    return msg.channel.send(":grey_question: There is no song that I can skip !");
  }
  serverQueue.connection.dispatcher.end();
  msg.channel.send(":fast_forward: Skipped to next song.");
}

function pause(msg, serverQueue) {
  if (!serverQueue.connection) {
    return msg.channel.send(":grey_question: There is no music currently playing !");
  }
  if (!msg.member.voice.channel) {
    return msg.channel.send(":no_entry: You have to be in a voice channel to change the music !");
  }
  if (serverQueue.connection.dispatcher.paused) {
    return msg.channel.send(":grey_exclamation: The song is already paused.");
  }
  serverQueue.connection.dispatcher.pause();
  msg.channel.send(":pause_button: **Pause**");
}

function resume(msg, serverQueue) {
  if (!serverQueue.connection) {
    return msg.channel.send(":grey_question: There is no music currently playing !");
  }
  if (!msg.member.voice.channel) {
    return msg.channel.send(":no_entry: You have to be in a voice channel to change the music !");
  }
  if (serverQueue.connection.dispatcher.resumed) {
    return msg.channel.send(":grey_exclamation: The song is already playing.");
  }
  serverQueue.connection.dispatcher.resume();
  msg.channel.send(":arrow_forward: **Play**");
}

function stop(msg, serverQueue) {
  if (!msg.member.voice.channel) {
    return msg.channel.send(":no_entry: You have to be in a voice channel to stop the music !");
  }
  if (!serverQueue) {
    return msg.channel.send(":grey_question: There is no song that I can stop !");
  }
  if (serverQueue.connection.dispatcher.paused) {
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
  }
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
  msg.channel.send(":stop_button: **Stop**");
}

async function recommend(msg) {
  if (msg.content.includes("/") == false) {
    return msg.channel.send(":no_entry: Wrong use of the command, please see the **!hello** command to help you build a valid one.");
  } else {
    let args = msg.content.split(" / ");
    let rm_cmd = args[0];
    rm_cmd = rm_cmd.split("!recommend ");
    let artist = rm_cmd[1];
    let title = args[1];
    let recommended = await recommender(artist + " " + title);
    if (recommended === 'error') {
      msg.channel.send(`:interrobang: Sorry I can't find anything... Please try again with another song.`);
      return;
    }
    console.log(msg.content);
    console.log(recommended);
    let suggestion = `:nerd: Based on your song... I suggest you **${recommended.song}** by **${recommended.artist}**. \nTry it now with the **!play** command or save it for later !`;
    return msg.channel.send(suggestion);
  }
}

Client.login(process.env.TOKEN);