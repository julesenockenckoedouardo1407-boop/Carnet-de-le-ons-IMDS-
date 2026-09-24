(function () {
  "use strict";

  const STORAGE_KEY = "carnet-lecons-entries-v1";

  /* ---------------- Storage ---------------- */

  function loadEntries() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Lecture impossible", e);
      return [];
    }
  }

  function saveEntries(entries) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      return true;
    } catch (e) {
      console.error("Écriture impossible", e);
      return false;
    }
  }

  let entries = loadEntries();
  let currentFilter = "tous";
  let currentType = "lecon"; // pour le formulaire

  /* ---------------- Navigation ---------------- */

  const tabButtons = document.querySelectorAll("nav.tabs button");
  const views = document.querySelectorAll("section.view");

  function showView(name) {
    views.forEach((v) => v.classList.toggle("active", v.id === "view-" + name));
    tabButtons.forEach((b) => b.classList.toggle("active", b.dataset.view === name));
    if (name === "feuille") populateSheetPicker();
    if (name === "accueil") renderList();
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => showView(btn.dataset.view));
  });

  /* ---------------- Rendu de la liste ---------------- */

  const listEl = document.getElementById("entries-list");
  const emptyEl = document.getElementById("empty-state");
  const filterButtons = document.querySelectorAll(".filter-row button");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentFilter = btn.dataset.filter;
      filterButtons.forEach((b) => b.classList.toggle("active", b === btn));
      renderList();
    });
  });

  function fmtDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  }

  function isLate(entry) {
    if (entry.type !== "devoir" || !entry.dateRemise || entry.devoirRemis) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(entry.dateRemise + "T00:00:00");
    return due < today;
  }

  function matchesFilter(entry) {
    if (currentFilter === "tous") return true;
    if (currentFilter === "lecons") return entry.type === "lecon";
    if (currentFilter === "devoirs") return entry.type === "devoir";
    if (currentFilter === "en-retard") return isLate(entry);
    return true;
  }

  function renderList() {
    const sorted = [...entries].sort((a, b) => {
      const da = a.dateRemise || "9999";
      const db = b.dateRemise || "9999";
      return da.localeCompare(db);
    });
    const filtered = sorted.filter(matchesFilter);

    listEl.innerHTML = "";

    if (filtered.length === 0) {
      emptyEl.style.display = "block";
      return;
    }
    emptyEl.style.display = "none";

    filtered.forEach((entry) => {
      listEl.appendChild(renderCard(entry));
    });
  }

  function badge(label, on, tone, onClick) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "status-badge" + (on ? " on " + tone : "");
    b.textContent = label;
    b.addEventListener("click", onClick);
    return b;
  }

  function renderCard(entry) {
    const card = document.createElement("div");
    card.className = "entry-card";

    const top = document.createElement("div");
    top.className = "row-top";

    const pill = document.createElement("span");
    pill.className = "type-pill" + (entry.type === "devoir" ? " devoir" : "");
    pill.textContent = entry.type === "devoir" ? "Devoir" : "Leçon";
    top.appendChild(pill);

    if (isLate(entry)) {
      const late = document.createElement("span");
      late.className = "status-badge on bad";
      late.textContent = "En retard";
      top.appendChild(late);
    }
    card.appendChild(top);

    const h3 = document.createElement("h3");
    h3.textContent = entry.livre || "(sans titre)";
    card.appendChild(h3);

    const metaPage = document.createElement("div");
    metaPage.className = "meta";
    metaPage.innerHTML = `Page : <strong>${escapeHtml(entry.page || "—")}</strong>`;
    card.appendChild(metaPage);

    const metaProf = document.createElement("div");
    metaProf.className = "meta";
    metaProf.innerHTML = `Professeur : <strong>${escapeHtml(entry.professeur || "—")}</strong> · Cours de <strong>${escapeHtml(entry.heure || "—")}</strong>`;
    card.appendChild(metaProf);

    const metaDate = document.createElement("div");
    metaDate.className = "meta";
    metaDate.innerHTML = `À remettre le : <strong>${fmtDate(entry.dateRemise)}</strong>`;
    card.appendChild(metaDate);

    if (entry.notesProf) {
      const notes = document.createElement("div");
      notes.className = "prof-notes";
      notes.textContent = "Notes du professeur : " + entry.notesProf;
      card.appendChild(notes);
    }

    const statusRow = document.createElement("div");
    statusRow.className = "status-row";

    if (entry.type === "lecon") {
      statusRow.appendChild(badge("Leçon sue", entry.leconSue, "ok", () => toggleField(entry.id, "leconSue")));
      statusRow.appendChild(badge("Leçon non sue", !entry.leconSue, "warn", () => toggleField(entry.id, "leconSue", false)));
    } else {
      statusRow.appendChild(badge("Devoir rédigé", entry.devoirRedige, "ok", () => toggleField(entry.id, "devoirRedige")));
      statusRow.appendChild(badge("Devoir remis", entry.devoirRemis, "ok", () => toggleField(entry.id, "devoirRemis")));
      statusRow.appendChild(badge("Non remis", !entry.devoirRemis, "warn", () => toggleField(entry.id, "devoirRemis", false)));
    }
    card.appendChild(statusRow);

    const bottom = document.createElement("div");
    bottom.className = "bottom-row";

    const noteField = document.createElement("div");
    noteField.className = "note-field";
    const noteInput = document.createElement("input");
    noteInput.type = "text";
    noteInput.inputMode = "decimal";
    noteInput.placeholder = "—";
    noteInput.value = entry.note || "";
    noteInput.addEventListener("change", () => {
      updateEntry(entry.id, { note: noteInput.value });
    });
    noteField.appendChild(document.createTextNode("Note : "));
    noteField.appendChild(noteInput);
    bottom.appendChild(noteField);

    const actions = document.createElement("div");
    actions.className = "card-actions";

    if (entry.type === "devoir") {
      const sheetBtn = document.createElement("button");
      sheetBtn.type = "button";
      sheetBtn.className = "icon-btn";
      sheetBtn.textContent = "Feuille";
      sheetBtn.addEventListener("click", () => {
        showView("feuille");
        document.getElementById("sheet-select").value = entry.id;
        loadSheet(entry.id);
      });
      actions.appendChild(sheetBtn);
    }

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "icon-btn danger";
    delBtn.textContent = "Supprimer";
    delBtn.addEventListener("click", () => {
      if (confirm("Supprimer cette entrée du carnet ?")) {
        entries = entries.filter((e) => e.id !== entry.id);
        saveEntries(entries);
        renderList();
      }
    });
    actions.appendChild(delBtn);

    bottom.appendChild(actions);
    card.appendChild(bottom);

    return card;
  }

  function toggleField(id, field, forceValue) {
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;
    const newVal = forceValue !== undefined ? forceValue : !entry[field];
    updateEntry(id, { [field]: newVal });
  }

  function updateEntry(id, patch) {
    entries = entries.map((e) => (e.id === id ? { ...e, ...patch } : e));
    saveEntries(entries);
    renderList();
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /* ---------------- Formulaire d'ajout ---------------- */

  const form = document.getElementById("entry-form");
  const typeToggleBtns = document.querySelectorAll(".type-toggle button");
  const formMsg = document.getElementById("form-msg");

  typeToggleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentType = btn.dataset.type;
      typeToggleBtns.forEach((b) => b.classList.toggle("active", b === btn));
      typeToggleBtns.forEach((b) => b.classList.toggle(b.dataset.type, b === btn));
      document.getElementById("field-notes-prof").style.display = "block";
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const entry = {
      id: "e" + Date.now() + Math.random().toString(36).slice(2, 7),
      type: currentType,
      livre: fd.get("livre").trim(),
      page: fd.get("page").trim(),
      dateRemise: fd.get("dateRemise"),
      professeur: fd.get("professeur").trim(),
      heure: fd.get("heure").trim(),
      notesProf: fd.get("notesProf").trim(),
      leconSue: false,
      devoirRedige: false,
      devoirRemis: false,
      note: "",
      brouillon: ""
    };
    entries.push(entry);
    saveEntries(entries);
    form.reset();
    formMsg.textContent = entry.type === "devoir" ? "Devoir ajouté au carnet ✓" : "Leçon ajoutée au carnet ✓";
    setTimeout(() => (formMsg.textContent = ""), 2500);
    showView("accueil");
  });

  /* ---------------- Feuille de mise au net ---------------- */

  const sheetSelect = document.getElementById("sheet-select");
  const sheetBody = document.getElementById("sheet-body");
  const sheetTitle = document.getElementById("sheet-title");
  const sheetMetaLivre = document.getElementById("sheet-livre");
  const sheetMetaPage = document.getElementById("sheet-page");
  const sheetMetaProf = document.getElementById("sheet-prof");
  const sheetMetaDate = document.getElementById("sheet-date");

  function populateSheetPicker() {
    const devoirs = entries.filter((e) => e.type === "devoir");
    const current = sheetSelect.value;
    sheetSelect.innerHTML = '<option value="">— Choisir un devoir —</option>';
    devoirs.forEach((d) => {
      const opt = document.createElement("option");
      opt.value = d.id;
      opt.textContent = `${d.livre || "Devoir"} (p. ${d.page || "?"}) — ${fmtDate(d.dateRemise)}`;
      sheetSelect.appendChild(opt);
    });
    if (current) sheetSelect.value = current;
  }

  sheetSelect.addEventListener("change", () => loadSheet(sheetSelect.value));

  function loadSheet(id) {
    const entry = entries.find((e) => e.id === id);
    if (!entry) {
      sheetTitle.textContent = "Feuille libre";
      sheetMetaLivre.textContent = "—";
      sheetMetaPage.textContent = "—";
      sheetMetaProf.textContent = "—";
      sheetMetaDate.textContent = "—";
      sheetBody.dataset.entryId = "";
      sheetBody.innerHTML = "";
      return;
    }
    sheetTitle.textContent = entry.livre || "Devoir";
    sheetMetaLivre.textContent = entry.livre || "—";
    sheetMetaPage.textContent = entry.page || "—";
    sheetMetaProf.textContent = entry.professeur || "—";
    sheetMetaDate.textContent = fmtDate(entry.dateRemise);
    sheetBody.dataset.entryId = entry.id;
    sheetBody.innerHTML = entry.brouillon || "";
  }

  document.getElementById("sheet-save").addEventListener("click", () => {
    const id = sheetBody.dataset.entryId;
    if (!id) {
      alert("Choisis d'abord un devoir dans la liste ci-dessus.");
      return;
    }
    updateEntry(id, { brouillon: sheetBody.innerHTML });
    const saveMsg = document.getElementById("sheet-save-msg");
    saveMsg.textContent = "Brouillon enregistré ✓";
    setTimeout(() => (saveMsg.textContent = ""), 2000);
  });

  document.getElementById("sheet-print").addEventListener("click", () => {
    window.print();
  });

  /* ---------------- Init ---------------- */

  showView("accueil");
  renderList();

  /* ---------------- Service worker ---------------- */

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch((err) => {
        console.warn("Service worker non enregistré :", err);
      });
    });
  }
})();
