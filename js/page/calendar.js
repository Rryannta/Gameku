/* assets/js/pages/calendar.js - FINAL COMPLETE VERSION */

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

let currentCalendarYear = new Date().getFullYear();

// =================================================
// 1. INIT PAGE
// =================================================
async function initCalendarPage() {
  console.log("📂 [Calendar] Memuat Halaman Kalender...");

  const yearEl = document.getElementById("calendarYear");
  if (yearEl) yearEl.innerText = currentCalendarYear;

  renderMonthButtons();

  const currentMonthIndex = new Date().getMonth();
  const btns = document.querySelectorAll(".btn-month");
  if (btns[currentMonthIndex]) btns[currentMonthIndex].classList.add("active");

  loadMonthData(currentMonthIndex);
}

// =================================================
// 2. RENDER MONTH BUTTONS
// =================================================
function renderMonthButtons() {
  const container = document.querySelector(".month-navigator");
  if (!container) return;

  container.innerHTML = "";

  monthNames.forEach((name, index) => {
    const btn = document.createElement("button");
    btn.className = "btn-month";
    btn.innerText = name;

    btn.onclick = () => {
      document
        .querySelectorAll(".btn-month")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      loadMonthData(index);
    };

    container.appendChild(btn);
  });
}

// =================================================
// 3. LOAD DATA PER MONTH (Auto Wishlist Integrated)
// =================================================
async function loadMonthData(monthIndex) {
  const container = document.getElementById("calendarGrid");
  const title = document.getElementById("activeMonthTitle");
  if (!container) return;

  if (title)
    title.innerText = `Releases in ${monthNames[monthIndex]} ${currentCalendarYear}`;
  container.innerHTML =
    '<p style="color:#777; grid-column:1/-1; text-align:center; padding:60px;">Loading releases...</p>';

  // Date Logic
  const monthStr = String(monthIndex + 1).padStart(2, "0");
  const firstDay = `${currentCalendarYear}-${monthStr}-01`;
  const lastDayObj = new Date(currentCalendarYear, monthIndex + 1, 0);
  const lastDay = `${currentCalendarYear}-${monthStr}-${lastDayObj.getDate()}`;
  const dateQuery = `${firstDay},${lastDay}`;

  try {
    if (typeof fetchData === "undefined") throw new Error("fetchData missing");

    // Fetch 30 items for filtering
    const rawGames = await fetchData(
      "games",
      `dates=${dateQuery}&ordering=released&page_size=30`
    );
    const games = rawGames.filter(
      (game) => game.background_image !== null && game.released !== null
    );

    if (!games || games.length === 0) {
      container.innerHTML =
        "<p style='color:#ccc; grid-column:1/-1; text-align:center; padding:40px;'>No releases found for this month.</p>";
      return;
    }

    container.innerHTML = "";

    games.slice(0, 20).forEach((game) => {
      // 1. Generate Kartu pakai fungsi utils.js
      let cardHtml = createGameCard(game);

      // 2. Inject Badge Tanggal Khusus Calendar
      const dateObj = new Date(game.released);
      const dateDisplay = dateObj.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      });

      const badgeHtml = `<div class="calendar-date-badge">${dateDisplay}</div>`;
      cardHtml = cardHtml.replace(
        '<div class="btn-wishlist-overlay"',
        `${badgeHtml}<div class="btn-wishlist-overlay"`
      );

      container.innerHTML += cardHtml;
    });
  } catch (error) {
    console.error("❌ [Calendar] Error:", error);
    container.innerHTML =
      "<p style='color:red; text-align:center;'>Error loading data.</p>";
  }
}

// Expose
window.loadCalendarPage = initCalendarPage;
