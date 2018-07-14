import json
import os

from numpy import argmax
from tensorflow.keras import metrics
from tensorflow.keras.models import load_model

import CONFIG
from reader import BatchGenerator, load_data

_, _, _, reversed_dictionary, dictionary = load_data()


_model = load_model(os.path.join(os.getcwd(), 'model', 'model.h5'))

while True:
  input_string = input('\n\nEnter 3 words: \n')
  _input_string = input_string.split()[-3:]
  print('last 3 words\t:', _input_string)
  idx = []
  for i in _input_string:
    if i == '.':
      i = '<eos>'
    try:
      idx.append(dictionary[i])
    except:
      print('Word ', i, ' donot exist')
      i = '<unk>'
      idx.append(dictionary[i])
      pass

  print('word to indexes\t:', idx)
  prediction = _model.predict([[idx]])
  best = []

  for i in range(9):
    argmax_idx = argmax(prediction[:, CONFIG._num_steps - 1, :])
    best.append(argmax_idx)
    prediction[:, CONFIG._num_steps - 1, argmax_idx] = 0.0

  print('prediction\t:', best)
  for i in best:
    word = reversed_dictionary[i]
    if word == '<eos>':
      word = '.'
    if word == '<unk>':
      word = '<rare word>'
    print(input_string, word)
