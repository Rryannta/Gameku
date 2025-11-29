// --- 1. MAPPING ICON ---
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

// --- 2. FUNGSI RENDER GAME GRID (Dipakai di Browse & Search) ---
function displayGames(games, containerId = "browseContainer") {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  if (games.length === 0) {
    container.innerHTML = '<p style="color:#ccc">No games found.</p>';
    return;
  }

  games.forEach((game) => {
    const card = document.createElement("div");
    card.classList.add("store-card"); // Pakai style card yang sama dengan swiper

    // Data Asli
    const genreName = game.genres.length > 0 ? game.genres[0].name : "Game";

    card.innerHTML = `
            <div class="card-image-wrap">
                <img src="${game.background_image}" alt="${
      game.name
    }" loading="lazy">
                <div class="btn-wishlist-overlay"><i class="bi bi-plus-lg"></i></div>
            </div>
            <div class="card-content">
                <span class="game-category">${genreName}</span>
                <h4 class="game-title">${game.name}</h4>
                <div class="game-meta-row">
                    <span class="badge-rating"><i class="bi bi-star-fill"></i> ${
                      game.rating
                    }</span>
                    <span class="meta-date">${game.released || "TBA"}</span>
                </div>
            </div>
        `;
    container.appendChild(card);
  });
}
