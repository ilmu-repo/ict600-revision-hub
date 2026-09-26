import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, "site/data/questions.js"), "utf8"), context);
vm.runInContext(fs.readFileSync(path.join(root, "site/data/flashcards.js"), "utf8"), context);
const data = context.window.ICT600_DATA;
const flashData = context.window.ICT600_FLASHCARDS;

test("contains nine chapters and six unique activities per chapter", () => {
  assert.equal(data.chapters.length, 9);
  assert.equal(data.activities.length, 54);
  assert.equal(new Set(data.activities.map((item) => item.id)).size, 54);
  data.chapters.forEach((chapter) => assert.equal(data.activities.filter((item) => item.chapter === chapter.id).length, 6));
});

test("every activity contains the fields required by its interaction", () => {
  const types = new Set(["mcq", "multi", "fill", "order", "short", "code"]);
  data.activities.forEach((item) => {
    assert.ok(item.id && item.prompt && item.source && item.difficulty);
    assert.ok(types.has(item.type), `Unknown type for ${item.id}`);
    if (item.type === "mcq" || item.type === "multi") assert.ok(Array.isArray(item.options) && item.options.length >= 3);
    if (item.type === "fill") assert.ok(Array.isArray(item.answers) && item.answers.length);
    if (item.type === "order") assert.equal(item.items.length, item.answer.length);
    if (item.type === "short" || item.type === "code") assert.ok(item.model && item.checklist.length >= 3);
  });
});

test("offline cache lists existing files", () => {
  const serviceWorker = fs.readFileSync(path.join(root, "site/sw.js"), "utf8");
  assert.match(serviceWorker, /const RELEASE = "10"/);
  const match = serviceWorker.match(/const CORE = \[([\s\S]*?)\];/);
  assert.ok(match);
  const files = [...match[1].matchAll(/"\.\/(.*?)"/g)].map((entry) => entry[1].split("?")[0]).filter(Boolean);
  files.forEach((file) => assert.ok(fs.existsSync(path.join(root, "site", file)), `Missing cached file: ${file}`));
});

test("release cache prevents mixed HTML and script versions", () => {
  const serviceWorker = fs.readFileSync(path.join(root, "site/sw.js"), "utf8");
  assert.match(serviceWorker, /async function networkFirst/);
  assert.match(serviceWorker, /request\.mode === "navigate"[\s\S]*\? networkFirst\(request\)/);
  assert.match(serviceWorker, /const RETAIN_RELEASES = 3/);
  assert.match(serviceWorker, /name\.startsWith\(CACHE_PREFIX\)/);
  assert.doesNotMatch(serviceWorker, /cached\s*\|\|\s*fetch\(event\.request\)/);

  ["index.html", "exams.html", "flashcards.html", "flashcard-study.html"].forEach((file) => {
    const html = fs.readFileSync(path.join(root, "site", file), "utf8");
    const shellReferences = [...html.matchAll(/(?:src|href)="((?:assets|data)\/[^"?]+|manifest\.webmanifest)([^"]*)"/g)];
    assert.ok(shellReferences.length > 0, `${file} should load release-bound shell files`);
    shellReferences.forEach((reference) => assert.match(reference[2], /\?release=10/, `Unversioned shell file in ${file}: ${reference[1]}`));
  });
});

test("manifest is valid and includes phone icons", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "site/manifest.webmanifest"), "utf8"));
  assert.equal(manifest.display, "standalone");
  assert.deepEqual(manifest.icons.map((icon) => icon.sizes), ["192x192", "512x512"]);
});

test("dashboard explains shared mastery and provides session resume controls", () => {
  const home = fs.readFileSync(path.join(root, "site/index.html"), "utf8");
  assert.match(home, /One shared question pool/i);
  assert.match(home, /Chapter mastery is shared across all review styles/i);
  assert.match(home, /id="resumeSession"/);
  assert.match(home, /id="restartSession"/);
  assert.match(home, /href="flashcards\.html\?release=10"/);
});

test("flashcard bank has 25 varied, traceable cards for every chapter", () => {
  assert.equal(flashData.cards.length, 225);
  assert.equal(new Set(flashData.cards.map((card) => card.id)).size, 225);
  const validCategories = new Set(Object.keys(flashData.categories));
  data.chapters.forEach((chapter) => {
    const cards = flashData.cards.filter((card) => card.chapter === chapter.id);
    assert.equal(cards.length, 25, `Chapter ${chapter.id} should have 25 cards`);
    assert.ok(new Set(cards.map((card) => card.category)).size >= 3, `Chapter ${chapter.id} needs varied card types`);
  });
  flashData.cards.forEach((card) => {
    assert.ok(card.id && card.front && card.back && card.source, `Incomplete flashcard ${card.id}`);
    assert.ok(validCategories.has(card.category), `Unknown category for ${card.id}`);
  });
  assert.deepEqual(new Set(flashData.cards.map((card) => card.category)), validCategories);
});

test("flashcard setup opens a separate distraction-free study screen", () => {
  const setupPage = fs.readFileSync(path.join(root, "site/flashcards.html"), "utf8");
  const studyPage = fs.readFileSync(path.join(root, "site/flashcard-study.html"), "utf8");
  const styles = fs.readFileSync(path.join(root, "site/assets/styles.css"), "utf8");
  ["flashChapterGrid", "flashCategoryFilters", "startFocusedStudy", "reviewWeak"].forEach((id) => {
    assert.match(setupPage, new RegExp(`id="${id}"`));
  });
  assert.match(setupPage, /href="flashcard-study\.html\?release=10&amp;chapter=1"/);
  assert.match(setupPage, /assets\/flashcard-setup\.js/);
  assert.doesNotMatch(setupPage, /id="flashCard"/);
  ["flashCard", "flipCard", "ratingActions", "deckCounter", "exitFocus"].forEach((id) => {
    assert.match(studyPage, new RegExp(`id="${id}"`));
  });
  assert.match(studyPage, /assets\/flashcard-study\.js/);
  assert.doesNotMatch(studyPage, /id="flashChapterGrid"|id="memoryLegend"|id="flashCategoryFilters"/);
  assert.match(setupPage, /meaning never depends on colour alone/i);
  assert.match(styles, /\.flash-face\[hidden\]\s*\{\s*display:\s*none\s*!important;/);
  assert.match(styles, /@keyframes flash-flip-out-forward/);
  assert.match(styles, /prefers-reduced-motion:[^)]+\)[\s\S]*animation:\s*none\s*!important/);
});

test("exam library exposes eleven questions while schemes remain under review", () => {
  const examPage = fs.readFileSync(path.join(root, "site/exams.html"), "utf8");
  assert.equal((examPage.match(/data-exam-card/g) || []).length, 11);
  assert.equal((examPage.match(/Scheme under review/g) || []).length, 11);
  assert.doesNotMatch(examPage, /Corrected-Student-Scheme\.pdf/);
  assert.doesNotMatch(examPage, /ICT600-Student-Exam-Reference-Pack\.zip/);

  const linkedResources = [...examPage.matchAll(/href="(resources\/[^\"]+\.(?:pdf|docx))"/g)].map((match) => match[1]);
  assert.equal(linkedResources.length, 11);
  assert.equal(new Set(linkedResources).size, 11);
  linkedResources.forEach((resource) => {
    assert.ok(fs.existsSync(path.join(root, "site", resource)), `Missing exam resource: ${resource}`);
  });
});
