import os

from tensorflow.keras.callbacks import ModelCheckpoint, TensorBoard
from tensorflow.keras.optimizers import Adam
import CONFIG
from keras_model import create_model
from utils import BatchGenerator, load_data, save_json

train_data, valid_data, total_words, reversed_dictionary, dictionary = load_data()

train_data_generator = BatchGenerator(
    train_data, CONFIG.number_of_words, CONFIG.batch_size, total_words, skip_step=CONFIG.number_of_words)
valid_data_generator = BatchGenerator(
    valid_data, CONFIG.number_of_words, CONFIG.batch_size, total_words, skip_step=CONFIG.number_of_words)

optimizer = Adam(lr=CONFIG.learning_rate, decay=CONFIG.learning_rate_decay)

model = create_model(total_words=total_words, hidden_size=CONFIG.hidden_size,
                     num_steps=CONFIG.number_of_words, optimizer=optimizer)

print(model.summary())

checkpointer = ModelCheckpoint(filepath=os.path.join(
    os.getcwd(), 'model', 'checkpoint', 'model-{epoch:02d}.h5'), verbose=1)

save_json(dictionary, os.path.join(
    os.getcwd(), 'web', 'web_model', 'dictionary.json'))

save_json(reversed_dictionary, os.path.join(
    os.getcwd(), 'web', 'web_model', 'reversed-dictionary.json'))

model.fit_generator(
    generator=train_data_generator.generate(),
    steps_per_epoch=len(train_data)/(CONFIG.batch_size*CONFIG.number_of_words),
    epochs=CONFIG.num_epochs,
    validation_data=valid_data_generator.generate(),
    validation_steps=len(valid_data)/(CONFIG.batch_size*CONFIG.number_of_words),
    callbacks=[checkpointer],
)

model.save(os.path.join(os.getcwd(), 'model', 'model.h5'))
