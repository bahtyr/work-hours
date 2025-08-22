(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // src/elements.js
  var elements;
  var init_elements = __esm({
    "src/elements.js"() {
      elements = {
        tabs: document.getElementById("tabs"),
        hoursTable: document.getElementById("hoursTable"),
        hoursTableBody: document.getElementById("hoursTableBody"),
        summary: document.getElementById("summary"),
        // buttons
        newBtn: document.getElementById("newBtn"),
        stopBtn: document.getElementById("stopBtn"),
        toggleSummaryBtn: document.getElementById("toggleSummaryBtn"),
        runningPill: document.getElementById("runningPill"),
        //
        dayTotal: document.getElementById("dayTotal"),
        // days
        addDayBtn: document.getElementById("addDayBtn"),
        addDayInput: document.getElementById("addDayInput"),
        editDayBtn: document.getElementById("editDayBtn"),
        editDayInput: document.getElementById("editDayInput"),
        saveEditDayBtn: document.getElementById("saveEditDayBtn"),
        cancelEditDayBtn: document.getElementById("cancelEditDayBtn"),
        deleteDayBtn: document.getElementById("deleteDayBtn")
      };
    }
  });

  // src/utils.js
  function todayKey() {
    const d = /* @__PURE__ */ new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  function timeNow() {
    const d = /* @__PURE__ */ new Date();
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  function parseHM(time) {
    if (!time || !/^\d{2}:\d{2}$/.test(time)) return null;
    const [h, m] = time.split(":").map(Number);
    if (h > 23 || m > 59) return null;
    return h * 60 + m;
  }
  function fmtHM(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}:${pad(m)}`;
  }
  function findLast(arr, predicate) {
    for (let i = arr.length - 1; i >= 0; i--) {
      if (predicate(arr[i])) return arr[i];
    }
    return null;
  }
  function uid() {
    return "e" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }
  function escapeHtml(str) {
    return String(str).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  }
  function formatDayName(dateStr) {
    const today = /* @__PURE__ */ new Date();
    const date = new Date(dateStr);
    const oneDayMs = 1e3 * 60 * 60 * 24;
    const daysDiff = Math.floor((today - date) / oneDayMs);
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dayFullNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];
    const dayName = dayNames[date.getDay()];
    const dayFullName = dayFullNames[date.getDay()];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    if (daysDiff === 0) return `${month}, ${dayFullName} ${day}`;
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    if (date >= startOfWeek) {
      return dayName;
    }
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfWeek.getDate() - 7);
    if (date >= startOfLastWeek) {
      return `Last ${dayName}`;
    }
    return `${day} ${month}`;
  }
  var pad;
  var init_utils = __esm({
    "src/utils.js"() {
      pad = (n) => String(n).padStart(2, "0");
    }
  });

  // src/state.js
  function getState() {
    return state;
  }
  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }
  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  function ensureDay(day) {
    if (!state.days[day]) state.days[day] = [];
  }
  function setOpenDay(day) {
    state.openDay = day;
    ensureDay(day);
    saveState();
    renderAll();
  }
  var STORAGE_KEY, state;
  var init_state = __esm({
    "src/state.js"() {
      init_utils();
      init_render();
      STORAGE_KEY = "simpleTimesheetV3";
      state = loadState();
      if (!state.days) state.days = {};
      if (!state.openDay) state.openDay = todayKey();
      ensureDay(state.openDay);
      saveState();
    }
  });

  // src/render.js
  function renderAll(scrollBottom = false) {
    renderTabs();
    renderTable();
    renderSummary();
    updateRunningUI();
    updateDayTotal();
    if (scrollBottom) {
      elements.hoursTableBody.parentElement.scrollTop = elements.hoursTableBody.scrollHeight;
    }
  }
  function renderTabs() {
    const today = todayKey();
    const allDays = new Set(Object.keys(state2.days || {}));
    allDays.add(today);
    const otherDays = Array.from(allDays).filter((d) => d !== today).sort((a, b) => b.localeCompare(a));
    const orderedDays = [today, ...otherDays];
    elements.tabs.innerHTML = "";
    orderedDays.forEach((day) => {
      const tabEl = document.createElement("div");
      tabEl.className = "tab" + (day === state2.openDay ? " active" : "");
      tabEl.textContent = formatDayName(day);
      tabEl.title = day;
      tabEl.addEventListener("click", () => setOpenDay(day));
      elements.tabs.appendChild(tabEl);
    });
  }
  function renderTable() {
    const entries = state2.days[state2.openDay] || [];
    elements.hoursTableBody.innerHTML = "";
    entries.forEach((entry, index) => {
      const row = createTableRow(entry, index, entries);
      elements.hoursTableBody.appendChild(row);
    });
  }
  function createTableRow(entry, index, entries) {
    const tr = document.createElement("tr");
    tr.draggable = true;
    tr.className = "draggable";
    tr.ondragstart = (ev) => {
      ev.dataTransfer.setData("text/plain", index);
    };
    tr.ondragover = (ev) => ev.preventDefault();
    tr.ondrop = (ev) => {
      ev.preventDefault();
      const from = +ev.dataTransfer.getData("text/plain");
      const to = index;
      if (from !== to) {
        const item = entries.splice(from, 1)[0];
        entries.splice(to, 0, item);
        saveState();
        renderAll();
      }
    };
    tr.appendChild(createTimeCell(entry, "start"));
    tr.appendChild(createTimeCell(entry, "end"));
    tr.appendChild(createDescriptionCell(entry));
    tr.appendChild(createDeleteCell(index, entries));
    return tr;
  }
  function createTimeCell(entry, field) {
    const td = document.createElement("td");
    const input = document.createElement("input");
    input.type = "time";
    input.step = 60;
    input.value = entry[field] || "";
    input.oninput = () => {
      entry[field] = input.value;
      saveState();
      renderSummary();
      updateDayTotal();
    };
    td.appendChild(input);
    return td;
  }
  function createDescriptionCell(entry) {
    const td = document.createElement("td");
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Description";
    input.value = entry.desc || "";
    input.oninput = () => {
      entry.desc = input.value;
      saveState();
      renderSummary();
    };
    td.appendChild(input);
    return td;
  }
  function createDeleteCell(index, entries) {
    const td = document.createElement("td");
    td.style.textAlign = "center";
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-entry-button";
    deleteBtn.textContent = "x";
    deleteBtn.onclick = () => {
      if (confirm("Delete this entry?")) {
        entries.splice(index, 1);
        saveState();
        renderAll();
      }
    };
    td.appendChild(deleteBtn);
    return td;
  }
  function renderSummary() {
    const entries = state2.days[state2.openDay] || [];
    const totals = /* @__PURE__ */ new Map();
    for (const entry of entries) {
      const start = parseHM(entry.start);
      const end = parseHM(entry.end);
      if (start !== null && end !== null && end >= start) {
        const minutes = end - start;
        const key = entry.desc || "(no description)";
        totals.set(key, (totals.get(key) || 0) + minutes);
      }
    }
    if (totals.size === 0) {
      elements.summary.innerHTML = '<div class="muted">Summary will appear here for completed entries.</div>';
      return;
    }
    let html = '<table style="width:100%;"><thead><tr><th style="text-align: right;">Total (h:mm)</th><th style="">Description</th></tr></thead><tbody>';
    [...totals.entries()].sort((a, b) => a[0].localeCompare(b[0])).forEach(([desc, minutes]) => {
      html += `<tr><td style="text-align: right;">${fmtHM(minutes)}</td><td>${escapeHtml(desc)}</td></tr>`;
    });
    html += "</tbody></table>";
    elements.summary.innerHTML = html;
  }
  function updateRunningUI() {
    const entries = state2.days[state2.openDay] || [];
    const running = findLast(entries, (e) => e.start && !e.end);
    elements.runningPill.style.display = running ? "inline-flex" : "none";
  }
  function updateDayTotal() {
    const entries = state2.days[state2.openDay] || [];
    let totalMinutes = 0;
    for (const entry of entries) {
      const start = parseHM(entry.start);
      const end = parseHM(entry.end);
      if (start !== null && end !== null && end >= start) {
        totalMinutes += end - start;
      }
    }
    elements.dayTotal.textContent = totalMinutes ? `Day total: ${fmtHM(totalMinutes)}` : "";
  }
  function focusLastDescription() {
    const inputs = elements.hoursTableBody.querySelectorAll('input[type="text"]');
    if (inputs.length) {
      inputs[inputs.length - 1].focus();
    }
  }
  var state2;
  var init_render = __esm({
    "src/render.js"() {
      init_elements();
      init_state();
      init_utils();
      state2 = getState();
    }
  });

  // src/events.js
  function onNew() {
    const entries = state3.days[state3.openDay];
    const running = findLast(entries, (e) => e.start && !e.end);
    if (running) running.end = timeNow();
    entries.push({ id: uid(), start: timeNow(), end: "", desc: "" });
    saveState();
    renderAll(true);
    focusLastDescription();
  }
  function onStop() {
    const entries = state3.days[state3.openDay];
    const running = findLast(entries, (e) => e.start && !e.end);
    if (running && !running.end) {
      running.end = timeNow();
      saveState();
      renderAll();
    }
  }
  function onAddDay() {
    if (elements.addDayInput.value) {
      setOpenDay(elements.addDayInput.value);
      elements.addDayInput.value = "";
    }
  }
  function onEditDay() {
    elements.editDayInput.value = state3.openDay;
    elements.editDayInput.style.display = "inline-block";
    elements.saveEditDayBtn.style.display = "inline-block";
    elements.cancelEditDayBtn.style.display = "inline-block";
    elements.editDayInput.focus();
  }
  function onCancelEditDay() {
    elements.editDayInput.style.display = "none";
    elements.saveEditDayBtn.style.display = "none";
    elements.cancelEditDayBtn.style.display = "none";
  }
  function onSaveEditDay() {
    const newDate = elements.editDayInput.value;
    const oldDate = state3.openDay;
    if (!newDate) {
      alert("Pick a valid date");
      return;
    }
    if (newDate === oldDate) {
      onCancelEditDay();
      return;
    }
    if (state3.days[newDate]) {
      if (!confirm("Target day already exists. Merge current entries into that day?")) {
        return;
      }
      state3.days[newDate] = (state3.days[newDate] || []).concat(state3.days[oldDate]);
    } else {
      state3.days[newDate] = state3.days[oldDate];
    }
    delete state3.days[oldDate];
    state3.openDay = newDate;
    saveState();
    renderAll();
    onCancelEditDay();
  }
  function onDeleteDay() {
    if (!confirm("Delete all entries for this day? This cannot be undone.")) {
      return;
    }
    delete state3.days[state3.openDay];
    state3.openDay = todayKey();
    ensureDay(state3.openDay);
    saveState();
    renderAll();
  }
  function toggleSummary() {
    elements.hoursTable.classList.toggle("hidden");
    elements.summary.classList.toggle("hidden");
  }
  var state3;
  var init_events = __esm({
    "src/events.js"() {
      init_state();
      init_utils();
      init_elements();
      init_render();
      state3 = getState();
    }
  });

  // src/main.js
  var require_main = __commonJS({
    "src/main.js"() {
      init_elements();
      init_render();
      init_events();
      elements.newBtn.addEventListener("click", onNew);
      elements.stopBtn.addEventListener("click", onStop);
      elements.toggleSummaryBtn.addEventListener("click", toggleSummary);
      elements.addDayBtn.addEventListener("click", onAddDay);
      elements.editDayBtn.addEventListener("click", onEditDay);
      elements.cancelEditDayBtn.addEventListener("click", onCancelEditDay);
      elements.saveEditDayBtn.addEventListener("click", onSaveEditDay);
      elements.deleteDayBtn.addEventListener("click", onDeleteDay);
      renderAll();
    }
  });
  require_main();
})();
//# sourceMappingURL=bundle.js.map
