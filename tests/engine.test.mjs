import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const engine = require("../site/assets/engine.js");

test("normalises case and whitespace without removing meaningful punctuation", () => {
  assert.equal(engine.normalizeText("  TextContent  "), "textcontent");
  assert.equal(engine.normalizeText("."), ".");
});

test("scores all automatically marked activity types", () => {
  assert.equal(engine.scoreAutomatic({ type: "mcq", answer: 1 }, 1).correct, true);
  assert.equal(engine.scoreAutomatic({ type: "multi", answer: [0, 2] }, [2, 0]).correct, true);
  assert.equal(engine.scoreAutomatic({ type: "fill", answers: ["HTTPS/TLS", "TLS"] }, " tls ").correct, true);
  assert.equal(engine.scoreAutomatic({ type: "order", answer: [1, 0, 2] }, [1, 0, 2]).correct, true);
  assert.equal(engine.scoreAutomatic({ type: "order", answer: [1, 0, 2] }, [0, 1, 2]).correct, false);
});

test("selects chapter activities for each learning mode", () => {
  const activities = [
    { id: "a", chapter: 1, type: "mcq" }, { id: "b", chapter: 1, type: "fill" },
    { id: "c", chapter: 1, type: "short" }, { id: "d", chapter: 1, type: "code" },
    { id: "x", chapter: 2, type: "mcq" }
  ];
  assert.deepEqual(engine.selectActivities(activities, 1, "wrap").map((item) => item.id), ["a", "b", "c", "d"]);
  assert.deepEqual(engine.selectActivities(activities, 1, "quick", [], () => 0.99).map((item) => item.id), ["a", "b"]);
  assert.deepEqual(engine.selectActivities(activities, 1, "guided").map((item) => item.id), ["a", "c", "d"]);
  assert.deepEqual(engine.selectActivities(activities, 1, "retry", ["b", "x"]).map((item) => item.id), ["b"]);
});

test("computes latest outcome per activity", () => {
  const history = [
    { id: "a", chapter: 1, correct: false }, { id: "a", chapter: 1, correct: true },
    { id: "b", chapter: 1, rating: 1 }, { id: "b", chapter: 1, rating: 2 }
  ];
  assert.deepEqual(engine.computeChapterStats(history, 1), { attempted: 2, mastered: 2, accuracy: 100, guidedAverage: 100 });
});
