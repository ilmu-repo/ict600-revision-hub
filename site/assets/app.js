(function () {
  "use strict";

  const data = window.ICT600_DATA;
  const engine = window.ICT600_ENGINE;
  if (!data || !engine) return;

  const STORAGE_KEY = "ict600.revision.v1";
  const modeCopy = {
    wrap: "All six shared chapter activities in their teaching order.",
    quick: "A short, automatically marked subset from the same chapter pool.",
    guided: "A warm-up plus explanation and coding activities from the same pool.",
    challenge: "All six shared chapter activities in a fresh random order."
  };
  const modeLabels = { wrap: "Lecture wrap-up", quick: "Quick recall", guided: "Guided practice", challenge: "Full challenge", retry: "Review items" };
  const typeLabels = { mcq: "One answer", multi: "Select all", fill: "Fill the blank", order: "Put in order", short: "Explain", code: "Coding" };

  const $ = (selector) => document.querySelector(selector);
  const els = {
    dashboard: $("#dashboard"), session: $("#sessionView"), result: $("#resultView"),
    chapterGrid: $("#chapterGrid"), modePicker: $("#modePicker"), modeDescription: $("#modeDescription"),
    mastery: $("#masteryNumber"), connection: $("#connectionBadge"), install: $("#installButton"),
    resumePanel: $("#resumePanel"), resumeDescription: $("#resumeDescription"),
    sessionCounter: $("#sessionCounter"), sessionProgress: $("#sessionProgress"),
    questionChapter: $("#questionChapter"), questionType: $("#questionType"), questionDifficulty: $("#questionDifficulty"),
    sessionTitle: $("#sessionTitle"), answerForm: $("#answerForm"), feedback: $("#feedback"), actions: $("#questionActions"),
    resultTitle: $("#resultTitle"), resultSummary: $("#resultSummary"), resultMetrics: $("#resultMetrics"),
    reviewList: $("#reviewList"), retry: $("#retryMissed"), settings: $("#settingsDialog")
  };

  let saved = loadProgress();
  let selectedMode = "wrap";
  let session = null;
  let deferredInstall = null;

  function loadProgress() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return value && Array.isArray(value.history) && Array.isArray(value.missed)
        ? { history: value.history, missed: value.missed, activeSession: value.activeSession || null }
        : { history: [], missed: [], activeSession: null };
    } catch (_) {
      return { history: [], missed: [], activeSession: null };
    }
  }

  function saveProgress() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function chapterById(id) {
    return data.chapters.find((chapter) => Number(chapter.id) === Number(id));
  }

  function showView(name) {
    els.dashboard.hidden = name !== "dashboard";
    els.session.hidden = name !== "session";
    els.result.hidden = name !== "result";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setMissed(id, shouldReview) {
    const set = new Set(saved.missed);
    if (shouldReview) set.add(id); else set.delete(id);
    saved.missed = [...set];
  }

  function recordOutcome(activity, outcome) {
    saved.history.push({ id: activity.id, chapter: activity.chapter, mode: session.mode, ts: new Date().toISOString(), ...outcome });
    if (saved.history.length > 1000) saved.history = saved.history.slice(-1000);
    if (typeof outcome.correct === "boolean") setMissed(activity.id, !outcome.correct);
    if (Number.isFinite(outcome.rating)) setMissed(activity.id, outcome.rating < 2);
    saveProgress();
  }

  function storedSession() {
    const restored = engine.restoreSessionSnapshot(saved.activeSession, data.activities);
    if (!restored && saved.activeSession) {
      saved.activeSession = null;
      saveProgress();
    }
    return restored;
  }

  function saveSessionCheckpoint(nextIndex) {
    if (!session) return;
    const index = Number.isInteger(nextIndex) ? nextIndex : session.index;
    saved.activeSession = index >= session.items.length ? null : engine.createSessionSnapshot(session, index);
    saveProgress();
    els.sessionProgress.style.width = `${Math.min(index / session.items.length, 1) * 100}%`;
    renderResumePanel();
  }

  function renderResumePanel() {
    const active = storedSession();
    els.resumePanel.hidden = !active;
    if (!active) return;
    const chapter = chapterById(active.chapterId);
    els.resumeDescription.textContent = `${modeLabels[active.mode]} · Chapter ${chapter.id}: ${chapter.title} · Question ${active.index + 1} of ${active.items.length}. Your exact question order has been saved.`;
    $("#restartSession").textContent = ["quick", "challenge"].includes(active.mode) ? "Restart with a fresh order" : "Start this session again";
  }

  function resumeStoredSession() {
    const restored = storedSession();
    if (!restored) return;
    session = restored;
    if (Object.hasOwn(modeCopy, restored.mode)) chooseMode(restored.mode);
    history.replaceState(null, "", `#chapter=${restored.chapterId}&mode=${restored.mode}`);
    showView("session");
    renderQuestion();
  }

  function renderDashboard() {
    const mastered = data.chapters.reduce((total, chapter) => total + engine.computeChapterStats(saved.history, chapter.id).mastered, 0);
    els.mastery.textContent = mastered;
    els.chapterGrid.innerHTML = data.chapters.map((chapter) => {
      const stats = engine.computeChapterStats(saved.history, chapter.id);
      const total = data.activities.filter((item) => item.chapter === chapter.id).length;
      const percent = total ? Math.round((stats.mastered / total) * 100) : 0;
      const missed = data.activities.filter((item) => item.chapter === chapter.id && saved.missed.includes(item.id)).length;
      return `<button class="chapter-card" type="button" data-chapter="${chapter.id}" style="--chapter-accent:${chapter.accent}">
        ${missed ? `<span class="retry-chip">${missed} to review</span>` : ""}
        <div><span class="chapter-number">CHAPTER ${chapter.id}</span><h3>${escapeHtml(chapter.title)}</h3><p>${escapeHtml(chapter.summary)}</p></div>
        <div class="chapter-progress"><div><span>${stats.mastered} of ${total} unique activities mastered</span><span>${percent}% chapter mastery</span></div><div class="mini-track"><span style="width:${percent}%"></span></div></div>
      </button>`;
    }).join("");
    renderResumePanel();
  }

  function chooseMode(mode) {
    selectedMode = mode;
    els.modePicker.querySelectorAll("[data-mode]").forEach((button) => {
      const active = button.dataset.mode === mode;
      button.classList.toggle("selected", active);
      button.setAttribute("aria-checked", String(active));
    });
    els.modeDescription.textContent = modeCopy[mode];
  }

  function startSession(chapterId, mode, forceNew) {
    const active = storedSession();
    if (active && !forceNew) {
      if (active.chapterId === Number(chapterId) && active.mode === mode) {
        resumeStoredSession();
        return;
      }
      const replace = window.confirm(`You have an unfinished ${modeLabels[active.mode]} for Chapter ${active.chapterId}. Start the selected review instead?`);
      if (!replace) return;
    }
    const items = engine.selectActivities(data.activities, chapterId, mode, saved.missed, Math.random, saved.history);
    if (!items.length) {
      window.alert("There are no review items waiting for this chapter. Try the lecture wrap-up instead.");
      return;
    }
    session = { chapterId: Number(chapterId), mode, items, index: 0, outcomes: [], response: null, checked: false, startedAt: new Date().toISOString() };
    saveSessionCheckpoint(0);
    history.replaceState(null, "", `#chapter=${chapterId}&mode=${mode}`);
    showView("session");
    renderQuestion();
  }

  function currentActivity() { return session.items[session.index]; }

  function renderQuestion() {
    const activity = currentActivity();
    const chapter = chapterById(activity.chapter);
    session.response = activity.type === "multi" ? [] : activity.type === "order" ? [] : null;
    session.checked = false;
    els.sessionCounter.textContent = `Question ${session.index + 1} of ${session.items.length}`;
    els.sessionProgress.style.width = `${(session.index / session.items.length) * 100}%`;
    els.questionChapter.textContent = `Chapter ${chapter.id}`;
    els.questionType.textContent = typeLabels[activity.type];
    els.questionDifficulty.textContent = activity.difficulty;
    els.sessionTitle.textContent = activity.prompt;
    els.feedback.hidden = true;
    els.feedback.className = "feedback";
    els.feedback.innerHTML = "";
    els.answerForm.innerHTML = answerMarkup(activity);
    els.actions.innerHTML = actionMarkup(activity);
    bindQuestionControls(activity);
    const focusTarget = els.answerForm.querySelector("input, textarea, button");
    if (focusTarget) focusTarget.focus({ preventScroll: true });
  }

  function answerMarkup(activity) {
    if (activity.type === "mcq" || activity.type === "multi") {
      return `<div class="choice-list ${activity.type === "multi" ? "multi" : ""}">${activity.options.map((option, index) =>
        `<button class="choice" type="button" data-choice="${index}" aria-pressed="false"><span class="choice-marker">${activity.type === "mcq" ? String.fromCharCode(65 + index) : "✓"}</span><span>${escapeHtml(option)}</span></button>`
      ).join("")}</div>`;
    }
    if (activity.type === "fill") {
      return `<label for="fillAnswer" class="prompt-note">Type the missing word, phrase, symbol or value.</label><input id="fillAnswer" class="text-input" autocomplete="off" autocapitalize="none">`;
    }
    if (activity.type === "order") {
      return `<p class="prompt-note">Tap the steps below to build your answer. Tap an answer step to return it.</p><div id="orderAnswer" class="order-answer" aria-label="Your order"></div><div id="orderBank" class="order-bank" aria-label="Available steps">${activity.items.map((item, index) => `<button type="button" class="order-tile" data-order="${index}"><span>${index + 1}</span>${escapeHtml(item)}</button>`).join("")}</div>`;
    }
    const starter = activity.type === "code" ? activity.starter || "" : "";
    return `<label for="guidedAnswer" class="prompt-note">${activity.type === "code" ? "Write or adapt the code below. Your work stays on this device." : "Write your own answer before revealing the model response."}</label><textarea id="guidedAnswer" class="answer-area ${activity.type === "code" ? "code-input" : ""}" spellcheck="${activity.type === "code" ? "false" : "true"}">${escapeHtml(starter)}</textarea>`;
  }

  function actionMarkup(activity) {
    if (activity.type === "short" || activity.type === "code") return `<button class="button primary" id="revealModel" type="button">Show model & checklist</button>`;
    const extra = activity.type === "order" ? `<button class="button ghost" id="resetOrder" type="button">Reset order</button>` : "";
    return `<button class="button primary" id="checkAnswer" type="button">Check answer</button>${extra}`;
  }

  function bindQuestionControls(activity) {
    els.answerForm.querySelectorAll("[data-choice]").forEach((button) => button.addEventListener("click", () => {
      if (session.checked) return;
      const index = Number(button.dataset.choice);
      if (activity.type === "mcq") {
        session.response = index;
        els.answerForm.querySelectorAll("[data-choice]").forEach((item) => {
          const selected = Number(item.dataset.choice) === index;
          item.classList.toggle("selected", selected);
          item.setAttribute("aria-pressed", String(selected));
        });
      } else {
        const selected = new Set(session.response);
        selected.has(index) ? selected.delete(index) : selected.add(index);
        session.response = [...selected];
        button.classList.toggle("selected", selected.has(index));
        button.setAttribute("aria-pressed", String(selected.has(index)));
      }
    }));

    if (activity.type === "order") bindOrderControls(activity);
    const check = $("#checkAnswer");
    if (check) check.addEventListener("click", () => checkAutomatic(activity));
    const reveal = $("#revealModel");
    if (reveal) reveal.addEventListener("click", () => revealGuided(activity));
    const reset = $("#resetOrder");
    if (reset) reset.addEventListener("click", () => { session.response = []; renderOrder(activity); });
    els.answerForm.addEventListener("submit", (event) => event.preventDefault());
    const fill = $("#fillAnswer");
    if (fill) fill.addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); checkAutomatic(activity); } });
  }

  function bindOrderControls(activity) {
    $("#orderBank").addEventListener("click", (event) => {
      const tile = event.target.closest("[data-order]");
      if (!tile || session.checked) return;
      session.response.push(Number(tile.dataset.order));
      renderOrder(activity);
    });
    $("#orderAnswer").addEventListener("click", (event) => {
      const tile = event.target.closest("[data-answer-position]");
      if (!tile || session.checked) return;
      session.response.splice(Number(tile.dataset.answerPosition), 1);
      renderOrder(activity);
    });
  }

  function renderOrder(activity) {
    const answer = $("#orderAnswer");
    const bank = $("#orderBank");
    answer.innerHTML = session.response.map((itemIndex, position) => `<button type="button" class="order-tile" data-answer-position="${position}"><span>${position + 1}</span>${escapeHtml(activity.items[itemIndex])}</button>`).join("");
    const chosen = new Set(session.response);
    bank.innerHTML = activity.items.map((item, index) => chosen.has(index) ? "" : `<button type="button" class="order-tile" data-order="${index}"><span>+</span>${escapeHtml(item)}</button>`).join("");
  }

  function responseFor(activity) {
    if (activity.type === "fill") return $("#fillAnswer").value;
    return session.response;
  }

  function hasResponse(activity, response) {
    if (activity.type === "mcq") return Number.isInteger(response);
    if (activity.type === "multi" || activity.type === "order") return Array.isArray(response) && response.length > 0;
    return String(response == null ? "" : response).trim().length > 0;
  }

  function correctAnswerText(activity) {
    if (activity.type === "mcq") return activity.options[activity.answer];
    if (activity.type === "multi") return activity.answer.map((index) => activity.options[index]).join("; ");
    if (activity.type === "fill") return activity.answerDisplay || activity.answers[0];
    if (activity.type === "order") return activity.answer.map((index, position) => `${position + 1}. ${activity.items[index]}`).join(" → ");
    return "";
  }

  function checkAutomatic(activity) {
    if (session.checked) return;
    const response = responseFor(activity);
    if (!hasResponse(activity, response)) {
      els.feedback.hidden = false;
      els.feedback.innerHTML = `<h2>Add an answer first</h2><p>Choose or enter a response before checking it.</p>`;
      return;
    }
    const score = engine.scoreAutomatic(activity, response);
    session.checked = true;
    session.response = response;
    session.outcomes.push({ id: activity.id, correct: score.correct, prompt: activity.prompt });
    recordOutcome(activity, { correct: score.correct });
    saveSessionCheckpoint(session.index + 1);
    els.feedback.hidden = false;
    els.feedback.className = `feedback ${score.correct ? "correct" : "incorrect"}`;
    els.feedback.innerHTML = `<h2>${score.correct ? "Correct" : "Review this one"}</h2>${score.correct ? "" : `<p><strong>Expected:</strong> ${escapeHtml(correctAnswerText(activity))}</p>`}<p>${escapeHtml(activity.explanation)}</p>`;
    markChoices(activity, response);
    els.actions.innerHTML = nextButtonMarkup();
    bindNext();
  }

  function markChoices(activity, response) {
    if (activity.type !== "mcq" && activity.type !== "multi") return;
    const answers = new Set(activity.type === "mcq" ? [activity.answer] : activity.answer);
    const selected = new Set(activity.type === "mcq" ? [response] : response);
    els.answerForm.querySelectorAll("[data-choice]").forEach((button) => {
      const index = Number(button.dataset.choice);
      if (answers.has(index)) button.classList.add("correct");
      else if (selected.has(index)) button.classList.add("incorrect");
      button.disabled = true;
    });
  }

  function revealGuided(activity) {
    if (session.checked) return;
    const answer = $("#guidedAnswer").value.trim();
    if (!answer) {
      els.feedback.hidden = false;
      els.feedback.innerHTML = `<h2>Write something first</h2><p>Your first attempt is the useful part—even a short outline is enough to begin.</p>`;
      return;
    }
    session.checked = true;
    $("#guidedAnswer").readOnly = true;
    els.feedback.hidden = false;
    els.feedback.innerHTML = `<h2>Compare your response</h2><p>Look for each idea below. Equivalent wording or a different correct coding approach is acceptable.</p><pre class="model-answer"><code>${escapeHtml(activity.model)}</code></pre><ul class="checklist">${activity.checklist.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
    els.actions.innerHTML = `<div class="rating-row" aria-label="Rate your answer"><button type="button" class="rating-button" data-rating="2"><strong>Got it</strong><small>Met the checklist</small></button><button type="button" class="rating-button" data-rating="1"><strong>Almost</strong><small>One gap</small></button><button type="button" class="rating-button" data-rating="0"><strong>Review</strong><small>Needs another try</small></button></div>`;
    els.actions.querySelectorAll("[data-rating]").forEach((button) => button.addEventListener("click", () => rateGuided(activity, Number(button.dataset.rating))));
  }

  function rateGuided(activity, rating) {
    session.outcomes.push({ id: activity.id, rating, prompt: activity.prompt });
    recordOutcome(activity, { rating });
    saveSessionCheckpoint(session.index + 1);
    els.actions.innerHTML = nextButtonMarkup();
    bindNext();
  }

  function nextButtonMarkup() {
    return `<button class="button primary" id="nextQuestion" type="button">${session.index === session.items.length - 1 ? "See results" : "Next question"}</button>`;
  }

  function bindNext() {
    $("#nextQuestion").addEventListener("click", () => {
      if (session.index < session.items.length - 1) { session.index += 1; renderQuestion(); }
      else finishSession();
    });
  }

  function finishSession() {
    const chapter = chapterById(session.chapterId);
    const automatic = session.outcomes.filter((item) => typeof item.correct === "boolean");
    const guided = session.outcomes.filter((item) => Number.isFinite(item.rating));
    const autoCorrect = automatic.filter((item) => item.correct).length;
    const confident = guided.filter((item) => item.rating === 2).length;
    const review = session.outcomes.filter((item) => item.correct === false || item.rating < 2);
    saved.activeSession = null;
    saveProgress();
    els.sessionProgress.style.width = "100%";
    els.resultTitle.textContent = review.length ? "Progress made." : "Chapter cleared.";
    els.resultSummary.textContent = review.length
      ? `You completed Chapter ${chapter.id}: ${chapter.title}. ${review.length} item${review.length === 1 ? "" : "s"} will stay in your review list.`
      : `You completed Chapter ${chapter.id}: ${chapter.title} with no items left to review.`;
    const metrics = [
      { value: session.items.length, label: "activities completed" },
      automatic.length ? { value: `${autoCorrect}/${automatic.length}`, label: "automatic answers correct" } : null,
      guided.length ? { value: `${confident}/${guided.length}`, label: "guided answers mastered" } : null
    ].filter(Boolean);
    els.resultMetrics.innerHTML = metrics.map((metric) => `<div class="metric"><strong>${metric.value}</strong><span>${metric.label}</span></div>`).join("");
    els.reviewList.innerHTML = review.length ? `<h2>Review next</h2>${review.map((item) => `<div class="review-item">${escapeHtml(item.prompt)}</div>`).join("")}` : "";
    els.retry.hidden = review.length === 0;
    renderDashboard();
    showView("result");
  }

  function returnHome() {
    session = null;
    history.replaceState(null, "", location.pathname + location.search);
    renderDashboard();
    showView("dashboard");
  }

  function updateConnection() {
    const online = navigator.onLine;
    els.connection.textContent = online ? "Online" : "Offline ready";
    els.connection.classList.toggle("offline", !online);
  }

  function exportProgress() {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), version: data.version, ...saved }, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ICT600-progress-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function initialRoute() {
    const params = new URLSearchParams(location.hash.replace(/^#/, ""));
    const chapter = Number(params.get("chapter"));
    const mode = params.get("mode");
    if (chapterById(chapter) && ["wrap", "quick", "guided", "challenge", "retry"].includes(mode)) startSession(chapter, mode);
  }

  els.modePicker.addEventListener("click", (event) => {
    const button = event.target.closest("[data-mode]");
    if (button) chooseMode(button.dataset.mode);
  });
  els.chapterGrid.addEventListener("click", (event) => {
    const card = event.target.closest("[data-chapter]");
    if (card) startSession(Number(card.dataset.chapter), selectedMode);
  });
  $("#resumeSession").addEventListener("click", resumeStoredSession);
  $("#restartSession").addEventListener("click", () => {
    const active = storedSession();
    if (active) startSession(active.chapterId, active.mode, true);
  });
  $("#exitSession").addEventListener("click", returnHome);
  $("#backHome").addEventListener("click", returnHome);
  els.retry.addEventListener("click", () => startSession(session.chapterId, "retry"));
  $("#shareResult").addEventListener("click", async () => {
    const chapter = chapterById(session.chapterId);
    const url = `${location.origin}${location.pathname}#chapter=${chapter.id}&mode=wrap`;
    const share = { title: `ICT600 Chapter ${chapter.id}`, text: `Revise ${chapter.title} with the ICT600 Revision Hub.`, url };
    try { if (navigator.share) await navigator.share(share); else { await navigator.clipboard.writeText(url); window.alert("Chapter link copied."); } } catch (_) { /* User cancelled sharing. */ }
  });
  $("#openSettings").addEventListener("click", () => els.settings.showModal());
  $("#exportProgress").addEventListener("click", exportProgress);
  $("#resetProgress").addEventListener("click", () => {
    if (!window.confirm("Reset all ICT600 progress on this device?")) return;
    saved = { history: [], missed: [], activeSession: null };
    saveProgress();
    renderDashboard();
    els.settings.close();
  });
  $("#dataVersion").textContent = data.version;
  window.addEventListener("online", updateConnection);
  window.addEventListener("offline", updateConnection);
  window.addEventListener("beforeinstallprompt", (event) => { event.preventDefault(); deferredInstall = event; els.install.hidden = false; });
  els.install.addEventListener("click", async () => {
    if (!deferredInstall) return;
    deferredInstall.prompt();
    await deferredInstall.userChoice;
    deferredInstall = null;
    els.install.hidden = true;
  });
  window.addEventListener("appinstalled", () => { els.install.hidden = true; });

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("sw.js");
  updateConnection();
  renderDashboard();
  initialRoute();
})();
