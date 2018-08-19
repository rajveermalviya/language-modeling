import "babel-polyfill";
import { MDCTopAppBar } from "@material/top-app-bar";
import { MDCTemporaryDrawer } from "@material/drawer";
import { MDCRipple } from "@material/ripple";
import { MDCTextField } from "@material/textfield";
import { loadModel } from "@tensorflow/tfjs-layers";
import { tensor,argMax } from "@tensorflow/tfjs-core";
import { stringToIndex } from "./stringToIndex";
import { indexToString } from "./indexToString";

window.onload = async function () {
  let words = [];
  let isQuestion = false;
  let randomNumber = [];

  const inputTextField = document.querySelector(".mdc-text-field");
  const notice = document.querySelector("#notice");
  const textInput = document.querySelector("#text-input");
  const btns = document.querySelector(".btns");
  const modelLoading = document.querySelector("#model-loading");
  const progressBar = document.querySelector("#progressBar");
  const rippleSurface = document.querySelectorAll(".ripple-surface");

  for (let i = 0; i < 9; i++) {
    words.push(document.querySelector(`#word${i + 1}`));
  }

  modelLoading.style.display = "block";
  btns.style.display = "none";
  inputTextField.style.display = "none";

  rippleSurface.forEach(i => MDCRipple.attachTo(i));

  let mdcTextField = new MDCTextField(inputTextField);
  MDCTopAppBar.attachTo(document.querySelector("#app-bar"));
  let drawer = new MDCTemporaryDrawer(document.querySelector("#drawer"));

  document.querySelector("#menu").addEventListener("click", () => { drawer.open = true;});

  const model = await loadModel("/web_model/model.json");

  notice.style.display = "block";
  modelLoading.style.display = "none";
  let predictionString = await predictNextWord(mdcTextField.value.trim(), 9);
  for (let i = 0; i < 9; i++) {
    words[i].innerHTML = predictionString[i];
  }
  textInput.selectionStart = textInput.selectionEnd = textInput.value.length;
  textInput.scrollLeft = textInput.scrollWidth;
  mdcTextField.foundation_.activateFocus();
  btns.style.display = "grid";
  inputTextField.style.display = "block";
  progressBar.style.display = "none";

  /**
   * Predict next word
   * @param {string} string Input String.
   * @param {number} numPrediction Total number of prediction to get.
   */
  async function predictNextWord(string, numPrediction) {
    isQuestion = false;
    string = string.toLowerCase().split(" ");
    let indexes = stringToIndexes(string);
    if (indexes.length >= 3) {
      notice.style.display = "none";
      indexes = indexes.slice(-3);
      let prediction = await model.predict(tensor([indexes]));
      prediction = (await prediction.data()).slice(2e4, 3e4);
      let predictionString = indexesToString(await doArgMax(prediction, numPrediction));
      return predictionString;
    } else {
      notice.style.display = "block";
    }
  }

  /**
   * Get the maximum value index from the array.
   * @param {number[]} prediction Raw values array from the model prediction.
   * @param {number} numPrediction Top {numPrediction} indexes. e.g. top 9 predictions in this example.
   * @returns {number[]} array of the top .
   */
  async function doArgMax(prediction, numPrediction) {
    let argmaxIndexes = [];
    for (let i = 0; i < numPrediction; i++) {
      let argmaxIndex = await argMax(prediction).data();
      argmaxIndexes.push(argmaxIndex);
      prediction[argmaxIndex] = 0;
    }
    return argmaxIndexes;
  }

  /**
   * Maps indexes of the model prediction to a string array using the predefined ditionary.
   * @link https://nxt-word.firebaseapp.com/indexToString.js
   * @param {number[]} arrOfIndexes argMax indexes array.
   * @returns {string[]} Mapped strings array.
   */
  function indexesToString(arrOfIndexes) {
    let arrOfStrings = [];
    arrOfIndexes.forEach(index => {
      let word = indexToString[index];
      if (word === "<eos>") {
        if (isQuestion) {
          word = "?";
        } else {
          word = ".";
        }
      }
      if (word === "N") {
        randomNumber.push(Math.floor(1e3 * Math.random()));
        word = randomNumber[Math.floor(Math.random() * randomNumber.length)];
      }
      if (word === "<unk>") {
        word = "rareword";
      }
      arrOfStrings.push(word);
    });
    return arrOfStrings;
  }

  /**
   * Maps the input string to a index array using the predefined ditionary.
   * @link https://nxt-word.firebaseapp.com/indexToString.js
   * @param {string[]} arrOfString The input string array seperated by spaces.
   * @returns {number[]} Mapped indexes array for the model prediction.
   */
  function stringToIndexes(arrOfString) {
    let arrOfIndexes = [];
    arrOfString.forEach(word => {
      if (word === "rareword") {
        word = "<unk>";
      }
      if (randomNumber.includes(Number(word))) {
        word = "N";
      }
      if ("what" === word || "why" === word || "who" === word || "how" === word || "whose" === word || "when" === word || "whom" === word || "which" === word || "where" === word) {
        isQuestion = true;
      }
      if (word === "." || word === "?") {
        word = "<eos>";
      }
      let index = stringToIndex[word];
      if (index === undefined) {
        arrOfIndexes.push(1); // 1 = "<unk>"
      } else {
        arrOfIndexes.push(index);
      }
    });
    return arrOfIndexes;
  }

  window.getText = async function () {
    mdcTextField.value = mdcTextField.value.toLowerCase();
    let predictionString = await predictNextWord(mdcTextField.value.trim(), 9);
    for (let i = 0; i < 9; i++) {
      words[i].innerHTML = predictionString[i];
    }
  };

  window.setText = function (string) {
    let textFieldValue = mdcTextField.foundation_.getValue();
    mdcTextField.foundation_.setValue(textFieldValue += string = " " + string);
    textInput.selectionStart = textInput.selectionEnd = textInput.value.length;
    textInput.scrollLeft = textInput.scrollWidth;
    mdcTextField.foundation_.activateFocus();
    window.getText();
  };
};