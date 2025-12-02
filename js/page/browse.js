/* assets/js/pages/browse.js - FINAL FIXED VERSION */

// =================================================
// 0. GLOBAL STATE & VARIABLES (WAJIB DI ATAS)
// =================================================
let topChartSwiperInstance = null; // Variabel ini yang bikin error sebelumnya

let activeFilters = {
  search: "",
  platform: "",
  genre: "",
  tags: "",
  stores: "",
  developers: "",
  publishers: "",
  ordering: "-added",
  page: 1,
};

const filterConfig = [
  { type: "dropdown", name: "Genre", id: "genre-list", items: [] },
  {
    type: "dropdown",
    name: "Features",
    items: [
      { name: "Singleplayer", id: "singleplayer" },
      { name: "Multiplayer", id: "multiplayer" },
      { name: "Co-op", id: "co-op" },
      { name: "VR", id: "vr" },
    ],
  },
  {
    type: "dropdown",
    name: "Platform",
    isPlatform: true,
    items: [
      { name: "PC", id: 4, icon: "bi-windows" },
      { name: "PlayStation 5", id: 187, icon: "bi-playstation" },
      { name: "PlayStation 4", id: 18, icon: "bi-playstation" },
      { name: "Xbox Series X", id: 186, icon: "bi-xbox" },
      { name: "Nintendo Switch", id: 7, icon: "bi-nintendo-switch" },
      { name: "iOS", id: 3, icon: "bi-phone" },
      { name: "Android", id: 21, icon: "bi-android2" },
    ],
  },
  {
    type: "dropdown",
    name: "Stores",
    items: [
      { name: "Steam", id: 1 },
      { name: "Epic Games", id: 11 },
      { name: "PlayStation Store", id: 3 },
      { name: "Xbox Store", id: 2 },
      { name: "Nintendo Store", id: 6 },
    ],
  },
  {
    type: "dropdown",
    name: "Publishers",
    items: [
      { name: "Ubisoft", id: "ubisoft" },
      { name: "Electronic Arts", id: "electronic-arts" },
      { name: "Sony Interactive", id: "sony-interactive-entertainment" },
      { name: "Square Enix", id: "square-enix" },
      { name: "Nintendo", id: "nintendo" },
    ],
  },
];

// =================================================
// 1. GENRE CAROUSEL (STACK EFFECT)
// =================================================
// =================================================
// 1. GENRE CAROUSEL (STACK EFFECT) - FIXED ROBUSTNESS
// =================================================
async function initGenreSwiper() {
  const container = document.getElementById("genreSwiperWrapper");
  if (!container) return;

  // Fetch Genre List
  const genres = await fetchData(
    "genres",
    "ordering=-games_count&page_size=10"
  );
  container.innerHTML = "";

  genres.forEach((genre) => {
    const slide = document.createElement("div");
    slide.classList.add("swiper-slide");
    const cardId = `genre-card-${genre.id}`;

    slide.onclick = () => window.filterByGenre(genre.slug, genre.name);

    const defaultImg =
      genre.image_background || "https://placehold.co/70x95/333/ccc";

    // Pastikan style CSS variables sudah disematkan
    slide.innerHTML = `
            <div class="genre-card" id="${cardId}" style="--bg-left: url(''); --bg-right: url('');">
                <div class="genre-img-wrap">
                    <img src="${defaultImg}" id="${cardId}-img" alt="${genre.name}" loading="lazy">
                </div>
                <h3>${genre.name}</h3>
            </div>
        `;
    container.appendChild(slide);
    updateGenreCardImages(genre.slug, cardId);
  });

  // --- INISIALISASI SWIPER (FIXED) ---
  if (typeof Swiper !== "undefined") {
    // Hancurkan Swiper lama jika ada (pencegahan)
    if (window.genreSwiperInstance) {
      window.genreSwiperInstance.destroy(true, true);
    }

    // PENTING: Tambahkan observer dan observeParents
    window.genreSwiperInstance = new Swiper(".myGenreSwiper", {
      slidesPerView: 2,
      spaceBetween: 15,
      observer: true,
      observeParents: true, // AKTIFKAN AUTO-FIX LAYOUT
      navigation: {
        nextEl: ".nav-btn-next-genre",
        prevEl: ".nav-btn-prev-genre",
      },
      breakpoints: {
        640: { slidesPerView: 3, spaceBetween: 20 },
        768: { slidesPerView: 4, spaceBetween: 20 },
        1024: { slidesPerView: 5, spaceBetween: 20 },
      },
    });
  }
}

async function updateGenreCardImages(genreSlug, cardId) {
  const games = await fetchData(
    "games",
    `genres=${genreSlug}&ordering=-metacritic&page_size=3`
  );
  if (games && games.length >= 3) {
    const card = document.getElementById(cardId);
    const mainImg = document.getElementById(`${cardId}-img`);
    if (card && mainImg) {
      mainImg.src = games[0].background_image;
      card.style.setProperty(
        "--bg-left",
        `url('${games[1].background_image}')`
      );
      card.style.setProperty(
        "--bg-right",
        `url('${games[2].background_image}')`
      );
    }
  }
}

// =================================================
// 2. TOP CHARTS (TAB MENU)
// =================================================
async function initTopCharts(type = "year") {
  const container = document.getElementById("topChartWrapper");
  if (!container) return;

  container.innerHTML = "";

  const currentYear = new Date().getFullYear();
  const prevYear = currentYear - 1;
  let apiParams = "";

  // Update Text Tab (Safe Check)
  const prevBtn = document.querySelector("button[onclick*='prev-year']");
  if (prevBtn) prevBtn.innerText = `Popular in ${prevYear}`;

  const currBtn = document.querySelector(
    "button[onclick*='switchTopTab(\\'year\\'']"
  );
  if (currBtn) currBtn.innerText = `Best of ${currentYear}`;

  if (type === "year")
    apiParams = `dates=${currentYear}-01-01,${currentYear}-12-31&ordering=-added&page_size=10`;
  else if (type === "prev-year")
    apiParams = `dates=${prevYear}-01-01,${prevYear}-12-31&ordering=-added&page_size=10`;
  else if (type === "all-time") apiParams = `ordering=-added&page_size=10`;

  try {
    const games = await fetchData("games", apiParams);

    games.forEach((game) => {
      const slide = document.createElement("div");
      slide.classList.add("swiper-slide");
      // Gunakan createGameCard agar tombol wishlist ada
      slide.innerHTML = createGameCard(game);
      container.appendChild(slide);
    });

    // Reset Swiper Lama
    if (topChartSwiperInstance) {
      topChartSwiperInstance.destroy(true, true);
    }

    // Init Swiper Baru
    if (typeof Swiper !== "undefined") {
      topChartSwiperInstance = new Swiper(".myTopChartSwiper", {
        slidesPerView: 2,
        spaceBetween: 15,
        navigation: { nextEl: ".nav-next-chart", prevEl: ".nav-prev-chart" },
        breakpoints: {
          640: { slidesPerView: 3, spaceBetween: 20 },
          1024: { slidesPerView: 5, spaceBetween: 20 },
        },
      });
    }
  } catch (error) {
    console.error("Gagal load Top Charts:", error);
  }
}

window.switchTopTab = function (type, btnElement) {
  document
    .querySelectorAll(".chart-tabs .tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  btnElement.classList.add("active");
  initTopCharts(type);
};

// =================================================
// 3. SIDEBAR FILTER SYSTEM
// =================================================
async function initFilterSidebar() {
  const container = document.getElementById("filterListContainer");
  if (!container) return;

  container.innerHTML = "";

  const genres = await fetchData(
    "genres",
    "ordering=-games_count&page_size=10"
  );
  const genreConfig = filterConfig.find((c) => c.name === "Genre");
  if (genreConfig)
    genreConfig.items = genres.map((g) => ({ name: g.name, id: g.slug }));

  filterConfig.forEach((group) => {
    if (group.type === "single") {
      const div = document.createElement("div");
      div.className = "filter-single-link";
      div.innerText = group.name;
      div.onclick = () => alert(`${group.name} filter coming soon!`);
      container.appendChild(div);
    } else if (group.type === "dropdown") {
      const groupDiv = document.createElement("div");
      groupDiv.className = "filter-group";

      const header = document.createElement("div");
      header.className = "filter-title";
      header.innerHTML = `${group.name} <i class="bi bi-chevron-down"></i>`;

      const content = document.createElement("div");
      content.className = "filter-content";
      if (group.name === "Platform" || group.name === "Genre")
        content.classList.add("show");

      header.onclick = () => {
        content.classList.toggle("show");
        header.classList.toggle("active");
      };

      if (group.items) {
        group.items.forEach((item) => {
          const btn = document.createElement("div");
          if (group.isPlatform) {
            btn.className = "platform-item";
            btn.innerHTML = `<i class="bi ${item.icon}"></i> <span>${item.name}</span>`;
            btn.onclick = () => toggleFilter(group.name, item.id, btn); // FIXED: group.name
          } else {
            btn.className = "filter-btn";
            btn.innerText = item.name;
            btn.onclick = () => toggleFilter(group.name, item.id, btn); // FIXED: group.name
          }
          content.appendChild(btn);
        });
      }
      groupDiv.appendChild(header);
      groupDiv.appendChild(content);
      container.appendChild(groupDiv);
    }
  });

  const searchInput = document.getElementById("filterSearchInput");
  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        activeFilters.search = e.target.value;
        applyFilters();
      }
    });
  }
}

window.toggleFilter = function (categoryName, value, element) {
  let filterType = "";
  if (categoryName === "Genre") filterType = "genre";
  else if (categoryName === "Platform") filterType = "platform";
  else if (categoryName === "Features") filterType = "tags";
  else if (categoryName === "Stores") filterType = "stores";
  else if (categoryName === "Publishers") filterType = "publishers";
  else if (categoryName === "Developers") filterType = "developers";

  if (!filterType) return;

  const isSelected = element.classList.contains("selected");
  const parent = element.parentElement;
  parent
    .querySelectorAll(".selected")
    .forEach((el) => el.classList.remove("selected"));

  if (!isSelected) {
    element.classList.add("selected");
    activeFilters[filterType] = value;
  } else {
    activeFilters[filterType] = "";
  }
  applyFilters();
};

window.applyFilters = function () {
  const sortSelect = document.getElementById("sortSelector");
  if (sortSelect) activeFilters.ordering = sortSelect.value;

  let count = 0;
  Object.values(activeFilters).forEach((val) => {
    if (val && val !== "-added" && val !== 1) count++;
  });

  const filterCount = document.getElementById("filterCount");
  if (filterCount) filterCount.innerText = `(${count})`;

  activeFilters.page = 1;
  loadGamesForBrowse(false);
};

window.resetFilters = function () {
  activeFilters = {
    search: "",
    platform: "",
    genre: "",
    ordering: "-added",
    tags: "",
    stores: "",
    developers: "",
    publishers: "",
    page: 1,
  };

  document
    .querySelectorAll(".selected")
    .forEach((el) => el.classList.remove("selected"));

  const searchInput = document.getElementById("filterSearchInput");
  if (searchInput) searchInput.value = "";

  // Safe Check Element
  const filterCount = document.getElementById("filterCount");
  if (filterCount) filterCount.innerText = "(0)";

  const currentFilter = document.getElementById("currentFilter");
  if (currentFilter) currentFilter.innerText = "All Games";

  applyFilters();
};

// =================================================
// 4. LOAD GAME GRID & PAGINATION
// =================================================
window.loadMoreGames = function () {
  activeFilters.page++;
  loadGamesForBrowse(true);
};

window.loadGamesForBrowse = async function (isAppend = false) {
  const container = document.getElementById("browseContainer");
  const btnLoadMore = document.getElementById("btnLoadMore");
  if (!container) return;

  if (!isAppend) {
    container.innerHTML =
      '<p style="color:#777; grid-column:1/-1; text-align:center; padding:40px;">Loading games...</p>';
    if (btnLoadMore) btnLoadMore.style.display = "none";
  } else {
    if (btnLoadMore) btnLoadMore.innerText = "Loading...";
  }

  // Build Query Params
  let params = `page_size=20&page=${activeFilters.page}&ordering=${activeFilters.ordering}`;
  if (activeFilters.search) params += `&search=${activeFilters.search}`;
  if (activeFilters.genre) params += `&genres=${activeFilters.genre}`;
  if (activeFilters.platform) params += `&platforms=${activeFilters.platform}`;
  if (activeFilters.tags) params += `&tags=${activeFilters.tags}`;
  if (activeFilters.stores) params += `&stores=${activeFilters.stores}`;
  if (activeFilters.publishers)
    params += `&publishers=${activeFilters.publishers}`;
  if (activeFilters.developers)
    params += `&developers=${activeFilters.developers}`;

  try {
    const games = await fetchData("games", params);

    if (!isAppend) container.innerHTML = "";

    if (games && games.length > 0) {
      games.forEach((game) => {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = createGameCard(game);
        container.appendChild(tempDiv.firstElementChild);
      });

      if (btnLoadMore) {
        btnLoadMore.style.display = "inline-block";
        btnLoadMore.innerText = "Load More";
      }
    } else {
      if (!isAppend)
        container.innerHTML =
          "<p style='color:#ccc; grid-column:1/-1; text-align:center;'>No games found.</p>";
      if (btnLoadMore) btnLoadMore.style.display = "none";
    }
  } catch (error) {
    console.error("Error loading games:", error);
    if (!isAppend)
      container.innerHTML = "<p style='color:red'>Failed to load games.</p>";
  }
};

// Fungsi dipanggil dari Mega Menu Navbar
window.filterFromMegaMenu = function (type, value, name) {
  // 1. Reset dulu semua
  resetFilters();

  // 2. Set Filter & Text
  const filterText = document.getElementById("currentFilter");
  if (filterText) filterText.innerText = `${type}: ${name}`;

  if (type === "Genre") {
    activeFilters.genre = value;
  } else if (type === "Platform") {
    // Mapping ID manual
    const platformMap = {
      pc: 4,
      playstation: 18,
      xbox: 1,
      ios: 3,
      android: 21,
      mac: 5,
      linux: 6,
      nintendo: 7,
    };
    const lowerName = name.toLowerCase();
    let matchedID = 4; // default PC
    for (const key in platformMap) {
      if (lowerName.includes(key)) matchedID = platformMap[key];
    }
    activeFilters.platform = matchedID;
  } else if (type === "Publisher") {
    activeFilters.publishers = value;
  }

  // 3. Pindah ke Browse & Load
  switchPage("view-browse");
  const gameArea = document.querySelector(".browse-content-area");
  if (gameArea) gameArea.scrollIntoView({ behavior: "smooth" });

  loadGamesForBrowse();
};

// Shortcut untuk internal
window.filterByGenre = function (slug, name) {
  window.filterFromMegaMenu("Genre", slug, name);
};

// =================================================
// 5. MAIN INIT (ENTRY POINT)
// =================================================
window.loadBrowsePage = function () {
  console.log("📂 Load Browse Page...");

  initGenreSwiper();
  initFilterSidebar();

  const topContainer = document.getElementById("topChartWrapper");
  if (topContainer && topContainer.innerHTML.trim() === "") {
    initTopCharts("year");
  }

  const container = document.getElementById("browseContainer");
  if (
    container &&
    (container.innerHTML.trim() === "" ||
      container.innerText.includes("Loading"))
  ) {
    loadGamesForBrowse();
  }
};
