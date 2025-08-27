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
        // tabs
        tabs: document.getElementById("tabs"),
        // tables
        hoursTable: document.getElementById("hoursTable"),
        hoursTableBody: document.getElementById("hoursTableBody"),
        summary: document.getElementById("summary"),
        // hours-summary
        hoursLogged: document.querySelector(".hours-logged .number"),
        hoursLeft: document.querySelector(".hours-left .number"),
        breakTime: document.querySelector(".break-time .number"),
        ticketsCount: document.querySelector(".tickets-count .number"),
        ticketsCountLabel: document.querySelector(".tickets-count .label"),
        hoursTimeline: document.querySelector(".timeline .done"),
        hoursTimelineHighlight: document.querySelector(".timeline .highlight"),
        hoursTimelineBreak: document.querySelector(".timeline .break"),
        hoursTimelineMeeting: document.querySelector(".timeline .meeting"),
        // buttons
        newBtn: document.getElementById("newBtn"),
        stopBtn: document.getElementById("stopBtn"),
        toggleSummaryBtn: document.getElementById("toggleSummaryBtn"),
        runningPill: document.getElementById("runningPill"),
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
  function uid() {
    return "e" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }
  function todayKey() {
    const d = /* @__PURE__ */ new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  function findLast(arr, predicate) {
    for (let i = arr.length - 1; i >= 0; i--) {
      if (predicate(arr[i])) return arr[i];
    }
    return null;
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
  function formatMinutes(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) {
      return `${h}h ${m}m`;
    }
    return `${m}m`;
  }
  function formatDayName(dateStr) {
    const [year, monthNum, dayNum] = dateStr.split("-").map(Number);
    const date = new Date(year, monthNum - 1, dayNum);
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const oneDayMs = 1e3 * 60 * 60 * 24;
    const daysDiff = Math.round((today - date) / oneDayMs);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayFullNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dayName = dayNames[date.getDay()];
    const dayFullName = dayFullNames[date.getDay()];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    if (daysDiff === 0) return `${dayFullName}, ${month} ${day}`;
    const startOfWeek = new Date(today);
    const dayIndex = today.getDay() || 7;
    startOfWeek.setDate(today.getDate() - (dayIndex - 1));
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
  function escapeHtml(str) {
    return String(str).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  }
  function findTicketNumber(desc) {
    return desc.match(/\b[a-zA-Z]+-\d+\b/);
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
    updateDayTotal();
    renderSummary();
    updateRunningUI();
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
    const tbody = elements.hoursTableBody;
    tbody.innerHTML = "";
    gapRows.clear();
    entries.forEach((entry, index) => {
      const row = createTableRow(entry, index, entries);
      tbody.appendChild(row);
      if (index > 0) updateGapAfter(entries[index - 1]);
    });
  }
  function createTableRow(entry, index, entries) {
    const tr = document.createElement("tr");
    tr.dataset.entryId = entry.id;
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
    const durationCell = createDurationCell();
    const startCell = createTimeCell(entry, "start", () => updateDurationCell(entry, durationCell));
    const endCell = createTimeCell(entry, "end", () => updateDurationCell(entry, durationCell));
    tr.appendChild(startCell);
    tr.appendChild(endCell);
    tr.appendChild(durationCell);
    tr.appendChild(createTypeCell(entry));
    tr.appendChild(createDescriptionCell(entry));
    tr.appendChild(createDeleteCell(index, entries));
    tr.appendChild(createDragHandleCell(index));
    updateDurationCell(entry, durationCell);
    return tr;
  }
  function createTimeCell(entry, field, onChange) {
    const td = document.createElement("td");
    const input = document.createElement("input");
    input.type = "time";
    input.step = 60;
    input.value = entry[field] || "";
    input.oninput = () => {
      entry[field] = input.value;
      saveState();
      updateDayTotal();
      const entries = state2.days[state2.openDay] || [];
      const index = entries.indexOf(entry);
      if (index > 0) updateGapAfter(entries[index - 1]);
      updateGapAfter(entry);
      if (onChange) onChange();
    };
    td.appendChild(input);
    return td;
  }
  function createDurationCell() {
    const td = document.createElement("td");
    td.textContent = "-";
    return td;
  }
  function updateDurationCell(entry, td) {
    if (entry.start && entry.end) {
      const start = parseHM(entry.start);
      const end = parseHM(entry.end);
      const minutes = end - start;
      if (minutes === 0)
        td.textContent = "";
      else td.textContent = formatMinutes(minutes);
    } else {
      td.textContent = "";
    }
  }
  function createDescriptionCell(entry) {
    const td = document.createElement("td");
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = entry.type && entry.type === 3 ? "Break" : "Description";
    input.value = entry.desc || "";
    input.oninput = () => {
      entry.desc = input.value;
      const ticketMatch = findTicketNumber(entry.desc);
      if (ticketMatch) {
        const row = input.closest("tr");
        const btn = row.querySelector("button.action.type");
        btn.textContent = types[1].emoji;
        entry.type = 1;
        updateDayTotal();
      }
      saveState();
    };
    td.appendChild(input);
    return td;
  }
  function createTypeCell(entry) {
    const td = document.createElement("td");
    const btn = document.createElement("button");
    btn.classList.add("action");
    btn.classList.add("bigger");
    btn.classList.add("type");
    if (typeof entry.type !== "number") {
      entry.type = 0;
    }
    btn.textContent = types[entry.type].emoji;
    btn.onclick = () => {
      entry.type = (entry.type + 1) % types.length;
      btn.textContent = types[entry.type].emoji;
      saveState();
      updateDayTotal();
    };
    td.appendChild(btn);
    return td;
  }
  function createDeleteCell(index, entries) {
    const td = document.createElement("td");
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("action");
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
  function createDragHandleCell(index) {
    const td = document.createElement("td");
    const handle = document.createElement("span");
    handle.classList.add("action");
    handle.textContent = "\u2630";
    handle.draggable = true;
    handle.ondragstart = (ev) => {
      ev.dataTransfer.setData("text/plain", index);
      const tr = handle.closest("tr");
      const dragClone = tr.cloneNode(true);
      dragClone.style.position = "absolute";
      dragClone.style.top = "-9999px";
      document.body.appendChild(dragClone);
      ev.dataTransfer.setDragImage(dragClone, 0, 0);
      setTimeout(() => document.body.removeChild(dragClone), 0);
    };
    td.appendChild(handle);
    return td;
  }
  function createGapRow(minutes, isOverlap = false) {
    const tr = document.createElement("tr");
    tr.classList.add("gap-row");
    tr.appendChild(document.createElement("td"));
    tr.appendChild(document.createElement("td"));
    const duration = document.createElement("td");
    duration.textContent = `${formatMinutes(minutes)}`;
    tr.appendChild(duration);
    tr.appendChild(document.createElement("td"));
    const desc = document.createElement("td");
    const descInput = document.createElement("input");
    desc.colSpan = 3;
    descInput.type = "text";
    descInput.value = `${isOverlap ? "Overlap" : "Gap"}`;
    descInput.disabled = true;
    desc.appendChild(descInput);
    tr.appendChild(desc);
    return tr;
  }
  function updateGapAfter(prevEntry) {
    const entries = state2.days[state2.openDay] || [];
    const tbody = elements.hoursTableBody;
    const index = entries.indexOf(prevEntry);
    if (index === -1) return;
    const nextEntry = entries[index + 1];
    if (gapRows.has(prevEntry.id)) {
      gapRows.get(prevEntry.id).remove();
      gapRows.delete(prevEntry.id);
    }
    if (nextEntry && prevEntry.end && nextEntry.start) {
      const prevEnd = parseHM(prevEntry.end);
      const nextStart = parseHM(nextEntry.start);
      const diff = nextStart - prevEnd;
      if (diff !== 0) {
        const gapRow = createGapRow(Math.abs(diff), diff < 0);
        gapRows.set(prevEntry.id, gapRow);
        const prevRow = tbody.querySelector(`tr[data-entry-id="${prevEntry.id}"]`);
        if (prevRow) {
          tbody.insertBefore(gapRow, prevRow.nextSibling);
        }
      }
    }
  }
  function renderSummary() {
    const entries = state2.days[state2.openDay] || [];
    const grouped = [];
    for (const entry of entries) {
      const start = parseHM(entry.start);
      const end = parseHM(entry.end);
      if (start === null || end === null || end < start) continue;
      const minutes = end - start;
      const entryDesc = entry.desc || "(no description)";
      const entryType = entry.type ?? 0;
      const ticketMatch = findTicketNumber(entryDesc);
      let key, desc;
      if (!ticketMatch) {
        key = entryDesc;
        desc = null;
      } else {
        const ticketKey = ticketMatch[0].toUpperCase();
        const ticketDesc = entryDesc.replace(ticketMatch[0], "").trim();
        key = ticketKey;
        desc = ticketDesc || null;
      }
      let group = grouped.find((g) => g.type === entryType && g.key === key);
      if (!group) {
        group = { type: entryType, key, minutes: 0, descs: /* @__PURE__ */ new Set() };
        grouped.push(group);
      }
      group.minutes += minutes;
      if (desc) group.descs.add(desc);
    }
    if (grouped.length === 0) {
      elements.summary.innerHTML = '<div class="muted">Summary will appear here for completed entries.</div>';
      return;
    }
    const typeOrder = {
      0: 2,
      // work
      1: 0,
      // ticket
      2: 1,
      // meet
      3: 3
      // break
    };
    grouped.sort((a, b) => {
      const orderA = typeOrder[a.type] ?? 999;
      const orderB = typeOrder[b.type] ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return a.key.localeCompare(b.key);
    });
    let html = `
        <table id="summaryTable">
            <thead>
                <tr>
                    <th style="width:110px;"></th>
                    <th style="width:110px;"></th>
                    <th style="width:64px;">Duration</th>
                    <th style="width:14px;">Type</th>
                    <th>Description</th>
                    <th style="width:64px;"></th>
                    <th style="width:64px;"></th>
                </tr>
            </thead>
            <tbody>
    `;
    for (const g of grouped) {
      let description = g.key;
      if (g.descs.size > 0) {
        description += " - " + [...g.descs].join(", ");
      }
      html += `
            <tr disabled="true">
                <td><input type="time" step="60" style="visibility: hidden"></td>
                <td><input type="time" step="60" style="visibility: hidden"></td>
                <td>${formatMinutes(g.minutes)}</td>
                <td><button class="action bigger type" disabled>${types[g.type]?.emoji || ""}</button></td>
                <td><input type="text" value="${escapeHtml(description)}" disabled/></td>
                <td></td>
                <td></td>
            </tr>
        `;
    }
    html += "</tbody></table>";
    elements.summary.innerHTML = html;
  }
  function updateDayTotal() {
    const entries = state2.days[state2.openDay] || [];
    const minutes = { ticket: 0, meeting: 0, break: 0, other: 0, total: 0 };
    const uniqueTickets = /* @__PURE__ */ new Set();
    for (const entry of entries) {
      const start = parseHM(entry.start);
      const end = parseHM(entry.end);
      if (start !== null && end !== null && end >= start) {
        const duration = end - start;
        const ticketMatch = findTicketNumber(entry.desc);
        if (entry.type === 1 || ticketMatch) {
          uniqueTickets.add(ticketMatch ? ticketMatch[0] : "(no ticket number)");
          minutes.ticket += duration;
        } else if (entry.type === 2)
          minutes.meeting += duration;
        else if (entry.type === 3)
          minutes.break += duration;
        else minutes.other += duration;
      }
    }
    minutes.total = minutes.ticket + minutes.meeting + minutes.break + minutes.other;
    elements.hoursLogged.textContent = formatMinutes(minutes.total);
    elements.hoursLeft.textContent = formatMinutes(8 * 60 - minutes.total);
    elements.breakTime.textContent = formatMinutes(minutes.break);
    elements.ticketsCount.textContent = uniqueTickets.size + "";
    elements.ticketsCountLabel.textContent = uniqueTickets.size === 1 ? "ticket" : "tickets";
    const maxDayMinutes = 8 * 60;
    elements.hoursTimeline.style.width = minutes.other / maxDayMinutes * 100 + "%";
    elements.hoursTimelineHighlight.style.width = minutes.ticket / maxDayMinutes * 100 + "%";
    elements.hoursTimelineBreak.style.width = minutes.break / maxDayMinutes * 100 + "%";
    elements.hoursTimelineMeeting.style.width = minutes.meeting / maxDayMinutes * 100 + "%";
  }
  function updateRunningUI() {
    const entries = state2.days[state2.openDay] || [];
    const running = findLast(entries, (e) => e.start && !e.end);
    elements.runningPill.style.display = running ? "inline-flex" : "none";
  }
  function focusLastDescription() {
    const inputs = elements.hoursTableBody.querySelectorAll('input[type="text"]');
    if (inputs.length) {
      inputs[inputs.length - 1].focus();
    }
  }
  var state2, gapRows, types;
  var init_render = __esm({
    "src/render.js"() {
      init_elements();
      init_state();
      init_utils();
      state2 = getState();
      gapRows = /* @__PURE__ */ new Map();
      types = [
        { label: "Work", emoji: "\u{1F4C4}" },
        { label: "Ticket", emoji: "\u{1F4D8}\uFE0F" },
        { label: "Meeting", emoji: "\u{1F4DE}" },
        { label: "Break", emoji: "\u{1F9CB}" }
      ];
    }
  });

  // src/events.js
  function onNew() {
    const entries = state3.days[state3.openDay];
    const running = findLast(entries, (e) => e.start && !e.end);
    if (running) running.end = timeNow();
    const lastEntry = entries[entries.length - 1];
    if (lastEntry && lastEntry.end) {
      const lastEnd = parseHM(lastEntry.end);
      const nowHM = parseHM(timeNow());
      if (nowHM > lastEnd) {
        entries.push({
          id: uid(),
          start: lastEntry.end,
          end: timeNow(),
          desc: "",
          type: 3
        });
      }
    }
    entries.push({
      id: uid(),
      start: timeNow(),
      end: "",
      desc: "",
      ticket() {
        const ticketMatch = this.desc.match(/\b[a-zA-Z]+-\d+\b/);
        return ticketMatch ? ticketMatch[0] : null;
      },
      type: "entry"
      // entry, gap, ticket, meeting ??
    });
    saveState();
    renderAll(true);
    focusLastDescription();
  }
  function onStop() {
    const entries = state3.days[state3.openDay];
    const running = findLast(entries, (e) => e.start && !e.end);
    if (running && !running.end) {
      running.end = timeNow();
      entries.push({
        id: uid(),
        start: timeNow(),
        end: "",
        desc: "",
        type: 3
      });
      saveState();
      renderAll(true);
      focusLastDescription();
    }
  }
  function toggleSummary() {
    renderSummary();
    elements.hoursTable.classList.toggle("hidden");
    elements.summary.classList.toggle("hidden");
    elements.newBtn.disabled = !elements.newBtn.disabled;
    elements.stopBtn.disabled = !elements.stopBtn.disabled;
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
