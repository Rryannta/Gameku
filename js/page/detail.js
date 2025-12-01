/* assets/js/pages/detail.js - ANTI-CRASH VERSION */

let currentGameData = null;
const API_KEY_DETAIL = "de9e2ca2dec544d7b38e39b1a250d36e"; // Key Anda

window.loadDetailData = async function (gameId) {
  console.log("📂 Memuat Detail Game ID:", gameId);

  // 1. Reset UI
  resetDetailUI();

  try {
    // 2. Fetch Data
    const response = await fetch(
      `https://api.rawg.io/api/games/${gameId}?key=${API_KEY_DETAIL}`
    );

    if (!response.ok) {
      throw new Error(`Gagal fetch detail (Status: ${response.status})`);
    }

    const game = await response.json();
    console.log("📦 Data Game:", game);

    currentGameData = game;
    window.currentGameId = game.id;

    // 3. Render Data (Dengan Pengecekan Aman)
    renderMainInfo(game);
    renderMetaInfo(game);
    renderTags(game);
    renderSystemReqs(game); // <--- Sering error disini, sudah diperbaiki di bawah

    // 4. Render Tombol
    if (typeof renderDetailButtons === "function") {
      renderDetailButtons();
    }

    // 5. Fetch Screenshot
    fetchScreenshots(gameId);
  } catch (e) {
    console.error("❌ CRASH DI DETAIL:", e);
    document.getElementById("detailTitle").innerText = "Error";
    document.getElementById(
      "detailDesc"
    ).innerHTML = `<span style="color:#ff4d4d">Gagal memuat data: ${e.message}</span>`;
  }
};

// --- FUNGSI RENDER AMAN ---

function resetDetailUI() {
  setText("detailTitle", "Loading...");
  setText("detailDesc", "Fetching game details...");
  setText("detailDev", "-");
  setText("detailPub", "-");
  setText("detailDate", "-");
  setText("detailPlatform", "-");

  const header = document.getElementById("detailHeader");
  if (header) header.style.backgroundImage = "none";

  const req = document.getElementById("detailRequirements");
  if (req) req.innerHTML = '<p style="color:#777">Loading specs...</p>';

  const screens = document.getElementById("detailScreenshots");
  if (screens) screens.innerHTML = "";

  const actions = document.getElementById("detailActionArea");
  if (actions) actions.innerHTML = "";
}

// Helper ganti teks aman
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.innerText = text;
}

function renderMainInfo(game) {
  setText("detailTitle", game.name);

  const descEl = document.getElementById("detailDesc");
  if (descEl)
    descEl.innerHTML = game.description || "No description available.";

  if (game.background_image) {
    document.getElementById(
      "detailHeader"
    ).style.backgroundImage = `url('${game.background_image}')`;
  }

  const metaEl = document.getElementById("detailMetascore");
  if (metaEl) {
    if (game.metacritic) {
      metaEl.innerText = game.metacritic;
      metaEl.style.borderColor = "#6dc849";
      metaEl.style.color = "#6dc849";
    } else {
      metaEl.innerText = `${game.rating}/5`;
      metaEl.style.borderColor = "#ccc";
      metaEl.style.color = "#ccc";
    }
  }
}

function renderMetaInfo(game) {
  // Developer (Cek array kosong)
  const dev =
    game.developers && game.developers.length > 0
      ? game.developers[0].name
      : "-";
  setText("detailDev", dev);

  // Publisher
  const pub =
    game.publishers && game.publishers.length > 0
      ? game.publishers[0].name
      : "-";
  setText("detailPub", pub);

  // Tanggal
  setText("detailDate", game.released || "TBA");

  // Platform List
  const plats = (game.parent_platforms || [])
    .map((p) => p.platform.name)
    .join(", ");
  setText("detailPlatform", plats || "Multiplatform");
}

function renderTags(game) {
  const container = document.getElementById("detailTags");
  if (!container) return;

  container.innerHTML = "";

  if (game.genres && Array.isArray(game.genres)) {
    game.genres.forEach((g) => {
      container.innerHTML += `<span class="tag-chip">${g.name}</span>`;
    });
  }
}

// --- PERBAIKAN UTAMA ADA DISINI ---
function renderSystemReqs(game) {
  const container = document.getElementById("detailRequirements");
  if (!container) return;

  // Cek dulu apakah game.platforms ada isinya?
  if (!game.platforms || !Array.isArray(game.platforms)) {
    container.innerHTML =
      "<p style='color:#777'>System requirements not available.</p>";
    return;
  }

  // Cari platform PC dengan aman
  const pcPlatform = game.platforms.find((p) => p.platform.slug === "pc");

  // Cek apakah requirements ada?
  if (
    pcPlatform &&
    pcPlatform.requirements &&
    (pcPlatform.requirements.minimum || pcPlatform.requirements.recommended)
  ) {
    const min = pcPlatform.requirements.minimum || "Not specified";
    const rec = pcPlatform.requirements.recommended || "Not specified";

    container.innerHTML = `
            <div class="specs-grid">
                <div class="spec-col">
                    <h4>Minimum</h4>
                    <div style="font-size:13px; color:#ccc; line-height:1.6; white-space: pre-wrap;">${min}</div>
                </div>
                <div class="spec-col">
                    <h4>Recommended</h4>
                    <div style="font-size:13px; color:#ccc; line-height:1.6; white-space: pre-wrap;">${rec}</div>
                </div>
            </div>
        `;
  } else {
    container.innerHTML =
      "<p style='color:#777'>System requirements not available for PC.</p>";
  }
}

async function fetchScreenshots(gameId) {
  try {
    const res = await fetch(
      `https://api.rawg.io/api/games/${gameId}/screenshots?key=${API_KEY_DETAIL}`
    );
    const data = await res.json();
    const container = document.getElementById("detailScreenshots");
    if (!container) return;

    container.innerHTML = "";

    if (data.results && data.results.length > 0) {
      data.results.slice(0, 4).forEach((ss) => {
        const img = document.createElement("img");
        img.src = ss.image;
        container.appendChild(img);
      });
    } else {
      container.innerHTML =
        "<p style='color:#555; font-size:13px'>No screenshots.</p>";
    }
  } catch (e) {
    console.warn("Gagal load screenshot:", e);
  }
}

function renderDetailButtons() {
  const container = document.getElementById("detailActionArea");
  if (!container) return;

  container.innerHTML = "";

  // 1. Tombol Collection (Set Default Text)
  const btnCol = document.createElement("button");
  btnCol.id = "btnDetailCollection";
  btnCol.className = "btn-primary-lg";
  // Default Text (Penting!)
  btnCol.innerHTML = `<i class="bi bi-plus-square"></i> Add to Collection`;

  btnCol.onclick = () => {
    if (!currentGameData) return;
    if (
      typeof isGameInCollection === "function" &&
      isGameInCollection(currentGameData.id)
    ) {
      if (confirm("Remove from collection?"))
        removeFromCollection(currentGameData.id);
    } else {
      addToCollection(currentGameData);
    }
    updateDetailButtonState(currentGameData.id);
  };

  // 2. Tombol Wishlist (Set Default Text)
  const btnWish = document.createElement("button");
  btnWish.id = "btnDetailWishlist";
  // Default Text (Penting!)
  btnWish.innerHTML = `<i class="bi bi-heart"></i> Add to Wishlist`;

  btnWish.onclick = () => {
    if (!currentGameData) return;
    if (
      typeof isGameInWishlist === "function" &&
      isGameInWishlist(currentGameData.id)
    ) {
      removeFromWishlist(currentGameData.id);
    } else {
      addToWishlist(currentGameData);
    }
    updateDetailButtonState(currentGameData.id);
  };

  container.appendChild(btnCol);
  container.appendChild(btnWish);

  // Panggil update state untuk cek status (Hijau/Merah)
  if (typeof updateDetailButtonState === "function") {
    updateDetailButtonState(currentGameData.id);
  }
}

function updateDetailButtonState(gameId) {
  if (typeof isGameInCollection !== "function") return;

  const btnCol = document.getElementById("btnDetailCollection");
  const btnWish = document.getElementById("btnDetailWishlist");

  // Cek Collection
  if (btnCol) {
    if (isGameInCollection(gameId)) {
      btnCol.innerHTML = `<i class="bi bi-check-circle-fill"></i> In Collection`;
      btnCol.style.backgroundColor = "#28a745";
      btnCol.style.border = "none";
    } else {
      btnCol.innerHTML = `Add to Collection`;
      btnCol.style.backgroundColor = "#fff";
      btnCol.style.color = "#000";
    }
  }

  // Cek Wishlist
  if (btnWish) {
    if (isGameInWishlist(gameId)) {
      btnWish.innerHTML = `<i class="bi bi-heart-fill" style="color: #ff4d4d;"></i>`;
      btnWish.style.borderColor = "#ff4d4d";
    } else {
      btnWish.innerHTML = `<i class="bi bi-heart"></i>`;
      btnWish.style.borderColor = "#fff";
    }
  }
}

// Expose
window.loadDetailData = loadDetailData;
