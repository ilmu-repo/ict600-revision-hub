(function () {
  "use strict";

  const STORAGE_KEY = "ict600.flashcards.v1";
  const data = window.ICT600_DATA;
  const flashData = window.ICT600_FLASHCARDS;
  const engine = window.ICT600_FLASHCARD_ENGINE;
  if (!data || !flashData || !engine) return;

  const elements = Object.fromEntries([
    "flashRemembered", "flashLearning", "flashTotal", "memoryLegend", "flashChapterGrid",
    "chapterProgressText", "flashCategoryFilters", "shuffleDeck", "reviewWeak", "launchChapter",
    "launchSummary", "startFocusedStudy"
  ].map((id) => [id, document.getElementById(id)]));

  function readStoredState() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return {
        ratings: stored.ratings && typeof stored.ratings === "object" ? stored.ratings : {},
        session: stored.session && typeof stored.session === "object" ? stored.session : null
      };
    } catch {
      return { ratings: {}, session: null };
    }
  }

  const stored = readStoredState();
  const hashChapter = Number(new URLSearchParams(location.hash.slice(1)).get("chapter"));
  const initialChapter = data.chapters.some((chapter) => chapter.id === hashChapter)
    ? hashChapter
    : Number(stored.session?.chapter || 1);
  const validCategories = new Set(["all", ...Object.keys(flashData.categories)]);
  const state = {
    ratings: stored.ratings,
    chapter: data.chapters.some((chapter) => chapter.id === initialChapter) ? initialChapter : 1,
    category: validCategories.has(stored.session?.category) ? stored.session.category : "all",
    weakOnly: false,
    shuffle: false
  };

  function chapterName(id) {
    return data.chapters.find((chapter) => chapter.id === id)?.title || `Chapter ${id}`;
  }

  function renderLegend() {
    elements.memoryLegend.replaceChildren(...Object.entries(flashData.categories).map(([key, category]) => {
      const item = document.createElement("span");
      item.className = "memory-key-item";
      item.style.setProperty("--key-colour", category.colour);
      item.dataset.category = key;
      const symbol = document.createElement("b");
      symbol.setAttribute("aria-hidden", "true");
      symbol.textContent = category.symbol;
      item.append(symbol, document.createTextNode(category.label));
      return item;
    }));
  }

  function renderStats() {
    const overall = engine.getStats(flashData.cards, state.ratings);
    const chapterCards = flashData.cards.filter((card) => card.chapter === state.chapter);
    const chapterStats = engine.getStats(chapterCards, state.ratings);
    elements.flashRemembered.textContent = overall.remembered;
    elements.flashLearning.textContent = overall.learning + overall.again;
    elements.flashTotal.textContent = overall.total;
    elements.chapterProgressText.textContent = `${chapterStats.remembered} of ${chapterStats.total} remembered in Chapter ${state.chapter}.`;
  }

  function renderChapters() {
    elements.flashChapterGrid.replaceChildren(...data.chapters.map((chapter) => {
      const chapterCards = flashData.cards.filter((card) => card.chapter === chapter.id);
      const stats = engine.getStats(chapterCards, state.ratings);
      const percent = stats.total ? Math.round((stats.remembered / stats.total) * 100) : 0;
      const button = document.createElement("button");
      button.type = "button";
      button.className = `flash-chapter-button${chapter.id === state.chapter ? " selected" : ""}`;
      button.setAttribute("role", "radio");
      button.setAttribute("aria-checked", chapter.id === state.chapter ? "true" : "false");
      button.innerHTML = `<span class="chapter-number">${chapter.id}</span><span><strong>${chapter.title}</strong><small>${stats.remembered}/${stats.total} remembered</small></span><span class="chapter-memory">${percent}%</span>`;
      button.addEventListener("click", () => {
        state.chapter = chapter.id;
        state.category = "all";
        state.weakOnly = false;
        history.replaceState(null, "", `#chapter=${chapter.id}`);
        render();
      });
      return button;
    }));
  }

  function renderFilters() {
    const chapterCards = flashData.cards.filter((card) => card.chapter === state.chapter);
    const options = [["all", { label: "All cards", symbol: "∞", colour: "#e2e8f0" }], ...Object.entries(flashData.categories)];
    elements.flashCategoryFilters.replaceChildren(...options.map(([key, category]) => {
      const count = key === "all" ? chapterCards.length : chapterCards.filter((card) => card.category === key).length;
      const button = document.createElement("button");
      button.type = "button";
      button.className = `filter-chip${state.category === key ? " selected" : ""}`;
      button.style.setProperty("--chip-colour", category.colour);
      button.setAttribute("role", "radio");
      button.setAttribute("aria-checked", state.category === key ? "true" : "false");
      button.disabled = count === 0;
      const symbol = document.createElement("b");
      symbol.setAttribute("aria-hidden", "true");
      symbol.textContent = category.symbol;
      const label = document.createElement("span");
      label.textContent = category.label;
      const total = document.createElement("small");
      total.textContent = count;
      button.append(symbol, label, total);
      button.addEventListener("click", () => {
        state.category = key;
        render();
      });
      return button;
    }));
  }

  function renderLaunch() {
    const selected = engine.filterCards(flashData.cards, {
      chapter: state.chapter,
      category: state.category,
      ratings: state.ratings,
      weakOnly: state.weakOnly
    });
    const params = new URLSearchParams({ chapter: state.chapter, category: state.category });
    if (state.weakOnly) params.set("weak", "1");
    if (state.shuffle) params.set("shuffle", "1");
    elements.launchChapter.textContent = `Chapter ${state.chapter}: ${chapterName(state.chapter)}`;
    elements.launchSummary.textContent = selected.length
      ? `${selected.length} selected card${selected.length === 1 ? "" : "s"} will open on a separate study screen. Progress is saved on this device.`
      : "Every matching card is already remembered. Turn off the review filter to study the full deck.";
    elements.startFocusedStudy.href = `flashcard-study.html?${params}`;
    elements.startFocusedStudy.classList.toggle("disabled", selected.length === 0);
    elements.startFocusedStudy.setAttribute("aria-disabled", selected.length === 0 ? "true" : "false");
    elements.startFocusedStudy.tabIndex = selected.length === 0 ? -1 : 0;
    elements.shuffleDeck.setAttribute("aria-pressed", state.shuffle ? "true" : "false");
    elements.shuffleDeck.classList.toggle("active", state.shuffle);
    elements.shuffleDeck.textContent = state.shuffle ? "Shuffle enabled" : "Shuffle on start";
    elements.reviewWeak.setAttribute("aria-pressed", state.weakOnly ? "true" : "false");
    elements.reviewWeak.classList.toggle("active", state.weakOnly);
    elements.reviewWeak.textContent = state.weakOnly ? "Showing cards not remembered" : "Review cards not remembered";
  }

  function render() {
    renderStats();
    renderChapters();
    renderFilters();
    renderLaunch();
  }

  elements.shuffleDeck.addEventListener("click", () => {
    state.shuffle = !state.shuffle;
    renderLaunch();
  });
  elements.reviewWeak.addEventListener("click", () => {
    state.weakOnly = !state.weakOnly;
    renderLaunch();
  });
  elements.startFocusedStudy.addEventListener("click", (event) => {
    if (elements.startFocusedStudy.getAttribute("aria-disabled") === "true") event.preventDefault();
  });

  renderLegend();
  render();
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
  }
})();
