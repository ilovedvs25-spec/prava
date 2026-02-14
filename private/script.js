(() => {
  // ==== НАСТРОЙКА: TG ник без @ ====
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

  const themeToggle = document.getElementById("themeToggle");
  const copyBtn = document.getElementById("copySummary");

  const form = document.getElementById("leadForm");

  // TG links
  const tgLinks = [document.getElementById("tgDirect"), document.getElementById("tgDirectTop")].filter(Boolean);
  tgLinks.forEach(a => a.href = `https://t.me/${TG_USERNAME}`);

  // durations
  const DUR_NORMAL = "Обычно (7–14 дней)";
  const DUR_URGENT = "Срочно (4–7 дней)";

  function rub(n){ return `${n.toLocaleString("ru-RU")} ₽`; }
  function show(el, yes){ if(el) el.hidden = !yes; }

  function getDlCats(){
    return [...document.querySelectorAll('input[name="dlCats"]:checked')].map(x => x.value);
  }
  function getMedType(){
    const el = document.querySelector('input[name="medType"]:checked');
    return el ? el.value : "003";
  }
  function getExamType(){
    const el = document.querySelector('input[name="examType"]:checked');
    return el ? el.value : "both";
  }

  // ==== THEME ====
  function applyTheme(theme){
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    if (themeToggle) themeToggle.textContent = theme === "dark" ? "🌙" : "☀️";
  }
  function initTheme(){
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") applyTheme(saved);
    else applyTheme("dark");
  }
  if (themeToggle){
    themeToggle.addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme") || "dark";
      applyTheme(cur === "dark" ? "light" : "dark");
    });
  }
  initTheme();

  // ==== CALC ====
  function calc(){
    const cityVal = (city?.value || "").trim();
    const srv = service?.value || "";
    const spd = speed?.value || "normal";
    const dur = spd === "urgent" ? DUR_URGENT : DUR_NORMAL;

    // show blocks
    show(dlBox, srv === "dl");
    show(medBox, srv === "med");
    show(examBox, srv === "exam");

    if (!srv){
      priceOut.textContent = "—";
      priceHint.textContent = "Выберите услугу и параметры — калькулятор покажет стоимость.";
      calcSummary.value = "";
      calcPrice.value = "";
      return;
    }

    let total = null;
    const summaryParts = [];
    summaryParts.push(`Город: ${cityVal || "не указан"}`);
    summaryParts.push(`Срок: ${dur}`);

    // DL
    if (srv === "dl"){
      const cats = getDlCats();
      summaryParts.push("Услуга: Водительское удостоверение");
      summaryParts.push(`Категории: ${cats.length ? cats.join(", ") : "не выбраны"}`);

      if (cats.length === 0){
        priceOut.textContent = "—";
        priceHint.textContent = "Выберите минимум одну категорию для расчёта.";
        calcSummary.value = summaryParts.join(" | ");
        calcPrice.value = "";
        return;
      }

      if (cats.length === 1) total = 55000;
      else if (cats.length === 2) total = 68000;
      else total = 76000;

      if (spd === "urgent") total += 12000;
    }

    // MED
    if (srv === "med"){
      const mt = getMedType();
      const mtName = mt === "003" ? "003-В/у" : (mt === "narko" ? "Нарколог (доп.)" : "Психиатр (доп.)");
      summaryParts.push("Услуга: Медицинская справка");
      summaryParts.push(`Вариант: ${mtName}`);
      total = (spd === "urgent") ? 9500 : 7500;
    }

    // EXAM
    if (srv === "exam"){
      const et = getExamType();
      const etName = et === "theory" ? "Теория" : (et === "practice" ? "Практика" : "Теория + практика");
      summaryParts.push("Услуга: Экзамены");
      summaryParts.push(`Опция: ${etName}`);

      if (et === "theory") total = 12000;
      if (et === "practice") total = 33000;
      if (et === "both") total = 42000;

      if (spd === "urgent") total += 5000;
    }

    // TRAIN
    if (srv === "train"){
      summaryParts.push("Услуга: Обучение / автошкола (консультация)");
      total = null; // по запросу
    }

    // output
    if (total == null){
      priceOut.textContent = "По запросу";
      priceHint.textContent = "Стоимость уточнит менеджер после подтверждения вводных.";
      const summary = summaryParts.join(" | ") + " | Цена: По запросу";
      calcSummary.value = summary;
      calcPrice.value = "По запросу";
      return;
    }

    const priceText = rub(total);
    priceOut.textContent = priceText;
    priceHint.textContent = "Ориентировочная стоимость. Итог подтверждается менеджером после уточнения деталей.";
    const summary = summaryParts.join(" | ") + ` | Цена: ${priceText}`;
    calcSummary.value = summary;
    calcPrice.value = priceText;
  }

  // calc triggers
  ["input","change"].forEach(evt => {
    city?.addEventListener(evt, calc);
    service?.addEventListener(evt, calc);
    speed?.addEventListener(evt, calc);
  });
  document.addEventListener("change", (e) => {
    if (e?.target?.name === "dlCats") calc();
    if (e?.target?.name === "medType") calc();
    if (e?.target?.name === "examType") calc();
  });

  // copy summary button
  async function copySummary(){
    const text = (calcSummary?.value || "").trim();
    if (!text) { alert("Сначала заполните калькулятор 🙂"); return; }
    try {
      await navigator.clipboard.writeText(text);
      alert("Готово! Итог скопирован — вставьте в Telegram.");
    } catch {
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

  // ===== Надёжная отправка в Netlify Forms + редирект =====
  // Работает на Netlify. Локально может вести себя иначе — это нормально.
  function encode(data){
    return Object.keys(data)
      .map(k => encodeURIComponent(k) + "=" + encodeURIComponent(data[k]))
      .join("&");
  }

  if (form){
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // собрать всё (включая hidden calc_summary / calc_price и dlCats)
      const fd = new FormData(form);
      const data = {};

      for (const [key, value] of fd.entries()){
        // если поле повторяется (dlCats), склеим
        if (data[key]) data[key] = `${data[key]}, ${value}`;
        else data[key] = value;
      }

      try{
        const res = await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: encode(data),
        });

        if (res.ok){
          window.location.href = "/thanks.html";
        } else {
          alert("Не удалось отправить заявку. Попробуйте ещё раз или напишите в Telegram.");
        }
      } catch {
        alert("Ошибка соединения при отправке. Попробуйте ещё раз или напишите в Telegram.");
      }
    });
  }

  // init
  calc();
})();
