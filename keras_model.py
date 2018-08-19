from tensorflow.keras import metrics
from tensorflow.keras.layers import (LSTM, Activation, Dense, Dropout,
                                     Embedding, TimeDistributed)
from tensorflow.keras.models import Sequential


def create_model(total_words, hidden_size, num_steps, optimizer='adam'):
  model = Sequential()

  # Embedding layer
  model.add(Embedding(total_words, hidden_size, input_length=num_steps))

  # 4 LSTM layers
  model.add(LSTM(units=hidden_size, return_sequences=True))
  model.add(LSTM(units=hidden_size, return_sequences=True))
  model.add(LSTM(units=hidden_size, return_sequences=True))
  model.add(LSTM(units=hidden_size, return_sequences=True))

  # Fully Connected layer
  model.add(TimeDistributed(Dense(1024)))
  model.add(Activation('relu'))
  model.add(Dropout(0.3,seed=0.2))
  model.add(TimeDistributed(Dense(512)))
  model.add(Activation('relu'))

  # Output Layer
  model.add(TimeDistributed(Dense(total_words)))
  model.add(Activation('softmax'))

  model.compile(loss='categorical_crossentropy', optimizer=optimizer,
                metrics=[metrics.categorical_accuracy])
  return model
