// ============================================================
// Data loader
//
// Reads the Master, Slots and Calendar tabs of the Google Sheet named in
// config.js and turns them into what app.js draws:
//
//   RAW_TIMETABLE_DATA  one entry per course-section, with its sessions
//   HOLIDAYS            [{ date, name }]
//   GRID_SLOTS          ["08:00", "09:00", ...] from the Slots tab
//   SLOT_LABELS         { "08:00": "08:00 - 08:55", ... }
//   DATA_RANGE          { start, end } — first and last day anything runs
//
// The sheet is read through Google's visualization endpoint as JSON rather
// than CSV, because JSON carries dates as real dates (Date(2026,7,17)) instead
// of text whose day/month order depends on the sheet's locale.
//
// The last good copy is kept in the browser, so if Google is slow or
// unreachable the page still shows the timetable, with a note saying so.
// ============================================================

let RAW_TIMETABLE_DATA = [];
let HOLIDAYS = [];
let GRID_SLOTS = [];
let SLOT_LABELS = {};
let DATA_RANGE = null;

const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const CACHE_KEY = "department-timetable:sheet:v1";

document.addEventListener("DOMContentLoaded", async () => {
    let tables, fromCache = null;
    try {
        tables = await fetchAllTabs();
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), tables })); } catch (_) { /* private mode */ }
    } catch (err) {
        console.error("Timetable sheet could not be read:", err);
        try { fromCache = JSON.parse(localStorage.getItem(CACHE_KEY) || "null"); } catch (_) { fromCache = null; }
        if (!fromCache) {
            showDataNotice("The timetable couldn’t be loaded right now. Please check your connection and refresh the page.", true);
            document.getElementById("currentWeekDisplay").textContent = "Timetable unavailable";
            return;
        }
        tables = fromCache.tables;
    }

    try {
        buildData(tables);
    } catch (err) {
        console.error(err);
        showDataNotice("The timetable sheet couldn’t be read. If you maintain it, check that the tab names and header rows haven’t changed.", true);
        return;
    }

    if (fromCache) {
        const when = new Date(fromCache.savedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
        showDataNotice(`Couldn’t reach the timetable sheet, so this is the copy saved on ${when}. Refresh to try again.`, false);
    }
    if (!RAW_TIMETABLE_DATA.length) {
        showDataNotice("No classes are listed in the timetable sheet yet.", false);
    }
    startApp();
});

// ------------------------------------------------------------
// Fetching
// ------------------------------------------------------------

async function fetchAllTabs() {
    const { tabs } = DATA_SOURCE;
    const [master, slots, calendar] = await Promise.all([
        fetchTab(tabs.master), fetchTab(tabs.slots), fetchTab(tabs.calendar),
    ]);
    return { master, slots, calendar };
}

// Returns the tab as an array of row objects keyed by normalised header
// ("Mon From ▾" -> "monfrom", "Semester / Term ▾" -> "semesterterm").
async function fetchTab(name) {
    const url = `https://docs.google.com/spreadsheets/d/${DATA_SOURCE.sheetId}/gviz/tq` +
        `?tqx=out:json&headers=1&sheet=${encodeURIComponent(name)}&_=${Date.now()}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
    const text = await res.text();
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start < 0 || end < 0) throw new Error(`${name}: not readable (is the sheet shared as "Anyone with the link"?)`);
    const json = JSON.parse(text.slice(start, end + 1));
    if (json.status === "error") throw new Error(`${name}: ${(json.errors || []).map(e => e.detailed_message || e.message).join("; ")}`);

    const keys = json.table.cols.map(c => normKey(c.label || ""));
    return json.table.rows.map(r => {
        const obj = {};
        keys.forEach((k, i) => { if (k) obj[k] = cellValue(r.c[i]); });
        return obj;
    });
}

const normKey = s => s.toLowerCase().replace(/[^a-z0-9]/g, "");

function cellValue(cell) {
    if (!cell || cell.v === null || cell.v === undefined) return "";
    const v = cell.v;
    if (typeof v === "string") {
        const m = v.match(/^Date\((\d+),(\d+),(\d+)/);
        if (m) return `${m[1]}-${pad(+m[2] + 1)}-${pad(m[3])}`;
        return v.trim();
    }
    if (Array.isArray(v)) return `${pad(v[0])}:${pad(v[1])}`;   // time of day
    return v;
}

const pad = n => String(n).padStart(2, "0");

// ------------------------------------------------------------
// Building
// ------------------------------------------------------------

function buildData({ master, slots, calendar }) {
    buildSlots(slots);
    HOLIDAYS = buildHolidays(calendar);

    const skipped = [];
    RAW_TIMETABLE_DATA = master
        .map((row, i) => {
            if (!row.coursecode && !row.sectionid) return null;     // blank row
            const item = buildItem(row);
            if (typeof item === "string") { skipped.push(`row ${i + 2}: ${item}`); return null; }
            return item;
        })
        .filter(Boolean);
    if (skipped.length) console.warn("Timetable rows left out (see the Check column in the sheet):", skipped);

    const starts = RAW_TIMETABLE_DATA.map(d => d.startDate).sort();
    const ends = RAW_TIMETABLE_DATA.map(d => d.endDate).sort();
    DATA_RANGE = starts.length ? { start: starts[0], end: ends[ends.length - 1] } : null;
}

// "14:15–15:10" -> ["14:15", "15:10"]
function parseSlotLabel(label) {
    const m = String(label).match(/(\d{1,2})[:.](\d{2})\s*[–—-]\s*(\d{1,2})[:.](\d{2})/);
    return m ? [`${pad(m[1])}:${m[2]}`, `${pad(m[3])}:${m[4]}`] : null;
}

function buildSlots(rows) {
    const list = rows
        .map(r => parseSlotLabel(r.slot) || (r.starts && r.ends ? [String(r.starts), String(r.ends)] : null))
        .filter(Boolean)
        .sort((a, b) => a[0].localeCompare(b[0]));
    if (!list.length) throw new Error("Slots tab is empty");
    GRID_SLOTS = list.map(s => s[0]);
    SLOT_LABELS = Object.fromEntries(list.map(([s, e]) => [s, `${s} - ${e}`]));
}

function buildHolidays(rows) {
    const out = [];
    rows.forEach(r => {
        if (String(r.type).toLowerCase() !== "holiday" || !isISO(r.startdate)) return;
        const end = isISO(r.enddate) ? r.enddate : r.startdate;
        for (let d = parseLocalDate(r.startdate); d <= parseLocalDate(end); d.setDate(d.getDate() + 1)) {
            out.push({ date: formatLocalDate(d), name: r.name });
        }
    });
    return out;
}

const isISO = v => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

// "Sem-3" / "Semester 3" -> semester 3; "Term-2" / "Term 2" -> term 2.
function parsePeriod(v) {
    const m = String(v).match(/^\s*(sem(?:ester)?|term)\s*-?\s*(\d+)\s*$/i);
    if (!m) return null;
    const isSem = m[1].toLowerCase().startsWith("sem");
    return {
        courseType: isSem ? "semester" : "term",
        periodNumber: m[2],
        periodKey: `${isSem ? "sem" : "term"}-${m[2]}`,
        periodLabel: `${isSem ? "Semester" : "Term"} ${m[2]}`,
        semTerm: `${isSem ? "Sem" : "Term"}-${m[2]}`,
    };
}

function facultyTypeKey(v) {
    const k = String(v).toLowerCase();
    if (k.startsWith("full") || k === "regular") return "full-time";
    if (k.startsWith("adj")) return "adjunct";
    if (k.startsWith("vis")) return "visiting";
    return null;
}

// Returns the item, or a short reason it was left out.
function buildItem(r) {
    const period = parsePeriod(r.semesterterm);
    if (!period) return `Semester/Term "${r.semesterterm}"`;
    if (!r.coursecode) return "no course code";
    if (!r.sectionid) return "no section ID";
    if (!r.faculty) return "no faculty";
    const startDate = r.runsfrom, endDate = r.runsto;
    if (!isISO(startDate) || !isISO(endDate)) return "no dates (Runs From/To empty)";
    if (endDate < startDate) return "end date before start";

    const sessions = [];
    for (const day of DAY_ORDER) {
        const k = day.toLowerCase();
        const from = parseSlotLabel(r[`${k}from`]), to = parseSlotLabel(r[`${k}to`]);
        if (!from && !to) continue;
        if (!from || !to) return `${day}: from/to incomplete`;
        const timeSlots = GRID_SLOTS.filter(s => s >= from[0] && s <= to[0]);
        if (!timeSlots.length) return `${day}: slots not in the Slots tab`;
        sessions.push({ day, timeSlots, venue: r[`${k}venue`] || null });
    }
    if (!sessions.length) return "no days filled";

    const names = [r.faculty, r.faculty2].filter(Boolean);
    const facultyStatuses = {};
    facultyStatuses[r.faculty] = facultyTypeKey(r.facultytype);
    if (r.faculty2) facultyStatuses[r.faculty2] = facultyTypeKey(r.faculty2type);

    const venues = new Set(sessions.map(s => s.venue));
    const level = String(r.level || "").toUpperCase() || "UG";

    return {
        level,
        ...period,
        code: String(r.coursecode),
        title: r.coursetitle && !String(r.coursetitle).startsWith("⚠") ? r.coursetitle : String(r.coursecode),
        credits: r.credits === "" ? null : r.credits,
        faculty: names.join(" / "),
        facultyList: names,
        facultyStatuses,
        facultyStatus: facultyStatuses[r.faculty],
        sectionId: String(r.sectionid),
        sectionLabel: (String(r.sectionid).match(/\d([A-Z])$/) || [])[1] || null,
        batch: r.batch || null,
        strength: r.studentstrength === "" ? null : r.studentstrength,
        venue: venues.size === 1 ? [...venues][0] : null,
        startDate,
        endDate,
        sessions,
    };
}

function showDataNotice(message, isError) {
    const el = document.getElementById("dataNotice");
    if (!el) return;
    el.textContent = message;
    el.classList.toggle("is-error", Boolean(isError));
    el.hidden = false;
}
