const {Wit, log} = require('node-wit');

const wit_client = new Wit({accessToken: process.env.WIT_TOKEN});

const getSinger = async (song) => {
  const req = await fetch(`https://api.spotify.com/v1/search?q=${song}&type=track`,{
  method:'GET',
  headers: {'Authorization': 'Bearer ' + process.env.SPOTIFY_API}
  });

  const json = await req.json();
  const data = json.tracks.items;
  const limit = Math.min(3, data.length);
  const result = [];
  var i;
  for (i = 0; i < limit; i++) {
    result.push({
      'artist' : data[i].album.artists[0].name,
    });
  }
  return result;
}

module.exports = async (msg) => {
  console.log(msg);
	let result = wit_client.message(msg).then(async (data) => {
    if (data['intents'].length <= 0) {
      return null;
    } else if (data['intents'][0]['confidence'] > 0.85 && Object.keys(data['entities']).length > 0) {

      if (data['intents'][0]['name'] == 'getSinger') {
        let singer = await getSinger(data['entities']['song:song'][0].value);
        return singer;
      }
      //playsong
      else {
        let song = data['entities']['song:song'][0].value;
        // if we have song and singer
        if(Object.keys(data['entities']).length == 2) {
          let artist = data['entities']['singer:singer'][0].value;
          return `!play ${artist} / ${song}`
        }
        //we only have the song
        else {
          let artists = await getSinger(song);
          return `!play ${artists[0]['artist']} / ${song}`;
        }
      }
    }
  }).catch(console.error);
  return result;
}
