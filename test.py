import os

from numpy import argmax
from tensorflow.keras import metrics
from tensorflow.keras.models import load_model

import CONFIG
from utils import BatchGenerator, load_data, load_dictionary

indexToString = load_dictionary(
    os.path.join(os.getcwd(), 'data', 'indexToString.json'))
stringToIndex = load_dictionary(
    os.path.join(os.getcwd(), 'data', 'stringToIndex.json'))

model = load_model(os.path.join(os.getcwd(), 'model', 'model.h5'))


def predict_next_word(string, verbose=True, NUMBER_OF_PREDICTIONS=1):
  ques_bool = False
  idx, ques_bool = string_to_indexes(string.split(), ques_bool)

  if len(idx) >= CONFIG.number_of_words:
    if verbose:
      print('\nindexes of last ', CONFIG.number_of_words, 'words\t:',
            idx[-CONFIG.number_of_words:])
    prediction = model.predict([[idx[-CONFIG.number_of_words:]]])

    best_predictions = []

    for _ in range(NUMBER_OF_PREDICTIONS):
      argmax_idx = argmax(prediction[:, CONFIG.number_of_words - 1, :])
      print(prediction[:, CONFIG.number_of_words - 1, argmax_idx])
      best_predictions.append(argmax_idx)
      prediction[:, CONFIG.number_of_words - 1, argmax_idx] = 0.0

    if verbose:
      print('\nprediction indexes\t:', best_predictions)
    converted_string = indexes_to_string(best_predictions, ques_bool)
    sentences = []

    for word in converted_string:
      sentences.append(string + ' ' + word)
    return sentences
  else:
    print('\n\nPlease enter atleast', CONFIG.number_of_words, ' words.\n')


def string_to_indexes(array_of_string, ques_bool):
  array_of_indexes = []

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
      print("Word ", word,
            " does not exist in the vocabulary!\nReplacing it with '<unk>'")
      word = '<unk>'
      array_of_indexes.append(stringToIndex[word])
      pass
  return array_of_indexes, ques_bool


def indexes_to_string(array_of_indexes, ques_bool):
  array_of_strings = []

  for index in array_of_indexes:
    word = indexToString[str(index)]
    if word == '<eos>':
      if ques_bool == True:
        word = '?'
      else:
        word = '.'
    if word == 'N':  # if word is a number.
      #TODO
      pass
    array_of_strings.append(word)
  return array_of_strings


while True:
  sentences = predict_next_word(
      string=input('\n\nEnter atleast ' + str(CONFIG.number_of_words) +
                   ' words: \n'),
      NUMBER_OF_PREDICTIONS=1)
  print('\n')
  if sentences != None:
    count = 0
    for sentence in sentences:
      count += 1
      print(count, '\t-', sentence)
