const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbzYhk7BX1hejlqZI938Tl0bvzzbr-vfGtHrAj5OySeeS82l2IaBj9bxbY2ZtqdZkdSf/exec";
const THUMBNAIL_BASE_PATH = "./assets/thumbnails";
const THUMBNAIL_EXTENSIONS = ["webp", "png", "jpg", "jpeg"];
const FACE_BASE_PATH = "./assets/faces";
const FACE_EXTENSIONS = ["png", "webp", "jpg", "jpeg"];
const NOTES_STORAGE_KEY = "moik_demon_notes";

const mockData = {
  ok: true,
  meta: {
    title: "2026 List",
    sheetName: "2026 List",
    totalDemons: 6,
    completedCount: 6,
    inProgressCount: 0,
    recordedCount: 3,
    highestTier: 24,
    totalAttempts: 109742,
    updatedAt: "2026-04-17T14:30:00Z",
  },
  demons: [
    {
      placement: 1,
      name: "Bloodbath",
      creators: "Riot & more",
      id: 10565740,
      difficulty: "Extreme Demon",
      attempts: 20226,
      year: 2026,
      video: "Recorded",
      tier: 24.0,
      tierChange: 0,
      status: "COMPLETED",
    },
    {
      placement: 2,
      name: "Make It Drop",
      creators: "ryamu & more",
      id: 75518661,
      difficulty: "Extreme Demon",
      attempts: 3137,
      year: 2025,
      video: "",
      tier: 20.56,
      tierChange: 0,
      status: "COMPLETED",
    },
    {
      placement: 4,
      name: "ICE Carbon Diablo X",
      creators: "roadbose",
      id: 814678,
      difficulty: "Insane Demon",
      attempts: 7159,
      year: 2024,
      video: "",
      tier: 19.78,
      tierChange: 0,
      status: "COMPLETED",
    },
    {
      placement: 5,
      name: "Beetle",
      creators: "Cirtrax",
      id: 61366260,
      difficulty: "Insane Demon",
      attempts: 1743,
      year: 2026,
      video: "",
      tier: 18.7,
      tierChange: 0,
      status: "COMPLETED",
    },
    {
      placement: 12,
      name: "Sleepless",
      creators: "ChaSe",
      id: 61067595,
      difficulty: "Insane Demon",
      attempts: 336,
      year: 2026,
      video: "Recorded",
      tier: 15.91,
      tierChange: 0,
      status: "COMPLETED",
    },
    {
      placement: 27,
      name: "After Dark",
      creators: "koukl",
      id: 116218631,
      difficulty: "Hard Demon",
      attempts: 220,
      year: 2026,
      video: "Recorded",
      tier: 13.75,
      tierChange: 0.01,
      status: "COMPLETED",
    },
  ],
};

const elements = {
  heroMeta: document.getElementById("hero-meta"),
  tableBody: document.getElementById("demon-table-body"),
  resultCount: document.getElementById("result-count"),
  emptyState: document.getElementById("empty-state"),
  rowTemplate: document.getElementById("row-template"),
  listTitle: document.getElementById("list-title"),
  searchInput: document.getElementById("search-input"),
  difficultyFilter: document.getElementById("difficulty-filter"),
  segmentTabs: document.getElementById("segment-tabs"),
  sortOrder: document.getElementById("sort-order"),
  statTotal: document.getElementById("stat-total"),
  statTopTier: document.getElementById("stat-top-tier"),
  statAttempts: document.getElementById("stat-attempts"),
  loadingOverlay: document.getElementById("loading-overlay"),
  loadingText: document.getElementById("loading-text"),
  modal: document.getElementById("demon-modal"),
  modalBackdrop: document.getElementById("modal-backdrop"),
  modalClose: document.getElementById("modal-close"),
  modalPrev: document.getElementById("modal-prev"),
  modalNext: document.getElementById("modal-next"),
  modalCounter: document.getElementById("modal-counter"),
  modalThumb: document.getElementById("modal-thumb"),
  modalDifficultyLabel: document.getElementById("modal-difficulty-label"),
  modalTitle: document.getElementById("modal-title"),
  modalCreators: document.getElementById("modal-creators"),
  modalId: document.getElementById("modal-id"),
  modalPlacement: document.getElementById("modal-placement"),
  modalTier: document.getElementById("modal-tier"),
  modalYear: document.getElementById("modal-year"),
  modalAttempts: document.getElementById("modal-attempts"),
  modalTierChange: document.getElementById("modal-tier-change"),
  modalFace: document.getElementById("modal-face"),
  modalCreatorTags: document.getElementById("modal-creator-tags"),
  modalNotes: document.getElementById("modal-notes"),
  modalSaveNotes: document.getElementById("modal-save-notes"),
};

let sourceData = [];
let activeSegment = "all";
let currentVisibleData = [];
let activeModalIndex = -1;

init();

async function init() {
  setLoading(true, "Loading demon list...");
  attachEvents();

  const payload = await loadData();
  sourceData = normalizePayload(payload);
  populateDifficultyFilter(sourceData);
  updateHeroMeta(payload.meta);
  updateStats(sourceData, payload.meta);
  updateListTitle();
  applyFilters();
  setLoading(false);
}

async function loadData() {
  if (!SHEET_API_URL || SHEET_API_URL.includes("PASTE_YOUR")) {
    return mockData;
  }

  try {
    setLoading(true, "Fetching live sheet data...");
    const response = await fetch(SHEET_API_URL, { method: "GET" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch sheet data, falling back to mock data.", error);
    return mockData;
  }
}

function normalizePayload(payload) {
  const demons = Array.isArray(payload?.demons) ? payload.demons : [];

  return demons.map((entry) => ({
    placement: Number(entry.placement) || 0,
    placementDisplay: String(entry.placementDisplay || "").trim(),
    name: String(entry.name || "").trim(),
    creators: String(entry.creators || "").trim(),
    id: entry.id ? String(entry.id) : "",
    difficulty: String(entry.difficulty || "Unknown"),
    attempts: Number(entry.attempts) || 0,
    year: Number(entry.year) || 0,
    tier: Number(entry.tier) || 0,
    tierChange: entry.tierChange === null || entry.tierChange === undefined || entry.tierChange === ""
      ? null
      : Number(entry.tierChange),
  }));
}

function updateHeroMeta(meta = {}) {
  const chips = [];

  if (meta.title) {
    chips.push(meta.title);
  }

  if (meta.totalDemons) {
    chips.push(`${formatNumber(meta.totalDemons)} demons`);
  }

  if (meta.updatedAt) {
    const date = new Date(meta.updatedAt);
    chips.push(`Updated ${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
  }

  if (!chips.length) {
    chips.push("Live sheet sync ready");
  }

  elements.heroMeta.innerHTML = chips
    .map((chip) => `<span class="pill">${escapeHtml(chip)}</span>`)
    .join("");
}

function updateStats(data, meta = {}) {
  const total = meta.totalDemons ?? data.length;
  const topTier = meta.highestTier ?? Math.max(...data.map((item) => item.tier), 0);
  const attempts = meta.totalAttempts ?? data.reduce((sum, item) => sum + item.attempts, 0);

  elements.statTotal.textContent = formatNumber(total);
  elements.statTopTier.textContent = topTier ? topTier.toFixed(2) : "--";
  elements.statAttempts.textContent = formatNumber(attempts);
}

function populateDifficultyFilter(data) {
  const unique = [...new Set(data.map((item) => item.difficulty))].sort((a, b) => a.localeCompare(b));

  for (const difficulty of unique) {
    const option = document.createElement("option");
    option.value = difficulty;
    option.textContent = difficulty;
    elements.difficultyFilter.append(option);
  }
}

function attachEvents() {
  elements.searchInput.addEventListener("input", applyFilters);
  elements.difficultyFilter.addEventListener("change", applyFilters);
  elements.sortOrder.addEventListener("change", applyFilters);
  elements.segmentTabs.addEventListener("click", handleSegmentClick);
  elements.modalBackdrop.addEventListener("click", closeModal);
  elements.modalClose.addEventListener("click", closeModal);
  elements.modalPrev.addEventListener("click", showPreviousModalItem);
  elements.modalNext.addEventListener("click", showNextModalItem);
  elements.modalSaveNotes.addEventListener("click", saveActiveNotes);
  document.addEventListener("keydown", handleModalKeydown);
}

function applyFilters() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const difficulty = elements.difficultyFilter.value;
  const sort = elements.sortOrder.value;

  let filtered = sourceData.filter((item) => {
    const haystack = `${item.name} ${item.creators} ${item.id}`.toLowerCase();
    const searchMatch = !query || haystack.includes(query);
    const difficultyMatch = difficulty === "all" || item.difficulty === difficulty;
    const segmentMatch = matchesSegment(item, activeSegment);

    return searchMatch && difficultyMatch && segmentMatch;
  });

  filtered = sortData(filtered, sort);
  currentVisibleData = filtered;
  renderTable(filtered);
}

function matchesSegment(item, segment) {
  if (segment === "all") {
    return true;
  }

  if (!item.placement) {
    return false;
  }

  if (segment === "main") {
    return item.placement >= 1 && item.placement <= 100;
  }

  if (segment === "extended") {
    return item.placement >= 101 && item.placement <= 200;
  }

  if (segment === "legacy") {
    return item.placement >= 201;
  }

  return false;
}

function sortData(data, sort) {
  const sorted = [...data];

  switch (sort) {
    case "tier-desc":
      sorted.sort((a, b) => b.tier - a.tier);
      break;
    case "tier-asc":
      sorted.sort((a, b) => a.tier - b.tier);
      break;
    case "attempts-desc":
      sorted.sort((a, b) => b.attempts - a.attempts);
      break;
    case "year-desc":
      sorted.sort((a, b) => b.year - a.year || a.placement - b.placement);
      break;
    case "placement":
    default:
      sorted.sort((a, b) => a.placement - b.placement);
      break;
  }

  return sorted;
}

function renderTable(data) {
  currentVisibleData = data;
  elements.tableBody.innerHTML = "";
  elements.resultCount.textContent = `${formatNumber(data.length)} entr${data.length === 1 ? "y" : "ies"}`;
  elements.emptyState.classList.toggle("hidden", data.length !== 0);

  const fragment = document.createDocumentFragment();

  for (const item of data) {
    const row = elements.rowTemplate.content.firstElementChild.cloneNode(true);
    row.addEventListener("click", () => openModalForItem(item));
    row.querySelector(".placement").replaceChildren(createPlacementContent(item));
    const demonCell = row.querySelector(".demon-cell");
    const thumb = row.querySelector(".demon-cell__thumb");
    const name = row.querySelector(".demon-cell__name");
    const id = row.querySelector(".demon-cell__id");
    const body = document.createElement("div");
    body.className = "demon-cell__body";

    name.textContent = item.name;
    id.textContent = item.id ? `ID ${item.id}` : "No level ID";
    body.append(name, id);
    demonCell.append(body);

    applyThumbnail(thumb, item);
    row.querySelector(".creators").textContent = item.creators || "--";
    row.querySelector(".attempts").textContent = formatNumber(item.attempts);
    row.querySelector(".year").textContent = item.year || "--";
    row.querySelector(".tier").textContent = item.tier ? item.tier.toFixed(2) : "--";

    row.querySelector(".difficulty").append(createDifficultyTag(item.difficulty));
    row.querySelector(".tier-change").append(createTierChangeTag(item.tierChange));
    fragment.append(row);
  }

  elements.tableBody.append(fragment);
}

function createDifficultyTag(difficulty) {
  const tag = document.createElement("span");
  tag.className = `difficulty-tag ${difficultyClass(difficulty)}`;
  tag.textContent = difficulty;
  return tag;
}

function createPlacementContent(item) {
  const wrapper = document.createElement("span");
  wrapper.className = "placement-wrap";

  const text = document.createElement("span");
  text.textContent = item.placementDisplay || (item.placement ? `#${item.placement}` : "--");
  wrapper.append(text);

  if (item.placement >= 1 && item.placement <= 3) {
    wrapper.append(createCrownIcon());
  }

  return wrapper;
}

function createCrownIcon() {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("class", "placement-crown");

  const path = document.createElementNS(ns, "path");
  path.setAttribute(
    "d",
    "M3 18h18l-1.5-9-4.5 4-3-6-3 6-4.5-4L3 18Zm2.2-2h13.6l.6-3.7-3.4 3-3-5.9-3 5.9-3.4-3 .6 3.7Z"
  );

  svg.append(path);
  return svg;
}

function createTierChangeTag(value) {
  const tag = document.createElement("span");
  let className = "tier-change-neutral";
  let label = "0.00";

  if (value === null || Number.isNaN(value)) {
    label = "--";
  } else if (value > 0) {
    className = "tier-change-positive";
    label = `+${value.toFixed(2)}`;
  } else if (value < 0) {
    className = "tier-change-negative";
    label = value.toFixed(2);
  }

  tag.className = `tier-change-tag ${className}`;
  tag.textContent = label;
  return tag;
}

function difficultyClass(difficulty) {
  const normalized = difficulty.toLowerCase();

  if (normalized.includes("extreme")) {
    return "difficulty-extreme";
  }

  if (normalized.includes("insane")) {
    return "difficulty-insane";
  }

  if (normalized.includes("hard")) {
    return "difficulty-hard";
  }

  return "difficulty-other";
}

function openModalForItem(item) {
  const index = currentVisibleData.findIndex((entry) => entry.id === item.id);
  activeModalIndex = index >= 0 ? index : 0;
  renderModal();
  elements.modal.classList.remove("hidden");
  elements.modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  elements.modal.classList.add("hidden");
  elements.modal.setAttribute("aria-hidden", "true");
}

function renderModal() {
  if (activeModalIndex < 0 || activeModalIndex >= currentVisibleData.length) {
    return;
  }

  const item = currentVisibleData[activeModalIndex];
  elements.modalCounter.textContent = `${activeModalIndex + 1} / ${currentVisibleData.length}`;
  elements.modalDifficultyLabel.textContent = item.difficulty || "Unknown";
  elements.modalTitle.textContent = item.name;
  elements.modalCreators.textContent = item.creators ? `by ${item.creators}` : "by Unknown";
  elements.modalId.textContent = item.id ? `ID: ${item.id}` : "No level ID";
  elements.modalPlacement.textContent = item.placementDisplay || (item.placement ? `#${item.placement}` : "--");
  elements.modalTier.textContent = item.tier ? item.tier.toFixed(2) : "--";
  elements.modalYear.textContent = item.year || "--";
  elements.modalAttempts.textContent = formatNumber(item.attempts);
  elements.modalTierChange.textContent = formatTierChangeValue(item.tierChange);
  elements.modalCreatorTags.replaceChildren(...createCreatorTags(item.creators));
  elements.modalNotes.value = getNotesMap()[item.id] || "";

  applyDetailThumbnail(elements.modalThumb, item);
  applyFaceImage(elements.modalFace, item.difficulty);
  elements.modalPrev.disabled = activeModalIndex <= 0;
  elements.modalNext.disabled = activeModalIndex >= currentVisibleData.length - 1;
}

function showPreviousModalItem() {
  if (activeModalIndex > 0) {
    activeModalIndex -= 1;
    renderModal();
  }
}

function showNextModalItem() {
  if (activeModalIndex < currentVisibleData.length - 1) {
    activeModalIndex += 1;
    renderModal();
  }
}

function handleModalKeydown(event) {
  if (elements.modal.classList.contains("hidden")) {
    return;
  }

  if (event.key === "Escape") {
    closeModal();
  } else if (event.key === "ArrowLeft") {
    showPreviousModalItem();
  } else if (event.key === "ArrowRight") {
    showNextModalItem();
  }
}

function createCreatorTags(creators) {
  const creatorNames = String(creators || "")
    .split("&")
    .map((name) => name.trim())
    .filter(Boolean);

  if (!creatorNames.length) {
    return [createCreatorTag("Unknown")];
  }

  return creatorNames.map(createCreatorTag);
}

function createCreatorTag(name) {
  const tag = document.createElement("span");
  tag.className = "creator-tag";
  tag.textContent = name;
  return tag;
}

function saveActiveNotes() {
  if (activeModalIndex < 0 || activeModalIndex >= currentVisibleData.length) {
    return;
  }

  const item = currentVisibleData[activeModalIndex];
  const notes = getNotesMap();
  notes[item.id] = elements.modalNotes.value.trim();
  localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
}

function getNotesMap() {
  try {
    return JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY) || "{}");
  } catch (error) {
    return {};
  }
}

function handleSegmentClick(event) {
  const button = event.target.closest("[data-segment]");
  if (!button) {
    return;
  }

  activeSegment = button.dataset.segment;

  for (const tab of elements.segmentTabs.querySelectorAll("[data-segment]")) {
    tab.classList.toggle("is-active", tab === button);
  }

  updateListTitle();
  applyFilters();
}

function applyDetailThumbnail(image, item) {
  image.alt = `${item.name} thumbnail`;
  const candidates = buildThumbnailCandidates(item);

  if (!candidates.length) {
    image.removeAttribute("src");
    image.alt = "No thumbnail available";
    image.onerror = null;
    return;
  }

  image.src = candidates[0];
  image.onerror = tryNextThumbnailCandidate(image, candidates, 1);
}

function applyThumbnail(image, item) {
  image.alt = `${item.name} thumbnail`;
  const candidates = buildThumbnailCandidates(item);

  if (!candidates.length) {
    image.removeAttribute("src");
    image.alt = "No thumbnail available";
    image.onerror = null;
    return;
  }

  image.src = candidates[0];
  image.onerror = tryNextThumbnailCandidate(image, candidates, 1);
}

function tryNextThumbnailCandidate(image, candidates, candidateIndex) {
  return () => {
    if (candidateIndex >= candidates.length) {
      image.removeAttribute("src");
      image.alt = "No thumbnail available";
      image.onerror = null;
      return;
    }

    image.src = candidates[candidateIndex];
    image.onerror = tryNextThumbnailCandidate(image, candidates, candidateIndex + 1);
  };
}

function buildThumbnailUrl(levelId, extensionIndex = 0) {
  const extension = THUMBNAIL_EXTENSIONS[extensionIndex];
  return buildAssetUrl(THUMBNAIL_BASE_PATH, levelId, extension);
}

function buildThumbnailCandidates(item) {
  const candidates = [];
  const seen = new Set();
  const bases = [];

  if (item.id) {
    bases.push(String(item.id).trim());
  }

  if (item.name) {
    const trimmedName = String(item.name).trim();
    bases.push(trimmedName);
    bases.push(trimmedName.toLowerCase());
    bases.push(slugifyFileName(trimmedName));
  }

  for (const base of bases) {
    if (!base) {
      continue;
    }

    for (const extension of THUMBNAIL_EXTENSIONS) {
      const url = buildAssetUrl(THUMBNAIL_BASE_PATH, base, extension);
      if (!seen.has(url)) {
        seen.add(url);
        candidates.push(url);
      }
    }
  }

  return candidates;
}

function applyFaceImage(image, difficulty) {
  const difficultyKey = slugifyDifficulty(difficulty);
  image.alt = `${difficulty} face`;
  image.src = buildFaceUrl(difficultyKey, 0);
  image.onerror = tryNextFace(image, difficultyKey, 1);
}

function tryNextFace(image, difficultyKey, extensionIndex) {
  return () => {
    if (extensionIndex >= FACE_EXTENSIONS.length) {
      image.removeAttribute("src");
      image.alt = "No difficulty face available";
      image.onerror = null;
      return;
    }

    image.src = buildFaceUrl(difficultyKey, extensionIndex);
    image.onerror = tryNextFace(image, difficultyKey, extensionIndex + 1);
  };
}

function buildFaceUrl(difficultyKey, extensionIndex = 0) {
  const extension = FACE_EXTENSIONS[extensionIndex];
  return buildAssetUrl(FACE_BASE_PATH, difficultyKey, extension);
}

function slugifyDifficulty(difficulty) {
  return String(difficulty || "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function slugifyFileName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[<>:"/\\|?*]+/g, "")
    .replace(/\s+/g, "-");
}

function buildAssetUrl(basePath, fileBase, extension) {
  const safeBase = encodeURIComponent(String(fileBase || "").trim());
  return `${basePath}/${safeBase}.${extension}`;
}

function updateListTitle() {
  const titles = {
    main: "Main List",
    extended: "Extended List",
    legacy: "Legacy List",
    all: "All Demons",
  };

  elements.listTitle.textContent = titles[activeSegment] || "Demon List";
}

function setLoading(isLoading, message = "Loading demon list...") {
  elements.loadingText.textContent = message;
  elements.loadingOverlay.classList.toggle("hidden", !isLoading);
}

function formatTierChangeValue(value) {
  if (value === null || Number.isNaN(value)) {
    return "--";
  }

  if (value > 0) {
    return `+${value.toFixed(2)}`;
  }

  return value.toFixed(2);
}

function formatNumber(value) {
  return new Intl.NumberFormat().format(value);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
