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



async function predictNextWord(string) {
  isQuestion = false;
  string = string.toLowerCase();
  string = string.split(' ');
  let input = stringToIndexes(string);
  if (input.length >= 3) {
    notice.style.display = 'none';
    input = input.slice(-3);
    let prediction = await model.predict(tf.tensor([input]));
    prediction = await prediction.data();
    prediction = prediction.slice(20000, 30000);
    let arrOfString = indexesToString(await doArgMax(prediction, 9));
    for (let i = 0; i < 9; i++) {
      words[i].innerHTML = arrOfString[i];
    }
  } else {
    notice.style.display = 'block';
  }
}

async function doArgMax(prediction, numPredictions) {
  let arrOfIndex = [];
  for (let i = 0; i < numPredictions; i++) {
    let argMaxIndex = await tf.argMax(prediction).data();
    arrOfIndex.push(argMaxIndex);
    prediction[argMaxIndex] = 0.0;
  }
  return arrOfIndex;
}

function indexesToString(arrOfIndex) {
  let arrOfString = [];
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
    if (word === 'what' || word === 'why' || word === 'who' || word === 'how' || word === 'whose' || word === 'when' || word === 'whom' || word === 'which' || word === 'where') {
      isQuestion = true;
    }
    if (word === '.' || word === '?') {
      word = '<eos>';
    }
    if (dictionary[word] === undefined) {
      console.log(`The word '${word}' does't exist`);
      word = '<unk>';
      _.push(dictionary[word]);
    } else {
      _.push(dictionary[word]);
    }
  });
  return _;
}

function getText() {
  mdcTextField.value = mdcTextField.value.toLowerCase();
  predictNextWord(mdcTextField.value.trim());
}

function setText(text) {
  let textFieldValue = mdcTextField.foundation_.getValue();
  text = " " + text;
  textFieldValue += text;
  mdcTextField.foundation_.setValue(textFieldValue);
  textInput.selectionStart = textInput.selectionEnd = textInput.value.length;
  textInput.scrollLeft = textInput.scrollWidth;
  mdcTextField.foundation_.activateFocus();
  getText();
}