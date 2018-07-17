import os

from numpy import argmax
from tensorflow.keras import metrics
from tensorflow.keras.models import load_model

import CONFIG
from utils import BatchGenerator, load_data

_, _, _, indexToString, stringToIndex = load_data()


model = load_model(os.path.join(os.getcwd(), 'model', 'model.h5'))
NUMBER_OF_PREDICTIONS = 10


def predict_next_word(string, verbose=True):
  ques_bool = False
  idx, ques_bool = string_to_indexes(string.split(), ques_bool)
  if len(idx) >= 3:
    idx = idx[-3:]
    if verbose:
      print('last 3 words\t:', idx)
    prediction = model.predict([[idx]])
    best_predictions = list()
    for _ in range(NUMBER_OF_PREDICTIONS):
      argmax_idx = argmax(prediction[:, CONFIG.num_steps - 1, :])
      best_predictions.append(argmax_idx)
      prediction[:, CONFIG.num_steps - 1, argmax_idx] = 0.0
    if verbose:
      print('prediction\t:', best_predictions)
    converted_string = indexes_to_string(best_predictions, ques_bool)
    return string + ' ' + converted_string[0]
  else:
    print('Please enter atleast 3 words.')


def string_to_indexes(array_of_string, ques_bool):
  array_of_indexes = list()
  for word in array_of_string:
    if word == '<rare word>':
      word = '<unk>'
    if word == '.' or word == '?':
      word = '<eos>'
    if word == 'what' or word == 'why' or word == 'who' or word == 'how' or word == 'whose' or word == 'when' or word == 'which' or word == 'where':
      ques_bool = True
    try:
      array_of_indexes.append(stringToIndex[word])
    except:
      print('Word ', word, ' does not exist')
      word = '<unk>'
      array_of_indexes.append(stringToIndex[word])
      pass
  return array_of_indexes, ques_bool


def indexes_to_string(array_of_indexes, ques_bool):
  array_of_strings = list()
  for index in array_of_indexes:
    word = indexToString[index]
    if word == '<eos>':
      if ques_bool == True:
        word = '?'
      else:
        word = '.'
    if word == 'N':
      #TODO
      pass
    array_of_strings.append(word)
  return array_of_strings


def create_string(string='welcome to new'):
  __string = predict_next_word(string, verbose=False)
  for _ in range(NUMBER_OF_PREDICTIONS):
    __string = predict_next_word(__string, verbose=False)
  print('\n\nGenerated String:\t', __string, '\n')


while True:
  input_string = input('\n\nEnter atleast 3 words: \n')
  predict_next_word(input_string)
