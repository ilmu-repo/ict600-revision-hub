import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const engine = require("../site/assets/flashcard-engine.js");

const cards = [
  { id: "c1-a", chapter: 1, category: "term" },
  { id: "c1-b", chapter: 1, category: "code" },
  { id: "c2-a", chapter: 2, category: "term" }
];

test("filters by chapter, category and not-remembered status", () => {
  const ratings = { "c1-a": { status: "remembered" }, "c1-b": { status: "learning" } };
  assert.deepEqual(engine.filterCards(cards, { chapter: 1 }).map((card) => card.id), ["c1-a", "c1-b"]);
  assert.deepEqual(engine.filterCards(cards, { chapter: 1, category: "code" }).map((card) => card.id), ["c1-b"]);
  assert.deepEqual(engine.filterCards(cards, { chapter: 1, ratings, weakOnly: true }).map((card) => card.id), ["c1-b"]);
});

test("records independent ratings and increments attempts", () => {
  const first = engine.rateCard({}, "c1-a", "learning", 100);
  const second = engine.rateCard(first, "c1-a", "remembered", 200);
  assert.deepEqual(second["c1-a"], { status: "remembered", attempts: 2, lastSeen: 200 });
  assert.throws(() => engine.rateCard(second, "c1-a", "perfect"), /Invalid flashcard rating/);
});

test("calculates the latest memory state without changing card totals", () => {
  const stats = engine.getStats(cards, {
    "c1-a": { status: "remembered" },
    "c1-b": { status: "again" }
  });
  assert.deepEqual(stats, { total: 3, reviewed: 2, remembered: 1, learning: 0, again: 1 });
});

test("shuffle preserves all cards and saved order restores only when valid", () => {
  const shuffled = engine.shuffle(cards, () => 0);
  assert.notEqual(shuffled, cards);
  assert.deepEqual(new Set(shuffled.map((card) => card.id)), new Set(cards.map((card) => card.id)));

  const restored = engine.restoreOrder({ order: ["c1-b", "c1-a"], index: 1 }, cards);
  assert.deepEqual(restored.cards.map((card) => card.id), ["c1-b", "c1-a"]);
  assert.equal(restored.index, 1);
  assert.equal(engine.restoreOrder({ order: ["missing"], index: 0 }, cards), null);
});
