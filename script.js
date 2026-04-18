let allEpisodes = [];

function setup() {
  const countElem = document.getElementById("count");
  countElem.textContent = "Loading episodes...";

  fetch("https://api.tvmaze.com/shows/82/episodes")
    .then(function (response) {
      return response.json();
    })
    .then(function (episodes) {
      allEpisodes = episodes;

      showEpisodeCards(allEpisodes);
      updateCount(allEpisodes);
      populateEpisodeSelector(allEpisodes);

      const searchInput = document.getElementById("search");
      searchInput.addEventListener("input", function () {
        const searchText = searchInput.value.toLowerCase();
        const filteredList = allEpisodes.filter(function (episode) {
          return (
            episode.name.toLowerCase().includes(searchText) ||
            episode.summary.toLowerCase().includes(searchText)
          );
        });
        showEpisodeCards(filteredList);
        updateCount(filteredList);
      });

      const selector = document.getElementById("episode-selector");
      selector.addEventListener("change", function () {
        const selectedValue = selector.value;
        if (selectedValue === "all") {
          showEpisodeCards(allEpisodes);
          updateCount(allEpisodes);
        } else {
          const selectedEpisode = allEpisodes[selectedValue];
          showEpisodeCards([selectedEpisode]);
          updateCount([selectedEpisode]);
        }
      });
    })
    .catch(function () {
      countElem.textContent =
        "Something went wrong loading the episodes. Please try again.";
    });
}

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
  countElem.textContent = "Displaying " + episodeList.length + " episode(s)";
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
  for (let i = 0; i < episodeList.length; i++) {
    const episode = episodeList[i];
    const season = String(episode.season).padStart(2, "0");
    const number = String(episode.number).padStart(2, "0");
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `S${season}E${number} - ${episode.name}`;
    option.value = i;
    option.textContent = "S" + season + "E" + number + " - " + episode.name;
    selector.appendChild(option);
  });

  selector.addEventListener("change", function () {
    const value = selector.value;

    if (value === "all") {
      renderEpisodes(currentEpisodes);
    } else {
      const selected = currentEpisodes.find(ep => ep.id == value);
      renderEpisodes([selected]);
    }
  });
}

window.onload = setup;