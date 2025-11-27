// fitur navbar
// Ambil elemen
const menuTrigger = document.getElementById("menuTrigger");
const megaMenu = document.getElementById("megaMenu");
const logoWrapper = document.querySelector(".logo-wrapper");

// Fungsi Toggle Menu
menuTrigger.addEventListener("click", (e) => {
  e.stopPropagation(); // Mencegah event bubbling
  megaMenu.classList.toggle("show"); // Munculkan menu
  menuTrigger.classList.toggle("active"); // Putar panah
});

// Tutup menu jika klik di luar area menu
document.addEventListener("click", (e) => {
  if (!logoWrapper.contains(e.target)) {
    megaMenu.classList.remove("show");
    menuTrigger.classList.remove("active");
  }
});
