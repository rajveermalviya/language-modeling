import os

from tensorflow.keras.callbacks import ModelCheckpoint, TensorBoard

import CONFIG
from keras_model import model
from reader import BatchGenerator, load_data, save_json

train_data, valid_data, _total_words, reversed_dictionary, dictionary = load_data()

train_data_generator = BatchGenerator(
    train_data, CONFIG._num_steps, CONFIG._batch_size, _total_words, skip_step=CONFIG._num_steps)
valid_data_generator = BatchGenerator(
    valid_data, CONFIG._num_steps, CONFIG._batch_size, _total_words, skip_step=CONFIG._num_steps)


_model = model(total_words=_total_words, hidden_size=CONFIG._hidden_size,
               num_steps=CONFIG._num_steps, optimizer='adam')

print(_model.summary())

checkpointer = ModelCheckpoint(filepath=os.path.join(
    os.getcwd(), 'model', 'checkpoint', 'model-{epoch:02d}.h5'), verbose=1)

save_json(dictionary, os.path.join(
    os.getcwd(), 'web', 'web_model', 'dictionary.json'))

save_json(reversed_dictionary, os.path.join(
    os.getcwd(), 'web', 'web_model', 'reversed-dictionary.json'))

_model.fit_generator(
    generator=train_data_generator.generate(),
    steps_per_epoch=len(train_data)/(CONFIG._batch_size*CONFIG._num_steps),
    epochs=CONFIG._num_epochs,
    validation_data=valid_data_generator.generate(),
    validation_steps=len(valid_data)/(CONFIG._batch_size*CONFIG._num_steps),
    callbacks=[checkpointer],
)

_model.save(os.path.join(os.getcwd(), 'model', 'model.h5'))
