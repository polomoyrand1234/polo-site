// script.js — charge links.csv et remplit les liens / playlists
const CSV_PATH = "links.csv";

function parseCSV(text) {
  // Simple CSV parser (pas besoin de guillemets complexes ici)
  const lines = text.trim().split(/\r?\n/);
  const headers = lines.shift().split(",").map(h => h.trim());
  return lines.map(line => {
    const cols = line.split(",").map(c => c.trim());
    const obj = {};
    headers.forEach((h, i) => obj[h] = cols[i] ?? "");
    return obj;
  });
}

function safeSetHref(id, url) {
  const el = document.getElementById(id);
  if (!el) return;
  el.href = url && url.startsWith("http") ? url : "#";
}

function addChip(containerId, label, url) {
  const box = document.getElementById(containerId);
  if (!box) return;
  const a = document.createElement("a");
  a.className = "chip";
  a.href = url && url.startsWith("http") ? url : "#";
  a.target = "_blank";
  a.rel = "noopener";
  a.textContent = label || "Lien";
  box.appendChild(a);
}

function addQuickLink(containerId, label, url, tag) {
  const list = document.getElementById(containerId);
  if (!list) return;

  const li = document.createElement("li");
  const a = document.createElement("a");
  a.href = url && url.startsWith("http") ? url : "#";
  a.target = "_blank";
  a.rel = "noopener";

  const left = document.createElement("span");
  left.textContent = label || "Lien";

  const right = document.createElement("small");
  right.textContent = tag || "open";

  a.appendChild(left);
  a.appendChild(right);
  li.appendChild(a);
  list.appendChild(li);
}

async function init() {
  // year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  let rows = [];
  try {
    const res = await fetch(CSV_PATH, { cache: "no-store" });
    const text = await res.text();
    rows = parseCSV(text);
  } catch (e) {
    console.warn("Impossible de charger links.csv (ouvre via un serveur local).", e);
    return;
  }

  const yt = rows.find(r => r.type === "youtube");
  const tt = rows.find(r => r.type === "tiktok");

  // Boutons sur pages dédiées
  if (yt?.url) safeSetHref("youtubeChannelBtn", yt.url);
  if (tt?.url) safeSetHref("tiktokChannelBtn", tt.url);

  // Menu: playlists en chips
  rows.filter(r => r.type === "playlist").forEach(r => {
    addChip("playlistChips", r.label, r.url);
    addChip("youtubePlaylists", r.label, r.url);
  });

  // Menu: liens rapides + TikTok extras
  rows.filter(r => r.type === "extra").forEach(r => {
    addQuickLink("quickLinks", r.label, r.url, "extra");
    addQuickLink("tiktokExtras", r.label, r.url, "extra");
  });

  // Ajout direct des 2 réseaux dans "liens rapides" si tu veux
  if (yt?.url) addQuickLink("quickLinks", yt.label || "YouTube", yt.url, "yt");
  if (tt?.url) addQuickLink("quickLinks", tt.label || "TikTok", tt.url, "tt");
}

document.addEventListener("DOMContentLoaded", init);
