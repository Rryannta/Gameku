let heroGames = [];
let currentHeroIndex = 0;
let heroInterval;

// --- A. HERO CAROUSEL ---
async function initHeroSlider() {
  const currentYear = new Date().getFullYear();
  heroGames = await fetchData(
    "games",
    `dates=${currentYear}-01-01,${currentYear}-12-31&ordering=-added&page_size=6`
  );

  if (heroGames.length > 0) {
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

  // Update Gambar & Teks
  const bg = document.getElementById("heroBg");
  if (bg) bg.style.backgroundImage = `url('${game.background_image}')`;

  const title = document.getElementById("heroTitle");
  if (title) title.innerText = game.name;

  const desc = document.getElementById("heroDesc");
  if (desc)
    desc.innerText = `Released: ${game.released} • Rating: ${game.rating}/5`;

  // Update Sidebar Active Class
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

// --- B. GAME SWIPER (REAL DATA) ---
async function initGameSwiper() {
  // Ambil game 3 bulan terakhir
  const currentDate = new Date().toISOString().slice(0, 10);
  const prevDate = new Date();
  prevDate.setMonth(prevDate.getMonth() - 3);
  const dateString = prevDate.toISOString().slice(0, 10);

  const games = await fetchData(
    "games",
    `dates=${dateString},${currentDate}&ordering=-added&page_size=12`
  );
  const swiperWrapper = document.getElementById("swiperWrapper");

  if (!swiperWrapper) return;
  swiperWrapper.innerHTML = "";

  games.forEach((game) => {
    const slide = document.createElement("div");
    slide.classList.add("swiper-slide");

    // Data Asli
    const genreName = game.genres.length > 0 ? game.genres[0].name : "Game";

    slide.innerHTML = `
            <div class="store-card">
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
            </div>
        `;
    swiperWrapper.appendChild(slide);
  });

  // Init Swiper Library
  new Swiper(".myGameSwiper", {
    slidesPerView: 2,
    spaceBetween: 15,
    navigation: { nextEl: ".nav-btn-next", prevEl: ".nav-btn-prev" },
    breakpoints: {
      640: { slidesPerView: 3, spaceBetween: 20 },
      1024: { slidesPerView: 5, spaceBetween: 24 },
    },
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initHeroSlider();
  initGameSwiper();
});
