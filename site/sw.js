const RELEASE = "10";
const CACHE_PREFIX = "ict600-revision-v";
const CACHE = `${CACHE_PREFIX}${RELEASE}`;
const RETAIN_RELEASES = 3;
const CORE = [
  "./",
  "./index.html",
  "./exams.html",
  "./flashcards.html",
  "./flashcard-study.html",
  "./assets/styles.css?release=10",
  "./assets/engine.js?release=10",
  "./assets/app.js?release=10",
  "./assets/flashcard-engine.js?release=10",
  "./assets/flashcard-setup.js?release=10",
  "./assets/flashcard-study.js?release=10",
  "./data/questions.js?release=10",
  "./data/flashcards.js?release=10",
  "./manifest.webmanifest?release=10",
  "./favicon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

function releaseNumber(cacheName) {
  const value = Number(cacheName.slice(CACHE_PREFIX.length));
  return Number.isFinite(value) ? value : -1;
}

async function releaseCacheNames() {
  return (await caches.keys())
    .filter((name) => name.startsWith(CACHE_PREFIX))
    .sort((left, right) => releaseNumber(right) - releaseNumber(left));
}

async function matchInReleaseCaches(request) {
  const names = await releaseCacheNames();
  const ordered = [CACHE, ...names.filter((name) => name !== CACHE)];
  const url = new URL(request.url);
  const withoutQuery = `${url.origin}${url.pathname}`;

  for (const name of ordered) {
    const cache = await caches.open(name);
    const exact = await cache.match(request);
    if (exact) return exact;
    if (url.search) {
      const base = await cache.match(withoutQuery);
      if (base) return base;
    }
  }
  return undefined;
}

async function storeCurrent(request, response) {
  if (!response?.ok || new URL(request.url).origin !== self.location.origin) return;
  const cache = await caches.open(CACHE);
  await cache.put(request, response.clone());
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      await storeCurrent(request, response);
      return response;
    }
    return (await matchInReleaseCaches(request)) || response;
  } catch (error) {
    const cached = await matchInReleaseCaches(request);
    if (cached) return cached;
    if (request.mode === "navigate") {
      const home = await matchInReleaseCaches(new Request(new URL("./index.html", self.location.href)));
      if (home) return home;
    }
    throw error;
  }
}

async function releaseAssetFirst(request) {
  const cached = await matchInReleaseCaches(request);
  if (cached) return cached;
  return networkFirst(request);
}

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await releaseCacheNames();
    const keep = new Set([CACHE, ...names.filter((name) => name !== CACHE).slice(0, RETAIN_RELEASES - 1)]);
    await Promise.all(names.filter((name) => !keep.has(name)).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isReleaseAsset = url.searchParams.has("release") ||
    (!url.search && /\/(?:assets|data)\//.test(url.pathname));
  event.respondWith(request.mode === "navigate" || !isReleaseAsset
    ? networkFirst(request)
    : releaseAssetFirst(request));
});
