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
const data = context.window.ICT600_DATA;

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
  assert.match(serviceWorker, /ict600-revision-v5/);
  const match = serviceWorker.match(/const CORE = \[([\s\S]*?)\];/);
  assert.ok(match);
  const files = [...match[1].matchAll(/"\.\/(.*?)"/g)].map((entry) => entry[1]).filter(Boolean);
  files.forEach((file) => assert.ok(fs.existsSync(path.join(root, "site", file)), `Missing cached file: ${file}`));
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
