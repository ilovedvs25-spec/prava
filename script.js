(() => {
  const root = document.documentElement;

  // years
  const y1 = document.getElementById("year");
  const y2 = document.getElementById("year2");
  const year = new Date().getFullYear();
  if (y1) y1.textContent = year;
  if (y2) y2.textContent = year;

  // theme
  const saved = localStorage.getItem("theme");
  if (saved === "light") root.setAttribute("data-theme", "light");

  const themeToggle = document.getElementById("themeToggle");
  const setThemeIcon = () => {
    const isLight = root.getAttribute("data-theme") === "light";
    if (themeToggle) themeToggle.textContent = isLight ? "☀️" : "🌙";
  };
  setThemeIcon();

  themeToggle?.addEventListener("click", () => {
    const isLight = root.getAttribute("data-theme") === "light";
    if (isLight) {
      root.removeAttribute("data-theme");
      localStorage.setItem("theme", "dark");
      toast("Тёмная тема 🌙");
    } else {
      root.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
      toast("Светлая тема ☀️");
    }
    setThemeIcon();
  });

  // drawer
  const drawer = document.getElementById("drawer");
  const openDrawer = () => {
    if (!drawer) return;
    drawer.style.display = "block";
    drawer.setAttribute("aria-hidden", "false");
  };
  const closeDrawer = () => {
    if (!drawer) return;
    drawer.style.display = "none";
    drawer.setAttribute("aria-hidden", "true");
  };
  document.getElementById("burger")?.addEventListener("click", openDrawer);
  document.getElementById("drawerClose")?.addEventListener("click", closeDrawer);
  drawer?.addEventListener("click", (e) => { if (e.target === drawer) closeDrawer(); });

  // tab routing
  const pages = Array.from(document.querySelectorAll(".page"));
  const topLinks = Array.from(document.querySelectorAll(".nav__link"));
  const drawerLinks = Array.from(document.querySelectorAll(".drawer__link"));
  const bottomLinks = Array.from(document.querySelectorAll(".bottomnav__item"));
  const allTabButtons = [
    ...topLinks,
    ...drawerLinks,
    ...bottomLinks,
    ...Array.from(document.querySelectorAll("[data-tab]"))
  ];

  function setActiveTab(tab) {
    pages.forEach(p => p.classList.toggle("is-active", p.dataset.page === tab));
    topLinks.forEach(b => b.classList.toggle("is-active", b.dataset.tab === tab));
    drawerLinks.forEach(b => b.classList.toggle("is-active", b.dataset.tab === tab));
    bottomLinks.forEach(b => b.classList.toggle("is-active", b.dataset.tab === tab));

    history.replaceState(null, "", `#${tab}`);
    closeDrawer();

    // ensure top of visible page
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  allTabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const t = btn.getAttribute("data-tab");
      if (t) setActiveTab(t);
    });
  });

  // brand to home + keyboard
  const brand = document.querySelector(".brand");
  brand?.addEventListener("click", () => setActiveTab("home"));
  brand?.addEventListener("keydown", (e) => { if (e.key === "Enter") setActiveTab("home"); });

  // consult -> contacts
  document.getElementById("consultBtn")?.addEventListener("click", () => setActiveTab("contacts"));

  // init from hash
  const init = (location.hash || "").replace("#", "");
  const allowed = new Set(pages.map(p => p.dataset.page));
  setActiveTab(allowed.has(init) ? init : "home");

  // FAQ toggles
  document.querySelectorAll(".faq__item").forEach((item) => {
    const q = item.querySelector(".faq__q");
    const a = item.querySelector(".faq__a");
    const i = item.querySelector(".faq__i");
    if (!q || !a) return;

    q.addEventListener("click", () => {
      const isHidden = a.hidden;
      a.hidden = !isHidden;
      if (i) i.textContent = isHidden ? "—" : "+";
    });
  });

  // pseudo notification inside site
  setTimeout(() => toast("Менеджер: Здравствуйте! Нужна консультация? Напишите город и категорию 😊"), 2200);

  // lightbox
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");

  function openLightbox(src){
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
  }
  function closeLightbox(){
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    if (lightboxImg) lightboxImg.src = "";
  }

  document.querySelectorAll("[data-full]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const src = btn.getAttribute("data-full");
      if (src) openLightbox(src);
    });
  });

  lightboxClose?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });

  // toast
  const toastEl = document.getElementById("toast");
  let t = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.style.display = "block";
    clearTimeout(t);
    t = setTimeout(() => { toastEl.style.display = "none"; }, 3600);
  }
})();
