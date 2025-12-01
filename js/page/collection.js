/* assets/js/collection.js - FINAL VERSION (DECODING FIX) */

// ==================================================================
// 1. DATA MANAGEMENT (LOCAL STORAGE)
// ==================================================================

// --- A. CUSTOM COLLECTIONS (FOLDERS) ---
function getAllCollections() {
  const defaultData = [{ name: "Favorites", games: [] }];
  return (
    JSON.parse(localStorage.getItem("gameku_custom_collections")) || defaultData
  );
}

function saveAllCollections(data) {
  localStorage.setItem("gameku_custom_collections", JSON.stringify(data));
  updateCollectionUI();
}

function createNewCollection(name) {
  const collections = getAllCollections();
  if (collections.some((c) => c.name === name)) {
    alert("Collection name already exists!");
    return false;
  }
  collections.push({ name: name, games: [] });
  saveAllCollections(collections);
  return true;
}

function addGameToCollection(collectionName, game) {
  const collections = getAllCollections();
  const target = collections.find((c) => c.name === collectionName);
  if (target) {
    if (!target.games.some((g) => g.id === game.id)) {
      target.games.push(game); // Simpan object game utuh
      saveAllCollections(collections);
      showToast(`Saved to ${collectionName}`);
    }
  }
}

function removeGameFromCollection(collectionName, gameId) {
  const collections = getAllCollections();
  const target = collections.find((c) => c.name === collectionName);
  if (target) {
    target.games = target.games.filter((g) => g.id !== gameId);
    saveAllCollections(collections);
    // Refresh UI halaman library jika sedang aktif
    if (
      document.getElementById("view-collection") &&
      !document.getElementById("view-collection").classList.contains("hidden")
    ) {
      initCollectionPage();
    }
  }
}

function isGameInAnyCollection(gameId) {
  const collections = getAllCollections();
  return collections.some((c) => c.games.some((g) => g.id === gameId));
}

// --- B. WISHLIST ---
function getWishlistData() {
  return JSON.parse(localStorage.getItem("gameku_wishlist")) || [];
}

function addToWishlist(game) {
  let list = getWishlistData();
  if (!list.some((g) => g.id === game.id)) {
    list.push(game);
    localStorage.setItem("gameku_wishlist", JSON.stringify(list));
    updateCollectionUI();
    showToast("Added to Wishlist");
  }
}

function removeFromWishlist(gameId) {
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
}

function isGameInWishlist(id) {
  return getWishlistData().some((g) => g.id === id);
}

// ==================================================================
// 2. HANDLE QUICK ACTIONS (DECODING & EVENTS)
// ==================================================================

// Helper: Decode data dari HTML (Kebalikan dari utils.js)
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

// 1. Handle Tombol Wishlist (Hati)
window.handleQuickWishlist = function (
  event,
  id,
  encName,
  encImage,
  rating,
  released,
  encGenres
) {
  event.stopPropagation(); // Stop klik ke detail

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

// 2. Handle Tombol Collection (Bookmark / Modal)
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

  // Set global temp variable
  window.tempGameData = gameObj;

  renderCollectionListInModal();

  const modal = document.getElementById("collectionModal");
  if (modal) {
    modal.classList.remove("hidden");
    setTimeout(() => modal.classList.add("show"), 10);
  }
};

// --- MODAL HELPERS ---
window.closeCollectionModal = function () {
  const modal = document.getElementById("collectionModal");
  if (modal) {
    modal.classList.remove("show");
    setTimeout(() => modal.classList.add("hidden"), 300);
  }
};

function renderCollectionListInModal() {
  const container = document.getElementById("collectionList");
  const collections = getAllCollections();
  if (!container) return;
  container.innerHTML = "";

  collections.forEach((col) => {
    const isAdded = col.games.some((g) => g.id === window.tempGameData.id);
    const icon = isAdded
      ? '<i class="bi bi-check-circle-fill"></i>'
      : '<i class="bi bi-circle"></i>';
    const borderClass = isAdded ? "has-game" : "";

    const div = document.createElement("div");
    div.className = `collection-option ${borderClass}`;
    div.onclick = () => handleToggleCollection(col.name);

    div.innerHTML = `<span>${col.name} <small style="color:#777">(${col.games.length})</small></span>${icon}`;
    container.appendChild(div);
  });
}

function handleToggleCollection(collectionName) {
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
  if (name && createNewCollection(name)) {
    input.value = "";
    renderCollectionListInModal();
  }
};

// ==================================================================
// 3. RENDER PAGE LOGIC (MY LIBRARY TAB)
// ==================================================================
function initCollectionPage() {
  renderCollectionGrid();
  renderWishlistGrid();
  updateCollectionUI();
}

/* assets/js/collection.js - BAGIAN RENDER COLLECTION UPDATE */

function renderCollectionGrid() {
  const container = document.getElementById("collectionGrid");
  const emptyState = document.getElementById("empty-collection");
  if (!container) return;

  container.innerHTML = ""; // Bersihkan container utama

  // Hapus class 'game-grid' dari container utama karena kita akan bikin grid per folder
  container.classList.remove("game-grid");

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

  // LOOP SETIAP FOLDER
  collections.forEach((col) => {
    if (col.games.length > 0) {
      // 1. Buat Wrapper Folder
      const folderWrapper = document.createElement("div");
      folderWrapper.className = "collection-group";

      // 2. Buat Header Folder
      folderWrapper.innerHTML = `
                <div class="collection-group-header">
                    <h3>${col.name}</h3>
                    <span>${col.games.length}</span>
                </div>
            `;

      // 3. Buat Grid Khusus Folder ini
      const gridDiv = document.createElement("div");
      gridDiv.className = "game-grid"; // Grid system diterapkan disini

      // 4. Isi Grid dengan Kartu Game
      col.games.forEach((game) => {
        // Generate Kartu
        let cardHtml = createGameCard(game);

        // Tombol Delete
        const deleteBtn = `
                    <button class="btn-action-card" style="background:#202020; border:1px solid #333;" 
                            onclick="event.stopPropagation(); removeGameFromCollection('${col.name}', ${game.id})">
                        <i class="bi bi-trash" style="color:#ff4d4d;"></i>
                    </button>
                `;

        // Replace tombol
        cardHtml = cardHtml.replace(
          /<div class="card-actions-overlay">[\s\S]*?<\/div>/,
          `<div class="card-actions-overlay" style="top:10px; right:10px;">${deleteBtn}</div>`
        );

        gridDiv.innerHTML += cardHtml;
      });

      // Gabungkan
      folderWrapper.appendChild(gridDiv);
      container.appendChild(folderWrapper);
    }
  });
}

function renderWishlistGrid() {
  const container = document.getElementById("wishlistGrid");
  const emptyState = document.getElementById("empty-wishlist");
  if (!container) return;
  container.innerHTML = "";

  const wishlist = getWishlistData();

  if (wishlist.length === 0) {
    if (emptyState) emptyState.classList.remove("hidden");
    return;
  }
  if (emptyState) emptyState.classList.add("hidden");

  wishlist.forEach((game) => {
    let cardHtml = createGameCard(game);

    const deleteBtn = `
            <button class="btn-action-card" style="background:#202020; border:1px solid #333;" 
                    onclick="event.stopPropagation(); removeFromWishlist(${game.id})">
                <i class="bi bi-trash" style="color:#ff4d4d;"></i>
            </button>
        `;

    cardHtml = cardHtml.replace(
      /<div class="card-actions-overlay">[\s\S]*?<\/div>/,
      `<div class="card-actions-overlay">${deleteBtn}</div>`
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

// --- UTILS & TOAST ---
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
