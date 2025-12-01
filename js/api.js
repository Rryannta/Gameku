const apiKey = "de9e2ca2dec544d7b38e39b1a250d36e"; // <--- JANGAN LUPA GANTI API KEY
const baseUrl = "https://api.rawg.io/api";

// --- KONFIGURASI FILTER KONTEN ---
const blockedKeywords = [
  "hentai",
  "sexual",
  "sex",
  "nude",
  "nudity",
  "porn",
  "adult",
  "erotic",
  "nsfw",
  "18+",
];
const blockedEsrb = ["adults-only"]; // Rating AO (18+)

// Fungsi Pengecekan Keamanan Game
function isSafeGame(game) {
  // 1. Cek ESRB Rating (Jika ada data ratingnya)
  if (game.esrb_rating && blockedEsrb.includes(game.esrb_rating.slug)) {
    return false; // Buang game rating AO
  }

  // 2. Cek Judul Game (Lowercase agar tidak case-sensitive)
  const nameLower = game.name.toLowerCase();
  if (blockedKeywords.some((word) => nameLower.includes(word))) {
    return false; // Buang game dengan kata terlarang di judul
  }

  // 3. Cek Tags (Jika ada data tags)
  if (game.tags && Array.isArray(game.tags)) {
    const tagSlugs = game.tags.map((t) => t.slug);
    // Cek apakah ada tag terlarang
    if (
      tagSlugs.includes("hentai") ||
      tagSlugs.includes("sexual-content") ||
      tagSlugs.includes("nudity")
    ) {
      return false;
    }
  }

  return true; // Game Aman
}

async function fetchData(endpoint, params = "") {
  try {
    // Tambahkan filter 'exclude_additions' agar DLC tidak memenuhi list
    // Tambahkan 'exclude_parents' agar tidak duplikat
    const url = `${baseUrl}/${endpoint}?key=${apiKey}&${params}&exclude_additions=true`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // --- FILTERING MANUAL (CLIENT SIDE) ---
    if (data.results && Array.isArray(data.results)) {
      // Kita filter array results menggunakan fungsi isSafeGame
      // Hanya game yang return TRUE yang akan lolos
      const cleanGames = data.results.filter((game) => isSafeGame(game));
      return cleanGames;
    }

    return data.results || data; // Fallback jika respon bukan array standar
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}
