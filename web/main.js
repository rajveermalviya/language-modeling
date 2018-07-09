let surface;
let textField;
let topAppBar;
let drawer;
let model;
let words = [];
let isQuestion = false;
let progressBar;
let randomNumber;
let modelLoading;
let btns;
let textInput;
let notice;


window.onload = async function (e) {

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(function (response) {
        // Service worker registration done
        console.log('Registration Successful', response);
      }, function (error) {
        // Service worker registration failed
        console.log('Registration Failed', error);
      });
  }

  notice = this.document.querySelector('#notice');
  textInput = this.document.querySelector('#text-input');
  btns = this.document.querySelector('.btns');
  modelLoading = this.document.querySelector('#model-loading');
  modelLoading.style.display = 'block';
  btns.style.display = 'none';
  textInput.style.display = 'none';
  progressBar = this.document.querySelector('#progressBar');
  for (let i = 0; i < 9; i++) {
    words[i] = this.document.querySelector(`#word${i + 1}`);
  }
  surface = this.document.querySelectorAll('.ripple-surface');
  surface.forEach(surf => {
    mdc.ripple.MDCRipple.attachTo(surf);
  });
  textField = new mdc.textField.MDCTextField(this.document.querySelector('.mdc-text-field'));
  topAppBar = new mdc.topAppBar.MDCTopAppBar(this.document.querySelector('#app-bar'));
  drawer = new mdc.drawer.MDCTemporaryDrawer(this.document.querySelector('#drawer'));
  this.document.querySelector('#menu').addEventListener('click', () => drawer.open = true);

  model = await tf.loadModel('/web_model/model.json');
  notice.style.display = 'block';
  modelLoading.style.display = 'none';
  await loadBtns();
  btns.style.display = 'grid';
  textInput.style.display = 'block';
  progressBar.style.display = 'none';
  return e;
};


async function loadBtns() {
  words.forEach(element => {
    element.innerHTML = reversed_dictionary[Math.floor(Math.random() * 10000)];
  });
}


async function predictNextWord(str) {
  isQuestion = false;
  str = str.toLowerCase();
  str = str.split(' ');
  if (str.length >= 3) {
    notice.style.display = 'none';
    str = str.slice(-3);
    let input = await stringToIndexes(str);
    let prediction = await model.predict(tf.tensor(input));
    prediction = await prediction.buffer();
    prediction = prediction.values.slice(20000, 30000);
    prediction = await indexesToString(prediction, 9);
    return prediction;
  } else {
    notice.style.display = 'block';
    await loadBtns();
    return null;
  }
}

async function stringToIndexes(str) {
  let arrayOfIndexes = await formatString(str);
  return [arrayOfIndexes];
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
    if (word === '<unk>') {
      word = 'rareWord';
    }
    arrOfString.push(word);
  });
  return arrOfString;
}

async function formatString(array) {
  let _ = [];
  array.forEach(word => {
    if (Number(word) === randomNumber) {
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
    console.log(word);
  });
  return _;
}

async function getValues() {
  textField.value = textField.value.toLowerCase();
  let prediction = await predictNextWord(textField.value.trim());
  if (prediction !== null) {
    for (let i = 0; i < 9; i++) {
      words[i].innerHTML = prediction[i];
      if (prediction[i] === 'N') {
        words[i].innerHTML = randomNumber = Math.floor(Math.random() * 1000);
      }
    }
  }
  textInput.focus();
  textInput.scrollLeft = textInput.scrollWidth;
}

async function setText(text) {
  text = " " + text;
  textField.value.trim();
  textField.value += text;
  textField.value.trim();
  textInput.focus();
  textInput.scrollLeft = textInput.scrollWidth;
  getValues();
}