/* assets/js/collection.js - WITH STATUS TRACKER */

// ==================================================================
// 1. DATA MANAGEMENT
// ==================================================================

window.getAllCollections = function () {
  const defaultData = [{ name: "Favorites", games: [] }];
  return (
    JSON.parse(localStorage.getItem("gameku_custom_collections")) || defaultData
  );
};

window.saveAllCollections = function (data) {
  localStorage.setItem("gameku_custom_collections", JSON.stringify(data));
  updateCollectionUI();
};

window.createNewCollection = function (name) {
  const collections = getAllCollections();
  if (collections.some((c) => c.name === name)) {
    alert("Collection name already exists!");
    return false;
  }
  collections.push({ name: name, games: [] });
  saveAllCollections(collections);
  return true;
};

window.addGameToCollection = function (collectionName, game) {
  const collections = getAllCollections();
  const target = collections.find((c) => c.name === collectionName);
  if (target) {
    if (!target.games.some((g) => g.id === game.id)) {
      // TAMBAHAN: Simpan Status Default 'Backlog'
      target.games.push({
        ...game, // Copy semua data game
        status: "backlog", // Default status
        addedAt: new Date().toLocaleDateString(),
      });
      saveAllCollections(collections);
      showToast(`Saved to ${collectionName}`);
    }
  }
};

// --- FITUR BARU: UPDATE STATUS ---
window.changeGameStatus = function (collectionName, gameId, newStatus) {
  const collections = getAllCollections();
  const targetCol = collections.find((c) => c.name === collectionName);

  if (targetCol) {
    const game = targetCol.games.find((g) => g.id === gameId);
    if (game) {
      game.status = newStatus;
      saveAllCollections(collections);
      // Optional: Re-render untuk update warna border dropdown
      renderCollectionGrid();
    }
  }
};
// ----------------------------------

window.removeGameFromCollection = function (collectionName, gameId) {
  const collections = getAllCollections();
  const target = collections.find((c) => c.name === collectionName);
  if (target) {
    target.games = target.games.filter((g) => g.id !== gameId);
    saveAllCollections(collections);

    if (
      document.getElementById("view-collection") &&
      !document.getElementById("view-collection").classList.contains("hidden")
    ) {
      initCollectionPage();
    }
  }
};

window.isGameInAnyCollection = function (gameId) {
  const collections = getAllCollections();
  return collections.some((c) => c.games.some((g) => g.id === gameId));
};

// --- WISHLIST ---
window.getWishlistData = function () {
  return JSON.parse(localStorage.getItem("gameku_wishlist")) || [];
};

window.addToWishlist = function (game) {
  let list = getWishlistData();
  if (!list.some((g) => g.id === game.id)) {
    list.push(game);
    localStorage.setItem("gameku_wishlist", JSON.stringify(list));
    updateCollectionUI();
    showToast("Added to Wishlist");
  }
};

window.removeFromWishlist = function (gameId) {
  let list = getWishlistData();
  list = list.filter((g) => g.id !== gameId);
  localStorage.setItem("gameku_wishlist", JSON.stringify(list));
  updateCollectionUI();

  if (
    document.getElementById("view-collection") &&
    !document.getElementById("view-collection").classList.contains("hidden")
  ) {
    initCollectionPage();
  }
};

window.isGameInWishlist = function (id) {
  return getWishlistData().some((g) => g.id === id);
};

// ==================================================================
// 2. HANDLERS & MODAL
// ==================================================================
// ... (Bagian Modal Logic Tidak Berubah, tetap sama seperti sebelumnya) ...

// Helper Decode
function decodeGameData(id, encName, encImage, rating, encReleased, encGenres) {
  return {
    id: parseInt(id),
    name: decodeURIComponent(encName),
    background_image: decodeURIComponent(encImage),
    rating: parseFloat(rating),
    released: decodeURIComponent(encReleased),
    genres: JSON.parse(decodeURIComponent(encGenres)),
  };
}

window.handleQuickWishlist = function (
  event,
  id,
  encName,
  encImage,
  rating,
  released,
  encGenres
) {
  event.stopPropagation();
  const gameObj = decodeGameData(
    id,
    encName,
    encImage,
    rating,
    released,
    encGenres
  );
  const btn = event.currentTarget;
  const icon = btn.querySelector("i");

  if (isGameInWishlist(gameObj.id)) {
    removeFromWishlist(gameObj.id);
    if (icon) {
      icon.className = "bi bi-heart";
      icon.style.color = "white";
    }
  } else {
    addToWishlist(gameObj);
    if (icon) {
      icon.className = "bi bi-heart-fill";
      icon.style.color = "#ff4d4d";
    }
  }
};

window.handleOpenCollectionModal = function (
  event,
  id,
  encName,
  encImage,
  rating,
  released,
  encGenres
) {
  event.stopPropagation();
  const gameObj = decodeGameData(
    id,
    encName,
    encImage,
    rating,
    released,
    encGenres
  );
  window.tempGameData = gameObj;
  renderCollectionListInModal();
  const modal = document.getElementById("collectionModal");
  if (modal) {
    modal.classList.remove("hidden");
    setTimeout(() => modal.classList.add("show"), 10);
  }
};

window.closeCollectionModal = function () {
  const modal = document.getElementById("collectionModal");
  if (modal) {
    modal.classList.remove("show");
    setTimeout(() => modal.classList.add("hidden"), 300);
    window.tempGameData = null;
  }
};

function renderCollectionListInModal() {
  const container = document.getElementById("collectionList");
  if (!container) return;
  const collections = getAllCollections();
  container.innerHTML = "";
  if (!window.tempGameData) return;

  collections.forEach((col) => {
    const isAdded = col.games.some((g) => g.id === window.tempGameData.id);
    const icon = isAdded
      ? '<i class="bi bi-check-circle-fill" style="color:#0074e4"></i>'
      : '<i class="bi bi-circle" style="color:#555"></i>';
    const borderClass = isAdded ? "has-game" : "";

    const div = document.createElement("div");
    div.className = `collection-option ${borderClass}`;
    div.onclick = () => handleToggleCollection(col.name);
    div.innerHTML = `<span>${col.name} <small style="color:#777">(${col.games.length})</small></span>${icon}`;
    container.appendChild(div);
  });
}

function handleToggleCollection(collectionName) {
  if (!window.tempGameData) return;
  const collections = getAllCollections();
  const target = collections.find((c) => c.name === collectionName);
  if (target.games.some((g) => g.id === window.tempGameData.id)) {
    removeGameFromCollection(collectionName, window.tempGameData.id);
  } else {
    addGameToCollection(collectionName, window.tempGameData);
  }
  renderCollectionListInModal();
  updateCollectionUI();
}

window.handleCreateCollection = function () {
  const input = document.getElementById("newCollectionInput");
  const name = input.value.trim();
  if (name) {
    if (createNewCollection(name)) {
      input.value = "";
      renderCollectionListInModal();
    }
  }
};

// ==================================================================
// 3. RENDER PAGE LOGIC (MY LIBRARY TAB) - UPDATE DISINI
// ==================================================================
function initCollectionPage() {
  renderCollectionGrid();
  renderWishlistGrid();
  updateCollectionUI();
}

function renderCollectionGrid() {
  const container = document.getElementById("collectionGrid");
  const emptyState = document.getElementById("empty-collection");
  if (!container) return;
  container.innerHTML = "";

  container.classList.remove("game-grid");
  container.style.display = "block";

  const collections = getAllCollections();
  const totalGames = collections.reduce(
    (acc, curr) => acc + curr.games.length,
    0
  );

  if (totalGames === 0) {
    if (emptyState) emptyState.classList.remove("hidden");
    return;
  }
  if (emptyState) emptyState.classList.add("hidden");

  collections.forEach((col) => {
    if (col.games.length > 0) {
      // Wrapper Folder
      const folder = document.createElement("div");
      folder.className = "collection-group";
      folder.style.marginBottom = "40px";

      // Header Folder
      folder.innerHTML = `
                <div class="collection-group-header" style="display:flex; align-items:center; gap:10px; margin-bottom:15px; border-bottom:1px solid #333; padding-bottom:10px;">
                    <h3 style="color:#fff; font-size:20px; margin:0;">${col.name}</h3>
                    <span style="background:#333; color:#ccc; padding:2px 8px; border-radius:4px; font-size:12px;">${col.games.length}</span>
                </div>
            `;

      const grid = document.createElement("div");
      grid.className = "game-grid";

      col.games.forEach((game) => {
        // 1. Generate Kartu Biasa
        let cardHtml = createGameCard(game);

        // 2. Siapkan Status Dropdown
        const currentStatus = game.status || "backlog"; // Default backlog

        // Helper untuk set selected
        const sel = (val) => (val === currentStatus ? "selected" : "");

        const statusDropdown = `
                    <div class="card-status-bar">
                        <select class="status-select ${currentStatus}" 
                                onclick="event.stopPropagation()" 
                                onchange="changeGameStatus('${col.name}', ${
          game.id
        }, this.value)">
                            <option value="backlog" ${sel(
                              "backlog"
                            )}>Backlog</option>
                            <option value="playing" ${sel(
                              "playing"
                            )}>Playing</option>
                            <option value="completed" ${sel(
                              "completed"
                            )}>Completed</option>
                            <option value="dropped" ${sel(
                              "dropped"
                            )}>Dropped</option>
                        </select>
                    </div>
                `;

        // 3. Siapkan Tombol Delete
        const deleteBtn = `
                    <div class="btn-wishlist-overlay" style="background:#202020; border:1px solid #333; opacity:1; transform:none; top:10px; right:10px;" 
                         onclick="event.stopPropagation(); removeGameFromCollection('${col.name}', ${game.id})">
                        <i class="bi bi-trash" style="color:red;"></i>
                    </div>
                `;

        // 4. INJECT KE DALAM HTML KARTU
        // Ganti tombol overlay
        cardHtml = cardHtml.replace(
          /<div class="card-actions-overlay">[\s\S]*?<\/div>/,
          deleteBtn
        );

        // Masukkan Dropdown sebelum tutup div card-content
        cardHtml = cardHtml.replace(
          "</div>\n        </div>",
          `${statusDropdown}</div></div>`
        );

        grid.innerHTML += cardHtml;
      });

      folder.appendChild(grid);
      container.appendChild(folder);
    }
  });
}

function renderWishlistGrid() {
  const container = document.getElementById("wishlistGrid");
  const emptyState = document.getElementById("empty-wishlist");
  if (!container) return;
  container.innerHTML = "";
  container.classList.add("game-grid");

  const wishlist = getWishlistData();
  if (wishlist.length === 0) {
    if (emptyState) emptyState.classList.remove("hidden");
    container.classList.remove("game-grid");
    return;
  }
  if (emptyState) emptyState.classList.add("hidden");

  wishlist.forEach((game) => {
    let cardHtml = createGameCard(game);
    const deleteBtn = `
            <div class="btn-wishlist-overlay" style="background:#202020; border:1px solid #333; opacity:1; transform:none; top:10px; right:10px;" 
                 onclick="event.stopPropagation(); removeFromWishlist(${game.id})">
                <i class="bi bi-trash" style="color:#ff4d4d;"></i>
            </div>
        `;
    cardHtml = cardHtml.replace(
      /<div class="card-actions-overlay">[\s\S]*?<\/div>/,
      deleteBtn
    );
    container.innerHTML += cardHtml;
  });
}

function updateCollectionUI() {
  const collections = getAllCollections();
  let totalCol = 0;
  collections.forEach((c) => (totalCol += c.games.length));
  const wishlist = getWishlistData();

  const colEl = document.getElementById("count-collection");
  const wishEl = document.getElementById("count-wishlist");
  const navBadge = document.getElementById("wishlistCount");

  if (colEl) colEl.innerText = `(${totalCol})`;
  if (wishEl) wishEl.innerText = `(${wishlist.length})`;
  if (navBadge) {
    navBadge.innerText = wishlist.length;
    navBadge.style.display = wishlist.length > 0 ? "flex" : "none";
  }
}

window.switchCollectionTab = function (tabName, btnElement) {
  document
    .querySelectorAll(".comm-tabs .comm-tab")
    .forEach((b) => b.classList.remove("active"));
  btnElement.classList.add("active");
  document.getElementById("tab-content-collection").classList.add("hidden");
  document.getElementById("tab-content-wishlist").classList.add("hidden");
  document.getElementById(`tab-content-${tabName}`).classList.remove("hidden");
};

function showToast(msg) {
  let toast = document.getElementById("toast-notification");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-notification";
    document.body.appendChild(toast);
  }
  toast.innerText = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

window.loadCollectionPage = initCollectionPage;
