'''
Code borrowed heavily from:
http://warmspringwinds.github.io/tensorflow/tf-slim/2016/10/30/image-classification-and-segmentation-using-tensorflow-and-tf-slim/
'''

import sys

sys.path.append("C:\\Users\\nate\\models\\slim")

from matplotlib import pyplot as plt
import numpy as np
import os
import tensorflow as tf
import urllib
from time import time

from datasets import imagenet, dataset_utils
from nets import vgg, inception_resnet_v2
from preprocessing import vgg_preprocessing

'''
model_url = "http://download.tensorflow.org/models/vgg_16_2016_08_28.tar.gz"

# Specify where you want to download the model to

print(checkpoints_dir)

if not tf.gfile.Exists(checkpoints_dir):
    tf.gfile.MakeDirs(checkpoints_dir)

dataset_utils.download_and_uncompress_tarball(model_url, checkpoints_dir)
'''


class TFModel:
    def __init__(self, model_url, n_labels=5):
        ''' init Model, checkpoints dir, model properties'''
        self.checkpoints_dir = os.path.join(os.path.dirname(__file__), 'checkpoints')
        self.slim = tf.contrib.slim
        self.image_size = vgg.vgg_16.default_image_size
        self.names = imagenet.create_readable_names_for_imagenet_labels()
        self.n_labels = n_labels

    def url_2_x(self, url):
        ''' Pass url through network'''
        with tf.Graph().as_default():
            # Open specified url and load image as a string
            with urllib.request.urlopen(url) as url_img:
                image_string = url_img.read()
            image = tf.image.decode_jpeg(image_string, channels=3)
            processed_image = vgg_preprocessing.preprocess_image(image,
                                                                 self.image_size,
                                                                 self.image_size,
                                                                 is_training=False)
            processed_images = tf.expand_dims(processed_image, 0)

            with self.slim.arg_scope(vgg.vgg_arg_scope()):
                logits, _ = vgg.vgg_16(processed_images,
                                       num_classes=1000,
                                       is_training=False)

            probabilities = tf.nn.softmax(logits)

            self.init_fn = self.slim.assign_from_checkpoint_fn(
                os.path.join(self.checkpoints_dir, 'vgg_16.ckpt'),
                self.slim.get_model_variables('vgg_16'))

            with tf.Session() as self.sess:
                self.init_fn(self.sess)

                probabilities, logits = self.sess.run([probabilities, logits])
                probabilities = probabilities[0, 0:]
                sorted_inds = [i[0] for i in sorted(enumerate(-probabilities),
                                                    key=lambda x: x[1])]
            # Generate Top n_labels and their probs
            label_list = []
            for i in range(self.n_labels):
                index = sorted_inds[i]
                label_list.append({
                    "label": str(self.names[index + 1]),
                    "value": float(probabilities[index]),
                    "index": i,
                })
            label_list = sum(zip(reversed(label_list), label_list), ())[:len(label_list)]

        return np.array(logits[0]), label_list


if __name__ == '__main__':
    tfm = TFModel('url')
    x, ldict = tfm.url_2_x("https://i.imgur.com/q5T3e5Km.jpg")
    print(ldict)
    x, ldict = tfm.url_2_x("https://i.imgur.com/uHz1RzCm.jpg")
    print(ldict)
    x, ldict = tfm.url_2_x("https://i.imgur.com/KG6QZbhm.jpg")
    print(ldict)
    x, ldict = tfm.url_2_x("https://i.imgur.com/yMa9Jwnm.jpg")
    print(ldict)
