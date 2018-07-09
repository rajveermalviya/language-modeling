import collections
import os
import pdb

import tensorflow as tf
from keras import backend as K
from keras import metrics
from keras.layers import (LSTM, Activation, Dense, Dropout, Embedding,
                          TimeDistributed)
from keras.models import Sequential


def model(total_words, hidden_size, num_steps, optimizer='adam'):
  model = Sequential()
  model.add(Embedding(total_words, hidden_size, input_length=num_steps))
  model.add(LSTM(units=hidden_size, return_sequences=True))
  model.add(LSTM(units=hidden_size, return_sequences=True))
  model.add(Dropout(0.5))
  model.add(TimeDistributed(Dense(total_words)))
  model.add(Activation('softmax'))

  model.compile(loss='categorical_crossentropy', optimizer=optimizer,
                metrics=[metrics.categorical_accuracy])
  return model
