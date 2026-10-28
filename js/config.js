// ============================================================
// Where the timetable comes from.
//
// The site reads three tabs of the department's Google Sheet. The sheet must
// be shared as "Anyone with the link: Viewer" (or published to the web); the
// site only ever reads it.
//
// The content lives entirely in the sheet. Nothing in this repository needs to
// change when a term or semester changes.
// ============================================================

const DATA_SOURCE = {
    sheetId: "1jCjoqtmp5-OpEaHI9Hhe1nU1KYqfFSRLmGBKfcSVwOI",
    tabs: {
        master: "Master",
        slots: "Slots",
        calendar: "Calendar",
    },
};
