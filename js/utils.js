/* assets/js/utils.js - FINAL VERSION (SAFE ENCODING) */

// =================================================
// 1. MAPPING ICON
// =================================================
const iconMap = {
  PC: "bi-windows",
  PlayStation: "bi-playstation",
  Xbox: "bi-xbox",
  iOS: "bi-apple",
  Android: "bi-android",
  Nintendo: "bi-nintendo-switch",
  Linux: "bi-ubuntu",
  Action: "bi-crosshair",
  Indie: "bi-joystick",
  Adventure: "bi-map",
  RPG: "bi-gem",
  Strategy: "bi-flag",
  Shooter: "bi-bullseye",
  default: "bi-building",
};

function getIconClass(name) {
  let icon = iconMap[name] || iconMap["default"];
  if (name.includes("PlayStation")) icon = "bi-playstation";
  if (name.includes("Xbox")) icon = "bi-xbox";
  return icon;
}

// =================================================
// 2. CARD GENERATOR (SAFE DATA PASSING)
// =================================================
function createGameCard(game) {
  // A. Data Cleaning
  const genreName =
    game.genres && game.genres.length > 0 ? game.genres[0].name : "Game";
  const bgImage =
    game.background_image ||
    "https://placehold.co/400x500/202020/white?text=No+Image";
  const rating = game.rating || 0;
  const released = game.released || "TBA";

  // B. ENCODING DATA (PENTING: Agar tidak error saat diklik)
  // Kita ubah spasi, kutip, dan karakter spesial menjadi kode URI
  const encId = game.id;
  const encName = encodeURIComponent(game.name);
  const encImage = encodeURIComponent(bgImage);
  const encGenres = encodeURIComponent(JSON.stringify(game.genres || []));
  const encRating = rating;
  const encReleased = encodeURIComponent(released);

  // C. Cek Status (Menggunakan fungsi global dari collection.js)
  // Kita gunakan try-catch atau typeof check untuk menghindari error jika collection.js belum load
  let inWishlist = false;
  let inCollection = false;

  if (typeof isGameInWishlist === "function")
    inWishlist = isGameInWishlist(game.id);
  if (typeof isGameInAnyCollection === "function")
    inCollection = isGameInAnyCollection(game.id);

  // D. Styling Tombol
  const wishIcon = inWishlist ? "bi bi-heart-fill" : "bi bi-heart";
  const wishColor = inWishlist ? "color:#ff4d4d;" : "color:white;";

  const colIcon = inCollection ? "bi bi-bookmark-fill" : "bi bi-bookmark";
  const colColor = inCollection ? "color:#0074e4;" : "color:white;";

  // E. Return HTML
  return `
        <div class="store-card" onclick="window.openGameDetail(${game.id})">
            <div class="card-image-wrap">
                <img src="${bgImage}" alt="${game.name}" loading="lazy">
                
                <div class="card-actions-overlay">
                    <button class="btn-action-card" 
                            onclick="window.handleQuickWishlist(event, ${encId}, '${encName}', '${encImage}', ${encRating}, '${encReleased}', '${encGenres}')">
                        <i class="${wishIcon}" style="${wishColor}"></i>
                    </button>

                    <button class="btn-action-card" 
                            onclick="window.handleOpenCollectionModal(event, ${encId}, '${encName}', '${encImage}', ${encRating}, '${encReleased}', '${encGenres}')">
                        <i class="${colIcon}" style="${colColor}"></i>
                    </button>
                </div>
            </div>
            <div class="card-content">
                <span class="game-category">${genreName}</span>
                <h4 class="game-title">${game.name}</h4>
                <div class="game-meta-row">
                    <span class="badge-rating"><i class="bi bi-star-fill"></i> ${rating}</span>
                    <span class="meta-date">${released}</span>
                </div>
            </div>
        </div>
    `;
}

// =================================================
// 3. RENDER GRID
// =================================================
function displayGames(games, containerId = "browseContainer") {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!games || games.length === 0) {
    if (container.innerHTML === "")
      container.innerHTML = '<p style="color:#777">No games found.</p>';
    return;
  }

  let htmlContent = "";
  games.forEach((game) => {
    htmlContent += createGameCard(game);
  });

  container.innerHTML += htmlContent;
}
