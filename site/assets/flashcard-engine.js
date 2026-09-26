(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.ICT600_FLASHCARD_ENGINE = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const VALID_STATUSES = new Set(["again", "learning", "remembered"]);

  function filterCards(cards, options = {}) {
    const chapter = Number(options.chapter || 0);
    const category = options.category || "all";
    const ratings = options.ratings || {};
    return cards.filter((card) => {
      if (chapter && card.chapter !== chapter) return false;
      if (category !== "all" && card.category !== category) return false;
      if (options.weakOnly && ratings[card.id]?.status === "remembered") return false;
      return true;
    });
  }

  function shuffle(cards, random = Math.random) {
    const copy = [...cards];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(random() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
  }

  function rateCard(ratings, id, status, now = Date.now()) {
    if (!VALID_STATUSES.has(status)) throw new Error(`Invalid flashcard rating: ${status}`);
    const previous = ratings[id] || {};
    return {
      ...ratings,
      [id]: {
        status,
        attempts: Number(previous.attempts || 0) + 1,
        lastSeen: now
      }
    };
  }

  function getStats(cards, ratings = {}) {
    return cards.reduce((stats, card) => {
      const status = ratings[card.id]?.status;
      stats.total += 1;
      if (VALID_STATUSES.has(status)) stats.reviewed += 1;
      if (status === "remembered") stats.remembered += 1;
      if (status === "learning") stats.learning += 1;
      if (status === "again") stats.again += 1;
      return stats;
    }, { total: 0, reviewed: 0, remembered: 0, learning: 0, again: 0 });
  }

  function restoreOrder(snapshot, availableCards) {
    if (!snapshot || !Array.isArray(snapshot.order)) return null;
    const byId = new Map(availableCards.map((card) => [card.id, card]));
    const cards = snapshot.order.map((id) => byId.get(id)).filter(Boolean);
    if (!cards.length || cards.length !== snapshot.order.length) return null;
    const index = Math.max(0, Math.min(Number(snapshot.index) || 0, cards.length - 1));
    return { cards, index };
  }

  return { VALID_STATUSES, filterCards, shuffle, rateCard, getStats, restoreOrder };
});
