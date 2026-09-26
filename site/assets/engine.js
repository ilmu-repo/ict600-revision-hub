(function (root, factory) {
  "use strict";
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.ICT600_ENGINE = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const AUTO_TYPES = new Set(["mcq", "multi", "fill", "order"]);

  function normalizeText(value) {
    return String(value == null ? "" : value)
      .trim()
      .toLocaleLowerCase("en")
      .replace(/\s+/g, " ");
  }

  function sameIndexSet(left, right) {
    if (!Array.isArray(left) || !Array.isArray(right)) return false;
    const a = [...new Set(left.map(Number))].sort((x, y) => x - y);
    const b = [...new Set(right.map(Number))].sort((x, y) => x - y);
    return a.length === b.length && a.every((item, index) => item === b[index]);
  }

  function scoreAutomatic(activity, response) {
    if (!activity || !AUTO_TYPES.has(activity.type)) {
      return { gradable: false, correct: null };
    }

    let correct = false;
    if (activity.type === "mcq") {
      correct = Number(response) === Number(activity.answer);
    } else if (activity.type === "multi" || activity.type === "order") {
      correct = sameIndexSet(response, activity.answer);
      if (activity.type === "order" && correct) {
        correct = response.every((item, index) => Number(item) === Number(activity.answer[index]));
      }
    } else if (activity.type === "fill") {
      const accepted = Array.isArray(activity.answers) ? activity.answers : [activity.answer];
      correct = accepted.some((answer) => normalizeText(answer) === normalizeText(response));
    }

    return { gradable: true, correct };
  }

  function shuffled(items, randomFn) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const other = Math.floor(randomFn() * (index + 1));
      [result[index], result[other]] = [result[other], result[index]];
    }
    return result;
  }

  function latestOutcomes(history) {
    const latest = new Map();
    (history || []).forEach((item) => latest.set(item.id, item));
    return latest;
  }

  function prioritizeActivities(items, history) {
    const latest = latestOutcomes(history);
    const priority = (item) => {
      const outcome = latest.get(item.id);
      if (!outcome) return 0;
      return outcome.correct === true || outcome.rating === 2 ? 2 : 1;
    };
    return items
      .map((item, index) => ({ item, index, priority: priority(item) }))
      .sort((left, right) => left.priority - right.priority || left.index - right.index)
      .map((entry) => entry.item);
  }

  function selectActivities(activities, chapterId, mode, missedIds, randomFn, history) {
    const random = typeof randomFn === "function" ? randomFn : Math.random;
    const chapter = activities.filter((item) => Number(item.chapter) === Number(chapterId));
    const missed = new Set(missedIds || []);

    if (mode === "retry") return chapter.filter((item) => missed.has(item.id));
    if (mode === "quick") return prioritizeActivities(shuffled(chapter.filter((item) => AUTO_TYPES.has(item.type)), random), history).slice(0, 5);
    if (mode === "guided") {
      const guided = chapter.filter((item) => item.type === "short" || item.type === "code");
      const warmup = prioritizeActivities(shuffled(chapter.filter((item) => AUTO_TYPES.has(item.type)), random), history)[0];
      return warmup ? [warmup, ...prioritizeActivities(guided, history)] : prioritizeActivities(guided, history);
    }
    if (mode === "challenge") return prioritizeActivities(shuffled(chapter, random), history);
    return chapter;
  }

  function createSessionSnapshot(session, nextIndex) {
    if (!session || !Array.isArray(session.items) || !session.items.length) return null;
    const index = Number.isInteger(nextIndex) ? nextIndex : session.index;
    return {
      version: 1,
      chapterId: Number(session.chapterId),
      mode: session.mode,
      itemIds: session.items.map((item) => item.id),
      index,
      outcomes: Array.isArray(session.outcomes) ? session.outcomes : [],
      startedAt: session.startedAt || new Date().toISOString()
    };
  }

  function restoreSessionSnapshot(snapshot, activities) {
    const modes = new Set(["wrap", "quick", "guided", "challenge", "retry"]);
    if (!snapshot || !modes.has(snapshot.mode) || !Array.isArray(snapshot.itemIds) || !snapshot.itemIds.length) return null;
    const byId = new Map((activities || []).map((item) => [item.id, item]));
    const items = snapshot.itemIds.map((id) => byId.get(id));
    const chapterId = Number(snapshot.chapterId);
    const index = Number(snapshot.index);
    if (items.some((item) => !item || Number(item.chapter) !== chapterId)) return null;
    if (!Number.isInteger(index) || index < 0 || index >= items.length) return null;
    return {
      chapterId,
      mode: snapshot.mode,
      items,
      index,
      outcomes: Array.isArray(snapshot.outcomes) ? snapshot.outcomes : [],
      response: null,
      checked: false,
      startedAt: snapshot.startedAt || new Date().toISOString()
    };
  }

  function computeChapterStats(history, chapterId) {
    const relevant = (history || []).filter((item) => Number(item.chapter) === Number(chapterId));
    const latestByActivity = new Map();
    relevant.forEach((item) => latestByActivity.set(item.id, item));
    const latest = [...latestByActivity.values()];
    const auto = latest.filter((item) => typeof item.correct === "boolean");
    const guided = latest.filter((item) => Number.isFinite(item.rating));
    const mastered = latest.filter((item) => item.correct === true || item.rating === 2).length;
    const accuracy = auto.length ? Math.round((auto.filter((item) => item.correct).length / auto.length) * 100) : null;
    const guidedAverage = guided.length
      ? Math.round((guided.reduce((sum, item) => sum + item.rating, 0) / (guided.length * 2)) * 100)
      : null;
    return { attempted: latest.length, mastered, accuracy, guidedAverage };
  }

  return {
    AUTO_TYPES,
    normalizeText,
    sameIndexSet,
    scoreAutomatic,
    prioritizeActivities,
    selectActivities,
    createSessionSnapshot,
    restoreSessionSnapshot,
    computeChapterStats
  };
});
