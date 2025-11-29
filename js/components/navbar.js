// Render List Menu (Platform/Genre/Publisher)
function renderMenuList(elementId, data, limit, useImage = false) {
  const list = document.getElementById(elementId);
  if (!list) return;

  list.innerHTML = "";
  data.slice(0, limit).forEach((item) => {
    let visualElement = "";

    if (useImage) {
      // Logic Gambar (Publisher)
      const imageUrl = item.image_background
        ? item.image_background
        : "https://placehold.co/50";
      visualElement = `<img src="${imageUrl}" class="menu-img-icon" alt="${item.name}">`;
    } else {
      // Logic Icon (Platform/Genre)
      const icon = getIconClass(item.name);
      visualElement = `<i class="bi ${icon}"></i>`;
    }

    const li = document.createElement("li");
    // Saat diklik, arahkan ke Browse dan filter
    li.innerHTML = `<a href="#" onclick="routerToBrowse('${item.slug}', '${item.name}')">${visualElement} ${item.name}</a>`;
    list.appendChild(li);
  });
}

async function initNavbar() {
  if (typeof fetchData === "undefined") return;

  // Load Data
  const genres = await fetchData("genres", "ordering=-games_count");
  renderMenuList("genreList", genres, 3, false);

  const platforms = await fetchData("platforms/lists/parents");
  renderMenuList("platformList", platforms, 3, false);

  const publishers = await fetchData("publishers", "ordering=-games_count");
  renderMenuList("publisherList", publishers, 9, true); // True = Pakai Gambar

  // Interaction Logic (Click/Hover)
  const logoWrapper = document.querySelector(".logo");
  const megaMenu = document.querySelector(".mega-menu");

  if (logoWrapper && megaMenu) {
    logoWrapper.addEventListener("click", (e) => {
      e.stopPropagation();
      logoWrapper.classList.toggle("active");
    });
    megaMenu.addEventListener("click", (e) => e.stopPropagation());
    document.addEventListener("click", () =>
      logoWrapper.classList.remove("active")
    );
  }
}

// Helper Global untuk pindah ke browse dari menu
window.routerToBrowse = function (slug, name) {
  // Pindah Tab
  if (typeof switchPage === "function") switchPage("view-browse");
  // Filter Game
  if (typeof filterByGenre === "function") filterByGenre(slug, name);
};

document.addEventListener("DOMContentLoaded", initNavbar);
