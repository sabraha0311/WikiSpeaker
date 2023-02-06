"use strict";

async function handleSubmit(event) {
  event.preventDefault();
  const inputValue = document.querySelector(".js-search-input").value;
  const searchQuery = inputValue.trim();

  try {
    const results = await searchWikipedia(searchQuery);
    displayResults(results);
  } catch (err) {
    console.log(err);
    alert("Failed to search wikipedia");
  }
}

async function searchWikipedia(searchQuery) {
  const endpoint = `https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=5&srsearch=${searchQuery}`;
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw Error(response.statusText);
  }
  const json = await response.json();
  return json;
}

function displayResults(results) {
  const searchResults = document.querySelector(".js-search-results");
  searchResults.innerHTML = "";

  results.query.search.forEach((result) => {
    const url = `https://en.wikipedia.org/?curid=${result.pageid}`;

    searchResults.insertAdjacentHTML(
      "beforeend",
      `<div class="result-item">
        <h3 class="result-title" onclick="handleDisplayArticle(event)" pageid='${result.pageid}' title='${result.title}' wikiURL='${url}'>${result.title}</h3>
        <span class="result-snippet">${result.snippet}...</span><br>
      </div>`
    );
  });
}

async function handleDisplayArticle(event) {
  const wikiFrame = document.getElementById("wiki-frame");
  const url = event.currentTarget.attributes.wikiURL.value;
  wikiFrame.src = url;

  handleReadArticle(event);
}

async function handleReadArticle(event) {
  const pageid = event.currentTarget.attributes.pageid.value;
  const title = event.currentTarget.attributes.title.value;
  const url = `https://en.wikipedia.org/w/api.php?action=query&utf8=&format=json&origin=*&prop=extracts&pageids=${pageid}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw Error(response.statusText);
  }
  const json = await response.json();
  const html = json.query.pages[`${pageid}`].extract;

  const wikiTitle = document.getElementById("wiki-title");
  wikiTitle.innerText = title;
  const wikiContent = document.getElementById("wiki-content");
  wikiContent.innerHTML = html;

  var message = new SpeechSynthesisUtterance();
  message.text = wikiContent.innerText;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(message);

  //Next steps = Pause, Play/Resume, Volume/Rate/Pitch sliders, Dropdown voice
  const voices = window.speechSynthesis.getVoices(); // How to get new voices to update message.
  console.log(voices);
}

function populateVoices() {
  voices = getVoices();
  voicesDropdown.innerHTML = voices
    // .filter(voice => voice.lang.eincludes('en')) //only english
    .map(
      (voice) =>
        `<option value="${voice.name}">${voice.name} (${voice.lang})</option>`
    )
    .join("");
}

function getVoices() {
  return window.speechSynthesis.getVoices();
}

function setVoice(event) {
  selectedVoice = event.target.selectedOptions[0].value;
  msg.voice = getVoices().find((voice) => voice.name === selectedVoice);
}

function toggle(event, startOver = false) {
  if (startOver) {
    speechSynthesis.cancel();
    speechSynthesis.speak(msg);
    //set button text to "pause"
  } else if (speechSynthesis.speaking && !speechSynthesis.paused) {
    speechSynthesis.pause();
    //set button text to "play"
  } else if (speechSynthesis.speaking && speechSynthesis.paused) {
    speechSynthesis.resume();
    //set button text to "pause"
  } else {
    speechSynthesis.cancel();
    speechSynthesis.speak(msg);
    //set button text to "pause"
  }
}

function textOver(event) {
  console.log("test");
  //set button text to "play"
}

function setOption() {
  console.log(this.name, this.value);
  msg[this.name] = this.value;
  toggle();
}

const msg = new SpeechSynthesisUtterance();
let voices = [];
const voicesDropdown = document.querySelector('[name="voice"]');
const options = document.querySelectorAll('[type="range"], [name="text"]'); // includes text box
const speakButton = document.getElementById("speakButton");
//const stopButton = document.querySelector("#stop");
msg.text = document.querySelector('[name="text"]').value;
msg.addEventListener("end", textOver);

populateVoices();

speechSynthesis.addEventListener("voiceschanged", populateVoices);
voicesDropdown.addEventListener("change", setVoice);
options.forEach((option) => option.addEventListener("change", setOption));
speakButton.addEventListener("click", toggle);
//stopButton.addEventListener("click", toggle.bind(null, false));

const form = document.querySelector(".js-search-form");
form.addEventListener("submit", handleSubmit);
