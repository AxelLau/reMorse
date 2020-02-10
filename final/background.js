// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

//leftover code from Google tutorial
chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({ color: '#3aa757' }, function () {
    console.log('The color is green.');
  });

  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: { hostContains: '.' },
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

let morseBtnActivated = false;
const morseBtn = document.getElementById("morse-btn");
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.message === "morse") {
      sendResponse("Morse button was clicked, morseBtnActivated will be set to true");
      morseBtnActivated = true;
      
    } else if (request.message === "english") {
      sendResponse("English button was successfully processed, morseBtnActivated will be set to false");
      morseBtnActivated = false;
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
    });
    } else {
      sendResponse("An error occurred when clicking the morse button");
    }
  }
);

//send message back to popup.js to make button unclickable

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  var url = tab.url;
  if (morseBtnActivated) {

      chrome.tabs.executeScript(
        null, {
        code: `  

            var morseArray = {
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

          function convertToMorse(text){
            let morseString = "";
            let input = text.toLowerCase();
            for (let i = 0; i < input.length; i++) {
              if(input.charAt(i) === " "){
                morseString += input.charAt(i);
              }
              else if( !morseArray[input.charAt(i)] ){
                morseString += input.charAt(i);
              } else {
                morseString += " " + morseArray[input.charAt(i)];
              }
            }
            return morseString;
          }

          function changeToMorse(node){
            let text = node.nodeValue;
            if(typeof text === 'string'){
              node.nodeValue = convertToMorse(text);
            }
          }

          walkTheDOM(document.querySelector("body"), changeToMorse);
          chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
          chrome.runtime.sendMessage(tabs[0].id, {message: "disableMorse"}, function(response) {});  
});
        `});
  }
});
