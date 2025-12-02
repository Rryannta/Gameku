/* assets/js/components/navbar.js - FINAL VERSION */

function renderMenuList(elementId, data, limit, useImage = false) {
  const list = document.getElementById(elementId);
  if (!list) return;

  list.innerHTML = "";
  data.slice(0, limit).forEach((item) => {
    let visualElement = "";

    if (useImage) {
      const imageUrl = item.image_background
        ? item.image_background
        : "https://placehold.co/50";
      visualElement = `<img src="${imageUrl}" class="menu-img-icon" alt="${item.name}">`;
    } else {
      const icon = getIconClass(item.name);
      visualElement = `<i class="bi ${icon}"></i>`;
    }

    const li = document.createElement("li");

    // --- UPDATE LOGIC CLICK ---
    // Tentukan tipe filter berdasarkan ID Element parentnya
    let type = "Genre";
    if (elementId === "platformList") type = "Platform";
    if (elementId === "publisherList") type = "Publisher";

    // Panggil fungsi filter global di browse.js
    // item.slug adalah ID text yang aman
    li.innerHTML = `<a href="#" onclick="filterFromMegaMenu('${type}', '${item.slug}', '${item.name}')">${visualElement} ${item.name}</a>`;

    list.appendChild(li);
  });
}

async function initNavbar() {
  if (typeof fetchData === "undefined") return;

  const genres = await fetchData("genres", "ordering=-games_count");
  renderMenuList("genreList", genres, 3, false);

  const platforms = await fetchData("platforms/lists/parents");
  renderMenuList("platformList", platforms, 3, false);

  const publishers = await fetchData("publishers", "ordering=-games_count");
  renderMenuList("publisherList", publishers, 9, true);

  // Interaction Logic
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

document.addEventListener("DOMContentLoaded", initNavbar);
