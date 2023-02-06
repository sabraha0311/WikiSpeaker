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

const form = document.querySelector(".js-search-form");
form.addEventListener("submit", handleSubmit);
