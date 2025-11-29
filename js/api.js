// assets/js/api.js

const API_KEY = "de9e2ca2dec544d7b38e39b1a250d36e"; // Ganti dengan key aslimu
const BASE_URL = "https://api.rawg.io/api";

/**
 * Fungsi Generic untuk fetch data dari endpoint manapun
 * @param {string} endpoint - contoh: 'genres' atau 'platforms'
 * @param {string} params - parameter tambahan (opsional)
 */
async function fetchData(endpoint, params = "") {
  try {
    const response = await fetch(
      `${BASE_URL}/${endpoint}?key=${API_KEY}&${params}`
    );
    if (!response.ok) throw new Error("Gagal mengambil data");
    const data = await response.json();
    return data.results; // RAWG menyimpan list data di dalam properti 'results'
  } catch (error) {
    console.error("Error fetching data:", error);
    return []; // Kembalikan array kosong jika error agar web tidak crash
  }
}
