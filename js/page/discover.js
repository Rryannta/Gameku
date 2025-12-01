/* assets/js/pages/home.js - FINAL FIXED VERSION */

// --- GLOBAL VARIABLES ---
let heroGames = [];
let currentHeroIndex = 0;
let heroInterval;

// ==========================================================
// 1. HERO CAROUSEL (SLIDER BESAR)
// ==========================================================

// --- [FIX] FUNGSI YANG HILANG (Tambahkan ini) ---
function updateHeroButtonState(gameId) {
  const btnWish = document.getElementById("btnHeroWishlist");
  if (!btnWish) return;

  // Cek apakah fungsi wishlist tersedia (dari collection.js)
  if (typeof isGameInWishlist === "function" && isGameInWishlist(gameId)) {
    btnWish.innerHTML = `<i class="bi bi-check-lg"></i> In Wishlist`;
    btnWish.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
    btnWish.style.borderColor = "#fff";
  } else {
    btnWish.innerHTML = `<i class="bi bi-plus-circle"></i> Add to Wishlist`;
    btnWish.style.backgroundColor = "transparent";
    btnWish.style.borderColor = "rgba(255, 255, 255, 0.3)";
  }
}
// -------------------------------------------------

async function initHeroSlider() {
  const currentYear = new Date().getFullYear();
  heroGames = await fetchData(
    "games",
    `dates=${currentYear}-01-01,${currentYear}-12-31&ordering=-added&page_size=6`
  );

  if (heroGames && heroGames.length > 0) {
    renderHeroSidebar();
    updateHeroStage(0);
    startHeroTimer();
  }
}

function renderHeroSidebar() {
  const listContainer = document.getElementById("heroList");
  if (!listContainer) return;
  listContainer.innerHTML = "";

  heroGames.forEach((game, index) => {
    const li = document.createElement("li");
    li.classList.add("hero-item");
    li.onclick = () => {
      updateHeroStage(index);
      startHeroTimer();
    };
    li.innerHTML = `<img src="${game.background_image}" alt="thumb"><span>${game.name}</span>`;
    listContainer.appendChild(li);
  });
}

function updateHeroStage(index) {
  currentHeroIndex = index;
  const game = heroGames[index];

  const bg = document.getElementById("heroBg");
  if (bg) {
    bg.style.backgroundImage = `url('${game.background_image}')`;
    bg.onclick = null; // Hapus klik background
  }

  const title = document.getElementById("heroTitle");
  if (title) title.innerText = game.name;

  const desc = document.getElementById("heroDesc");
  if (desc)
    desc.innerText = `Released: ${game.released} • Rating: ${game.rating}/5`;

  // --- UPDATE TOMBOL ---
  const btnLearn = document.getElementById("btnHeroLearnMore");
  if (btnLearn) {
    btnLearn.onclick = (e) => {
      e.stopPropagation();
      window.openGameDetail(game.id);
    };
  }

  const btnWish = document.getElementById("btnHeroWishlist");
  if (btnWish) {
    // Update status awal tombol saat slide berubah
    updateHeroButtonState(game.id);

    btnWish.onclick = (e) => {
      e.stopPropagation();
      const genresStr = (game.genres || []).map((g) => g.name).join(",");

      if (typeof window.toggleQuickWishlist === "function") {
        window.toggleQuickWishlist(
          e,
          game.id,
          game.name,
          game.background_image,
          game.rating,
          game.released,
          genresStr
        );
        // Update tampilan setelah diklik
        updateHeroButtonState(game.id);
      } else {
        console.error(
          "Fungsi toggleQuickWishlist tidak ditemukan (Cek collection.js)"
        );
      }
    };
  }

  document.querySelectorAll(".hero-item").forEach((item, idx) => {
    if (idx === index) item.classList.add("active");
    else item.classList.remove("active");
  });
}

function startHeroTimer() {
  clearInterval(heroInterval);
  heroInterval = setInterval(() => {
    let nextIndex = currentHeroIndex + 1;
    if (nextIndex >= heroGames.length) nextIndex = 0;
    updateHeroStage(nextIndex);
  }, 5000);
}

// ==========================================================
// 2. HELPER: GENERIC SWIPER BUILDER
// ==========================================================
async function setupGameSwiper(config) {
  const swiperWrapper = document.getElementById(config.containerId);
  if (!swiperWrapper) return;

  const gamesRaw = await fetchData("games", config.apiParams);
  const games = gamesRaw.slice(0, 12);

  swiperWrapper.innerHTML = "";

  games.forEach((game) => {
    const slide = document.createElement("div");
    slide.classList.add("swiper-slide");
    // Gunakan fungsi global createGameCard
    if (typeof createGameCard === "function") {
      slide.innerHTML = createGameCard(game);
    }
    swiperWrapper.appendChild(slide);
  });

  if (typeof Swiper !== "undefined") {
    new Swiper(config.swiperClass, {
      slidesPerView: 2,
      spaceBetween: 15,
      navigation: { nextEl: config.btnNext, prevEl: config.btnPrev },
      breakpoints: {
        640: { slidesPerView: 3, spaceBetween: 20 },
        1024: { slidesPerView: 5, spaceBetween: 24 },
      },
    });
  }
}

// --- INIT SLIDERS ---
async function initSomethingNew() {
  const today = new Date().toISOString().slice(0, 10);
  const past = new Date();
  past.setMonth(past.getMonth() - 3);
  const datePast = past.toISOString().slice(0, 10);

  await setupGameSwiper({
    apiParams: `dates=${datePast},${today}&ordering=-added&page_size=15`,
    containerId: "swiperWrapper",
    swiperClass: ".myGameSwiper",
    btnNext: ".nav-btn-next",
    btnPrev: ".nav-btn-prev",
  });
}

async function initTopNewReleases() {
  const today = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(today.getMonth() - 1);

  const dateEnd = today.toISOString().slice(0, 10);
  const dateStart = lastMonth.toISOString().slice(0, 10);

  await setupGameSwiper({
    apiParams: `dates=${dateStart},${dateEnd}&ordering=-released&page_size=15`,
    containerId: "newReleasesWrapper",
    swiperClass: ".myNewReleasesSwiper",
    btnNext: ".nav-btn-next-nr",
    btnPrev: ".nav-btn-prev-nr",
  });
}

async function initTrending() {
  const currentYear = new Date().getFullYear();
  await setupGameSwiper({
    apiParams: `dates=${currentYear}-01-01,${currentYear}-12-31&ordering=-rating&page_size=15`,
    containerId: "trendingWrapper",
    swiperClass: ".swiperTrending",
    btnNext: ".nav-btn-next-trend",
    btnPrev: ".nav-btn-prev-trend",
  });
}

async function initMostPopular() {
  await setupGameSwiper({
    apiParams: `ordering=-added&page_size=15`,
    containerId: "popularWrapper",
    swiperClass: ".swiperPopular",
    btnNext: ".nav-btn-next-pop",
    btnPrev: ".nav-btn-prev-pop",
  });
}

// ==========================================================
// 3. NEWS / RELEASE RADAR
// ==========================================================
async function initNewsSection() {
  const container = document.getElementById("newsContainer");
  if (!container) return;

  try {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 2);
    const dateStr = `${lastMonth.toISOString().slice(0, 10)},${today
      .toISOString()
      .slice(0, 10)}`;

    const games = await fetchData(
      "games",
      `dates=${dateStr}&ordering=-released&page_size=15`
    );

    if (!games || games.length === 0) throw new Error("Data API kosong");

    container.innerHTML = "";
    const heroGame =
      games.find((g) => g.rating > 3.0 && g.background_image) || games[0];
    const feedGames = games.filter((g) => g.id !== heroGame.id).slice(0, 3);

    feedGames.forEach((game) => {
      const bgImage = game.background_image || "https://placehold.co/600x400";
      const card = document.createElement("div");
      card.className = "news-card";
      card.onclick = () => window.openGameDetail(game.id);

      card.innerHTML = `
                <div class="news-image"><img src="${bgImage}" alt="${game.name}" loading="lazy"></div>
                <div class="news-content">
                    <span class="news-tag">${game.name} • NEW</span>
                    <h4>${game.name} is Here!</h4>
                    <p>Experience the new adventure everyone is talking about.</p>
                    <button class="btn-news">Read More</button>
                </div>
            `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Gagal load News:", error);
  }
}

// ==========================================================
// 4. SPOTLIGHT / FREE GAMES
// ==========================================================
async function initFreeGames() {
  const container = document.getElementById("freeGamesContainer");
  if (!container) return;

  try {
    const freeRaw = await fetchData(
      "games",
      "tags=free-to-play&ordering=-added&page_size=10"
    );
    const freeData = freeRaw.slice(0, 1);

    const nextYear = new Date().getFullYear() + 1;
    const upcomingRaw = await fetchData(
      "games",
      `dates=${nextYear}-01-01,${nextYear}-12-31&ordering=-added&page_size=10`
    );
    const upcomingData = upcomingRaw.slice(0, 2);

    const mixedGames = [...freeData, ...upcomingData];
    container.innerHTML = "";

    mixedGames.forEach((game, index) => {
      const isF2P = freeData.some((f) => f.id === game.id);
      const statusText = isF2P ? "Play For Free" : "Upcoming";
      const statusClass = isF2P ? "blue" : "black";
      const subText = isF2P
        ? "Available Now"
        : `Release: ${game.released || "TBA"}`;
      const bgImage =
        game.background_image ||
        "https://placehold.co/600x340/202020/white?text=No+Image";

      // Data untuk onclick
      const safeName = game.name.replace(/'/g, "\\'");
      const genresStr = (game.genres || []).map((g) => g.name).join(",");

      // Cek status wishlist
      const inWishlist =
        typeof isGameInWishlist === "function"
          ? isGameInWishlist(game.id)
          : false;
      const btnIconClass = inWishlist ? "bi bi-check-lg" : "bi bi-plus-lg";
      const btnStyle = inWishlist
        ? "background-color: #fff; color: #000; opacity: 1;"
        : "";

      const card = document.createElement("div");
      card.className = "free-card";
      card.onclick = () => window.openGameDetail(game.id);

      card.innerHTML = `
                <div class="free-image-wrap">
                    <img src="${bgImage}" alt="${game.name}" loading="lazy">
                    <div class="status-bar ${statusClass}">${statusText}</div>
                    <div class="btn-wishlist-overlay" 
                         style="${btnStyle}"
                         onclick="window.toggleQuickWishlist(event, '${game.id}', '${safeName}', '${bgImage}', '${game.rating}', '${game.released}', '${genresStr}')">
                        <i class="${btnIconClass}"></i>
                    </div>
                </div>
                <div class="free-info">
                    <h4>${game.name}</h4>
                    <p>${subText}</p>
                </div>
            `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Gagal load Spotlight:", error);
  }
}

// ==========================================================
// 5. HOYOVERSE SPECIAL
// ==========================================================
async function initHoyoverseSection() {
  const container = document.getElementById("hoyoContainer");
  if (!container) return;
  const targetTitles = [
    "Genshin Impact",
    "Honkai: Star Rail",
    "Zenless Zone Zero",
  ];

  try {
    const promises = targetTitles.map((title) =>
      fetchData("games", `search=${title}&page_size=1`)
    );
    const results = await Promise.all(promises);
    const games = results
      .map((res) => res[0])
      .filter((game) => game !== undefined);

    container.innerHTML = "";
    games.forEach((game) => {
      const bgImage = game.background_image || "https://placehold.co/600x400";
      const card = document.createElement("div");
      card.className = "hoyo-card";
      card.onclick = () => window.openGameDetail(game.id);
      card.innerHTML = `
                <div class="hoyo-image"><img src="${bgImage}" alt="${game.name}" loading="lazy"></div>
                <div class="hoyo-content">
                    <h4>${game.name}</h4>
                    <p>An epic anime adventure awaits.</p>
                    <button class="btn-hoyo">Play For Free</button>
                </div>
            `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Gagal load Hoyoverse:", error);
  }
}

// ==========================================================
// 6. TRIPLE LIST
// ==========================================================
function renderSmallList(containerId, games, type) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  if (!games || games.length === 0) return;

  games.forEach((game) => {
    const badge =
      type === "upcoming"
        ? `<span class="item-badge">Pre-Order</span>`
        : `<span class="item-badge">Base Game</span>`;
    const subText =
      type === "upcoming"
        ? game.released || "Coming Soon"
        : `Rating: ⭐ ${game.rating}`;
    const img = game.background_image || "https://placehold.co/60x80";

    const div = document.createElement("div");
    div.className = "list-game-item";
    div.onclick = () => window.openGameDetail(game.id);

    div.innerHTML = `
            <img src="${img}" alt="${game.name}" loading="lazy">
            <div class="item-info">
                <h4>${game.name}</h4>
                <div style="display:flex; flex-direction:column; gap:4px;">
                    ${badge}
                    <span class="item-sub">${subText}</span>
                </div>
            </div>
        `;
    container.appendChild(div);
  });
}

async function initTripleList() {
  try {
    const currentYear = new Date().getFullYear();
    const [topSellers, mostPlayed, upcoming] = await Promise.all([
      fetchData(
        "games",
        `dates=${currentYear}-01-01,${currentYear}-12-31&ordering=-added&page_size=15`
      ),
      fetchData("games", `ordering=-metacritic&page_size=15`),
      fetchData(
        "games",
        `dates=${currentYear + 1}-01-01,${
          currentYear + 1
        }-12-31&ordering=-added&page_size=15`
      ),
    ]);

    renderSmallList("listTopSellers", topSellers.slice(0, 5), "general");
    renderSmallList("listMostPlayed", mostPlayed.slice(0, 5), "general");
    renderSmallList("listUpcoming", upcoming.slice(0, 5), "upcoming");
  } catch (error) {
    console.error("Gagal load Triple List:", error);
  }
}

// ==========================================================
// 7. MAIN INIT FUNCTION
// ==========================================================
window.loadHomePage = function () {
  console.log("🏠 Load Home Page...");

  if (typeof initHeroSlider === "function") initHeroSlider();

  initSomethingNew();
  initTopNewReleases();
  initTrending();
  initMostPopular();

  if (typeof initNewsSection === "function") initNewsSection();
  if (typeof initFreeGames === "function") initFreeGames();
  if (typeof initHoyoverseSection === "function") initHoyoverseSection();
  if (typeof initTripleList === "function") initTripleList();
};

document.addEventListener("DOMContentLoaded", () => {
  loadHomePage();
});
