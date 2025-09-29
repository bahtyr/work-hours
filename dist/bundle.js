(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // src/constants.js
  var elements, locators, types;
  var init_constants = __esm({
    "src/constants.js"() {
      elements = {
        // tabs
        tabs: document.getElementById("tabs"),
        // tables
        hoursTable: document.getElementById("hoursTable"),
        hoursTableBody: document.getElementById("hoursTableBody"),
        summary: document.getElementById("summary"),
        summaryTable: document.getElementById("summaryTable"),
        summaryTableBody: document.getElementById("summaryTableBody"),
        summaryRowTemplate: document.getElementById("summaryRowTemplate"),
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
        toggleSummaryBtn: document.getElementById("toggleSummaryBtn")
      };
      locators = {
        entryTime: '#hoursTable input[type="time"]',
        entryDescription: "#hoursTable input.description",
        entryTypeBtn: "button.action.type",
        entryDeleteBtn: "button.action.delete",
        fieldDuration: '[data-field="duration"]',
        fieldDescription: '[data-field="desc"]',
        fieldType: '[data-field="type"]'
      };
      types = [
        { priority: 2, label: "Work", emoji: "\u2800\n", keywords: [] },
        // everything else
        { priority: 0, label: "Ticket", emoji: "\u{1F4D8}\uFE0F", keywords: [] },
        // identified by ticket regex
        { priority: 1, label: "Meeting", emoji: "\u{1F4DE}", keywords: ["meet", "call", "ask", "msg", "message"] },
        { priority: 3, label: "Break", emoji: "\u{1F9CB}", keywords: ["ara", "break", "lunch"] }
      ];
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
  function roundHM(value) {
    if (!value) return value;
    const stepSeconds = 300;
    const parts = value.split(":").map(Number);
    let [h, m, s = 0] = parts;
    let totalSeconds = h * 3600 + m * 60 + s;
    let rounded = Math.round(totalSeconds / stepSeconds) * stepSeconds;
    rounded = Math.max(0, Math.min(24 * 3600 - 1, rounded));
    const hh = String(Math.floor(rounded / 3600)).padStart(2, "0");
    const mm = String(Math.floor(rounded % 3600 / 60)).padStart(2, "0");
    const ss = String(rounded % 60).padStart(2, "0");
    return stepSeconds >= 60 ? `${hh}:${mm}` : `${hh}:${mm}:${ss}`;
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
  function findTicketNumber(desc) {
    if (!desc) return null;
    return desc.match(/\b[a-zA-Z]+-\d+\b/);
  }
  function identifyTicketType(desc) {
    if (!desc) return 0;
    if (findTicketNumber(desc)) return 1;
    for (let index = 0; index < types.length; index++) {
      if (types[index].keywords.some((keyword) => desc.includes(keyword))) {
        return index;
      }
    }
    return 0;
  }
  var pad;
  var init_utils = __esm({
    "src/utils.js"() {
      init_constants();
      pad = (n) => String(n).padStart(2, "0");
    }
  });

  // src/data.js
  var STORAGE_KEY, StateManager, stateManager;
  var init_data = __esm({
    "src/data.js"() {
      init_utils();
      STORAGE_KEY = "simpleTimesheetV3";
      StateManager = class {
        // Constructor / Init
        constructor(storageKey) {
          this.state = this.#loadState(storageKey);
          this.openDay = this.state.openDay;
          if (!this.state.days) this.state.days = {};
          if (!this.state.openDay) this.setOpenDay(todayKey());
          this.listeners = /* @__PURE__ */ new Set();
        }
        // State Load & Save
        #loadState(storageKey) {
          try {
            return JSON.parse(localStorage.getItem(storageKey)) || {};
          } catch {
            return {};
          }
        }
        #saveState() {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        }
        getState() {
          return this.state;
        }
        // Day Management
        getDayNames() {
          return new Set(Object.keys(this.state.days || {}));
        }
        setOpenDay(day) {
          this.openDay = day;
          this.state.openDay = day;
          this.#initEntries(day);
          this.#saveState();
        }
        deleteDay(day) {
          delete this.state.days[day];
        }
        // Entries
        #initEntries(day) {
          if (!this.state.days[day]) this.state.days[day] = [];
        }
        getEntries() {
          this.#initEntries(this.state.openDay);
          return this.state.days[this.state.openDay];
        }
        getLastEntry() {
          const entries = this.getEntries();
          return entries[entries.length - 1];
        }
        // Entry Management
        newEntry(start, end, desc, type) {
          this.getEntries().push({
            id: uid(),
            start: roundHM(start),
            end: roundHM(end),
            desc,
            type
          });
          this.#saveState();
          this.notify();
        }
        updateEntry(entryId, updates) {
          const entries = this.getEntries();
          const entry = entries.find((e) => e.id === entryId);
          if (!entry) return false;
          Object.assign(entry, updates);
          this.#saveState();
          this.notify();
          return true;
        }
        stopLastRunningEntry() {
          const running = findLast(this.getEntries(), (e) => e.start && !e.end);
          if (!running) return false;
          running.end = roundHM(timeNow());
          this.#saveState();
          this.notify();
          return true;
        }
        deleteEntry(indexOrId) {
          const entries = this.getEntries();
          let index = typeof indexOrId === "number" ? indexOrId : entries.findIndex((e) => e.id === indexOrId);
          if (index === -1) return false;
          entries.splice(index, 1);
          this.#saveState();
          this.notify();
          return true;
        }
        moveEntry(fromIndex, toIndex) {
          const entries = this.getEntries();
          if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= entries.length || toIndex >= entries.length) return false;
          const item = entries.splice(fromIndex, 1)[0];
          entries.splice(toIndex, 0, item);
          this.#saveState();
          this.notify();
          return true;
        }
        // Subscription / Notification
        subscribe(listener) {
          this.listeners.add(listener);
        }
        notify() {
          for (const l of this.listeners) l(this.state);
        }
      };
      stateManager = new StateManager(STORAGE_KEY);
    }
  });

  // src/ui/render_summary_table.js
  function toggleSummary() {
    renderSummary();
    elements.hoursTable.classList.toggle("hidden");
    elements.summary.classList.toggle("hidden");
  }
  function isSummaryDisplayed() {
    return !elements.summary.classList.contains("hidden");
  }
  function renderSummary() {
    const grouped = [];
    for (const entry of stateManager.getEntries()) {
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
    elements.summaryTableBody.innerHTML = "";
    if (grouped.length === 0) return;
    grouped.sort((a, b) => {
      const orderA = types[a.type].priority ?? 999;
      const orderB = types[b.type].priority ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return a.key.localeCompare(b.key);
    });
    for (const g of grouped) {
      let description = g.key;
      if (g.descs.size > 0) {
        description += " - " + [...g.descs].join(", ");
      }
      const row = elements.summaryRowTemplate.content.cloneNode(true);
      row.querySelector(locators.fieldDuration).textContent = formatMinutes(g.minutes);
      const typeBtn = row.querySelector(locators.fieldType);
      typeBtn.textContent = types[g.type]?.emoji || "";
      typeBtn.classList.add(`type-${g.type}`);
      const descInput = row.querySelector(locators.fieldDescription);
      descInput.value = description;
      elements.summaryTableBody.appendChild(row);
    }
  }
  var init_render_summary_table = __esm({
    "src/ui/render_summary_table.js"() {
      init_data();
      init_utils();
      init_constants();
      elements.toggleSummaryBtn.addEventListener("click", toggleSummary);
    }
  });

  // src/ui/render_day_summary.js
  function updateDayTotal() {
    const minutes = { ticket: 0, meeting: 0, break: 0, other: 0, total: 0 };
    const uniqueTickets = /* @__PURE__ */ new Set();
    for (const entry of stateManager.getEntries()) {
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
  var init_render_day_summary = __esm({
    "src/ui/render_day_summary.js"() {
      init_data();
      init_utils();
      init_constants();
    }
  });

  // src/ui/render_hours_table.js
  function renderHoursTable() {
    const entries = stateManager.getEntries();
    const tbody = elements.hoursTableBody;
    tbody.innerHTML = "";
    gapRows.clear();
    entries.forEach((entry, index) => {
      const row = createTableRow(entry, index, entries);
      tbody.appendChild(row);
      if (index > 0) updateGapAfter(entries[index - 1]);
    });
    initSmoothRowDnD(tbody, entries);
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
        stateManager.moveEntry(from, to);
        renderAll();
      }
    };
    const durationCell = createDurationCell();
    const startCell = createTimeCell(entry, "start", () => updateDurationCell(entry, durationCell));
    const endCell = createTimeCell(entry, "end", () => updateDurationCell(entry, durationCell));
    tr.appendChild(durationCell);
    tr.appendChild(createTypeCell(entry));
    tr.appendChild(createDescriptionCell(entry));
    tr.appendChild(startCell);
    tr.appendChild(endCell);
    tr.appendChild(createDeleteCell(index));
    tr.appendChild(createDragHandleCell());
    updateDurationCell(entry, durationCell);
    return tr;
  }
  function createTimeCell(entry, field, onChange) {
    const td = document.createElement("td");
    const input = document.createElement("input");
    td.classList.add("time");
    input.type = "time";
    input.step = 60;
    input.value = entry[field] || "";
    input.dataset.field = field;
    input.onblur = () => {
      if (input.value) {
        input.value = roundHM(input.value);
        update(input.value);
      }
    };
    input.oninput = () => {
      update(input.value);
    };
    function update(newValue) {
      let initialValue = entry[field];
      const entries = stateManager.getEntries();
      const index = entries.indexOf(entry);
      if (field === "end" && index < entries.length - 1) {
        const next = entries[index + 1];
        if (next.start === initialValue) {
          const nextCell = document.querySelector(`tr[data-entry-id="${next.id}"] input[data-field="start"]`);
          nextCell.value = newValue;
          stateManager.updateEntry(next.id, { start: newValue });
        }
      }
      if (field === "start" && index > 0) {
        const prev = entries[index - 1];
        if (prev.end === initialValue) {
          const prevCell = document.querySelector(`tr[data-entry-id="${prev.id}"] input[data-field="end"]`);
          if (prevCell) {
            prevCell.value = newValue;
            stateManager.updateEntry(prev.id, { end: newValue });
          }
        }
      }
      stateManager.updateEntry(entry.id, { [field]: newValue });
      updateDayTotal();
      if (index > 0) updateGapAfter(entries[index - 1]);
      updateGapAfter(entry);
      if (onChange) onChange();
    }
    td.appendChild(input);
    return td;
  }
  function createDurationCell() {
    const td = document.createElement("td");
    td.classList.add("duration");
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
    btn.classList.add("actions");
    btn.classList.add("action");
    btn.classList.add("bigger");
    btn.classList.add("type");
    btn.classList.add("type-" + entry.type);
    btn.textContent = types[entry.type].emoji;
    btn.onclick = () => {
      btn.classList.remove("type-" + entry.type);
      stateManager.updateEntry(entry.id, { type: (entry.type + 1) % types.length });
      btn.textContent = types[entry.type].emoji;
      btn.classList.add("type-" + entry.type);
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
    input.placeholder = "Description";
    input.value = entry.desc || "";
    input.oninput = () => {
      const identifiedType = identifyTicketType(input.value);
      const row = input.closest("tr");
      const btn = row.querySelector(locators.entryTypeBtn);
      btn.textContent = types[identifiedType].emoji;
      stateManager.updateEntry(entry.id, { desc: input.value, type: identifiedType });
      updateDayTotal();
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
  function createDeleteCell(index) {
    const td = document.createElement("td");
    const deleteBtn = document.createElement("button");
    td.classList.add("actions");
    deleteBtn.classList.add("action", "delete");
    deleteBtn.textContent = "x";
    deleteBtn.onclick = () => {
      if (confirm("Delete this entry?")) {
        stateManager.deleteEntry(index);
        renderAll();
      }
    };
    td.appendChild(deleteBtn);
    return td;
  }
  function createDragHandleCell() {
    const td = document.createElement("td");
    const handle = document.createElement("span");
    td.classList.add("actions");
    handle.classList.add("action", "drag-handle");
    handle.textContent = "\u2630";
    handle.title = "Drag to reorder";
    handle.style.cursor = "grab";
    td.appendChild(handle);
    return td;
  }
  function initSmoothRowDnD(tbody, entries) {
    const scrollContainer = tbody.parentElement;
    const getEntryRows = () => [...tbody.querySelectorAll("tr:not(.gap-row)")];
    getEntryRows().forEach((tr) => {
      const handle = tr.querySelector(".drag-handle");
      if (!handle) return;
      let startY, startX, startIndex;
      let dragEl = null;
      let placeholder = null;
      let draggingRow = null;
      let rafId = null;
      const onPointerMove = (e) => {
        if (!dragEl) return;
        const dy = e.clientY - startY;
        const dx = e.clientX - startX;
        dragEl.style.transform = `translate(${dx}px, ${dy}px)`;
        maybeAutoScroll(e);
        movePlaceholder(e.clientY);
      };
      const onPointerUp = () => {
        if (!dragEl) return;
        const nonGapRows = getEntryRows();
        const finalIndex = nonGapRows.indexOf(placeholder);
        cleanup();
        if (finalIndex !== -1 && finalIndex !== startIndex) {
          stateManager.moveEntry(startIndex, finalIndex);
          renderAll();
        } else {
          renderAll();
        }
      };
      const onPointerDown = (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        draggingRow = tr;
        startIndex = getEntryRows().indexOf(tr);
        const rect = tr.getBoundingClientRect();
        startY = e.clientY;
        startX = e.clientX;
        dragEl = tr.cloneNode(true);
        dragEl.style.position = "fixed";
        dragEl.style.left = rect.left + "px";
        dragEl.style.top = rect.top + "px";
        dragEl.style.width = rect.width + "px";
        dragEl.style.pointerEvents = "none";
        dragEl.style.zIndex = 9999;
        dragEl.style.transform = "translate(0,0)";
        dragEl.style.boxShadow = "0 8px 24px rgba(0,0,0,.18)";
        dragEl.style.borderRadius = "6px";
        dragEl.style.opacity = "0.98";
        dragEl.style.willChange = "transform";
        dragEl.classList.add("drag-floating");
        document.body.appendChild(dragEl);
        placeholder = document.createElement("tr");
        placeholder.className = "drag-placeholder";
        placeholder.style.height = rect.height + "px";
        const colCount = tr.children.length;
        for (let c = 0; c < colCount; c++) {
          placeholder.appendChild(document.createElement("td"));
        }
        tbody.insertBefore(placeholder, tr);
        tbody.removeChild(tr);
        document.addEventListener("pointermove", onPointerMove);
        document.addEventListener("pointerup", onPointerUp, { once: true });
      };
      handle.addEventListener("pointerdown", onPointerDown);
      function cleanup() {
        cancelAnimationFrame(rafId);
        if (dragEl && dragEl.parentNode) dragEl.parentNode.removeChild(dragEl);
        dragEl = null;
        if (placeholder && placeholder.parentNode) {
          placeholder.parentNode.insertBefore(draggingRow, placeholder);
          placeholder.parentNode.removeChild(placeholder);
        }
        placeholder = null;
        draggingRow = null;
        document.removeEventListener("pointermove", onPointerMove);
      }
      function movePlaceholder(pointerClientY) {
        const entryRows = getEntryRows().filter((r) => r !== draggingRow);
        const firstRects = new Map(entryRows.map((r) => [r, r.getBoundingClientRect()]));
        let target = null;
        for (const r of entryRows) {
          const rrect = r.getBoundingClientRect();
          const midpoint = rrect.top + rrect.height / 2;
          if (pointerClientY < midpoint) {
            target = r;
            break;
          }
        }
        if (target) {
          if (placeholder.nextSibling !== target) {
            tbody.insertBefore(placeholder, target);
          }
        } else {
          if (placeholder !== tbody.lastElementChild) {
            tbody.appendChild(placeholder);
          }
        }
        const lastRects = new Map(entryRows.map((r) => [r, r.getBoundingClientRect()]));
        animateReorder(entryRows, firstRects, lastRects);
      }
      function maybeAutoScroll(e) {
        const containerRect = scrollContainer.getBoundingClientRect();
        const threshold = 36;
        const maxStep = 18;
        let delta = 0;
        if (e.clientY < containerRect.top + threshold) {
          delta = -maxStep * ((containerRect.top + threshold - e.clientY) / threshold);
        } else if (e.clientY > containerRect.bottom - threshold) {
          delta = maxStep * ((e.clientY - (containerRect.bottom - threshold)) / threshold);
        }
        if (delta !== 0) {
          cancelAnimationFrame(rafId);
          const tick = () => {
            scrollContainer.scrollTop += delta;
            rafId = requestAnimationFrame(tick);
          };
          rafId = requestAnimationFrame(tick);
        } else {
          cancelAnimationFrame(rafId);
        }
      }
      function animateReorder(rows, firstRects, lastRects) {
        rows.forEach((r) => {
          const first = firstRects.get(r);
          const last = lastRects.get(r);
          if (!first || !last) return;
          const dx = first.left - last.left;
          const dy = first.top - last.top;
          if (dx || dy) {
            r.style.transform = `translate(${dx}px, ${dy}px)`;
            r.style.transition = "none";
            r.offsetHeight;
            r.style.transform = "";
            r.style.transition = "transform 150ms ease";
          }
        });
      }
    });
  }
  function createGapRow(minutes, isOverlap = false) {
    const tr = document.createElement("tr");
    tr.classList.add("gap-row");
    tr.appendChild(document.createElement("td"));
    tr.appendChild(document.createElement("td"));
    const desc = document.createElement("td");
    const descInput = document.createElement("input");
    descInput.type = "text";
    descInput.value = `${formatMinutes(minutes)} ${isOverlap ? "overlap" : "gap"}`;
    descInput.readOnly = true;
    descInput.classList.add("description");
    desc.appendChild(descInput);
    tr.appendChild(desc);
    tr.appendChild(document.createElement("td"));
    tr.appendChild(document.createElement("td"));
    tr.appendChild(document.createElement("td"));
    tr.appendChild(document.createElement("td"));
    return tr;
  }
  function updateGapAfter(prevEntry) {
    const entries = stateManager.getEntries();
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
  var gapRows;
  var init_render_hours_table = __esm({
    "src/ui/render_hours_table.js"() {
      init_constants();
      init_utils();
      init_data();
      init_render_day_summary();
      init_controller();
      gapRows = /* @__PURE__ */ new Map();
    }
  });

  // src/ui/controller.js
  function renderAll(scrollBottom = false) {
    renderTabs();
    renderHoursTable();
    updateDayTotal();
    renderSummary();
    if (scrollBottom) {
      elements.hoursTableBody.parentElement.scrollTop = elements.hoursTableBody.scrollHeight;
    }
  }
  var init_controller = __esm({
    "src/ui/controller.js"() {
      init_constants();
      init_render_summary_table();
      init_render_tabs();
      init_render_day_summary();
      init_render_hours_table();
      renderAll();
    }
  });

  // src/ui/render_tabs.js
  function renderTabs() {
    const today = todayKey();
    const allDays = stateManager.getDayNames();
    allDays.add(today);
    const otherDays = Array.from(allDays).filter((d) => d !== today).sort((a, b) => b.localeCompare(a));
    const orderedDays = [today, ...otherDays];
    elements.tabs.innerHTML = "";
    orderedDays.forEach((day) => {
      const tabEl = document.createElement("div");
      tabEl.className = "tab" + (day === stateManager.openDay ? " active" : "");
      tabEl.title = day;
      const textEl = document.createElement("span");
      textEl.textContent = formatDayName(day);
      tabEl.appendChild(textEl);
      const deleteBtn = document.createElement("span");
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "\xD7";
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteOpenDay();
      });
      tabEl.appendChild(deleteBtn);
      tabEl.addEventListener("click", () => {
        stateManager.setOpenDay(day);
        renderAll();
      });
      elements.tabs.appendChild(tabEl);
    });
  }
  function deleteOpenDay() {
    if (!confirm("Delete all entries for this day? This cannot be undone.")) {
      return;
    }
    stateManager.deleteDay(stateManager.openDay);
    stateManager.setOpenDay(todayKey());
    renderAll();
  }
  var init_render_tabs = __esm({
    "src/ui/render_tabs.js"() {
      init_utils();
      init_data();
      init_constants();
      init_controller();
    }
  });

  // src/ui/events.js
  function startNow() {
    stateManager.newEntry(timeNow(), "", "", 0);
    renderAll(true);
    focusLastDescription();
  }
  function startSinceLast() {
    const lastEntry = stateManager.getLastEntry();
    if (lastEntry && lastEntry.end) {
      const lastEnd = parseHM(lastEntry.end);
      const nowHM = parseHM(timeNow());
      if (nowHM >= lastEnd) {
        stateManager.newEntry(lastEntry.end, "", "", 3);
        renderAll(true);
        focusLastDescription();
      }
      return true;
    } else {
      return false;
    }
  }
  function stopLast() {
    const stoppedAnEntry = stateManager.stopLastRunningEntry();
    renderAll(true);
    return stoppedAnEntry;
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
    if (!focusedOnInput && (e.key === "v" || e.key === "V")) {
      toggleSummary();
      return;
    }
    if (isSummaryDisplayed()) {
      return;
    }
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
        if (!startSinceLast()) {
          startNow();
        }
        return;
      }
    }
    if (!focusedOnTime && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
      handleArrowNavigation(e, active);
      return;
    }
    if (focusedOnTime && e.key === "Tab") {
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
  var init_events = __esm({
    "src/ui/events.js"() {
      init_utils();
      init_controller();
      init_constants();
      init_data();
      init_render_summary_table();
      document.addEventListener("keydown", onDocumentKeyDown);
    }
  });

  // main.js
  var require_main = __commonJS({
    "main.js"() {
      init_utils();
      init_constants();
      init_data();
      init_render_tabs();
      init_render_day_summary();
      init_render_hours_table();
      init_render_summary_table();
      init_events();
      init_controller();
    }
  });
  require_main();
})();
//# sourceMappingURL=bundle.js.map
