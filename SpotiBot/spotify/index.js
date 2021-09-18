const appId = process.env.CLIENT_ID;
const appKey = process.env.CLIENT_SECRET;
const spotapi = process.env.SPOTIFY_API;

const fetch = require('node-fetch');

const getSongData = async (song) => {
  try {
    const result = await fetch(`https://api.spotify.com/v1/search?q=${song}&type=track`, {
    method:'GET',
    headers: {'Authorization': 'Bearer ' + spotapi}
    });

    const data = await result.json();
    let singer = data.tracks.items[0].album.artists[0].name;
    let songname = data.tracks.items[0].name;
    let song_id = data.tracks.items[0].id;
    let release_date = data.tracks.items[0].album.release_date;
    let album = data.tracks.items[0].album.name;
    let popularity = data.tracks.items[0].popularity;

    const features = await fetch(`https://api.spotify.com/v1/audio-features/${song_id}`,{
    method:'GET',
    headers: {'Authorization': 'Bearer ' + spotapi}
    });
    const json_temp = await features.json();

    const features_data = [json_temp.acousticness,
    json_temp.danceability, json_temp.duration_ms,
    json_temp.energy, json_temp.instrumentalness,
    json_temp.key, json_temp.liveness, json_temp.loudness, json_temp.mode, popularity, json_temp.speechiness, json_temp.tempo, json_temp.valence];
    
    const infos = {
      'artist': singer,
      'title': songname,
      'release_date': release_date,
      'album': album,
      'features': features_data
    };
    console.log(infos);
    return infos;
  } catch(error) {
      console.log('Impossible to find data for this request.');
      return 'error';
  }
}

module.exports = (song) => {
	return new Promise(async function(resolve, reject) {
    let test = await getSongData(song);
    resolve(test);
  });
}