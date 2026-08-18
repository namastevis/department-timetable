// Auto-generated from "Final Timetable  AY 2026-27 S1.xlsx" (replaces the
// earlier "Time-table Term1, Sem 3, 5 & 7 - AY 2026-27.xlsx Updated Version").
// Columns used: Section ID (C), Course Code (D), Course Title (E), Credits (F),
// Faculty Name (G), Schedule (J), Venue (M).
//
// Each entry is one course-section (56 total). "sessions" lists every weekday
// that section meets, each with its own grid time slots and its own venue (a
// section can meet at different times AND in different rooms on different days,
// e.g. DESG215 Sec A: Mon/Wed in ARB002, Tue in ARB104). The item-level "venue"
// is the single room when all sessions share one, otherwise null - read
// session.venue for the per-day room.
//
// Notes on this revision:
//   - The new sheet has no faculty-type column; facultyStatus is carried over
//     from the previous sheet by faculty name. Prof. Madhan Raj (new on
//     DESG319) is recorded as visiting.
//   - facultyStatus is one of "full-time" | "adjunct" | "visiting". The old
//     sheet's "Regular" is now "full-time"; Prof. Amit Inamdar (DESG218 Sec A
//     and B) is "adjunct"; Prof. Nikhil Welankar (DESG481) is "visiting".
//   - "Prof. Sameer Dubley" on MUSC101 is normalised to "Prof. Sameer Dublay"
//     (same person as on MUSC206 / MUSC303).
//   - Prof. Saraang Gangoo is now spelt "Prof. Sarang Ganoo" per the new sheet.
//   - PGPE426 (PGPETERM1, batch PGPEI2026) is new: treated as a Term course and
//     tagged with program: "PGPE" so it can be styled/filtered separately.
//   - Venue names normalised: "Shanti Niketan Dance Studio" -> "Shantiniketan
//     Dance Studio"; room codes spaced ("APJ103" -> "APJ 103"); "Arjuna
//     Seminar Room" -> "Arjuna Seminar Room 001" (same room); the word "Wing"
//     dropped ("Chandragupa East Wing" -> "Chandragupa East"); and
//     "Learning Commons A&B" merged into "Learning Commons A & B".
//   - Sem-5 DESG361 is now DESG362; THEA310 is 3 credits (was 4); the duplicate
//     UGSEM7B DESG381 row is gone; DANC105 moved to section UGTERM1A.
const RAW_TIMETABLE_DATA = [
  {
    "semTerm": "Sem-3",
    "courseType": "semester",
    "semesterNumber": "3",
    "code": "DESG215",
    "title": "Digital Design Fundamentals",
    "credits": 3,
    "faculty": "Prof. Ketan Kulkarni",
    "facultyStatus": "visiting",
    "sectionId": "UGSEM3A",
    "sectionLabel": "A",
    "venue": null,
    "startDate": "2026-08-17",
    "endDate": "2026-09-09",
    "sessions": [
      {
        "day": "Mon",
        "timeSlots": [
          "14:15",
          "15:15",
          "16:15",
          "17:15"
        ],
        "venue": "ARB 002"
      },
      {
        "day": "Tue",
        "timeSlots": [
          "14:15",
          "15:15",
          "16:15",
          "17:15"
        ],
        "venue": "ARB 104"
      },
      {
        "day": "Wed",
        "timeSlots": [
          "14:15",
          "15:15",
          "16:15",
          "17:15"
        ],
        "venue": "ARB 002"
      }
    ]
  },
  {
    "semTerm": "Sem-3",
    "courseType": "semester",
    "semesterNumber": "3",
    "code": "DESG213",
    "title": "Sketching and Prototyping",
    "credits": 3,
    "faculty": "Prof. Dishant Pradhan",
    "facultyStatus": "full-time",
    "sectionId": "UGSEM3B",
    "sectionLabel": "B",
    "venue": null,
    "startDate": "2026-08-17",
    "endDate": "2026-09-09",
    "sessions": [
      {
        "day": "Mon",
        "timeSlots": [
          "14:15",
          "15:15",
          "16:15",
          "17:15"
        ],
        "venue": "Arjuna Seminar Room 001"
      },
      {
        "day": "Tue",
        "timeSlots": [
          "14:15",
          "15:15",
          "16:15",
          "17:15"
        ],
        "venue": "ARB 002"
      },
      {
        "day": "Wed",
        "timeSlots": [
          "14:15",
          "15:15",
          "16:15",
          "17:15"
        ],
        "venue": "Arjuna Seminar Room 001"
      }
    ]
  },
  {
    "semTerm": "Sem-3",
    "courseType": "semester",
    "semesterNumber": "3",
    "code": "DESG213",
    "title": "Sketching and Prototyping",
    "credits": 3,
    "faculty": "Prof. Dishant Pradhan",
    "facultyStatus": "full-time",
    "sectionId": "UGSEM3A",
    "sectionLabel": "A",
    "venue": null,
    "startDate": "2026-09-14",
    "endDate": "2026-10-07",
    "sessions": [
      {
        "day": "Mon",
        "timeSlots": [
          "14:15",
          "15:15",
          "16:15",
          "17:15"
        ],
        "venue": "Arjuna Seminar Room 001"
      },
      {
        "day": "Tue",
        "timeSlots": [
          "14:15",
          "15:15",
          "16:15",
          "17:15"
        ],
        "venue": "ARB 002"
      },
      {
        "day": "Wed",
        "timeSlots": [
          "14:15",
          "15:15",
          "16:15",
          "17:15"
        ],
        "venue": "Arjuna Seminar Room 001"
      }
    ]
  },
  {
    "semTerm": "Sem-3",
    "courseType": "semester",
    "semesterNumber": "3",
    "code": "DESG215",
    "title": "Digital Design Fundamentals",
    "credits": 3,
    "faculty": "Prof. Ketan Kulkarni",
    "facultyStatus": "visiting",
    "sectionId": "UGSEM3B",
    "sectionLabel": "B",
    "venue": "Visual Art Studio",
    "startDate": "2026-09-14",
    "endDate": "2026-10-07",
    "sessions": [
      {
        "day": "Mon",
        "timeSlots": [
          "14:15",
          "15:15",
          "16:15",
          "17:15"
        ],
        "venue": "Visual Art Studio"
      },
      {
        "day": "Tue",
        "timeSlots": [
          "14:15",
          "15:15",
          "16:15",
          "17:15"
        ],
        "venue": "Visual Art Studio"
      },
      {
        "day": "Wed",
        "timeSlots": [
          "14:15",
          "15:15",
          "16:15",
          "17:15"
        ],
        "venue": "Visual Art Studio"
      }
    ]
  },
  {
    "semTerm": "Sem-3",
    "courseType": "semester",
    "semesterNumber": "3",
    "code": "DESG218",
    "title": "Design Studio - Product Design",
    "credits": 3,
    "faculty": "Prof. Amit Inamdar",
    "facultyStatus": "adjunct",
    "sectionId": "UGSEM3A",
    "sectionLabel": "A",
    "venue": "Visual Art Studio",
    "startDate": "2026-10-12",
    "endDate": "2026-12-09",
    "sessions": [
      {
        "day": "Mon",
        "timeSlots": [
          "14:15",
          "15:15",
          "16:15"
        ],
        "venue": "Visual Art Studio"
      },
      {
        "day": "Wed",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "Visual Art Studio"
      }
    ]
  },
  {
    "semTerm": "Sem-3",
    "courseType": "semester",
    "semesterNumber": "3",
    "code": "DESG218",
    "title": "Design Studio - Product Design",
    "credits": 3,
    "faculty": "Prof. Amit Inamdar",
    "facultyStatus": "adjunct",
    "sectionId": "UGSEM3B",
    "sectionLabel": "B",
    "venue": "APJ Design Lab",
    "startDate": "2026-10-12",
    "endDate": "2026-12-09",
    "sessions": [
      {
        "day": "Tue",
        "timeSlots": [
          "14:15",
          "15:15",
          "16:15"
        ],
        "venue": "APJ Design Lab"
      },
      {
        "day": "Wed",
        "timeSlots": [
          "16:15",
          "17:15"
        ],
        "venue": "APJ Design Lab"
      }
    ]
  },
  {
    "semTerm": "Sem-3",
    "courseType": "semester",
    "semesterNumber": "3",
    "code": "DESG219",
    "title": "Applied Programming for Creators",
    "credits": 3,
    "faculty": "Prof. Amit Jena",
    "facultyStatus": "full-time",
    "sectionId": "UGSEM3",
    "sectionLabel": null,
    "venue": "APJ 104",
    "startDate": "2026-08-17",
    "endDate": "2026-12-12",
    "sessions": [
      {
        "day": "Fri",
        "timeSlots": [
          "15:15",
          "16:15",
          "17:15"
        ],
        "venue": "APJ 104"
      }
    ]
  },
  {
    "semTerm": "Sem-3",
    "courseType": "semester",
    "semesterNumber": "3",
    "code": "DESG301",
    "title": "Design Thinking and Design Process",
    "credits": 3,
    "faculty": "Prof. Amit Kundal",
    "facultyStatus": "full-time",
    "sectionId": "UGSEM3A",
    "sectionLabel": "A",
    "venue": "APJ 103",
    "startDate": "2026-08-17",
    "endDate": "2026-12-12",
    "sessions": [
      {
        "day": "Thu",
        "timeSlots": [
          "14:15",
          "15:15",
          "16:15",
          "17:15"
        ],
        "venue": "APJ 103"
      }
    ]
  },
  {
    "semTerm": "Sem-3",
    "courseType": "semester",
    "semesterNumber": "3",
    "code": "DESG203",
    "title": "Basics of Graphic Design",
    "credits": 3,
    "faculty": "Prof. Soumitra Kemkar",
    "facultyStatus": "full-time",
    "sectionId": "UGSEM3A",
    "sectionLabel": "A",
    "venue": "ARB 001",
    "startDate": "2026-08-17",
    "endDate": "2026-12-12",
    "sessions": [
      {
        "day": "Mon",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "ARB 001"
      },
      {
        "day": "Fri",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "ARB 001"
      }
    ]
  },
  {
    "semTerm": "Sem-3",
    "courseType": "semester",
    "semesterNumber": "3",
    "code": "DESG301",
    "title": "Design Thinking and Design Process",
    "credits": 3,
    "faculty": "Prof. Shamit Shrivastav",
    "facultyStatus": "full-time",
    "sectionId": "UGSEM3B",
    "sectionLabel": "B",
    "venue": "Arjuna Seminar Room 001",
    "startDate": "2026-08-17",
    "endDate": "2026-12-12",
    "sessions": [
      {
        "day": "Tue",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "Arjuna Seminar Room 001"
      },
      {
        "day": "Thu",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "Arjuna Seminar Room 001"
      }
    ]
  },
  {
    "semTerm": "Sem-3",
    "courseType": "semester",
    "semesterNumber": "3",
    "code": "DESG203",
    "title": "Basics of Graphic Design",
    "credits": 3,
    "faculty": "Prof. Soumitra Kemkar",
    "facultyStatus": "full-time",
    "sectionId": "UGSEM3B",
    "sectionLabel": "B",
    "venue": "APJ Design Lab",
    "startDate": "2026-08-17",
    "endDate": "2026-12-12",
    "sessions": [
      {
        "day": "Tue",
        "timeSlots": [
          "08:00",
          "09:00"
        ],
        "venue": "APJ Design Lab"
      },
      {
        "day": "Thu",
        "timeSlots": [
          "08:00",
          "09:00"
        ],
        "venue": "APJ Design Lab"
      }
    ]
  },
  {
    "semTerm": "Sem-3",
    "courseType": "semester",
    "semesterNumber": "3",
    "code": "DESG313",
    "title": "Design Thinking and Innovation",
    "credits": 3,
    "faculty": "Prof. Shagun Malavia",
    "facultyStatus": "visiting",
    "sectionId": "UGSEM3",
    "sectionLabel": null,
    "venue": "APJ Focus Room 202",
    "startDate": "2026-08-17",
    "endDate": "2026-12-12",
    "sessions": [
      {
        "day": "Mon",
        "timeSlots": [
          "08:00",
          "09:00"
        ],
        "venue": "APJ Focus Room 202"
      },
      {
        "day": "Fri",
        "timeSlots": [
          "08:00",
          "09:00"
        ],
        "venue": "APJ Focus Room 202"
      }
    ]
  },
  {
    "semTerm": "Sem-3",
    "courseType": "semester",
    "semesterNumber": "3",
    "code": "THEA203",
    "title": "Basics of Acting",
    "credits": 3,
    "faculty": "Prof. Ashwini Giri",
    "facultyStatus": "full-time",
    "sectionId": "UGSEM3",
    "sectionLabel": null,
    "venue": "Arjuna Conditioning Studio",
    "startDate": "2026-08-17",
    "endDate": "2026-12-12",
    "sessions": [
      {
        "day": "Tue",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "Arjuna Conditioning Studio"
      },
      {
        "day": "Fri",
        "timeSlots": [
          "13:00",
          "14:15",
          "15:15"
        ],
        "venue": "Arjuna Conditioning Studio"
      }
    ]
  },
  {
    "semTerm": "Sem-3",
    "courseType": "semester",
    "semesterNumber": "3",
    "code": "MUSC206",
    "title": "Vocal I",
    "credits": 3,
    "faculty": "Prof. Sameer Dublay",
    "facultyStatus": "full-time",
    "sectionId": "UGSEM3",
    "sectionLabel": null,
    "venue": "Preview Theater (Kabir)",
    "startDate": "2026-08-17",
    "endDate": "2026-12-12",
    "sessions": [
      {
        "day": "Mon",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "Preview Theater (Kabir)"
      },
      {
        "day": "Wed",
        "timeSlots": [
          "13:00",
          "14:15",
          "15:15"
        ],
        "venue": "Preview Theater (Kabir)"
      }
    ]
  },
  {
    "semTerm": "Sem-5",
    "courseType": "semester",
    "semesterNumber": "5",
    "code": "DESG310",
    "title": "Game Design",
    "credits": 3,
    "faculty": "Prof. Vinod Vidwans",
    "facultyStatus": "full-time",
    "sectionId": "UGSEM5A",
    "sectionLabel": "A",
    "venue": "Visual Art Studio",
    "startDate": "2026-10-01",
    "endDate": "2026-12-12",
    "sessions": [
      {
        "day": "Thu",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "Visual Art Studio"
      },
      {
        "day": "Fri",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "Visual Art Studio"
      }
    ]
  },
  {
    "semTerm": "Sem-5",
    "courseType": "semester",
    "semesterNumber": "5",
    "code": "DESG319",
    "title": "Introduction to Artificial Intelligence & Machine Learning",
    "credits": 3,
    "faculty": "Prof. Madhan Raj",
    "facultyStatus": "visiting",
    "sectionId": "UGSEM5",
    "sectionLabel": null,
    "venue": "APJ Design Lab",
    "startDate": "2026-09-07",
    "endDate": "2026-09-25",
    "sessions": [
      {
        "day": "Mon",
        "timeSlots": [
          "16:15",
          "17:15"
        ],
        "venue": "APJ Design Lab"
      },
      {
        "day": "Tue",
        "timeSlots": [
          "14:15",
          "15:15",
          "16:15",
          "17:15"
        ],
        "venue": "APJ Design Lab"
      },
      {
        "day": "Wed",
        "timeSlots": [
          "16:15",
          "17:15"
        ],
        "venue": "APJ Design Lab"
      },
      {
        "day": "Thu",
        "timeSlots": [
          "14:15",
          "15:15",
          "16:15",
          "17:15"
        ],
        "venue": "APJ Design Lab"
      },
      {
        "day": "Fri",
        "timeSlots": [
          "14:15",
          "15:15",
          "16:15",
          "17:15"
        ],
        "venue": "APJ Design Lab"
      }
    ]
  },
  {
    "semTerm": "Sem-5",
    "courseType": "semester",
    "semesterNumber": "5",
    "code": "DESG320",
    "title": "Service Design",
    "credits": 3,
    "faculty": "Prof. Shamit Shrivastav",
    "facultyStatus": "full-time",
    "sectionId": "UGSEM5A",
    "sectionLabel": "A",
    "venue": "APJ Design Lab",
    "startDate": "2026-08-17",
    "endDate": "2026-12-12",
    "sessions": [
      {
        "day": "Mon",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "APJ Design Lab"
      },
      {
        "day": "Wed",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "APJ Design Lab"
      }
    ]
  },
  {
    "semTerm": "Sem-5",
    "courseType": "semester",
    "semesterNumber": "5",
    "code": "DESG322",
    "title": "Tangible Interfaces",
    "credits": 3,
    "faculty": "Prof. Pranshu Chaudhary",
    "facultyStatus": "visiting",
    "sectionId": "UGSEM5",
    "sectionLabel": null,
    "venue": "APJ Design Lab",
    "startDate": "2026-08-17",
    "endDate": "2026-09-04",
    "sessions": [
      {
        "day": "Mon",
        "timeSlots": [
          "16:15",
          "17:15"
        ],
        "venue": "APJ Design Lab"
      },
      {
        "day": "Tue",
        "timeSlots": [
          "14:15",
          "15:15",
          "16:15",
          "17:15"
        ],
        "venue": "APJ Design Lab"
      },
      {
        "day": "Wed",
        "timeSlots": [
          "16:15",
          "17:15"
        ],
        "venue": "APJ Design Lab"
      },
      {
        "day": "Thu",
        "timeSlots": [
          "14:15",
          "15:15",
          "16:15",
          "17:15"
        ],
        "venue": "APJ Design Lab"
      },
      {
        "day": "Fri",
        "timeSlots": [
          "14:15",
          "15:15",
          "16:15",
          "17:15"
        ],
        "venue": "APJ Design Lab"
      }
    ]
  },
  {
    "semTerm": "Sem-5",
    "courseType": "semester",
    "semesterNumber": "5",
    "code": "DESG317",
    "title": "Information and Data Visualization",
    "credits": 3,
    "faculty": "Prof. Amit Jena",
    "facultyStatus": "full-time",
    "sectionId": "UGSEM5A",
    "sectionLabel": "A",
    "venue": "APJ Focus Room 202",
    "startDate": "2026-09-29",
    "endDate": "2026-12-12",
    "sessions": [
      {
        "day": "Tue",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "APJ Focus Room 202"
      },
      {
        "day": "Wed",
        "timeSlots": [
          "16:15",
          "17:15"
        ],
        "venue": "APJ Focus Room 202"
      }
    ]
  },
  {
    "semTerm": "Sem-5",
    "courseType": "semester",
    "semesterNumber": "5",
    "code": "DESG320",
    "title": "Service Design",
    "credits": 3,
    "faculty": "Prof. Avani Chaturvedi",
    "facultyStatus": "full-time",
    "sectionId": "UGSEM5B",
    "sectionLabel": "B",
    "venue": "Raman 001",
    "startDate": "2026-08-17",
    "endDate": "2026-12-12",
    "sessions": [
      {
        "day": "Mon",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "Raman 001"
      },
      {
        "day": "Wed",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "Raman 001"
      }
    ]
  },
  {
    "semTerm": "Sem-5",
    "courseType": "semester",
    "semesterNumber": "5",
    "code": "DESG320",
    "title": "Service Design",
    "credits": 3,
    "faculty": "Prof. Avani Chaturvedi",
    "facultyStatus": "full-time",
    "sectionId": "UGSEM5C",
    "sectionLabel": "C",
    "venue": "Raman 001",
    "startDate": "2026-08-17",
    "endDate": "2026-12-12",
    "sessions": [
      {
        "day": "Tue",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "Raman 001"
      },
      {
        "day": "Thu",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "Raman 001"
      }
    ]
  },
  {
    "semTerm": "Sem-5",
    "courseType": "semester",
    "semesterNumber": "5",
    "code": "DESG362",
    "title": "Special Topics in Design (Visual Storytelling)",
    "credits": 3,
    "faculty": "Prof. Sherline Pimenta",
    "facultyStatus": "full-time",
    "sectionId": "UGSEM5",
    "sectionLabel": null,
    "venue": "Learning Commons A & B",
    "startDate": "2026-08-17",
    "endDate": "2026-12-12",
    "sessions": [
      {
        "day": "Fri",
        "timeSlots": [
          "13:00",
          "14:15",
          "15:15"
        ],
        "venue": "Learning Commons A & B"
      }
    ]
  },
  {
    "semTerm": "Sem-5",
    "courseType": "semester",
    "semesterNumber": "5",
    "code": "DESG310",
    "title": "Game design",
    "credits": 3,
    "faculty": "Prof. Vinod Vidwans",
    "facultyStatus": "full-time",
    "sectionId": "UGSEM5B",
    "sectionLabel": "B",
    "venue": null,
    "startDate": "2026-08-17",
    "endDate": "2026-12-12",
    "sessions": [
      {
        "day": "Mon",
        "timeSlots": [
          "10:00",
          "11:00"
        ],
        "venue": "Raman 001"
      },
      {
        "day": "Wed",
        "timeSlots": [
          "11:00",
          "12:00"
        ],
        "venue": "RNJ 002"
      }
    ]
  },
  {
    "semTerm": "Sem-5",
    "courseType": "semester",
    "semesterNumber": "5",
    "code": "DESG317",
    "title": "Information and Data Visualization",
    "credits": 3,
    "faculty": "Prof. Amit Jena",
    "facultyStatus": "full-time",
    "sectionId": "UGSEM5B",
    "sectionLabel": "B",
    "venue": "APJ Focus Room 201",
    "startDate": "2026-08-17",
    "endDate": "2026-12-12",
    "sessions": [
      {
        "day": "Tue",
        "timeSlots": [
          "08:00",
          "09:00"
        ],
        "venue": "APJ Focus Room 201"
      },
      {
        "day": "Thu",
        "timeSlots": [
          "08:00",
          "09:00"
        ],
        "venue": "APJ Focus Room 201"
      }
    ]
  },
  {
    "semTerm": "Sem-5",
    "courseType": "semester",
    "semesterNumber": "5",
    "code": "DANC304",
    "title": "Choreography",
    "credits": 3,
    "faculty": "Prof. Priya Joshi",
    "facultyStatus": "full-time",
    "sectionId": "UGSEM5",
    "sectionLabel": null,
    "venue": "Shantiniketan Dance Studio",
    "startDate": "2026-08-17",
    "endDate": "2026-12-12",
    "sessions": [
      {
        "day": "Tue",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "Shantiniketan Dance Studio"
      },
      {
        "day": "Thu",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "Shantiniketan Dance Studio"
      }
    ]
  },
  {
    "semTerm": "Sem-5",
    "courseType": "semester",
    "semesterNumber": "5",
    "code": "DANC306",
    "title": "Dance Drama",
    "credits": 3,
    "faculty": "Prof. Ashwini Giri",
    "facultyStatus": "full-time",
    "sectionId": "UGSEM5",
    "sectionLabel": null,
    "venue": "Kalidas",
    "startDate": "2026-09-21",
    "endDate": "2026-12-12",
    "sessions": [
      {
        "day": "Mon",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "Kalidas"
      },
      {
        "day": "Wed",
        "timeSlots": [
          "13:00",
          "14:15",
          "15:15"
        ],
        "venue": "Kalidas"
      }
    ]
  },
  {
    "semTerm": "Sem-5",
    "courseType": "semester",
    "semesterNumber": "5",
    "code": "MUSC204",
    "title": "Western Art Music",
    "credits": 3,
    "faculty": "Prof. Kuldeep Barve",
    "facultyStatus": "visiting",
    "sectionId": "UGSEM5",
    "sectionLabel": null,
    "venue": null,
    "startDate": "2026-08-17",
    "endDate": "2026-12-12",
    "sessions": [
      {
        "day": "Mon",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "Chandragupta Focus Room 301"
      },
      {
        "day": "Wed",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "Kasturba Conference Room 008"
      }
    ]
  },
  {
    "semTerm": "Sem-5",
    "courseType": "semester",
    "semesterNumber": "5",
    "code": "MUSC303",
    "title": "Aesthetics of Music",
    "credits": 3,
    "faculty": "Prof. Sameer Dublay",
    "facultyStatus": "full-time",
    "sectionId": "UGSEM5",
    "sectionLabel": null,
    "venue": "Preview Theater (Kabir)",
    "startDate": "2026-08-17",
    "endDate": "2026-12-12",
    "sessions": [
      {
        "day": "Tue",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "Preview Theater (Kabir)"
      },
      {
        "day": "Fri",
        "timeSlots": [
          "13:00",
          "14:15",
          "15:15"
        ],
        "venue": "Preview Theater (Kabir)"
      }
    ]
  },
  {
    "semTerm": "Sem-5",
    "courseType": "semester",
    "semesterNumber": "5",
    "code": "THEA305",
    "title": "Devising A Performance",
    "credits": 3,
    "faculty": "Prof. Keatan Jadhav",
    "facultyStatus": "visiting",
    "sectionId": "UGSEM5",
    "sectionLabel": null,
    "venue": "Kalidas",
    "startDate": "2026-08-21",
    "endDate": "2026-09-18",
    "sessions": [
      {
        "day": "Mon",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "Kalidas"
      },
      {
        "day": "Tue",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "Kalidas"
      },
      {
        "day": "Wed",
        "timeSlots": [
          "13:00",
          "14:15",
          "15:15"
        ],
        "venue": "Kalidas"
      },
      {
        "day": "Thu",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "Kalidas"
      },
      {
        "day": "Fri",
        "timeSlots": [
          "13:00",
          "14:15",
          "15:15"
        ],
        "venue": "Kalidas"
      }
    ]
  },
  {
    "semTerm": "Sem-7",
    "courseType": "semester",
    "semesterNumber": "7",
    "code": "DESG405",
    "title": "UI Design Development",
    "credits": 3,
    "faculty": "Prof. Ravi Katre",
    "facultyStatus": "visiting",
    "sectionId": "UGSEM7",
    "sectionLabel": null,
    "venue": null,
    "startDate": "2026-08-17",
    "endDate": "2026-12-12",
    "sessions": [
      {
        "day": "Tue",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "Learning Commons A & B"
      },
      {
        "day": "Thu",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "ARB 002"
      }
    ]
  },
  {
    "semTerm": "Sem-7",
    "courseType": "semester",
    "semesterNumber": "7",
    "code": "DESG401",
    "title": "Behavior Design",
    "credits": 3,
    "faculty": "Prof. Mayank Loonker",
    "facultyStatus": "full-time",
    "sectionId": "UGSEM7A",
    "sectionLabel": "A",
    "venue": "Arjuna Seminar Room 001",
    "startDate": "2026-08-17",
    "endDate": "2026-12-12",
    "sessions": [
      {
        "day": "Tue",
        "timeSlots": [
          "16:15",
          "17:15"
        ],
        "venue": "Arjuna Seminar Room 001"
      },
      {
        "day": "Thu",
        "timeSlots": [
          "16:15",
          "17:15"
        ],
        "venue": "Arjuna Seminar Room 001"
      }
    ]
  },
  {
    "semTerm": "Sem-7",
    "courseType": "semester",
    "semesterNumber": "7",
    "code": "DESG481",
    "title": "Capstone Project 1",
    "credits": 2,
    "faculty": "Prof. Nikhil Welankar",
    "facultyStatus": "visiting",
    "sectionId": "UGSEM7",
    "sectionLabel": null,
    "venue": "ARB 103",
    "startDate": "2026-08-17",
    "endDate": "2026-12-12",
    "sessions": [
      {
        "day": "Fri",
        "timeSlots": [
          "14:15",
          "15:15",
          "16:15"
        ],
        "venue": "ARB 103"
      }
    ]
  },
  {
    "semTerm": "Sem-7",
    "courseType": "semester",
    "semesterNumber": "7",
    "code": "OPSM308",
    "title": "Systems Thinking",
    "credits": 3,
    "faculty": "Prof. Amit Kundal",
    "facultyStatus": "full-time",
    "sectionId": "UGSEM7",
    "sectionLabel": null,
    "venue": "APJ 103",
    "startDate": "2026-08-17",
    "endDate": "2026-12-12",
    "sessions": [
      {
        "day": "Mon",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "APJ 103"
      },
      {
        "day": "Wed",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "APJ 103"
      }
    ]
  },
  {
    "semTerm": "Sem-7",
    "courseType": "semester",
    "semesterNumber": "7",
    "code": "DESG381",
    "title": "Capstone Project 1",
    "credits": 3,
    "faculty": "Prof. Sarang Ganoo",
    "facultyStatus": "visiting",
    "sectionId": "UGSEM7A",
    "sectionLabel": "A",
    "venue": null,
    "startDate": "2026-08-17",
    "endDate": "2026-09-18",
    "sessions": [
      {
        "day": "Mon",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "ARB 202"
      },
      {
        "day": "Tue",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "Shantiniketan Seminar Room"
      },
      {
        "day": "Wed",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "Shantiniketan Seminar Room"
      },
      {
        "day": "Thu",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "Shantiniketan Seminar Room"
      },
      {
        "day": "Fri",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "ARB 202"
      }
    ]
  },
  {
    "semTerm": "Sem-7",
    "courseType": "semester",
    "semesterNumber": "7",
    "code": "DESG401",
    "title": "Behavior Design",
    "credits": 3,
    "faculty": "Prof. Mayank Loonker",
    "facultyStatus": "full-time",
    "sectionId": "UGSEM7B",
    "sectionLabel": "B",
    "venue": null,
    "startDate": "2026-10-26",
    "endDate": "2026-12-12",
    "sessions": [
      {
        "day": "Mon",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "Amrita Shergil Conference Room 008"
      },
      {
        "day": "Tue",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "ARB 104"
      },
      {
        "day": "Wed",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "Amrita Shergil Conference Room 008"
      },
      {
        "day": "Thu",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "TBD"
      },
      {
        "day": "Fri",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "Amrita Shergil Conference Room 008"
      }
    ]
  },
  {
    "semTerm": "Sem-7",
    "courseType": "semester",
    "semesterNumber": "7",
    "code": "DESG381",
    "title": "Capstone Project 1",
    "credits": 3,
    "faculty": "Prof. Smita Kelkar",
    "facultyStatus": "visiting",
    "sectionId": "UGSEM7B",
    "sectionLabel": "B",
    "venue": "APJ Design Lab",
    "startDate": "2026-08-17",
    "endDate": "2026-12-12",
    "sessions": [
      {
        "day": "Mon",
        "timeSlots": [
          "08:00",
          "09:00"
        ],
        "venue": "APJ Design Lab"
      },
      {
        "day": "Wed",
        "timeSlots": [
          "08:00",
          "09:00"
        ],
        "venue": "APJ Design Lab"
      }
    ]
  },
  {
    "semTerm": "Sem-7",
    "courseType": "semester",
    "semesterNumber": "7",
    "code": "DANC305",
    "title": "Performance-Ensemble Dance Production",
    "credits": 3,
    "faculty": "Prof. Priya Joshi",
    "facultyStatus": "full-time",
    "sectionId": "UGSEM7",
    "sectionLabel": null,
    "venue": "Shantiniketan Dance Studio",
    "startDate": "2026-08-17",
    "endDate": "2026-12-12",
    "sessions": [
      {
        "day": "Mon",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "Shantiniketan Dance Studio"
      },
      {
        "day": "Wed",
        "timeSlots": [
          "13:00",
          "14:15",
          "15:15"
        ],
        "venue": "Shantiniketan Dance Studio"
      }
    ]
  },
  {
    "semTerm": "Sem-7",
    "courseType": "semester",
    "semesterNumber": "7",
    "code": "THEA310",
    "title": "Globalization and contemporary theater in India (Theory)",
    "credits": 3,
    "faculty": "Prof. Ashutosh Potdar",
    "facultyStatus": "full-time",
    "sectionId": "UGSEM7",
    "sectionLabel": null,
    "venue": "Focus Room 201 Chandragupta West",
    "startDate": "2026-08-17",
    "endDate": "2026-12-12",
    "sessions": [
      {
        "day": "Wed",
        "timeSlots": [
          "14:15"
        ],
        "venue": "Focus Room 201 Chandragupta West"
      },
      {
        "day": "Fri",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "Focus Room 201 Chandragupta West"
      }
    ]
  },
  {
    "semTerm": "Term 1",
    "courseType": "term",
    "semesterNumber": null,
    "code": "DESG102",
    "title": "Materials and Processes",
    "credits": 2,
    "faculty": "Prof. Avani Chaturvedi",
    "facultyStatus": "full-time",
    "sectionId": "UGTERM1",
    "sectionLabel": null,
    "venue": "APJ Design Lab",
    "startDate": "2026-08-17",
    "endDate": "2026-10-10",
    "sessions": [
      {
        "day": "Mon",
        "timeSlots": [
          "10:00",
          "11:00"
        ],
        "venue": "APJ Design Lab"
      },
      {
        "day": "Wed",
        "timeSlots": [
          "10:00",
          "11:00"
        ],
        "venue": "APJ Design Lab"
      }
    ]
  },
  {
    "semTerm": "Term 1",
    "courseType": "term",
    "semesterNumber": null,
    "code": "MUSC107",
    "title": "Introduction to Western Music",
    "credits": 2,
    "faculty": "Prof. Kuldeep Barve",
    "facultyStatus": "visiting",
    "sectionId": "UGTERM1",
    "sectionLabel": null,
    "venue": null,
    "startDate": "2026-08-17",
    "endDate": "2026-10-10",
    "sessions": [
      {
        "day": "Mon",
        "timeSlots": [
          "12:00",
          "13:00"
        ],
        "venue": "ARB 002"
      },
      {
        "day": "Thu",
        "timeSlots": [
          "12:00",
          "13:00"
        ],
        "venue": "APJ 103"
      }
    ]
  },
  {
    "semTerm": "Term 1",
    "courseType": "term",
    "semesterNumber": null,
    "code": "DESG107",
    "title": "Design Studio (Learning by Doing)",
    "credits": 2,
    "faculty": "Prof. Pathik Desai",
    "facultyStatus": "full-time",
    "sectionId": "UGTERM1",
    "sectionLabel": null,
    "venue": "APJ Design Lab",
    "startDate": "2026-08-17",
    "endDate": "2026-10-10",
    "sessions": [
      {
        "day": "Tue",
        "timeSlots": [
          "12:00",
          "13:00"
        ],
        "venue": "APJ Design Lab"
      },
      {
        "day": "Fri",
        "timeSlots": [
          "12:00",
          "13:00"
        ],
        "venue": "APJ Design Lab"
      }
    ]
  },
  {
    "semTerm": "Term 1",
    "courseType": "term",
    "semesterNumber": null,
    "code": "DANC101",
    "title": "Introduction to Dance (Elementary)",
    "credits": 2,
    "faculty": "Prof. Rujuta Soman / Prof. Vrushali Lele",
    "facultyList": [
      "Prof. Rujuta Soman",
      "Prof. Vrushali Lele"
    ],
    "facultyStatus": "visiting",
    "sectionId": "UGTERM1",
    "sectionLabel": null,
    "venue": "Shantiniketan Dance Studio",
    "startDate": "2026-08-17",
    "endDate": "2026-10-10",
    "sessions": [
      {
        "day": "Mon",
        "timeSlots": [
          "12:00",
          "13:00"
        ],
        "venue": "Shantiniketan Dance Studio"
      },
      {
        "day": "Thu",
        "timeSlots": [
          "12:00",
          "13:00"
        ],
        "venue": "Shantiniketan Dance Studio"
      }
    ]
  },
  {
    "semTerm": "Term 1",
    "courseType": "term",
    "semesterNumber": null,
    "code": "THEA101",
    "title": "Introduction to Drama and Theatre",
    "credits": 2,
    "faculty": "Prof. Ashutosh Potdar",
    "facultyStatus": "full-time",
    "sectionId": "UGTERM1",
    "sectionLabel": null,
    "venue": null,
    "startDate": "2026-08-17",
    "endDate": "2026-10-10",
    "sessions": [
      {
        "day": "Tue",
        "timeSlots": [
          "12:00",
          "13:00"
        ],
        "venue": "BHC 001"
      },
      {
        "day": "Fri",
        "timeSlots": [
          "12:00",
          "13:00"
        ],
        "venue": "ARB 002"
      }
    ]
  },
  {
    "semTerm": "Term 1",
    "courseType": "term",
    "semesterNumber": null,
    "code": "THEA102",
    "title": "Basics of Theatre Arts",
    "credits": 2,
    "faculty": "Prof. Aanand Chabukswar",
    "facultyStatus": "visiting",
    "sectionId": "UGTERM1A",
    "sectionLabel": "A",
    "venue": "Kalidas",
    "startDate": "2026-08-17",
    "endDate": "2026-10-10",
    "sessions": [
      {
        "day": "Mon",
        "timeSlots": [
          "10:00",
          "11:00"
        ],
        "venue": "Kalidas"
      },
      {
        "day": "Wed",
        "timeSlots": [
          "10:00",
          "11:00"
        ],
        "venue": "Kalidas"
      }
    ]
  },
  {
    "semTerm": "Term 1",
    "courseType": "term",
    "semesterNumber": null,
    "code": "SCLP101",
    "title": "Introduction to Sculpture",
    "credits": 2,
    "faculty": "Prof. Oshin Patil",
    "facultyStatus": "visiting",
    "sectionId": "UGTERM1A",
    "sectionLabel": "A",
    "venue": "Sculpture Studio",
    "startDate": "2026-08-17",
    "endDate": "2026-10-10",
    "sessions": [
      {
        "day": "Tue",
        "timeSlots": [
          "12:00",
          "13:00"
        ],
        "venue": "Sculpture Studio"
      },
      {
        "day": "Fri",
        "timeSlots": [
          "12:00",
          "13:00"
        ],
        "venue": "Sculpture Studio"
      }
    ]
  },
  {
    "semTerm": "Term 1",
    "courseType": "term",
    "semesterNumber": null,
    "code": "SCLP101",
    "title": "Introduction to Sculpture",
    "credits": 2,
    "faculty": "Prof. Oshin Patil",
    "facultyStatus": "visiting",
    "sectionId": "UGTERM1B",
    "sectionLabel": "B",
    "venue": "Sculpture Studio",
    "startDate": "2026-08-17",
    "endDate": "2026-10-10",
    "sessions": [
      {
        "day": "Mon",
        "timeSlots": [
          "12:00",
          "13:00"
        ],
        "venue": "Sculpture Studio"
      },
      {
        "day": "Thu",
        "timeSlots": [
          "12:00",
          "13:00"
        ],
        "venue": "Sculpture Studio"
      }
    ]
  },
  {
    "semTerm": "Term 1",
    "courseType": "term",
    "semesterNumber": null,
    "code": "THEA102",
    "title": "Basics of Theatre Arts",
    "credits": 2,
    "faculty": "Prof. Shachi Vaiddya",
    "facultyStatus": "visiting",
    "sectionId": "UGTERM1B",
    "sectionLabel": "B",
    "venue": "Kalidas",
    "startDate": "2026-08-17",
    "endDate": "2026-10-10",
    "sessions": [
      {
        "day": "Mon",
        "timeSlots": [
          "12:00",
          "13:00"
        ],
        "venue": "Kalidas"
      },
      {
        "day": "Thu",
        "timeSlots": [
          "12:00",
          "13:00"
        ],
        "venue": "Kalidas"
      }
    ]
  },
  {
    "semTerm": "Term 1",
    "courseType": "term",
    "semesterNumber": null,
    "code": "DESG101",
    "title": "Elements and Principles of Design",
    "credits": 2,
    "faculty": "Prof. Sherline Pimenta",
    "facultyStatus": "full-time",
    "sectionId": "UGTERM1B",
    "sectionLabel": "B",
    "venue": "APJ Design Lab",
    "startDate": "2026-08-17",
    "endDate": "2026-10-10",
    "sessions": [
      {
        "day": "Tue",
        "timeSlots": [
          "10:00",
          "11:00"
        ],
        "venue": "APJ Design Lab"
      },
      {
        "day": "Thu",
        "timeSlots": [
          "10:00",
          "11:00"
        ],
        "venue": "APJ Design Lab"
      }
    ]
  },
  {
    "semTerm": "PGPE Term 1",
    "courseType": "term",
    "semesterNumber": null,
    "code": "PGPE426",
    "title": "Design Thinking",
    "credits": 2,
    "faculty": "Prof. Shagun Malavia",
    "facultyStatus": "visiting",
    "sectionId": "PGPETERM1",
    "sectionLabel": null,
    "venue": "Chandragupa East - Conference Room 001",
    "startDate": "2026-08-17",
    "endDate": "2026-10-10",
    "sessions": [
      {
        "day": "Mon",
        "timeSlots": [
          "10:00",
          "11:00"
        ],
        "venue": "Chandragupa East - Conference Room 001"
      },
      {
        "day": "Wed",
        "timeSlots": [
          "14:15",
          "15:15"
        ],
        "venue": "Chandragupa East - Conference Room 001"
      }
    ],
    "program": "PGPE"
  },
  {
    "semTerm": "Term 1",
    "courseType": "term",
    "semesterNumber": null,
    "code": "DANC105",
    "title": "Introduction to Contemporary Dance",
    "credits": 2,
    "faculty": "Prof. Sayli Kulkarni",
    "facultyStatus": "visiting",
    "sectionId": "UGTERM1A",
    "sectionLabel": "A",
    "venue": "Kalidas",
    "startDate": "2026-08-17",
    "endDate": "2026-10-10",
    "sessions": [
      {
        "day": "Tue",
        "timeSlots": [
          "10:00",
          "11:00"
        ],
        "venue": "Kalidas"
      },
      {
        "day": "Thu",
        "timeSlots": [
          "10:00",
          "11:00"
        ],
        "venue": "Kalidas"
      }
    ]
  },
  {
    "semTerm": "Term 1",
    "courseType": "term",
    "semesterNumber": null,
    "code": "DESG108",
    "title": "Digital Visualization and Representation",
    "credits": 2,
    "faculty": "Prof. Soumitra Kemkar",
    "facultyStatus": "full-time",
    "sectionId": "UGTERM1",
    "sectionLabel": null,
    "venue": "Library Computer Lab",
    "startDate": "2026-08-17",
    "endDate": "2026-10-10",
    "sessions": [
      {
        "day": "Mon",
        "timeSlots": [
          "10:00",
          "11:00"
        ],
        "venue": "Library Computer Lab"
      },
      {
        "day": "Wed",
        "timeSlots": [
          "10:00",
          "11:00"
        ],
        "venue": "Library Computer Lab"
      }
    ]
  },
  {
    "semTerm": "Term 1",
    "courseType": "term",
    "semesterNumber": null,
    "code": "DESG109",
    "title": "Composing with Colors",
    "credits": 2,
    "faculty": "Prof. Suniti Vadalkar",
    "facultyStatus": "full-time",
    "sectionId": "UGTERM1",
    "sectionLabel": null,
    "venue": "Raman 001",
    "startDate": "2026-08-17",
    "endDate": "2026-10-10",
    "sessions": [
      {
        "day": "Tue",
        "timeSlots": [
          "12:00",
          "13:00"
        ],
        "venue": "Raman 001"
      },
      {
        "day": "Fri",
        "timeSlots": [
          "12:00",
          "13:00"
        ],
        "venue": "Raman 001"
      }
    ]
  },
  {
    "semTerm": "Term 1",
    "courseType": "term",
    "semesterNumber": null,
    "code": "MUSC101",
    "title": "Principles of Music",
    "credits": 2,
    "faculty": "Prof. Sameer Dublay",
    "facultyStatus": "full-time",
    "sectionId": "UGTERM1",
    "sectionLabel": null,
    "venue": "Preview Theater (Kabir)",
    "startDate": "2026-08-17",
    "endDate": "2026-10-10",
    "sessions": [
      {
        "day": "Tue",
        "timeSlots": [
          "10:00",
          "11:00"
        ],
        "venue": "Preview Theater (Kabir)"
      },
      {
        "day": "Thu",
        "timeSlots": [
          "10:00",
          "11:00"
        ],
        "venue": "Preview Theater (Kabir)"
      }
    ]
  },
  {
    "semTerm": "Term 1",
    "courseType": "term",
    "semesterNumber": null,
    "code": "DESG101",
    "title": "Elements and Principles of Design",
    "credits": 2,
    "faculty": "Prof. Suniti Vadalkar",
    "facultyStatus": "full-time",
    "sectionId": "UGTERM1A",
    "sectionLabel": "A",
    "venue": "APJ Design Lab",
    "startDate": "2026-08-17",
    "endDate": "2026-10-10",
    "sessions": [
      {
        "day": "Mon",
        "timeSlots": [
          "12:00",
          "13:00"
        ],
        "venue": "APJ Design Lab"
      },
      {
        "day": "Thu",
        "timeSlots": [
          "12:00",
          "13:00"
        ],
        "venue": "APJ Design Lab"
      }
    ]
  },
  {
    "semTerm": "Term 1",
    "courseType": "term",
    "semesterNumber": null,
    "code": "DRPT102",
    "title": "Introduction to Drawing",
    "credits": 2,
    "faculty": "Prof. Swayamsiddha Panigrahi",
    "facultyStatus": "full-time",
    "sectionId": "UGTERM1A",
    "sectionLabel": "A",
    "venue": "Raman 001",
    "startDate": "2026-08-17",
    "endDate": "2026-10-10",
    "sessions": [
      {
        "day": "Mon",
        "timeSlots": [
          "12:00",
          "13:00"
        ],
        "venue": "Raman 001"
      },
      {
        "day": "Thu",
        "timeSlots": [
          "12:00",
          "13:00"
        ],
        "venue": "Raman 001"
      }
    ]
  },
  {
    "semTerm": "Term 1",
    "courseType": "term",
    "semesterNumber": null,
    "code": "DRPT102",
    "title": "Introduction to Drawing",
    "credits": 2,
    "faculty": "Prof. Dishant Pradhan",
    "facultyStatus": "full-time",
    "sectionId": "UGTERM1B",
    "sectionLabel": "B",
    "venue": "Sculpture Studio",
    "startDate": "2026-08-17",
    "endDate": "2026-10-10",
    "sessions": [
      {
        "day": "Tue",
        "timeSlots": [
          "10:00",
          "11:00"
        ],
        "venue": "Sculpture Studio"
      },
      {
        "day": "Thu",
        "timeSlots": [
          "10:00",
          "11:00"
        ],
        "venue": "Sculpture Studio"
      }
    ]
  }
];

// Public holidays falling within the Aug 17 - Dec 12, 2026 window (Term 1 & Term 2).
const HOLIDAYS = [
  {
    "date": "2026-09-14",
    "name": "Ganesh Chaturthi"
  },
  {
    "date": "2026-10-02",
    "name": "Gandhi Jayanti"
  },
  {
    "date": "2026-10-20",
    "name": "Dussehra"
  },
  {
    "date": "2026-11-08",
    "name": "Diwali (Laxmi Pujan)"
  },
  {
    "date": "2026-11-09",
    "name": "Diwali (Padwa)"
  }
];

// Term date boundaries for reference / defaults.
const TERMS = [
  {
    "name": "Term 1",
    "startDate": "2026-08-17",
    "endDate": "2026-10-10"
  },
  {
    "name": "Term 2",
    "startDate": "2026-10-19",
    "endDate": "2026-12-12"
  }
];

