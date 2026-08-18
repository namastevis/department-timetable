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

let currentMonday = getMondayOf(parseLocalDate("2026-08-17")); // Default: Term 1 start date

document.addEventListener("DOMContentLoaded", () => {
    initFilters();
    renderGrid();
    setupEventListeners();
    updateJumpButtonLabel();
    initFilterRail();
    initDetailPanel();
    trackToolbarHeight();
    initDayTabs();
});

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
// facultyStatus in timetableData.js holds the key; FACULTY_TYPES holds the
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
// semNumber has one special value, "term1", which doesn't correspond to a
// real semesterNumber field (Term-type courses don't have one) — it means
// "any Term-type course" instead, since there's no Term 2 data yet.
function itemMatchesFilters(item, filters, skip = []) {
    if (!skip.includes("courseType") && filters.courseType !== "all" && item.courseType !== filters.courseType) return false;
    if (!skip.includes("semNumber") && filters.semNumber !== "all") {
        if (filters.semNumber === "term1") {
            if (item.courseType !== "term") return false;
        } else if (item.semesterNumber !== filters.semNumber) {
            return false;
        }
    }
    if (!skip.includes("course") && filters.course !== "all" && item.code !== filters.course) return false;
    // Faculty is multi-select: no selection means "everyone", otherwise the
    // section matches if ANY selected person teaches it. Co-taught sections
    // match on either name (see getFacultyNames).
    if (!skip.includes("faculty") && filters.faculty.length) {
        const names = getFacultyNames(item);
        if (!names.some(n => filters.faculty.includes(n))) return false;
    }
    if (!skip.includes("facultyStatus") && filters.facultyStatus !== "all" && item.facultyStatus !== filters.facultyStatus) return false;
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

// The Semester/Term dropdown mixes two kinds of values: real semester
// numbers (3, 5, 7 — only meaningful for Semester-type courses) and the
// single "term1" value (meaning "any Term-type course"). Its options are
// cross-linked like Course/Faculty: picking "Semester (Green)" in Course
// Types leaves only Semester numbers here (Term 1 disappears, since no
// Term-type item matches), and picking "Term (Blue)" leaves only "Term 1"
// (the Semester numbers disappear). Left on "Course Types: Semester &
// Term", both kinds of options are shown together.
function refreshSemNumberOptions() {
    const selectEl = document.getElementById("semNumberFilter");
    const filters = getCurrentFilterValues();
    const items = RAW_TIMETABLE_DATA.filter(d => itemMatchesFilters(d, filters, ["semNumber"]));

    const semNumbers = [...new Set(items.filter(d => d.courseType === "semester").map(d => d.semesterNumber))]
        .filter(Boolean)
        .sort((a, b) => Number(a) - Number(b));
    const hasTerm = items.some(d => d.courseType === "term");

    const currentValue = selectEl.value;
    selectEl.innerHTML = "";

    const allOpt = document.createElement("option");
    allOpt.value = "all";
    allOpt.textContent = "All Semesters & Terms";
    selectEl.appendChild(allOpt);

    semNumbers.forEach(num => {
        const opt = document.createElement("option");
        opt.value = num;
        opt.textContent = `Semester ${num}`;
        selectEl.appendChild(opt);
    });

    if (hasTerm) {
        const opt = document.createElement("option");
        opt.value = "term1";
        opt.textContent = "Term 1";
        selectEl.appendChild(opt);
    }

    const stillValid = [...selectEl.options].some(o => o.value === currentValue);
    selectEl.value = stillValid ? currentValue : "all";
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
        if (n) available.set(n, d.facultyStatus);
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

    const html = FACULTY_TYPES.map(group).join("");
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
    renderGrid();
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

const RAIL_CATEGORIES = [
    { id: "courseType", label: "Course Type", select: "courseTypeFilter" },
    { id: "semNumber", label: "Semester / Term", select: "semNumberFilter" },
    { id: "course", label: "Course", select: "courseFilter", searchable: true },
    { id: "faculty", label: "Faculty", faculty: true, searchable: true },
    { id: "facultyStatus", label: "Faculty Type", select: "facultyStatusFilter" },
    { id: "venue", label: "Venue", select: "venueFilter", searchable: true },
];

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
                <button type="button" id="selectFullTimeFacultyBtn" class="link-btn">Full-time</button>
                <button type="button" id="selectAdjunctFacultyBtn" class="link-btn">Adjunct</button>
                <button type="button" id="selectVisitingFacultyBtn" class="link-btn">Visiting</button>
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
            if (status && d.facultyStatus !== status) return;
            getFacultyNames(d).forEach(n => n && names.add(n));
        });
        return [...names];
    };
    const bind = (id, status) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("click", () =>
            setFacultySelection(status === "*" ? allNames() : status ? allNames(status) : []));
    };
    bind("selectAllFacultyBtn", "*");
    bind("selectFullTimeFacultyBtn", "full-time");
    bind("selectAdjunctFacultyBtn", "adjunct");
    bind("selectVisitingFacultyBtn", "visiting");
    bind("clearFacultyBtn", null);
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

// Decide what the "Jump to..." button should do based on today's real date
// relative to the term boundaries in TERMS:
//   - before Term 1 starts        -> "Jump to Term Start" (Term 1)
//   - inside Term 1 or Term 2     -> "Jump to Current Week" (today)
//   - in the gap between terms    -> "Jump to Term 2 Start"
//   - after Term 2 ends           -> "Jump to Term Start" (reset to Term 1)
function getJumpTarget() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const terms = (typeof TERMS !== "undefined" ? TERMS : []).map(t => ({
        name: t.name,
        start: parseLocalDate(t.startDate),
        end: parseLocalDate(t.endDate),
    }));

    if (terms.length === 0) {
        return { label: "Jump to Term Start", date: parseLocalDate("2026-08-17") };
    }

    const firstTerm = terms[0];
    const lastTerm = terms[terms.length - 1];

    if (today < firstTerm.start) {
        return { label: `Jump to ${firstTerm.name} Start`, date: firstTerm.start };
    }

    for (let i = 0; i < terms.length; i++) {
        const term = terms[i];
        if (today >= term.start && today <= term.end) {
            return { label: "Jump to Current Week", date: today };
        }
        const nextTerm = terms[i + 1];
        if (nextTerm && today > term.end && today < nextTerm.start) {
            return { label: `Jump to ${nextTerm.name} Start`, date: nextTerm.start };
        }
    }

    // After the last term has ended
    return { label: `Jump to ${firstTerm.name} Start`, date: firstTerm.start };
}

function updateJumpButtonLabel() {
    const btn = document.getElementById("jumpToTodayBtn");
    const label = getJumpTarget().label;
    btn.textContent = label;
    btn.title = label;
    btn.setAttribute("aria-label", label);
    // Phones show a shortened wording rather than an icon — "↻" gave no clue
    // what it would do. CSS renders this via ::after at phone widths.
    // Two lines on a phone so the button stays narrow; the newline is
    // rendered by white-space: pre-line on the ::after content.
    btn.dataset.short = label.includes("Current") ? "This\nweek" : "Term\nstart";
}

function setupEventListeners() {
    document.getElementById("prevWeekBtn").addEventListener("click", () => changeWeek(-7));
    document.getElementById("nextWeekBtn").addEventListener("click", () => changeWeek(7));
    document.getElementById("jumpToTodayBtn").addEventListener("click", () => {
        currentMonday = getMondayOf(getJumpTarget().date);
        renderGrid();
    });

    // Filter Change Listeners
    document.getElementById("courseFilter").addEventListener("change", () => {
        renderRailCategories();
        refreshVenueOptions();
        refreshSemNumberOptions();
        refreshFacultyOptions();
        renderGrid();
    });
    document.getElementById("courseTypeFilter").addEventListener("change", () => {
        renderRailCategories();
        refreshVenueOptions();
        refreshSemNumberOptions();
        refreshFacultyOptions();
        refreshCourseOptions();
        renderGrid();
    });
    document.getElementById("semNumberFilter").addEventListener("change", () => {
        renderRailCategories();
        refreshVenueOptions();
        refreshFacultyOptions();
        refreshCourseOptions();
        renderGrid();
    });
    document.getElementById("facultyStatusFilter").addEventListener("change", () => {
        renderRailCategories();
        refreshVenueOptions();
        refreshSemNumberOptions();
        refreshFacultyOptions();
        refreshCourseOptions();
        renderGrid();
    });

    document.getElementById("venueFilter").addEventListener("change", () => {
        renderRailCategories();
        refreshSemNumberOptions();
        refreshFacultyOptions();
        refreshCourseOptions();
        renderGrid();
    });

    document.getElementById("resetFiltersBtn").addEventListener("click", resetFilters);
}

// Clears every filter back to its default ("all") state and re-renders.
function resetFilters() {
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

    // Get Filter Values
    const selectedCourse = document.getElementById("courseFilter").value;
    const selectedVenue = document.getElementById("venueFilter").value;
    const selectedCourseType = document.getElementById("courseTypeFilter").value;
    const selectedSemNumber = document.getElementById("semNumberFilter").value;
    const selectedStatus = document.getElementById("facultyStatusFilter").value;

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
        // Apply Dropdown Filters (these apply to the whole course-section)
        if (selectedFaculty.size && !getFacultyNames(item).some(n => selectedFaculty.has(n))) return;
        if (selectedCourse !== "all" && item.code !== selectedCourse) return;
        if (selectedVenue !== "all" && !item.sessions.some(s => sessionVenue(item, s) === selectedVenue)) return;
        if (selectedCourseType !== "all" && item.courseType !== selectedCourseType) return;
        if (selectedSemNumber === "term1") {
            if (item.courseType !== "term") return;
        } else if (selectedSemNumber !== "all" && item.semesterNumber !== selectedSemNumber) {
            return;
        }
        if (selectedStatus !== "all" && item.facultyStatus !== selectedStatus) return;

        // Date check: Does the current week overlap the course's active date range?
        const itemStart = parseLocalDate(item.startDate);
        const itemEnd = parseLocalDate(item.endDate);
        if (currentFriday < itemStart || currentMonday > itemEnd) return;

        visible.push(item);

        item.sessions.forEach(session => {
            // Skip if this weekday is a holiday this week
            if (holidayByDay[session.day]) return;

            // With a room filter on, this section's OTHER meetings still get
            // drawn, faded and non-interactive, so a course stays visually
            // whole across the week: you can see that DESG215 Sec A also meets
            // on Tuesday, and that it is elsewhere, without that Tuesday card
            // pretending to belong to the room you filtered by.
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

                    card.tabIndex = isGhost ? -1 : 0;
                    if (!isGhost) card.setAttribute("role", "button");
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
        const firstCell = document.querySelector(`tr[data-time="08:00"] td.day-cell[data-day="${day}"]`);
        if (firstCell) {
            const note = document.createElement("div");
            note.className = "holiday-note";
            note.textContent = `Holiday: ${holiday.name}`;
            firstCell.appendChild(note);
        }
    });

    renderAgenda(visible, holidayByDay);
}

// ============================================================
// Phone view — day tabs + agenda
//
// Identical to the desktop grid, one day wide: the ten GRID_SLOTS are the
// rows, always, with the grid's own labels, and each row lists exactly what
// the corresponding grid cell contains. A class spanning four slots appears
// in all four, same as desktop. Empty rows stay blank, same as an empty cell.
// ============================================================

let activeDay = "Mon";

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
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    wrap.innerHTML = days.map((day, idx) => {
        const d = new Date(currentMonday);
        d.setDate(d.getDate() + idx);
        return `<button type="button" role="tab" class="day-tab${day === activeDay ? " is-active" : ""}"
                    data-day="${day}" aria-selected="${day === activeDay}">
            ${day}<span>${d.getDate()}/${d.getMonth() + 1}</span>
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
    return `<div class="course-card ${item.courseType}${ghost ? " is-ghost" : ""}"
                 ${ghost ? 'tabindex="-1"' : 'role="button" tabindex="0"'}
                 data-code="${item.code}" data-section-id="${item.sectionId}" data-day="${session.day}">
        <div class="title"><span class="course-name">${item.title}</span>${badge}</div>
        <div class="meta">${meta}</div>
    </div>`;
}

function updateHeaderDates() {
    const friday = new Date(currentMonday);
    friday.setDate(friday.getDate() + 4);

    const formatDate = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    document.getElementById("currentWeekDisplay").textContent =
        `Week of ${formatDate(currentMonday)} – ${formatDate(friday)}, 2026`;

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    days.forEach((day, idx) => {
        const d = new Date(currentMonday);
        d.setDate(d.getDate() + idx);
        const th = document.getElementById(`th-${day}`);
        if (th) {
            th.textContent = `${day} (${d.getDate()}/${d.getMonth() + 1})`;
        }
    });
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

// Whole weeks a date range covers, rounded up — "12 Oct to 9 Dec" reads as
// 9 weeks, not 8.4.
function weeksBetween(startStr, endStr) {
    const days = (parseLocalDate(endStr) - parseLocalDate(startStr)) / 86400000 + 1;
    return Math.round(days / 7);
}

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

    // A section that doesn't span the whole term is worth flagging — but in
    // plain numbers, not a label. "9 of the term's 17 weeks" needs no
    // explaining; the "Short Run" badge that used to sit here did.
    const termStart = "2026-08-17";
    const termEnd = item.courseType === "term" ? "2026-10-10" : "2026-12-12";
    const isPartial = !(item.startDate === termStart && item.endDate === termEnd);
    const runWeeks = weeksBetween(item.startDate, item.endDate);
    const termWeeks = weeksBetween(termStart, termEnd);

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
            <span class="badge badge-${item.facultyStatus}">${facultyTypeLabel(item.facultyStatus)}</span>
            <span class="badge badge-${item.courseType}">${item.semTerm}</span>
        </div>
        ${detailRow("Faculty", displayFaculty(item.faculty))}
        ${detailRow("Runs", `${prettyDate(item.startDate)} &rarr; ${prettyDate(item.endDate)}` +
            (isPartial
                ? `<span class="detail-note">${runWeeks} of the term's ${termWeeks} weeks</span>`
                : `<span class="detail-note">the full term</span>`))}
        ${detailRow("Sessions", `<ul class="session-list">${sessions}</ul>`)}
        ${detailRow("Credits", item.credits)}
        ${detailRow("Cohort", `${item.semTerm} &middot; ${item.sectionId}`)}
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
        if (card.classList.contains("is-ghost")) return;
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

const GRID_SLOTS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:15", "15:15", "16:15", "17:15"];
const SLOT_LABELS = {
    "08:00": "08:00 - 08:55",
    "09:00": "09:00 - 09:55",
    "10:00": "10:00 - 10:55",
    "11:00": "11:00 - 11:55",
    "12:00": "12:00 - 12:55",
    "13:00": "13:00 - 13:55",
    "14:15": "14:15 - 15:10",
    "15:15": "15:15 - 16:10",
    "16:15": "16:15 - 17:10",
    "17:15": "17:15 - 18:10",
};
const DAY_LABELS = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday" };

// Most course-sections have a single faculty member. A few (e.g. DANC101,
// co-taught by Prof. Rujuta Soman and Prof. Vrushali Lele) list multiple
// people in `facultyList`, so each can be selected individually in the
// Faculty filter while the card still shows the combined string.
function getFacultyNames(item) {
    return item.facultyList && item.facultyList.length ? item.facultyList : [item.faculty];
}
