// GLOBAL STATE
let allShows = [];
let episodeCache = {};
let currentEpisodes = [];

function setup() {
  const message = document.getElementById("message");
  message.textContent = "Loading shows...";

  // FETCH ALL SHOWS
  fetch("https://api.tvmaze.com/shows")
    .then((res) => res.json())
    .then((shows) => {
      allShows = shows;

      populateShowSelector(allShows);

      message.textContent = "Select a show to begin";
    })
    .catch(() => {
      message.textContent = "Failed to load shows.";
    });

  setupSearch();
}

// 🔍 SEARCH (UPDATED TO USE CURRENT EPISODES)
function setupSearch() {
  const searchInput = document.getElementById("search");

  searchInput.addEventListener("input", function () {
    const term = searchInput.value.toLowerCase();

    const filtered = currentEpisodes.filter(
      (ep) =>
        ep.name.toLowerCase().includes(term) ||
        ep.summary.toLowerCase().includes(term),
    );

    showEpisodeCards(filtered);
    updateCount(filtered);
    populateEpisodeSelector(filtered);
  });
}

// 📺 SHOW SELECTOR
function populateShowSelector(shows) {
  const selector = document.getElementById("show-select");

  selector.innerHTML = "";

  // SORT ALPHABETICALLY
  shows.sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
  );

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select a show...";
  selector.appendChild(defaultOption);

  for (const show of shows) {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    selector.appendChild(option);
  }

  selector.addEventListener("change", handleShowChange);
}

// 🎯 WHEN SHOW CHANGES
function handleShowChange() {
  const showId = this.value;
  const message = document.getElementById("message");

  if (!showId) return;

  // 🔥 CACHE CHECK
  if (episodeCache[showId]) {
    currentEpisodes = episodeCache[showId];
    renderEpisodes(currentEpisodes);
    return;
  }

  message.textContent = "Loading episodes...";

  fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
    .then((res) => res.json())
    .then((episodes) => {
      episodeCache[showId] = episodes;
      currentEpisodes = episodes;

      message.textContent = "";

      renderEpisodes(currentEpisodes);
    })
    .catch(() => {
      message.textContent = "Failed to load episodes.";
    });
}

// 🎬 RENDER ALL
function renderEpisodes(list) {
  showEpisodeCards(list);
  updateCount(list);
  populateEpisodeSelector(list);
}

// 🎬 CREATE CARD
function makeEpisodeCard(episode) {
  const season = String(episode.season).padStart(2, "0");
  const number = String(episode.number).padStart(2, "0");

  const card = document.createElement("div");
  card.classList.add("episode-card");

  card.innerHTML = `
    <h2>${episode.name} - S${season}E${number}</h2>
    <img src="${episode.image?.medium || ""}" alt="${episode.name}" />
    ${episode.summary}
  `;

  return card;
}

// 🎥 RENDER EPISODES
function showEpisodeCards(episodeList) {
  const container = document.getElementById("episode-container");
  container.innerHTML = "";

  for (let episode of episodeList) {
    const card = makeEpisodeCard(episode);
    container.appendChild(card);
  }
}

// 🔢 COUNT
function updateCount(episodeList) {
  const countElem = document.getElementById("count");
  countElem.textContent = `Displaying ${episodeList.length} episode(s)`;
}

// 📋 EPISODE SELECTOR
function populateEpisodeSelector(episodeList) {
  const selector = document.getElementById("episode-selector");

  selector.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "all";
  defaultOption.textContent = "All Episodes";
  selector.appendChild(defaultOption);

  episodeList.forEach((episode) => {
    const season = String(episode.season).padStart(2, "0");
    const number = String(episode.number).padStart(2, "0");

    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `S${season}E${number} - ${episode.name}`;
    selector.appendChild(option);
  });

  selector.addEventListener("change", function () {
    const value = selector.value;

    if (value === "all") {
      renderEpisodes(currentEpisodes);
    } else {
      const selected = currentEpisodes.find((ep) => ep.id == value);
      renderEpisodes([selected]);
    }
  });
}

window.onload = setup;
