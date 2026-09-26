(function () {
  "use strict";

  const STORAGE_KEY = "ict600.flashcards.v1";
  const data = window.ICT600_DATA;
  const flashData = window.ICT600_FLASHCARDS;
  const engine = window.ICT600_FLASHCARD_ENGINE;
  if (!data || !flashData || !engine) return;

  const elements = Object.fromEntries([
    "flashRemembered", "flashLearning", "flashTotal", "memoryLegend", "flashChapterGrid",
    "chapterProgressText", "flashCategoryFilters", "shuffleDeck", "reviewWeak", "flashStudy",
    "deckKicker", "deckTitle", "deckCounter", "deckProgress", "deckEmpty", "showAllCards",
    "flashCard", "cardCategory", "cardChapter", "cardFront", "cardBack", "cardPrompt",
    "cardAnswer", "cardExample", "cardSource", "previousCard", "flipCard", "nextCard", "ratingActions"
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
    weakOnly: Boolean(stored.session?.weakOnly),
    deck: [],
    index: 0,
    flipped: false
  };
  let isFlipping = false;
  let flipTimers = [];

  function clearFlipAnimation() {
    flipTimers.forEach((timer) => clearTimeout(timer));
    flipTimers = [];
    isFlipping = false;
    elements.flashCard.classList.remove("flip-out-forward", "flip-in-forward", "flip-out-backward", "flip-in-backward");
  }

  function save() {
    const session = {
      chapter: state.chapter,
      category: state.category,
      weakOnly: state.weakOnly,
      order: state.deck.map((card) => card.id),
      index: state.index
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ratings: state.ratings, session }));
    } catch {
      // The deck remains usable when browser storage is unavailable.
    }
  }

  function chapterName(id) {
    return data.chapters.find((chapter) => chapter.id === id)?.title || `Chapter ${id}`;
  }

  function selectionCards(options = {}) {
    return engine.filterCards(flashData.cards, {
      chapter: state.chapter,
      category: state.category,
      ratings: state.ratings,
      weakOnly: options.ignoreWeak ? false : state.weakOnly
    });
  }

  function rebuildDeck({ shuffle = false, restore = false } = {}) {
    clearFlipAnimation();
    let cards = selectionCards();
    if (shuffle) cards = engine.shuffle(cards);
    if (restore && stored.session && stored.session.chapter === state.chapter && stored.session.category === state.category && Boolean(stored.session.weakOnly) === state.weakOnly) {
      const restored = engine.restoreOrder(stored.session, cards);
      if (restored) {
        state.deck = restored.cards;
        state.index = restored.index;
        renderAll();
        return;
      }
    }
    state.deck = cards;
    state.index = 0;
    state.flipped = false;
    save();
    renderAll();
  }

  function renderLegend() {
    elements.memoryLegend.replaceChildren(...Object.entries(flashData.categories).map(([key, category]) => {
      const item = document.createElement("span");
      item.className = "memory-key-item";
      item.style.setProperty("--key-colour", category.colour);
      const symbol = document.createElement("b");
      symbol.setAttribute("aria-hidden", "true");
      symbol.textContent = category.symbol;
      item.append(symbol, document.createTextNode(category.label));
      item.dataset.category = key;
      return item;
    }));
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
        rebuildDeck();
        elements.flashStudy.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return button;
    }));
  }

  function renderCategoryFilters() {
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
        rebuildDeck();
      });
      return button;
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

  function renderCard() {
    const card = state.deck[state.index];
    const hasCards = Boolean(card);
    elements.deckEmpty.hidden = hasCards;
    elements.flashCard.hidden = !hasCards;
    elements.previousCard.hidden = !hasCards;
    elements.flipCard.hidden = !hasCards;
    elements.nextCard.hidden = !hasCards;
    elements.ratingActions.hidden = !hasCards || !state.flipped;
    elements.deckKicker.textContent = `Chapter ${state.chapter}`;
    elements.deckTitle.textContent = chapterName(state.chapter);
    elements.reviewWeak.setAttribute("aria-pressed", state.weakOnly ? "true" : "false");
    elements.reviewWeak.classList.toggle("active", state.weakOnly);
    elements.reviewWeak.textContent = state.weakOnly ? "Showing cards not remembered" : "Review cards not remembered";

    if (!hasCards) {
      elements.deckCounter.textContent = "Deck complete";
      elements.deckProgress.style.width = "100%";
      save();
      return;
    }

    const category = flashData.categories[card.category];
    const progress = ((state.index + 1) / state.deck.length) * 100;
    elements.deckCounter.textContent = `${state.index + 1} of ${state.deck.length}`;
    elements.deckProgress.style.width = `${progress}%`;
    elements.flashCard.style.setProperty("--card-accent", category.colour);
    elements.flashCard.dataset.category = card.category;
    elements.cardCategory.textContent = `${category.symbol} ${category.label}`;
    elements.cardChapter.textContent = `Chapter ${card.chapter}`;
    elements.cardPrompt.textContent = card.front;
    elements.cardAnswer.textContent = card.back;
    elements.cardExample.hidden = !card.example;
    elements.cardExample.querySelector("code").textContent = card.example || "";
    elements.cardSource.textContent = `Source: ${card.source}`;
    elements.cardFront.hidden = state.flipped;
    elements.cardBack.hidden = !state.flipped;
    elements.flipCard.setAttribute("aria-pressed", state.flipped ? "true" : "false");
    elements.flipCard.innerHTML = state.flipped ? "Hide answer <kbd>Space</kbd>" : "Reveal answer <kbd>Space</kbd>";
    elements.flashCard.setAttribute("aria-label", state.flipped ? "Flashcard answer is shown." : "Flashcard prompt. Press Space or use the button to reveal the answer.");

    const currentRating = state.ratings[card.id]?.status;
    elements.ratingActions.querySelectorAll("[data-rating]").forEach((button) => {
      button.classList.toggle("selected", button.dataset.rating === currentRating);
    });
    save();
  }

  function renderAll() {
    renderStats();
    renderChapters();
    renderCategoryFilters();
    renderCard();
  }

  function flip() {
    if (!state.deck.length || isFlipping) return;
    const nextFlipped = !state.flipped;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      state.flipped = nextFlipped;
      renderCard();
      return;
    }

    isFlipping = true;
    elements.flashCard.classList.add(nextFlipped ? "flip-out-forward" : "flip-out-backward");
    flipTimers.push(setTimeout(() => {
      elements.flashCard.classList.remove("flip-out-forward", "flip-out-backward");
      state.flipped = nextFlipped;
      renderCard();
      elements.flashCard.classList.add(nextFlipped ? "flip-in-forward" : "flip-in-backward");
    }, 180));
    flipTimers.push(setTimeout(() => clearFlipAnimation(), 400));
  }

  function move(offset) {
    if (!state.deck.length || isFlipping) return;
    state.index = (state.index + offset + state.deck.length) % state.deck.length;
    state.flipped = false;
    renderCard();
  }

  function rate(status) {
    const card = state.deck[state.index];
    if (!card || !state.flipped || isFlipping) return;
    state.ratings = engine.rateCard(state.ratings, card.id, status);
    if (state.weakOnly && status === "remembered") {
      state.deck.splice(state.index, 1);
      if (state.index >= state.deck.length) state.index = Math.max(0, state.deck.length - 1);
    } else if (state.deck.length) {
      state.index = (state.index + 1) % state.deck.length;
    }
    state.flipped = false;
    renderAll();
  }

  elements.flipCard.addEventListener("click", flip);
  elements.flashCard.addEventListener("click", flip);
  elements.previousCard.addEventListener("click", () => move(-1));
  elements.nextCard.addEventListener("click", () => move(1));
  elements.shuffleDeck.addEventListener("click", () => rebuildDeck({ shuffle: true }));
  elements.reviewWeak.addEventListener("click", () => {
    state.weakOnly = !state.weakOnly;
    rebuildDeck({ shuffle: state.weakOnly });
  });
  elements.showAllCards.addEventListener("click", () => {
    state.weakOnly = false;
    rebuildDeck();
  });
  elements.ratingActions.addEventListener("click", (event) => {
    const button = event.target.closest("[data-rating]");
    if (button) rate(button.dataset.rating);
  });

  document.addEventListener("keydown", (event) => {
    if (event.target.matches("input, textarea, select") || event.target.closest("button, a")) return;
    if (event.code === "Space" || event.key === "Enter") {
      event.preventDefault();
      flip();
    } else if (event.key === "ArrowLeft") move(-1);
    else if (event.key === "ArrowRight") move(1);
    else if (event.key === "1") rate("again");
    else if (event.key === "2") rate("learning");
    else if (event.key === "3") rate("remembered");
  });

  renderLegend();
  rebuildDeck({ restore: true });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
  }
})();
