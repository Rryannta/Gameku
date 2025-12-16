/* assets/js/router.js - FINAL CLEAN VERSION + HEART ICON FIX */

// =================================================
// 1. FUNGSI GANTI HALAMAN (CORE NAVIGATION)
// =================================================
window.switchPage = function (pageId) {
  console.log("Navigasi ke:", pageId);
  localStorage.setItem("activePage", pageId);

  // Update Navigasi Tab (Discover, Browse, dll.)
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    if (tab.dataset.target === pageId) tab.classList.add("active");
    else tab.classList.remove("active");
  });

  // Tampilkan/Sembunyikan Section
  document.querySelectorAll(".page-section").forEach((section) => {
    if (section.id === pageId) {
      section.classList.add("active");
      section.classList.remove("hidden");
    } else {
      section.classList.remove("active");
      // Kecuali halaman Detail, kita sembunyikan sepenuhnya (hidden)
      if (section.id === "view-detail") section.classList.add("hidden");
    }
  });

  // ========================================
  // LOGIC TRIGGER LOAD LAZY PER PAGE
  // ========================================
  if (pageId === "view-browse") {
    const container = document.getElementById("browseContainer");
    // Cek jika container masih berisi teks 'Loading' atau kosong
    if (
      container &&
      (container.innerText.includes("Loading") ||
        container.innerHTML.trim() === "")
    ) {
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
// 3. SEARCH SYSTEM & INITIALIZATION
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

/* assets/js/router.js - PERBAIKAN LOGO NAVIGATION */

function initRouter() {
  console.log("✅ Router System Ready");

  // 1. Navigasi Tab Bar (Discover, Browse, dll.)
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      switchPage(tab.dataset.target);
    });
  });

  // 2. Navigasi Ikon Heart (Library/Collection)
  const navHeartIcon = document.getElementById("navHeartIcon");
  if (navHeartIcon) {
    navHeartIcon.addEventListener("click", (e) => {
      e.preventDefault();
      switchPage("view-collection");
    });
  }

  // 3. [KODE LOGO BARU & FIXED] Navigasi Logo/Home
  // Menggunakan querySelectorAll untuk class, lalu menggunakan forEach.
  // Jika logo Anda punya ID="mainLogo", ganti querySelectorAll menjadi getElementById("mainLogo")
  document.querySelectorAll(".logo-nav, #mainLogo").forEach((logo) => {
    logo.addEventListener("click", (e) => {
      e.preventDefault();
      switchPage("view-discover");
    });
  });
  // Jika Anda yakin logo hanya ada 1 dan punya ID:
  /*
    const mainLogo = document.getElementById("mainLogo");
    if (mainLogo) {
        mainLogo.addEventListener("click", (e) => {
            e.preventDefault();
            switchPage("view-discover");
        });
    }
    */

  // 4. Search Bar Logic
  const searchInput = document.getElementById("globalSearch");
  // ... (kode Search Bar Logic sisanya tetap sama)
}

document.addEventListener("DOMContentLoaded", initRouter);
