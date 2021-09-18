import recommend as rec
import numpy as np

from flask import Flask, jsonify
import requests


app = Flask(__name__)
recommender = rec.Recommender()


@app.route("/")
def index():
  return 'OK'


@app.route("/features")
def js_to_py():
  response = requests.get("https://spotibot.kevinnclas.repl.co/feat")
  song = np.array(list(response.json()['features']))
  result = recommender.find_similar_tracks(song)
  print(result[0])
  print(result[1])
  print(result[2])
  return jsonify(artist = result[0], song = result[1], cosine_value = result[2])


if __name__ == '__main__':
  app.run(host='0.0.0.0', port = 8081)
  #u = recommender.features.iloc[0]
  #print(recommender.find_similar_tracks(u))
  #print(recommender.features.columns)

