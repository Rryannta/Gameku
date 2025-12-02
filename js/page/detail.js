let currentGameData = null;
const API_KEY_DETAIL = "de9e2ca2dec544d7b38e39b1a250d36e";

// =================================================
// 1. LOAD DETAIL GAME
// =================================================
window.loadDetailData = async function (gameId) {
  console.log("📂 Memuat Detail Game ID:", gameId);
  resetDetailUI();

  try {
    // A. Fetch Data Detail
    const response = await fetch(
      `https://api.rawg.io/api/games/${gameId}?key=${API_KEY_DETAIL}`
    );
    if (!response.ok) throw new Error("Gagal fetch detail");

    const game = await response.json();

    currentGameData = {
      id: game.id,
      name: game.name,
      background_image: game.background_image,
      rating: game.rating,
      released: game.released,
      genres: game.genres,
    };
    window.currentGameId = game.id;

    // B. Render Info
    renderMainInfo(game);
    renderMetaInfo(game);
    renderTags(game);
    renderSystemReqs(game); // <--- LOGIC DIPERBAIKI
    renderDetailButtons();

    // C. Fetch Screenshots
    fetchScreenshots(gameId);

    // D. Fetch More Like This (BARU)
    fetchSuggestedGames(gameId);
  } catch (e) {
    console.error("❌ Error Detail:", e);
    document.getElementById("detailTitle").innerText = "Error Loading Data";
  }
};

// =================================================
// 2. FITUR BARU: MORE LIKE THIS
// =================================================
// =================================================
// 2. FITUR BARU: MORE LIKE THIS (BY GENRE - STABLE VERSION)
// =================================================
async function fetchSuggestedGames(gameId) {
  const container = document.getElementById("detailSuggested");
  if (!container) return;

  container.innerHTML = '<p style="color:#777">Finding similar games...</p>';

  try {
    // A. Cek apakah game yang sedang dibuka punya genre?
    // Kita ambil dari variabel global currentGameData yang sudah diset di loadDetailData
    if (
      !currentGameData ||
      !currentGameData.genres ||
      currentGameData.genres.length === 0
    ) {
      container.innerHTML = "<p style='color:#777'>No similar games found.</p>";
      return;
    }

    // B. Ambil Slug Genre Utama (misal: 'action' atau 'rpg')
    const mainGenre = currentGameData.genres[0].slug;

    // C. Fetch Game dengan Genre yang sama (Urutkan rating biar bagus)
    // Kita minta 6 data (untuk jaga-jaga kita filter game yang sedang dibuka)
    const response = await fetch(
      `https://api.rawg.io/api/games?genres=${mainGenre}&ordering=-metacritic&page_size=6&key=${API_KEY_DETAIL}`
    );

    if (!response.ok) throw new Error("Gagal load related games");

    const data = await response.json();
    const games = data.results;

    container.innerHTML = "";

    if (games && games.length > 0) {
      // D. Filter: Jangan tampilkan game yang sedang dibuka
      const relatedGames = games.filter((g) => g.id !== gameId).slice(0, 5);

      relatedGames.forEach((game) => {
        // Panggil createGameCard dari utils.js
        if (typeof createGameCard === "function") {
          container.innerHTML += createGameCard(game);
        }
      });
    } else {
      container.innerHTML = "<p style='color:#777'>No similar games found.</p>";
    }
  } catch (e) {
    console.warn("Gagal load suggested:", e);
    container.innerHTML =
      "<p style='color:red'>Unable to load recommendations.</p>";
  }
}

// =================================================
// 3. HELPER RENDER (FIXED LOGIC)
// =================================================

function resetDetailUI() {
  document.getElementById("detailTitle").innerText = "Loading...";
  document.getElementById("detailHeader").style.backgroundImage = "none";
  document.getElementById("detailDesc").innerHTML = "";
  document.getElementById("detailRequirements").innerHTML = "Checking specs...";
  document.getElementById("detailActionArea").innerHTML = "";
  document.getElementById("detailScreenshots").innerHTML = "";
  document.getElementById("detailSuggested").innerHTML = ""; // Reset suggested
}

function renderMainInfo(game) {
  document.getElementById("detailTitle").innerText = game.name;
  document.getElementById("detailDesc").innerHTML =
    game.description || "No description available.";

  if (game.background_image) {
    document.getElementById(
      "detailHeader"
    ).style.backgroundImage = `url('${game.background_image}')`;
  }

  // FIX RATING: Prioritaskan Metacritic, kalau tidak ada pakai Rating User
  const metaEl = document.getElementById("detailMetascore");
  if (metaEl) {
    if (game.metacritic) {
      metaEl.innerHTML = `Metascore: <span style="color:#fff">${game.metacritic}</span>`;
      metaEl.style.borderColor = "#6dc849";
      metaEl.style.color = "#6dc849";
    } else {
      // Jika rating 0, tulis N/A
      const rate = game.rating > 0 ? game.rating : "N/A";
      metaEl.innerHTML = `<i class="bi bi-star-fill"></i> User Rating: <span style="color:#fff">${rate}</span>`;
      metaEl.style.borderColor = "#ffc107"; // Kuning bintang
      metaEl.style.color = "#ffc107";
    }
  }
}

// LOGIC SYSTEM REQS DIPERBAIKI (LEBIH AMAN)
function renderSystemReqs(game) {
  const container = document.getElementById("detailRequirements");
  if (!container) return;

  // 1. Cek apakah platforms ada datanya
  if (!game.platforms || game.platforms.length === 0) {
    container.innerHTML =
      "<p style='color:#777; font-size:13px;'>Platform information not available.</p>";
    return;
  }

  // 2. Cari Platform PC
  const pc = game.platforms.find((p) => p.platform.slug === "pc");

  // 3. Cek apakah ada requirements di dalam object PC
  if (
    pc &&
    pc.requirements &&
    (pc.requirements.minimum || pc.requirements.recommended)
  ) {
    // Bersihkan teks dari string "Minimum:" yang kadang kebawa dari API
    let min = pc.requirements.minimum || "Not specified.";
    let rec = pc.requirements.recommended || "Not specified.";

    min = min.replace(/^Minimum:\s*/i, "").trim();
    rec = rec.replace(/^Recommended:\s*/i, "").trim();

    container.innerHTML = `
            <div class="specs-grid">
                <div class="spec-col">
                    <h4>Minimum</h4>
                    <div style="font-size:13px; color:#ccc; line-height:1.6; white-space: pre-line;">${min}</div>
                </div>
                <div class="spec-col">
                    <h4>Recommended</h4>
                    <div style="font-size:13px; color:#ccc; line-height:1.6; white-space: pre-line;">${rec}</div>
                </div>
            </div>
        `;
  } else {
    // Jika game konsol atau tidak ada data spek PC
    container.innerHTML = `
            <p style='color:#aaa; font-size:13px; line-height:1.6;'>
                System requirements are not available for this title.<br>
                It might be a console exclusive or an older title.
            </p>
        `;
  }
}

function renderMetaInfo(game) {
  const dev =
    game.developers && game.developers.length > 0
      ? game.developers[0].name
      : "-";
  document.getElementById("detailDev").innerText = dev;

  const pub =
    game.publishers && game.publishers.length > 0
      ? game.publishers[0].name
      : "-";
  document.getElementById("detailPub").innerText = pub;

  document.getElementById("detailDate").innerText = game.released || "TBA";

  const plats = (game.parent_platforms || [])
    .map((p) => p.platform.name)
    .join(", ");
  document.getElementById("detailPlatform").innerText = plats;
}

function renderTags(game) {
  const container = document.getElementById("detailTags");
  if (!container) return;
  container.innerHTML = "";

  if (game.genres) {
    game.genres.forEach(
      (g) => (container.innerHTML += `<span class="tag-chip">${g.name}</span>`)
    );
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
        "<p style='color:#555; font-size:13px;'>No screenshots available.</p>";
    }
  } catch (e) {}
}

// Render Buttons (Sama seperti sebelumnya)
function renderDetailButtons() {
  const container = document.getElementById("detailActionArea");
  if (!container) return;
  container.innerHTML = "";

  // Tombol Collection
  const btnCol = document.createElement("button");
  btnCol.id = "btnDetailCollection";
  btnCol.className = "btn-primary-lg";
  btnCol.style.marginRight = "15px";

  btnCol.onclick = function () {
    if (!currentGameData) return;
    // Buka Modal
    if (typeof window.openCollectionModal === "function") {
      const genresStr = (currentGameData.genres || [])
        .map((g) => g.name)
        .join(",");
      const safeName = currentGameData.name.replace(/'/g, "\\'");
      window.openCollectionModal(
        event,
        currentGameData.id,
        safeName,
        currentGameData.background_image,
        currentGameData.rating,
        currentGameData.released,
        genresStr
      );
    } else {
      // Fallback
      addGameToCollection("Favorites", currentGameData);
    }
    updateDetailButtonState(currentGameData.id);
  };

  // Tombol Wishlist
  const btnWish = document.createElement("button");
  btnWish.id = "btnDetailWishlist";
  btnWish.className = "btn-secondary"; // Pakai class CSS biar rapi
  // Manual style override jika class btn-secondary belum perfect
  btnWish.style.padding = "12px 20px";
  btnWish.style.border = "1px solid #fff";
  btnWish.style.background = "transparent";
  btnWish.style.color = "white";
  btnWish.style.borderRadius = "8px";

  btnWish.onclick = function () {
    if (!currentGameData) return;
    if (isGameInWishlist(currentGameData.id))
      removeFromWishlist(currentGameData.id);
    else addToWishlist(currentGameData);
    updateDetailButtonState(currentGameData.id);
  };

  container.appendChild(btnCol);
  container.appendChild(btnWish);

  updateDetailButtonState(currentGameData.id);
}

function updateDetailButtonState(gameId) {
  const btnCol = document.getElementById("btnDetailCollection");
  const btnWish = document.getElementById("btnDetailWishlist");
  if (!btnCol || !btnWish) return;

  if (typeof isGameInCollection === "function" && isGameInCollection(gameId)) {
    btnCol.innerHTML = `<i class="bi bi-check-circle-fill"></i> In Collection`;
    btnCol.style.backgroundColor = "#28a745";
    btnCol.style.border = "none";
  } else {
    btnCol.innerHTML = `<i class="bi bi-plus-square"></i> Add to Collection`;
    btnCol.style.backgroundColor = "#fff";
    btnCol.style.color = "#000";
  }

  if (typeof isGameInWishlist === "function" && isGameInWishlist(gameId)) {
    btnWish.innerHTML = `<i class="bi bi-heart-fill" style="color: #ff4d4d;"></i>`;
    btnWish.style.borderColor = "#ff4d4d";
  } else {
    btnWish.innerHTML = `<i class="bi bi-heart"></i>`;
    btnWish.style.borderColor = "#fff";
  }
}

window.loadDetailData = loadDetailData;
window.updateDetailButtonState = updateDetailButtonState;
