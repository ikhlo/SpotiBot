const request = require('request');

const getYtbLink = (artist, title) => {
	return new Promise((resolve, reject) => {
    request(`https://youtube.googleapis.com/youtube/v3/search?q=${artist}%20${title}&key=${process.env.YOUTUBE_API}`, { json: true }, (err, res, body) => {
      try{
        if (err) { return console.log(err); }
        
        const url_link = body.items[0].id.videoId;
        const infos = {
          'url_link': url_link
        };
        resolve(infos);
      } catch(error){
        console.log('Impossible to find data for this request.');
        resolve('error');
      }
    });
	});
}

module.exports = (artist, title) => {
	return new Promise(async function(resolve, reject) {
    try {
      let ytb_link = await getYtbLink(artist, title);
      resolve(ytb_link);
    } 
    catch(error) {
      reject(error);
    }
  });
}