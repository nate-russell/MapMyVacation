from PIL import Image
import numpy as np
import urllib.request
import io
import tarfile
import tensorflow as tf
from sklearn.manifold import TSNE
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.decomposition import PCA
import sys
import os
from scripts.tensorflow_model import TFModel
from scripts.imgur_albums import *
import matplotlib.pyplot as plt
import json

sys.path.append("C:\\Users\\nate\\models")
from colorthief import ColorThief
import io


def get_color(img_url):
    with urllib.request.urlopen(img_url) as url:
        f = io.BytesIO(url.read())
    color_thief = ColorThief(f)
    # get the dominant color
    rgb_tuples = color_thief.get_palette(color_count=6, quality=1)
    return ['#%02x%02x%02x' % rgb_tuple for rgb_tuple in rgb_tuples]


def url_2_img(URL):
    with urllib.request.urlopen(URL) as url:
        f = io.BytesIO(url.read())
        img = Image.open(f)
        img.show()


class SemanticMap:
    def __init__(self):
        self.load_tensorflow_model('url')
        pass

    def load_tensorflow_model(self, path):
        self.tfmodel = TFModel(path)
        pass

    def embed(self, X):
        print('Embedding..')
        X = StandardScaler().fit_transform(X)
        X = PCA(n_components=100).fit_transform(X)
        X = TSNE(n_components=2).fit_transform(X)
        X = MinMaxScaler().fit_transform(X)
        return X

    def build_map(self, lim=1500):
        semantic_list = []
        vectors = []
        client_dict = get_client_keys()
        # If you already have an access/refresh pair in hand
        client_id = client_dict['client_id']
        client_secret = client_dict['client_secret']
        refresh_token = client_dict['refresh_token']

        # Note since access tokens expire after an hour, only the refresh token is required (library handles autorefresh)
        client = ImgurClient(client_id, client_secret, refresh_token)

        img_count = 0
        for i, album in enumerate(client.get_account_albums('NateRussell1')):
            if img_count >= lim: break
            album_title = album.title if album.title else 'Untitled'

            for j, image in enumerate(client.get_album_images(album.id)):

                if img_count >= lim: break

                image_link = image.link[0:4] + 's' + image.link[4:]
                thumbnail_link = image_link[:-4] + 'm' + image_link[-4:]
                print('Album %d, Image %d, url: %s' % (i, j, thumbnail_link))

                x, label_list = self.tfmodel.url_2_x(thumbnail_link)

                img_dict = {
                    "album": album.id,
                    "url": thumbnail_link,
                    "labels": label_list,
                    "color": get_color(thumbnail_link),
                }
                semantic_list.append(img_dict)
                vectors.append(x)
                img_count += 1

        X = np.vstack(vectors)
        print(X.shape)
        X = self.embed(X)

        nrows, ncols = X.shape
        for i in range(nrows):
            semantic_list[i]["x"] = float(X[i, 0])
            semantic_list[i]["y"] = float(X[i, 1])
            print(X[i, 0])
            print(type(float(X[i, 0])))

        print(semantic_list)

        with open('../data/semantic.json', 'w') as outfile:
            json.dump(semantic_list, outfile, indent=4)

        plt.figure()
        plt.scatter(X[:, 0], X[:, 1])
        plt.show()


if __name__ == '__main__':
    sm = SemanticMap()
    sm.build_map()
