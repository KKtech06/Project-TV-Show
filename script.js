// GLOBAL STATE
let allShows = [];
let episodeCache = {};
let currentEpisodes = [];

function setup() {
  const message = document.getElementById("message");
  message.textContent = "Loading shows...";

  fetch("https://api.tvmaze.com/shows")
    .then(function (res) {
      return res.json();
    })
    .then(function (shows) {
      allShows = shows;
      message.textContent = "";
      displayShows(allShows);
    })
    .catch(function () {
      message.textContent = "Failed to load shows.";
    });

  // ✅ back link
  document.getElementById("back-link").addEventListener("click", function () {
    displayShows(allShows);
  });

  setupSearch();
}

// ✅ SHOW LISTING PAGE
function displayShows(shows) {
  document.getElementById("shows-view").style.display = "block";
  document.getElementById("episodes-view").style.display = "none";

  const showSearch = document.getElementById("show-search");
  showSearch.value = "";
  showSearch.oninput = function () {
    const term = showSearch.value.toLowerCase();
    const filtered = shows.filter(function (show) {
      return (
        show.name.toLowerCase().includes(term) ||
        show.summary?.toLowerCase().includes(term) ||
        show.genres.join(" ").toLowerCase().includes(term)
      );
    });
    renderShows(filtered);
  };

  renderShows(shows);
}

// ✅ RENDER SHOW CARDS
function renderShows(shows) {
  const container = document.getElementById("shows-container");
  container.innerHTML = "";

  shows.sort(function (a, b) {
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  });

  for (const show of shows) {
    const card = document.createElement("div");
    card.classList.add("show-card");

    card.innerHTML = `
      <img src="${show.image?.medium || ""}" alt="${show.name}" />
      <h2 class="show-name">${show.name}</h2>
      <p><strong>Genres:</strong> ${show.genres.join(", ") || "N/A"}</p>
      <p><strong>Status:</strong> ${show.status}</p>
      <p><strong>Rating:</strong> ${show.rating?.average || "N/A"}</p>
      <p><strong>Runtime:</strong> ${show.runtime || "N/A"} mins</p>
      ${show.summary || ""}
    `;

    card.querySelector(".show-name").addEventListener("click", function () {
      document.getElementById("shows-view").style.display = "none";
      document.getElementById("episodes-view").style.display = "block";
      handleShowChange.call({ value: show.id });
    });

    container.appendChild(card);
  }
}

// 🔍 SEARCH
function setupSearch() {
  const searchInput = document.getElementById("search");
  searchInput.addEventListener("input", function () {
    const term = searchInput.value.toLowerCase();
    const filtered = currentEpisodes.filter(function (ep) {
      return (
        ep.name.toLowerCase().includes(term) ||
        ep.summary.toLowerCase().includes(term)
      );
    });
    showEpisodeCards(filtered);
    updateCount(filtered);
    populateEpisodeSelector(filtered);
  });
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

  fetch("https://api.tvmaze.com/shows/" + showId + "/episodes")
    .then(function (res) {
      return res.json();
    })
    .then(function (episodes) {
      episodeCache[showId] = episodes;
      currentEpisodes = episodes;
      message.textContent = "";
      renderEpisodes(currentEpisodes);
    })
    .catch(function () {
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
    container.appendChild(makeEpisodeCard(episode));
  }
}

// 🔢 COUNT
function updateCount(episodeList) {
  document.getElementById("count").textContent =
    "Displaying " + episodeList.length + " episode(s)";
}

// 📋 EPISODE SELECTOR
function populateEpisodeSelector(episodeList) {
  const selector = document.getElementById("episode-selector");
  selector.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "all";
  defaultOption.textContent = "All Episodes";
  selector.appendChild(defaultOption);

  episodeList.forEach(function (episode) {
    const season = String(episode.season).padStart(2, "0");
    const number = String(episode.number).padStart(2, "0");
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = "S" + season + "E" + number + " - " + episode.name;
    selector.appendChild(option);
  });

  selector.onchange = function () {
    const value = selector.value;
    if (value === "all") {
      renderEpisodes(currentEpisodes);
    } else {
      const selected = currentEpisodes.find(function (ep) {
        return ep.id == value;
      });
      renderEpisodes([selected]);
    }
  };
}

window.onload = setup;
