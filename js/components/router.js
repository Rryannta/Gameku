/* assets/js/router.js - FULL VERSION */

// --- 1. FUNGSI GANTI HALAMAN (CORE) ---
window.switchPage = function (pageId) {
  console.log("Navigasi ke:", pageId);

  // A. Update Tombol Navigasi (Warna Putih/Abu)
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    if (tab.dataset.target === pageId) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });

  // B. Update Section (Show/Hide Content)
  document.querySelectorAll(".page-section").forEach((section) => {
    if (section.id === pageId) {
      section.classList.add("active");
      section.classList.remove("hidden");
    } else {
      section.classList.remove("active");
      // Tambahkan hidden agar pasti sembunyi (khusus detail page)
      if (section.id === "view-detail") section.classList.add("hidden");
    }
  });

  // C. Logic Khusus saat masuk halaman Browse
  if (pageId === "view-browse") {
    // Cek apakah konten browse kosong? Jika ya, load datanya
    const container = document.getElementById("browseContainer");
    if (container && container.innerHTML.trim() === "") {
      console.log("Load data Browse pertama kali...");
      if (typeof loadGenresCard === "function") loadGenresCard();
      if (typeof loadGamesForBrowse === "function") loadGamesForBrowse();
    }
  }
};

// --- 2. UTIL: DEBOUNCE (Untuk Search) ---
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// --- 3. INIT (Jalankan Event Listener) ---
function initRouter() {
  console.log("✅ Router System Ready");

  // A. EVENT LISTENER NAVIGASI (Discover, Browse, News)
  const tabs = document.querySelectorAll(".nav-tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = tab.dataset.target; // ambil "view-discover" dll
      switchPage(targetId);
    });
  });

  // B. EVENT LISTENER SEARCH (Yang sudah kita buat sebelumnya)
  const searchInput = document.getElementById("globalSearch");
  const dropdown = document.getElementById("searchDropdown");

  if (searchInput && dropdown) {
    // Input Typing
    searchInput.addEventListener(
      "input",
      debounce(async (e) => {
        const query = e.target.value.trim();
        if (query.length < 2) {
          dropdown.style.display = "none";
          return;
        }

        dropdown.style.display = "block";
        dropdown.innerHTML = `<div style="padding:15px; color:#aaa;">Searching "${query}"...</div>`;

        if (typeof fetchData !== "undefined") {
          const games = await fetchData("games", `search=${query}&page_size=5`);
          if (games.length > 0) {
            renderDropdown(games, query, dropdown);
          } else {
            dropdown.innerHTML =
              '<div style="padding:15px; color:#ccc;">No results found.</div>';
          }
        }
      }, 500)
    );

    // Hide on Click Outside
    document.addEventListener("click", (e) => {
      if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = "none";
      }
    });

    // Show on Focus
    searchInput.addEventListener("focus", () => {
      if (searchInput.value.length >= 2) dropdown.style.display = "block";
    });

    // Enter Key
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        dropdown.style.display = "none";
        switchPage("view-browse"); // Pindah ke browse
        // Update judul filter di browse (jika elemen ada)
        const filterTitle = document.getElementById("currentFilter");
        if (filterTitle) filterTitle.innerText = `Search: ${searchInput.value}`;
        // Load data
        if (typeof loadGamesForBrowse === "function")
          loadGamesForBrowse(searchInput.value);
      }
    });
  }
}

// Helper Render Dropdown (Biar rapi)
function renderDropdown(games, query, dropdown) {
  dropdown.innerHTML = '<span class="dropdown-label">Top Results</span>';
  games.slice(0, 4).forEach((game) => {
    const div = document.createElement("div");
    div.className = "search-result-item";
    div.onclick = () => {
      // KLIK ITEM -> BUKA DETAIL
      if (typeof openGameDetail === "function") openGameDetail(game.id);
      else alert("Detail page belum siap: " + game.name);
      dropdown.style.display = "none";
    };
    const img = game.background_image || "https://placehold.co/40x50";
    div.innerHTML = `<img src="${img}"><div class="item-info"><span class="item-title">${game.name}</span><span class="item-type">Base Game</span></div>`;
    dropdown.appendChild(div);
  });
}

// --- 4. LOGIC DETAIL GAME (Yang tadi kita buat) ---
window.openGameDetail = async function (gameId) {
  switchPage("view-detail"); // Pindah tab
  window.scrollTo(0, 0);

  // Reset UI
  const title = document.getElementById("detailTitle");
  if (title) title.innerText = "Loading...";
  // ... (kode fetch detail game kamu bisa ditaruh disini atau tetap di file terpisah) ...
  // Agar rapi, logika fetch detail sebaiknya ada disini atau di panggil dari sini.
  // Untuk saat ini asumsi logika render detail sudah kamu masukkan di tahap sebelumnya.

  // CONTOH PEMANGGILAN FETCH DETAIL (Versi Singkat):
  if (typeof fetchData !== "undefined") {
    // Ingat: Fetch detail butuh endpoint beda, tapi logic dasarnya sama
    // Silakan gunakan kode openGameDetail lengkap dari tahap sebelumnya
    // Disini saya hanya handle switching halamannya.
  }
};

document.addEventListener("DOMContentLoaded", initRouter);
