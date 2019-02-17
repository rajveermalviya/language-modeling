# Language Modeling

This is machine learning model that is trained to predict next word in the sequence.
Model is defined in keras and then converted to tensorflowjs model using tfjs_converter.

## [See it working!](https://nxt-word.firebaseapp.com)

## Dependencies

- [keras](https://github.com/keras-team/keras)
- [tensorflow](https://www.tensorflow.org/)
- [tensorflowjs_converter](https://js.tensorflow.org/) (for web deployment)

To install all dependencies at once use:

```powershell
pip3 install -r requirements.txt
```

## Usage

First create necessary directories or else you will get an error.

```powershell
mkdir model/checkpoint
mkdir web/dist/web_model
```

Once you have your dependencies installed via pip, train the model by running :

```powershell
python3 train.py
```

After training you can either use the model by running :

```powershell
python3 test.py
```

After running test.py your output should be :

```powershell
Enter atleast 3 words:
welcome to new

indexes of last  3 words        : [4402, 5, 35]

prediction indexes      : [92, 1, 2645, 1491, 189, 1762, 207, 362, 2261, 1727]


1 - welcome to new york
2 - welcome to new <unk>
3 - welcome to new york-based
4 - welcome to new england
5 - welcome to new products
6 - welcome to new jersey
7 - welcome to new debt
8 - welcome to new loans
9 - welcome to new hampshire
10 - welcome to new ventures
```

or by converting the model to tensorflow js model by running :

```powershell
tensorflowjs_converter --input_format=keras /model/model.h5 /web/dist/web_model
```

Then Read the [README.md](https://github.com/rajveermalviya/language-modeling/blob/master/web/README.md) in `/web` directory

## [License MIT © Rajveer Malviya](https://github.com/rajveermalviya/language-modeling/blob/master/LICENSE.md)
