/* private/script.js
   Полностью исправленная логика:
   - Мультивыбор категорий: A, B, C, D, CE, DE
   - Цены по кол-ву категорий: 1=55000, 2=68000, 3+=76000, срочно +12000
   - Медсправка: 7500 / срочно 9500 (варианты 003-В/у + доп. справки)
   - Экзамены: теория 12000, практика 33000, оба 42000, срочно +5000
   - Сроки: обычно 7–14, срочно 4–7 (текст везде)
   - Заполняет скрытые поля формы: calc_summary, calc_price
   - Кнопка смены темы (#themeToggle): сохраняет в localStorage
   - Опционально: кнопка "Скопировать итог" (если добавишь элемент #copySummary)
*/

(() => {
  // ==== НАСТРОЙКА: впиши свой TG ник без @ ====
  const TG_USERNAME = "USERNAME"; // например: "autosouz"

  // ==== DOM ====
  const city = document.getElementById("city");
  const service = document.getElementById("service");
  const speed = document.getElementById("speed");

  const dlBox = document.getElementById("dlBox");
  const medBox = document.getElementById("medBox");
  const examBox = document.getElementById("examBox");

  const priceOut = document.getElementById("priceOut");
  const priceHint = document.getElementById("priceHint");

  const calcSummary = document.getElementById("calcSummary");
  const calcPrice = document.getElementById("calcPrice");

  const themeToggle = document.getElementById("themeToggle"); // кнопка 🌙/☀️
  const copyBtn = document.getElementById("copySummary");     // если добавишь такую кнопку

  // TG кнопки
  const tgLinks = [
    document.getElementById("tgDirect"),
    document.getElementById("tgDirectTop"),
  ].filter(Boolean);

  tgLinks.forEach((a) => (a.href = `https://t.me/${TG_USERNAME}`));

  // ==== HELPERS ====
  const DUR_NORMAL = "Обычно (7–14 дней)";
  const DUR_URGENT = "Срочно (4–7 дней)";

  function rub(n) {
    return `${n.toLocaleString("ru-RU")} ₽`;
  }

  function show(el, yes) {
    if (!el) return;
    el.hidden = !yes;
  }

  function getDlCats() {
    return [...document.querySelectorAll('input[name="dlCats"]:checked')].map(
      (x) => x.value
    );
  }

  function getMedType() {
    const el = document.querySelector('input[name="medType"]:checked');
    return el ? el.value : "003";
  }

  function getExamType() {
    const el = document.querySelector('input[name="examType"]:checked');
    return el ? el.value : "both";
  }

  function setOutputs({ priceText, hintText, summaryText }) {
    if (priceOut) priceOut.textContent = priceText ?? "—";
    if (priceHint) priceHint.textContent = hintText ?? "";
    if (calcSummary) calcSummary.value = summaryText ?? "";
    if (calcPrice) calcPrice.value = priceText ?? "";
  }

  // ==== THEME TOGGLE ====
  function applyTheme(theme) {
    // theme: "dark" | "light"
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    if (themeToggle) themeToggle.textContent = theme === "dark" ? "🌙" : "☀️";
  }

  function initTheme() {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") applyTheme(saved);
    else applyTheme("dark"); // дефолт
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme") || "dark";
      applyTheme(cur === "dark" ? "light" : "dark");
    });
  }
  initTheme();

  // ==== CALC CORE ====
  function calc() {
    const cityVal = (city?.value || "").trim();
    const srv = service?.value || "";
    const spd = speed?.value || "normal";
    const dur = spd === "urgent" ? DUR_URGENT : DUR_NORMAL;

    // показываем нужные блоки
    show(dlBox, srv === "dl");
    show(medBox, srv === "med");
    show(examBox, srv === "exam");

    // если услуга не выбрана
    if (!srv) {
      setOutputs({
        priceText: "—",
        hintText: "Выберите услугу — калькулятор покажет ориентировочную стоимость.",
        summaryText: "",
      });
      return;
    }

    const summaryParts = [];
    summaryParts.push(`Город: ${cityVal || "не указан"}`);
    summaryParts.push(`Срок: ${dur}`);

    let total = null;

    // === ВУ ===
    if (srv === "dl") {
      const cats = getDlCats();
      summaryParts.push("Услуга: Водительское удостоверение");
      summaryParts.push(`Категории: ${cats.length ? cats.join(", ") : "не выбраны"}`);

      if (cats.length === 0) {
        setOutputs({
          priceText: "—",
          hintText: "Выберите минимум одну категорию для расчёта.",
          summaryText: summaryParts.join(" | "),
        });
        return;
      }

      if (cats.length === 1) total = 55000;
      else if (cats.length === 2) total = 68000;
      else total = 76000;

      if (spd === "urgent") total += 12000;
    }

    // === Медсправка ===
    if (srv === "med") {
      const mt = getMedType();
      const mtName =
        mt === "003" ? "003-В/у" : mt === "narko" ? "Справка от нарколога" : "Справка от психиатра";

      summaryParts.push("Услуга: Медицинские документы");
      summaryParts.push(`Вариант: ${mtName}`);

      total = spd === "urgent" ? 9500 : 7500;
    }

    // === Экзамены ===
    if (srv === "exam") {
      const et = getExamType();
      const etName =
        et === "theory" ? "Теория" : et === "practice" ? "Практика" : "Теория + практика";

      summaryParts.push("Услуга: Экзамены");
      summaryParts.push(`Опция: ${etName}`);

      if (et === "theory") total = 12000;
      if (et === "practice") total = 33000;
      if (et === "both") total = 42000;

      if (spd === "urgent") total += 5000;
    }

    // === Обучение ===
    if (srv === "train") {
      summaryParts.push("Услуга: Обучение / автошкола (консультация)");
      total = null; // по запросу
    }

    // Итог
    if (total == null) {
      const priceText = "По запросу";
      const summaryText = summaryParts.join(" | ") + ` | Цена: ${priceText}`;
      setOutputs({
        priceText,
        hintText: "Стоимость уточнит менеджер после подтверждения вводных.",
        summaryText,
      });
      return;
    }

    const priceText = rub(total);
    const summaryText = summaryParts.join(" | ") + ` | Цена: ${priceText}`;

    setOutputs({
      priceText,
      hintText: "Ориентировочная стоимость. Итог подтверждается менеджером после уточнения деталей.",
      summaryText,
    });
  }

  // ==== COPY SUMMARY (опционально) ====
  async function copySummary() {
    const text = (calcSummary?.value || "").trim();
    if (!text) {
      alert("Сначала заполните калькулятор 🙂");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      alert("Готово! Итог скопирован — вставьте в Telegram.");
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      alert("Готово! Итог скопирован — вставьте в Telegram.");
    }
  }

  if (copyBtn) copyBtn.addEventListener("click", copySummary);

  // ==== EVENTS ====
  // input/change для пересчёта
  ["input", "change"].forEach((evt) => {
    city?.addEventListener(evt, calc);
    service?.addEventListener(evt, calc);
    speed?.addEventListener(evt, calc);
  });

  // чекбоксы категорий (ВУ)
  document.addEventListener("change", (e) => {
    if (e?.target?.name === "dlCats") calc();
    if (e?.target?.name === "medType") calc();
    if (e?.target?.name === "examType") calc();
  });

  // init
  calc();
})();
