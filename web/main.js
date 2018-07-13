let surface;
let mdcTextField;
let textField;
let topAppBar;
let drawer;
let model;
let words = [];
let isQuestion = false;
let progressBar;
let randomNumber = [];
let modelLoading;
let btns;
let textInput;
let notice;


window.onload = async function (e) {

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(function () {
        console.log('Registration Successful');
      }, function (error) {
        console.log('Registration Failed', error);
      });
  }
  textField = this.document.querySelector('.mdc-text-field');
  notice = this.document.querySelector('#notice');
  textInput = this.document.querySelector('#text-input');
  btns = this.document.querySelector('.btns');
  modelLoading = this.document.querySelector('#model-loading');
  modelLoading.style.display = 'block';
  btns.style.display = 'none';
  textField.style.display = 'none';
  progressBar = this.document.querySelector('#progressBar');
  for (let i = 0; i < 9; i++) {
    words[i] = this.document.querySelector(`#word${i + 1}`);
  }
  surface = this.document.querySelectorAll('.ripple-surface');
  surface.forEach(surf => {
    mdc.ripple.MDCRipple.attachTo(surf);
  });

  mdcTextField = new mdc.textField.MDCTextField(textField);
  topAppBar = new mdc.topAppBar.MDCTopAppBar(this.document.querySelector('#app-bar'));
  drawer = new mdc.drawer.MDCTemporaryDrawer(this.document.querySelector('#drawer'));
  this.document.querySelector('#menu').addEventListener('click', () => drawer.open = true);

  model = await tf.loadModel('/web_model/model.json');
  notice.style.display = 'block';
  modelLoading.style.display = 'none';
  await predictNextWord(mdcTextField.value.trim());
  textInput.selectionStart = textInput.selectionEnd = textInput.value.length;
  textInput.scrollLeft = textInput.scrollWidth;
  mdcTextField.foundation_.activateFocus();
  btns.style.display = 'grid';
  textField.style.display = 'block';
  progressBar.style.display = 'none';
  return e;
};



async function predictNextWord(str) {
  isQuestion = false;
  str = str.toLowerCase();
  str = str.split(' ');
  let input = stringToIndexes(str);
  if (input.length >= 3) {
    notice.style.display = 'none';
    input = input.slice(-3);
    let prediction = await model.predict(tf.tensor([input]));
    prediction = await prediction.data();
    prediction = prediction.slice(20000, 30000);
    prediction = await indexesToString(prediction, 9);
    for (let i = 0; i < 9; i++) {
      words[i].innerHTML = prediction[i];
    }
  } else {
    notice.style.display = 'block';
  }
}


async function indexesToString(prediction, numPredictions) {
  let arrOfIndex = [];
  let arrOfString = [];
  for (let i = 0; i < numPredictions; i++) {
    let argMaxIndex = await tf.argMax(prediction).data();
    arrOfIndex.push(argMaxIndex);
    prediction[argMaxIndex] = 0.0;
  }
  arrOfIndex.forEach(i => {
    let word = reversed_dictionary[i];
    if (word === '<eos>') {
      if (isQuestion === false) {
        word = '.';
      } else {
        word = '?';
      }
    }
    if (word === 'N') {
      randomNumber.push(Math.floor(Math.random() * 1000));
      word = randomNumber[Math.floor(Math.random() * randomNumber.length)];
    }
    if (word === '<unk>') {
      word = 'rareword';
    }
    arrOfString.push(word);
  });
  return arrOfString;
}

function stringToIndexes(array) {
  let _ = [];
  array.forEach(word => {
    if (word === 'rareword') {
      word = '<unk>';
    }
    if (randomNumber.includes(Number(word))) {
      word = 'N';
    }
    if (word === 'what' || word === 'why' || word === 'how' || word === 'whose' || word === 'when' || word === 'whom' || word === 'which' || word === 'where') {
      isQuestion = true;
    }
    if (word === '.' || word === '?') {
      word = '<eos>';
    }
    if (dictionary[word] == null) {
      console.error(`The word '${word}' does't exist`);
      word = '<unk>';
      _.push(dictionary[word]);
    } else {
      _.push(dictionary[word]);
    }
  });
  return _;
}

async function getValues() {
  mdcTextField.value = mdcTextField.value.toLowerCase();
  await predictNextWord(mdcTextField.value.trim());
}

async function setText(text) {
  textFieldValue = mdcTextField.foundation_.getValue();
  text = " " + text;
  textFieldValue += text;
  mdcTextField.foundation_.setValue(textFieldValue);
  textInput.selectionStart = textInput.selectionEnd = textInput.value.length;
  textInput.scrollLeft = textInput.scrollWidth;
  mdcTextField.foundation_.activateFocus();
  await getValues();
}