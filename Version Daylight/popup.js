// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';


const QUESTIONS = [
  { question: "What is Michael Jackson's middle name?", ans: "joseph" },
  { question: "How many elements are there in the periodic table?", ans: "118" },
  { question: "What does MSN stand for?", ans: "microsoftnetwork" },
  { question: "Who was the God of Wine in Greek mythology?", ans: "dionysus" },
  { question: "What's the name of the monkey in Aladdin", ans: "abu" }
]

const morseBtn = document.getElementById("morse-btn");

morseBtn.onclick = function (element) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    morseBtn.disabled = true; 
    chrome.tabs.executeScript(
      tabs[0].id,
      {
        code: `var morseArray = {
"0": "-----",
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
  "a": ".-",
  "b": "-...",
  "c": "-.-.",
  "d": "-..",
  "e": ".",
  "f": "..-.",
  "g": "--.",
  "h": "....",
  "i": "..",
  "j": ".---",
  "k": "-.-",
  "l": ".-..",
  "m": "--",
  "n": "-.",
  "o": "---",
  "p": ".--.",
  "q": "--.-",
  "r": ".-.",
  "s": "...",
  "t": "-",
  "u": "..-",
  "v": "...-",
  "w": ".--",
  "x": "-..-",
  "y": "-.--",
  "z": "--..",
  
  ",": "--..--",
  "?": "..--..",
  "!": "-.-.--",
  "/": "-..-.",
  "@": ".--.-.",
  "(": "-.--.",
  ")": "-.--.-"

};


function walkTheDOM(node, func) {
  func(node);
  node = node.firstChild;
  while (node) {
    walkTheDOM(node, func);
    node = node.nextSibling;
  }
}



function convertToMorse(t){
	let newString = "";
	let input = t.toLowerCase();
	for (let i = 0; i < input.length; i++) {
		if(input.charAt(i) === " "){
			newString += '\xa0\xa0\xa0\xa0\xa0';
		}
		else if( !morseArray[input.charAt(i)] ){
			newString += input.charAt(i);
		} else {
			newString += " " + morseArray[input.charAt(i)];
		}
	}
	return newString;
}

function changeToMorse(node){
	let text = node.nodeValue;
	if(typeof text === 'string'){
		node.nodeValue = convertToMorse(text);
	} else {

	}
}
	
walkTheDOM(document.querySelector("body"), changeToMorse);

chrome.runtime.sendMessage(
    {message: "morse"},
    function (response) {
        console.log(response);
    });

`});
  });
};

let indexOfCurrentQuestion = 0;

const englishBtn = document.getElementById("english-btn");

englishBtn.onclick = function (element) {
  const question = document.getElementById('question');
  question.innerHTML = QUESTIONS[indexOfCurrentQuestion].question;
  const form = document.querySelector('form');
  form.className = 'reveal';
}

const audioBtn = document.getElementById("audio-btn");

audioBtn.onclick = function (element){
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.executeScript(
      tabs[0].id,
      {
        code:`let speakMorseToMe = "";
function walkTheDOM(node, func) {
  func(node);
  node = node.firstChild;
  while (node) {
    walkTheDOM(node, func);
    node = node.nextSibling;
  }
}





function findMorse(node){
  let text = node.nodeValue;
  if(typeof text === 'string'){
    speakMorseToMe +=text;
  } else {

  }
}
  
walkTheDOM(document.querySelector("body"), findMorse);
var synth = window.speechSynthesis;
var spoken = new SpeechSynthesisUtterance(speakMorseToMe);
spoken.rate = 5;
synth.speak(spoken)
chrome.runtime.sendMessage(
    {message: "morse"},
    function (response) {
        console.log(response);
    });`
      }
  )}
    )};


const submitBtn = document.getElementById("submit-btn");

submitBtn.onclick = function (event) {
 
  event.preventDefault();
  const question = document.getElementById('question').innerHTML;
  const value = document.getElementById('answer-input').value;
  if (value.trim() == ""){
    return;
  }
  console.log(document.getElementById('answer-input').value);
  const ansIsCorrect = checkAnswer(question, value);

  if (ansIsCorrect) {
    // disable
    morseBtn.disabled = false;
    chrome.runtime.sendMessage(
    {message: "english"},
    function (response) {
        console.log(response);
    });
  } else {
    if (indexOfCurrentQuestion !== QUESTIONS.length - 1) {
      indexOfCurrentQuestion++;
      englishBtn.click();
    } else {
      // disable
    chrome.runtime.sendMessage(
    {message: "english"},
    function (response) {
        console.log(response);
    });
    }
  }
}

function checkAnswer(question, ans) {
  const i = QUESTIONS.map(q => q.question).indexOf(question);
  const correctAns = QUESTIONS[i].ans;
  return (correctAns === ans.replace(/ /g, '').toLowerCase());
}





