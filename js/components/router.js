/* assets/js/router.js - FINAL CLEAN VERSION */

// =================================================
// 1. FUNGSI GANTI HALAMAN (CORE NAVIGATION)
// =================================================
window.switchPage = function (pageId) {
  console.log("Navigasi ke:", pageId);
  localStorage.setItem("activePage", pageId);

  document.querySelectorAll(".nav-tab").forEach((tab) => {
    if (tab.dataset.target === pageId) tab.classList.add("active");
    else tab.classList.remove("active");
  });

  document.querySelectorAll(".page-section").forEach((section) => {
    if (section.id === pageId) {
      section.classList.add("active");
      section.classList.remove("hidden");
    } else {
      section.classList.remove("active");
      if (section.id === "view-detail") section.classList.add("hidden");
    }
  });

  // TRIGGER LOAD LAZY PER PAGE
  if (pageId === "view-browse") {
    const container = document.getElementById("browseContainer");
    if (container && container.innerText.includes("Loading")) {
      if (typeof window.loadBrowsePage === "function") window.loadBrowsePage();
    }
  }

  if (pageId === "view-news") {
    const newsContainer = document.getElementById("newsFeed");
    if (newsContainer && newsContainer.querySelector(".skeleton-news-item")) {
      if (typeof window.loadNewsPage === "function") window.loadNewsPage();
    }
  }

  // C. CALENDAR TAB (FIXED LOGIC)
  if (pageId === "view-calendar") {
    if (typeof window.loadCalendarPage === "function") {
      const calendarGrid = document.getElementById("calendarGrid");

      // LOGIKA BARU:
      // Cek apakah di dalamnya sudah ada kartu game (.store-card)?
      // Jika TIDAK ADA kartu, berarti kita harus load datanya.
      const hasGames =
        calendarGrid && calendarGrid.querySelector(".store-card");

      if (!hasGames) {
        window.loadCalendarPage();
      }
    } else {
      console.error("Fungsi loadCalendarPage belum dimuat! Cek calendar.js");
    }
  }

  if (pageId === "view-collection") {
    if (typeof window.loadCollectionPage === "function")
      window.loadCollectionPage();
  }

  if (pageId === "view-community") {
    const masonry = document.getElementById("communityMasonry");
    if (masonry && masonry.querySelector(".skeleton-masonry")) {
      if (typeof window.loadCommunityPage === "function")
        window.loadCommunityPage();
    }
  }
};

// =================================================
// 2. BUKA HALAMAN DETAIL (DIPANGGIL DARI ONCLICK CARD)
// =================================================
window.openGameDetail = function (gameId) {
  console.log("Router: Membuka detail ID", gameId);

  // 1. Pindah Halaman
  switchPage("view-detail");
  window.scrollTo(0, 0);

  // 2. Delegasikan ke detail.js
  if (typeof window.loadDetailData === "function") {
    window.loadDetailData(gameId);
  } else {
    console.error(
      "❌ detail.js belum dimuat! Pastikan script ada di index.html"
    );
    alert("Gagal memuat detail.js");
  }
};

// =================================================
// 3. SEARCH SYSTEM
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
      if (typeof window.openGameDetail === "function")
        window.openGameDetail(game.id);
      dropdown.style.display = "none";
      document.getElementById("globalSearch").value = "";
    };
    const img = game.background_image || "https://placehold.co/40x50/333/ccc";
    div.innerHTML = `<img src="${img}"><div class="item-info"><span class="item-title">${game.name}</span><span class="item-type">Base Game</span></div>`;
    dropdown.appendChild(div);
  });
}

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
        if (typeof window.loadGamesForBrowse === "function")
          window.loadGamesForBrowse(searchInput.value);
      }
    });
  }

  const lastPage = localStorage.getItem("activePage");
  if (lastPage) switchPage(lastPage);
  else switchPage("view-discover");
}

document.addEventListener("DOMContentLoaded", initRouter);
