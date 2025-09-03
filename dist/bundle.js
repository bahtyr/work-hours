(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // src/elements.js
  var elements, locators;
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
        workTime: document.querySelector(".work-time .number"),
        breakTime: document.querySelector(".break-time .number"),
        totalTimeLeft: document.querySelector(".total-time-left .number"),
        ticketsCount: document.querySelector(".tickets-count .number"),
        ticketsCountLabel: document.querySelector(".tickets-count .label"),
        // hours-summary timeline
        timelineOther: document.querySelector(".timeline .other"),
        timelineTicket: document.querySelector(".timeline .ticket"),
        timelineBreak: document.querySelector(".timeline .break"),
        timelineMeeting: document.querySelector(".timeline .meeting"),
        // buttons
        toggleSummaryBtn: document.getElementById("toggleSummaryBtn"),
        // days
        addDayBtn: document.getElementById("addDayBtn"),
        addDayInput: document.getElementById("addDayInput"),
        editDayBtn: document.getElementById("editDayBtn"),
        editDayInput: document.getElementById("editDayInput"),
        saveEditDayBtn: document.getElementById("saveEditDayBtn"),
        cancelEditDayBtn: document.getElementById("cancelEditDayBtn"),
        deleteDayBtn: document.getElementById("deleteDayBtn")
      };
      locators = {
        entryTime: '#hoursTable input[type="time"]',
        entryDescription: "#hoursTable input.description:not([disabled])",
        entryTypeBtn: "button.action.type",
        entryDeleteBtn: "button.action.delete"
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
  function focusLastDescription() {
    const inputs = elements.hoursTableBody.querySelectorAll(locators.entryDescription);
    if (inputs.length) {
      inputs[inputs.length - 1].focus();
    }
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
    if (!desc) return null;
    return desc.match(/\b[a-zA-Z]+-\d+\b/);
  }
  function identifyTicketType(desc) {
    if (!desc) return 0;
    if (findTicketNumber(desc)) return 1;
    if (desc.includes("meet")) return 2;
    if (desc.includes("call")) return 2;
    if (desc.includes("ask")) return 2;
    if (desc.includes("msg")) return 2;
    if (desc.includes("message")) return 2;
    if (desc.includes("ara")) return 3;
    if (desc.includes("break")) return 3;
    if (desc.includes("lunch")) return 3;
    return 0;
  }
  var pad;
  var init_utils = __esm({
    "src/utils.js"() {
      init_elements();
      pad = (n) => String(n).padStart(2, "0");
    }
  });

  // src/state.js
  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }
  function getState() {
    return state;
  }
  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  function initDay(day) {
    if (!state.days[day]) state.days[day] = [];
  }
  function setOpenDay(day) {
    state.openDay = day;
    initDay(day);
    saveState();
  }
  var STORAGE_KEY, state;
  var init_state = __esm({
    "src/state.js"() {
      init_utils();
      STORAGE_KEY = "simpleTimesheetV3";
      state = loadState();
      if (!state.days) state.days = {};
      if (!state.openDay) state.openDay = todayKey();
      initDay(state.openDay);
      saveState();
    }
  });

  // src/render.js
  function renderAll(scrollBottom = false) {
    renderTabs();
    renderHoursTable();
    updateDayTotal();
    renderSummary();
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
      tabEl.addEventListener("click", () => {
        setOpenDay(day);
        renderAll();
      });
      elements.tabs.appendChild(tabEl);
    });
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
    elements.workTime.textContent = formatMinutes(minutes.total - minutes.break);
    elements.totalTimeLeft.textContent = formatMinutes(8 * 60 - minutes.total);
    elements.breakTime.textContent = formatMinutes(minutes.break);
    elements.ticketsCount.textContent = uniqueTickets.size + "";
    elements.ticketsCountLabel.textContent = uniqueTickets.size === 1 ? "ticket" : "tickets";
    const maxDayMinutes = 8 * 60;
    elements.timelineOther.style.width = minutes.other / maxDayMinutes * 100 + "%";
    elements.timelineTicket.style.width = minutes.ticket / maxDayMinutes * 100 + "%";
    elements.timelineBreak.style.width = minutes.break / maxDayMinutes * 100 + "%";
    elements.timelineMeeting.style.width = minutes.meeting / maxDayMinutes * 100 + "%";
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
  function renderHoursTable() {
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
  function createTypeCell(entry) {
    const td = document.createElement("td");
    const btn = document.createElement("button");
    btn.classList.add("action");
    btn.classList.add("bigger");
    btn.classList.add("type");
    btn.classList.add("type-" + entry.type);
    btn.textContent = types[entry.type].emoji;
    btn.onclick = () => {
      btn.classList.remove("type-" + entry.type);
      entry.type = (entry.type + 1) % types.length;
      btn.textContent = types[entry.type].emoji;
      btn.classList.add("type-" + entry.type);
      saveState();
      updateDayTotal();
    };
    td.appendChild(btn);
    return td;
  }
  function createDescriptionCell(entry) {
    const td = document.createElement("td");
    const input = document.createElement("input");
    input.classList.add("description");
    input.type = "text";
    input.placeholder = entry.type && entry.type === 3 ? "Break" : "Description";
    input.value = entry.desc || "";
    input.oninput = () => {
      entry.desc = input.value;
      const identifiedType = identifyTicketType(entry.desc);
      const row = input.closest("tr");
      const btn = row.querySelector(locators.entryTypeBtn);
      btn.textContent = types[identifiedType].emoji;
      entry.type = identifiedType;
      updateDayTotal();
      saveState();
    };
    input.addEventListener("keydown", (e) => {
      if ((e.key === "Backspace" || e.key === "Delete") && input.value === "") {
        const row = input.closest("tr");
        const btn = row.querySelector(locators.entryDeleteBtn);
        btn.click();
      }
    });
    td.appendChild(input);
    return td;
  }
  function createDeleteCell(index, entries) {
    const td = document.createElement("td");
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("action", "delete");
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
  function newEntry(start, end, desc, type) {
    return {
      id: uid(),
      start,
      end,
      desc,
      type
    };
  }
  function startNow() {
    const entries = state3.days[state3.openDay];
    entries.push(newEntry(timeNow(), "", "", 0));
    saveState();
    renderAll(true);
    focusLastDescription();
  }
  function startSinceLast() {
    const entries = state3.days[state3.openDay];
    const lastEntry = entries[entries.length - 1];
    if (lastEntry && lastEntry.end) {
      const lastEnd = parseHM(lastEntry.end);
      const nowHM = parseHM(timeNow());
      if (nowHM >= lastEnd) {
        entries.push(newEntry(lastEntry.end, "", "", 3));
        saveState();
        renderAll(true);
        focusLastDescription();
      }
    }
  }
  function stopLast() {
    const entries = state3.days[state3.openDay];
    const running = findLast(entries, (e) => e.start && !e.end);
    if (running && !running.end) {
      running.end = timeNow();
      saveState();
      renderAll(true);
      return true;
    }
    return false;
  }
  function handleArrowNavigation(e, active) {
    const inputs = Array.from(document.querySelectorAll(locators.entryDescription));
    if (inputs.length === 0) return;
    let index = inputs.indexOf(active);
    if (index === -1) {
      inputs[inputs.length - 1].focus();
      e.preventDefault();
      return;
    }
    if (e.key === "ArrowUp" && index > 0) {
      inputs[index - 1].focus();
      e.preventDefault();
    } else if (e.key === "ArrowDown" && index < inputs.length - 1) {
      inputs[index + 1].focus();
      e.preventDefault();
    }
  }
  function handleTimeNavigation(e, active) {
    const inputs = Array.from(document.querySelectorAll(locators.entryTime));
    if (inputs.length === 0) return;
    let index = inputs.indexOf(active);
    if (index === -1) {
      inputs[0].focus();
      e.preventDefault();
      return;
    }
    const movePrev = e.shiftKey && e.key === "Tab";
    const moveNext = !e.shiftKey && e.key === "Tab";
    if (movePrev && index > 0) {
      inputs[index - 1].focus();
      e.preventDefault();
    } else if (moveNext && index < inputs.length - 1) {
      inputs[index + 1].focus();
      e.preventDefault();
    }
  }
  function onDocumentKeyDown(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const active = document.activeElement;
    const focusedOnInput = active && active.tagName === "INPUT";
    const focusedOnTime = focusedOnInput && active.type === "time";
    const focusedOnText = focusedOnInput && active.type === "text";
    if (focusedOnInput && (e.key === "Enter" || e.key === "Escape")) {
      active.blur();
      return;
    }
    if (!focusedOnInput && e.key === "Enter") {
      if (!stopLast()) {
        startNow();
        return;
      }
    }
    if (!focusedOnInput && e.key === " ") {
      if (!stopLast()) {
        e.preventDefault();
        startSinceLast();
        return;
      }
    }
    if (!focusedOnTime && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
      handleArrowNavigation(e, active);
      return;
    }
    if (focusedOnTime && e.key === "Tab") {
      console.log("asdf");
      handleTimeNavigation(e, active);
      return;
    }
    if (focusedOnTime && e.key === "Backspace") {
      if (active.value.trim() === "") {
        e.preventDefault();
        active.value = "";
        active.blur();
        active.focus();
      }
    }
  }
  var state3;
  var init_events = __esm({
    "src/events.js"() {
      init_state();
      init_utils();
      init_render();
      init_elements();
      state3 = getState();
    }
  });

  // src/events_days.js
  function toggleSummary() {
    renderSummary();
    elements.hoursTable.classList.toggle("hidden");
    elements.summary.classList.toggle("hidden");
  }
  function onAddDay() {
    if (elements.addDayInput.value) {
      setOpenDay(elements.addDayInput.value);
      renderAll();
      elements.addDayInput.value = "";
    }
  }
  function onEditDay() {
    elements.editDayInput.value = state4.openDay;
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
    const oldDate = state4.openDay;
    if (!newDate) {
      alert("Pick a valid date");
      return;
    }
    if (newDate === oldDate) {
      onCancelEditDay();
      return;
    }
    if (state4.days[newDate]) {
      if (!confirm("Target day already exists. Merge current entries into that day?")) {
        return;
      }
      state4.days[newDate] = (state4.days[newDate] || []).concat(state4.days[oldDate]);
    } else {
      state4.days[newDate] = state4.days[oldDate];
    }
    delete state4.days[oldDate];
    state4.openDay = newDate;
    saveState();
    renderAll();
    onCancelEditDay();
  }
  function onDeleteDay() {
    if (!confirm("Delete all entries for this day? This cannot be undone.")) {
      return;
    }
    delete state4.days[state4.openDay];
    setOpenDay(todayKey());
    renderAll();
  }
  var state4;
  var init_events_days = __esm({
    "src/events_days.js"() {
      init_elements();
      init_state();
      init_render();
      init_utils();
      state4 = getState();
    }
  });

  // src/main.js
  var require_main = __commonJS({
    "src/main.js"() {
      init_elements();
      init_render();
      init_events();
      init_events_days();
      elements.toggleSummaryBtn.addEventListener("click", toggleSummary);
      elements.addDayBtn.addEventListener("click", onAddDay);
      elements.editDayBtn.addEventListener("click", onEditDay);
      elements.cancelEditDayBtn.addEventListener("click", onCancelEditDay);
      elements.saveEditDayBtn.addEventListener("click", onSaveEditDay);
      elements.deleteDayBtn.addEventListener("click", onDeleteDay);
      document.addEventListener("keydown", onDocumentKeyDown);
      renderAll();
    }
  });
  require_main();
})();
//# sourceMappingURL=bundle.js.map
