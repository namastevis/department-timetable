// State Management
//
// IMPORTANT: All dates in this app are handled as local calendar dates,
// never via `new Date(dateString)` (which parses as UTC) mixed with local
// methods (getDay/setDate) — that combination shifts dates by a day for
// visitors in timezones behind UTC. Everything goes through parseLocalDate
// / formatLocalDate below to stay consistent regardless of the viewer's
// timezone (this site is public on GitHub Pages).

function parseLocalDate(dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
}

function formatLocalDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

// ============================================================
// Display helpers
//
// Faculty names are stored canonically in timetableData.js with the "Prof."
// prefix ("Prof. Ketan Kulkarni"). That prefix is true of every single person
// in the dataset, so it separates nobody from anybody and costs ~40px on every
// card. It's stripped for DISPLAY only — the underlying values (which the
// filters match on, and which appear in the printed source data) are untouched.
// Co-taught sections keep both names: "Rujuta Soman / Vrushali Lele".
// ============================================================

function displayFaculty(name) {
    if (!name) return "";
    return name.split(" / ").map(n => n.replace(/^Prof\.\s*/, "").trim()).join(" / ");
}

// Room names in the source sheet spell out words that are obvious in context.
// Shortening them is what lets faculty + venue share one line on the card.
// The detail panel always shows the room's full name.
const VENUE_SHORTENINGS = [
    [/\bConference Room\b/i, "Conf"],
    [/\bSeminar Room\b/i, "Seminar"],
    [/\bFocus Room\b/i, "Focus"],
    [/\bComputer Lab\b/i, "Lab"],
    [/\bDance Studio\b/i, "Dance"],
    [/\bPreview Theater\b/i, "Preview"],
];

function shortVenue(venue) {
    if (!venue) return "";
    return VENUE_SHORTENINGS.reduce((v, [re, to]) => v.replace(re, to), venue).trim();
}

function getMondayOf(date) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const day = d.getDay(); // 0 = Sun, 1 = Mon, ...
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
}

// Set in startApp() to the "home" week (see getHomeWeek), once the sheet has
// been read.
let currentMonday = null;

// The five columns of the grid, in order. Shared by the header, the phone day
// tabs and the today-highlight below, so they can never drift apart.
const DAY_KEYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

// Which column of the week ON SCREEN is today — "Mon".."Fri", or null.
// Null covers both "you have paged to a different week" and "today is Saturday
// or Sunday", which is exactly when nothing should be highlighted.
function todayColumn() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // Both dates are local midnight, so rounding absorbs any DST hour.
    const diff = Math.round((today - currentMonday) / 86400000);
    return diff >= 0 && diff <= 4 ? DAY_KEYS[diff] : null;
}

// Called by loader.js once the Google Sheet has been read.
function startApp() {
    buildGridRows();
    renderSubtitle();
    buildFilterChoices();
    currentMonday = getHomeWeek().monday;
    activeDay = todayColumn() || "Mon";
    initFilters();
    renderGrid();
    setupEventListeners();
    initFilterRail();
    initDetailPanel();
    trackToolbarHeight();
    initDayTabs();
}

// The grid has one row per slot in the sheet's Slots tab, so a change to
// FLAME's slot timings needs no change here.
function buildGridRows() {
    const body = document.getElementById("gridBody");
    if (!body) return;
    body.innerHTML = GRID_SLOTS.map(slot => `
        <tr data-time="${slot}">
            <td class="time-label">${SLOT_LABELS[slot]}</td>
            ${DAY_KEYS.map(d => `<td class="day-cell" data-day="${d}"></td>`).join("")}
        </tr>`).join("");
}

// ============================================================
// Subtitle
//
// Written from the data, never by hand: the academic year comes from the
// first date anything runs (an academic year starts in June or later), and
// the cohorts from what the sheet actually lists — "Term 2 & Semesters 3, 5,
// 7". UG/PG is named only when both are present.
// ============================================================

function listNumbers(nums) {
    return nums.join(", ");
}

function cohortSummary(items) {
    const nums = type => [...new Set(items.filter(d => d.courseType === type).map(d => d.periodNumber))]
        .sort((a, b) => a - b);
    const parts = [];
    const terms = nums("term"), sems = nums("semester");
    if (terms.length) parts.push(`${terms.length > 1 ? "Terms" : "Term"} ${listNumbers(terms)}`);
    if (sems.length) parts.push(`${sems.length > 1 ? "Semesters" : "Semester"} ${listNumbers(sems)}`);
    return parts.join(" & ");
}

function renderSubtitle() {
    const el = document.getElementById("pageSubtitle");
    if (!el) return;
    let text = "Department Timetable";
    if (DATA_RANGE) {
        const start = parseLocalDate(DATA_RANGE.start);
        const y = start.getMonth() >= 5 ? start.getFullYear() : start.getFullYear() - 1;
        const levels = [...new Set(RAW_TIMETABLE_DATA.map(d => d.level))].sort().reverse(); // UG before PG
        const cohorts = levels.length > 1
            ? levels.map(l => `${l}: ${cohortSummary(RAW_TIMETABLE_DATA.filter(d => d.level === l))}`).join(" · ")
            : cohortSummary(RAW_TIMETABLE_DATA);
        text = `Department Timetable, AY ${y}–${String(y + 1).slice(-2)} (${cohorts})`;
    }
    el.textContent = text;
    document.title = `Faculty of Design, Art & Performance | ${text}`;
}

// The day-header row and the filter rail both pin themselves just below the
// toolbar, so they need its real height — which changes when the toolbar wraps
// onto two lines on a narrow window.
function trackToolbarHeight() {
    const toolbar = document.querySelector(".toolbar");
    if (!toolbar) return;
    const apply = () => document.documentElement.style.setProperty(
        "--toolbar-h", `${Math.round(toolbar.getBoundingClientRect().height)}px`);
    apply();
    if (typeof ResizeObserver !== "undefined") new ResizeObserver(apply).observe(toolbar);
    window.addEventListener("resize", apply);
}

// ============================================================
// Faculty multi-select
//
// This replaces the old separate "Find Empty Slot" view. Selecting several
// people here filters the grid to just their classes, which means the cells
// left empty ARE the slots where all of them are free — the same answer the
// old view gave, but in the grid people already read, and with the context of
// what those people are doing either side of the gap.
//
// Selections are held here rather than read off the DOM, so they survive the
// option list being rebuilt when another filter narrows it.
// ============================================================

const selectedFaculty = new Set();

// The three faculty types, in the order they should appear everywhere.
// facultyStatus in the sheet data holds the key; FACULTY_TYPES holds the
// label, so a rename never means hunting through markup and CSS again.
const FACULTY_TYPES = [
    { key: "full-time", label: "Full-time" },
    { key: "adjunct", label: "Adjunct" },
    { key: "visiting", label: "Visiting" },
];

function facultyTypeLabel(key) {
    const t = FACULTY_TYPES.find(t => t.key === key);
    return t ? t.label : key;
}

function initFilters() {
    // Course Types, Course, Faculty, and Semester/Term options are all
    // cross-linked to every other active filter (see refreshSemNumberOptions
    // / refreshFacultyOptions / refreshCourseOptions below): picking a
    // course narrows Faculty to only the people teaching it, picking a
    // faculty member narrows Course to only what they teach, and picking a
    // Course Type / Semester / Faculty Type narrows all of them — e.g.
    // selecting "Term (Blue)" in Course Types leaves only "Term 1" (no
    // Semester numbers) selectable in the Semester/Term dropdown, and only
    // the faculty/courses that run in Term 1. All start unfiltered ("all").
    refreshSemNumberOptions();
    refreshFacultyOptions();
    refreshCourseOptions();
    refreshVenueOptions();
}

// Reads the current value of every filter control.
function getCurrentFilterValues() {
    return {
        level: document.getElementById("levelFilter").value,
        courseType: document.getElementById("courseTypeFilter").value,
        semNumber: document.getElementById("semNumberFilter").value,
        course: document.getElementById("courseFilter").value,
        faculty: [...selectedFaculty],
        venue: document.getElementById("venueFilter").value,
        facultyStatus: document.getElementById("facultyStatusFilter").value,
    };
}

// Whether a course-section matches the given filter values, ignoring any
// filter keys listed in `skip` (used when computing a dropdown's own
// options — a filter shouldn't narrow itself out).
//
// semNumber holds a period key such as "sem-3" or "term-2", prefixed with the
// level ("UG|sem-3") so UG Semester 3 and PG Semester 3 stay distinct.
function itemMatchesFilters(item, filters, skip = []) {
    if (!skip.includes("level") && filters.level !== "all" && item.level !== filters.level) return false;
    if (!skip.includes("courseType") && filters.courseType !== "all" && item.courseType !== filters.courseType) return false;
    if (!skip.includes("semNumber") && filters.semNumber !== "all" && periodValue(item) !== filters.semNumber) return false;
    if (!skip.includes("course") && filters.course !== "all" && item.code !== filters.course) return false;
    // Faculty is multi-select: no selection means "everyone", otherwise the
    // section matches if ANY selected person teaches it. Co-taught sections
    // match on either name (see getFacultyNames).
    if (!skip.includes("faculty") && filters.faculty.length) {
        const names = getFacultyNames(item);
        if (!names.some(n => filters.faculty.includes(n))) return false;
    }
    // A co-taught section can have a full-time and a visiting teacher, so it
    // matches a faculty type if either of them has it.
    if (!skip.includes("facultyStatus") && filters.facultyStatus !== "all"
        && !getFacultyNames(item).some(n => personStatus(item, n) === filters.facultyStatus)) return false;
    // A room belongs to a session, not to the course — DESG215 Sec A is in
    // ARB002 on Mon/Wed and ARB104 on Tue. So the section survives this filter
    // if ANY of its sessions is in the chosen room, and the individual
    // sessions that aren't are dropped when the grid is drawn.
    if (!skip.includes("venue") && filters.venue !== "all") {
        if (!item.sessions.some(s => sessionVenue(item, s) === filters.venue)) return false;
    }
    return true;
}

// The room a given session actually meets in.
function sessionVenue(item, session) {
    return session.venue || item.venue || "";
}

// Repopulates a <select>'s options, preserving the current selection if it's
// still among the new options, otherwise resetting to "all".
// `labelFn` optionally renders a friendlier label than the option's value.
// Never transform the value itself — filter matching depends on it.
function populateSelect(selectEl, entries, allLabel, labelFn) {
    const currentValue = selectEl.value;
    selectEl.innerHTML = "";

    const allOpt = document.createElement("option");
    allOpt.value = "all";
    allOpt.textContent = allLabel;
    selectEl.appendChild(allOpt);

    entries.forEach(entry => {
        const opt = document.createElement("option");
        if (Array.isArray(entry)) {
            const [code, title] = entry;
            opt.value = code;
            opt.textContent = `${code} — ${title}`;
        } else {
            opt.value = entry;
            opt.textContent = labelFn ? labelFn(entry) : entry;
        }
        selectEl.appendChild(opt);
    });

    const stillValid = [...selectEl.options].some(o => o.value === currentValue);
    selectEl.value = stillValid ? currentValue : "all";
}

// Period value used by the Semester / Term filter: "UG|sem-3", "UG|term-2".
function periodValue(item) {
    return `${item.level}|${item.periodKey}`;
}

// The faculty type of one named person on a section (co-teachers can differ).
function personStatus(item, name) {
    return (item.facultyStatuses && item.facultyStatuses[name]) || item.facultyStatus;
}

// Semester / Term options are built from what the data holds — Semester 3,
// 5, 7 and Term 2 today, whatever the sheet says next term — and stay
// cross-linked to every other filter. Semesters list before terms; UG/PG is
// named only when the sheet has both.
function refreshSemNumberOptions() {
    const selectEl = document.getElementById("semNumberFilter");
    const filters = getCurrentFilterValues();
    const items = RAW_TIMETABLE_DATA.filter(d => itemMatchesFilters(d, filters, ["semNumber"]));
    const multiLevel = new Set(RAW_TIMETABLE_DATA.map(d => d.level)).size > 1;

    const periods = new Map();
    items.forEach(d => periods.set(periodValue(d), d));
    const entries = [...periods.values()]
        .sort((a, b) => b.level.localeCompare(a.level)            // UG before PG
            || (a.courseType === b.courseType ? 0 : a.courseType === "semester" ? -1 : 1)
            || a.periodNumber - b.periodNumber)
        .map(d => periodValue(d));
    const label = v => {
        const d = periods.get(v);
        return multiLevel ? `${d.level} ${d.periodLabel}` : d.periodLabel;
    };
    populateSelect(selectEl, entries, "All Semesters & Terms", label);
}

// Options for the filters whose choices are fixed lists (level, course type,
// faculty type) — only the values the sheet actually contains are offered,
// and a filter with nothing to choose between is left out of the rail.
function buildFilterChoices() {
    const has = (fn) => new Set(RAW_TIMETABLE_DATA.flatMap(fn));
    const levels = [...has(d => [d.level])].sort().reverse();
    const types = has(d => [d.courseType]);
    const statuses = has(d => getFacultyNames(d).map(n => personStatus(d, n)));

    populateSelect(document.getElementById("levelFilter"), levels, "UG & PG");
    populateSelect(document.getElementById("courseTypeFilter"),
        ["semester", "term"].filter(t => types.has(t)), "Semester & Term",
        t => t === "semester" ? "Semester (Green)" : "Term (Blue)");
    AVAILABLE_FACULTY_TYPES = FACULTY_TYPES.filter(t => statuses.has(t.key));
    populateSelect(document.getElementById("facultyStatusFilter"),
        AVAILABLE_FACULTY_TYPES.map(t => t.key), "All Faculty Types", facultyTypeLabel);

    RAIL_CATEGORIES = ALL_RAIL_CATEGORIES.filter(cat => {
        if (cat.id === "level") return levels.length > 1;
        if (cat.id === "courseType") return types.size > 1;
        if (cat.id === "facultyStatus") return AVAILABLE_FACULTY_TYPES.length > 1;
        return true;
    });
    activeCategory = RAIL_CATEGORIES[0].id;
}

// Rebuilds the faculty checkbox list, grouped by faculty type. Anyone no
// longer available under the other active filters is dropped from the
// selection, mirroring how the other dropdowns fall back to "all" when their
// value stops being valid.
function refreshFacultyOptions() {
    const filters = getCurrentFilterValues();
    const items = RAW_TIMETABLE_DATA.filter(d => itemMatchesFilters(d, filters, ["faculty"]));

    const available = new Map(); // canonical name -> facultyStatus key
    items.forEach(d => getFacultyNames(d).forEach(n => {
        if (n) available.set(n, personStatus(d, n));
    }));

    [...selectedFaculty].forEach(n => {
        if (!available.has(n)) selectedFaculty.delete(n);
    });

    const container = document.getElementById("facultyOptions");
    if (!container) { updateFacultyLabel(); return; }   // Faculty category not open
    const query = (categorySearch.faculty || "").trim().toLowerCase();

    const group = ({ key, label }) => {
        const names = [...available.entries()]
            .filter(([n, st]) => st === key && displayFaculty(n).toLowerCase().includes(query))
            .map(([n]) => n)
            .sort((a, b) => displayFaculty(a).localeCompare(displayFaculty(b)));
        if (!names.length) return "";
        return `<div class="multiselect-group">
            <div class="multiselect-group-title">${label}</div>
            ${names.map(n => `<label class="multiselect-option">
                <input type="checkbox" class="faculty-checkbox" value="${n}"
                       data-status="${key}"${selectedFaculty.has(n) ? " checked" : ""} />
                <span>${displayFaculty(n)}</span>
            </label>`).join("")}
        </div>`;
    };

    const html = AVAILABLE_FACULTY_TYPES.map(group).join("");
    container.innerHTML = html || `<p class="multiselect-empty">No faculty match "${query}".</p>`;
    updateFacultyLabel();
}

// The rail's category button carries the count instead of a dropdown label.
function updateFacultyLabel() {
    renderRailCategories();
}

// Updates the inputs already on screen rather than re-rendering their markup.
// Rebuilding innerHTML inside the phone drawer (which is a transformed,
// position:fixed element) can leave iOS Safari painting the old subtree — the
// checkboxes stay visually ticked even though the DOM says otherwise. Setting
// .checked on a live input always repaints.
function syncRailInputs() {
    RAIL_CATEGORIES.forEach(cat => {
        if (cat.faculty) return;
        const el = document.getElementById(cat.select);
        if (!el) return;
        document.querySelectorAll(`input[name="rail-${cat.id}"]`).forEach(radio => {
            radio.checked = radio.value === el.value;
            const label = radio.closest(".rail-option");
            if (label) label.classList.toggle("is-checked", radio.checked);
        });
    });
    document.querySelectorAll(".faculty-checkbox").forEach(cb => {
        cb.checked = selectedFaculty.has(cb.value);
    });
}

function setFacultySelection(names) {
    selectedFaculty.clear();
    names.forEach(n => selectedFaculty.add(n));
    refreshSemNumberOptions();
    refreshCourseOptions();
    refreshVenueOptions();
    syncRailInputs();
    updateFacultyLabel();
    applyFilters();
}

// ============================================================
// Filter rail (Titan Eye+ pattern)
//
// A category column on the left, the selected category's options beside it,
// and a Hide Filters toggle above. The five filters are still real <select>
// elements in the DOM (visually hidden); the rail reads their options and
// writes back to them, so cross-linking, reset and option rebuilding all keep
// running through the code that already existed. Faculty is the exception —
// it is multi-select and lives in `selectedFaculty`, not in a <select>.
// ============================================================

const ALL_RAIL_CATEGORIES = [
    { id: "level", label: "UG / PG", select: "levelFilter" },
    { id: "courseType", label: "Course Type", select: "courseTypeFilter" },
    { id: "semNumber", label: "Semester / Term", select: "semNumberFilter" },
    { id: "course", label: "Course", select: "courseFilter", searchable: true },
    { id: "faculty", label: "Faculty", faculty: true, searchable: true },
    { id: "facultyStatus", label: "Faculty Type", select: "facultyStatusFilter" },
    { id: "venue", label: "Venue", select: "venueFilter", searchable: true },
];

// The categories actually shown — ALL_RAIL_CATEGORIES minus any with nothing
// to choose between in the current data (see buildFilterChoices).
let RAIL_CATEGORIES = ALL_RAIL_CATEGORIES;
let AVAILABLE_FACULTY_TYPES = FACULTY_TYPES;
let activeCategory = "courseType";
const categorySearch = {};   // category id -> current search text

function activeCountFor(cat) {
    if (cat.faculty) return selectedFaculty.size;
    const el = document.getElementById(cat.select);
    return el && el.value !== "all" ? 1 : 0;
}

function renderRailCategories() {
    const wrap = document.getElementById("railCats");
    if (!wrap) return;
    wrap.innerHTML = RAIL_CATEGORIES.map(cat => {
        const n = activeCountFor(cat);
        return `<button type="button" role="tab" class="rail-cat${cat.id === activeCategory ? " is-active" : ""}"
                    data-cat="${cat.id}" aria-selected="${cat.id === activeCategory}">
            <span>${cat.label}</span>
            ${n ? `<span class="rail-count">${n}</span>` : ""}
        </button>`;
    }).join("");
    updateFilterCountBadge();
}

// Single-choice categories render as a radio list, not a dropdown — every
// option visible at once, which is the point of a rail.
function renderSelectOptions(cat) {
    const el = document.getElementById(cat.select);
    const query = (categorySearch[cat.id] || "").toLowerCase();
    const opts = [...el.options].filter(o => !query || o.textContent.toLowerCase().includes(query));
    if (!opts.length) return `<p class="rail-empty">Nothing matches &ldquo;${categorySearch[cat.id]}&rdquo;.</p>`;
    return `<div class="rail-list">${opts.map(o => `
        <label class="rail-option${o.value === el.value ? " is-checked" : ""}">
            <input type="radio" name="rail-${cat.id}" value="${o.value}"${o.value === el.value ? " checked" : ""} />
            <span>${o.textContent}</span>
        </label>`).join("")}</div>`;
}

function renderRailOptions() {
    const wrap = document.getElementById("railOptions");
    if (!wrap) return;
    const cat = RAIL_CATEGORIES.find(c => c.id === activeCategory);
    const search = cat.searchable
        ? `<input type="search" class="rail-search" id="railSearch" placeholder="Search ${cat.label.toLowerCase()}"
                  aria-label="Search ${cat.label}" value="${categorySearch[cat.id] || ""}" />`
        : "";

    if (cat.faculty) {
        wrap.innerHTML = search + `
            <div class="rail-actions">
                <button type="button" id="selectAllFacultyBtn" class="link-btn">All</button>
                ${AVAILABLE_FACULTY_TYPES.length > 1 ? AVAILABLE_FACULTY_TYPES.map(t =>
                    `<button type="button" class="link-btn" data-faculty-type="${t.key}">${t.label}</button>`).join("") : ""}
                <button type="button" id="clearFacultyBtn" class="link-btn">Clear</button>
            </div>
            <div id="facultyOptions" class="rail-list"></div>`;
        wireFacultyActions();
        refreshFacultyOptions();
    } else {
        wrap.innerHTML = search + renderSelectOptions(cat);
    }

    const searchEl = document.getElementById("railSearch");
    if (searchEl) {
        searchEl.addEventListener("input", () => {
            categorySearch[cat.id] = searchEl.value;
            const pos = searchEl.selectionStart;
            renderRailOptions();
            const again = document.getElementById("railSearch");
            if (again) { again.focus(); again.setSelectionRange(pos, pos); }
        });
    }
}

function renderRail() {
    renderRailCategories();
    renderRailOptions();
}

function wireFacultyActions() {
    const allNames = (status) => {
        const names = new Set();
        RAW_TIMETABLE_DATA.forEach(d => {
            getFacultyNames(d).forEach(n => {
                if (n && (!status || personStatus(d, n) === status)) names.add(n);
            });
        });
        return [...names];
    };
    const bind = (id, status) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("click", () =>
            setFacultySelection(status === "*" ? allNames() : status ? allNames(status) : []));
    };
    bind("selectAllFacultyBtn", "*");
    bind("clearFacultyBtn", null);
    document.querySelectorAll("[data-faculty-type]").forEach(btn =>
        btn.addEventListener("click", () => setFacultySelection(allNames(btn.dataset.facultyType))));
}

function initFilterRail() {
    renderRail();

    document.getElementById("railCats").addEventListener("click", e => {
        const btn = e.target.closest(".rail-cat");
        if (!btn) return;
        activeCategory = btn.dataset.cat;
        renderRail();
    });

    // A radio choice writes straight back to the hidden <select> and fires its
    // change event, so every filter listener that already existed still runs.
    document.getElementById("railOptions").addEventListener("change", e => {
        const radio = e.target.closest('input[type="radio"]');
        if (radio) {
            const cat = RAIL_CATEGORIES.find(c => `rail-${c.id}` === radio.name);
            const el = document.getElementById(cat.select);
            el.value = radio.value;
            el.dispatchEvent(new Event("change"));
            return;
        }
        const cb = e.target.closest(".faculty-checkbox");
        if (cb) {
            if (cb.checked) selectedFaculty.add(cb.value);
            else selectedFaculty.delete(cb.value);
            refreshSemNumberOptions();
            refreshCourseOptions();
            renderGrid();
            renderRailCategories();
        }
    });

    const railEl = document.getElementById("filterRail");
    const toggle = document.getElementById("toggleFiltersBtn");
    const label = document.getElementById("toggleFiltersLabel");
    const workspace = document.getElementById("workspace");

    // Two behaviours behind one button. On desktop it collapses a column and
    // the grid widens. On a phone the rail is a drawer over the page, so it
    // opens instead of closes — hence the inverted default and the scrim.
    const isPhone = () => window.matchMedia("(max-width: 640px)").matches;

    const scrim = document.createElement("div");
    scrim.className = "rail-scrim";
    scrim.hidden = true;
    document.body.appendChild(scrim);

    const setDrawer = (open) => {
        document.body.classList.toggle("drawer-open", open);
        scrim.hidden = !open;
        toggle.setAttribute("aria-expanded", String(open));
        railEl.setAttribute("aria-hidden", String(!open));
    };

    scrim.addEventListener("click", () => setDrawer(false));
    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && document.body.classList.contains("drawer-open")) setDrawer(false);
    });

    toggle.addEventListener("click", () => {
        if (isPhone()) {
            setDrawer(!document.body.classList.contains("drawer-open"));
            return;
        }
        const hidden = workspace.classList.toggle("rail-hidden");
        toggle.setAttribute("aria-expanded", String(!hidden));
        label.textContent = hidden ? "Show Filters" : "Hide Filters";
        toggle.querySelector(".filters-toggle-icon").innerHTML = hidden ? "&#8677;" : "&#8676;";
        railEl.setAttribute("aria-hidden", String(hidden));
    });

    // Leaving phone width with the drawer open would strand it half-styled.
    window.addEventListener("resize", () => { if (!isPhone()) setDrawer(false); });
}

// The hamburger carries a count so an active filter is visible without
// opening the drawer.
function updateFilterCountBadge() {
    const badge = document.getElementById("filterCountBadge");
    if (!badge) return;
    const n = RAIL_CATEGORIES.reduce((sum, cat) => sum + (activeCountFor(cat) ? 1 : 0), 0);
    badge.hidden = n === 0;
    badge.textContent = n;
}


function refreshVenueOptions() {
    const filters = getCurrentFilterValues();
    const items = RAW_TIMETABLE_DATA.filter(d => itemMatchesFilters(d, filters, ["venue"]));
    const venues = [...new Set(items.flatMap(d => d.sessions.map(s => sessionVenue(d, s))))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));
    populateSelect(document.getElementById("venueFilter"), venues, "All Venues");
}

// Faculty Type offers only the types teaching something under the other
// active filters (e.g. no "Adjunct" when Term 2 has no adjunct faculty).
function refreshFacultyStatusOptions() {
    const filters = getCurrentFilterValues();
    const items = RAW_TIMETABLE_DATA.filter(d => itemMatchesFilters(d, filters, ["facultyStatus"]));
    const present = new Set(items.flatMap(d => getFacultyNames(d).map(n => personStatus(d, n))));
    populateSelect(document.getElementById("facultyStatusFilter"),
        AVAILABLE_FACULTY_TYPES.filter(t => present.has(t.key)).map(t => t.key), "All Faculty Types", facultyTypeLabel);
}

function refreshCourseOptions() {
    const filters = getCurrentFilterValues();
    const items = RAW_TIMETABLE_DATA.filter(d => itemMatchesFilters(d, filters, ["course"]));
    const courseMap = new Map();
    items.forEach(d => {
        if (!courseMap.has(d.code)) courseMap.set(d.code, d.title);
    });
    const courses = [...courseMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    populateSelect(document.getElementById("courseFilter"), courses, "All Courses");
}

// ============================================================
// Home week and the jump button
//
// The page opens on the week in progress. On a Saturday or Sunday that week is
// over, so it opens on the coming one instead. Before the first class of the
// period it opens on the first week; after the last, on the last week.
//
// The jump button returns to that week, so it only appears once someone has
// paged away from it.
// ============================================================

function getHomeWeek() {
    const now = new Date();
    const ref = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (ref.getDay() === 6) ref.setDate(ref.getDate() + 2);
    if (ref.getDay() === 0) ref.setDate(ref.getDate() + 1);

    if (DATA_RANGE) {
        const first = getMondayOf(parseLocalDate(DATA_RANGE.start));
        const last = getMondayOf(parseLocalDate(DATA_RANGE.end));
        if (ref < first) return { monday: first, label: "Jump to First Week", short: "First\nweek" };
        if (getMondayOf(ref) > last) return { monday: last, label: "Jump to Last Week", short: "Last\nweek" };
    }
    return { monday: getMondayOf(ref), label: "Jump to Current Week", short: "This\nweek" };
}

function updateJumpButton() {
    const btn = document.getElementById("jumpToTodayBtn");
    if (!btn) return;
    const home = getHomeWeek();
    const away = currentMonday.getTime() !== home.monday.getTime();
    btn.textContent = home.label;
    btn.title = home.label;
    btn.setAttribute("aria-label", home.label);
    // Phones show a two-line short wording via CSS ::after (see style.css).
    btn.dataset.short = home.short;
    btn.classList.toggle("is-hidden", !away);
    btn.setAttribute("aria-hidden", String(!away));
    btn.tabIndex = away ? 0 : -1;
}

function setupEventListeners() {
    document.getElementById("prevWeekBtn").addEventListener("click", () => changeWeek(-7));
    document.getElementById("nextWeekBtn").addEventListener("click", () => changeWeek(7));
    document.getElementById("jumpToTodayBtn").addEventListener("click", () => {
        currentMonday = getHomeWeek().monday;
        activeDay = todayColumn() || activeDay;
        renderGrid();
    });

    // Filter Change Listeners
    document.getElementById("levelFilter").addEventListener("change", () => {
        renderRailCategories();

        refreshVenueOptions();
        refreshSemNumberOptions();
        refreshFacultyOptions();
        refreshCourseOptions();
        applyFilters();
    });
    document.getElementById("courseFilter").addEventListener("change", () => {
        renderRailCategories();

        refreshVenueOptions();
        refreshSemNumberOptions();
        refreshFacultyOptions();
        applyFilters();
    });
    document.getElementById("courseTypeFilter").addEventListener("change", () => {
        renderRailCategories();

        refreshVenueOptions();
        refreshSemNumberOptions();
        refreshFacultyOptions();
        refreshCourseOptions();
        applyFilters();
    });
    document.getElementById("semNumberFilter").addEventListener("change", () => {
        renderRailCategories();

        refreshVenueOptions();
        refreshFacultyOptions();
        refreshCourseOptions();
        applyFilters();
    });
    document.getElementById("facultyStatusFilter").addEventListener("change", () => {
        renderRailCategories();

        refreshVenueOptions();
        refreshSemNumberOptions();
        refreshFacultyOptions();
        refreshCourseOptions();
        applyFilters();
    });

    document.getElementById("venueFilter").addEventListener("change", () => {
        renderRailCategories();

        refreshSemNumberOptions();
        refreshFacultyOptions();
        refreshCourseOptions();
        applyFilters();
    });

    document.getElementById("resetFiltersBtn").addEventListener("click", resetFilters);
}

// Clears every filter back to its default ("all") state and re-renders.
function resetFilters() {
    document.getElementById("levelFilter").value = "all";
    document.getElementById("courseTypeFilter").value = "all";
    document.getElementById("semNumberFilter").value = "all";
    document.getElementById("venueFilter").value = "all";
    selectedFaculty.clear();
    categorySearch.faculty = "";
    categorySearch.course = "";
    categorySearch.venue = "";
    document.getElementById("courseFilter").value = "all";
    document.getElementById("facultyStatusFilter").value = "all";
    refreshSemNumberOptions();
    refreshFacultyOptions();
    refreshCourseOptions();
    refreshVenueOptions();
    renderGrid();
    renderRailCategories();
    syncRailInputs();
}

// ============================================================
// Empty-week notice
//
// Filtering to something that doesn't run this week leaves a blank grid with
// no clue that the course exists at all — DESG218 only starts on 12 Oct, and
// ARB 202 is used by exactly one section for five weeks.
//
// The view deliberately does NOT move. Moving the week out from under someone
// who only changed a filter is disorienting, and it fights the week arrows.
// Instead the banner says where the next occurrence is and lets them decide.
// It is recomputed on every render, so paging into another empty week updates
// the message rather than leaving a stale one.
// ============================================================

function weekHasMatches(monday) {
    const friday = new Date(monday);
    friday.setDate(friday.getDate() + 4);
    const filters = getCurrentFilterValues();
    return RAW_TIMETABLE_DATA.some(item => {
        if (!itemMatchesFilters(item, filters)) return false;
        return parseLocalDate(item.startDate) <= friday && parseLocalDate(item.endDate) >= monday;
    });
}

// Same wording as the toolbar heading, so "Week of Oct 26 – Oct 30, 2026" in
// the banner is recognisably the thing the arrows will take you to.
function weekLabel(monday) {
    const friday = new Date(monday);
    friday.setDate(friday.getDate() + 4);
    const fmt = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `Week of ${fmt(monday)} – ${fmt(friday)}, ${monday.getFullYear()}`;
}

// Walk week by week in `step` direction looking for one that has matches.
function scanWeeks(from, step) {
    if (!DATA_RANGE) return null;
    const first = getMondayOf(parseLocalDate(DATA_RANGE.start));
    const last = getMondayOf(parseLocalDate(DATA_RANGE.end));

    // Clamp the starting point into the term. Without this, paging past the end
    // of the term and then scanning backwards would start outside the range,
    // fail the loop guard immediately, and wrongly report "never scheduled".
    let cursor = new Date(from);
    if (step > 0 && cursor < first) cursor = new Date(first);
    if (step < 0 && cursor > last) cursor = new Date(last);

    while (cursor >= first && cursor <= last) {
        if (weekHasMatches(cursor)) return new Date(cursor);
        cursor.setDate(cursor.getDate() + step * 7);
    }
    return null;
}

function applyFilters() {
    refreshFacultyStatusOptions();
    renderGrid();
}

function updateWeekJumpNotice() {
    const el = document.getElementById("weekJumpNotice");
    if (!el) return;
    if (weekHasMatches(currentMonday)) { el.hidden = true; return; }

    // Name the thing that came up empty when it is a single room, since that is
    // the filter this most often happens with.
    const venueSel = document.getElementById("venueFilter");
    const isVenue = venueSel && venueSel.value !== "all";
    const subject = isVenue ? "this venue" : "a match";

    const ahead = new Date(currentMonday);
    ahead.setDate(ahead.getDate() + 7);
    const next = scanWeeks(ahead, 1);

    if (next) {
        el.hidden = false;
        el.textContent = `Nothing matched this week — next ${subject} appears is in the ${weekLabel(next)}`;
        return;
    }

    // Nothing ahead: it may still have run earlier in the term, which is more
    // useful to say than "never".
    const behind = new Date(currentMonday);
    behind.setDate(behind.getDate() - 7);
    const prev = scanWeeks(behind, -1);
    el.hidden = false;
    el.textContent = prev
        ? `Nothing matched this week — ${isVenue ? "this venue was last used" : "the last match was"} in the ${weekLabel(prev)}`
        : `Nothing matched this week — ${isVenue ? "this venue is" : "these filters are"} not scheduled at any point this term.`;
}

function changeWeek(days) {
    currentMonday.setDate(currentMonday.getDate() + days);
    renderGrid();
}

function getHolidayForDate(dateStr) {
    return (typeof HOLIDAYS !== "undefined" ? HOLIDAYS : []).find(h => h.date === dateStr);
}

function renderGrid() {
    updateHeaderDates();
    clearGrid();

    const filters = getCurrentFilterValues();
    const selectedVenue = filters.venue;

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

    // Figure out which weekdays in the current week are holidays
    const holidayByDay = {};
    days.forEach((day, idx) => {
        const d = new Date(currentMonday);
        d.setDate(d.getDate() + idx);
        const holiday = getHolidayForDate(formatLocalDate(d));
        if (holiday) holidayByDay[day] = holiday;
    });

    // Mark holiday columns for this week
    days.forEach(day => {
        document.querySelectorAll(`td.day-cell[data-day="${day}"]`).forEach(cell => {
            cell.classList.toggle("holiday-cell", Boolean(holidayByDay[day]));
        });
    });

    const currentFriday = new Date(currentMonday);
    currentFriday.setDate(currentFriday.getDate() + 4);

    // Each RAW_TIMETABLE_DATA entry is one course-section; its `sessions`
    // array lists every weekday it meets (each with its own time slots,
    // since a section can meet at different times on different days).
    const visible = [];
    RAW_TIMETABLE_DATA.forEach(item => {
        // The same matching the dropdown options use, so what a filter offers
        // and what it shows can never disagree.
        if (!itemMatchesFilters(item, filters)) return;

        // Date check: Does the current week overlap the course's active date range?
        const itemStart = parseLocalDate(item.startDate);
        const itemEnd = parseLocalDate(item.endDate);
        if (currentFriday < itemStart || currentMonday > itemEnd) return;

        visible.push(item);

        item.sessions.forEach(session => {
            // Skip if this weekday is a holiday this week
            if (holidayByDay[session.day]) return;

            // With a room filter on, this section's OTHER meetings still get
            // drawn, faded, so a course stays visually whole across the week:
            // you can see that DESG215 Sec A also meets on Tuesday, and that
            // it is elsewhere, without that Tuesday card looking like it
            // belongs to the room you filtered by. Still clickable — it is a
            // real class, and its details are just as worth reading.
            const isGhost = selectedVenue !== "all" && sessionVenue(item, session) !== selectedVenue;

            session.timeSlots.forEach(timeSlot => {
                const cell = document.querySelector(`tr[data-time="${timeSlot}"] td[data-day="${session.day}"]`);
                if (cell) {
                    const card = document.createElement("div");
                    card.className = `course-card ${item.courseType}${isGhost ? " is-ghost" : ""}`;

                    // Two lines: the course NAME first (what a reader actually
                    // scans for — the code is registrar language and lives in
                    // the detail panel), then faculty and room together.
                    // 16 courses run more than one section and some share a
                    // teacher, so the section letter rides along on the title.
                    const sectionBadge = item.sectionLabel
                        ? `<span class="badge badge-section">${item.sectionLabel}</span>`
                        : "";

                    // Venue is per-session: a section can meet in different
                    // rooms on different days (e.g. DESG215 Sec A is in ARB002
                    // on Mon/Wed but ARB104 on Tue). item.venue is the single
                    // room when every session shares one, and null otherwise,
                    // so session.venue is the value to trust here.
                    const venue = session.venue || item.venue || "";
                    const meta = [displayFaculty(item.faculty), shortVenue(venue)]
                        .filter(Boolean)
                        .join(" · ");

                    card.tabIndex = 0;
                    card.setAttribute("role", "button");
                    card.dataset.code = item.code;
                    card.dataset.sectionId = item.sectionId;
                    card.dataset.day = session.day;
                    card.title = `${item.code} · ${item.title} — ${displayFaculty(item.faculty)}${venue ? " — " + venue : ""}`;
                    // The name gets its own span because .title is a flex row:
                    // only the name clips, so an ellipsis always means the
                    // course name really was cut. With the badge inside the
                    // clipped box, 12 cards showed "..." purely because the
                    // section chip didn't fit — reading as a truncated name
                    // when the name was complete.
                    card.innerHTML = `
                        <div class="title"><span class="course-name">${item.title}</span>${sectionBadge}</div>
                        <div class="meta">${meta}</div>
                    `;
                    cell.appendChild(card);
                }
            });
        });
    });

    // Show a single holiday note at the top of each holiday column (first time row only)
    Object.entries(holidayByDay).forEach(([day, holiday]) => {
        const firstCell = document.querySelector(`tr[data-time="${GRID_SLOTS[0]}"] td.day-cell[data-day="${day}"]`);
        if (firstCell) {
            const note = document.createElement("div");
            note.className = "holiday-note";
            note.textContent = `Holiday: ${holiday.name}`;
            firstCell.appendChild(note);
        }
    });

    renderAgenda(visible, holidayByDay);

    // Recomputed on every render — filter change and week navigation alike — so
    // paging into another empty week refreshes the message instead of leaving
    // a stale one on screen.
    updateWeekJumpNotice();
}

// ============================================================
// Phone view — day tabs + agenda
//
// Identical to the desktop grid, one day wide: the ten GRID_SLOTS are the
// rows, always, with the grid's own labels, and each row lists exactly what
// the corresponding grid cell contains. A class spanning four slots appears
// in all four, same as desktop. Empty rows stay blank, same as an empty cell.
// ============================================================

// Phones open on today when today is a weekday, otherwise Monday — landing on
// "Mon" during a Thursday lecture was the most common reason to have to tap
// before reading anything.
let activeDay = "Mon";   // set to today's column in startApp()

function initDayTabs() {
    const tabs = document.getElementById("dayTabs");
    if (!tabs) return;
    tabs.addEventListener("click", e => {
        const tab = e.target.closest(".day-tab");
        if (!tab) return;
        activeDay = tab.dataset.day;
        renderGrid();
    });
}

function renderDayTabs() {
    const wrap = document.getElementById("dayTabs");
    if (!wrap) return;
    const todayKey = todayColumn();
    wrap.innerHTML = DAY_KEYS.map((day, idx) => {
        const d = new Date(currentMonday);
        d.setDate(d.getDate() + idx);
        const isToday = day === todayKey;
        // Two independent states on the same control: "is-active" is the tab
        // you have chosen, "is-today" is the real date. They can be on the
        // same tab or different ones, so they read differently — the active
        // tab is filled, today carries a dot and an accent date.
        return `<button type="button" role="tab"
                    class="day-tab${day === activeDay ? " is-active" : ""}${isToday ? " is-today" : ""}"
                    data-day="${day}" aria-selected="${day === activeDay}"
                    ${isToday ? 'aria-current="date"' : ""}>
            ${day}<span>${isToday ? "Today" : `${d.getDate()}/${d.getMonth() + 1}`}</span>
        </button>`;
    }).join("");
}

function renderAgenda(visible, holidayByDay) {
    const wrap = document.getElementById("agendaView");
    if (!wrap) return;
    renderDayTabs();

    if (holidayByDay[activeDay]) {
        wrap.innerHTML = `<p class="agenda-empty">Holiday: ${holidayByDay[activeDay].name}</p>`;
        return;
    }

    wrap.innerHTML = GRID_SLOTS.map(slot => {
        const here = [];
        const venueFilter = document.getElementById("venueFilter").value;
        visible.forEach(item => item.sessions.forEach(session => {
            if (session.day !== activeDay) return;
            if (!session.timeSlots.includes(slot)) return;
            const ghost = venueFilter !== "all" && sessionVenue(item, session) !== venueFilter;
            here.push({ item, session, ghost });
        }));

        const [from, to] = (SLOT_LABELS[slot] || slot).split(" - ");
        return `<div class="agenda-slot">
            <div class="agenda-time">${from}<em>${to || ""}</em></div>
            <div class="agenda-body">${here.map(({ item, session, ghost }) => agendaCard(item, session, ghost)).join("")}</div>
        </div>`;
    }).join("");
}

// Same markup as a grid card, so the delegated click handler and the detail
// panel work here with no extra code.
function agendaCard(item, session, ghost) {
    const venue = session.venue || item.venue || "";
    const badge = item.sectionLabel ? `<span class="badge badge-section">${item.sectionLabel}</span>` : "";
    const meta = [displayFaculty(item.faculty), shortVenue(venue)].filter(Boolean).join(" · ");
    return `<div class="course-card ${item.courseType}${ghost ? " is-ghost" : ""}" role="button" tabindex="0"
                 data-code="${item.code}" data-section-id="${item.sectionId}" data-day="${session.day}">
        <div class="title"><span class="course-name">${item.title}</span>${badge}</div>
        <div class="meta">${meta}</div>
    </div>`;
}

function updateHeaderDates() {
    const friday = new Date(currentMonday);
    friday.setDate(friday.getDate() + 4);

    const formatDate = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    // Year read from the date, not hardcoded — paging past 31 Dec used to keep
    // saying 2026.
    document.getElementById("currentWeekDisplay").textContent =
        `Week of ${formatDate(currentMonday)} – ${formatDate(friday)}, ${friday.getFullYear()}`;
    // "This week" chip beside the week label, so a reader can tell at a glance
    // whether they have paged away from the present.
    document.querySelector(".week-controls")
        ?.classList.toggle("is-current-week", todayColumn() !== null);
    updateJumpButton();

    const todayKey = todayColumn();
    DAY_KEYS.forEach((day, idx) => {
        const d = new Date(currentMonday);
        d.setDate(d.getDate() + idx);
        const th = document.getElementById(`th-${day}`);
        if (th) {
            const isToday = day === todayKey;
            th.innerHTML = `${day} <span class="th-date">(${d.getDate()}/${d.getMonth() + 1})</span>` +
                (isToday ? `<span class="today-pill">Today</span>` : "");
            th.classList.toggle("is-today", isToday);
            // Screen readers get the same signal the colour gives everyone else.
            if (isToday) th.setAttribute("aria-current", "date");
            else th.removeAttribute("aria-current");
        }
    });
    // Deliberately no per-cell marking: the highlight lives entirely on the
    // header row, which is sticky and therefore always on screen. That also
    // keeps this a five-element update rather than a walk over all fifty cells
    // on every filter change.
}

function clearGrid() {
    // The open card is about to be destroyed (week change, filter change), so
    // the panel describing it must go with it.
    closeDetail();
    document.querySelectorAll(".day-cell").forEach(cell => {
        cell.innerHTML = "";
        cell.classList.remove("holiday-cell");
    });
}

// ============================================================
// Course detail panel
//
// The card is deliberately down to two lines, so everything it can no longer
// show lives here: course code, section, full (unshortened) room name, credits,
// cohort, every meeting time — and the date range, which matters because 14 of
// the 56 sections don't run the full term (DESG215 ends 9 Sep, DESG218 starts
// 12 Oct, DESG401 Sec B starts 26 Oct). Someone reading a single card has no
// other way to tell a full-term course from a three-week one.
//
// The panel and its backdrop are created here rather than in index.html so
// this feature is contained to app.js + style.css.
// ============================================================

let detailEls = null;
let lastFocusedCard = null;

function ensureDetailPanel() {
    if (detailEls) return detailEls;

    const backdrop = document.createElement("div");
    backdrop.className = "detail-backdrop";
    backdrop.hidden = true;

    const panel = document.createElement("aside");
    panel.className = "detail-panel";
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "false");
    panel.setAttribute("aria-label", "Course details");

    document.body.appendChild(backdrop);
    document.body.appendChild(panel);

    backdrop.addEventListener("click", closeDetail);
    detailEls = { backdrop, panel };
    return detailEls;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function prettyDate(dateStr) {
    const d = parseLocalDate(dateStr);
    return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

// "14:15" -> "14:15 - 15:10", using the same slot labels as the grid.
function sessionTimeRange(session) {
    const first = session.timeSlots[0];
    const last = session.timeSlots[session.timeSlots.length - 1];
    const start = (SLOT_LABELS[first] || first).split(" - ")[0];
    const end = (SLOT_LABELS[last] || last).split(" - ")[1] || "";
    return end ? `${start} - ${end}` : start;
}

function detailRow(key, value) {
    if (!value) return "";
    return `<div class="detail-row"><span class="detail-key">${key}</span><span class="detail-val">${value}</span></div>`;
}

function openDetail(item, session) {
    const { backdrop, panel } = ensureDetailPanel();

    // Venue belongs to the session, not the course — DESG215 Sec A is in
    // ARB002 on Mon/Wed but ARB104 on Tue — so each session carries its own
    // room rather than there being one "Venue" row that can only be half true.
    //
    // Every session renders identically. An earlier version highlighted the one
    // whose card had been clicked, which told the reader something they already
    // knew (they clicked it a moment ago) while reading as though it meant
    // something about the session itself.
    const sessions = item.sessions
        .map(s => {
            const room = s.venue || item.venue || "";
            return `<li class="session-item">
                <span class="session-when">${DAY_LABELS[s.day] || s.day} &middot; ${sessionTimeRange(s)}</span>
                ${room ? `<span class="session-where">${room}</span>` : ""}
            </li>`;
        })
        .join("");

    panel.innerHTML = `
        <button class="detail-close" type="button" aria-label="Close">&times;</button>
        <div class="detail-code">${item.code}${item.sectionLabel ? ` &middot; Section ${item.sectionLabel}` : ""}</div>
        <h3 class="detail-title">${item.title}</h3>
        <div class="detail-badges">
            <!-- Cohort first: "Sem-7" is what identifies the class. The
                 employment type qualifies who teaches it, so it follows. -->
            <span class="badge badge-${item.courseType}">${item.level} ${item.periodLabel}</span>
            ${[...new Set(getFacultyNames(item).map(n => personStatus(item, n)).filter(Boolean))]
                .map(st => `<span class="badge badge-${st}">${facultyTypeLabel(st)}</span>`).join("")}
        </div>
        ${detailRow("Faculty", displayFaculty(item.faculty))}
        ${detailRow("Runs", `${prettyDate(item.startDate)} &rarr; ${prettyDate(item.endDate)}`)}
        ${detailRow("Sessions", `<ul class="session-list">${sessions}</ul>`)}
        ${item.credits !== null && item.credits !== "" ? detailRow("Credits", item.credits) : ""}
        ${detailRow("Cohort", `${item.level} ${item.periodLabel} &middot; ${item.sectionId}`)}
        ${item.batch ? detailRow("Batch", item.batch) : ""}
        ${item.strength ? detailRow("Students", item.strength) : ""}
    `;

    panel.querySelector(".detail-close").addEventListener("click", closeDetail);
    backdrop.hidden = false;
    panel.hidden = false;
    requestAnimationFrame(() => panel.classList.add("open"));
    panel.querySelector(".detail-close").focus();
}

function closeDetail() {
    if (!detailEls) return;
    detailEls.panel.classList.remove("open");
    detailEls.panel.hidden = true;
    detailEls.backdrop.hidden = true;
    if (lastFocusedCard && document.body.contains(lastFocusedCard)) lastFocusedCard.focus();
    lastFocusedCard = null;
}

// One delegated listener on the grid, so it survives every re-render.
function initDetailPanel() {
    const targets = [document.getElementById("timetableGrid"), document.getElementById("agendaView")]
        .filter(Boolean);
    if (!targets.length) return;

    const openFromCard = (card) => {
        const item = RAW_TIMETABLE_DATA.find(
            d => d.code === card.dataset.code && d.sectionId === card.dataset.sectionId
        );
        if (!item) return;
        const session = item.sessions.find(s => s.day === card.dataset.day);
        if (!session) return;
        lastFocusedCard = card;
        openDetail(item, session);
    };

    targets.forEach(target => {
        target.addEventListener("click", e => {
            const card = e.target.closest(".course-card");
            if (card) openFromCard(card);
        });
        target.addEventListener("keydown", e => {
            if (e.key !== "Enter" && e.key !== " ") return;
            const card = e.target.closest(".course-card");
            if (!card) return;
            e.preventDefault();
            openFromCard(card);
        });
    });

    document.addEventListener("keydown", e => {
        if (e.key === "Escape") closeDetail();
    });
}

// ============================================================
// Shared grid constants
// ============================================================

// GRID_SLOTS and SLOT_LABELS come from the sheet's Slots tab (see loader.js).
const DAY_LABELS = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday" };

// Most course-sections have a single faculty member. A few (e.g. DANC101,
// co-taught by Prof. Rujuta Soman and Prof. Vrushali Lele) list multiple
// people in `facultyList`, so each can be selected individually in the
// Faculty filter while the card still shows the combined string.
function getFacultyNames(item) {
    return item.facultyList && item.facultyList.length ? item.facultyList : [item.faculty];
}
