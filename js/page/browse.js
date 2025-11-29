// A. Load Genre Cards
async function loadGenresCard() {
  const container = document.getElementById("popularGenresGrid");
  if (!container) return;

  const genres = await fetchData("genres", "ordering=-games_count&page_size=4");
  container.innerHTML = "";

  genres.forEach((genre) => {
    const card = document.createElement("div");
    card.classList.add("genre-card");
    card.onclick = () => window.filterByGenre(genre.slug, genre.name);

    const iconClass = getIconClass(genre.name);
    card.innerHTML = `<i class="bi ${iconClass}"></i><h3>${genre.name}</h3>`;
    container.appendChild(card);
  });
}

// B. Load List Game (Grid Utama)
window.loadGamesForBrowse = async function (
  searchQuery = "",
  genreFilter = ""
) {
  const container = document.getElementById("browseContainer");
  if (container) container.innerHTML = '<p style="color:#ccc">Loading...</p>';

  let params = "page_size=20";
  if (searchQuery) params += `&search=${searchQuery}`;
  else if (genreFilter) params += `&genres=${genreFilter}`;
  else params += "&ordering=-added";

  const games = await fetchData("games", params);
  // Panggil fungsi displayGames dari utils.js
  displayGames(games, "browseContainer");
};

// C. Filter Logic
window.filterByGenre = function (slug, name) {
  const filterText = document.getElementById("currentFilter");
  if (filterText) filterText.innerText = `Genre: ${name}`;
  loadGamesForBrowse("", slug);
};

// D. Init Browse Page
window.loadBrowsePage = function () {
  loadGenresCard();
  loadGamesForBrowse(); // Load default
};

// Auto load jika halaman di-refresh di tab browse (opsional)
document.addEventListener("DOMContentLoaded", () => {
  // Bisa dikosongkan, karena router akan memanggil loadBrowsePage saat tab diklik
});
