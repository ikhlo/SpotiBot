import numpy as np
import pandas as pd

def normalize(s):
  min_val = s.min()
  max_val = s.max()
  return ((s-min_val)/(max_val - min_val))

def cosine_sim(u, v):
  return np.dot(u,v)/(np.linalg.norm(u)*np.linalg.norm(v))

class Recommender:

  def __init__(self):
    df = pd.read_csv('recommend_data.csv')

    self.tracks_label = df[['artists','name']]
    self.tracks_label.columns = ['Artists', 'Song_name']

    self.features = df.iloc[:,~df.columns.isin(['artists','name','popularity'])]
    self.feat_norm = None


  def normalize_feat(self, song=None):
    temp = self.features.copy()
    if song is not None:
      temp = temp.append(pd.Series(song, index=temp.columns), ignore_index=True)
    temp = temp.apply(normalize)
    return temp


  def find_similar_tracks(self, song):

    feat_norm = self.normalize_feat(song)
    song = feat_norm.iloc[-1]

    n = np.random.randint(feat_norm.shape[0]-20000)

    sub_df = feat_norm.iloc[n:(n+20000), :].copy()
    sim_songs = sub_df.apply(lambda x: cosine_sim(song, x), axis=1)
    
    index_sim_songs = sim_songs.sort_values(ascending=False).index[0]

    cosine_value = sim_songs.sort_values(ascending=False).iloc[0]
    

    artist = eval(self.tracks_label.loc[index_sim_songs].values[0])[0]

    song_name = self.tracks_label.loc[index_sim_songs].values[1]

    return artist, song_name, cosine_value