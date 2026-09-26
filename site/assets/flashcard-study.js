(function () {
  "use strict";

  const STORAGE_KEY = "ict600.flashcards.v1";
  const data = window.ICT600_DATA;
  const flashData = window.ICT600_FLASHCARDS;
  const engine = window.ICT600_FLASHCARD_ENGINE;
  if (!data || !flashData || !engine) return;

  const elements = Object.fromEntries([
    "exitFocus", "focusChapter", "focusMemoryStatus", "reshuffleDeck", "deckKicker", "deckTitle",
    "deckCounter", "deckProgress", "deckEmpty", "showAllCards", "flashCard", "cardCategory",
    "cardChapter", "cardFront", "cardBack", "cardPrompt", "cardAnswer", "cardExample", "cardSource",
    "previousCard", "flipCard", "nextCard", "ratingActions"
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

  const params = new URLSearchParams(location.search);
  const stored = readStoredState();
  const requestedChapter = Number(params.get("chapter"));
  const chapter = data.chapters.some((item) => item.id === requestedChapter) ? requestedChapter : 1;
  const validCategories = new Set(["all", ...Object.keys(flashData.categories)]);
  const category = validCategories.has(params.get("category")) ? params.get("category") : "all";
  const shuffleOnStart = params.get("shuffle") === "1";
  const state = {
    ratings: stored.ratings,
    chapter,
    category,
    weakOnly: params.get("weak") === "1",
    deck: [],
    index: 0,
    flipped: false
  };
  let isFlipping = false;
  let flipTimers = [];

  function chapterName() {
    return data.chapters.find((item) => item.id === state.chapter)?.title || `Chapter ${state.chapter}`;
  }

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
      // The focused deck remains usable when browser storage is unavailable.
    }
  }

  function selectedCards() {
    return engine.filterCards(flashData.cards, {
      chapter: state.chapter,
      category: state.category,
      ratings: state.ratings,
      weakOnly: state.weakOnly
    });
  }

  function syncUrl() {
    const next = new URLSearchParams({ chapter: state.chapter, category: state.category });
    if (state.weakOnly) next.set("weak", "1");
    history.replaceState(null, "", `?${next}`);
    elements.exitFocus.href = `flashcards.html#chapter=${state.chapter}`;
  }

  function buildDeck({ shuffle = false, restore = false } = {}) {
    clearFlipAnimation();
    let cards = selectedCards();
    if (shuffle) cards = engine.shuffle(cards);
    if (restore && stored.session && stored.session.chapter === state.chapter && stored.session.category === state.category && Boolean(stored.session.weakOnly) === state.weakOnly) {
      const restored = engine.restoreOrder(stored.session, cards);
      if (restored) {
        state.deck = restored.cards;
        state.index = restored.index;
        state.flipped = false;
        syncUrl();
        render();
        return;
      }
    }
    state.deck = cards;
    state.index = 0;
    state.flipped = false;
    syncUrl();
    render();
  }

  function renderHeader() {
    const chapterCards = flashData.cards.filter((card) => card.chapter === state.chapter);
    const stats = engine.getStats(chapterCards, state.ratings);
    elements.focusChapter.textContent = `Chapter ${state.chapter} · ${chapterName()}`;
    elements.focusMemoryStatus.textContent = `${stats.remembered}/${stats.total} remembered`;
    elements.deckTitle.textContent = chapterName();
    const categoryLabel = state.category === "all" ? "All memory lanes" : flashData.categories[state.category].label;
    elements.deckKicker.textContent = state.weakOnly ? `${categoryLabel} · Not remembered` : categoryLabel;
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

    if (!hasCards) {
      elements.deckCounter.textContent = "Deck complete";
      elements.deckProgress.style.width = "100%";
      save();
      return;
    }

    const categoryInfo = flashData.categories[card.category];
    elements.deckCounter.textContent = `${state.index + 1} of ${state.deck.length}`;
    elements.deckProgress.style.width = `${((state.index + 1) / state.deck.length) * 100}%`;
    elements.flashCard.style.setProperty("--card-accent", categoryInfo.colour);
    elements.cardCategory.textContent = `${categoryInfo.symbol} ${categoryInfo.label}`;
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

  function render() {
    renderHeader();
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
    render();
  }

  elements.flashCard.addEventListener("click", flip);
  elements.flipCard.addEventListener("click", flip);
  elements.previousCard.addEventListener("click", () => move(-1));
  elements.nextCard.addEventListener("click", () => move(1));
  elements.reshuffleDeck.addEventListener("click", () => buildDeck({ shuffle: true }));
  elements.showAllCards.addEventListener("click", () => {
    state.weakOnly = false;
    buildDeck({ shuffle: true });
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

  buildDeck({ shuffle: shuffleOnStart, restore: !shuffleOnStart });
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
  }
})();
