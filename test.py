import json
import os

from keras.models import load_model
from numpy import argmax

import CONFIG
from reader import KerasBatchGenerator, load_data

_, _, _total_words, reversed_dictionary, dictionary = load_data()


_model = load_model(os.path.join(os.getcwd(), 'model', 'model.h5'))

while True:
  input_string = input('\n\nEnter 3 words: \n')
  input_string = input_string.split()
  input_string = input_string[3:]
  idx = []
  for i in input_string:
    if i == '.':
      i = '<eos>'
    try:
      idx.append(dictionary[i])
    except:
      print('Word ', i, ' donot exist')
      i = '<unk>'
      idx.append(dictionary[i])
      pass

  string = ''

  for i in idx:
    string += reversed_dictionary[i] + ' '

  prediction = _model.predict([[idx]])
  best = []

  for i in range(9):
    argmax_idx = argmax(prediction[:, CONFIG._num_steps - 1, :])
    best.append(argmax_idx)
    prediction[:, CONFIG._num_steps - 1, argmax_idx] = 0.0

  print(best)
  for i in best:
    word = reversed_dictionary[i]
    if word == '<eos>':
      word = '.'
    if word == '<unk>':
      word = '<rare word>'
    print(string + word)
