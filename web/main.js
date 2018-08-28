import { MDCTemporaryDrawer } from "@material/drawer";
import { MDCRipple } from "@material/ripple";
import { MDCTextField } from "@material/textfield";
import { MDCTopAppBar } from "@material/top-app-bar";
import { argMax, tensor } from "@tensorflow/tfjs-core";
import { loadModel } from "@tensorflow/tfjs-layers";
import "babel-polyfill";
import { indexToString } from "./indexToString";
import { stringToIndex } from "./stringToIndex";

//TODO (if changed in the original model config)
const NUMBER_OF_WORDS = 3;
const forSlicingPredictionArray_A = (NUMBER_OF_WORDS - 1) * 1e4;
const forSlicingPredictionArray_B = NUMBER_OF_WORDS * 1e4;

window.onload = async () => {
  let predictedWordsButtons = [];
  let isQuestion = false;
  let randomNumber = [];

  const inputTextField = document.querySelector(".mdc-text-field");
  const notice = document.querySelector("#notice");
  const textInput = document.querySelector("#text-input");
  const btnsDiv = document.querySelector(".btns");
  const modelLoadingNotice = document.querySelector("#model-loading");
  const progressBar = document.querySelector("#progressBar");
  const rippleSurface = document.querySelectorAll(".ripple-surface");

  for (let i = 0; i < 9; i++) {
    predictedWordsButtons.push(document.querySelector(`#word${i + 1}`));
  }

  modelLoadingNotice.style.display = "block";
  btnsDiv.style.display = "none";
  inputTextField.style.display = "none";

  rippleSurface.forEach(i => MDCRipple.attachTo(i));

  let mdcTextField = new MDCTextField(inputTextField);
  MDCTopAppBar.attachTo(document.querySelector("#app-bar"));
  let drawer = new MDCTemporaryDrawer(document.querySelector("#drawer"));

  document.querySelector("#menu").addEventListener("click", () => {
    drawer.open = true;
  });

  const model = await loadModel("/web_model/model.json");

  /**
   * Predict next word
   * @param {string} string Input String.
   * @param {number} numPrediction Total number of prediction to get.
   */
  window.predictNextWord = async (string, numPrediction) => {
    isQuestion = false;
    string = string.toLowerCase().split(" ");
    let indexes = stringToIndexes(string);
    if (indexes.length >= NUMBER_OF_WORDS) {
      notice.style.display = "none";
      indexes = indexes.slice(-NUMBER_OF_WORDS);
      let prediction = await model.predict(tensor([indexes]));
      prediction = (await prediction.data()).slice(forSlicingPredictionArray_A, forSlicingPredictionArray_B);
      let predictionString = indexesToString(await doArgMax(prediction, numPrediction));
      return predictionString;
    } else {
      notice.style.display = "block";
    }
  };

  /**
   * Get the maximum value index from the array.
   * @param {number[]} prediction Raw values array from the model prediction.
   * @param {number} numPrediction Top {numPrediction} indexes. e.g. top 9 predictions in this example.
   * @returns {number[]} array of the top .
   */
  const doArgMax = async (prediction, numPrediction) => {
    let argmaxIndexes = [];
    for (let i = 0; i < numPrediction; i++) {
      let argmaxIndex = await argMax(prediction).data();
      argmaxIndexes.push(argmaxIndex);
      prediction[argmaxIndex] = 0;
    }
    return argmaxIndexes;
  };

  /**
   * Maps indexes of the model prediction to a string array using the predefined ditionary.
   * @link https://nxt-word.firebaseapp.com/indexToString.js
   * @param {number[]} arrOfIndexes argMax indexes array.
   * @returns {string[]} Mapped strings array.
   */
  const indexesToString = arrOfIndexes => {
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
  };

  /**
   * Maps the input string to a index array using the predefined ditionary.
   * @link https://nxt-word.firebaseapp.com/indexToString.js
   * @param {string[]} arrOfString The input string array seperated by spaces.
   * @returns {number[]} Mapped indexes array for the model prediction.
   */
  const stringToIndexes = arrOfString => {
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
  };

  window.getText = async () => {
    mdcTextField.value = mdcTextField.value.toLowerCase();
    let predictionString = await window.predictNextWord(mdcTextField.value.trim(), 9);
    for (let i = 0; i < 9; i++) {
      predictedWordsButtons[i].innerHTML = predictionString[i];
    }
  };

  window.setText = string => {
    predictedWordsButtons.forEach((element) => {
      element.disabled = true;
    });
    let textFieldValue = mdcTextField.foundation_.getValue();
    mdcTextField.foundation_.setValue(textFieldValue += string = " " + string);
    textInput.selectionStart = textInput.selectionEnd = textInput.value.length;
    textInput.scrollLeft = textInput.scrollWidth;
    mdcTextField.foundation_.activateFocus();
    window.getText();
    predictedWordsButtons.forEach((element) => {
      element.disabled = false;
    });
  };

  notice.style.display = "block";
  modelLoadingNotice.style.display = "none";
  let predictionString = await window.predictNextWord(mdcTextField.value.trim(), 9);
  for (let i = 0; i < 9; i++) {
    predictedWordsButtons[i].innerHTML = predictionString[i];
  }
  textInput.selectionStart = textInput.selectionEnd = textInput.value.length;
  textInput.scrollLeft = textInput.scrollWidth;
  mdcTextField.foundation_.activateFocus();
  btnsDiv.style.display = "grid";
  inputTextField.style.display = "block";
  progressBar.style.display = "none";
};