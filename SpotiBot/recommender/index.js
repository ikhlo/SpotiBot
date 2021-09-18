const express = require('express');
const fetch = require('node-fetch');
const spotify = require('../spotify');
const port = 3000;
const app = express();


async function recommended_song(song) {
  let result = spotify(song).then(function (track) {
  app.get('/feat', (req,res) => {
    res.send({"features" : track.features});
  });
}).then(async function () {
  const similar = await fetch(`https://spotibotrecommend.ikhlo.repl.co/features`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(async function (result2) {
    let a = await result2.json();
    return a;
  });
  return similar;
  });
  return result;
}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

module.exports = (song) => {
	return new Promise(async function(resolve, reject) {
    let reco_song = await recommended_song(song);
    resolve(reco_song);
  });
}