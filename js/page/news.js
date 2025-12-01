/* assets/js/pages/news.js - DEBUGGED VERSION */

async function initNewsPage() {
  console.log("📂 [News] Memulai loadNewsPage...");

  const heroContainer = document.getElementById("newsHero");
  const feedContainer = document.getElementById("newsFeed");

  // Cek apakah elemen ada di HTML
  if (!heroContainer || !feedContainer) {
    console.error("❌ [News] Container tidak ditemukan di HTML.");
    return;
  }

  // 1. SETUP TANGGAL (Ambil 6 Bulan Terakhir agar data pasti ada)
  const today = new Date();
  const past = new Date();
  past.setMonth(today.getMonth() - 6);

  const dateStr = `${past.toISOString().slice(0, 10)},${today
    .toISOString()
    .slice(0, 10)}`;
  console.log("📅 [News] Range Tanggal:", dateStr);

  try {
    // Cek API Key & Fetch Function
    if (typeof fetchData === "undefined") {
      throw new Error("Fungsi fetchData tidak ditemukan (Cek api.js)");
    }

    // 2. FETCH DATA
    // ordering=-released: Urut dari terbaru
    // page_size=15: Ambil 15 game
    const games = await fetchData(
      "games",
      `dates=${dateStr}&ordering=-released&page_size=15`
    );

    console.log("📦 [News] Data diterima:", games);

    // JIKA DATA KOSONG / ERROR API
    if (!games || games.length === 0) {
      console.warn("⚠️ [News] Data API kosong.");
      heroContainer.innerHTML = ""; // Hapus Skeleton
      feedContainer.innerHTML =
        "<p style='color:#ccc; text-align:center; padding:20px;'>No updates found. Please check API Key or Connection.</p>";
      return;
    }

    // --- BERHASIL DAPAT DATA ---

    // A. HAPUS SKELETON
    heroContainer.innerHTML = "";
    feedContainer.innerHTML = "";

    // B. PILIH HERO GAME (Rating > 3.0 agar bukan game sampah)
    let heroGame =
      games.find((g) => g.rating > 3.0 && g.background_image) || games[0];

    // Format Tanggal
    const heroDate = new Date(heroGame.released).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const platforms = heroGame.platforms
      ? heroGame.platforms
          .map((p) => p.platform.name)
          .slice(0, 3)
          .join(", ")
      : "PC";

    // Render Hero
    heroContainer.innerHTML = `
            <img src="${heroGame.background_image}" alt="Hero">
            <div class="news-hero-content">
                <span class="news-badge">JUST RELEASED</span>
                <h1>${heroGame.name} is Now Available</h1>
                <p>Play it now on ${platforms}. Experience the latest action with a rating of ⭐ ${heroGame.rating}/5. Released on ${heroDate}.</p>
            </div>
        `;
    heroContainer.onclick = () => window.openGameDetail(heroGame.id);

    // C. RENDER FEED GRID
    const feedGames = games.filter((g) => g.id !== heroGame.id);

    feedGames.forEach((game) => {
      const releaseDate = new Date(game.released).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const genre = game.genres.length > 0 ? game.genres[0].name : "Game";

      // Warna rating
      const scoreColor = game.rating >= 4 ? "#6dc849" : "#ccc";
      const scoreHtml = `<span style="color:${scoreColor}; font-weight:bold;">★ ${game.rating}</span>`;

      const bgImage =
        game.background_image ||
        "https://placehold.co/600x400/202020/white?text=No+Image";

      const card = document.createElement("div");
      card.className = "news-item";
      card.onclick = () => window.openGameDetail(game.id);

      card.innerHTML = `
                <img src="${bgImage}" class="news-thumb" loading="lazy">
                <div class="news-body">
                    <span class="news-date">RELEASED: ${releaseDate}</span>
                    <h3>${game.name}</h3>
                    <p>${genre} • ${scoreHtml}</p>
                    <span class="read-more">View Game Details</span>
                </div>
            `;
      feedContainer.appendChild(card);
    });
  } catch (e) {
    console.error("❌ [News] Error Fatal:", e);
    // Hapus Skeleton dan Tampilkan Pesan Error
    heroContainer.innerHTML = "";
    feedContainer.innerHTML = `<p style='color:red; text-align:center;'>Error loading content: ${e.message}</p>`;
  }
}

// Pasang fungsi ke window
window.loadNewsPage = initNewsPage;
