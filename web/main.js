window.onload = async () => {
  let words = [],
    isQuestion = !1,
    randomNumber = [];

  let textField = document.querySelector(".mdc-text-field");
  let notice = document.querySelector("#notice");
  let textInput = document.querySelector("#text-input");
  let btns = document.querySelector(".btns");
  let modelLoading = document.querySelector("#model-loading");
  let progressBar = document.querySelector("#progressBar");
  let rippleSurface = document.querySelectorAll(".ripple-surface");

  for (let i = 0; i < 9; i++)
    words.push(document.querySelector(`#word${i + 1}`));

  modelLoading.style.display = "block";
  btns.style.display = "none";
  textField.style.display = "none";

  rippleSurface.forEach(i => {
    mdc.ripple.MDCRipple.attachTo(i);
  });

  let mdcTextField = new mdc.textField.MDCTextField(textField);
  mdc.topAppBar.MDCTopAppBar.attachTo(document.querySelector("#app-bar"));
  let drawer = new mdc.drawer.MDCTemporaryDrawer(document.querySelector("#drawer"));

  document.querySelector("#menu").addEventListener("click", () => drawer.open = !0);

  let model = await tf.loadModel("/web_model/model.json");


  async function predictNextWord(string) {
    isQuestion = !1;
    let indexes = stringToIndexes(string = (string = string.toLowerCase()).split(" "));
    if (indexes.length >= 3) {
      notice.style.display = "none";
      indexes = indexes.slice(-3);
      let prediction = await model.predict(tf.tensor([indexes]));
      prediction = (prediction = await prediction.data()).slice(2e4, 3e4);
      let predictionString = indexesToString(await doArgMax(prediction, 9));
      for (let i = 0; i < 9; i++)
        words[i].innerHTML = predictionString[i];
    } else
      notice.style.display = "block";
  }

  async function doArgMax(prediction, numPrediction) {
    let argmaxIndexes = [];
    for (let r = 0; r < numPrediction; r++) {
      let t = await tf.argMax(prediction).data();
      argmaxIndexes.push(t);
      prediction[t] = 0;
    }
    return argmaxIndexes;
  }

  function indexesToString(arrOfIndexes) {
    let arrOfStrings = [];
    arrOfIndexes.forEach(index => {
      let word = indexToString[index];
      "<eos>" === word && (word = !1 === isQuestion ? "." : "?");
      "N" === word && (randomNumber.push(Math.floor(1e3 * Math.random())), word = randomNumber[Math.floor(Math.random() * randomNumber.length)]);
      "<unk>" === word && (word = "rareword");
      arrOfStrings.push(word);
    });
    return arrOfStrings;
  }

  function stringToIndexes(arrOfString) {
    let arrOfIndexes = [];
    arrOfString.forEach(word => {
      "rareword" === word && (word = "<unk>");
      randomNumber.includes(Number(word)) && (word = "N");
      "what" !== word && "why" !== word && "who" !== word && "how" !== word && "whose" !== word && "when" !== word && "whom" !== word && "which" !== word && "where" !== word || (isQuestion = !0);
      "." !== word && "?" !== word || (word = "<eos>");
      void 0 === stringToIndex[word] ? (console.log(`The word '${word}' does't exist`), arrOfIndexes.push(stringToIndex[word = "<unk>"])) : arrOfIndexes.push(stringToIndex[word]);
    });
    return arrOfIndexes;
  }

  window.getText = () => {
    mdcTextField.value = mdcTextField.value.toLowerCase();
    predictNextWord(mdcTextField.value.trim());
  };

  window.setText = (string) => {
    let textFieldValue = mdcTextField.foundation_.getValue();
    mdcTextField.foundation_.setValue(textFieldValue += string = " " + string);
    textInput.selectionStart = textInput.selectionEnd = textInput.value.length;
    textInput.scrollLeft = textInput.scrollWidth;
    mdcTextField.foundation_.activateFocus();
    getText();
  };


  notice.style.display = "block";
  modelLoading.style.display = "none";
  await predictNextWord(mdcTextField.value.trim());
  textInput.selectionStart = textInput.selectionEnd = textInput.value.length;
  textInput.scrollLeft = textInput.scrollWidth;
  mdcTextField.foundation_.activateFocus();
  btns.style.display = "grid";
  textField.style.display = "block";
  progressBar.style.display = "none";
};