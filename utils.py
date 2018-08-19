import collections
import json
import os

import numpy as np
import tensorflow as tf
from tensorflow.keras.utils import to_categorical

data_path = os.path.join(os.getcwd(), 'data')

def load_dictionary(path):
  return json.loads(open(path).read())

def read_words(filename):
  with tf.gfile.GFile(filename, 'r') as f:
    return f.read().replace('\n', '<eos>').split()


def build_vocab(filename):
  data = read_words(filename)

  counter = collections.Counter(data)
  count_pairs = sorted(counter.items(), key=lambda x: (-x[1], x[0]))

  words, _ = list(zip(*count_pairs))
  word_to_id = dict(zip(words, range(len(words))))

  return word_to_id


def file_to_word_ids(filename, word_to_id):
  data = read_words(filename)
  return [word_to_id[word] for word in data if word in word_to_id]


def load_data():
  train_path = os.path.join(data_path, 'ptb.train.txt')
  valid_path = os.path.join(data_path, 'ptb.valid.txt')

  word_to_id = build_vocab(train_path)
  train_data = file_to_word_ids(train_path, word_to_id)
  valid_data = file_to_word_ids(valid_path, word_to_id)
  total_words = len(word_to_id)
  reversed_dictionary = dict(zip(word_to_id.values(), word_to_id.keys()))
  dictionary = {value: key for key, value in reversed_dictionary.items()}

  print('\ntotalwords : ', total_words, '\n')
  return train_data, valid_data, total_words, reversed_dictionary, dictionary


def save_json(dictionary, filename):
  with open(filename, 'w') as fp:
    json.dump(dictionary, fp)


class BatchGenerator(object):

  def __init__(self, data, num_steps, batch_size, total_words, skip_step=5):
    self.data = data
    self.num_steps = num_steps
    self.batch_size = batch_size
    self.total_words = total_words
    self.current_idx = 0
    self.skip_step = skip_step

  def generate(self):
      x = np.zeros((self.batch_size, self.num_steps))
      y = np.zeros((self.batch_size, self.num_steps, self.total_words))
      while True:
        for i in range(self.batch_size):
          if self.current_idx + self.num_steps >= len(self.data):
              self.current_idx = 0
          x[i, :] = self.data[self.current_idx:self.current_idx + self.num_steps]
          temp_y = self.data[self.current_idx +
                             1:self.current_idx + self.num_steps + 1]
          y[i, :, :] = to_categorical(
              temp_y, num_classes=self.total_words)
          self.current_idx += self.skip_step
        yield x, y
