import tensorflow as tf


def create_model(total_words, hidden_size, num_steps, optimizer='adam'):
    model = tf.keras.models.Sequential()

    # Embedding layer / Input layer
    model.add(tf.keras.layers.Embedding(
        total_words, hidden_size, input_length=num_steps))

    # 4 LSTM layers
    model.add(tf.keras.layers.LSTM(units=hidden_size, return_sequences=True))
    model.add(tf.keras.layers.LSTM(units=hidden_size, return_sequences=True))
    model.add(tf.keras.layers.LSTM(units=hidden_size, return_sequences=True))
    model.add(tf.keras.layers.LSTM(units=hidden_size, return_sequences=True))

    # Fully Connected layer
    model.add(tf.keras.layers.TimeDistributed(tf.keras.layers.Dense(1024)))
    model.add(tf.keras.layers.Activation('relu'))
    model.add(tf.keras.layers.Dropout(0.3, seed=0.2))
    model.add(tf.keras.layers.TimeDistributed(tf.keras.layers.Dense(512)))
    model.add(tf.keras.layers.Activation('relu'))

    # Output Layer
    model.add(tf.keras.layers.TimeDistributed(
        tf.keras.layers.Dense(total_words)))
    model.add(tf.keras.layers.Activation('softmax'))

    model.compile(loss='categorical_crossentropy', optimizer=optimizer,
                  metrics=[tf.keras.metrics.categorical_accuracy])
    return model
