/* assets/js/router.js - FIXED CALENDAR LOGIC */

// =================================================
// 1. FUNGSI GANTI HALAMAN (CORE NAVIGATION)
// =================================================
window.switchPage = function (pageId) {
  console.log("Navigasi ke:", pageId);

  // 1. Simpan halaman terakhir ke LocalStorage
  localStorage.setItem("activePage", pageId);

  // 2. Update Style Tombol Navigasi
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    if (tab.dataset.target === pageId) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });

  // 3. Show/Hide Section
  document.querySelectorAll(".page-section").forEach((section) => {
    if (section.id === pageId) {
      section.classList.add("active");
      section.classList.remove("hidden");
    } else {
      section.classList.remove("active");
      if (section.id === "view-detail") section.classList.add("hidden");
    }
  });

  // --- TRIGGER LOGIC PER HALAMAN ---

  // A. BROWSE TAB
  if (pageId === "view-browse") {
    if (typeof window.loadBrowsePage === "function") {
      const container = document.getElementById("browseContainer");
      const genreWrapper = document.getElementById("genreSwiperWrapper");

      // Cek apakah konten masih kosong/loading
      if (
        (container && container.innerText.includes("Loading")) ||
        (genreWrapper && genreWrapper.innerHTML.trim() === "")
      ) {
        window.loadBrowsePage();
      }
    }
  }

  // B. NEWS TAB
  if (pageId === "view-news") {
    if (typeof window.loadNewsPage === "function") {
      const newsContainer = document.getElementById("newsFeed");
      // Cek apakah masih ada skeleton loader
      if (
        newsContainer &&
        (newsContainer.innerHTML.trim() === "" ||
          newsContainer.querySelector(".skeleton-news-item"))
      ) {
        window.loadNewsPage();
      }
    }
  }

  // C. CALENDAR TAB (PERBAIKAN DISINI)
  if (pageId === "view-calendar") {
    if (typeof window.loadCalendarPage === "function") {
      const calendarGrid = document.getElementById("calendarGrid");

      // Cek apakah sudah ada kartu game? Jika belum, berarti belum load.
      const hasGames =
        calendarGrid && calendarGrid.querySelector(".store-card");

      if (!hasGames) {
        window.loadCalendarPage();
      }
    } else {
      console.error("❌ Fungsi loadCalendarPage belum dimuat! Cek calendar.js");
    }
  }

  // D. COMMUNITY TAB
  if (pageId === "view-community") {
    if (typeof window.loadCommunityPage === "function") {
      const masonry = document.getElementById("communityMasonry");
      if (
        masonry &&
        (masonry.innerHTML.trim() === "" ||
          masonry.querySelector(".skeleton-masonry"))
      ) {
        window.loadCommunityPage();
      }
    }
  }

  // E. MY LIBRARY TAB
  if (pageId === "view-collection") {
    if (typeof window.loadCollectionPage === "function") {
      window.loadCollectionPage();
    }
  }
};

// =================================================
// 2. LIVE SEARCH SYSTEM
// =================================================
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function renderDropdown(games, query, dropdown) {
  dropdown.innerHTML = '<span class="dropdown-label">Top Results</span>';
  games.slice(0, 4).forEach((game) => {
    const div = document.createElement("div");
    div.className = "search-result-item";
    div.onclick = () => {
      if (typeof openGameDetail === "function") openGameDetail(game.id);
      dropdown.style.display = "none";
      document.getElementById("globalSearch").value = "";
    };
    const img = game.background_image || "https://placehold.co/40x50/333/ccc";
    div.innerHTML = `<img src="${img}"><div class="item-info"><span class="item-title">${game.name}</span><span class="item-type">Base Game</span></div>`;
    dropdown.appendChild(div);
  });

  const viewAll = document.createElement("div");
  viewAll.className = "view-all-link";
  viewAll.innerHTML = `View all results for "${query}" <i class="bi bi-arrow-right"></i>`;
  viewAll.onclick = (e) => {
    e.preventDefault();
    dropdown.style.display = "none";
    switchPage("view-browse");
    const filterTitle = document.getElementById("currentFilter");
    if (filterTitle) filterTitle.innerText = `Search: ${query}`;
    if (typeof loadGamesForBrowse === "function") loadGamesForBrowse(query);
  };
  dropdown.appendChild(viewAll);
}

// =================================================
// 3. HALAMAN DETAIL GAME
// =================================================
// =================================================
// 3. HALAMAN DETAIL GAME (DELEGASI BERSIH)
// =================================================
window.openGameDetail = function (gameId) {
  console.log("Router: Membuka detail ID", gameId);

  // 1. Pindah Halaman & Scroll Top
  switchPage("view-detail");
  window.scrollTo(0, 0);

  // 2. Panggil Logic Detail dari file detail.js
  // Kita TIDAK mengubah innerText disini untuk mencegah error null
  if (typeof window.loadDetailData === "function") {
    window.loadDetailData(gameId);
  } else {
    console.error(
      "❌ detail.js belum dimuat! Pastikan script ada di index.html"
    );
    // Fallback aman jika detail.js belum load
    const title = document.getElementById("detailTitle");
    if (title) title.innerText = "Error: Script detail.js missing";
  }
};

// =================================================
// 4. MAIN INIT
// =================================================
function initRouter() {
  console.log("✅ Router System Ready");

  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      switchPage(tab.dataset.target);
    });
  });

  const searchInput = document.getElementById("globalSearch");
  const dropdown = document.getElementById("searchDropdown");

  if (searchInput && dropdown) {
    searchInput.addEventListener(
      "input",
      debounce(async (e) => {
        const query = e.target.value.trim();
        if (query.length < 2) {
          dropdown.style.display = "none";
          return;
        }
        dropdown.style.display = "block";
        dropdown.innerHTML = `<div style="padding:15px; color:#aaa;">Searching...</div>`;

        if (typeof fetchData !== "undefined") {
          const games = await fetchData("games", `search=${query}&page_size=5`);
          if (games.length > 0) renderDropdown(games, query, dropdown);
          else
            dropdown.innerHTML =
              '<div style="padding:15px; color:#ccc;">No results.</div>';
        }
      }, 500)
    );

    document.addEventListener("click", (e) => {
      if (!searchInput.contains(e.target) && !dropdown.contains(e.target))
        dropdown.style.display = "none";
    });

    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        dropdown.style.display = "none";
        switchPage("view-browse");
        const filter = document.getElementById("currentFilter");
        if (filter) filter.innerText = `Search: ${searchInput.value}`;
        if (typeof loadGamesForBrowse === "function")
          loadGamesForBrowse(searchInput.value);
      }
    });
  }

  const lastPage = localStorage.getItem("activePage");
  if (lastPage) switchPage(lastPage);
  else switchPage("view-discover");
}

document.addEventListener("DOMContentLoaded", initRouter);
