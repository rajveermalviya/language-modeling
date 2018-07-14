import os

from numpy import argmax
from tensorflow.keras import metrics
from tensorflow.keras.models import load_model

import CONFIG
from utils import BatchGenerator, load_data

_, _, _, reversed_dictionary, dictionary = load_data()


model = load_model(os.path.join(os.getcwd(), 'model', 'model.h5'))

while True:
  input_string = input('\n\nEnter atleast 3 words: \n')

  input_string_array = input_string.split()[-3:]

  if len(input_string_array) >= 3:
    print('last 3 words\t:', input_string_array)
    idx = []
    for i in input_string_array:
      if i == '.':
        i = '<eos>'
      try:
        idx.append(dictionary[i])
      except:
        print('Word ', i, ' does not exist')
        i = '<unk>'
        idx.append(dictionary[i])
        pass

    print('word to indexes\t:', idx)
    prediction = model.predict([[idx]])
    best_predictions = list()

    for i in range(3):
      argmax_idx = argmax(prediction[:, CONFIG.num_steps - 1, :])
      best_predictions.append(argmax_idx)
      prediction[:, CONFIG.num_steps - 1, argmax_idx] = 0.0

    print('prediction\t:', best_predictions)
    for i in best_predictions:
      word = reversed_dictionary[i]
      if word == '<eos>':
        word = '.'
      if word == '<unk>':
        word = '<rare word>'
      print(input_string, word)

  else:
    print('Please enter atleast 3 words.')
